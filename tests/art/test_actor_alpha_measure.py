import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

TOOL = Path(__file__).resolve().parents[2] / "scripts/art/actor_alpha_measure.py"
spec = importlib.util.spec_from_file_location("actor_alpha_measure", TOOL)
measure = importlib.util.module_from_spec(spec)
spec.loader.exec_module(measure)


class ActorAlphaMeasureTest(unittest.TestCase):
    def setUp(self):
        self.approved = np.zeros((16, 16), dtype=np.uint8)
        self.approved[2:14, 2:14] = 255
        self.approved[9:12, 9:12] = 0  # Intentional negative space between limbs.

    def test_regression_detects_transparency_inside_the_body(self):
        rendered = self.approved.copy()
        rendered[5, 5] = 0
        rendered[6, 6] = 170
        result = measure.assess(rendered, self.approved)
        self.assertEqual(result["status"], "fail")
        self.assertEqual(result["leakingPixels"], 2)
        self.assertEqual(result["fullyOpenPixels"], 1)
        self.assertEqual(result["unexpectedPaintPixels"], 0)

    def test_regression_rejects_a_rectangular_patch_over_intentional_transparency(self):
        rendered = self.approved.copy()
        rendered[9:12, 9:12] = 255
        result = measure.assess(rendered, self.approved)
        self.assertEqual(result["status"], "fail")
        self.assertEqual(result["leakingPixels"], 0)
        self.assertEqual(result["unexpectedPaintPixels"], 1)

    def test_approved_outline_and_negative_space_pass(self):
        self.assertEqual(measure.assess(self.approved, self.approved)["status"], "pass")

    def test_independent_background_pair_recovers_alpha(self):
        source = self.approved.copy()
        source[5, 5] = 127
        foreground = np.array([186, 80, 34])
        green = np.array([32, 248, 77])

        def render(background):
            alpha = source[:, :, None] / 255
            return np.rint(foreground * alpha + background * (1 - alpha)).astype(np.int16)

        black, white, contrast = [render(background) for background in [0, 255, green]]
        np.testing.assert_array_equal(measure.infer_alpha(black, white, contrast, green), source)
        contrast[5, 5] = 255
        with self.assertRaisesRegex(ValueError, "Third background"):
            measure.infer_alpha(black, white, contrast, green)

    def test_required_pass_rejects_an_empty_capture(self):
        with tempfile.TemporaryDirectory() as directory:
            capture = Path(directory) / "capture.json"
            capture.write_text(json.dumps({
                "sourceCommit": "fixture",
                "backdrops": {"black": "#000000", "white": "#FFFFFF", "contrast": "#20F84D"},
                "pages": [],
            }))
            result = subprocess.run([
                sys.executable, str(TOOL), str(capture), "--require-pass",
                "--output", str(Path(directory) / "result.json"),
            ], capture_output=True, text=True, check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Capture contains no actors", result.stderr)


class ActorAlphaProductionInventoryTest(unittest.TestCase):
    def setUp(self):
        self.inventory = {
            "sourceCommit": "fixture-sha", "profile": "fixture-profile", "scope": "fixture-runtime",
            "actors": [
                {"id": "hero", "geometry": "hero-geometry", "width": 16, "shapes": 30,
                 "approvedSourceSha256": "d" * 64},
                {"id": "enemy", "geometry": "enemy-geometry", "width": 16, "shapes": 16},
            ],
        }
        self.capture = {
            "sourceCommit": "fixture-sha", "profile": "fixture-profile", "scope": "fixture-runtime",
            "pages": [{"actors": [
                {"id": "hero", "geometry": "hero-geometry", "width": 16, "shapes": 30},
                {"id": "enemy", "geometry": "enemy-geometry", "width": 16, "shapes": 16},
            ]}],
        }

    def test_exact_inventory_passes(self):
        measure.check_production_inventory(self.capture, self.inventory)

    def test_static_surrogate_wrong_revision_and_experiment_are_rejected(self):
        for evidence in (
            {"scope": "static-paint"}, {"sourceCommit": "stale"}, {"profile": "fallback"}, {"experiment": {}},
        ):
            with self.subTest(evidence=evidence), self.assertRaises(ValueError):
                measure.check_production_inventory({**self.capture, **evidence}, self.inventory)

    def test_production_inventory_must_be_complete_unique_and_bound(self):
        actors = self.capture["pages"][0]["actors"]
        for specimen in (
            [], [actors[0]], [actors[0], actors[0]], [actors[0], {**actors[1], "id": "test-actor"}],
            [actors[0], {**actors[1], "geometry": "stale"}],
            [actors[0], {**actors[1], "width": 15}], [actors[0], {**actors[1], "shapes": 15}],
        ):
            with self.subTest(specimen=specimen), self.assertRaises(ValueError):
                measure.check_production_inventory({**self.capture, "pages": [{"actors": specimen}]}, self.inventory)

    def test_production_receipt_from_pixels_requires_original_and_rejects_leaks(self):
        alpha = np.zeros((16, 32), dtype=np.uint8)
        alpha[2:14, 2:14] = 255
        alpha[2:14, 18:30] = 255
        alpha[9:12, 9:12] = 0
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            backgrounds = {"black": "#000000", "white": "#FFFFFF", "contrast": "#20F84D"}
            actors = self.capture["pages"][0]["actors"]
            for index, actor in enumerate(actors):
                actor["center"] = [8 + 16 * index, 8]
            registered = []
            for index, actor in enumerate(actors):
                mask = root / f"{actor['id']}.png"
                Image.fromarray(alpha[:, index * 16:(index + 1) * 16]).save(mask)
                registered.append({
                    "id": actor["id"], "basis": "approved-original",
                    "approvalReference": "synthetic coverage fixture", "sourceSha256": "d" * 64,
                    "crop": [index * 16, 0, 16, 16], "path": mask.name, "sha256": measure.sha256(mask),
                })
            masks = root / "masks.json"
            capture = root / "capture.json"

            def run(specimen, manifest, report):
                entries = {}
                for key, colour in backgrounds.items():
                    image = root / f"{key}.png"
                    rgb = [int(colour[i:i + 2], 16) for i in (1, 3, 5)]
                    pixels = np.where(specimen[:, :, None] == 255, [93, 104, 174], rgb).astype(np.uint8)
                    Image.fromarray(pixels).save(image)
                    entries[key] = {
                        "screenshot": image.name, "screenshotSha256": measure.sha256(image),
                        "assetWarnings": [], "frame": 0, "time": 0,
                    }
                self.capture.update(backdrops=backgrounds, canvas={"width": 32, "height": 16})
                self.capture["pages"][0]["captures"] = entries
                capture.write_text(json.dumps(self.capture))
                masks.write_text(json.dumps({"schemaVersion": 1, "actors": manifest}))
                output = root / report
                result = subprocess.run([
                    sys.executable, str(TOOL), str(capture), "--require-pass", "--production-inventory",
                    "--masks", str(masks), "--output", str(output),
                ], input=json.dumps(self.inventory), capture_output=True, text=True, check=False)
                return result, json.loads(output.read_text())

            green, report = run(alpha, registered, "pass.json")
            self.assertEqual(green.returncode, 0, green.stderr)
            self.assertEqual([row["status"] for row in report["actors"].values()], ["pass", "pass"])
            leaked = alpha.copy()
            leaked[6, 6] = 0
            red, report = run(leaked, registered, "leak.json")
            self.assertEqual(red.returncode, 1, red.stderr)
            self.assertEqual(report["actors"]["hero"]["fullyOpenPixels"], 1)
            fit = [{**registered[0], "basis": "approved-fit-preview"}, registered[1]]
            red, report = run(alpha, fit, "fit-only.json")
            self.assertEqual(red.returncode, 1, red.stderr)
            self.assertEqual(report["actors"]["hero"]["basis"], "approved-fit-preview")
            red, report = run(alpha, registered[:1], "missing-original.json")
            self.assertEqual(red.returncode, 1, red.stderr)
            self.assertEqual(report["actors"]["enemy"]["status"], "unverified")

    def test_combat_hero_mask_must_bind_the_approved_original(self):
        for sha in ("", "0" * 64):
            masks = {"hero": (None, {"sourceSha256": sha})}
            with self.subTest(sha=sha), self.assertRaises(ValueError):
                measure.check_production_mask_sources(masks, self.inventory)
        measure.check_production_mask_sources({"hero": (None, {"sourceSha256": "d" * 64})}, self.inventory)


if __name__ == "__main__":
    unittest.main()
