(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d'),W=800,H=450,HY=165,CX=400,FOC=14,ROAD=3.5,MAX=5,PASS=59;
const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);

/* Session-only state (nothing is stored in the browser; a refresh clears it) */
const S={hist:[],att:[],quiz:[],streak:0,best:0,badges:{}};
const BADGES={first:['🏁','First clip','Complete any clip'],perfect:['🎯','Perfect 5','Score 5 out of 5 on a clip'],streak5:['🔥','Hot streak','5 clips in a row scoring 4 or more'],decoy:['🛡️','Cool head','Leave a decoy clip unflagged'],mock:['🏆','Test passed','Pass a full practice test'],quiz:['📘','Quiz ace','Get every question right in a quiz']};

/* Clips: z = metres ahead, lat = metres from road centre (negative = left). h marks the hazard. */
const CLIPS=[
{id:'van',title:'Parked van',cat:'Pedestrians',dur:11,v:10,mph:30,time:'day',wx:'clear',hs:6.5,he:9,
 cap:'Daytime, clear weather. You drive at 30 mph along a residential road. A white van is parked on the left.',
 why:'A child stepped out from behind the parked van.',
 tip:'Flag when the child first appears from behind the van. Large parked vehicles hide pedestrians, so the van is the clue: ease off and cover the brake before anyone appears.',
 objs:[{k:'child',h:1,st:t=>({z:131.5-10*t,lat:t<6?-4.6:Math.min(-.4,-4.6+1.5*(t-6))})},{k:'van',st:t=>({z:130-10*t,lat:-4.6})}]},
{id:'side',title:'Side road in the rain',cat:'Junctions',dur:10,v:10,mph:30,time:'day',wx:'rain',hs:5,he:8,side:110,
 cap:'Daytime, steady rain. You drive at 30 mph. There is a side road joining on the left.',
 why:'The car waiting at the side road began to pull out.',
 tip:'Flag as the car starts to creep forward. In rain, drivers may not judge your speed well and your stopping distance doubles, so an emerging car is a real hazard from the first movement.',
 objs:[{k:'car',c:'#2f6fd0',h:1,st:t=>({z:112-10*t,lat:t<5?-7.5:-7.5+.8*(t-5)**2})}]},
{id:'bike',title:'Cyclist and parked car',cat:'Cyclists',dur:9.5,v:10,mph:30,time:'day',wx:'fog',hs:5.8,he:8.5,
 cap:'Daytime, light fog. You drive at 30 mph. A cyclist rides ahead in your lane near a parked car on the left.',
 why:'The cyclist moved out to pass the parked car and into your path.',
 tip:'Flag as the cyclist starts to drift right. A cyclist approaching a parked car will almost always move out, so watch for the wobble or a glance over the shoulder.',
 objs:[{k:'car',c:'#2a8a55',st:t=>({z:100-10*t,lat:-2.6})},{k:'bike',h:1,st:t=>({z:70-6*t,lat:t<6?-1.2:-1.2+Math.min(1,(t-6)/1.5)*2.2})}]},
{id:'night',title:'Quiet road at night (decoy)',cat:'Decoy',dur:9,v:10,mph:30,time:'night',wx:'clear',hs:null,he:null,
 cap:'Night time. You drive at 30 mph along a quiet road. Cars are parked on both sides and a pedestrian walks on the right pavement.',
 why:'Nothing here develops into a hazard. The pedestrian stays on the pavement walking away from you.',
 tip:'Not every clip has a hazard. Only flag something that would make you slow down, stop or change direction.',
 objs:[{k:'car',c:'#8a2a2a',st:t=>({z:90-10*t,lat:-3.1})},{k:'car',c:'#556',st:t=>({z:140-10*t,lat:4.4})},{k:'child',st:t=>({z:75-8.8*t,lat:5.6})}]}
];

let P={c:CLIPS[0],t:0,sp:1,run:false,mode:'test',last:0,tip:false},raf=0,clicks=[],M={i:0,res:[],on:false},HZ=null,lastS=0;

