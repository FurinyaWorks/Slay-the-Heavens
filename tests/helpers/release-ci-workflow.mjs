// Invert this single reviewed publication gate for immutable historical tests.
// Keep arbitrary/partial workflow changes visible to their original guards.
import {beforeReleaseFastB9Ci} from './release-fast-b9-ci-source.mjs';
export const releaseFullGate = `      - name: Require frozen Release Full before publication
        if: github.event_name == 'pull_request' && github.event.pull_request.base.ref == 'master' && startsWith(github.event.pull_request.head.ref, 'release/')
        env:
          GH_TOKEN: \${{ github.token }}
        run: node scripts/release-ci.mjs verify-pr
`;
export function beforeReleaseFullGate(source) {
 source=beforeReleaseFastB9Ci('.github/workflows/quality.yml',source);
 const eol=source.includes('\r\n')?'\r\n':'\n',block=releaseFullGate.replaceAll('\n',eol);
 return source.split(block).length===2?source.replace(block,''):source;
}
