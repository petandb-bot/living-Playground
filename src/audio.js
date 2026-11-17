import {clamp,rng} from './music.js';

const TAU=Math.PI*2;
/** Stateless, testable synthesis parameters; a musical decision precedes Web Audio. */
export function thumpSpec(force=.5,color=.5,pressure=0){
 return {pitch:72+force*75+clamp(pressure,0,1)*28,
  endPitch:38+color*22,duration:.19+color*.24,index:55+color*195,
  level:clamp(.55+force*.4,.2,1)};
}
export function chirpSpec(pitch=0,color=.5,shift=0){
 const semitones=clamp(pitch+shift*4,-12,24);
 return {frequency:165*Math.pow(2,semitones/12),duration:.16+color*.32,
  ratio:1.27+color*2.8,index:38+color*235,level:.38+color*.14,
  semitones};
}
export function wavetable(amount=0){
 const curve=new Float32Array(2049);
 for(let i=0;i<curve.length;i++){
  const x=(i/1024)-1;
  // Preserve a small-signal linear region. Only coincident peaks are folded.
  const a=Math.abs(x);
  curve[i]=Math.sign(x)*(a<.74?a:.74+.18*(1-Math.exp(-(a-.74)/.18)))*(1-amount*.1);
 }
 return curve;
}
function ramp(param,t,start,end,dur){
 param.setValueAtTime(Math.max(.0001,start),t);
 param.exponentialRampToValueAtTime(Math.max(.0001,end),t+Math.max(.01,dur));
}

