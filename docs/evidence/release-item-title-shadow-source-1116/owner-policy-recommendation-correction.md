# Review recommendation correction

The earlier recommendation to require the newly added current raw forecast to fit the performance target and execution guard is withdrawn. It conflicted with the Owner's existing 2026-11-07 decision in `docs/CI.md:168`: Windows30/POSIX20 and the forecast's 60-second reserve are diagnostic; actual workflow timeouts are Windows45, POSIX30 and local75.

Read-only inspection of PR692 at base `36b9b157`, head `b6722694`, confirms its new current raw contract follows this distinction. Original frozen budget assertions remain intact.

The minimal correction is to remove only the two added current-forecast admission assertions, retain truthful forecasts/overruns and measured floors, and strictly authenticate actual unprojected job-level workflow timeouts with missing/changed/duplicate/step-only negative controls. Do not alter old frozen inputs, functional assertions, workers, discovery or actual workflow gates.

This restores the existing Owner policy; it is not a relaxation of an Owner threshold. Earlier exact-input reports remain preserved. Final third-slice approval awaits its exact frozen code and cost bindings.
