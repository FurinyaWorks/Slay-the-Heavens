import copy
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

TOOL = Path(__file__).resolve().parents[2] / "scripts/art/actor_alpha_measure.py"
spec = importlib.util.spec_from_file_location("actor_alpha_measure", TOOL)
measure = importlib.util.module_from_spec(spec)
spec.loader.exec_module(measure)


class ActorAlphaPixelsTest(unittest.TestCase):
    def setUp(self):
        self.approved = Image.new("L", (16, 16))
        self.approved.paste(255, (2, 2, 14, 14))
        self.approved.paste(0, (9, 9, 12, 12))

    def test_detects_transparency_inside_the_body(self):
        rendered = self.approved.copy()
        rendered.putpixel((5, 5), 0)
        rendered.putpixel((6, 6), 170)
        result = measure.assess(rendered, self.approved)
        self.assertEqual(result["status"], "fail")
        self.assertEqual(result["leakingPixels"], 2)
        self.assertEqual(result["fullyOpenPixels"], 1)
        self.assertEqual(result["unexpectedPaintPixels"], 0)

    def test_rejects_a_rectangular_patch_over_intentional_transparency(self):
        rendered = self.approved.copy()
        rendered.paste(255, (9, 9, 12, 12))
        result = measure.assess(rendered, self.approved)
        self.assertEqual(result["status"], "fail")
        self.assertEqual(result["leakingPixels"], 0)
        self.assertEqual(result["unexpectedPaintPixels"], 1)

    def test_recovers_alpha_from_independent_backgrounds(self):
        source = self.approved.copy()
        source.putpixel((5, 5), 127)
        green = (32, 248, 77)
        foreground = Image.new("RGB", source.size, (186, 80, 34))
        black, white, contrast = [
            Image.composite(foreground, Image.new("RGB", source.size, colour), source)
            for colour in ((0, 0, 0), (255, 255, 255), green)
        ]
        self.assertEqual(measure.infer_alpha(black, white, contrast, green).tobytes(), source.tobytes())
        contrast.putpixel((5, 5), (255, 255, 255))
        with self.assertRaisesRegex(ValueError, "Third background"):
            measure.infer_alpha(black, white, contrast, green)


class ActorAlphaApprovalTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.capture_path = self.root / "capture.json"
        self.masks_path = self.root / "mask-locators.json"
        self.roster = [
            {"id": "hero", "geometry": "hero-geometry", "width": 16, "shapes": 30,
             "productionSourceSha256": "d" * 64, "approvedOriginalSha256": "d" * 64},
            {"id": "enemy", "geometry": "enemy-geometry", "width": 16, "shapes": 16,
             "productionSourceSha256": "e" * 64},
        ]
        self.identity = {"sourceCommit": "fixture-sha", "profile": "fixture-profile", "scope": "fixture-runtime"}
        self.capture = {**self.identity, "pages": [{"actors": [
            {key: value for key, value in row.items() if key in {"id", "geometry", "width", "shapes"}}
            | {"center": [8 + 16 * index, 8]} for index, row in enumerate(self.roster)
        ]}]}
        self.approved = Image.new("L", (32, 16))
        self.approved.paste(255, (2, 2, 14, 14))
        self.approved.paste(255, (18, 2, 30, 14))
        self.approved.paste(0, (9, 9, 12, 12))
        self.locators, pins = [], []
        for index, row in enumerate(self.roster):
            left = 16 * index
            file = self.root / f"{row['id']}.png"
            self.approved.crop((left, 0, left + 16, 16)).save(file)
            self.locators.append({"id": row["id"], "path": file.name})
            pins.append({
                "id": row["id"], "geometry": row["geometry"],
                "productionSourceSha256": row["productionSourceSha256"], "originalSha256": ("d" if not index else "a") * 64,
                "maskSha256": measure.digest(file.read_bytes()), "approvalReference": "independent synthetic fixture",
                "captureCrop": [left, 0, 16, 16],
                "registration": {"sourceCrop": [0, 0, 16, 16], "maskPlacement": [0, 0, 16, 16], "filter": "nearest"},
            })
        self.inventory = {**self.identity, "actors": self.roster, "approvalsSha256": "f" * 64,
                          "approvals": {"schemaVersion": 1, "profile": self.identity["profile"], "actors": pins}}

    def run_measure(self, specimen, locators, name):
        colours = {"black": "#000000", "white": "#FFFFFF", "contrast": "#20F84D"}
        foreground = Image.new("RGB", specimen.size, (93, 104, 174))
        entries = {}
        for key, colour in colours.items():
            image = self.root / f"{key}.png"
            Image.composite(foreground, Image.new("RGB", specimen.size, colour), specimen).save(image)
            entries[key] = {"screenshot": image.name, "screenshotSha256": measure.digest(image.read_bytes()),
                            "assetWarnings": [], "frame": 0, "time": 0}
        self.capture.update(backdrops=colours, canvas={"width": 32, "height": 16})
        self.capture["pages"][0]["captures"] = entries
        self.capture_path.write_text(json.dumps(self.capture))
        self.masks_path.write_text(json.dumps({"schemaVersion": 1, "actors": locators}))
        output = self.root / name
        result = subprocess.run([sys.executable, str(TOOL), str(self.capture_path), str(self.masks_path), str(output)],
                                input=json.dumps(self.inventory), capture_output=True, text=True, check=False)
        return result, json.loads(output.read_text()) if output.exists() else None

    def test_exact_approved_masks_pass_and_detect_leaks_or_gaps(self):
        green, report = self.run_measure(self.approved, self.locators, "pass.json")
        self.assertEqual(green.returncode, 0, green.stderr)
        self.assertEqual([row["status"] for row in report["actors"].values()], ["pass", "pass"])
        leaked = self.approved.copy()
        leaked.putpixel((6, 6), 0)
        red, report = self.run_measure(leaked, self.locators, "leak.json")
        self.assertEqual(red.returncode, 1, red.stderr)
        self.assertEqual(report["actors"]["hero"]["fullyOpenPixels"], 1)
        red, report = self.run_measure(self.approved, self.locators[:1], "mask-missing.json")
        self.assertEqual(red.returncode, 1, red.stderr)
        self.assertEqual(report["actors"]["enemy"]["status"], "unverified")

    def test_caller_cannot_certify_self_masks_with_copied_hero_and_zero_monster_sha(self):
        self.inventory["approvals"]["actors"] = []
        forged = [
            {**row, "basis": "approved-original", "approvalReference": "SYNTHETIC TEST, NO APPROVAL",
             "sourceSha256": ("d" if row["id"] == "hero" else "0") * 64,
             "sha256": measure.digest((self.root / row["path"]).read_bytes())}
            for row in self.locators
        ]
        red, report = self.run_measure(self.approved, forged, "self-approved.json")
        self.assertNotEqual(red.returncode, 0)
        self.assertIn("Approval comes from the committed review", red.stderr)
        self.assertIsNone(report)
        red, report = self.run_measure(self.approved, self.locators, "no-approval.json")
        self.assertNotEqual(red.returncode, 0)
        self.assertIn("missing committed mask approval", red.stderr)
        self.assertIsNone(report)

    def test_rejects_substitute_mask_under_the_same_trusted_original(self):
        self.approved.crop((16, 0, 32, 16)).save(self.root / "hero.png")
        red, report = self.run_measure(self.approved, self.locators, "wrong-mask.json")
        self.assertNotEqual(red.returncode, 0)
        self.assertIn("Approved mask hash differs: hero", red.stderr)
        self.assertIsNone(report)

    def test_pin_rejects_wrong_monster_source_hero_original_and_registration(self):
        for index, values in (
            (1, {"productionSourceSha256": "0" * 64}),
            (0, {"originalSha256": "0" * 64}),
            (0, {"registration": {"sourceCrop": [0, 0, 16, 16], "maskPlacement": [1, 1, 16, 16], "filter": "nearest"}}),
        ):
            inventory = copy.deepcopy(self.inventory)
            inventory["approvals"]["actors"][index].update(values)
            with self.subTest(values=values), self.assertRaises(ValueError):
                measure.approval_pins(inventory)

    def test_pin_coordinates_are_used_even_when_capture_centre_moves(self):
        self.capture["pages"][0]["actors"][0]["center"] = [9, 8]
        red, report = self.run_measure(self.approved, self.locators, "misregistered.json")
        self.assertNotEqual(red.returncode, 0)
        self.assertIn("Mask crop differs from committed registration", red.stderr)
        self.assertIsNone(report)

    def test_rejects_experiment_stale_source_and_non_runtime(self):
        for fields in (
            {"scope": "static-paint"}, {"sourceCommit": "stale"}, {"profile": "fallback"}, {"experiment": {}},
        ):
            with self.subTest(fields=fields), self.assertRaises(ValueError):
                measure.check_production_inventory({**self.capture, **fields}, self.inventory)

    def test_release_rejects_capture_bound_to_another_gil_or_config(self):
        self.inventory["releaseEvidence"] = {"candidateSha256": "a" * 64, "artConfigSha256": "b" * 64}
        with self.assertRaisesRegex(ValueError, "different GIL or checkout configuration"):
            measure.check_production_inventory(self.capture, self.inventory)
        self.capture["releaseEvidence"] = {**self.inventory["releaseEvidence"], "artConfigSha256": "c" * 64}
        with self.assertRaisesRegex(ValueError, "different GIL or checkout configuration"):
            measure.check_production_inventory(self.capture, self.inventory)
        self.capture["releaseEvidence"] = self.inventory["releaseEvidence"]
        _, report = self.run_measure(self.approved, self.locators, "bound.json")
        self.assertEqual(report["releaseEvidence"], self.inventory["releaseEvidence"])

    def test_rejects_empty_partial_duplicate_and_stale_roster(self):
        actors = self.capture["pages"][0]["actors"]
        with self.assertRaises(ValueError):
            measure.check_production_inventory({**self.capture, "pages": []}, self.inventory)
        for specimen in (
            [], [actors[0]], [actors[0], actors[0]], [actors[0], {**actors[1], "id": "test-actor"}],
            [actors[0], {**actors[1], "geometry": "stale"}],
            [actors[0], {**actors[1], "width": 15}], [actors[0], {**actors[1], "shapes": 15}],
        ):
            with self.subTest(specimen=specimen), self.assertRaises(ValueError):
                measure.check_production_inventory({**self.capture, "pages": [{"actors": specimen}]}, self.inventory)


if __name__ == "__main__":
    unittest.main()
