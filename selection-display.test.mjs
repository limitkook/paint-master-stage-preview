import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
const start=app.indexOf(' for(let i=0;i<stage.regions.length;i++){const r=stage.labelPosition?.(i+1)||stage.regions[i];');
const end=app.indexOf('if(stage.strokeOwner&&stage.virtualPointer)',start);
assert.ok(start>=0&&end>start,'actual canvas label renderer exists');
function render(selected,pickedOwner=0,hintedOwner=0){
 const commands=[],ctx={fillStyle:'#151a1c',strokeStyle:'white',save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fillRect(...args){commands.push(['rectangle',this.fillStyle,...args]);},strokeText(...args){commands.push(['outline',this.strokeStyle,...args]);},fillText(...args){commands.push(['number',this.fillStyle,...args]);}};
 const env={ctx,stage:{regions:[{paletteNumber:1,labelX:100,labelY:100},{paletteNumber:2,labelX:200,labelY:100}],done:[0,0,0]},selected,pickedOwner,hintedOwner,pickedUntil:100,now:0,debugNumbers:false,zoom:3,MIN_NUMBER_ZOOM:2,labelVisible:()=>false,v:{x:0,y:0,scale:1},vw:500,vh:500,maxNumberZoom:100};
 vm.runInNewContext(app.slice(start,end),env);
 return commands;
}

test('wrong-number face requests only the error feedback, not an answer or clicked-owner badge',()=>{
 const begin=app.slice(app.indexOf('function begin(p)'),app.indexOf('canvas.addEventListener',app.indexOf('function begin(p)')));
 const announcements=[],env={hintMotion:null,hintedOwner:0,pickedOwner:0,pickedUntil:0,lastOwner:0,dirty:false,selected:1,indexAt:()=>0,sourcePoint:p=>p,stage:{owners:[1],regions:[{paletteNumber:2}],beginCell:()=>false},consumeCompletions:()=>announcements.push("errorFeedback"),toast:m=>announcements.push(m)};
 vm.runInNewContext(begin+';begin({x:0,y:0});',env);
 assert.deepEqual(announcements,["errorFeedback"]);assert.equal(env.lastOwner,0);assert.equal(env.pickedOwner,0);
});
test('clicking a face cannot add colored number badges',()=>{
 assert.deepEqual(render(1,1),render(1));
});
test('explicit hints retain only plain numbers without colored badges or overlays',()=>{
 const commands=render(1,0,1);assert.ok(commands.some(c=>c[0]==='number'));
 assert.ok(commands.every(c=>c[0]!=='rectangle'&&(c[0]!=='number'||c[1]==='#151a1c')));
 assert.doesNotMatch(app,/ctx\.drawImage\(hintCanvas/);
});

test('choosing a palette number cannot add different coloured board numbers',()=>{
 assert.deepEqual(render(1),render(2));
});
