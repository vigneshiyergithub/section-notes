import {readFileSync, readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const manifest=JSON.parse(readFileSync('extension/manifest.json','utf8'));
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert.equal(manifest.manifest_version,3);
assert.equal(manifest.version,pkg.version,'Keep package and extension versions aligned');
assert.deepEqual([...manifest.permissions].sort(),['activeTab','scripting']);
for(const file of readdirSync('extension').filter(f=>f.endsWith('.js'))){
 const result=spawnSync(process.execPath,['--check',`extension/${file}`],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
console.log('Manifest, permissions, versions, and JavaScript syntax: PASS');
