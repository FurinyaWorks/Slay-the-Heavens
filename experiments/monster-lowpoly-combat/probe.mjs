import fs from 'node:fs';import path from 'node:path';import {pathToFileURL}from 'node:url';
const [saveArg,sdkArg]=process.argv.slice(2),sdk=await import(pathToFileURL(path.resolve(sdkArg))),save=JSON.parse(fs.readFileSync(saveArg));const at=performance.now();
const session=sdk.Gr(save.assets.server,{templatesProject:save.assets.client,scripts:save.assets.scripts,serverConfig:save.serverLogic,canvasId:'pc-16-9',language:'LanguageChs'});
console.log(JSON.stringify({createMs:performance.now()-at,controls:session.runtime.controlsById.size,logs:session.runtime.logs.slice(-20)}));
for(const r of session.runtimes??[])r.destroy();
