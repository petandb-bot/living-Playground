import test from 'node:test';
import assert from 'node:assert/strict';
import {makeScene,validLink,toggleLink,addChip,eventsAtStep,mutate,snapshot,validateScene,pitchForStep} from '../src/music.js';

test('starter scene is playable, small, and valid',()=>{
 const s=makeScene();assert.equal(s.chips.length,3);assert.equal(s.links.length,2);assert.deepEqual(validateScene(s),s);
});
test('link rules are role-based and reversible, not arbitrary audio cables',()=>{
 const s=makeScene();assert(validLink(s.chips,'tick-1','thump-1'));
 assert(validLink(s.chips,'thump-1','chirp-1'));
 assert(!validLink(s.chips,'thump-1','tick-1'));
 assert(!validLink(s.chips,'thump-1','thump-1'));
 assert.equal(toggleLink(s,'tick-1','thump-1').added,false);
 assert.equal(eventsAtStep(s,0,0).some(e=>e.type==='THUMP'),false);
 assert.equal(toggleLink(s,'tick-1','thump-1').added,true);
});
test('rhythmic anchors survive mutation; not every step triggers',()=>{
 const s=makeScene();for(let iteration=0;iteration<10;iteration++){
  const events=Array.from({length:16},(_,i)=>eventsAtStep(s,i,3));
  assert(events[0].some(e=>e.type==='THUMP'));
  assert(events[8].some(e=>e.type==='THUMP'));
  assert(events[3].some(e=>e.type==='CHIRP'));
  assert(events[11].some(e=>e.type==='CHIRP'));
  assert(events.filter(e=>e.length===0).length>=4);
  mutate(s);
 }
});
test('same seed and cycle produce identical sound event plans',()=>{
 const a=makeScene(98723),b=makeScene(98723);
 assert.deepEqual(Array.from({length:48},(_,i)=>eventsAtStep(a,i%16,Math.floor(i/16))),Array.from({length:48},(_,i)=>eventsAtStep(b,i%16,Math.floor(i/16))));
 assert.equal(pitchForStep(20,7,2),pitchForStep(20,7,2));
});
test('UNDO-style snapshot isolates later edits and invalid patches are rejected',()=>{
 const s=makeScene(),old=snapshot(s);mutate(s);s.chips[0].x+=20;assert.deepEqual(old,makeScene());
 assert.equal(validateScene({...old,chips:[...old.chips,...old.chips]}),null);
 assert.equal(validateScene({...old,links:[{from:'thump-1',to:'tick-1'}]}),null);
 assert.equal(validateScene({...old,tempo:NaN}),null);
});
test('fourth chip allowed, fifth rejected',()=>{
 const s=makeScene();assert(addChip(s,'CHIRP'));assert.equal(addChip(s,'THUMP'),null);
 assert.equal(validateScene(s)?.chips.length,4);
});
