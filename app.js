(function(){
const $=id=>document.getElementById(id);
const cv=$('cv'),ctx=cv.getContext('2d');
const W=800,H=450,HY=165,CX=400,FOC=14,ROAD=3.5;

// Each object: kind, z at time t (metres ahead), lat (metres from road centre; negative = left)
const CLIPS=[
 {title:'Parked van',dur:11,v:10,hs:6.5,he:9.0,
  why:'The child stepped out from behind the parked van. You cannot see behind large parked vehicles, so slow down and cover the brake.',
  objs:[{k:'child',st:t=>({z:131.5-10*t,lat:t<6?4.6:Math.max(.4,4.6-1.5*(t-6))})},
        {k:'van',st:t=>({z:130-10*t,lat:4.6})}]},
 {title:'Side road',dur:10,v:10,hs:5.0,he:8.0,side:110,
  why:'The car waiting at the junction began to pull out. Its movement showed the driver had not seen you, so you needed to be ready to slow down.',
  objs:[{k:'car',c:'#2f6fd0',st:t=>({z:112-10*t,lat:t<5?-7.5:-7.5+.8*(t-5)**2})}]},
 {title:'Cyclist and parked car',dur:9.5,v:10,hs:5.8,he:8.5,
  why:'The cyclist moved out to pass the parked car, so they would be in your path. Give them space and be ready to wait.',
  objs:[{k:'car',c:'#2a8a55',st:t=>({z:100-10*t,lat:-2.6})},
        {k:'bike',st:t=>({z:70-6*t,lat:t<6?-1.2:-1.2+Math.min(1,(t-6)/1.5)*2.2})}]}
];
const MAXPER=5;
let idx=0,t0=0,run=false,clicks=[],res=[];

function P(z,lat){const d=Math.min(1.5,FOC/z);return{d,x:CX+lat/ROAD*(12+330*d),y:HY+(H-HY)*d}}
function poly(pts,col){ctx.fillStyle=col;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill()}

function draw(c,t){
  const v=c.v;
  const sky=ctx.createLinearGradient(0,0,0,HY);sky.addColorStop(0,'#7fb2e8');sky.addColorStop(1,'#d7e8f6');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,HY);
  ctx.fillStyle='#4f8a3c';ctx.fillRect(0,HY,W,H-HY);
  poly([[CX-12,HY],[CX+12,HY],[CX+342,H],[CX-342,H]],'#4a4d54');
  // pavement edges
  ctx.strokeStyle='#bfc3c8';ctx.lineWidth=3;
  [-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(CX+s*12,HY);ctx.lineTo(CX+s*342,H);ctx.stroke()});
  // side road
  if(c.side){const z=c.side-v*t;if(z>3){
    const a=P(z+5,-ROAD),b=P(z-5,-ROAD),a2=P(z+5,-60),b2=P(z-5,-60);
    poly([[a.x,a.y],[b.x,b.y],[0,b2.y],[0,a2.y]],'#4a4d54');}}
  // centre dashes
  ctx.strokeStyle='#e8e8e8';
  for(let k=0;k<22;k++){const z=((8*k-v*t)%176+176)%176;if(z<3)continue;
    const a=P(z,0),b=P(z-3,0);ctx.lineWidth=Math.max(1,7*a.d);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  // trees
  const sc=[];
  for(let k=0;k<8;k++)for(const s of [-1,1]){const z=((25*k+(s>0?12:0)-v*t)%200+200)%200;if(z>3)sc.push({k:'tree',z,lat:s*(9+(k%3)*2)})}
  c.objs.forEach(o=>{const s=o.st(t);sc.push({k:o.k,c:o.c,z:s.z,lat:s.lat})});
  sc.sort((a,b)=>b.z-a.z).forEach(o=>{if(o.z<2.5)return;sprite(o)});
  // dashboard
  ctx.fillStyle='#14171c';ctx.fillRect(0,H-24,W,24);
}
function sprite(o){
  const p=P(o.z,o.lat),d=p.d,x=p.x,y=p.y;
  if(o.k==='tree'){ctx.fillStyle='#5a3d28';ctx.fillRect(x-6*d,y-120*d,12*d,120*d);ctx.fillStyle='#2e6b2e';ctx.beginPath();ctx.arc(x,y-150*d,55*d,0,7);ctx.fill();}
  else if(o.k==='van'){const w=250*d,h=190*d;ctx.fillStyle='#e6e8ec';ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle='#8c95a3';ctx.fillRect(x-w/2+10*d,y-h+12*d,w-20*d,60*d);ctx.fillStyle='#d6232a';ctx.fillRect(x-w/2+6*d,y-45*d,22*d,26*d);ctx.fillRect(x+w/2-28*d,y-45*d,22*d,26*d);ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-12*d,w,12*d)}
  else if(o.k==='car'){const w=230*d,h=130*d;ctx.fillStyle=o.c;ctx.fillRect(x-w/2,y-h*.6,w,h*.6);ctx.fillRect(x-w*.36,y-h,w*.72,h*.45);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-w*.3,y-h*.95,w*.6,h*.38);ctx.fillStyle='#d6232a';ctx.fillRect(x-w/2+4*d,y-h*.5,20*d,12*d);ctx.fillRect(x+w/2-24*d,y-h*.5,20*d,12*d);ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-8*d,w,8*d)}
  else if(o.k==='child'){const h=140*d;ctx.fillStyle='#f2c200';ctx.fillRect(x-17*d,y-h*.72,34*d,h*.45);ctx.fillStyle='#2a3a6a';ctx.fillRect(x-14*d,y-h*.28,28*d,h*.28);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.84,15*d,0,7);ctx.fill()}
  else if(o.k==='bike'){const h=150*d;ctx.strokeStyle='#111';ctx.lineWidth=Math.max(1,5*d);[-26,26].forEach(dx=>{ctx.beginPath();ctx.arc(x+dx*d,y-24*d,24*d,0,7);ctx.stroke()});ctx.fillStyle='#e8591a';ctx.fillRect(x-14*d,y-h*.75,28*d,h*.4);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.85,13*d,0,7);ctx.fill();ctx.fillStyle='#f5d400';ctx.fillRect(x-13*d,y-h*.95,26*d,8*d)}
}

