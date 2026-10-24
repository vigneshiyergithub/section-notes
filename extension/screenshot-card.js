/* Compose a shareable PNG: original screenshot pixels followed by readable feedback. */
(() => {
  function wrap(ctx,text,maxWidth){
    const lines=[];
    for(const paragraph of String(text).split(/\r?\n/)){
      if(!paragraph.trim()){lines.push('');continue;}
      let line='';
      for(const word of paragraph.trim().split(/\s+/)){
        if(ctx.measureText((line?line+' ':'')+word).width<=maxWidth){line+=(line?' ':'')+word;continue;}
        if(line){lines.push(line);line='';}
        if(ctx.measureText(word).width<=maxWidth){line=word;continue;}
        for(const char of Array.from(word)){
          if(line && ctx.measureText(line+char).width>maxWidth){lines.push(line);line='';}
          line+=char;
        }
      }
      if(line)lines.push(line);
    }
    return lines;
  }
  globalThis.SectionNotesCard=(screenshot,group,index=1)=>{
    const width=Math.max(640,screenshot.width),pad=Math.round(Math.max(26,Math.min(48,width*.03)));
    const font=Math.max(17,Math.min(25,Math.round(width/60))),lineHeight=Math.ceil(font*1.55);
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    const family='-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    const textWidth=width-pad*2,numberWidth=font+22;
    ctx.font=`600 ${font+3}px ${family}`;
    const titles=wrap(ctx,`${group.mode==='full'?'Viewport':'Section'} ${index} · ${group.title||'Website review'}`,textWidth);
    ctx.font=`${Math.max(12,font-4)}px ${family}`;
    const source=wrap(ctx,group.url||'',textWidth);
    const rows=group.annotations.map((a,i)=>{
      ctx.font=`${font}px ${family}`;
      return {number:i+1,lines:wrap(ctx,a.comment,textWidth-numberWidth)};
    });
    const titleHeight=titles.length*(font+12),sourceHeight=source.length*(font+3);
    const notesHeight=rows.reduce((sum,row)=>sum+Math.max(lineHeight,row.lines.length*lineHeight)+pad,0);
    const footerHeight=pad+titleHeight+8+sourceHeight+18+notesHeight+font+pad;
    const height=screenshot.height+footerHeight;
    if(width>32760 || height>32760 || width*height>100000000)throw Error('This review image is too large. Shorten the comments or split the fullscreen review into another capture.');
    canvas.width=width;canvas.height=height;
    ctx.fillStyle='#181c22';ctx.fillRect(0,0,width,screenshot.height);
    const screenshotX=Math.floor((width-screenshot.width)/2);
    ctx.drawImage(screenshot,screenshotX,0);
    ctx.fillStyle='#f9fafb';ctx.fillRect(0,screenshot.height,width,footerHeight);
    ctx.fillStyle='#dce2e8';ctx.fillRect(0,screenshot.height,width,1);
    ctx.textBaseline='top';let y=screenshot.height+pad;
    ctx.fillStyle='#18232f';ctx.font=`600 ${font+3}px ${family}`;
    for(const line of titles){ctx.fillText(line,pad,y);y+=font+12;}
    y+=8;ctx.fillStyle='#647181';ctx.font=`${Math.max(12,font-4)}px ${family}`;
    for(const line of source){ctx.fillText(line,pad,y);y+=font+3;}
    y+=18;
    for(const row of rows){
      ctx.fillStyle='#d9522e';ctx.fillRect(pad,y+1,font+10,font+10);
      ctx.fillStyle='white';ctx.font=`600 ${Math.max(12,font-3)}px ${family}`;
      ctx.textAlign='center';ctx.fillText(String(row.number),pad+(font+10)/2,y+5);ctx.textAlign='left';
      ctx.fillStyle='#253343';ctx.font=`${font}px ${family}`;
      for(const line of row.lines){ctx.fillText(line,pad+numberWidth,y);y+=lineHeight;}
      y+=pad;
    }
    ctx.fillStyle='#7a8695';ctx.font=`${Math.max(11,font-6)}px ${family}`;
    ctx.fillText(`Section Notes · ${group.createdAt?new Date(group.createdAt).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'Website review'}`,pad,y);
    return {canvas,layout:{screenshot:{x:screenshotX,y:0,width:screenshot.width,height:screenshot.height},comments:{x:0,y:screenshot.height,width,height:footerHeight}}};
  };
})();
