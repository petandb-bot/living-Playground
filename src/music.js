/** Seeded musical clock and scene logic. No browser or audio dependencies. */
export const CHIP_TYPES = Object.freeze(['THUMP','CHIRP','TICK']);
export const MAX_CHIPS = 4;
export const WIDTH = 480;
export const HEIGHT = 300;

export function clamp(value,min,max){return Math.min(max,Math.max(min,value));}
export function rng(seed){let n=seed>>>0;return()=>{n=(n+0x6d2b79f5)>>>0;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export function makeScene(seed=39173){
 return {
  version:1,seed:seed>>>0,tempo:106,mutation:0,
  chips:[
   {id:'tick-1',type:'TICK',x:175,y:35,params:[.44,.22]},
   {id:'thump-1',type:'THUMP',x:44,y:165,params:[.46,.48]},
   {id:'chirp-1',type:'CHIRP',x:309,y:160,params:[.48,.45]},
  ],
  links:[{from:'tick-1',to:'thump-1'},{from:'tick-1',to:'chirp-1'}]
 };
}
export function validLink(chips,fromId,toId){
 const from=chips.find(c=>c.id===fromId),to=chips.find(c=>c.id===toId);
 if(!from||!to||fromId===toId)return false;
 if(from.type==='TICK')return to.type==='THUMP'||to.type==='CHIRP';
 if(from.type==='THUMP')return to.type==='CHIRP';
 if(from.type==='CHIRP')return to.type==='THUMP';
 return false;
}
export function toggleLink(scene,from,to){
 if(!validLink(scene.chips,from,to))return {changed:false,reason:'Choose TICK → voice or one voice → the other.'};
 const index=scene.links.findIndex(l=>l.from===from&&l.to===to);
 if(index>=0){scene.links.splice(index,1);return {changed:true,added:false};}
 scene.links.push({from,to});return {changed:true,added:true};
}
export function addChip(scene,type){
 if(!CHIP_TYPES.includes(type))return null;
 if(scene.chips.length>=MAX_CHIPS)return null;
 const index=scene.chips.length+1;
 const chip={id:`${type.toLowerCase()}-${index}-${scene.seed%997}`,type,
  x:type==='TICK'?175:184,y:type==='TICK'?114:190,params:type==='TICK'?[.44,.22]:[.48,.48]};
 scene.chips.push(chip);return chip;
}
const MODES=[0,2,3,5,7,9,10];
/** Small repeated pitch vocabulary with irregular movement, not random note salad. */
export function pitchForStep(seed,step,cycle,chipId='chirp-1',variation=0){
 const r=rng((seed^Math.imul(step+1,0x61c88647)^Math.imul(cycle+1,0x9e3779b1)^hash(chipId))>>>0);
 const base=[0,2,4,2,5,4,1,3][Math.floor(step/2)%8];
 const turn=r()<(.13+variation*.30)?(r()<.5?-1:1):0;
 const index=(base+turn+MODES.length)%MODES.length;
 return MODES[index]+(r()<.14?12:0);
}
export function hash(text){let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
/** Return only voice events. Empty steps are part of the instrument. */
export function eventsAtStep(scene,step,cycle){
 const t=step%16,events=[];
 const voices=scene.chips.filter(c=>c.type!=='TICK');
 for(const v of voices){
  const ticks=scene.links.filter(l=>l.to===v.id&&scene.chips.find(c=>c.id===l.from)?.type==='TICK');
  if(!ticks.length)continue;
  const tick=scene.chips.find(c=>c.id===ticks[0].from);
  const density=clamp(tick?.params[0]??.44,0,1), looseness=clamp(tick?.params[1]??.22,0,1);
  const r=rng((scene.seed^hash(v.id)^Math.imul(cycle+1,0x27d4eb2d)^Math.imul(t+1,0x165667b1)^Math.imul(scene.mutation+1,0x85ebca6b))>>>0);
  if(v.type==='THUMP'){
   const anchor=t===0||t===8;
   const offbeat=[5,11,14].includes(t)&&r()<.09+density*.50;
   if(anchor||offbeat)events.push({id:v.id,type:v.type,step:t,velocity:anchor?(t===0?.86:.71):.33+r()*.25,pitch:0,shift:(r()-.5)*looseness*.25});
  }else if(v.type==='CHIRP'){
   const candidate=[3,7,11,14].includes(t);
   // Always preserve at least two stable melodic landmarks.
   const anchor=t===3||t===11;
   const chance=anchor?1:r()<.2+density*.57;
   if(candidate&&chance)events.push({id:v.id,type:v.type,step:t,velocity:.42+r()*.25,
    pitch:pitchForStep(scene.seed,t,cycle,v.id,looseness),shift:(r()-.5)*looseness*.25});
  }
 }
 return events;
}
/** Change the non-anchor material, retaining tempo, routing and pulse landmarks. */
export function mutate(scene){scene.mutation=(scene.mutation+1)>>>0;return scene;}
export function snapshot(scene){return JSON.parse(JSON.stringify(scene));}
export function validateScene(value){
 if(!value||value.version!==1||!Array.isArray(value.chips)||!Array.isArray(value.links))return null;
 if(value.chips.length<1||value.chips.length>MAX_CHIPS||new Set(value.chips.map(c=>c.id)).size!==value.chips.length)return null;
 const chips=[];
 for(const c of value.chips){if(typeof c.id!=='string'||!CHIP_TYPES.includes(c.type)||!Array.isArray(c.params)||c.params.length!==2) return null;
  if(![c.x,c.y,...c.params].every(Number.isFinite))return null;
  chips.push({id:c.id.slice(0,60),type:c.type,x:clamp(c.x,0,WIDTH-106),y:clamp(c.y,0,HEIGHT-72),params:c.params.map(x=>clamp(x,0,1))});
 }
 const links=[];
 for(const l of value.links){if(!validLink(chips,l.from,l.to))return null;
  if(links.some(x=>x.from===l.from&&x.to===l.to))return null;
  links.push({from:l.from,to:l.to});
 }
 if(!Number.isFinite(value.tempo)||!Number.isFinite(value.seed)||!Number.isFinite(value.mutation))return null;
 return {version:1,seed:value.seed>>>0,mutation:value.mutation>>>0,tempo:clamp(value.tempo,70,160),chips,links};
}