function scoreOf(c,cl){
  if(cl.length>4)return{s:0,spam:true};
  const len=(c.he-c.hs)/MAXPER;let best=0;
  cl.forEach(t=>{if(t>=c.hs&&t<=c.he){best=Math.max(best,MAXPER-Math.min(MAXPER-1,Math.floor((t-c.hs)/len)))}});
  return{s:best,spam:false};
}

function show(id){['intro','game','review','final'].forEach(s=>$(s).classList.toggle('hidden',s!==id))}
function startClip(){
  const c=CLIPS[idx];clicks=[];$('flagLbl').textContent='Flags: 0';
  $('clipLbl').textContent='Clip '+(idx+1)+' of '+CLIPS.length;
  show('game');cv.focus({preventScroll:true});t0=performance.now();run=true;requestAnimationFrame(frame);
}
function frame(now){
  if(!run)return;const c=CLIPS[idx],t=(now-t0)/1000;
  if(t>=c.dur){run=false;finish();return}
  draw(c,t);$('prog').style.width=(t/c.dur*100)+'%';requestAnimationFrame(frame);
}
function flagIt(){
  if(!run)return;clicks.push((performance.now()-t0)/1000);
  $('flagLbl').textContent='Flags: '+clicks.length;
  const f=$('flag');f.classList.add('on');setTimeout(()=>f.classList.remove('on'),250);
}
function finish(){
  const c=CLIPS[idx],r=scoreOf(c,clicks);res.push(r.s);
  $('rvTitle').textContent='Clip '+(idx+1)+': '+c.title;$('rvScore').textContent=r.s;
  $('rvMsg').textContent=r.spam?'Too many flags: clicking repeatedly scores 0. Flag once or twice when you see the hazard develop.':
    clicks.length===0?'You did not flag anything in this clip.':
    r.s===0?'Your flags came outside the scoring window.':
    r.s>=4?'Excellent. You spotted it early.':r.s>=2?'Good, but earlier is better.':'You spotted it late. React as soon as it starts to develop.';
  $('rvWhy').textContent=c.why;
  const tl=$('tl');tl.innerHTML='';const cols=['#1b8a4f','#5aa13c','#c9a30a','#e07a14','#d6232a'];
  const bw=(c.he-c.hs)/MAXPER;
  for(let i=0;i<MAXPER;i++){const b=document.createElement('div');b.className='band';b.style.left=((c.hs+i*bw)/c.dur*100)+'%';b.style.width=(bw/c.dur*100)+'%';b.style.background=cols[i];b.textContent=MAXPER-i;tl.appendChild(b)}
  clicks.forEach(t=>{const m=document.createElement('div');m.className='mk';m.style.left=(t/c.dur*100)+'%';tl.appendChild(m)});
  $('next').textContent=idx===CLIPS.length-1?'See results':'Next clip';
  show('review');
}
function results(){
  const tot=res.reduce((a,b)=>a+b,0),max=CLIPS.length*MAXPER,pct=tot/max*100,ok=pct>=59;
  $('fTotal').textContent=tot;$('fMax').textContent=max;
  $('fVerdict').innerHTML='<strong class="'+(ok?'pass':'fail')+'">'+(ok?'Pass':'Not yet a pass')+'</strong> at '+Math.round(pct)+'% (pass mark 59%).';
  $('fRows').innerHTML=CLIPS.map((c,i)=>'<tr><td>'+c.title+'</td><td>'+res[i]+' / '+MAXPER+'</td></tr>').join('');
  show('final');
}
$('start').onclick=()=>{idx=0;res=[];startClip()};
$('again').onclick=()=>{idx=0;res=[];startClip()};
$('next').onclick=()=>{if(idx===CLIPS.length-1)results();else{idx++;startClip()}};
$('hit').onclick=flagIt;cv.addEventListener('pointerdown',flagIt);
document.addEventListener('keydown',e=>{if(e.code==='Space'&&run){e.preventDefault();flagIt()}});
})();
