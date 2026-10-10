// Original procedural SFX: brighter two-note bell + filtered glass-wipe shaaak.
// No recording, external samples, dependency, or network request.
export function completionSamples(rate,layer='mix'){
 if(!Number.isFinite(rate)||rate<16000||rate>192000||!['mix','bell','wipe'].includes(layer))throw new RangeError('Invalid completion audio configuration');
 const duration=.52,samples=new Float32Array(Math.ceil(rate*duration));let state=17,low=0,band=0;
 for(let i=0;i<samples.length;i++){
  const t=i/rate,u=Math.max(0,t-.075),tail=Math.min(1,(duration-t)/.08);
  const first=Math.min(1,t/.008)*Math.exp(-t*16)*.32*(Math.sin(2*Math.PI*880*t)+.18*Math.sin(2*Math.PI*1760*t));
  const second=t>=.075?Math.min(1,u/.008)*Math.exp(-u*13)*.25*(Math.sin(2*Math.PI*1320*u)+.12*Math.sin(2*Math.PI*2640*u)):0;
  state=(state*1664525+1013904223)>>>0;const raw=state/4294967296*2-1,p=Math.min(1,t/.4);
  low+=(1-Math.exp(-2*Math.PI*(1200+1200*p)/rate))*(raw-low);
  band+=(1-Math.exp(-2*Math.PI*(6200-2000*p)/rate))*((raw-low)-band);
  const envelope=t<.4?Math.sin(Math.PI*p)**1.2:0;
  const bell=(first+second)*tail,wipe=(band*.16+.018*Math.sin(2*Math.PI*3100*t))*envelope*tail;
  samples[i]=layer==='bell'?bell:layer==='wipe'?wipe:bell+wipe;
 }
 return samples;
}
