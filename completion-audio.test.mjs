import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {completionSamples} from './completion-audio.mjs';
test('completion is exactly the two-note bell, without a noise layer or clipping',()=>{
 const rate=44100,mix=completionSamples(rate);assert.equal(mix.length,Math.ceil(rate*.52));let peak=0;
 for(let i=0;i<mix.length;i++){const t=i/rate,u=Math.max(0,t-.075),tail=Math.min(1,(.52-t)/.08),first=Math.min(1,t/.008)*Math.exp(-t*16)*.32*(Math.sin(2*Math.PI*880*t)+.18*Math.sin(2*Math.PI*1760*t)),second=t>=.075?Math.min(1,u/.008)*Math.exp(-u*13)*.25*(Math.sin(2*Math.PI*1320*u)+.12*Math.sin(2*Math.PI*2640*u)):0;assert.ok(Math.abs(mix[i]-(first+second)*tail)<1e-6);peak=Math.max(peak,Math.abs(mix[i]));}
 assert.ok(peak>.2&&peak<.8);assert.equal(mix[0],0);assert.ok(Math.abs(mix.at(-1))<1e-4);assert.deepEqual(completionSamples(rate),mix);assert.throws(()=>completionSamples(0));
});
test('HUD always calls the active/released face current, and completion uses the louder bell-only audio',()=>{
 const app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
 assert.ok(app.includes('현재 칸 · ${summary.regionNumber}번'));assert.doesNotMatch(app,/stage\.strokeOwner\?'현재':'마지막'/);
 assert.ok(app.includes('completionSamples(audio.sampleRate)'));assert.ok(app.includes('gain.gain.value=.8'));
});