/* ---------- drawing ---------- */
function proj(z,lat){const d=Math.min(1.5,FOC/z);return{d,x:CX+lat/ROAD*(12+330*d),y:HY+(H-HY)*d}}
function poly(p,col){ctx.fillStyle=col;ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill()}
function draw(){
 const c=P.c,t=P.t,v=c.v,RM=document.body.classList.contains('rm'),night=c.time==='night';
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.save();HZ=null;
 if(!RM){ctx.translate(W/2,H/2);ctx.rotate(Math.sin(t*1.4)*.004);ctx.scale(1.03,1.03);ctx.translate(-W/2,-H/2+Math.sin(t*6.5)*1.3)}
 const pal=night?['#050b1a','#17264a']:{clear:['#7fb2e8','#d7e8f6'],rain:['#6b7787','#a9b3bf'],fog:['#c5cbd1','#dde1e4']}[c.wx];
 const g=ctx.createLinearGradient(0,0,0,HY);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);ctx.fillStyle=g;ctx.fillRect(-20,-20,W+40,HY+20);
 if(!night&&c.wx!=='fog'){ctx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<4;i++){const x=((i*300-(RM?0:t*6))%1100+1100)%1100-150;ctx.beginPath();ctx.ellipse(x,40+i*22,70,16,0,0,7);ctx.fill()}}
 [['#7d9aa8',.012,30],['#5f8a5a',.02,16]].forEach((l,L)=>{ctx.fillStyle=night?'#0c1a14':l[0];ctx.beginPath();ctx.moveTo(-60,HY);for(let x=-60;x<=W+60;x+=40)ctx.lineTo(x+(RM?0:Math.sin(t*1.4)*(L+1)*3),HY-l[2]-l[2]*.6*Math.sin(x*l[1]*2+L*2));ctx.lineTo(W+60,HY);ctx.fill()});
 ctx.fillStyle=night?'#1f3a1a':{clear:'#4f8a3c',rain:'#3d6b30',fog:'#6d8a62'}[c.wx];ctx.fillRect(-20,HY,W+40,H-HY+20);
 poly([[CX-12,HY],[CX+12,HY],[CX+342,H],[CX-342,H]],c.wx==='rain'?'#3a3d44':'#4a4d54');
 ctx.strokeStyle='#bfc3c8';ctx.lineWidth=3;[-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(CX+s*12,HY);ctx.lineTo(CX+s*342,H);ctx.stroke()});
 if(c.side){const z=c.side-v*t;if(z>3){const a=proj(z+5,-ROAD),b=proj(z-5,-ROAD),a2=proj(z+5,-60),b2=proj(z-5,-60);poly([[a.x,a.y],[b.x,b.y],[0,b2.y],[0,a2.y]],'#3a3d44')}}
 ctx.strokeStyle='#e8e8e8';for(let k=0;k<22;k++){const z=((8*k-v*t)%176+176)%176;if(z<3)continue;const a=proj(z,0),b=proj(z-3,0);ctx.lineWidth=Math.max(1,7*a.d);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 const sc=[];for(let k=0;k<8;k++)[-1,1].forEach(s=>{const z=((25*k+(s>0?12:0)-v*t)%200+200)%200;if(z>3)sc.push({k:'tree',z,lat:s*(9+(k%3)*2)})});
 c.objs.forEach(o=>{const s=o.st(t);sc.push({k:o.k,c:o.c,h:o.h,z:s.z,lat:s.lat})});
 sc.sort((a,b)=>b.z-a.z).forEach(o=>{if(o.z>=2.5)sprite(o)});
 if(c.wx==='fog'){const f=ctx.createLinearGradient(0,HY-10,0,HY+170);f.addColorStop(0,'rgba(205,210,214,.95)');f.addColorStop(1,'rgba(205,210,214,.08)');ctx.fillStyle=f;ctx.fillRect(-20,HY-10,W+40,H)}
 if(night){const r=ctx.createRadialGradient(CX,H,60,CX,H-120,520);r.addColorStop(0,'rgba(5,10,25,.05)');r.addColorStop(1,'rgba(5,10,25,.82)');ctx.fillStyle=r;ctx.fillRect(-20,-20,W+40,H+40)}
 if(c.wx==='rain'){ctx.strokeStyle='rgba(205,220,240,.55)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<90;i++){const x=(i*89)%W,y=((i*53)+(RM?0:t*700))%H;ctx.moveTo(x,y);ctx.lineTo(x-4,y+14)}ctx.stroke()}
 if(P.mode==='replay'&&HZ&&c.hs!=null)hint(c,t);
 ctx.restore();ctx.fillStyle='#14171c';ctx.fillRect(0,H-22,W,22);
 $('#prog').style.width=(t/c.dur*100)+'%';const ph=$('#ph');if(ph)ph.style.left=(t/c.dur*100)+'%';
}
function hint(c,t){
 const z=HZ,cy=z.y-70*z.d;
 if(t>=c.hs-.3&&t<=c.he){ctx.save();ctx.strokeStyle='#f2b705';ctx.shadowColor='#f2b705';ctx.shadowBlur=20;ctx.lineWidth=4+Math.sin(t*10)*1.5;ctx.beginPath();ctx.ellipse(z.x,cy,55*z.d+14,85*z.d+14,0,0,7);ctx.stroke();ctx.restore()}
 if(P.tip){const txt=t>=c.hs&&t<=c.hs+1.4?'Press Space now!':t>=c.hs-1.8&&t<c.hs?'Watch this area...':'';
  if(txt){ctx.font='bold 20px Segoe UI, Arial';const w=ctx.measureText(txt).width+28,x=Math.max(8,Math.min(W-w-8,z.x-w/2)),y=Math.max(30,cy-85*z.d-48);ctx.fillStyle=txt[0]==='P'?'#f2b705':'#fff';ctx.fillRect(x,y,w,34);ctx.fillStyle='#111';ctx.fillText(txt,x+14,y+24)}}
}
function sprite(o){
 const p=proj(o.z,o.lat),d=p.d,x=p.x,y=p.y;if(o.h)HZ={x,y,d};
 if(o.k==='tree'){ctx.fillStyle='#5a3d28';ctx.fillRect(x-6*d,y-120*d,12*d,120*d);ctx.fillStyle='#2e6b2e';ctx.beginPath();ctx.arc(x,y-150*d,55*d,0,7);ctx.fill()}
 else if(o.k==='van'){const w=250*d,h=190*d;ctx.fillStyle='#e6e8ec';ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle='#8c95a3';ctx.fillRect(x-w/2+10*d,y-h+12*d,w-20*d,60*d);ctx.fillStyle='#d6232a';ctx.fillRect(x-w/2+6*d,y-45*d,22*d,26*d);ctx.fillRect(x+w/2-28*d,y-45*d,22*d,26*d);ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-12*d,w,12*d)}
 else if(o.k==='car'){const w=230*d,h=130*d;ctx.fillStyle=o.c;ctx.fillRect(x-w/2,y-h*.6,w,h*.6);ctx.fillRect(x-w*.36,y-h,w*.72,h*.45);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-w*.3,y-h*.95,w*.6,h*.38);ctx.fillStyle='#ff3b3b';ctx.fillRect(x-w/2+4*d,y-h*.5,20*d,12*d);ctx.fillRect(x+w/2-24*d,y-h*.5,20*d,12*d);ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-8*d,w,8*d)}
 else if(o.k==='child'){const h=140*d;ctx.fillStyle='#f2c200';ctx.fillRect(x-17*d,y-h*.72,34*d,h*.45);ctx.fillStyle='#2a3a6a';ctx.fillRect(x-14*d,y-h*.28,28*d,h*.28);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.84,15*d,0,7);ctx.fill()}
 else if(o.k==='bike'){const h=150*d;ctx.strokeStyle='#111';ctx.lineWidth=Math.max(1,5*d);[-26,26].forEach(dx=>{ctx.beginPath();ctx.arc(x+dx*d,y-24*d,24*d,0,7);ctx.stroke()});ctx.fillStyle='#e8591a';ctx.fillRect(x-14*d,y-h*.75,28*d,h*.4);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.85,13*d,0,7);ctx.fill();ctx.fillStyle='#f5d400';ctx.fillRect(x-13*d,y-h*.95,26*d,8*d)}
}

