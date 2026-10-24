const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {readFileSync}=require('node:fs');
const {randomUUID}=require('node:crypto');
const {IDBFactory}=require('fake-indexeddb');
const source=readFileSync('extension/store.js','utf8');
function setup(indexedDB=new IDBFactory()){
 const context=vm.createContext({indexedDB,crypto:{randomUUID}});
 vm.runInContext(source+'\nglobalThis.store=NotesStore;',context);
 return {store:context.store,indexedDB};
}
const group=id=>({id,title:'Synthetic page',url:'https://example.test/review',image:'synthetic-image',width:800,height:600,mode:'full',createdAt:'2026-01-01T00:00:00Z',annotations:[]});
const note=(id,comment='Synthetic feedback')=>({id,comment,rect:{x:10,y:20,w:100,h:80}});
test('migrates the existing v1 database without losing captures',async()=>{
 const indexedDB=new IDBFactory();
 await new Promise((resolve,reject)=>{
  const req=indexedDB.open('section-notes',1);
  req.onupgradeneeded=()=>req.result.createObjectStore('captures',{keyPath:'id'});
  req.onerror=()=>reject(req.error);
  req.onsuccess=()=>{const db=req.result,tx=db.transaction('captures','readwrite');tx.objectStore('captures').put({...group('legacy'),annotations:[note('legacy-note')]});tx.oncomplete=()=>{db.close();resolve();};};
 });
 const {store}=setup(indexedDB),state=await store.state();
 assert.equal(state.groups[0].id,'legacy');assert.equal(state.groups[0].annotations[0].id,'legacy-note');assert.ok(state.sessionId);
});
test('reset persists recovery, rejects stale saves, and restores exact feedback',async()=>{
 const {store,indexedDB}=setup();let state=await store.state();const old=state.sessionId;
 state=await store.change({group:group('a'),annotation:note('a','Keep this feedback'),sessionId:old});
 state=await store.reset(old);assert.equal(state.groups.length,0);assert.ok(state.canRestore);assert.notEqual(state.sessionId,old);
 await assert.rejects(store.change({group:group('a'),annotation:note('a'),sessionId:old}),/session changed/);
 const reopened=setup(indexedDB).store;state=await reopened.state();assert.ok(state.canRestore);
 state=await reopened.restore(state.sessionId);assert.equal(state.groups[0].annotations[0].comment,'Keep this feedback');assert.equal(state.canRestore,false);
});
test('restoration cannot overwrite annotations added to the new session',async()=>{
 const {store}=setup();let state=await store.state();
 state=await store.change({group:group('old'),annotation:note('old'),sessionId:state.sessionId});
 state=await store.reset(state.sessionId);
 state=await store.change({group:group('new'),annotation:note('new'),sessionId:state.sessionId});
 assert.equal(state.canRestore,false);await assert.rejects(store.restore(state.sessionId),/only before adding/);
 assert.equal((await store.state()).groups[0].id,'new');
});
test('concurrent note writes merge and edits preserve pin order',async()=>{
 const {store}=setup();const {sessionId}=await store.state();
 await Promise.all(['one','two'].map(id=>store.change({group:group('shared'),annotation:note(id),sessionId})));
 let state=await store.state();assert.equal(state.groups[0].annotations.length,2);
 const ids=Array.from(state.groups[0].annotations,a=>a.id);
 await store.change({group:group('shared'),annotation:note(ids[0],'Edited'),sessionId});
 state=await store.state();assert.deepEqual(Array.from(state.groups[0].annotations,a=>a.id),ids);assert.equal(state.groups[0].annotations[0].comment,'Edited');
});
