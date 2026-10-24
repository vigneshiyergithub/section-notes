importScripts('store.js');
chrome.action.onClicked.addListener(async tab => {
  try {
    const existing = await chrome.tabs.sendMessage(tab.id, {type:'section-notes:toggle'}).catch(()=>null);
    if (existing) return;
    const image = await chrome.tabs.captureVisibleTab(tab.windowId, {format:'png'});
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['zip.js','screenshot-card.js','content.js']});
    await chrome.tabs.sendMessage(tab.id,{type:'section-notes:start',image,...await NotesStore.state()});
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
  } catch (error) {
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
    await chrome.action.setTitle({tabId:tab.id,title:'Cannot annotate this page. Open a regular website, then try again. '+error.message});
  }
});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(!sender.tab)return;
  if(['section-notes:list','section-notes:change','section-notes:reset','section-notes:restore'].includes(message.type)){
    const task=message.type==='section-notes:list'?NotesStore.state():message.type==='section-notes:change'?NotesStore.change(message):message.type==='section-notes:reset'?NotesStore.reset(message.sessionId):NotesStore.restore(message.sessionId);
    task.then(reply).catch(e=>reply({error:e.message}));return true;
  }
  if(message.type!=='section-notes:capture') return;
  (async()=>{
    const [active] = await chrome.tabs.query({active:true,windowId:sender.tab.windowId});
    if(active?.id!==sender.tab.id) throw Error('Return to the original tab to capture.');
    return chrome.tabs.captureVisibleTab(sender.tab.windowId,{format:'png'});
  })().then(image=>reply({image})).catch(e=>reply({error:e.message}));
  return true;
});
