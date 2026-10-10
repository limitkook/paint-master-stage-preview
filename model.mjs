// Standalone web analogue; same native artwork ownership, not a Unity build.
import {confinedPath} from './confined-pointer.mjs?v=material-v18-confined-pointer';
export class Stage {
 constructor(level,{tinyRemainderPixels=24}={}){
  this.tinyRemainderPixels=tinyRemainderPixels;
  const {width:w,height:h,regions,palette,ownerRuns}=level;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<=0||h<=0||w*h>4194304||!Array.isArray(regions)||!regions.length||!Array.isArray(palette)||!palette.length||palette.length>30||!Array.isArray(ownerRuns)||ownerRuns.length%2)throw Error('잘못된 도안');
  this.width=w;this.height=h;this.regions=regions;this.palette=palette;this.owners=new Uint16Array(w*h);this.runs=Array.from({length:regions.length+1},()=>[]);let offset=0;
  for(let k=0;k<ownerRuns.length;k+=2){const id=ownerRuns[k],n=ownerRuns[k+1];if(!Number.isInteger(id)||!Number.isInteger(n)||id<0||id>regions.length||n<1||offset+n>w*h)throw Error('잘못된 소유권 RLE');this.owners.fill(id,offset,offset+n);if(id)this.runs[id].push([offset,n]);offset+=n;}
  if(offset!==w*h)throw Error('도안 크기 불일치');
  for(let id=1;id<=regions.length;id++){const r=regions[id-1],area=this.runs[id].reduce((a,run)=>a+run[1],0);if(area!==r.area||!palette.some(p=>p.number===r.paletteNumber))throw Error('부위 정보 불일치');}
  this.total=regions.reduce((a,r)=>a+r.area,0);this.reset();
 }
 reset(){this.painted=new Uint8Array(this.owners.length);this.coverage=new Uint32Array(this.regions.length+1);this.done=new Uint8Array(this.regions.length+1);this.paintedCount=0;this.doneCount=0;this.strokeOwner=0;this.changes=[];this.completions=[];this.errors=[];this.blocked=false;this.virtualPointer=null;this.labels=this.regions.slice();this.labelDistance=null;}
 beginCell(index,number){this.strokeOwner=0;this.virtualPointer=null;this.blocked=false;if(!Number.isInteger(index)||index<0||index>=this.owners.length)return false;const id=this.owners[index];if(!id||this.done[id])return false;if(this.regions[id-1].paletteNumber!==number){this.rejectStroke("colour");return false;}this.strokeOwner=id;this.virtualPointer={x:index%this.width+.5,y:Math.floor(index/this.width)+.5};return true;}
 paintCell(index){const id=this.strokeOwner;if(!id||this.owners[index]!==id||this.done[id])return false;if(this.shouldComplete(id)){this.completeOwner(id);return false;}if(this.painted[index])return false;this.painted[index]=1;this.coverage[id]++;this.paintedCount++;this.changes.push(index);if(this.shouldComplete(id))this.completeOwner(id);return true;}
 circle(x,y,radius){if(!this.strokeOwner)return;const w=this.width,h=this.height,r2=radius*radius;for(let yy=Math.max(0,Math.floor(y-radius));yy<Math.min(h,Math.ceil(y+radius));yy++)for(let xx=Math.max(0,Math.floor(x-radius));xx<Math.min(w,Math.ceil(x+radius));xx++)if((xx+.5-x)**2+(yy+.5-y)**2<=r2)this.paintCell(yy*w+xx);}
 segment(a,b,radius){if(!this.strokeOwner)return;const path=confinedPath(this.virtualPointer,b,this.width,this.height,(x,y)=>{const xx=Math.floor(x),yy=Math.floor(y);return xx>=0&&yy>=0&&xx<this.width&&yy<this.height&&this.owners[yy*this.width+xx]===this.strokeOwner;});if(!path.length)return;this.virtualPointer=path.at(-1);this.circle(path[0].x,path[0].y,radius);for(let k=1;k<path.length&&this.strokeOwner;k++){const from=path[k-1],to=path[k],steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/Math.max(.5,radius/2)));for(let i=1;i<=steps&&this.strokeOwner;i++)this.circle(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps,radius);}}
 completeOwner(id){if(this.done[id])return;for(const [start,n] of this.runs[id])for(let i=start;i<start+n;i++)if(!this.painted[i]){this.painted[i]=1;this.paintedCount++;this.changes.push(i);}this.coverage[id]=this.regions[id-1].area;this.strokeOwner=0;this.virtualPointer=null;this.done[id]=1;this.doneCount++;this.completions.push(id);}
 endStroke(cancel=false){const id=this.strokeOwner;this.strokeOwner=0;this.virtualPointer=null;if(!id||cancel)return 0;if(this.shouldComplete(id)){this.completeOwner(id);return id;}if(this.coverage[id]>0)this.repositionLabel(id);return 0;}
 shouldComplete(id){const area=this.regions[id-1].area,count=this.coverage[id];return count/area>=.97||(count/area>=.8&&area-count<=this.tinyRemainderPixels);}
 rejectStroke(reason){if(this.blocked)return;const id=this.strokeOwner;this.strokeOwner=0;this.blocked=true;if(id&&this.coverage[id]>0)this.repositionLabel(id);if(reason==="colour")this.errors.push(reason);}
 drainErrors(){const errors=this.errors;this.errors=[];return errors;}
 labelPosition(id){return this.labels[id-1];}
 repositionLabel(id){
  const w=this.width,h=this.height,original=this.regions[id-1],distance=this.labelDistance??=new Uint16Array(this.owners.length),remaining=[];
  for(const [start,n] of this.runs[id])for(let i=start;i<start+n;i++)if(!this.painted[i]){distance[i]=0;remaining.push(i);}
  if(!remaining.length)return;
  const queue=new Uint32Array(remaining.length);let head=0,tail=0,best=remaining[0],bestDistance=0,bestTie=Infinity;
  const available=i=>i>=0&&i<this.owners.length&&this.owners[i]===id&&!this.painted[i];
  for(const i of remaining){const x=i%w,y=Math.floor(i/w);if(x===0||x===w-1||y===0||y===h-1||!available(i-1)||!available(i+1)||!available(i-w)||!available(i+w)){distance[i]=1;queue[tail++]=i;}}
  while(head<tail){const i=queue[head++],x=i%w,y=Math.floor(i/w),d=distance[i],tie=(x+.5-original.labelX)**2+(y+.5-original.labelY)**2;
   if(d>bestDistance||(d===bestDistance&&tie<bestTie)){best=i;bestDistance=d;bestTie=tie;}
   for(const n of [x>0?i-1:-1,x<w-1?i+1:-1,y>0?i-w:-1,y<h-1?i+w:-1])if(available(n)&&!distance[n]){distance[n]=d+1;queue[tail++]=n;}
  }
  this.labels[id-1]={...original,labelX:best%w+.5,labelY:Math.floor(best/w)+.5,labelRadius:Math.max(.2,bestDistance/Math.SQRT2-.5),labelMoved:true};
 }
 drainCompletions(){const events=this.completions;this.completions=[];return events;}
 drainChanges(){const changes=this.changes;this.changes=[];return changes;}
}
