import fs from 'node:fs';import cp from 'node:child_process';import zlib from 'node:zlib';import crypto from 'node:crypto';
const hash=s=>crypto.createHash('sha256').update(s).digest('hex'),norm=s=>s.replaceAll('\r\n','\n');
const nav=JSON.parse(zlib.gunzipSync(fs.readFileSync('tests/helpers/navigation-map-ci-c433d789e470.json.gz'))),pc=JSON.parse(fs.readFileSync('tests/helpers/release-card-contact-integration.json'));
const product=await import(process.cwd()+'/tests/helpers/closeout-source-epoch.mjs');
const files=[...new Set([...Object.keys(nav.files),...Object.keys(pc.files),...Object.keys(product.sourceEpoch.proof.current).filter(p=>product.sourceEpoch.proof.current[p]),'tests/helpers/closeout-source-epoch.mjs','tests/helpers/navigation-map-integration.mjs','tests/helpers/navigation-menu-reader-repair.json','tests/helpers/navigation-inventory-reader-repair.json'])].sort();
const archives=[...new Set([...Object.keys(nav.archives),...Object.keys(pc.archives),'tests/helpers/navigation-help-retirement-fixtures.json.gz','tests/helpers/navigation-map-ci-c433d789e470.json.gz'])].sort();
// Include the actual local relative module/immutable-data dependency closure,
// not merely the two older packets' enumerated source domains.
const pathmod=await import('node:path');
const closure=new Set([...files,...archives,'tests/helpers/release-card-contact-integration.mjs','tests/helpers/release-card-contact-integration.json']);
const queue=[...closure];
while(queue.length){const path=queue.shift();if(!/\.mjs$/.test(path))continue;
 const text=fs.readFileSync(path,'utf8');
 const roots=path.startsWith('tests/helpers/')||path.startsWith('tests/support/')?[...text.matchAll(/(?:readFileSync|read)\(\s*['"]((?:tests|docs)\/[^'"]+\.json(?:\.gz)?)['"]/g)].map(m=>m[1]):[];
 for(const next of roots)if(fs.existsSync(next)&&!closure.has(next)){closure.add(next);queue.push(next);}
 const specs=[...text.matchAll(/(?:from\s*|import\s*\(\s*|import\s*|new URL\(\s*)['"](\.[^'"]+)['"]/g)].map(m=>m[1]);
 for(const spec of specs){const next=pathmod.posix.normalize(pathmod.posix.join(pathmod.posix.dirname(path),spec));
  if(next.startsWith('../')||!fs.existsSync(next)||!fs.statSync(next).isFile())continue;
  if(!closure.has(next)){closure.add(next);queue.push(next);}
 }
}
for(const path of closure)if(!files.includes(path)&&!archives.includes(path)){
 if(/\.gz$/.test(path))archives.push(path);else files.push(path);
}
files.sort();archives.sort();
const packet={schemaVersion:1,status:'staging-consumers-not-integrated',inputs:{navigation:'cd9106c0e302cb50f83ba8b5c85ce81560c6ed88',pc22:'b9bca884ed9b9831965b409885d78f719b9a567a'},files:{},archives:{},sources:{}};
for(const path of files){let s=norm(fs.readFileSync(path,'utf8')),id=hash(s);packet.sources[id]=s;const row={current:id,views:{}};
 for(const [side,ref]of Object.entries(packet.inputs)){const r=cp.spawnSync('git',['show',ref+':'+path],{encoding:'utf8',maxBuffer:30e6});if(r.status){row.views[side]=null;continue;}s=norm(r.stdout);id=hash(s);packet.sources[id]=s;row.views[side]=id;}
 packet.files[path]=row;
}
for(const path of archives)packet.archives[path]=hash(fs.readFileSync(path));
const raw=zlib.gzipSync(Buffer.from(JSON.stringify(packet)),{level:9});fs.writeFileSync('/tmp/690-outer-packet.json.gz',raw);console.log(JSON.stringify({sha:hash(raw),files:files.length,archives:archives.length,bytes:raw.length}));
