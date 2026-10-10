import test from 'node:test';import assert from 'node:assert/strict';import {Stage} from './model.mjs';
const level={width:10,height:10,palette:[{number:1,color:'#123456'}],regions:[{id:'a',paletteNumber:1,area:100,labelX:2.5,labelY:5.5,labelRadius:3}],ownerRuns:[1,100]};
test('partial release relocates the number into deep unpainted owner pixels, not during the stroke',()=>{
 const s=new Stage(level);assert.equal(typeof s.labelPosition,'function');const original=s.labelPosition(1);assert.ok(s.beginCell(0,1));
 for(let y=0;y<10;y++)for(let x=0;x<5;x++)s.paintCell(y*10+x);
 assert.equal(s.labelPosition(1),original);assert.equal(s.endStroke(),0);const moved=s.labelPosition(1),cell=Math.floor(moved.labelY)*10+Math.floor(moved.labelX);
 assert.equal(s.doneCount,0);assert.equal(s.owners[cell],1);assert.equal(s.painted[cell],0);assert.ok(moved.labelX>=6.5&&moved.labelX<=8.5);assert.ok(moved.labelRadius>1);assert.equal(moved.labelMoved,true);
 assert.equal(s.regions[0].labelX,2.5,'geometry metadata stays immutable');s.reset();assert.equal(s.labelPosition(1).labelX,2.5);assert.ok(!s.labelPosition(1).labelMoved);
});
