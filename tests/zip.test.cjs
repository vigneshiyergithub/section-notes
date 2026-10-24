const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
function crc32(data){let crc=0xffffffff;for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
test('ZIP roundtrip: UTF-8 paths, payload sizes, CRC and central directory offsets',async()=>{
 const ctx=vm.createContext({Blob,TextEncoder});vm.runInContext(readFileSync('extension/zip.js','utf8'),ctx);
 const entries=[{name:'review.html',data:'<p>Feedback & screenshots</p>'},{name:'notes/你好.txt',data:'Unicode ✓'},{name:'empty.bin',data:new Uint8Array()}];
 const bytes=Buffer.from(await ctx.SectionNotesZip(entries).arrayBuffer());let offset=0;
 for(const entry of entries){
  assert.equal(bytes.readUInt32LE(offset),0x04034b50);assert.ok(bytes.readUInt16LE(offset+6)&0x800);
  const nameLength=bytes.readUInt16LE(offset+26),length=bytes.readUInt32LE(offset+18);
  assert.equal(bytes.subarray(offset+30,offset+30+nameLength).toString(),entry.name);
  const payload=bytes.subarray(offset+30+nameLength,offset+30+nameLength+length);
  assert.deepEqual(payload,Buffer.from(entry.data));assert.equal(bytes.readUInt32LE(offset+14),crc32(payload));offset+=30+nameLength+length;
 }
 const end=bytes.length-22;assert.equal(bytes.readUInt32LE(end),0x06054b50);assert.equal(bytes.readUInt16LE(end+10),entries.length);assert.equal(bytes.readUInt32LE(end+16),offset);
 let cursor=offset,localOffset=0;
 for(const entry of entries){assert.equal(bytes.readUInt32LE(cursor),0x02014b50);assert.equal(bytes.readUInt32LE(cursor+42),localOffset);const n=bytes.readUInt16LE(cursor+28);assert.equal(bytes.subarray(cursor+46,cursor+46+n).toString(),entry.name);localOffset+=30+Buffer.byteLength(entry.name)+Buffer.byteLength(entry.data);cursor+=46+n;}
 assert.equal(cursor,end);
});
