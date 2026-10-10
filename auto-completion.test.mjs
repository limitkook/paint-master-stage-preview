import test from 'node:test';import assert from 'node:assert/strict';import {Stage} from './model.mjs';
const level={width:100,height:2,palette:[{number:1,color:'#123456'}],regions:[{id:'a',paletteNumber:1,area:100,labelX:20,labelY:.5,labelRadius:1},{id:'b',paletteNumber:1,area:100,labelX:20,labelY:1.5,labelRadius:1}],ownerRuns:[1,100,2,100]};
test('95 percent snaps and reports completion while held, then stops that stroke',()=>{
 const s=new Stage(level,{tinyRemainderPixels:0});assert.ok(s.beginCell(0,1));for(let i=0;i<94;i++)s.paintCell(i);assert.equal(s.doneCount,0);
 s.paintCell(94);assert.equal(s.doneCount,1);assert.equal(s.coverage[1],100);assert.equal(s.paintedCount,100);assert.equal(s.strokeOwner,0);
 for(let i=95;i<200;i++)s.paintCell(i);assert.equal(s.paintedCount,100);assert.equal(s.done[2],0);assert.deepEqual(s.drainCompletions(),[1]);assert.deepEqual(s.drainCompletions(),[]);assert.equal(s.endStroke(),0);
 assert.ok(s.beginCell(100,1));for(let i=100;i<195;i++)s.paintCell(i);assert.equal(s.doneCount,2);assert.deepEqual(s.drainCompletions(),[2]);
});
