(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d'),W=800,H=450,HY=165,CX=400,FOC=14,ROAD=3.5,MAX=5,PASS=59;
const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);

/* Session-only state (nothing is stored in the browser; a refresh clears it) */
const S={hist:[],att:[],quiz:[],streak:0,best:0,badges:{}};
const BADGES={first:['🏁','First clip','Complete any clip'],perfect:['🎯','Perfect 5','Score 5 out of 5 on a clip'],streak5:['🔥','Hot streak','5 clips in a row scoring 4 or more'],decoy:['🛡️','Cool head','Leave a decoy clip unflagged'],mock:['🏆','Test passed','Pass a full practice test'],quiz:['📘','Quiz ace','Get every question right in a quiz']};

/* Road signs: [id, name, shape, symbol, meaning and action, category] */
const R='Regulatory',MD='Mandatory',WN='Warning',IN='Information';
const SG0=[
['stop','Stop','stop','','Stop at the line and give way to all traffic before moving off.',R],
['give','Give way','give','','Slow down and give way to traffic on the main road, stopping if necessary.',R],
['noentry','No entry','noentry','','Vehicles must not enter this road.',R],
['l20','20 mph limit','circ','20','Maximum speed 20 mph.',R],['l30','30 mph limit','circ','30','Maximum speed 30 mph.',R],
['l40','40 mph limit','circ','40','Maximum speed 40 mph.',R],['l50','50 mph limit','circ','50','Maximum speed 50 mph.',R],
['l60','60 mph limit','circ','60','Maximum speed 60 mph.',R],['l70','70 mph limit','circ','70','Maximum speed 70 mph.',R],
['nsl','National speed limit','nsl','','60 mph on single carriageways and 70 mph on dual carriageways and motorways for cars, unless a lower limit applies.',R],
['noveh','No vehicles','circ','','No vehicles of any kind may enter.',R],
['nomot','No motor vehicles','circ','🚗','Motor vehicles are not allowed.',R],
['nocyc','No cycling','circ','🚲','Pedal cycles are prohibited.',R],
['noped','No pedestrians','circ','🚶','Pedestrians are prohibited.',R],
['noot','No overtaking','circ','🚗🚗','Do not overtake other vehicles.',R],
['nol','No left turn','circ','⬅','Do not turn left.',R],['nor','No right turn','circ','➡','Do not turn right.',R],
['nou','No U-turns','circ','↩','Do not make a U-turn.',R],
['nogv','No goods vehicles','circ','🚚','Goods vehicles over the stated weight may not enter.',R],
['maxw','Weight limit','circ','7.5t','No vehicles over the weight shown (here 7.5 tonnes).',R],
['maxh','Height limit','circ','↕3m','No vehicles over the height shown. Check your vehicle height before entering.',R],
['nowait','No waiting','nowait','','Do not wait or park during the times shown on the plate.',R],
['nostop','No stopping (clearway)','nostop','','You must not stop at all, not even to pick up or set down.',R],
['ahead','Ahead only','blue','⬆','You must go straight ahead.',MD],['tl','Turn left ahead','blue','⬅','You must turn left ahead.',MD],
['tr','Turn right ahead','blue','➡','You must turn right ahead.',MD],['kl','Keep left','blue','↙','Keep to the left of the sign.',MD],
['rbt','Roundabout','blue','🔄','Follow the roundabout direction and give way to traffic from the right.',MD],
['cycr','Cycle route','blue','🚲','Route for pedal cycles only.',MD],['pedr','Pedestrian route','blue','🚶','Route for pedestrians only.',MD],
['bus','Buses only','blue','🚌','Road or lane for buses only. Other traffic must stay out.',MD],
['min30','Minimum speed','blue','30','Minimum speed 30 mph unless road conditions make it unsafe.',MD],
['kids','Children','tri','🚸','Slow down and look out for children. A school may be nearby.',WN],
['works','Road works','tri','🚧','Slow down and be ready for workers, narrowed lanes or a change of route.',WN],
['xing','Pedestrian crossing ahead','tri','🚶≡','Slow down and be ready to give way to people on the crossing.',WN],
['cattle','Cattle','tri','🐄','Animals may be in the road. Slow down.',WN],['horse','Horse riders','tri','🐴','Horse riders may be ahead. Slow down and give them plenty of room.',WN],
['deer','Wild animals','tri','🦌','Wild animals may cross. Slow down, especially at dusk and dawn.',WN],
['cyc','Cyclists','tri','🚲','Cyclists may be on or crossing the road ahead. Give them space.',WN],
['ice','Risk of ice','tri','❄️','The road may be icy. Reduce speed and avoid harsh braking.',WN],
['flood','Risk of flooding','tri','🌊','Water may be on the road. Slow down and test your brakes after.',WN],
['rocks','Falling rocks','tri','⛰️','Rocks may fall or lie on the road. Be ready to stop.',WN],
['br','Bend to the right','tri','↱','Slow down before the bend and keep to your side.',WN],['bl','Bend to the left','tri','↰','Slow down before the bend and keep to your side.',WN],
['sb','Series of bends','tri','〰','Several bends ahead. Slow down and do not overtake.',WN],
['tj','T-junction','tri','┬','The road ends at a junction ahead. Be ready to stop or give way.',WN],
['xr','Crossroads','tri','┼','A crossroads ahead. Watch for traffic from all sides.',WN],
['sr','Side road on the right','tri','├','Traffic may emerge from a side road on the right.',WN],['sl','Side road on the left','tri','┤','Traffic may emerge from a side road on the left.',WN],
['rbw','Roundabout ahead','tri','⟳','Slow down and prepare to give way to traffic from the right.',WN],
['tram','Tram crossing','tri','🚋','Trams cross the road ahead. Do not stop on the tracks.',WN],
['lcn','Level crossing without barrier','tri','🚂','Be ready to stop. Look and listen for trains.',WN],
['lcb','Level crossing with barrier','tri','🚂🚧','Barriers or gates may close. Stop when lights flash or the barrier lowers.',WN],
['tls','Traffic signals ahead','tri','🚦','Signals ahead. Slow down and be ready to stop, especially if they may have failed.',WN],
['nar','Road narrows','tri','⇥⇤','The road narrows on both sides. Be ready to give way.',WN],
['twoway','Two-way traffic crosses','tri','⇅','Traffic crosses ahead in both directions. Check carefully.',WN],
['hump','Road humps','tri','⌒','Humps in the road ahead. Slow down.',WN],
['q','Queues likely','tri','🚗🚗','Queues may be ahead. Slow down and watch for stopped traffic.',WN],
['air','Low-flying aircraft','tri','✈','Low aircraft or noise may startle you. Keep control.',WN],
['wind','Strong crosswinds','tri','🌬','Strong gusts may push your vehicle. Grip the wheel firmly.',WN],
['elec','Overhead electric cable','tri','⚡','Cables hang overhead. Take care with tall loads.',WN],
['steep','Steep hill downwards','tri','↘10%','A steep hill ahead. Use a lower gear and do not ride the brakes.',WN],
['gen','Other danger','tri','!','A hazard with no sign of its own. Read the plate below to see what.',WN],
['park','Parking','rect','P','A parking place.',IN],['hosp','Hospital','rect','H','Hospital ahead. Expect ambulances and pedestrians.',IN],
['ow','One-way street','rect','➡','Traffic flows one way only, in the direction shown.',IN],
['dead','No through road','rect','⊥','A dead end. There is no through route for vehicles.',IN],
['mwy','Motorway','rect','M','Motorway rules apply.',IN]];
const SGM={};SG0.forEach(a=>SGM[a[0]]={id:a[0],n:a[1],sh:a[2],t:a[3],d:a[4],c:a[5]});const SGL=Object.values(SGM);
function svgOf(s,cls){
 const t=s.t,fs=/^[\d.]+t?$/.test(t)?(t.length>3?24:34):[...t].length>1?24:34,
 tx=(y,col)=>t?'<text x="50" y="'+y+'" font-size="'+fs+'" font-weight="700" fill="'+col+'" text-anchor="middle">'+t+'</text>':'',
 B={stop:'<polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill="#c8102e" stroke="#fff" stroke-width="4"/><text x="50" y="58" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">STOP</text>',
 give:'<polygon points="6,12 94,12 50,92" fill="#fff" stroke="#c8102e" stroke-width="10" stroke-linejoin="round"/><text x="50" y="38" font-size="13" font-weight="700" fill="#111" text-anchor="middle">GIVE WAY</text>',
 noentry:'<circle cx="50" cy="50" r="46" fill="#c8102e"/><rect x="18" y="42" width="64" height="16" fill="#fff"/>',
 circ:'<circle cx="50" cy="50" r="42" fill="#fff" stroke="#c8102e" stroke-width="10"/>'+tx(62,'#111'),
 nsl:'<circle cx="50" cy="50" r="42" fill="#fff" stroke="#222" stroke-width="6"/><line x1="26" y1="74" x2="74" y2="26" stroke="#111" stroke-width="8"/>',
 nowait:'<circle cx="50" cy="50" r="42" fill="#0a5cb8" stroke="#c8102e" stroke-width="9"/><line x1="24" y1="76" x2="76" y2="24" stroke="#c8102e" stroke-width="9"/>',
 nostop:'<circle cx="50" cy="50" r="42" fill="#0a5cb8" stroke="#c8102e" stroke-width="9"/><path d="M26 26 74 74M74 26 26 74" stroke="#c8102e" stroke-width="9"/>',
 blue:'<circle cx="50" cy="50" r="46" fill="#0a5cb8"/>'+tx(62,'#fff'),
 tri:'<polygon points="50,8 94,88 6,88" fill="#fff" stroke="#c8102e" stroke-width="8" stroke-linejoin="round"/>'+tx(72,'#111'),
 rect:'<rect x="6" y="6" width="88" height="88" rx="10" fill="#0a5cb8" stroke="#fff" stroke-width="4"/>'+tx(66,'#fff')};
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"'+(cls?' class="'+cls+'" role="img" aria-label="Road sign"':'')+'>'+B[s.sh]+'</svg>';
}
const IMG={};function simg(id){if(!SGM[id])return null;if(!IMG[id]){const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgOf(SGM[id]));IMG[id]=i}return IMG[id]}