/* ---------- playback ---------- */
function loop(now){
 if(!P.run)return;const dt=Math.min(.1,(now-P.last)/1000);P.last=now;P.t+=dt*P.sp;
 if(P.t>=P.c.dur){P.t=P.c.dur;P.run=false;draw();if(P.mode==='test')finish();return}
 draw();raf=requestAnimationFrame(loop);
}
function play(c,mode,sp,tip){cancelAnimationFrame(raf);P={c,t:0,sp,run:true,mode,last:performance.now(),tip:!!tip};raf=requestAnimationFrame(loop)}
function flag(){
 if(!(P.run&&P.mode==='test'))return;clicks.push(P.t);
 const f=document.createElement('div');f.className='fl';f.innerHTML='<svg viewBox="0 0 40 40" width="30" height="30"><path d="M8 4v32M8 5h24l-6 8 6 8H8" fill="#d6232a" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>';
 const fl=$('#flags');if(clicks.length===1)fl.innerHTML='';fl.appendChild(f);$('#sr').textContent='Flag '+clicks.length;
}

/* ---------- test flow ---------- */
function steps(){const s=$('#steps');s.classList.remove('hidden');s.innerHTML='<span>Clip '+(M.i+1)+' of '+CLIPS.length+'</span>'+CLIPS.map((c,i)=>'<i class="'+(i<M.res.length?'done':i===M.i?'cur':'')+'"></i>').join('')}
function start(){M={i:0,res:[],on:true};startClip()}
function startClip(){
 const c=CLIPS[M.i];clicks=[];if(document.activeElement)document.activeElement.blur();
 $('#clipLbl').textContent='Clip '+(M.i+1)+' of '+CLIPS.length;$('#speedLbl').textContent=c.mph+' mph';
 $('#flags').innerHTML='<span>Flags appear here</span>';$('#capt').textContent=c.cap;$('#capt').classList.toggle('hidden',!$('#cc').checked);
 $('#live').classList.remove('hidden');$('#rev').classList.add('hidden');steps();show('clip');play(c,'test',1,false);
}
function score(c,cl){
 if(c.hs==null)return{s:cl.length?0:5,f:null};
 if(cl.length>4)return{s:0,f:null,spam:1};
 const bw=(c.he-c.hs)/MAX;let s=0,f=null;
 cl.forEach(t=>{if(t>=c.hs&&t<=c.he){s=Math.max(s,MAX-Math.min(MAX-1,Math.floor((t-c.hs)/bw)));if(f==null||t<f)f=t}});
 return{s,f};
}
function finish(){
 const c=P.c,r=score(c,clicks),s=r.s;lastS=s;M.res.push(s);
 S.hist.push({title:c.title,cat:c.cat,s});
 if(c.hs!=null){S.streak=s>=4?S.streak+1:0}else if(s<5)S.streak=0;
 S.best=Math.max(S.best,S.streak);
 award('first');if(s===5&&c.hs!=null)award('perfect');if(c.hs==null&&s===5)award('decoy');if(S.streak>=5)award('streak5');
 steps();$('#live').classList.add('hidden');$('#rev').classList.remove('hidden');
 $('#rvTitle').textContent='Clip '+(M.i+1)+': '+c.title;countUp($('#rvScore'),s,900);
 const early=c.hs==null?0:clicks.filter(t=>t<c.hs).length,rows=c.hs==null?[['Hazards in this clip','None'],['Your flags',clicks.length]]:
  [['Scoring window',c.hs+'s to '+c.he+'s'],['Earliest scoring moment',c.hs+'s (5 points)'],['Your first flag in the window',r.f==null?'None':r.f.toFixed(1)+'s'],['Reaction time',r.f==null?'Not scored':(r.f-c.hs).toFixed(1)+'s after the window opened'],['Flags used',clicks.length+(r.spam?' (too many, scored 0)':'')+(early?', '+early+' before the window':'')]];
 $('#rvTable').innerHTML=rows.map(x=>'<tr><th scope="row">'+x[0]+'</th><td>'+x[1]+'</td></tr>').join('');
 $('#rvMsg').textContent=c.hs==null?(s===5?'Well done. You correctly left this clip unflagged.':'There was no hazard here, so flagging scores 0.'):r.spam?'Too many flags. Repeated clicking scores 0.':!clicks.length?'You did not flag anything.':s===0?'Your flags were outside the scoring window.':s===5?'Perfect reaction.':s>=3?'Good, but earlier scores higher.':'Late. React as soon as the hazard starts to develop.';
 $('#rvTip').innerHTML='<b>'+(s===5?'Full marks. ':'How to score 5/5: ')+'</b>'+(s===5?c.why:c.why+' '+c.tip);
 const tl=$('#tl');tl.innerHTML='';
 if(c.hs!=null){const cols=['#1b8a4f','#5aa13c','#c9a30a','#e07a14','#d6232a'],bw=(c.he-c.hs)/MAX;for(let i=0;i<MAX;i++){const b=document.createElement('div');b.className='band';b.style.cssText='left:'+((c.hs+i*bw)/c.dur*100)+'%;width:'+(bw/c.dur*100)+'%;background:'+cols[i]+';transition-delay:'+(i*150)+'ms';b.textContent=MAX-i;tl.appendChild(b);setTimeout(()=>b.classList.add('in'),60)}}
 clicks.forEach(t=>{const m=document.createElement('div');m.className='mk';m.style.left=(t/c.dur*100)+'%';tl.appendChild(m)});
 const ph=document.createElement('div');ph.id='ph';tl.appendChild(ph);
 $('#next').textContent=M.i===CLIPS.length-1?'See results':'Next clip';
 $('#sr').textContent='Clip scored '+s+' out of 5. '+$('#rvMsg').textContent;
 if(s<5&&c.hs!=null)setTimeout(()=>{if(M.on&&!$('#rev').classList.contains('hidden'))replay(true)},1200);
}
function replay(tip){const sp=+$('#spd').value;play(P.c,'replay',sp,tip===true&&lastS<5)}
function countUp(el,to,ms){if(document.body.classList.contains('rm')||!to){el.textContent=to;return}const t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/ms);el.textContent=Math.round(to*k);if(k<1)requestAnimationFrame(f)})(t0)}
function results(){
 const tot=M.res.reduce((a,b)=>a+b,0),max=CLIPS.length*MAX,pct=Math.round(tot/max*100),ok=pct>=PASS;
 S.att.push(pct);if(ok)award('mock');M.on=false;$('#steps').classList.add('hidden');
 $('#fMax').textContent=max;$('#cDate').textContent=new Date().toLocaleDateString('en-GB');countUp($('#fTotal'),tot,1200);
 $('#fVerdict').innerHTML='<strong class="'+(ok?'pass':'fail')+'">'+(ok?'Pass':'Not yet a pass')+'</strong> at '+pct+'% (pass mark '+PASS+'%, matching 44 out of 75).';
 $('#fRows').innerHTML=CLIPS.map((c,i)=>'<div class="rr"><span>'+c.title+'</span><div class="meter"><i data-w="'+M.res[i]/MAX*100+'"></i></div><b>'+M.res[i]+'/'+MAX+'</b></div>').join('');
 show('results');$$('#fRows i').forEach((e,i)=>setTimeout(()=>e.style.width=e.dataset.w+'%',300+i*450));
 $('#sr').textContent='Practice test finished. You scored '+tot+' out of '+max+', '+pct+' percent. '+(ok?'Pass.':'Not yet a pass.');
}

