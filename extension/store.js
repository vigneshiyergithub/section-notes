/* Extension-owned storage. Session reset and its recovery snapshot commit atomically. */
const NotesStore = (() => {
  const open=()=>new Promise((resolve,reject)=>{
    const request=indexedDB.open('section-notes',2);
    request.onupgradeneeded=()=>{
      if(!request.result.objectStoreNames.contains('captures'))request.result.createObjectStore('captures',{keyPath:'id'});
      if(!request.result.objectStoreNames.contains('meta'))request.result.createObjectStore('meta');
    };
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
  async function transaction(operation){
    const db=await open();try{return await new Promise((resolve,reject)=>{
      const tx=db.transaction(['captures','meta'],'readwrite');let result,error;
      const fail=e=>{error=e;tx.abort();};
      tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(error||tx.error);tx.onabort=()=>reject(error||tx.error||Error('Local save aborted'));
      operation(tx.objectStore('captures'),tx.objectStore('meta'),value=>{result=value;},fail);
    });}finally{db.close();}
  }
  const sorted=groups=>groups.sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
  async function state(){return transaction((captures,meta,done)=>{
    const all=captures.getAll(),session=meta.get('session'),backup=meta.get('resetBackup');
    backup.onsuccess=()=>{const sessionId=session.result||crypto.randomUUID();if(!session.result)meta.put(sessionId,'session');done({groups:sorted(all.result),sessionId,canRestore:!!backup.result&&!all.result.length});};
  });}
  async function list(){return (await state()).groups;}
  async function change({group,annotation,remove=false,sessionId}){
    if(!group?.id||!annotation?.id)throw Error('Invalid annotation');
    await transaction((captures,meta,done,fail)=>{
      const session=meta.get('session');session.onsuccess=()=>{
        if(!sessionId||session.result!==sessionId){fail(Error('The review session changed in another tab. Reopen the extension before saving.'));return;}
        const request=captures.get(group.id);request.onsuccess=()=>{
          const saved=request.result||{...group,annotations:[]},order=saved.annotations.map(a=>a.id);
          saved.annotations=saved.annotations.filter(a=>a.id!==annotation.id);
          if(!remove)saved.annotations.push(annotation);
          saved.annotations.sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):Infinity)-(order.includes(b.id)?order.indexOf(b.id):Infinity));
          if(saved.annotations.length)captures.put(saved);else captures.delete(saved.id);
        };
      };
    });return state();
  }
  async function reset(sessionId){
    await transaction((captures,meta,done,fail)=>{
      const all=captures.getAll(),session=meta.get('session');session.onsuccess=()=>{
        if(sessionId!==session.result){fail(Error('The review session already changed. Reopen the extension.'));return;}
        if(all.result.length)meta.put(all.result,'resetBackup');
        captures.clear();meta.put(crypto.randomUUID(),'session');
      };
    });return state();
  }
  async function restore(sessionId){
    await transaction((captures,meta,done,fail)=>{
      const all=captures.getAll(),session=meta.get('session'),backup=meta.get('resetBackup');backup.onsuccess=()=>{
        if(sessionId!==session.result||all.result.length||!backup.result){fail(Error('Undo session reset is available only before adding new annotations.'));return;}
        for(const group of backup.result)captures.put(group);
        meta.delete('resetBackup');meta.put(crypto.randomUUID(),'session');
      };
    });return state();
  }
  return {list,state,change,reset,restore};
})();