/* Clips: z = metres ahead, lat = metres from road centre (negative = left). h marks the hazard. */
const O=(k,z0,lat,x)=>Object.assign({k,st:t=>({z:z0-10*t,lat:typeof lat==='function'?lat(t):lat})},x);
const SN=(s,z0,lat)=>({k:'sign',s,st:t=>({z:z0-10*t,lat})});
const CLIPS=[
{id:'van',title:'Parked van',cat:'Pedestrians',dur:11,v:10,mph:30,time:'day',wx:'clear',hs:6.5,he:9,
 cap:'Daytime, clear weather. You drive at 30 mph along a residential road. A white van is parked on the left.',
 why:'A child stepped out from behind the parked van.',
 tip:'Flag when the child first appears from behind the van. Large parked vehicles hide pedestrians, so the van is the clue: ease off and cover the brake before anyone appears.',
 objs:[O('child',131.5,t=>t<6?-4.6:Math.min(-.4,-4.6+1.5*(t-6)),{h:1}),O('van',130,-4.6),SN('l30',75,-4.2)]},
{id:'side',title:'Side road in the rain',cat:'Junctions',dur:10,v:10,mph:30,time:'day',wx:'rain',hs:5,he:8,side:110,
 cap:'Daytime, steady rain. You drive at 30 mph. A side road joins on the left.',
 why:'The car waiting at the side road began to pull out.',
 tip:'Flag as the car starts to creep forward. In rain, stopping distances double, so an emerging car is a hazard from its first movement.',
 objs:[O('car',112,t=>t<5?-7.5:-7.5+.8*(t-5)**2,{c:'#2f6fd0',h:1}),SN('sl',70,-4.4)]},
{id:'bike',title:'Cyclist and parked car',cat:'Cyclists',dur:9.5,v:10,mph:30,time:'day',wx:'fog',hs:5.8,he:8.5,
 cap:'Daytime, light fog. You drive at 30 mph. A cyclist rides ahead in your lane near a parked car on the left.',
 why:'The cyclist moved out to pass the parked car and into your path.',
 tip:'Flag as the cyclist starts to drift right. A cyclist reaching a parked car will almost always move out, so watch for a wobble or a glance back.',
 objs:[O('car',100,-2.6,{c:'#2a8a55'}),{k:'bike',h:1,st:t=>({z:70-6*t,lat:t<6?-1.2:-1.2+Math.min(1,(t-6)/1.5)*2.2})},SN('cyc',60,-4.4)]},
{id:'night',title:'Quiet road at night (decoy)',cat:'Decoy',dur:9,v:10,mph:30,time:'night',wx:'clear',hs:null,he:null,
 cap:'Night time. You drive at 30 mph along a quiet road with parked cars on both sides. A pedestrian walks on the right pavement.',
 why:'Nothing here develops into a hazard. The pedestrian stays on the pavement walking away from you.',
 tip:'Not every clip has a hazard. Only flag something that would make you slow down, stop or change direction.',
 objs:[O('car',90,-3.1,{c:'#8a2a2a'}),O('car',140,4.4,{c:'#556'}),{k:'child',st:t=>({z:75-8.8*t,lat:5.6})},SN('l30',70,-4.4)]},
{id:'school',title:'School crossing',cat:'Pedestrians',dur:9,v:10,mph:20,time:'day',wx:'clear',hs:6,he:8.2,
 cap:'Daytime, clear weather. You drive at 20 mph near a school. Children are on the left pavement.',
 why:'A child ran off the pavement into the road.',
 tip:'The children warning sign and the 20 limit tell you to expect this. Flag as soon as a child leaves the pavement edge, or even earlier if you feel one may run.',
 objs:[O('child',95,t=>t<6?-5.5:Math.min(-.8,-5.5+2.2*(t-6)),{h:1}),SN('kids',80,-4.4),SN('l20',55,-4.6)]},
{id:'ball',title:'Ball in the road',cat:'Pedestrians',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5.2,he:7.7,
 cap:'Daytime, clear weather. You drive at 30 mph. A car is parked on the right.',
 why:'A ball rolled out from behind the parked car.',
 tip:'Flag when the ball appears. A ball in the road means a child is probably about to chase it, so slow down straight away.',
 objs:[{k:'ball',h:1,st:t=>({z:105-10*t,lat:t<5?4.3:Math.max(-3,4.3-3*(t-5))})},O('car',106,4.3,{c:'#b8892a'}),SN('l30',70,-4.4)]},
{id:'door',title:'Car door opening',cat:'Parked cars',dur:8.5,v:10,mph:30,time:'day',wx:'clear',hs:5.3,he:7.6,
 cap:'Daytime, clear weather. You drive at 30 mph past a line of parked cars on the left.',
 why:'The driver of the parked car opened their door into the road.',
 tip:'Flag as the door starts to swing open. Leave at least a door width when passing parked cars and watch for people inside.',
 objs:[O('car',95,-2.6,{c:'#2a5aa0'}),{k:'door',h:1,st:t=>({z:94-10*t,lat:t<5.5?-1.75:-1.75+Math.min(1,(t-5.5)/.8)})},SN('park',60,-4.5)]},
{id:'bus',title:'Bus pulling out',cat:'Large vehicles',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5,he:8,
 cap:'Daytime, clear weather. You drive at 30 mph. A bus is stopped at a bus stop on the left.',
 why:'The bus pulled away from the stop into your lane.',
 tip:'Flag when the bus starts to move away from the kerb. Buses are entitled to pull out, so be ready to slow down and let them go.',
 objs:[{k:'bus',c:'#c8322a',h:1,st:t=>({z:t<5?100-10*t:50-8*(t-5),lat:t<5?-3:Math.min(-.3,-3+.45*(t-5)**2)})},SN('l30',65,-4.4)]},
{id:'overtake',title:'Oncoming overtake',cat:'Vehicles',dur:8,v:10,mph:40,time:'day',wx:'clear',hs:5,he:7.2,
 cap:'Daytime, clear weather. You drive at 40 mph. A cyclist and a car approach in the opposite lane.',
 why:'The oncoming car pulled out into your lane to overtake the cyclist.',
 tip:'Flag as the oncoming car starts to drift towards the centre line. Be ready to slow down and leave room for it.',
 objs:[{k:'bike',st:t=>({z:120-13*t,lat:2})},{k:'car',c:'#e8791a',f:1,h:1,st:t=>({z:135-16*t,lat:t<5?1.7:1.7-Math.min(1,(t-5)/1.8)*2.2})},SN('l40',70,-4.4)]},
{id:'brake',title:'Brake lights ahead',cat:'Vehicles',dur:9,v:10,mph:40,time:'day',wx:'clear',hs:5,he:7.5,
 cap:'Daytime, clear weather. You drive at 40 mph behind a purple car.',
 why:'The car ahead braked sharply for the queue.',
 tip:'Flag when the brake lights come on. The queues sign warned you, so slow down gradually and keep a safe gap.',
 objs:[{k:'car',c:'#7a3a8a',h:1,br:t=>t>=5,st:t=>({z:t<5?70-2*t:60-8*(t-5),lat:-1.7})},SN('q',70,-4.4)]},
{id:'moto',title:'Motorcyclist from the right',cat:'Junctions',dur:10,v:10,mph:30,time:'day',wx:'clear',hs:5,he:8,side:110,sd:1,
 cap:'Daytime, clear weather. You drive at 30 mph. A side road joins on the right.',
 why:'A motorcyclist pulled out of the side road on the right.',
 tip:'Flag as the motorcycle starts to move. Motorcycles are small and easy to miss, so any movement from a junction is a hazard.',
 objs:[O('moto',112,t=>t<5?7.5:7.5-.8*(t-5)**2,{h:1}),SN('sr',70,4.4)]},
{id:'dog',title:'Dog near the road',cat:'Animals',dur:9.5,v:10,mph:30,time:'day',wx:'rain',hs:6,he:8.5,
 cap:'Daytime, rain. You drive at 30 mph on a country road. There is an animal warning sign.',
 why:'A dog ran from the right verge towards the road.',
 tip:'Flag when the dog starts to run towards the road. The animals sign tells you to expect this, and wet roads mean longer stopping distances.',
 objs:[{k:'dog',h:1,st:t=>({z:105-10*t,lat:t<6?5.6:Math.max(-1,5.6-2.6*(t-6))})},SN('cattle',65,-4.4)]},
{id:'quiet',title:'Quiet crossroads (decoy)',cat:'Decoy',dur:8,v:10,mph:30,time:'day',wx:'clear',hs:null,he:null,
 cap:'Daytime, clear weather. You approach a crossroads on a quiet road. A cyclist rides on the right pavement away from you.',
 why:'No traffic or person moves towards your path. The crossroads sign was a warning only.',
 tip:'A junction ahead is not a hazard until something starts to develop. Stay alert but only flag a real developing hazard.',
 objs:[O('car',80,-3.1,{c:'#3a6aa8'}),{k:'bike',st:t=>({z:70-3*t,lat:5.2})},SN('xr',70,-4.4),SN('l30',100,-4.4)]}
];
CLIPS.forEach(c=>c.objs.forEach(o=>{if(o.s)simg(o.s)}));


