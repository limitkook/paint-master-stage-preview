import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Stage} from './model.mjs';
import {progressSummary} from './hud.mjs';
const level={width:100,height:2,palette:[{number:1,color:'#aa4444'}],regions:[{id:'a',paletteNumber:1,area:100},{id:'b',paletteNumber:1,area:100}],ownerRuns:[1,100,2,100]};
test('clear waits for every owner97% snap, then persists and reset hides it',()=>{
 const s=new Stage(level,{tinyRemainderPixels:0}),clear=()=>progressSummary(s,1).stageCleared;
 assert.equal(clear(),false);s.beginCell(0,1);for(let i=0;i<97;i++)s.paintCell(i);assert.equal(s.doneCount,1);assert.equal(clear(),false);s.endStroke();
 s.beginCell(100,1);for(let i=100;i<196;i++)s.paintCell(i);assert.equal(clear(),false);s.endStroke(true);assert.equal(clear(),false,'cancel below97% cannot clear');
 s.beginCell(196,1);s.paintCell(196);assert.equal(clear(),true,'last face97% clears while still held');assert.equal(s.endStroke(),0);assert.equal(clear(),true);
 s.reset();assert.equal(clear(),false);
});
test('web clear status is bound to completion, not rounded area',()=>{
 const html=readFileSync(new URL('./index.html',import.meta.url),'utf8'),app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
 assert.match(html,/<div id="clear-banner"[^>]*hidden[^>]*>클리어!<\/div>/);
 assert.match(app,/\$\('clear-banner'\)\.hidden\s*=\s*!summary\.stageCleared/);
});
