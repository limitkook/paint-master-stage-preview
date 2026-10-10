import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
const start=app.indexOf('const badges=[];');
const end=app.indexOf('\n ctx.restore();',start);
assert.ok(start>=0&&end>start,'actual canvas label renderer exists');
function render(selected,pickedOwner=0,hintedOwner=0){
 const commands=[],ctx={fillStyle:'#151a1c',strokeStyle:'white',save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fillRect(...args){commands.push(['rectangle',this.fillStyle,...args]);},strokeText(...args){commands.push(['outline',this.strokeStyle,...args]);},fillText(...args){commands.push(['number',this.fillStyle,...args]);}};
 const env={ctx,stage:{regions:[{paletteNumber:1,labelX:100,labelY:100},{paletteNumber:2,labelX:200,labelY:100}],done:[0,0,0]},selected,pickedOwner,hintedOwner,pickedUntil:100,now:0,debugNumbers:false,zoom:3,MIN_NUMBER_ZOOM:2,labelVisible:()=>false,v:{x:0,y:0,scale:1},vw:500,vh:500};
 vm.runInNewContext(app.slice(start,end),env);
 return commands;
}
test('choosing a palette number cannot add different coloured board numbers',()=>{
 assert.deepEqual(render(1),render(2));
});
