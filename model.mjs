// Standalone web analogue; same native artwork ownership, not a Unity build.
export class Stage {
 constructor(level){
  const {width:w,height:h,regions,palette,ownerRuns}=level;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<=0||h<=0||w*h>4194304||!Array.isArray(regions)||!regions.length||!Array.isArray(palette)||!palette.length||palette.length>30||!Array.isArray(ownerRuns)||ownerRuns.length%2)throw Error('잘못된 도안');
  this.width=w;this.height=h;this.regions=regions;this.palette=palette;this.owners=new Uint16Array(w*h);this.runs=Array.from({length:regions.length+1},()=>[]);let offset=0;
  for(let k=0;k<ownerRuns.length;k+=2){const id=ownerRuns[k],n=ownerRuns[k+1];if(!Number.isInteger(id)||!Number.isInteger(n)||id<0||id>regions.length||n<1||offset+n>w*h)throw Error('잘못된 소유권 RLE');this.owners.fill(id,offset,offset+n);if(id)this.runs[id].push([offset,n]);offset+=n;}
  if(offset!==w*h)throw Error('도안 크기 불일치');
  for(let id=1;id<=regions.length;id++){const r=regions[id-1],area=this.runs[id].reduce((a,run)=>a+run[1],0);if(area!==r.area||!palette.some(p=>p.number===r.paletteNumber))throw Error('부위 정보 불일치');}
  this.total=regions.reduce((a,r)=>a+r.area,0);this.reset();
 }
 reset(){this.painted=new Uint8Array(this.owners.length);this.coverage=new Uint32Array(this.regions.length+1);this.done=new Uint8Array(this.regions.length+1);this.paintedCount=0;this.doneCount=0;this.strokeOwner=0;this.changes=[];}
 beginCell(index,number){this.strokeOwner=0;if(!Number.isInteger(index)||index<0||index>=this.owners.length)return false;const id=this.owners[index];if(!id||this.done[id]||this.regions[id-1].paletteNumber!==number)return false;this.strokeOwner=id;return true;}
 paintCell(index){const id=this.strokeOwner;if(!id||this.owners[index]!==id||this.painted[index])return false;this.painted[index]=1;this.coverage[id]++;this.paintedCount++;this.changes.push(index);return true;}
 circle(x,y,radius){if(!this.strokeOwner)return;const w=this.width,h=this.height,r2=radius*radius;for(let yy=Math.max(0,Math.floor(y-radius));yy<Math.min(h,Math.ceil(y+radius));yy++)for(let xx=Math.max(0,Math.floor(x-radius));xx<Math.min(w,Math.ceil(x+radius));xx++)if((xx+.5-x)**2+(yy+.5-y)**2<=r2)this.paintCell(yy*w+xx);}
 segment(a,b,radius){const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/Math.max(1,radius/2)));for(let i=0;i<=steps;i++)this.circle(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps,radius);}
 endStroke(cancel=false){const id=this.strokeOwner;this.strokeOwner=0;if(!id||cancel||this.coverage[id]/this.regions[id-1].area<.9)return 0;this.strokeOwner=id;for(const [start,n] of this.runs[id])for(let i=start;i<start+n;i++)this.paintCell(i);this.strokeOwner=0;this.done[id]=1;this.doneCount++;return id;}
 drainChanges(){const changes=this.changes;this.changes=[];return changes;}
}