/* ---------- badges, router, settings ---------- */
function award(id){if(S.badges[id])return;S.badges[id]=1;const b=BADGES[id],t=$('#toast');t.textContent=b[0]+' Badge unlocked: '+b[1];t.classList.add('on');setTimeout(()=>t.classList.remove('on'),3200)}
function show(id){
 if(id!=='clip'){P.run=false;cancelAnimationFrame(raf)}
 if(id!=='clip'&&id!=='results')$('#steps').classList.add('hidden');
 $$('.screen').forEach(s=>s.classList.add('hidden'));const el=$('#'+id);el.classList.remove('hidden','enter');void el.offsetWidth;el.classList.add('enter');
 $$('nav button').forEach(b=>b.removeAttribute('aria-current'));const nb=$('nav [data-go="'+(id==='clip'||id==='results'?'practice':id)+'"]');if(nb)nb.setAttribute('aria-current','page');
 if(id==='profile')profile();if(id==='theory')quiz(Q.mode);window.scrollTo(0,0);
}

/* ---------- profile ---------- */
function profile(){
 const n=S.hist.length,avg=n?(S.hist.reduce((a,b)=>a+b.s,0)/n).toFixed(1):'-';
 $('#stats').innerHTML=[['Clips completed',n],['Average score',avg+(n?' / 5':'')],['Current streak','🔥 '+S.streak],['Best streak',S.best]].map(x=>'<div class="card"><span class="mut">'+x[0]+'</span><b>'+x[1]+'</b></div>').join('');
 if(!n)$('#chart').innerHTML='<p class="mut">Complete a clip to see your history chart.</p>';
 else{const w=900,h=170,pts=S.hist.map((x,i)=>[n>1?30+i*(w-60)/(n-1):w/2,h-20-x.s/MAX*(h-40)]);
  $('#chart').innerHTML='<svg viewBox="0 0 '+w+' '+h+'" width="100%" role="img" aria-label="Line chart of your clip scores over time, out of 5">'+[0,5].map(v=>'<line x1="30" x2="'+(w-30)+'" y1="'+(h-20-v/MAX*(h-40))+'" y2="'+(h-20-v/MAX*(h-40))+'" stroke="currentColor" opacity=".2"/>').join('')+'<polyline fill="none" stroke="#d6232a" stroke-width="3" points="'+pts.map(p=>p.join(',')).join(' ')+'"/>'+pts.map((p,i)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="#d6232a"><title>Clip '+(i+1)+': '+S.hist[i].s+'/5</title></circle>').join('')+'</svg>'}
 $('#badges').innerHTML=Object.keys(BADGES).map(k=>{const b=BADGES[k];return'<div class="bd'+(S.badges[k]?' on':'')+'"><span>'+b[0]+'</span><b>'+b[1]+'</b><div class="mut">'+b[2]+'</div></div>'}).join('');
 $('#hist').innerHTML=n?S.hist.slice(-8).reverse().map(x=>'<tr><td>'+x.title+'</td><td>'+x.cat+'</td><td>'+x.s+' / 5</td></tr>').join(''):'<tr><td class="mut">No clips yet.</td></tr>';
}

/* ---------- theory and signs ---------- */
const tri=e=>'<svg class="sign" viewBox="0 0 100 100" role="img" aria-label="Warning sign"><polygon points="50,8 94,88 6,88" fill="#fff" stroke="#c8102e" stroke-width="8" stroke-linejoin="round"/><text x="50" y="76" font-size="34" text-anchor="middle">'+e+'</text></svg>';
const SIGNS=[
{n:'Stop sign',svg:'<svg class="sign" viewBox="0 0 100 100" role="img" aria-label="Red octagon sign reading STOP"><polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="#c8102e" stroke="#fff" stroke-width="4"/><text x="50" y="58" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">STOP</text></svg>',d:'Stop at the line and give way to all traffic before moving off'},
{n:'Give way sign',svg:'<svg class="sign" viewBox="0 0 100 100" role="img" aria-label="Downward pointing triangle sign reading GIVE WAY"><polygon points="6,12 94,12 50,92" fill="#fff" stroke="#c8102e" stroke-width="10" stroke-linejoin="round"/><text x="50" y="38" font-size="13" font-weight="700" fill="#111" text-anchor="middle">GIVE WAY</text></svg>',d:'Slow down and give way to traffic on the main road, stopping if necessary'},
{n:'No entry sign',svg:'<svg class="sign" viewBox="0 0 100 100" role="img" aria-label="Red circle with white horizontal bar"><circle cx="50" cy="50" r="46" fill="#c8102e"/><rect x="18" y="42" width="64" height="16" fill="#fff"/></svg>',d:'Do not enter, traffic may not drive into this road'},
{n:'30 mph limit',svg:'<svg class="sign" viewBox="0 0 100 100" role="img" aria-label="Red ringed circle showing 30"><circle cx="50" cy="50" r="42" fill="#fff" stroke="#c8102e" stroke-width="10"/><text x="50" y="63" font-size="38" font-weight="700" fill="#111" text-anchor="middle">30</text></svg>',d:'Do not drive faster than 30 mph'},
{n:'Children crossing warning',svg:tri('🚸'),d:'Slow down and look out for children, a school may be nearby'},
{n:'Road works warning',svg:tri('🚧'),d:'Slow down and be ready for workers, narrowed lanes or a change of route'}];
const THEORY=[
{q:'In ideal conditions, what is the typical overall stopping distance at 30 mph?',o:['9 metres (30 feet)','23 metres (75 feet)','36 metres (120 feet)','53 metres (175 feet)'],a:1,why:'Thinking distance plus braking distance at 30 mph is about 23 metres, or 6 car lengths.'},
{q:'What is the legal minimum tyre tread depth for a car?',o:['1.0 mm','1.6 mm','2.0 mm','3.0 mm'],a:1,why:'The legal minimum is 1.6 mm across the central three-quarters of the tread, around the whole tyre.'},
{q:'On wet roads, stopping distances are at least...',o:['The same as dry roads','1.5 times longer','Twice as long','Ten times longer'],a:2,why:'Wet roads roughly double stopping distances, so leave at least a 4 second gap.'},
{q:'When may you use front fog lights?',o:['Whenever it is raining','When visibility is seriously reduced, under about 100 metres','At night on any road','Only on motorways'],a:1,why:'Use fog lights only when visibility is seriously reduced, and switch them off when it improves.'},
{q:'You approach a zebra crossing and someone has stepped onto it. You should...',o:['Sound your horn','Flash your lights','Give way and let them cross','Speed up to pass before they cross'],a:2,why:'You must give way to anyone who has moved onto a zebra crossing.'},
{q:'What is the safest advice about alcohol and driving?',o:['Stay under the limit','Drink only one drink','Do not drink any alcohol if you are driving','Drink water between drinks'],a:2,why:'Alcohol slows reactions and affects judgement even below the limit. The only safe amount is none.'}];
let Q={mode:'theory',items:[],i:0,sc:0,done:false};
function quiz(mode){
 Q={mode,i:0,sc:0,done:false,items:mode==='signs'?sh(SIGNS).map(s=>{const o=sh([s.d].concat(sh(SIGNS.filter(x=>x!==s)).slice(0,3).map(x=>x.d)));return{svg:s.svg,q:'What does this sign mean and what should you do?',o,a:o.indexOf(s.d),why:s.n+': '+s.d+'.'}}):sh(THEORY).map(x=>{const o=sh(x.o.map((t,i)=>[t,i===x.a]));return{q:x.q,o:o.map(z=>z[0]),a:o.findIndex(z=>z[1]),why:x.why}})};
 $('#tabT').setAttribute('aria-selected',mode==='theory');$('#tabS').setAttribute('aria-selected',mode==='signs');qr();
}
function qr(){
 const el=$('#quiz'),it=Q.items[Q.i];
 if(Q.done||!it){const n=Q.items.length;if(!Q.done){Q.done=true;S.quiz.push(Q.sc);if(Q.sc===n)award('quiz')}el.innerHTML='<h2>Quiz complete</h2><div class="big">'+Q.sc+'<small> / '+n+'</small></div><p>'+(Q.sc===n?'Perfect score.':'Review the explanations and try again.')+'</p><button id="qagain">Try again</button>';return}
 el.innerHTML='<p class="mut">Question '+(Q.i+1)+' of '+Q.items.length+'</p>'+(it.svg||'')+'<h2>'+it.q+'</h2><div class="opts">'+it.o.map((t,i)=>'<button data-i="'+i+'">'+t+'</button>').join('')+'</div><div id="qf" aria-live="polite"></div>';
}
$('#quiz').addEventListener('click',e=>{
 if(e.target.id==='qagain')return quiz(Q.mode);
 if(e.target.id==='qnext'){Q.i++;return qr()}
 const b=e.target.closest('[data-i]');if(!b||b.disabled)return;const it=Q.items[Q.i],i=+b.dataset.i;
 $$('#quiz .opts button').forEach((x,k)=>{x.disabled=true;if(k===it.a)x.classList.add('ok')});if(i!==it.a)b.classList.add('bad');else Q.sc++;
 $('#qf').innerHTML='<p><b>'+(i===it.a?'Correct. ':'Not quite. ')+'</b>'+it.why+'</p><button id="qnext">'+(Q.i===Q.items.length-1?'Finish':'Next question')+'</button>';
});

/* ---------- wiring ---------- */
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>b.dataset.go==='practice'?start():show(b.dataset.go)));
$$('[data-start]').forEach(b=>b.addEventListener('click',start));
$$('[data-mode]').forEach(b=>b.addEventListener('click',()=>quiz(b.dataset.mode)));
$('#next').addEventListener('click',()=>{M.i++;M.i>=CLIPS.length?results():startClip()});
$('#replay').addEventListener('click',()=>replay(true));
$('#spd').addEventListener('input',e=>{$('#spdv').textContent=e.target.value+'x';if(P.mode==='replay')P.sp=+e.target.value});
$('#print').addEventListener('click',()=>window.print());
$('#theme').addEventListener('change',e=>{document.documentElement.dataset.theme=e.target.value});
$('#rm').addEventListener('change',e=>document.body.classList.toggle('rm',e.target.checked));
$('#cc').addEventListener('change',e=>$('#capt').classList.toggle('hidden',!e.target.checked||$('#clip').classList.contains('hidden')));
document.addEventListener('keydown',e=>{if(e.code==='Space'&&P.run&&P.mode==='test'){e.preventDefault();if(!e.repeat)flag()}});
if(matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark';$('#theme').value='dark'}
if(matchMedia('(prefers-reduced-motion: reduce)').matches){$('#rm').checked=true;document.body.classList.add('rm')}
show('home');
})();
