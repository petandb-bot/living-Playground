import {cpSync,mkdirSync,rmSync,copyFileSync,readFileSync,writeFileSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist',{recursive:true});
for(const file of ['index.html','style.css'])copyFileSync(file,'dist/'+file);
cpSync('src','dist/src',{recursive:true});

// A standalone audition file is useful before we have a published HTTPS site.
// Browser-native ESM remains the canonical source; this single-file wrapper
// is a deterministic snapshot for local listening and visual reviews.
const files=['music.js','audio.js','visuals.js','main.js'];
const inline=files.map(file=>readFileSync('src/'+file,'utf8')
 .replace(/^import .*?;\s*$/gm,'')
 .replace(/\bexport (?=(?:const|function|class)\b)/g,''))
 .join('\n;\n');
const html=readFileSync('index.html','utf8')
 .replace('<link rel="stylesheet" href="./style.css">','<style>'+readFileSync('style.css','utf8')+'</style>')
 .replace('<script type="module" src="./src/main.js"></script>','<script>'+inline+'</script>');
writeFileSync('dist/preview.html',html);
console.log('Built dist/ (ES modules) and standalone dist/preview.html (offline audition).');