// Geometry and colouring stay in Stage; this is read-only HUD arithmetic.
export function progressSummary(stage, selected, lastOwner=0){
 const totals=new Map(),done=new Map();
 for(let i=0;i<stage.regions.length;i++){
  const n=stage.regions[i].paletteNumber;totals.set(n,(totals.get(n)||0)+1);
  if(stage.done[i+1])done.set(n,(done.get(n)||0)+1);
 }
 const r=stage.regions[lastOwner-1];
 return {stageCleared:stage.regions.length>0&&stage.doneCount===stage.regions.length,regionPercent:r?(stage.done[lastOwner]?100:stage.coverage[lastOwner]/r.area*100):0,
  regionNumber:r?.paletteNumber??0,regionDone:Boolean(r&&stage.done[lastOwner]),
  colourDone:done.get(selected)||0,colourTotal:totals.get(selected)||0,
  completedColours:stage.palette.filter(p=>totals.get(p.number)>0&&done.get(p.number)===totals.get(p.number)).length,
  totalColours:stage.palette.length};
}
