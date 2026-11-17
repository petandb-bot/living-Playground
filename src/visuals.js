import {WIDTH,HEIGHT,clamp,rng} from './music.js';

const C={deep:'#10172a',shadow:'#182341',floor:'#233257',navy:'#2f426b',border:'#7396b9',paper:'#eddfb4',dim:'#849bb9',tick:'#e6c16c',thump:'#ff868c',chirp:'#64dfbe',bug:'#c3ec82',eyes:'#19223e',tile:'#364b6d',pink:'#b979ab'};
export const CHIP_W=109,CHIP_H=75;
const colorOf=t=>t==='TICK'?C.tick:t==='THUMP'?C.thump:C.chirp;
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
function text(c,label,x,y,col=C.paper,size=9){c.font=`${size}px ui-monospace,monospace`;c.fillStyle=col;c.fillText(label,Math.round(x),Math.round(y));}
function steppedFrame(c,x,y,w,h,border,fill){
 rect(c,x+3,y,w-6,h,fill);rect(c,x,y+3,w,h-6,fill);
 rect(c,x+3,y,w-6,2,border);rect(c,x,y+3,2,h-6,border);
 rect(c,x+w-2,y+3,2,h-6,border);rect(c,x+3,y+h-2,w-6,2,border);
}
function dots(c,x,y,count,active,color){for(let i=0;i<count;i++)rect(c,x+i*8,y,5,3,i===active?color:C.tile);}
function dither(c){
 // Ordered fixed stipple, not a full-screen CRT filter. Tiny repeating islands
 // imitate the economical 16/32-color shading of pre-1994 graphics.
 for(let y=0;y<HEIGHT;y+=4)for(let x=0;x<WIDTH;x+=4){
  const v=((x*3+y*7)>>2)%29;
  if(v===0||v===7)rect(c,x,y,1,1,C.shadow);
 }
 for(let i=0;i<17;i++){
  const r=rng(i*98271+4),x=Math.floor(r()*WIDTH),y=Math.floor(r()*HEIGHT);
  rect(c,x,y,2,1,i%3===0?C.pink:C.tile);
 }
 // Waterline-like stepped stripes give the playfield spatial depth.
 for(let y=275;y<HEIGHT;y+=5){
  rect(c,0,y,WIDTH,1,y%10===0?C.navy:C.shadow);
 }
}
function linkPoints(a,b){
 const from={x:a.x+CHIP_W/2,y:a.y+CHIP_H/2};
 const to={x:b.x+CHIP_W/2,y:b.y+CHIP_H/2};
 const dx=to.x-from.x,dy=to.y-from.y;
 return {from,to,control:{x:(from.x+to.x)/2-dy*.14,y:(from.y+to.y)/2+dx*.14}};
}
function pathPoint(path,t){const u=1-t;return{x:u*u*path.from.x+2*u*t*path.control.x+t*t*path.to.x,y:u*u*path.from.y+2*u*t*path.control.y+t*t*path.to.y};}
function drawLink(c,a,b,phase,active){
 const path=linkPoints(a,b),col=a.type==='TICK'?C.tick:a.type==='CHIRP'?C.chirp:C.thump;
 const segments=50;
 for(let i=0;i<=segments;i++){
  const t=i/segments,p=pathPoint(path,t);
  rect(c,p.x,p.y,2,2,i%4===0?col:active?C.border:C.navy);
 }
 for(let i=0;i<3;i++){
  const t=((phase*.22+i/3)%1+1)%1,p=pathPoint(path,t);
  rect(c,p.x-2,p.y-2,5,5,col);rect(c,p.x,p.y,1,1,C.paper);
 }
 return path;
}
function chipScreen(c,chip,activity,playing,step,clockTime){
 const x=chip.x+9,y=chip.y+29,col=colorOf(chip.type),p=chip.params;
 rect(c,x-2,y-2,93,37,'#101a30');
 for(let j=0;j<5;j++)rect(c,x+j*18,y+27,13,1,C.navy);
 if(chip.type==='TICK'){
  const cursor=step%12;
  for(let k=0;k<12;k++){
   const height=k%3===0?16:7,lit=k===cursor;
   rect(c,x+k*7,y+24-height,5,height,lit?C.paper:k%4===0?col:C.navy);
  }
  text(c,playing?'SEQ / ON':'SEQ / OFF',x+2,y+32,col,7);
 }else if(chip.type==='THUMP'){
  const pulse=Math.min(1,activity),wave=12*pulse;
  for(let k=0;k<9;k++){
   const xx=x+k*10,offset=Math.floor((1-Math.abs(k-4)/4)*wave);
   rect(c,xx,y+12-offset,5,3+Math.floor(offset*.4),col);
   rect(c,xx,y+15+offset,3,2,C.navy);
  }
  text(c,'ELASTIC / FM',x+2,y+32,C.dim,7);
 }else{
  const pulse=Math.min(1,activity);
  for(let k=0;k<45;k++){
   const envelope=Math.exp(-Math.abs(k-22)/(7+16*p[1]));
   const height=Math.round(Math.sin(k*.52+clockTime*3.7)*(2+10*pulse*envelope)+Math.sin(k*.13+clockTime)*(2+4*p[0]));
   rect(c,x+k*2,y+14-height,2,2+(k%5===0?2:0),k%7===0?C.paper:col);
  }
  text(c,'BENT / TONE',x+2,y+32,C.dim,7);
 }
}
function drawChip(c,chip,selected,activity,playing,step,time,linking){
 const x=Math.round(chip.x),y=Math.round(chip.y),col=colorOf(chip.type);
 rect(c,x+4,y+5,CHIP_W,CHIP_H,'#080e1b');
 steppedFrame(c,x,y,CHIP_W,CHIP_H,selected?C.paper:linking?col:C.border,C.shadow);
 rect(c,x+3,y+3,CHIP_W-6,18,col);
 for(let i=0;i<9;i++)rect(c,x+8+i*10,y+7,6,1,C.deep);
 text(c,chip.type,x+9,y+17,C.deep,11);
 rect(c,x+CHIP_W-20,y+7,12,9,C.deep);
 rect(c,x+CHIP_W-16,y+10,4,3,selected?C.paper:activity>.12?C.bug:C.navy);
 chipScreen(c,chip,activity,playing,step,time);
 rect(c,x+9,y+CHIP_H-6,CHIP_W-18,1,C.navy);
 for(let i=0;i<Math.min(8,Math.floor(activity*9));i++)rect(c,x+11+i*10,y+CHIP_H-9,6,2,C.paper);
}
const BUG_POSES=[
 [0,0,1,0, 3,1,7,0, 2,2,9,2, 1,4,10,3, 2,7,9,2, 3,9,7,1],
 [0,1,1,1, 3,1,7,0, 2,2,9,2, 1,4,10,3, 2,7,9,2, 1,10,3,1, 8,10,3,1],
 [0,0,1,0, 3,1,7,0, 2,2,9,2, 1,4,10,3, 2,7,9,2, 2,9,3,1, 8,9,3,1],
 ];
