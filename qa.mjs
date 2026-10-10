// Explicit QA-only mutations; never count these as normal brush acceptance.
export class DebugGate{
 constructor(){this.taps=0;this.backVisible=false;this.lobby=false;this.unlocked=false;this.buffer='';}
 tap(){if(++this.taps>=20)this.backVisible=true;return this.backVisible;}
 enterLobby(){if(this.backVisible)this.lobby=true;}
 key(k){if(!this.lobby||this.unlocked)return this.unlocked;if(k==='Backspace'){this.buffer=this.buffer.slice(0,-1);return false;}if(/^\d$/.test(k)){this.buffer=(this.buffer+k).slice(-9);if(this.buffer==='359462781')this.unlocked=true;}return this.unlocked;}
}
export function debugPaint(stage,mode,owner=1,fraction=1){
 stage.endStroke(true);stage.debugUsed=true;
 if(mode==='all'||mode==='except'){
  if(mode==='except'&&(!Number.isInteger(owner)||owner<1||owner>stage.regions.length))throw Error('QA owner invalid');
  stage.reset();
  for(let id=1;id<=stage.regions.length;id++){
   if(mode==='except'&&id===owner)continue;
   for(const [start,n] of stage.runs[id])stage.painted.fill(1,start,start+n);
   stage.coverage[id]=stage.regions[id-1].area;stage.done[id]=1;stage.doneCount++;stage.paintedCount+=stage.coverage[id];
  }
 }else if(mode==='fraction'){
  if(!Number.isInteger(owner)||owner<1||owner>stage.regions.length||!Number.isFinite(fraction)||fraction<0||fraction>1)throw Error('QA target invalid');
  const area=stage.regions[owner-1].area,goal=Math.floor(area*fraction),before=stage.coverage[owner],wasDone=stage.done[owner];let left=goal;
  for(const [start,n] of stage.runs[owner]){stage.painted.fill(0,start,start+n);const take=Math.min(left,n);stage.painted.fill(1,start,start+take);left-=take;}
  stage.coverage[owner]=goal;stage.done[owner]=Number(fraction===1);stage.doneCount+=stage.done[owner]-wasDone;stage.paintedCount+=goal-before;
 }else throw Error('QA action invalid');
 stage.changes=[];stage.debugUsed=true;
}
export function qaReport(stage,manifest,lastOwner=0){return {kind:'QA state — not normal input acceptance',debugUsed:Boolean(stage.debugUsed),release:manifest.release,assetHashes:manifest.assets,completionThreshold:.98,regions:stage.regions.length,done:stage.doneCount,painted:stage.paintedCount,total:stage.total,lastOwner,regionCoverage:lastOwner?stage.coverage[lastOwner]/stage.regions[lastOwner-1].area:0};}
