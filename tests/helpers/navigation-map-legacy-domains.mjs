// Explicit adapters; the original packet, Git witnesses and schema are immutable.
export {releaseMergeCiPacket,assertReleaseMergeGitProvenance,releaseMergeArchivedGitRead} from './release-bootstrap-merge-ci-source.mjs';
export {navigationDomainRead as releaseMergeRead,navigationDomainSource as releaseMergeSource,assertNavigationDomainCurrent as assertReleaseMergeCurrent} from './navigation-map-integration.mjs';
