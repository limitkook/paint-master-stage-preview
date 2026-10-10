import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {completionSamples} from './completion-audio.mjs';
test('completion mixes a bell and short filtered wiping layer without clipping',()=>{
 const rate=44100,mix=completionSamples(rate),bell=completionSamples(rate,'bell'),wipe=completionSamples(rate,'wipe');
 assert.equal(mix.length,Math.ceil(rate*.52));let peak=0,energyBell=0,energyWipe=0;
 for(let i=0;i<mix.length;i++){assert.ok(Number.isFinite(mix[i]));assert.ok(Math.abs(mix[i]-bell[i]-wipe[i])<1e-6);peak=Math.max(peak,Math.abs(mix[i]));energyBell+=bell[i]**2;energyWipe+=wipe[i]**2;}
 assert.ok(peak>.2&&peak<.8);assert.ok(energyBell>1&&energyWipe>1);assert.equal(mix[0],0);assert.ok(Math.abs(mix.at(-1))<1e-4);
 assert.deepEqual(completionSamples(rate),mix);assert.throws(()=>completionSamples(0));
});
test('HUD always calls the active/released face current, and completion uses the louder layered audio',()=>{
 const app=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
 assert.ok(app.includes('현재 칸 · ${summary.regionNumber}번'));assert.doesNotMatch(app,/stage\.strokeOwner\?'현재':'마지막'/);
 assert.ok(app.includes('completionSamples(audio.sampleRate)'));assert.ok(app.includes('gain.gain.value=.8'));
});
