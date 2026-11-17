import test from 'node:test';
import assert from 'node:assert/strict';
import {BugWorld,hitChip} from '../src/visuals.js';
import {makeScene} from '../src/music.js';

test('Bug walks along actual routes without touching the audio scene',()=>{
 const scene=makeScene(),before=JSON.stringify(scene),bug=new BugWorld(211);
 let distance=0;let prior={x:bug.x,y:bug.y};
 for(let i=0;i<2500;i++){
  bug.move(1/60,scene);
  assert(Number.isFinite(bug.x)&&Number.isFinite(bug.y));
  distance+=Math.hypot(bug.x-prior.x,bug.y-prior.y);
  prior={x:bug.x,y:bug.y};
 }
 assert(distance>50);
 assert.equal(JSON.stringify(scene),before);
});
test('Bug receives visual attention, stays bounded during explicit dragging',()=>{
 const bug=new BugWorld(99),scene=makeScene();bug.hear('THUMP');assert(bug.attention>0);
 bug.dragging=true;bug.position(-1000,2000);bug.move(.5,scene);
 assert(bug.x>=6&&bug.x<=474);assert(bug.y>=6&&bug.y<=294);
 assert(bug.attention<1);
});
test('chip hit detection distinguishes playing area and drag header',()=>{
 const scene=makeScene(),chip=scene.chips[1];
 assert.equal(hitChip(scene,chip.x+15,chip.y+10).handle,true);
 assert.equal(hitChip(scene,chip.x+15,chip.y+39).handle,false);
 assert.equal(hitChip(scene,2,2),null);
});
