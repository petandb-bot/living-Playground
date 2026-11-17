import {cpSync,mkdirSync,rmSync,copyFileSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist',{recursive:true});
for(const file of ['index.html','style.css'])copyFileSync(file,'dist/'+file);
cpSync('src','dist/src',{recursive:true});
console.log('Built dependency-free browser application in dist/.');