/** Only audio playback state lives here; never schedule notes from the render frame. */
export class AudioWorld {
 constructor(){this.ctx=null;this.master=null;this.voiceBus=null;this.noise=null;this.echoInput=null;this.active=false;this.pressure=0;this.memory=0;}
 async init(){
  if(!this.ctx){
   const Context=window.AudioContext||window.webkitAudioContext;
   if(!Context)throw Error('Web Audio is not available in this browser.');
   const c=new Context({latencyHint:'interactive'});this.ctx=c;
   const bus=c.createGain();bus.gain.value=.73;this.voiceBus=bus;
   const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=28;hp.Q.value=.707;
   const compressor=c.createDynamicsCompressor();compressor.threshold.value=-14;compressor.knee.value=12;compressor.ratio.value=2.3;compressor.attack.value=.005;compressor.release.value=.16;
   const saturate=c.createWaveShaper();saturate.curve=wavetable();saturate.oversample='2x';
   const out=c.createGain();out.gain.value=.78;this.master=out;
   bus.connect(hp).connect(compressor).connect(saturate).connect(out).connect(c.destination);
   const delay=c.createDelay(.6),feedback=c.createGain(),filter=c.createBiquadFilter(),send=c.createGain();
   delay.delayTime.value=.227;feedback.gain.value=.16;filter.type='lowpass';filter.frequency.value=2500;send.gain.value=.11;
   this.echoInput=send;send.connect(delay);delay.connect(filter);filter.connect(feedback);feedback.connect(delay);filter.connect(bus);
   this.noise=this.makeNoise(c);
  }
  if(this.ctx.state!=='running')await this.ctx.resume();
  this.active=true;
  return this.ctx;
 }
 now(){return this.ctx?.currentTime||0;}
 suspend(){this.active=false;this.ctx?.suspend().catch(()=>{});}
 makeNoise(c){
  const length=Math.ceil(c.sampleRate),buffer=c.createBuffer(1,length,c.sampleRate),data=buffer.getChannelData(0),r=rng(88651);
  for(let i=0;i<length;i++)data[i]=(r()*2-1)*.72;
  return buffer;
 }
 route(node,level=1,echo=0){
  const c=this.ctx,g=c.createGain();g.gain.value=level;node.connect(g);g.connect(this.voiceBus);
  if(echo>0){const send=c.createGain();send.gain.value=echo;g.connect(send);send.connect(this.echoInput);}
 }
 tone(type,when,velocity=.7,control=[.5,.5],pitch=0,pressure=0){
  if(!this.ctx||this.ctx.state!=='running')return;
  const c=this.ctx,t=Math.max(c.currentTime+.006,when),v=clamp(velocity,.15,1);
  if(type==='THUMP')this.thump(t,v,control,pressure);
  else if(type==='CHIRP')this.chirp(t,v,control,pitch,pressure);
  else if(type==='TICK')this.tick(t,v);
 }
 thump(t,v,control,pressure){
  const c=this.ctx,s=thumpSpec(control[0],control[1],pressure),amp=c.createGain();
  ramp(amp.gain,t,.0001,.0001,.01);
  amp.gain.setValueAtTime(.0001,t);
  amp.gain.linearRampToValueAtTime(s.level*v*.59,t+.003);
  amp.gain.exponentialRampToValueAtTime(.0001,t+s.duration);
  this.route(amp,1,.035);
  const body=c.createOscillator();body.type='sine';body.frequency.setValueAtTime(s.pitch,t);body.frequency.exponentialRampToValueAtTime(s.endPitch,t+s.duration*.48);body.connect(amp);body.start(t);body.stop(t+s.duration+.02);
  const carrier=c.createOscillator(),mod=c.createOscillator(),depth=c.createGain(),env=c.createGain();
  carrier.type='sine';mod.type='sine';carrier.frequency.setValueAtTime(s.pitch*1.13,t);carrier.frequency.exponentialRampToValueAtTime(s.endPitch*1.2,t+s.duration*.61);
  mod.frequency.value=s.pitch*2.13;depth.gain.setValueAtTime(s.index,t);depth.gain.exponentialRampToValueAtTime(.02,t+s.duration*.67);
  mod.connect(depth).connect(carrier.frequency);env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(.35*v,t+.002);env.gain.exponentialRampToValueAtTime(.0001,t+s.duration*.61);
  carrier.connect(env);this.route(env,.58,.03);carrier.start(t);mod.start(t);carrier.stop(t+s.duration+.02);mod.stop(t+s.duration+.02);
  if(this.noise){const src=c.createBufferSource(),filter=c.createBiquadFilter(),namp=c.createGain();src.buffer=this.noise;filter.type='highpass';filter.frequency.value=2500+control[1]*1900;namp.gain.setValueAtTime(.0001,t);namp.gain.linearRampToValueAtTime(.065*v,t+.001);namp.gain.exponentialRampToValueAtTime(.0001,t+.018);src.connect(filter).connect(namp);this.route(namp,.5,0);src.start(t,.17);src.stop(t+.022);}
 }
 chirp(t,v,control,pitch,pressure){
  const c=this.ctx,s=chirpSpec(pitch,control[1],pressure),carrier=c.createOscillator(),mod=c.createOscillator(),index=c.createGain(),env=c.createGain(),filter=c.createBiquadFilter();
  carrier.type='sine';mod.type='sine';
  carrier.frequency.setValueAtTime(s.frequency*(1+.09*(control[0]-.5)),t);
  carrier.frequency.exponentialRampToValueAtTime(s.frequency*(.76+.40*control[0]),t+s.duration*.64);
  mod.frequency.setValueAtTime(s.frequency*s.ratio,t);
  index.gain.setValueAtTime(s.index,t);index.gain.exponentialRampToValueAtTime(.02,t+s.duration*.76);
  mod.connect(index).connect(carrier.frequency);
  env.gain.setValueAtTime(.0001,t);
  env.gain.linearRampToValueAtTime(s.level*v,t+.007);
  env.gain.exponentialRampToValueAtTime(.0001,t+s.duration);
  filter.type='lowpass';filter.frequency.value=1900+control[0]*2300;filter.Q.value=.7;
  carrier.connect(filter).connect(env);this.route(env,.79,.16);
  carrier.start(t);mod.start(t);carrier.stop(t+s.duration+.02);mod.stop(t+s.duration+.02);
  // Rounded inharmonic residue is intentionally quieter than the FM primary.
  const glint=c.createOscillator(),tail=c.createGain();glint.type='triangle';glint.frequency.value=s.frequency*(1.99+control[1]*.19);
  tail.gain.setValueAtTime(.0001,t);tail.gain.linearRampToValueAtTime(.038*v,t+.012);tail.gain.exponentialRampToValueAtTime(.0001,t+s.duration*.84);
  glint.connect(tail);this.route(tail,.52,.04);glint.start(t);glint.stop(t+s.duration+.02);
 }
 tick(t,v){
  const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=480;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.015*v,t+.001);g.gain.exponentialRampToValueAtTime(.0001,t+.014);
  o.connect(g);this.route(g,.5,0);o.start(t);o.stop(t+.016);
 }
}
