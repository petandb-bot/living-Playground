import {makeScene,validateScene,snapshot,mutate,eventsAtStep,addChip,toggleLink,clamp,WIDTH,HEIGHT} from './music.js';
import {AudioWorld} from './audio.js';
import {BugWorld,drawWorld,hitChip,CHIP_W,CHIP_H} from './visuals.js';

const el=id=>document.getElementById(id),STORAGE='living-playground.scene.v1';
function restore(){try{const saved=localStorage.getItem(STORAGE);return saved?validateScene(JSON.parse(saved))||makeScene():makeScene();}catch{return makeScene();}}
let scene=restore(),selected=scene.chips.find(c=>c.type==='CHIRP')?.id||scene.chips[0].id;
const engine=new AudioWorld(),bug=new BugWorld(scene.seed^7354);
const canvas=el('stage'),message=el('message');
const activities=Object.create(null),lastHits=Object.create(null),pending=[],undoStack=[];
let playing=false,clock=null,step=0,cycle=0,nextStepTime=0,linkMode=false,linkSource=null,gesture=null,inspectorChip=null,sliderUndo=false;
let lastFrame=performance.now(),displayTime=0,noticeUntil=0;

function announce(text,seconds=2.6){message.textContent=text;noticeUntil=performance.now()+seconds*1000;}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(scene));}catch{announce('STORAGE UNAVAILABLE — current session only',5);}}
function remember(){undoStack.push(snapshot(scene));if(undoStack.length>24)undoStack.shift();}
function signal(chip,time,kind='hit'){
 pending.push({id:chip.id,time,kind});
 // bounded to avoid retaining thousands of particles in a long background tab
 if(pending.length>90)pending.splice(0,pending.length-90);
}
function incomingPressure(chip,atTime){
 const links=scene.links.filter(l=>l.to===chip.id&&scene.chips.find(c=>c.id===l.from)?.type!=='TICK');
 let value=0;
 for(const l of links){
  const since=atTime-lastHits[l.from];
  if(Number.isFinite(since)&&since>=0&&since<3)value=Math.max(value,Math.exp(-since*1.2)*.67);
 }
 return value;
}
function playChip(chip,velocity=.84,pitch=0,when){
 if(!chip)return;
 const t=when??engine.now()+.014,pressure=incomingPressure(chip,t);
 engine.tone(chip.type,t,velocity,chip.params,pitch,pressure);
 lastHits[chip.id]=t;signal(chip,t);
}
async function tapChip(chip,velocity=.84){
 try{await engine.init();playChip(chip,velocity,chip.type==='CHIRP'?4+Math.round((chip.params[0]-.5)*8):0);}
 catch(e){announce('AUDIO UNAVAILABLE — '+(e?.message||'check browser'),5);}
}
function planStep(t){
 const tickChips=scene.chips.filter(c=>c.type==='TICK');
 for(const tick of tickChips){
  if(step%4===0){engine.tone('TICK',t,.22,tick.params);signal(tick,t);}
 }
 for(const ev of eventsAtStep(scene,step,cycle)){
  const chip=scene.chips.find(c=>c.id===ev.id);if(!chip)continue;
  // Short relationship memory, not continuous audio-rate modulation or feedback.
  const pressure=incomingPressure(chip,t),pitch=ev.pitch+ev.shift*5+Math.round((chip.params[0]-.5)*5);
  engine.tone(chip.type,t,ev.velocity,chip.params,pitch,pressure);
  lastHits[chip.id]=t;signal(chip,t);
 }
}
function schedule(){
 if(!playing||!engine.ctx||engine.ctx.state!=='running')return;
 let guard=0;while(nextStepTime<engine.now()+.12&&guard++<16){
  // Swing is a delay on alternating 16th notes; base pulse continues unchanged.
  const tick=scene.chips.find(c=>c.type==='TICK');
  const swing=(tick?.params?.[1]||0)*.24;
  planStep(nextStepTime+(step%2?swing*(60/scene.tempo/4):0));
  nextStepTime+=60/scene.tempo/4;
  step=(step+1)%16;if(step===0)cycle++;
 }
}
function updateTransport(){
 el('play').textContent=playing?'■ STOP':'▶ PLAY';
 el('play').setAttribute('aria-pressed',String(playing));
 el('status').textContent=playing?'PLAYING · 16 STEP WORLD':'READY · PLAY OR TAP A CHIP';
 el('tempo-readout').textContent=String(scene.tempo).padStart(3,'0')+' BPM';
}
async function toggleTransport(){
 if(playing){playing=false;clearInterval(clock);clock=null;updateTransport();announce('PAUSED — touch chips to play');return;}
 try{await engine.init();}catch(e){announce('AUDIO NOT AVAILABLE: '+(e?.message||'unknown'),5);return;}
 playing=true;step=0;cycle=0;nextStepTime=engine.now()+.065;
 schedule();clock=setInterval(schedule,25);updateTransport();announce('PLAYFIELD ALIVE');
}
function changeScene(f){remember();f();persist();refresh();}
function refresh(){
 const selectedChip=scene.chips.find(c=>c.id===selected);
 if(!selectedChip)selected=scene.chips[0].id;
 updateTransport();el('undo').disabled=!undoStack.length;
 el('mutate').disabled=!scene.links.length;
 el('add').disabled=scene.chips.length>=4;
 el('link').setAttribute('aria-pressed',String(linkMode));
 el('link').classList.toggle('lit',linkMode);
 updateChipList();updateInspector();
}
function updateChipList(){
 const row=el('chip-list');row.replaceChildren();
 for(const chip of scene.chips){
  const b=document.createElement('button');b.type='button';b.className='chip-selector'+(chip.id===selected?' chosen':'');
  b.textContent=chip.type;b.setAttribute('aria-label',`Play and select ${chip.type}`);
  b.onclick=()=>{
   if(linkMode){tapStageChip(chip);return;}
   selected=chip.id;refresh();void tapChip(chip);
  };row.append(b);
 }
}
function updateInspector(){
 const chip=scene.chips.find(c=>c.id===selected);if(!chip)return;
 const labels=chip.type==='TICK'?['DENSITY','SWING']:chip.type==='THUMP'?['FORCE','HOLLOW']:['TUNE','BEND'];
 if(inspectorChip!==chip.id){
  inspectorChip=chip.id;
  el('inspector-type').textContent=chip.type;
  for(let i=0;i<2;i++){
   el('param-label-'+i).textContent=labels[i];
   el('param-'+i).value=String(Math.round(chip.params[i]*100));
   el('param-value-'+i).textContent=String(Math.round(chip.params[i]*100)).padStart(2,'0');
  }
 }else{
  for(let i=0;i<2;i++){
   el('param-'+i).value=String(Math.round(chip.params[i]*100));
   el('param-value-'+i).textContent=String(Math.round(chip.params[i]*100)).padStart(2,'0');
  }
 }
}
function tapStageChip(chip){
 if(linkMode){
  if(linkSource===null){linkSource=chip.id;selected=chip.id;announce('SELECT TARGET CHIP');refresh();return;}
  if(linkSource===chip.id){linkSource=null;announce('SELECT SOURCE CHIP');refresh();return;}
  const from=scene.chips.find(c=>c.id===linkSource),result=from&&{...toggleLink(snapshot(scene),from.id,chip.id)};
  if(!result?.changed){announce(result?.reason||'THAT RELATIONSHIP IS NOT SUPPORTED');return;}
  changeScene(()=>toggleLink(scene,linkSource,chip.id));
  linkMode=false;linkSource=null;selected=chip.id;
  announce(result.added?`${from.type} → ${chip.type} LINKED`:`${from.type} → ${chip.type} REMOVED`);
  refresh();return;
 }
 selected=chip.id;refresh();void tapChip(chip);
}
function eventPoint(e){const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)/rect.width*WIDTH,y:(e.clientY-rect.top)/rect.height*HEIGHT};}
function bugNear(p){return Math.hypot(p.x-bug.x,p.y-bug.y)<13;}
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 e.preventDefault();const p=eventPoint(e);
 if(!linkMode&&bugNear(p)){
  gesture={kind:'bug',pointer:e.pointerId,moved:false,start:p};bug.dragging=true;
 }else{
  const hit=hitChip(scene,p.x,p.y);
  if(hit){
   if(hit.handle&&!linkMode){gesture={kind:'chip',pointer:e.pointerId,id:hit.chip.id,start:p,from:{x:hit.chip.x,y:hit.chip.y},moved:false,saved:false};selected=hit.chip.id;refresh();}
   else tapStageChip(hit.chip);
  }else if(linkMode){linkSource=null;announce('SELECT SOURCE CHIP');}
 }
 if(gesture){canvas.setPointerCapture(e.pointerId);}
});
canvas.addEventListener('pointermove',e=>{
 if(!gesture||gesture.pointer!==e.pointerId)return;
 const p=eventPoint(e);
 if(Math.hypot(p.x-gesture.start.x,p.y-gesture.start.y)>2.5)gesture.moved=true;
 if(gesture.kind==='bug')bug.position(p.x,p.y);
 if(gesture.kind==='chip'&&gesture.moved){
  if(!gesture.saved){remember();gesture.saved=true;}
  const chip=scene.chips.find(c=>c.id===gesture.id);
  if(chip){chip.x=clamp(gesture.from.x+p.x-gesture.start.x,5,WIDTH-CHIP_W-5);
   chip.y=clamp(gesture.from.y+p.y-gesture.start.y,24,HEIGHT-CHIP_H-19);}
 }
});
function release(e){
 if(!gesture||gesture.pointer!==e.pointerId)return;
 if(gesture.kind==='bug'){
  bug.dragging=false;const p=eventPoint(e);
  const hit=hitChip(scene,p.x,p.y);
  if(hit?.chip&&gesture.moved){
   const type=hit.chip.type;
   if(type==='TICK'){announce('BUG VISITS THE CLOCK');void tapChip(hit.chip,.32);}
   else{announce('BUG KNOCKS ON '+type);void tapChip(hit.chip,.7);}
   bug.hear(type);
  }
 }else if(gesture.kind==='chip'&&gesture.saved){persist();refresh();announce('CHIP MOVED');}
 gesture=null;
}
for(const eventName of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(eventName,release);
for(let i=0;i<2;i++){
 const input=el('param-'+i);
 input.addEventListener('input',()=>{
  const chip=scene.chips.find(c=>c.id===selected);if(!chip)return;
  if(!sliderUndo){remember();sliderUndo=true;}
  chip.params[i]=clamp(Number(input.value)/100,0,1);
  el('param-value-'+i).textContent=input.value.padStart(2,'0');
  persist();
 });
 input.addEventListener('change',()=>{sliderUndo=false;refresh();});
}
el('play').addEventListener('click',()=>void toggleTransport());
el('link').addEventListener('click',()=>{linkMode=!linkMode;linkSource=null;announce(linkMode?'SELECT SOURCE CHIP — THEN TARGET':'LINK MODE CLOSED');refresh();});
el('new').addEventListener('click',()=>changeScene(()=>{
 const value=crypto.getRandomValues(new Uint32Array(1))[0];scene.seed=value;scene.mutation=0;announce('NEW MOTIF — LINKS KEPT');
}));
el('mutate').addEventListener('click',()=>changeScene(()=>{mutate(scene);announce('MOTIF MUTATED — THE BEAT REMAINS');}));
el('undo').addEventListener('click',()=>{
 const restored=undoStack.pop();if(!restored)return;
 scene=restored;inspectorChip=null;selected=scene.chips.find(c=>c.id===selected)?.id||scene.chips[0].id;persist();refresh();announce('ONE STEP BACK');
});
el('add').addEventListener('click',()=>{el('add-menu').hidden=!el('add-menu').hidden;});
for(const b of document.querySelectorAll('[data-add]'))b.addEventListener('click',()=>{
 const type=b.dataset.add;changeScene(()=>{const chip=addChip(scene,type);if(chip){selected=chip.id;inspectorChip=null;announce(`${type} ENTERS THE PLAYFIELD — LINK IT TO TICK`);} });
 el('add-menu').hidden=true;
});
for(const [id,offset] of [['tempo-down',-2],['tempo-up',2]])el(id).addEventListener('click',()=>changeScene(()=>{scene.tempo=clamp(scene.tempo+offset,70,160);announce('TEMPO '+scene.tempo);}));
el('help').addEventListener('click',()=>{el('help-panel').hidden=!el('help-panel').hidden;});
el('help-close').addEventListener('click',()=>{el('help-panel').hidden=true;});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){linkMode=false;linkSource=null;el('add-menu').hidden=true;el('help-panel').hidden=true;refresh();}
 // Space only controls transport when not in a form or button.
 if(e.code==='Space'&&!e.repeat&&!(e.target instanceof HTMLElement&&e.target.closest('button,input,select,textarea,summary'))){e.preventDefault();void toggleTransport();}
});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden&&playing){playing=false;clearInterval(clock);clock=null;updateTransport();announce('PAUSED — RETURN AND PRESS PLAY');}
});

function frame(ms){
 const dt=Math.min(.055,Math.max(0,(ms-lastFrame)/1000));lastFrame=ms;displayTime+=dt;
 const now=engine.now();
 while(pending.length&&pending[0].time<=now+.008){
  const ev=pending.shift();activities[ev.id]=1;bug.hear(ev.id);
 }
 for(const id of Object.keys(activities))activities[id]=Math.max(0,activities[id]-dt*2.5);
 bug.move(dt,scene);
 drawWorld(canvas,scene,{time:displayTime,step:(step+15)%16,playing,selected,activity:activities,bug,linkingFrom:linkSource});
 if(ms>noticeUntil&&message.textContent!=='TAP A CHIP, MAKE A CONNECTION')message.textContent='TAP A CHIP, MAKE A CONNECTION';
 requestAnimationFrame(frame);
}
refresh();requestAnimationFrame(frame);