let look=0,lookT=0;
let P={c:CLIPS[0],t:0,sp:1,run:false,mode:'test',last:0,tip:false},raf=0,clicks=[],M={i:0,res:[],on:false,list:[]},HZ=null,lastS=0;

/* ---------- drawing ---------- */
function proj(z,lat){const d=Math.min(1.5,FOC/z);return{d,x:CX+lat/ROAD*(12+330*d),y:HY+(H-HY)*d}}
function poly(p,col){ctx.fillStyle=col;ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill()}
function draw(){
 const c=P.c,t=P.t,v=c.v,RM=document.body.classList.contains('rm'),night=c.time==='night';
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.save();HZ=null;look+=((RM?0:lookT)-look)*.1;
 if(!RM){ctx.translate(W/2,H/2);ctx.rotate(Math.sin(t*1.4)*.004);ctx.scale(1.04,1.04);ctx.translate(-W/2+look*9,-H/2+Math.sin(t*6.5)*1.3)}
 const pal=night?['#050b1a','#17264a']:{clear:['#7fb2e8','#d7e8f6'],rain:['#6b7787','#a9b3bf'],fog:['#c5cbd1','#dde1e4']}[c.wx];
 const g=ctx.createLinearGradient(0,0,0,HY);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);ctx.fillStyle=g;ctx.fillRect(-20,-20,W+40,HY+20);
 if(!night&&c.wx!=='fog'){ctx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<4;i++){const x=((i*300-(RM?0:t*6))%1100+1100)%1100-150;ctx.beginPath();ctx.ellipse(x,40+i*22,70,16,0,0,7);ctx.fill()}}
 [['#7d9aa8',.012,30],['#5f8a5a',.02,16]].forEach((l,L)=>{ctx.fillStyle=night?'#0c1a14':l[0];ctx.beginPath();ctx.moveTo(-60,HY);for(let x=-60;x<=W+60;x+=40)ctx.lineTo(x+(RM?0:Math.sin(t*1.4)*(L+1)*3+look*(L+1)*7),HY-l[2]-l[2]*.6*Math.sin(x*l[1]*2+L*2));ctx.lineTo(W+60,HY);ctx.fill()});
 ctx.fillStyle=night?'#1f3a1a':{clear:'#4f8a3c',rain:'#3d6b30',fog:'#6d8a62'}[c.wx];ctx.fillRect(-20,HY,W+40,H-HY+20);
 poly([[CX-12,HY],[CX+12,HY],[CX+342,H],[CX-342,H]],c.wx==='rain'?'#3a3d44':'#4a4d54');
 ctx.strokeStyle='#bfc3c8';ctx.lineWidth=3;[-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(CX+s*12,HY);ctx.lineTo(CX+s*342,H);ctx.stroke()});
 if(c.side){const z=c.side-v*t;if(z>3){const sd=c.sd||-1,ex=sd<0?0:W,a=proj(z+5,sd*ROAD),b=proj(z-5,sd*ROAD),a2=proj(z+5,sd*60),b2=proj(z-5,sd*60);poly([[a.x,a.y],[b.x,b.y],[ex,b2.y],[ex,a2.y]],'#3a3d44')}}
 ctx.strokeStyle='#e8e8e8';for(let k=0;k<22;k++){const z=((8*k-v*t)%176+176)%176;if(z<3)continue;const a=proj(z,0),b=proj(z-3,0);ctx.lineWidth=Math.max(1,7*a.d);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 const sc=[];for(let k=0;k<8;k++)[-1,1].forEach(s=>{const z=((25*k+(s>0?12:0)-v*t)%200+200)%200;if(z>3)sc.push({k:'tree',z,lat:s*(6.5+(k%2))})});
 for(let k=0;k<7;k++)[-1,1].forEach(s=>{const z=((30*k+(s>0?15:0)-v*t)%210+210)%210;if(z>7)sc.push({k:'house',z,lat:s*9,col:(k+(s>0?1:0))%3})});
 for(let k=0;k<5;k++)[-1,1].forEach(s=>{const z=((40*k+(s>0?20:0)-v*t)%200+200)%200;if(z>4)sc.push({k:'lamp',z,lat:s*3.9})});
 c.objs.forEach(o=>{const s=o.st(t);sc.push(Object.assign({},o,{z:s.z,lat:s.lat}))});
 sc.sort((a,b)=>b.z-a.z).forEach(o=>{if(o.z>=2.5)sprite(o)});
 if(c.wx==='fog'){const f=ctx.createLinearGradient(0,HY-10,0,HY+170);f.addColorStop(0,'rgba(205,210,214,.95)');f.addColorStop(1,'rgba(205,210,214,.08)');ctx.fillStyle=f;ctx.fillRect(-20,HY-10,W+40,H)}
 if(night){const r=ctx.createRadialGradient(CX,H,60,CX,H-120,520);r.addColorStop(0,'rgba(5,10,25,.05)');r.addColorStop(1,'rgba(5,10,25,.82)');ctx.fillStyle=r;ctx.fillRect(-20,-20,W+40,H+40);ctx.save();ctx.globalCompositeOperation='lighter';const hl=ctx.createLinearGradient(0,H,0,HY+20);hl.addColorStop(0,'rgba(255,240,190,.24)');hl.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=hl;ctx.beginPath();ctx.moveTo(CX-150,H);ctx.lineTo(CX-14,HY+20);ctx.lineTo(CX+14,HY+20);ctx.lineTo(CX+150,H);ctx.fill();ctx.restore()}
 if(c.wx==='rain'){ctx.strokeStyle='rgba(205,220,240,.55)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<90;i++){const x=(i*89)%W,y=((i*53)+(RM?0:t*700))%H;ctx.moveTo(x,y);ctx.lineTo(x-4,y+14)}ctx.stroke()}
 if(P.mode==='replay'&&HZ&&c.hs!=null)hint(c,t);
 ctx.restore();dash(c,t,RM);
 $('#prog').style.width=(t/c.dur*100)+'%';const ph=$('#ph');if(ph)ph.style.left=(t/c.dur*100)+'%';
}
const SW={van:130,car:120,bus:145,child:22,bike:40,ball:28,moto:20,dog:50};
function dash(c,t,RM){
 if(c.wx==='rain'){const a=-1.57+(RM?-.5:Math.sin(t*3.2)*1.15);ctx.strokeStyle='#0a0a0a';ctx.lineWidth=5;ctx.lineCap='round';[CX-110,CX+30].forEach(px=>{ctx.beginPath();ctx.moveTo(px,H-34);ctx.lineTo(px+Math.cos(a)*200,H-34+Math.sin(a)*200);ctx.stroke()})}
 const m=ctx.createLinearGradient(0,6,0,40);m.addColorStop(0,'#38414d');m.addColorStop(1,'#10151b');ctx.fillStyle=m;ctx.fillRect(CX-72,6,144,32);ctx.strokeStyle='#05070a';ctx.lineWidth=3;ctx.strokeRect(CX-72,6,144,32);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(CX-66,12,60,4);
 const g=ctx.createLinearGradient(0,H-76,0,H);g.addColorStop(0,'#1f242b');g.addColorStop(1,'#0a0c0f');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,H-34);ctx.quadraticCurveTo(CX,H-78,W,H-34);ctx.lineTo(W,H);ctx.fill();
 ctx.save();ctx.translate(CX+50,H+38);ctx.rotate(RM?0:Math.sin(t*.7)*.04);ctx.strokeStyle='#0d0f12';ctx.lineWidth=20;ctx.beginPath();ctx.ellipse(0,0,185,80,0,0,7);ctx.stroke();ctx.strokeStyle='#2d333c';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-3,185,80,0,3.3,6.1);ctx.stroke();ctx.fillStyle='#0d0f12';ctx.fillRect(-18,-80,36,60);ctx.restore();
 const gx=CX-250,gy=H-30;ctx.fillStyle='#0b0d10';ctx.beginPath();ctx.arc(gx,gy,34,0,7);ctx.fill();ctx.strokeStyle='#3a414c';ctx.lineWidth=3;ctx.stroke();const na=-2.4+Math.min(1,c.mph/70)*4.8+(RM?0:Math.sin(t*5)*.03);ctx.strokeStyle='#ff5a5a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+Math.cos(na)*28,gy+Math.sin(na)*28);ctx.stroke();ctx.fillStyle='#8fe3ff';ctx.font='10px Segoe UI, Arial';ctx.textAlign='center';ctx.fillText(c.mph+' mph',gx,gy+22);ctx.textAlign='start';
}
function hint(c,t){
 const z=HZ,cy=z.y-70*z.d;
 if(t>=c.hs-.3&&t<=c.he){ctx.save();ctx.strokeStyle='#f2b705';ctx.shadowColor='#f2b705';ctx.shadowBlur=20;ctx.lineWidth=4+Math.sin(t*10)*1.5;ctx.beginPath();ctx.ellipse(z.x,cy,55*z.d+14,85*z.d+14,0,0,7);ctx.stroke();ctx.restore()}
 if(P.tip){const txt=t>=c.hs&&t<=c.hs+1.4?'Press Space now!':t>=c.hs-1.8&&t<c.hs?'Watch this area...':'';
  if(txt){ctx.font='bold 20px Segoe UI, Arial';const w=ctx.measureText(txt).width+28,x=Math.max(8,Math.min(W-w-8,z.x-w/2)),y=Math.max(30,cy-85*z.d-48);ctx.fillStyle=txt[0]==='P'?'#f2b705':'#fff';ctx.fillRect(x,y,w,34);ctx.fillStyle='#111';ctx.fillText(txt,x+14,y+24)}}
}
function sprite(o){
 const p=proj(o.z,o.lat),d=p.d,x=p.x,y=p.y;if(o.h)HZ={x,y,d};
 const sw=SW[o.k];if(sw){ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y,sw*d,10*d,0,0,7);ctx.fill()}
 if(o.k==='tree'){ctx.fillStyle='#5a3d28';ctx.fillRect(x-6*d,y-120*d,12*d,120*d);ctx.fillStyle='#2e6b2e';ctx.beginPath();ctx.arc(x,y-150*d,55*d,0,7);ctx.fill()}
 else if(o.k==='sign'){ctx.fillStyle='#8a8f98';ctx.fillRect(x-2*d,y-150*d,4*d,150*d);const im=simg(o.s);if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,x-45*d,y-240*d,90*d,90*d)}
 else if(o.k==='house'){const sg=Math.sign(o.lat),L=Math.abs(o.lat);if(o.z<6)return;const A=proj(o.z,sg*L),B=proj(o.z+9,sg*L),C=proj(o.z,sg*(L+8)),hh=540,col=['#a9553d','#b4764a','#8d6f5b'][o.col||0],nt=P.c.time==='night';
  poly([[A.x,A.y],[B.x,B.y],[B.x,B.y-hh*B.d],[A.x,A.y-hh*A.d]],col);poly([[A.x,A.y],[B.x,B.y],[B.x,B.y-hh*B.d],[A.x,A.y-hh*A.d]],'rgba(0,0,0,.3)');
  poly([[A.x,A.y],[C.x,C.y],[C.x,C.y-hh*C.d],[A.x,A.y-hh*A.d]],col);poly([[A.x,A.y-hh*A.d],[C.x,C.y-hh*C.d],[(A.x+C.x)/2,A.y-(hh+70)*A.d]],'#4a3a3a');
  ctx.fillStyle=nt?'#ffd98a':'#bcd2e6';[.15,.62].forEach(u=>ctx.fillRect(A.x+(C.x-A.x)*u,A.y-hh*A.d*.6,(C.x-A.x)*.22,hh*A.d*.25));ctx.fillStyle='#3b2a22';ctx.fillRect(A.x+(C.x-A.x)*.4,A.y-hh*A.d*.38,(C.x-A.x)*.18,hh*A.d*.38)}
 else if(o.k==='lamp'){const sg=Math.sign(o.lat),ax=x-sg*55*d,nt=P.c.time==='night';ctx.fillStyle='#555';ctx.fillRect(x-3*d,y-330*d,6*d,330*d);ctx.fillRect(Math.min(x,ax),y-332*d,55*d,5*d);
  if(nt){const gl=ctx.createRadialGradient(ax,y-322*d,0,ax,y-322*d,90*d);gl.addColorStop(0,'rgba(255,230,150,.9)');gl.addColorStop(1,'rgba(255,230,150,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(ax,y-322*d,90*d,0,7);ctx.fill()}ctx.fillStyle=nt?'#fff3c0':'#ddd';ctx.beginPath();ctx.arc(ax,y-324*d,9*d,0,7);ctx.fill()}
 else if(o.k==='bus'){const w=280*d,h=215*d;ctx.fillStyle=o.c;ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-w/2+12*d,y-h+16*d,w-24*d,70*d);ctx.fillStyle='#fff';ctx.fillRect(x-w/2+12*d,y-h+100*d,w-24*d,14*d);ctx.fillStyle='#ffd24a';ctx.fillRect(x-w/2+8*d,y-50*d,22*d,26*d);ctx.fillRect(x+w/2-30*d,y-50*d,22*d,26*d);ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-14*d,w,14*d)}
 else if(o.k==='ball'){ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.arc(x,y-28*d,28*d,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,4*d);ctx.beginPath();ctx.arc(x,y-28*d,28*d,.3,2.4);ctx.stroke()}
 else if(o.k==='moto'){ctx.fillStyle='#222';ctx.fillRect(x-16*d,y-100*d,32*d,70*d);ctx.fillRect(x-7*d,y-34*d,14*d,34*d);ctx.fillStyle='#e8591a';ctx.beginPath();ctx.arc(x,y-118*d,17*d,0,7);ctx.fill();ctx.fillStyle='#ff3b3b';ctx.fillRect(x-6*d,y-62*d,12*d,8*d)}
 else if(o.k==='dog'){ctx.fillStyle='#8a5a2e';ctx.fillRect(x-45*d,y-62*d,90*d,38*d);ctx.fillRect(x+30*d,y-84*d,26*d,26*d);ctx.fillRect(x-40*d,y-26*d,10*d,26*d);ctx.fillRect(x+26*d,y-26*d,10*d,26*d);ctx.fillRect(x-58*d,y-70*d,18*d,8*d)}
 else if(o.k==='door'){ctx.fillStyle='#173a68';ctx.fillRect(x-28*d,y-105*d,56*d,70*d);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-24*d,y-100*d,48*d,28*d)}
 else if(o.k==='van'){const w=250*d,h=190*d;ctx.fillStyle='#e6e8ec';ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle='#8c95a3';ctx.fillRect(x-w/2+10*d,y-h+12*d,w-20*d,60*d);ctx.fillStyle='#d6232a';ctx.fillRect(x-w/2+6*d,y-45*d,22*d,26*d);ctx.fillRect(x+w/2-28*d,y-45*d,22*d,26*d);ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-12*d,w,12*d)}
 else if(o.k==='car'){const w=230*d,h=130*d;ctx.fillStyle=o.c;ctx.fillRect(x-w/2,y-h*.6,w,h*.6);ctx.fillRect(x-w*.36,y-h,w*.72,h*.45);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-w*.3,y-h*.95,w*.6,h*.38);const br=o.br&&o.br(P.t);ctx.fillStyle=o.f?'#fff3a6':br?'#ff1010':'#ff3b3b';if(br||o.f){ctx.shadowColor=o.f?'#fff3a6':'#f00';ctx.shadowBlur=18}ctx.fillRect(x-w/2+4*d,y-h*.5,(br?28:20)*d,(br?16:12)*d);ctx.fillRect(x+w/2-(br?32:24)*d,y-h*.5,(br?28:20)*d,(br?16:12)*d);ctx.shadowBlur=0;ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-8*d,w,8*d)}
 else if(o.k==='child'){const h=140*d;ctx.fillStyle='#f2c200';ctx.fillRect(x-17*d,y-h*.72,34*d,h*.45);ctx.fillStyle='#2a3a6a';ctx.fillRect(x-14*d,y-h*.28,28*d,h*.28);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.84,15*d,0,7);ctx.fill()}
 else if(o.k==='bike'){const h=150*d;ctx.strokeStyle='#111';ctx.lineWidth=Math.max(1,5*d);[-26,26].forEach(dx=>{ctx.beginPath();ctx.arc(x+dx*d,y-24*d,24*d,0,7);ctx.stroke()});ctx.fillStyle='#e8591a';ctx.fillRect(x-14*d,y-h*.75,28*d,h*.4);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.85,13*d,0,7);ctx.fill();ctx.fillStyle='#f5d400';ctx.fillRect(x-13*d,y-h*.95,26*d,8*d)}
}

