import {jointRead,assertCurrent} from './690-outer-runtime.mjs';
const nav=await import(process.cwd()+'/tests/helpers/navigation-map-integration.mjs');
const pc=await import(process.cwd()+'/tests/helpers/release-card-contact-integration.mjs');
assertCurrent();
nav.assertNavigationMapCurrent(jointRead('navigation',undefined,{productionView:true}));
console.log('navigation existing joint current validator PASS');
pc.assertReleaseIntegrationCurrent(jointRead('pc22',undefined,{productionView:true}));
console.log('PC22 existing joint current validator PASS');
