// Original two-note bell only. Rejected wipe/noise layer removed.
export function completionSamples(rate){
 if(!Number.isFinite(rate)||rate<16000||rate>192000)throw new RangeError('Invalid completion audio configuration');
 const duration=.52,samples=new Float32Array(Math.ceil(rate*duration));
 for(let i=0;i<samples.length;i++){
  const t=i/rate,u=Math.max(0,t-.075),tail=Math.min(1,(duration-t)/.08);
  const first=Math.min(1,t/.008)*Math.exp(-t*16)*.32*(Math.sin(2*Math.PI*880*t)+.18*Math.sin(2*Math.PI*1760*t));
  const second=t>=.075?Math.min(1,u/.008)*Math.exp(-u*13)*.25*(Math.sin(2*Math.PI*1320*u)+.12*Math.sin(2*Math.PI*2640*u)):0;
  samples[i]=(first+second)*tail;
 }
 return samples;
}