/* ---------- playback ---------- */
function loop(now){
 if(!P.run)return;const dt=Math.min(.1,(now-P.last)/1000);P.last=now;P.t+=dt*P.sp;
 if(P.t>=P.c.dur){P.t=P.c.dur;P.run=false;try{draw()}catch(err){console.error(err)}if(P.mode==='test')finish();return}
 try{draw()}catch(err){console.error(err)}raf=requestAnimationFrame(loop);
}
function play(c,mode,sp,tip){cancelAnimationFrame(raf);P={c,t:0,sp,run:true,mode,last:performance.now(),tip:!!tip};raf=requestAnimationFrame(loop)}
function flag(){
 if(!(P.run&&P.mode==='test'))return;clicks.push(P.t);
 const f=document.createElement('div');f.className='fl';f.title='Flag at '+P.t.toFixed(1)+'s';f.innerHTML='<svg viewBox="0 0 40 40" width="30" height="30"><path d="M8 4v32M8 5h24l-6 8 6 8H8" fill="#d6232a" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>';
 const fl=$('#flags');if(clicks.length===1)fl.innerHTML='';fl.appendChild(f);const st=$('.stage');st.classList.add('hit');setTimeout(()=>st.classList.remove('hit'),250);$('#sr').textContent='Flag '+clicks.length;
}