function drawBug(c,x,y,phase,attention=0){
 const px=Math.round(x)-6,py=Math.round(y)-5;
 const pose=BUG_POSES[Math.floor(phase)%BUG_POSES.length];
 const pix=(sx,sy,w,h,col=C.bug)=>rect(c,px+sx,py+sy,w,h,col);
 for(let i=0;i<pose.length;i+=4)pix(pose[i],pose[i+1],pose[i+2],pose[i+3]);
 pix(3,4,2,2,C.eyes);pix(8,4,2,2,C.eyes);
 pix(5,7,2,1,attention>0?C.thump:C.eyes);
 pix(4,-2,1,4,C.bug);pix(8,-2,1,4,C.bug);
 if(attention>0){pix(-3,-4,2,2,C.tick);pix(12,-6,2,2,C.paper);}
}
/** Bug motion is visual-only. No autonomous world operation ever changes a sound. */
export class BugWorld {
 constructor(seed=72){this.seed=seed;this.time=0;this.walk=0;this.pause=0;this.edgeIndex=0;this.x=240;this.y=145;this.dragging=false;this.attention=0;this.target=null;this.random=rng(seed);}
 hear(type){this.attention=1;this.pause=Math.max(this.pause,.14);}
 move(dt,scene){
  this.time+=dt;this.attention=Math.max(0,this.attention-dt*2.3);
  if(this.dragging)return;
  if(this.pause>0){this.pause-=dt;return;}
  const connected=scene.links.map(l=>({from:scene.chips.find(c=>c.id===l.from),to:scene.chips.find(c=>c.id===l.to)})).filter(l=>l.from&&l.to);
  if(!connected.length){this.x+=Math.sin(this.time*.7)*dt*15;this.x=clamp(this.x,24,WIDTH-24);this.y=244+Math.sin(this.time*.83)*5;return;}
  const i=this.edgeIndex%connected.length,edge=connected[i],path=linkPoints(edge.from,edge.to);
  this.walk+=dt*(.11+this.random()*0.001);
  if(this.walk>=1){this.walk=0;this.edgeIndex=(this.edgeIndex+1)%connected.length;this.pause=.22+this.random()*.55;}
  const p=pathPoint(path,this.walk);this.x=p.x;this.y=p.y-8;
 }
 position(x,y){this.x=clamp(x,6,WIDTH-6);this.y=clamp(y,6,HEIGHT-6);}
}
export function hitChip(scene,x,y){
 for(const chip of [...scene.chips].reverse()){
  if(x>=chip.x&&x<=chip.x+CHIP_W&&y>=chip.y&&y<=chip.y+CHIP_H){return{chip,handle:y<chip.y+23};}
 }
 return null;
}
let backdrop=null;
function cachedBackdrop(){
 if(!backdrop){
  backdrop=document.createElement('canvas');backdrop.width=WIDTH;backdrop.height=HEIGHT;
  const cc=backdrop.getContext('2d');
  rect(cc,0,0,WIDTH,HEIGHT,C.deep);dither(cc);
  rect(cc,4,4,WIDTH-8,1,C.navy);rect(cc,4,HEIGHT-5,WIDTH-8,1,C.navy);
 }
 return backdrop;
}
export function drawWorld(canvas,scene,opts){
 const c=canvas.getContext('2d',{alpha:false});if(!c)return;
 c.imageSmoothingEnabled=false;
 c.drawImage(cachedBackdrop(),0,0);
 for(const l of scene.links){const a=scene.chips.find(ch=>ch.id===l.from),b=scene.chips.find(ch=>ch.id===l.to);if(a&&b)drawLink(c,a,b,opts.time,opts.playing);}
 if(opts.linkingFrom){const from=scene.chips.find(ch=>ch.id===opts.linkingFrom);if(from){text(c,'SELECT TARGET',205,HEIGHT-20,C.tick,10);}}
 for(const chip of scene.chips){drawChip(c,chip,opts.selected===chip.id,opts.activity[chip.id]||0,opts.playing,opts.step,opts.time,opts.linkingFrom===chip.id);}
 // Tiny, intentionally legible creature that travels visible routes.
 drawBug(c,opts.bug.x,opts.bug.y,opts.bug.dragging?1:Math.floor(opts.time*7),opts.bug.attention);
 text(c,'PLAYFIELD   /   LITTLE MACHINES',13,16,C.dim,8);
 text(c,opts.playing?`RUNNING ${String(opts.step+1).padStart(2,'0')}/16`:'READY   TOUCH TO PLAY',13,HEIGHT-14,C.dim,8);
}
