// Historical af77 fixture defaults only. Explicit injected readers remain intact.
import {readFileSync} from 'node:fs';
import {intentReleaseFixtureRead} from './intent-release-union.mjs';
import * as actual from './release-card-contact-integration.mjs';
export {integrationPacket,integrationInventory,assertIntegrationRawInventory} from './release-card-contact-integration.mjs';
const read=intentReleaseFixtureRead('release',readFileSync);
export const integrationCiSource=(p,s,side='pc22',r=read)=>actual.integrationCiSource(p,s,side,r);
export const integrationRead=(side='pc22',r=read)=>actual.integrationRead(side,r);
export const integrationCapacityCiRead=(r=read)=>actual.integrationCapacityCiRead(r);
export const integrationProductionRead=(side='pc22',r=read)=>actual.integrationProductionRead(side,r);
export const integrationPriorInventory=(paths,side='pc22',kind='js',r=read)=>actual.integrationPriorInventory(paths,side,kind,r);
export const assertReleaseIntegrationCurrent=(r=read,capacityRead=r)=>actual.assertReleaseIntegrationCurrent(r,capacityRead);
