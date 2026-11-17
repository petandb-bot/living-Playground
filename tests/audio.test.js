import test from 'node:test';
import assert from 'node:assert/strict';
import {thumpSpec,chirpSpec,wavetable} from '../src/audio.js';
test('acoustic recipes remain finite and within expressive bounds',()=>{
 for(let i=0;i<=100;i++){
  const a=thumpSpec(i/100,1-i/100,i/100),b=chirpSpec(i/4,i/100,i/100);
  assert(Object.values(a).every(Number.isFinite));assert(Object.values(b).every(Number.isFinite));
  assert(a.pitch>=72&&a.pitch<180);assert(b.frequency>0&&b.frequency<1300);
  assert(a.duration>.15&&b.duration>.1);
 }
});
test('soft saturation waveshaper is monotone and bounded',()=>{
 const s=wavetable();assert.equal(s.length,2049);
 assert.equal(s[1024],0);
 for(let i=1;i<s.length;i++)assert(s[i]>=s[i-1]-1e-6);
 assert(s[0]>=-1&&s[s.length-1]<=1);
});
