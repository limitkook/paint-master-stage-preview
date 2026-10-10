import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Stage} from './model.mjs';
import {progressSummary} from './hud.mjs';
const level={width:100,height:2,palette:[{number:1,color:'#aa4444'}],regions:[{id:'a',paletteNumber:1,area:100},{id:'b',paletteNumber:1,area:100}],ownerRuns:[1,100,2,100]};
test('clear waits for every owner release, remains visible, and disappears after reset',()=>{
 const s=new Stage(level),clear=()=>progressSummary(s,1).stageCleared;
 assert.equal(clear(),false);
 assert.equal(s.beginCell(0,1),true);for(let i=0;i<98;i++)s.paintCell(i);assert.equal(clear(),false);assert.equal(s.endStroke(),1);assert.equal(clear(),false);
 assert.equal(s.beginCell(100,1),true);for(let i=100;i<200;i++)s.paintCell(i);assert.equal(s.paintedCount,s.total);assert.equal(clear(),false,'100% painted while held is not clear');
 assert.equal(s.endStroke(true),0);assert.equal(clear(),false,'cancel cannot clear');
 assert.equal(s.beginCell(100,1),true);assert.equal(s.endStroke(),2);assert.equal(clear(),true);assert.equal(clear(),true);
 s.reset();assert.equal(clear(),false);
});
test('web clear status is bound to completion, not rounded area',()=>{
 const html=readFileSync(new URL('./index.html',import.meta.url),'utf8'),app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
 assert.match(html,/<div id="clear-banner"[^>]*hidden[^>]*>클리어!<\/div>/);
 assert.match(app,/\$\('clear-banner'\)\.hidden\s*=\s*!summary\.stageCleared/);
});