/* ---------- test flow ---------- */
function steps(){const s=$('#steps');s.classList.remove('hidden');s.innerHTML='<span>Clip '+(M.i+1)+' of '+M.list.length+'</span>'+M.list.map((c,i)=>'<i class="'+(i<M.res.length?'done':i===M.i?'cur':'')+'"></i>').join('')}
function pick(){const d=sh(CLIPS.filter(c=>c.hs==null)),h=sh(CLIPS.filter(c=>c.hs!=null));return sh(d.slice(0,1).concat(h.slice(0,7)))}
function start(){M={i:0,res:[],on:true,list:pick()};startClip()}
function startClip(){
 const c=M.list[M.i];clicks=[];if(document.activeElement)document.activeElement.blur();
 $('#clipLbl').textContent='Clip '+(M.i+1)+' of '+M.list.length;$('#speedLbl').textContent=c.mph+' mph';
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
 $('#rvTitle').textContent='Clip '+(M.i+1)+': '+c.title+(c.hs==null?(s===5?'  ✅ Correct, no hazard':'  ❌ Flagged a non-hazard'):(s>0?'  ✅ Hazard spotted':'  ❌ Hazard missed'));countUp($('#rvScore'),s,900);
 const early=c.hs==null?0:clicks.filter(t=>t<c.hs).length,det=c.hs==null?'':clicks.map(t=>t.toFixed(1)+'s: '+(t<c.hs?'before the window':t>c.he?'after the window':'in the window ('+(MAX-Math.min(MAX-1,Math.floor((t-c.hs)/((c.he-c.hs)/MAX))))+' pts)')).join('; '),rows=c.hs==null?[['Hazards in this clip','None'],['Your flags',clicks.length]]:
  [['Scoring window',c.hs+'s to '+c.he+'s'],['Earliest scoring moment',c.hs+'s (5 points)'],['Your first flag in the window',r.f==null?'None':r.f.toFixed(1)+'s'],['Reaction time',r.f==null?'Not scored':(r.f-c.hs).toFixed(1)+'s after the window opened'],['Flags used',clicks.length+(r.spam?' (too many, scored 0)':'')+(early?', '+early+' before the window':'')],['Each flag',det||'None']];
 $('#rvTable').innerHTML=rows.map(x=>'<tr><th scope="row">'+x[0]+'</th><td>'+x[1]+'</td></tr>').join('');
 $('#rvMsg').textContent=c.hs==null?(s===5?'Well done. You correctly left this clip unflagged.':'There was no hazard here, so flagging scores 0.'):r.spam?'Too many flags. Repeated clicking scores 0.':!clicks.length?'You did not flag anything.':s===0?'Your flags were outside the scoring window.':s===5?'Perfect reaction.':s>=3?'Good, but earlier scores higher.':'Late. React as soon as the hazard starts to develop.';
 $('#rvTip').innerHTML='<b>'+(s===5?'Full marks. ':'How to score 5/5: ')+'</b>'+(s===5?c.why:c.why+' '+c.tip);const sids=c.objs.filter(o=>o.k==='sign').map(o=>o.s);$('#rvSigns').innerHTML=sids.length?'<h3>Signs in this clip</h3>'+sids.map(id=>'<div class="sgc">'+svgOf(SGM[id],'sign sm')+'<div><b>'+SGM[id].n+'</b><br>'+SGM[id].d+'</div></div>').join(''):'';if(s===5&&c.hs!=null)confetti(innerWidth/2,innerHeight/3);
 const tl=$('#tl');tl.innerHTML='';
 if(c.hs!=null){const cols=['#1b8a4f','#5aa13c','#c9a30a','#e07a14','#d6232a'],bw=(c.he-c.hs)/MAX;for(let i=0;i<MAX;i++){const b=document.createElement('div');b.className='band';b.style.cssText='left:'+((c.hs+i*bw)/c.dur*100)+'%;width:'+(bw/c.dur*100)+'%;background:'+cols[i]+';transition-delay:'+(i*150)+'ms';b.textContent=MAX-i;tl.appendChild(b);setTimeout(()=>b.classList.add('in'),60)}}
 clicks.forEach(t=>{const m=document.createElement('div');m.className='mk';m.style.left=(t/c.dur*100)+'%';tl.appendChild(m)});
 const ph=document.createElement('div');ph.id='ph';tl.appendChild(ph);
 $('#next').textContent=M.i===M.list.length-1?'See results':'Next clip';
 $('#sr').textContent='Clip scored '+s+' out of 5. '+$('#rvMsg').textContent;
 if(s<5&&c.hs!=null)setTimeout(()=>{if(M.on&&!$('#rev').classList.contains('hidden'))replay(true)},1200);
}
function replay(tip){const sp=+$('#spd').value;play(P.c,'replay',sp,tip===true&&lastS<5)}
function countUp(el,to,ms){if(document.body.classList.contains('rm')||!to){el.textContent=to;return}const t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/ms);el.textContent=Math.round(to*k);if(k<1)requestAnimationFrame(f)})(t0)}
function results(){
 const tot=M.res.reduce((a,b)=>a+b,0),max=M.list.length*MAX,pct=Math.round(tot/max*100),ok=pct>=PASS;
 S.att.push(pct);if(ok){award('mock');confetti(innerWidth/2,innerHeight/3)}M.on=false;$('#steps').classList.add('hidden');
 $('#fMax').textContent=max;$('#cDate').textContent=new Date().toLocaleDateString('en-GB');countUp($('#fTotal'),tot,1200);
 $('#fVerdict').innerHTML='<strong class="'+(ok?'pass':'fail')+'">'+(ok?'Pass':'Not yet a pass')+'</strong> at '+pct+'% (pass mark '+PASS+'%, matching 44 out of 75).';
 $('#fRows').innerHTML=M.list.map((c,i)=>'<div class="rr"><span>'+c.title+'</span><div class="meter"><i data-w="'+M.res[i]/MAX*100+'"></i></div><b>'+M.res[i]+'/'+MAX+'</b></div>').join('');
 show('results');$$('#fRows i').forEach((e,i)=>setTimeout(()=>e.style.width=e.dataset.w+'%',300+i*450));
 $('#sr').textContent='Practice test finished. You scored '+tot+' out of '+max+', '+pct+' percent. '+(ok?'Pass.':'Not yet a pass.');
}

