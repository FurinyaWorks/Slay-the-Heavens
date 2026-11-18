## What & why
<!-- One paragraph: the change and the problem it solves. Link the task. -->

## Type of change
- [ ] fix (PATCH)   - [ ] feat (MINOR)   - [ ] breaking (MAJOR)
- [ ] chore / docs / refactor / test / ci (no release)

## Target version / base branch
Target version: v2.0.0 / post-v2.0.0 / experiment (select one)
Branch closeout owner (Agent / takeover coordinator): [name or session]
Supersedes / inherits: none
Expected exit: DELIVERED_VERIFIED / SUPERSEDED / FROZEN / DISCARDED (select one; pending is not Done)
<!-- On actual closeout, post a single CLOSEOUT receipt in this PR or existing Backlog task (fixed HEAD SHA, evidence, successor, remote deletion/retention). Do not mark delivery complete just because auto-merge was enabled. -->
- [ ] v2.0.0 defect or stabilization → `release/v2.0.0` (source based on release)
- [ ] future feature or non-release docs → `develop` (source based on develop)
- [ ] release cut or production hotfix → `master` (then sync back to develop)
- [ ] frozen experiment / HOLD (normally no merge PR)
<!-- Confirm actual base matches selected target, and record closeout/successor when closing without merge. See docs/BRANCH_LIFECYCLE.md. -->

## PR dependencies
Depends-on: none
<!-- External prerequisites that must merge first: replace none with #123, #456.
Work fully included in a coordinated integration is recorded below, not falsely
claimed to have merged independently. Required by merge:auto. -->

<!-- Coordinated integration only: record source PR/branch, frozen full HEAD SHA,
included scope and conflict-resolution decisions in this PR body. Ordinary PRs
need no extra table. See docs/CI.md: 多 Agent 协调集成. One coordinator owns the
integration branch; pause source PR auto-merge and confirm dequeue before takeover.
Review/test the complete combined candidate; source green checks are not inherited. -->

## Backlog closeout
Backlog: none
<!-- List every changed task: TASK-1=done, TASK-2=verify, TASK-3=continue,
TASK-4=superseded:TASK-3. done requires all AC already evidenced and checked;
verify keeps started work In Progress with open acceptance; superseded preserves history and its successor.
Use recorded for cleanup/status updates already committed; it validates without mutating the task again.
verify:delivery --merged applies this line via CLI after exact merged verification.
Use none only when this PR has no task updates. -->

## Integration slice
<!-- Describe the independently verified behavior, the next dependent slice if any, and the
flag owner/removal condition if applicable. For over-budget production or evidence, use
Slice-exception: atomic | why it must land together | verification command or evidence
Other valid reasons: mechanical, generated, tests. The reviewer verifies the exception. -->

## How to test
1.

## Checklist
- [ ] Production and evidence each fit 400 added/deleted lines and 10 files, or include a reviewed exception
- [ ] Tests added/updated and passing locally
- [ ] No secrets/PII in diff
- [ ] Breaking changes documented + migration notes
- [ ] Backlog task status updated
- [ ] One independent slice, or a scoped coordinated integration with frozen sources; external dependencies have landed
- [ ] After merge, compare the exact PR head before deleting its branch/worktree; retain dirty files, independent commits and unique evidence

## Screenshots / logs

<!-- Source/base/head, fresh command results and evidence paths. For candidate/UI
claims: current receipt/run and actual human review scope. For integration:
check + presentation + engineering-posix, actual checkout identity, traceable
independent review (or GitHub-verified --low-risk-docs waiver). Offline PASS does not imply official import or gameplay PASS. -->
