# PR690 actual Release 00ab reassessment and two conflict resolutions

Confirmed actual release/v2.0.0=00ab3fe6d386f55aecfb063e59aeca2cf5065807 (#703 merged); PR690 remains cd9106c0 with no newer owner work in its comments. PR metadata base33d is stale. Git merge-tree against the actual new base still lists nine conflicts. No Full run.

Two concrete conflict resolutions are implemented in the isolated product staging tree:

1. copy-integration-source-closure now retains all three original navigation/selection/PC22 helper-copy groups and original standalone hashes; uses the reviewed final three-product closeout helper hash; retains navigation's exact merged-input JSON. Real isolated copy produced177 files and imported the complete352 source/70 target proof equal to the source tree. PC22 helper tampering was rejected and restoring bytes passed.14 checks PASS; independent review10 checks PASS. The first exploratory assertion incorrectly prohibited all historical ci-source-named files, despite existing immutable dependencies, and is retained as a test-authoring red. The corrected assertion specifically excludes the new CI projection layers and production source files from the isolated copy.

2. session-menu-navigation preserves every original receipt/negative assertion while explicitly establishing that navigation and PC22 standalone prior proofs are identical. Both branches differ only in equivalent prior aliases/history-reader names. Three original receipt tests PASS, with no test deletion or broader exception matching.

Applicability to exact00ab is established by Git identities: B9 and00ab share src tree7b8805f1f5af6c254c8b1b6d999ce7ad7c1c6834; copy helper blobeb584d06fd1384c243359460acb77bfeacea2e31; menu-test blobabdc82e33075e9020c0f4ebab5016e33c7179f59. Thus #703 does not invalidate these production/copy/menu resolutions. This does NOT claim that a complete00ab integration candidate has passed: the stage retains unresolved consumers and the newer capacity scripts have not been wired through the outer boundary.

Next integration must preserve #703 capacityB9CiRead/beforeCapacityB9Ci and assertCapacityB9ReaderRepairCurrent, including the new integrationCapacityCiRead export. The old69959db4 packet is a fixed B9-stage witness, not a valid00ab baseline. Rebuild/review final outer bindings after applying the new capacity sources and remaining six consumer/CI conflicts. Never silently repin its old packet or discard #703 capacity assertions.

Patches apply after the archived product-stage patch on cd9106c0; they remain preparation until the full current-base candidate is complete. Active PR head unchanged, no merge/publication claimed.
