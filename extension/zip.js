/* Small ZIP writer: STORE entries, UTF-8 names, CRC-32. No remote dependencies. */
(() => {
  const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++) n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
  globalThis.SectionNotesZip = files => {
    const enc=new TextEncoder(), chunks=[], central=[];let offset=0;
    const header=(size)=>{const bytes=new Uint8Array(size);return {bytes,view:new DataView(bytes.buffer)};};
    for(const file of files){
      const name=enc.encode(file.name),data=typeof file.data==='string'?enc.encode(file.data):file.data;
      let crc=0xffffffff;for(const b of data) crc=table[(crc^b)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;
      const h=header(30);h.view.setUint32(0,0x04034b50,true);h.view.setUint16(4,20,true);h.view.setUint16(6,0x800,true);h.view.setUint32(14,crc,true);h.view.setUint32(18,data.length,true);h.view.setUint32(22,data.length,true);h.view.setUint16(26,name.length,true);
      chunks.push(h.bytes,name,data);
      const c=header(46);c.view.setUint32(0,0x02014b50,true);c.view.setUint16(4,20,true);c.view.setUint16(6,20,true);c.view.setUint16(8,0x800,true);c.view.setUint32(16,crc,true);c.view.setUint32(20,data.length,true);c.view.setUint32(24,data.length,true);c.view.setUint16(28,name.length,true);c.view.setUint32(42,offset,true);central.push(c.bytes,name);offset+=30+name.length+data.length;
    }
    const size=central.reduce((s,b)=>s+b.length,0),e=header(22);e.view.setUint32(0,0x06054b50,true);e.view.setUint16(8,files.length,true);e.view.setUint16(10,files.length,true);e.view.setUint32(12,size,true);e.view.setUint32(16,offset,true);
    return new Blob([...chunks,...central,e.bytes],{type:'application/zip'});
  };
})();