/* ---------- badges, router, settings ---------- */
function award(id){if(S.badges[id])return;S.badges[id]=1;const b=BADGES[id],t=$('#toast');t.textContent=b[0]+' Badge unlocked: '+b[1];t.classList.add('on');setTimeout(()=>t.classList.remove('on'),3200);confetti(innerWidth-120,innerHeight-80)}
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
const THEORY=[
{q:'In ideal conditions, what is the typical overall stopping distance at 30 mph?',o:['9 metres (30 feet)','23 metres (75 feet)','36 metres (120 feet)','53 metres (175 feet)'],a:1,why:'Thinking distance plus braking distance at 30 mph is about 23 metres, or 6 car lengths.'},
{q:'What is the legal minimum tyre tread depth for a car?',o:['1.0 mm','1.6 mm','2.0 mm','3.0 mm'],a:1,why:'The legal minimum is 1.6 mm across the central three-quarters of the tread, around the whole tyre.'},
{q:'On wet roads, stopping distances are at least...',o:['The same as dry roads','1.5 times longer','Twice as long','Ten times longer'],a:2,why:'Wet roads roughly double stopping distances, so leave at least a 4 second gap.'},
{q:'When may you use front fog lights?',o:['Whenever it is raining','When visibility is seriously reduced, under about 100 metres','At night on any road','Only on motorways'],a:1,why:'Use fog lights only when visibility is seriously reduced, and switch them off when it improves.'},
{q:'You approach a zebra crossing and someone has stepped onto it. You should...',o:['Sound your horn','Flash your lights','Give way and let them cross','Speed up to pass before they cross'],a:2,why:'You must give way to anyone who has moved onto a zebra crossing.'},
{q:'What is the safest advice about alcohol and driving?',o:['Stay under the limit','Drink only one drink','Do not drink any alcohol if you are driving','Drink water between drinks'],a:2,why:'Alcohol slows reactions and affects judgement even below the limit. The only safe amount is none.'}];
let Q={mode:'theory',items:[],i:0,sc:0,done:false};
function quiz(mode){
 const cat=$('#sigCat').value,pool=SGL.filter(s=>cat==='All'||s.c===cat);
 Q={mode,i:0,sc:0,done:false,items:[]};
 $$('[data-mode]').forEach(b=>b.setAttribute('aria-selected',b.dataset.mode===mode));$('#sigBar').classList.toggle('hidden',mode==='theory');
 if(mode==='lib'){$('#quiz').innerHTML='<div class="lib">'+pool.map(s=>'<div class="sg flip" tabindex="0"><div class="fi"><div class="ff">'+svgOf(s,'sign sm')+'<b>'+s.n+'</b><span class="mut">Hover to flip</span></div><div class="fb"><b>'+s.n+'</b><span>'+s.d+'</span></div></div></div>').join('')+'</div>';return}
 Q.items=mode==='signs'?sh(pool).slice(0,10).map(s=>{const o=sh([s.d].concat(sh(SGL.filter(x=>x.d!==s.d)).slice(0,3).map(x=>x.d)));return{svg:svgOf(s,'sign'),q:'What does this sign mean and what should you do?',o,a:o.indexOf(s.d),why:s.n+': '+s.d}}):sh(THEORY).map(x=>{const o=sh(x.o.map((t,i)=>[t,i===x.a]));return{q:x.q,o:o.map(z=>z[0]),a:o.findIndex(z=>z[1]),why:x.why}});
 qr();
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
$('#next').addEventListener('click',()=>{M.i++;M.i>=M.list.length?results():startClip()});
$('#replay').addEventListener('click',()=>replay(true));
$('#spd').addEventListener('input',e=>{$('#spdv').textContent=e.target.value+'x';if(P.mode==='replay')P.sp=+e.target.value});
$('#print').addEventListener('click',()=>window.print());
$('#theme').addEventListener('change',e=>{document.documentElement.dataset.theme=e.target.value});
$('#rm').addEventListener('change',e=>document.body.classList.toggle('rm',e.target.checked));
$('#cc').addEventListener('change',e=>$('#capt').classList.toggle('hidden',!e.target.checked||$('#clip').classList.contains('hidden')));
document.addEventListener('keydown',e=>{if(e.code==='Space'&&P.run&&P.mode==='test'){e.preventDefault();if(!e.repeat)flag()}});
if(matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark';$('#theme').value='dark'}
if(matchMedia('(prefers-reduced-motion: reduce)').matches){$('#rm').checked=true;document.body.classList.add('rm')}
/* ---------- polish: motion and interaction ---------- */
function confetti(x,y){
 if(document.body.classList.contains('rm'))return;const cols=['#d6232a','#ff7a3d','#f2b705','#2f6fd0','#1b8a4f'];
 for(let i=0;i<34;i++){const e=document.createElement('i'),a=Math.random()*6.28,r=80+Math.random()*190;e.className='cf';
  e.style.cssText='left:'+x+'px;top:'+y+'px;background:'+cols[i%5]+';--dx:'+Math.cos(a)*r+'px;--dy:'+(Math.sin(a)*r+130)+'px;--r:'+Math.random()*720+'deg';
  document.body.appendChild(e);setTimeout(()=>e.remove(),1200)}
}
document.addEventListener('pointermove',e=>{
 const RM=document.body.classList.contains('rm'),tg=e.target.closest?e.target:document.body,c=tg.closest('.card,.sg'),t=tg.closest('.tilt');
 if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}
 $$('.tilt').forEach(x=>{if(x!==t)x.style.transform=''});
 if(t&&!RM){const r=t.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;t.style.transform='perspective(700px) rotateY('+px*10+'deg) rotateX('+(-py*10)+'deg) translateY(-4px)'}
 const h=$('.hero');if(h&&!RM){h.style.setProperty('--px',(e.clientX/innerWidth-.5).toFixed(2));h.style.setProperty('--py',(e.clientY/innerHeight-.5).toFixed(2))}
});
document.addEventListener('pointerdown',e=>{
 const b=e.target.closest&&e.target.closest('button');if(!b||document.body.classList.contains('rm'))return;
 const r=b.getBoundingClientRect(),s=document.createElement('span');s.className='rip';s.style.left=e.clientX-r.left+'px';s.style.top=e.clientY-r.top+'px';b.appendChild(s);setTimeout(()=>s.remove(),600);
});
const stg=$('.stage');stg.addEventListener('pointermove',e=>{const r=stg.getBoundingClientRect();lookT=((e.clientX-r.left)/r.width-.5)*2});stg.addEventListener('pointerleave',()=>{lookT=0});
$('#ring').innerHTML='<div class="rot">'+['stop','give','l30','kids','works','nsl','tls','xing'].map((id,i)=>'<div class="it" style="--i:'+i+'">'+svgOf(SGM[id],'sign')+'</div>').join('')+'</div>';
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});
$$('.rv').forEach(x=>io.observe(x));
const words=['hazard','pedestrian','cyclist','junction','child'];let wi=0;
setInterval(()=>{const r=$('#rot');if(!r||document.body.classList.contains('rm')||$('#home').classList.contains('hidden'))return;
 r.classList.add('out');setTimeout(()=>{wi=(wi+1)%words.length;r.textContent=words[wi];r.classList.remove('out')},300)},2300);
[['clips',CLIPS.length],['signs',SGL.length],['theory',THEORY.length]].forEach(a=>{const el=$('[data-cnt="'+a[0]+'"]');if(el)countUp(el,a[1],1400)});
$('#sigCat').addEventListener('change',()=>quiz(Q.mode));
show('home');
})();
