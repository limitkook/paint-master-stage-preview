// Collision-constrained virtual brush, not OS pointer capture or automatic pathfinding.
export function confinedPath(start,target,width,height,inside){
 if(!start||!Number.isFinite(target.x+target.y))return [];
 const end={x:Math.max(-width,Math.min(width*2,target.x)),y:Math.max(-height,Math.min(height*2,target.y))};
 const steps=Math.max(1,Math.ceil(Math.hypot(end.x-start.x,end.y-start.y)/.5)),dx=(end.x-start.x)/steps,dy=(end.y-start.y)/steps;
 let p={...start};const path=[{...p}];
 const allowed=(a,b)=>inside(b.x,b.y)&&(Math.floor(a.x)===Math.floor(b.x)||Math.floor(a.y)===Math.floor(b.y)||inside(a.x,b.y)&&inside(b.x,a.y));
 function append(next){if(path.length>1){const a=path.at(-2),b=path.at(-1),u={x:b.x-a.x,y:b.y-a.y},v={x:next.x-b.x,y:next.y-b.y};if(Math.abs(u.x*v.y-u.y*v.x)<1e-8&&u.x*v.x+u.y*v.y>=0){path[path.length-1]={...next};return;}}path.push({...next});}
 for(let i=0;i<steps;i++){
  const diagonal={x:p.x+dx,y:p.y+dy},horizontal={x:p.x+dx,y:p.y},vertical={x:p.x,y:p.y+dy};
  let next=allowed(p,diagonal)?diagonal:null;
  if(!next)for(const candidate of Math.abs(dx)>=Math.abs(dy)?[horizontal,vertical]:[vertical,horizontal])if(Math.hypot(candidate.x-p.x,candidate.y-p.y)>1e-9&&allowed(p,candidate)){next=candidate;break;}
  if(!next||Math.hypot(next.x-p.x,next.y-p.y)<1e-9)break;
  append(next);p=next;
 }
 return path;
}
