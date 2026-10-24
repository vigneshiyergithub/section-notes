import {readFileSync,readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
const context=vm.createContext({Blob,TextEncoder});
vm.runInContext(readFileSync('extension/zip.js','utf8'),context);
const files=[];
function add(dir,prefix){for(const entry of readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
 const path=join(dir,entry.name),name=`${prefix}/${entry.name}`;
 if(entry.isDirectory())add(path,name);else files.push({name,data:new Uint8Array(readFileSync(path))});
}}
add('extension','section-notes');
for(const name of ['LICENSE','THIRD_PARTY_NOTICES.md','README.md'])files.push({name:`section-notes/${name}`,data:readFileSync(name,'utf8')});
const version=JSON.parse(readFileSync('extension/manifest.json','utf8')).version;
const zip=context.SectionNotesZip(files);mkdirSync('dist',{recursive:true});
const path=`dist/section-notes-v${version}.zip`;writeFileSync(path,Buffer.from(await zip.arrayBuffer()));
console.log(path);
