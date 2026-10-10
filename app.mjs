import {Stage} from './model.mjs';
import {CompletionMask} from './mask.mjs';
import {loadStageAssets} from './assets.mjs';
import {BRUSH_RADIUS_SOURCE,MIN_NUMBER_ZOOM,MIN_NUMBER_CLEARANCE,labelVisible} from './presentation.mjs';
const $=id=>document.getElementById(id),canvas=$('board'),ctx=canvas.getContext('2d');
let stage,level,sourcePixels,bitmap,bitmapCtx,paintImage,guide,selected=1,zoom=1,pan={x:0,y:0},vw=0,vh=0,fitScale=1,shown=0,hints=5,audio,flash=null,shine,shineCtx,dirty=true;
let completionCanvas,completionCtx,completionMask,completionImage;
const pointers=new Map();let gesture=null,stroke=null,mode=null,toastTimer;let brushNoise=null,brushStopTimer,noiseBuffer;const paletteTimers=[];
function brushRadius(){return BRUSH_RADIUS_SOURCE/Math.sqrt(Math.max(1,zoom));}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),1600);}
function view(){const scale=fitScale*zoom;return {scale,x:(vw-level.width*scale)/2+pan.x,y:(vh-level.height*scale)/2+pan.y};}
function point(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
function sourcePoint(p){const v=view();return {x:(p.x-v.x)/v.scale,y:(p.y-v.y)/v.scale};}
function indexAt(p){const q=sourcePoint(p),x=Math.floor(q.x),y=Math.floor(q.y);return x<0||y<0||x>=stage.width||y>=stage.height?-1:y*stage.width+x;}
function select(number){stopBrushSound();if(stage)stage.endStroke(true);selected=number;for(const b of $('palette').children)b.classList.toggle('selected',Number(b.dataset.number)===selected);dirty=true;}
function resize(){const r=canvas.getBoundingClientRect();vw=r.width;vh=r.height;const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(vw*dpr);canvas.height=Math.round(vh*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(level)fitScale=Math.min(vw/level.width,vh/level.height)*.94;dirty=true;}
function maximumZoom(){return Math.max(12,...stage.regions.map(r=>12/Math.max(.5,r.labelRadius)/fitScale*1.05));}
function zoomAt(value,p={x:vw/2,y:vh/2}){stopBrushSound();if(stage)stage.endStroke(true);const before=sourcePoint(p);zoom=Math.max(.75,Math.min(maximumZoom(),value));const v=view();pan.x+=p.x-(v.x+before.x*v.scale);pan.y+=p.y-(v.y+before.y*v.scale);dirty=true;}
function fit(){stopBrushSound();zoom=1;pan={x:0,y:0};dirty=true;}
function unlockSound(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{audio=null;}}
function sound(){if(!audio)return;const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(660,t);o.frequency.exponentialRampToValueAtTime(1040,t+.09);g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.0001,t+.17);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.18);}
function stopBrushSound(){clearTimeout(brushStopTimer);if(!brushNoise)return;const {source,gain,filter}=brushNoise;brushNoise=null;gain.gain.cancelScheduledValues(audio.currentTime);gain.gain.setTargetAtTime(0,audio.currentTime,.01);source.stop(audio.currentTime+.05);source.onended=()=>{source.disconnect();gain.disconnect();filter.disconnect();};}
function brushSound(){if(!audio||audio.state!=='running')return;clearTimeout(brushStopTimer);if(!brushNoise){noiseBuffer??=audio.createBuffer(1,Math.round(audio.sampleRate*.32),audio.sampleRate);const samples=noiseBuffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/samples.length);const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();source.buffer=noiseBuffer;source.loop=true;filter.type='lowpass';filter.frequency.value=1800;gain.gain.value=.025;source.connect(filter);filter.connect(gain);gain.connect(audio.destination);source.start();brushNoise={source,gain,filter};}brushStopTimer=setTimeout(stopBrushSound,160);}
function colourSound(){if(!audio)return;[784,988,1319].forEach((hz,i)=>{const t=audio.currentTime+i*.09,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.26);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.27);o.onended=()=>{o.disconnect();g.disconnect();};});}
function completion(id){sound();$('progress').classList.remove('pulse');void $('progress').offsetWidth;$('progress').classList.add('pulse');
 completionMask.use(id);completionCtx.putImageData(completionImage,0,0);flash={mask:completionCanvas,time:performance.now()};
 for(const p of stage.palette){const all=stage.regions.every((r,i)=>r.paletteNumber!==p.number||stage.done[i+1]),b=$('palette').querySelector(`[data-number="${p.number}"]`);b.disabled=all;if(all&&!b.classList.contains('completed')){b.textContent='✓';b.classList.add('completed');colourSound();paletteTimers.push(setTimeout(()=>{b.hidden=true;},720));}}
 if(stage.doneCount===stage.regions.length)toast(`완성! ${stage.regions.length}칸 · 100%`);dirty=true;
}
function begin(p){const i=indexAt(p);if(stage.beginCell(i,selected)){const q=sourcePoint(p);stage.circle(q.x,q.y,brushRadius());brushSound();dirty=true;}return sourcePoint(p);}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(!stage)return;e.preventDefault();unlockSound();canvas.setPointerCapture(e.pointerId);const p=point(e);pointers.set(e.pointerId,p);
 if(pointers.size>1){stopBrushSound();stage.endStroke(true);stroke=null;mode='navigation';const [a,b]=[...pointers.values()];gesture={mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:Math.hypot(a.x-b.x,a.y-b.y)};}
 else if(e.button===2){mode='pan';stroke={last:p};}
 else{mode='paint';stroke={start:p,last:p,painting:false};if(e.pointerType==='mouse'){stroke.source=begin(p);stroke.painting=true;}}
});
canvas.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!stage)return;const p=point(e);pointers.set(e.pointerId,p);
 if(pointers.size>1){const [a,b]=[...pointers.values()],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance=Math.hypot(a.x-b.x,a.y-b.y);if(gesture){zoomAt(zoom*distance/Math.max(1,gesture.distance),gesture.mid);pan.x+=mid.x-gesture.mid.x;pan.y+=mid.y-gesture.mid.y;}gesture={mid,distance};dirty=true;return;}
 if(mode==='pan'&&stroke){pan.x+=p.x-stroke.last.x;pan.y+=p.y-stroke.last.y;stroke.last=p;dirty=true;}
 if(mode==='paint'&&stroke){if(!stroke.painting&&Math.hypot(p.x-stroke.start.x,p.y-stroke.start.y)>=4){stroke.source=begin(stroke.start);stroke.painting=true;}
  if(stroke.painting){const q=sourcePoint(p);const before=stage.paintedCount;stage.segment(stroke.source,q,brushRadius());if(stage.paintedCount>before)brushSound();stroke.source=q;dirty=true;}stroke.last=p;}
});
function pointerEnd(e,cancel){if(!pointers.has(e.pointerId))return;stopBrushSound();
 if(pointers.size===1&&mode==='paint'&&stroke){if(!cancel&&!stroke.painting)begin(point(e));const id=stage.endStroke(cancel);if(id)completion(id);}
 else stage.endStroke(true);stopBrushSound();pointers.delete(e.pointerId);gesture=null;stroke=null;if(!pointers.size)mode=null;else mode='navigation';dirty=true;
}
canvas.addEventListener('pointerup',e=>pointerEnd(e,false));canvas.addEventListener('pointercancel',e=>pointerEnd(e,true));
canvas.addEventListener('wheel',e=>{if(!stage)return;e.preventDefault();stopBrushSound();stage.endStroke(true);mode='navigation';zoomAt(zoom*Math.exp(-e.deltaY*.0015),point(e));},{passive:false});
window.addEventListener('blur',()=>{stopBrushSound();if(stage)stage.endStroke(true);pointers.clear();mode=null;stroke=null;gesture=null;});
$('fit').onclick=()=>{if(stage){stage.endStroke(true);fit();}};$('plus').onclick=()=>{if(stage)zoomAt(zoom*1.4);};$('minus').onclick=()=>{if(stage)zoomAt(zoom/1.4);};
function reset(){stopBrushSound();for(const timer of paletteTimers)clearTimeout(timer);paletteTimers.length=0;stage.reset();paintImage.data.fill(0);bitmapCtx.clearRect(0,0,bitmap.width,bitmap.height);shown=0;flash=null;hints=5;$('hint').textContent='힌트 5';$('hint').disabled=false;for(const b of $('palette').children){b.disabled=false;b.hidden=false;b.classList.remove('completed');b.textContent=b.dataset.number;}pointers.clear();stroke=null;mode=null;select(1);fit();$('progress').classList.remove('pulse');dirty=true;}
$('reset').onclick=()=>{if(stage&&(!stage.paintedCount||confirm('이 스테이지의 색칠을 초기화할까요?')))reset();};
$('hint').onclick=()=>{if(!stage||hints<=0)return;const id=stage.regions.findIndex((r,i)=>!stage.done[i+1]&&r.paletteNumber===selected)+1||stage.regions.findIndex((r,i)=>!stage.done[i+1])+1;if(!id)return;const r=stage.regions[id-1];select(r.paletteNumber);zoom=Math.min(maximumZoom(),Math.max(MIN_NUMBER_ZOOM*1.1,MIN_NUMBER_CLEARANCE/Math.max(.5,r.labelRadius)/fitScale*1.1));pan={x:(stage.width/2-r.labelX)*fitScale*zoom,y:(stage.height/2-r.labelY)*fitScale*zoom};hints--;$('hint').textContent=`힌트 ${hints}`;$('hint').disabled=!hints;toast('표시된 번호의 칸을 칠해보세요');dirty=true;};
function frame(now){requestAnimationFrame(frame);if(!stage)return;const changes=stage.drainChanges();if(changes.length){for(const i of changes){const q=i*4;paintImage.data[q]=sourcePixels[q];paintImage.data[q+1]=sourcePixels[q+1];paintImage.data[q+2]=sourcePixels[q+2];paintImage.data[q+3]=255;}bitmapCtx.putImageData(paintImage,0,0);dirty=true;}
 const target=stage.paintedCount/stage.total*100;if(Math.abs(target-shown)>.001){shown+=(target-shown)*.18;dirty=true;}else shown=target;
 $('fill').style.clipPath=`inset(0 ${100-shown}% 0 0)`;$('percent').textContent=stage.doneCount===stage.regions.length?'100%':`${shown.toFixed(1)}%`;$('progress').setAttribute('aria-valuenow',shown.toFixed(1));
 if(flash&&now-flash.time>600){flash=null;dirty=true;}if(flash)dirty=true;if(!dirty)return;dirty=false;
 ctx.clearRect(0,0,vw,vh);const v=view();ctx.save();ctx.translate(v.x,v.y);ctx.scale(v.scale,v.scale);ctx.fillStyle='#dce6ef';ctx.fillRect(0,0,stage.width,stage.height);ctx.drawImage(bitmap,0,0);ctx.drawImage(guide,0,0);
 if(flash){const t=(now-flash.time)/600,sc=shineCtx;sc.globalCompositeOperation='source-over';sc.clearRect(0,0,stage.width,stage.height);sc.drawImage(flash.mask,0,0);sc.globalCompositeOperation='source-in';const x=(t*2-.5)*stage.width,g=sc.createLinearGradient(x-120,0,x+120,240);g.addColorStop(0,'#fff0');g.addColorStop(.5,'#ffffff99');g.addColorStop(1,'#fff0');sc.fillStyle=g;sc.fillRect(0,0,stage.width,stage.height);ctx.drawImage(shine,0,0);}
 ctx.font=`600 ${11/v.scale}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=2.5/v.scale;ctx.strokeStyle='white';ctx.fillStyle='#151a1c';
 if(zoom>=MIN_NUMBER_ZOOM)for(let i=0;i<stage.regions.length;i++){const r=stage.regions[i];if(stage.done[i+1]||!labelVisible(r,zoom,v.scale))continue;const x=v.x+r.labelX*v.scale,y=v.y+r.labelY*v.scale;if(x<-15||x>vw+15||y<-15||y>vh+15)continue;ctx.strokeText(String(r.paletteNumber),r.labelX,r.labelY);ctx.fillText(String(r.paletteNumber),r.labelX,r.labelY);}
 ctx.restore();
}
async function image(bytes){const im=new Image(),url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));try{im.src=url;await im.decode();return im;}finally{URL.revokeObjectURL(url);}}
async function init(){const assets=await loadStageAssets();level=assets.level;stage=new Stage(level);if(stage.regions.length>1500)throw Error('너무 큰 스테이지 데이터');$('stage-meta').textContent=`정원 · ${stage.regions.length}칸 / ${stage.palette.length}색 · 웹 체험판`;const [source,g]=await Promise.all([image(assets.sourceBytes),image(assets.guideBytes)]);guide=g;if(source.width!==stage.width||source.height!==stage.height||g.width!==stage.width||g.height!==stage.height)throw Error('이미지 크기 불일치');bitmap=document.createElement('canvas');bitmap.width=stage.width;bitmap.height=stage.height;bitmapCtx=bitmap.getContext('2d');bitmapCtx.drawImage(source,0,0);sourcePixels=bitmapCtx.getImageData(0,0,stage.width,stage.height).data;bitmapCtx.clearRect(0,0,stage.width,stage.height);paintImage=bitmapCtx.createImageData(stage.width,stage.height);shine=document.createElement('canvas');shine.width=stage.width;shine.height=stage.height;shineCtx=shine.getContext('2d');completionCanvas=document.createElement('canvas');completionCanvas.width=stage.width;completionCanvas.height=stage.height;completionCtx=completionCanvas.getContext('2d');completionMask=new CompletionMask(stage.width,stage.height,stage.runs);completionImage=new ImageData(completionMask.data,stage.width,stage.height);
 for(const p of stage.palette){const b=document.createElement('button');b.textContent=p.number;b.style.backgroundColor=p.color;b.dataset.number=p.number;b.setAttribute('aria-label',`색 ${p.number}`);b.onclick=()=>{unlockSound();select(p.number);};$('palette').append(b);}select(1);new ResizeObserver(resize).observe(canvas);resize();$('loading').hidden=true;
 window.paintStage={model:stage,level,get zoom(){return zoom;},select,fit,sourcePoint,manifest:assets.manifest,renderAudit(){let mismatches=0;for(let i=0;i<stage.painted.length;i++)if(Boolean(paintImage.data[i*4+3])!==Boolean(stage.painted[i]))mismatches++;return {mismatches,painted:stage.paintedCount};},pointForCell(i){const v=view(),r=canvas.getBoundingClientRect();return {x:r.left+v.x+(i%stage.width+.5)*v.scale,y:r.top+v.y+(Math.floor(i/stage.width)+.5)*v.scale};}};
 requestAnimationFrame(frame);
}
init().catch(error=>{$('loading').textContent='불러오기 실패: '+error.message;console.error(error);});
