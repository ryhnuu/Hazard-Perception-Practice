(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d'),W=800,H=450,HY=165,CX=400,FOC=14,ROAD=3.5,MAX=5,PASS=59;
const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);

/* Session-only state (nothing is stored in the browser; a refresh clears it) */
const S={hist:[],att:[],quiz:[],sq:[],streak:0,best:0,badges:{}};
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
const O=(k,z0,lat,x)=>Object.assign({k,st:t=>({z:z0-((x&&x.v)||10)*t,lat:typeof lat==='function'?lat(t):lat})},x);
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
 objs:[O('car',80,-3.1,{c:'#3a6aa8'}),{k:'bike',st:t=>({z:70-3*t,lat:5.2})},SN('xr',70,-4.4),SN('l30',100,-4.4)]},
{id:'zebra',g:'ped',title:'Zebra crossing',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5.2,he:7.6,
 cap:'Daytime, clear weather. You approach a zebra crossing at 30 mph.',
 why:'A pedestrian walked towards the crossing and stepped onto it.',
 tip:'Flag as the pedestrian heads for the crossing. Slow down early and give way to anyone who has stepped on.',
 objs:[O('zebra',95,0,{g:1}),O('ped',94,t=>t<5?-5.5:Math.min(3.5,-5.5+1.5*(t-5)),{c:'#6b5b95',h:1}),SN('xing',70,-4.4),SN('l30',50,-4.6)]},
{id:'between',g:'ped',title:'Between parked cars',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5.5,he:8,
 cap:'Daytime, clear weather. Cars are parked on the right with a small gap between them.',
 why:'A pedestrian stepped out from between two parked cars.',
 tip:'Flag as the pedestrian first moves into view. Gaps between parked cars hide people, so slow down and watch the gap.',
 objs:[O('car',110,4.3,{c:'#a33'}),O('ped',104,t=>t<5.5?4.3:Math.max(-.5,4.3-1.6*(t-5.5)),{c:'#3a6',h:1}),O('car',98,4.3,{c:'#37a'}),SN('park',70,-4.5)]},
{id:'elder',g:'ped',title:'Slow pedestrian crossing',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:4,he:7,
 cap:'Daytime, clear weather. You pass a hospital sign at 30 mph.',
 why:'An older pedestrian started to cross slowly in front of you.',
 tip:'Flag as the pedestrian leaves the pavement. Older or less mobile people cross slowly, so give them time and do not rush past.',
 objs:[O('ped',95,t=>t<4?4.4:Math.max(.3,4.4-(t-4)),{c:'#8a8a8a',h:1}),SN('hosp',70,-4.5),SN('l30',50,-4.6)]},
{id:'cycjoin',g:'bike',title:'Cyclist joining the road',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:4.8,he:7.2,side:102,
 cap:'Daytime, clear weather. A side road joins on the left.',
 why:'A cyclist rode out of the side road to join your road.',
 tip:'Flag as the cyclist approaches the junction without slowing. Cyclists are small and can emerge quickly, so be ready to slow down.',
 objs:[{k:'bike',h:1,st:t=>({z:102-10*t,lat:t<4.8?-7:Math.min(-1.2,-7+3.2*(t-4.8))})},SN('cyc',65,-4.4),SN('sl',45,-4.5)]},
{id:'pothole',g:'bike',title:'Motorcyclist avoiding a pothole',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5,he:7.5,
 cap:'Daytime, clear weather. A motorcyclist rides ahead of you in your lane.',
 why:'The motorcyclist swerved out to avoid a pothole.',
 tip:'Flag as the motorcyclist starts to move out. Riders swerve for potholes and drains, so keep a safe gap and watch the road ahead of them.',
 objs:[{k:'moto',h:1,st:t=>({z:70-4*t,lat:t<5?-1.7:t<7?-1.7+Math.min(1.3,.9*(t-5)):-.4})},SN('gen',60,-4.4)]},
{id:'cycgroup',g:'bike',title:'Cyclists around a bend',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:3.5,he:6,
 cap:'Daytime, clear weather. The road bends to the right.',
 why:'A group of cyclists rode in your lane just beyond the bend.',
 tip:'Flag as soon as the cyclists come into view. Slow down and wait for a safe gap before passing. Never overtake on a bend.',
 objs:[{k:'bike',h:1,st:t=>({z:95-5*t,lat:-1.2})},{k:'bike',st:t=>({z:90-5*t,lat:-2.3})},SN('br',60,-4.4),SN('l30',35,-4.6)]},
{id:'horse',g:'animal',title:'Horse rider ahead',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5,he:7.5,
 cap:'Daytime, clear weather. A horse rider is ahead on the left. There is a horse riders warning sign.',
 why:'The horse moved out into the road to pass an obstacle.',
 tip:'Flag as the horse starts to move out. Horses can be startled, so slow down, leave plenty of room and do not rev your engine or sound your horn.',
 objs:[{k:'horse',h:1,st:t=>({z:80-6*t,lat:t<5?-2.4:-2.4+Math.min(1,(t-5)/1.5)*1.4})},SN('horse',60,-4.4)]},
{id:'deer',g:'animal',title:'Deer at dusk',dur:8.5,v:10,mph:30,time:'dusk',wx:'clear',hs:5.5,he:7.8,
 cap:'Dusk, clear weather. You drive on a country road. There is a wild animals sign.',
 why:'A deer ran from the left verge into the road.',
 tip:'Flag as the deer starts to run. Wild animals are most active at dusk and dawn, and often travel in groups, so expect more than one.',
 objs:[{k:'deer',h:1,st:t=>({z:95-10*t,lat:t<5.5?-6:Math.min(.5,-6+3.2*(t-5.5))})},SN('deer',70,4.4)]},
{id:'rbt',g:'junc',title:'Roundabout approach',dur:10,v:10,mph:30,time:'day',wx:'clear',hs:5,he:8,side:110,sd:1,
 cap:'Daytime, clear weather. You approach a roundabout at 30 mph.',
 why:'A car on the right did not stop and entered the roundabout in front of you.',
 tip:'Flag as the car approaches the give way line too fast to stop. Give way to traffic from the right, and watch the other driver, not just the markings.',
 objs:[O('car',112,t=>t<5?7.5:7.5-.9*(t-5)**2,{c:'#d33',h:1}),SN('rbw',75,-4.4)]},
{id:'hidden',g:'junc',title:'Junction hidden by a van',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:6.5,he:8.8,side:96,
 cap:'Daytime, clear weather. A van is parked on the left at a side road junction.',
 why:'A car crept out of the side road past the parked van.',
 tip:'Flag as the nose of the car appears. The van hides the junction, so slow down and look for any sign of traffic emerging.',
 objs:[O('car',98,t=>t<5?-7.5:-7.5+1.6*(t-5)**2,{c:'#c7a',h:1}),O('van',90,-4),SN('sl',60,-4.4)]},
{id:'pullout',g:'park',title:'Parked car pulling out',dur:8.5,v:10,mph:30,time:'day',wx:'clear',hs:5,he:7.5,
 cap:'Daytime, clear weather. A line of parked cars is on the left.',
 why:'One of the parked cars pulled away from the kerb into your lane.',
 tip:'Flag as the car starts to move. Brake lights, exhaust smoke, turned wheels or a driver inside all warn that a car may pull out.',
 objs:[O('car',90,t=>t<5?-2.6:-2.6+Math.min(1.5,.9*(t-5)),{c:'#5a3a8a',h:1}),O('car',110,-2.6,{c:'#555'}),SN('park',60,-4.5)]},
{id:'reverse',g:'park',title:'Car reversing from a drive',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5,he:7.6,
 cap:'Daytime, clear weather. You drive past houses with driveways on the left.',
 why:'A car reversed out of a driveway into the road.',
 tip:'Flag as the car starts to come out. Drivers reversing out often cannot see well, so slow down and be ready to stop.',
 objs:[O('car',100,t=>t<5?-6:Math.min(-1.2,-6+1.6*(t-5)),{c:'#2a8a8a',h:1}),SN('gen',60,-4.4)]},
{id:'lorryturn',g:'large',title:'Lorry turning left',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:4.5,he:7,side:100,
 cap:'Daytime, clear weather. A lorry is ahead of you and a side road is on the left.',
 why:'The lorry swung out to the right before turning left into the side road.',
 tip:'Flag as the lorry moves out. Large vehicles swing wide before turning, so never try to squeeze past on the inside.',
 objs:[{k:'lorry',h:1,st:t=>({z:75-6*t,lat:t<4.5?-1.8:-1.8+Math.min(1.2,.5*(t-4.5))})},SN('sl',60,-4.4)]},
{id:'tractor',g:'large',title:'Slow tractor',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:3.5,he:6.5,
 cap:'Daytime, clear weather. You drive along a bendy country road. There is a series of bends sign.',
 why:'A slow tractor was ahead of you and you were catching up quickly.',
 tip:'Flag as soon as you realise the tractor is moving much slower than you. Slow down in good time and do not overtake on bends.',
 objs:[{k:'tractor',h:1,st:t=>({z:80-7*t,lat:-1.7})},SN('sb',55,-4.4)]},
{id:'fogcar',g:'wx',title:'Stopped car in fog',dur:9,v:10,mph:30,time:'day',wx:'fog',hs:5.8,he:8.2,
 cap:'Daytime, thick fog. Visibility is low.',
 why:'A stationary car with no lights appeared in your lane out of the fog.',
 tip:'Flag as the car becomes visible. In fog you must be able to stop within the distance you can see, so slow down well in advance.',
 objs:[O('car',108,-1.7,{c:'#6a6f78',h:1}),SN('l40',60,-4.4)]},
{id:'ice',g:'wx',title:'Skidding car on ice',dur:9,v:10,mph:30,time:'day',wx:'snow',hs:5,he:8,
 cap:'Daytime, snow and ice. You drive behind a car.',
 why:'The car ahead lost grip and began to skid.',
 tip:'Flag as the car ahead starts to slide. On ice, leave up to ten times the normal gap, brake gently and use high gears.',
 objs:[{k:'car',c:'#2a6a9a',h:1,st:t=>({z:70-3*t,lat:-1.7+(t>5?Math.sin((t-5)*4)*.9*Math.min(1,t-5):0)})},SN('ice',60,-4.4)]},
{id:'glare',g:'wx',title:'Low sun glare',dur:9.5,v:10,mph:30,time:'day',wx:'sun',hs:6,he:8.5,
 cap:'Daytime, low bright sun straight ahead.',
 why:'A pedestrian stepped into the road, hard to see in the sun glare.',
 tip:'Flag as the pedestrian steps off the kerb. In glare, slow down, use the sun visor and expect people you cannot see.',
 objs:[O('ped',95,t=>t<6?-5.5:Math.min(-.5,-5.5+1.6*(t-6)),{c:'#444',h:1}),SN('l30',70,-4.4)]},
{id:'flood',g:'wx',title:'Flooded road',dur:9,v:10,mph:30,time:'day',wx:'rain',hs:4,he:7.2,
 cap:'Daytime, heavy rain. A flood warning sign is ahead.',
 why:'The road ahead was flooded.',
 tip:'Flag as you see the water across the road. Slow right down, avoid deep water, and test your brakes afterwards.',
 objs:[O('flood',110,0,{g:1,h:1}),SN('flood',75,-4.4)]},
{id:'wind',g:'wx',title:'Cyclist in crosswind',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5,he:7.5,
 cap:'Daytime, windy. A cyclist rides ahead on the left. There is a crosswind sign.',
 why:'A gust of wind blew the cyclist across the road.',
 tip:'Flag as the cyclist starts to wobble. Strong wind can push cyclists and motorcyclists off line, so give them extra room.',
 objs:[{k:'bike',h:1,st:t=>({z:70-6*t,lat:-1.2+(t>5?Math.sin((t-5)*4)*.9*Math.min(1,t-5):0)})},SN('wind',55,-4.4)]},
{id:'works',g:'road',title:'Roadworks',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:6,he:8.2,
 cap:'Daytime, clear weather. Cones narrow the road at roadworks ahead.',
 why:'A road worker stepped out from behind the cones.',
 tip:'Flag as the worker moves into the lane. Slow down at roadworks, follow the cones and expect workers and plant vehicles to move.',
 objs:[...[0,1,2,3,4,5].map(i=>O('cone',110-7*i,-3+.35*i)),O('ped',77,t=>t<6?-2.2:-2.2+Math.min(1.1,t-6),{c:'#ff9f1a',h:1}),SN('works',80,-4.4),SN('l30',55,-4.6)]},
{id:'bendwide',g:'road',title:'Wide oncoming car on a bend',dur:8,v:10,mph:30,time:'day',wx:'clear',hs:5,he:7,
 cap:'Daytime, clear weather. The road bends to the left.',
 why:'An oncoming car drifted across the centre line on the bend.',
 tip:'Flag as the car starts to drift wide. On bends, keep to your side, slow down and be ready to brake.',
 objs:[O('car',140,t=>t<5?1.7:1.7-Math.min(1.4,.9*(t-5)),{c:'#c73',f:1,h:1,v:16}),SN('bl',70,-4.4)]},
{id:'narrow',g:'road',title:'Narrow road, oncoming van',dur:8,v:10,mph:30,time:'day',wx:'clear',hs:4.5,he:7,
 cap:'Daytime, clear weather. The road narrows and a car is parked on the left.',
 why:'An oncoming van took the middle of the narrow road and left no room to pass.',
 tip:'Flag as the van moves towards the middle. Be ready to slow down and give way, and do not force your way through.',
 objs:[O('van',120,t=>t<4.5?.8:.8-Math.min(1.1,.5*(t-4.5)),{v:13,h:1}),O('car',90,-2.6,{c:'#667'}),SN('nar',70,-4.4)]},
{id:'lcx',g:'road',title:'Level crossing',dur:8.5,v:10,mph:30,time:'day',wx:'clear',hs:4.7,he:7.5,
 cap:'Daytime, clear weather. You approach a level crossing with barriers.',
 why:'The crossing lights started flashing and the barrier began to lower.',
 tip:'Flag as the red lights start to flash. You must stop when lights flash or barriers lower, and never zigzag round barriers.',
 objs:[{k:'barrier',at:5.5,h:1,st:t=>({z:100-10*t,lat:0})},SN('lcb',75,-4.4)]},
{id:'tram',g:'road',title:'Tram crossing',dur:8,v:10,mph:30,time:'day',wx:'clear',hs:4.2,he:7,
 cap:'Daytime, clear weather. Tram lines cross the road ahead. There is a tram warning sign.',
 why:'A tram crossed the road in front of you.',
 tip:'Flag as the tram comes into view at the side. Trams cannot swerve or stop quickly, so stop for them and never wait on the tracks.',
 objs:[{k:'bus',c:'#e8b800',sc:1.7,h:1,st:t=>({z:85-10*t,lat:t<3.5?16:Math.max(-16,16-8*(t-3.5))})},SN('tram',60,-4.4)]},
{id:'uturn',g:'drv',title:'Car making a U-turn',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5,he:7.5,
 cap:'Daytime, clear weather. A car is ahead of you in your lane. There is a no U-turns sign.',
 why:'The car ahead slowed and turned across the road to make a U-turn.',
 tip:'Flag as the car starts to swing across the road. Watch for brake lights and a turned wheel, and slow down early.',
 objs:[{k:'car',c:'#33a',h:1,st:t=>({z:t<5?75-4*t:55-6*(t-5),lat:t<5?-1.7:-1.7+Math.min(3.2,1.6*(t-5))})},SN('nou',60,-4.4)]},
{id:'amb',g:'drv',title:'Emergency vehicle',dur:9,v:10,mph:30,time:'day',wx:'clear',hs:5,he:7.8,side:105,
 cap:'Daytime, clear weather. You pass a hospital sign. A side road is on the left.',
 why:'An ambulance with flashing blue lights pulled out from the side road.',
 tip:'Flag as the ambulance starts to move. Stay calm, slow down and let it pass. Never stop on a pedestrian crossing or in a box junction to give way.',
 objs:[O('amb',108,t=>t<5?-7.5:-7.5+.9*(t-5)**2,{h:1}),SN('hosp',70,-4.4)]},
{id:'cutin',g:'mwy',title:'Car cutting in',dur:8.5,v:10,mph:70,time:'day',wx:'clear',hs:5,he:7.5,
 cap:'Daytime, clear weather. You drive on a motorway at 70 mph. Another car is overtaking on the right.',
 why:'The overtaking car pulled into your lane just ahead of you.',
 tip:'Flag as the car starts to drift left. Keep a 2 second gap and be ready to ease off when someone cuts in.',
 objs:[{k:'car',c:'#2a8a4a',h:1,st:t=>({z:60-4*t,lat:t<5?1.7:1.7-Math.min(3.4,2.3*(t-5))})},SN('mwy',70,-4.6),SN('l70',45,-4.6)]},
{id:'breakdown',g:'mwy',title:'Broken-down car',dur:9.5,v:10,mph:70,time:'day',wx:'clear',hs:6,he:8.5,
 cap:'Daytime, clear weather. You drive on a motorway at 70 mph. A car is stopped on the left with hazard lights on.',
 why:'A person stepped from the broken-down car towards the lane.',
 tip:'Flag when the person steps out. A car with hazard lights may mean people nearby, so move over if safe and slow down.',
 objs:[O('car',110,-4.4,{c:'#aaa',fl:1}),O('ped',106,t=>t<6?-5.2:-5.2+1.2*(t-6),{c:'#ff9f1a',h:1}),SN('mwy',80,-4.8)]},
{id:'mergelorry',g:'mwy',title:'Lorry joining the motorway',dur:9,v:10,mph:70,time:'day',wx:'clear',hs:5,he:8,side:105,
 cap:'Daytime, clear weather. You drive on a motorway at 70 mph. A slip road joins on the left.',
 why:'A lorry joined the motorway from the slip road into your lane.',
 tip:'Flag as the lorry moves towards your lane. Move over if safe, or adjust your speed to let it merge.',
 objs:[O('lorry',108,t=>t<5?-7.5:Math.min(-1.7,-7.5+1.4*(t-5)),{c:'#e8e8e0',h:1}),SN('mwy',80,4.6),SN('l70',55,4.6)]},
{id:'calm_rbt',g:'decoy',title:'Calm roundabout (decoy)',dur:8.5,v:10,mph:30,time:'day',wx:'clear',hs:null,he:null,side:110,sd:1,
 cap:'Daytime, clear weather. You approach a roundabout. A car waits at the junction on the right.',
 why:'The car stays waiting and never moves into your path.',
 tip:'A waiting car is not a developing hazard unless it begins to move. Watch it, but do not flag unless something changes.',
 objs:[O('car',112,7.5,{c:'#d33'}),SN('rbw',75,-4.4),SN('give',45,4.6)]},
{id:'calm_mwy',g:'decoy',title:'Steady motorway (decoy)',dur:8,v:10,mph:70,time:'day',wx:'clear',hs:null,he:null,
 cap:'Daytime, clear weather. You drive on a motorway at 70 mph. A lorry travels steadily ahead in the left lane.',
 why:'The lorry holds its lane and speed, so nothing develops.',
 tip:'Keep your distance, but a vehicle driving steadily ahead is not a developing hazard.',
 objs:[{k:'lorry',c:'#e8e8e0',st:t=>({z:80-2*t,lat:-1.7})},SN('mwy',70,-4.6),SN('l70',45,-4.6)]},
{id:'dbl_ball',g:'dbl',title:'Ball, then a child',dur:9.8,v:10,mph:30,time:'day',wx:'clear',hs:4.2,he:6.2,w:[{hs:4.2,he:6.2},{hs:7.2,he:9.2}],
 cap:'Daytime, clear weather. You drive at 30 mph past a car parked on the right. This clip has two developing hazards.',
 why:'First a ball rolled into the road, then a child ran out after it.',
 tip:'Flag the ball as it appears, then flag again when the child starts to run out. A ball in the road usually means a child is close behind it.',
 objs:[{k:'ball',h:1,st:t=>({z:101-10*t,lat:t<4?4.3:Math.max(-3,4.3-3*(t-4))})},O('child',101.5,t=>t<7?4.3:Math.max(-.5,4.3-2.2*(t-7)),{h:2}),O('car',100,4.3,{c:'#b8892a'}),SN('kids',70,-4.4),SN('l30',45,-4.6)]},
{id:'dbl_bike',g:'dbl',title:'Cyclist, then a car door',dur:11,v:10,mph:30,time:'day',wx:'clear',hs:4.1,he:6.4,w:[{hs:4.1,he:6.4},{hs:8.1,he:10.2}],
 cap:'Daytime, clear weather. You drive at 30 mph behind a cyclist, past parked cars on the left. This clip has two developing hazards.',
 why:'First the cyclist moved out to pass a parked car, then a driver opened the door of another parked car.',
 tip:'Flag the cyclist as they start to move out, then flag again as the second car door starts to open. Look for both hazards, not just the first.',
 objs:[O('car',105,-2.6,{c:'#2a8a55'}),{k:'bike',h:1,st:t=>({z:75-4*t,lat:t<4.3?-1.2:-1.2+Math.min(1,(t-4.3)/1.5)*2.2})},O('car',150,-2.6,{c:'#2a5aa0'}),{k:'door',h:2,st:t=>({z:149-10*t,lat:t<8.2?-1.75:-1.75+Math.min(1,(t-8.2)/.8)})},SN('cyc',60,-4.4),SN('park',100,-4.5)]},
{id:'dbl_bus',g:'dbl',title:'Child, then a bus',dur:11,v:10,mph:20,time:'day',wx:'clear',hs:4,he:6.2,w:[{hs:4,he:6.2},{hs:8,he:10.8}],
 cap:'Daytime, clear weather. You drive at 20 mph near a school. A bus waits at a stop further ahead. This clip has two developing hazards.',
 why:'First a child ran into the road, then the bus pulled out from its stop.',
 tip:'Flag the child as they leave the pavement, then flag again when the bus starts to pull out. Keep scanning after the first hazard.',
 objs:[O('child',100,t=>t<4?-5.5:Math.min(-.8,-5.5+2.2*(t-4)),{h:1}),{k:'bus',c:'#c8322a',h:2,st:t=>({z:t<8?150-10*t:70-8*(t-8),lat:t<8?-3:Math.min(-.3,-3+.45*(t-8)**2)})},SN('kids',75,-4.4),SN('l20',50,-4.6)]}
];
const GROUPS=[
{id:'ped',name:'Pedestrians',icon:'🚶',desc:'Children, older people, crossings and people stepping out.'},
{id:'bike',name:'Cyclists and motorcyclists',icon:'🚲',desc:'Vulnerable riders joining roads, swerving and riding in groups.'},
{id:'animal',name:'Animals and riders',icon:'🐴',desc:'Dogs, horses and wild animals near the road.'},
{id:'junc',name:'Junctions and roundabouts',icon:'🔀',desc:'Vehicles emerging from side roads and entering roundabouts.'},
{id:'park',name:'Parked vehicles',icon:'🅿️',desc:'Opening doors, cars pulling out and reversing drivers.'},
{id:'large',name:'Large and slow vehicles',icon:'🚌',desc:'Buses, lorries and tractors that pull out, swing wide or crawl.'},
{id:'wx',name:'Weather and visibility',icon:'🌧️',desc:'Fog, ice, glare, floods and wind.'},
{id:'road',name:'Road layout, works and crossings',icon:'🚧',desc:'Roadworks, bends, narrow roads, level crossings and trams.'},
{id:'drv',name:'Other drivers',icon:'🚗',desc:'Overtaking, sudden braking, U-turns and emergency vehicles.'},
{id:'mwy',name:'Motorway and dual carriageways',icon:'🛣️',desc:'Cutting in, merging traffic and broken-down vehicles.'},
{id:'dbl',name:'Double hazards',icon:'⚠️',desc:'Two developing hazards in one clip, as in one clip of the real test.'},
{id:'decoy',name:'Decoys (no hazard)',icon:'🛡️',desc:'Clips where nothing develops. Practise not flagging.'}];
const GN=id=>GROUPS.find(g=>g.id===id).name;
const G0={van:'ped',school:'ped',ball:'ped',side:'junc',bike:'bike',moto:'bike',dog:'animal',door:'park',bus:'large',overtake:'drv',brake:'drv',night:'decoy',quiet:'decoy'};
CLIPS.forEach(c=>{if(G0[c.id])c.g=G0[c.id];c.cat=GN(c.g)});
CLIPS.forEach(c=>c.objs.forEach(o=>{if(o.s)simg(o.s)}));


let look=0,lookT=0,SQ=null;
let P={c:CLIPS[0],t:0,sp:1,run:false,mode:'test',last:0,tip:false},raf=0,clicks=[],M={i:0,res:[],mx:[],on:false,list:[]},HZ={},lastS=0,lastParts=[];

/* ---------- drawing ---------- */
function proj(z,lat){const d=Math.min(1.5,FOC/z);return{d,x:CX+lat/ROAD*(12+330*d),y:HY+(H-HY)*d}}
function poly(p,col){ctx.fillStyle=col;ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.fill()}
function draw(){
 const c=P.c,t=P.t,v=c.v,RM=document.body.classList.contains('rm'),night=c.time==='night';
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.save();HZ={};look+=((RM?0:lookT)-look)*.1;
 if(!RM){ctx.translate(W/2,H/2);ctx.rotate(Math.sin(t*1.4)*.004);ctx.scale(1.04,1.04);ctx.translate(-W/2+look*9,-H/2+Math.sin(t*6.5)*1.3)}
 const dusk=c.time==='dusk',pal=night?['#050b1a','#17264a']:dusk?['#2a2f5a','#f2905a']:{clear:['#7fb2e8','#d7e8f6'],rain:['#6b7787','#a9b3bf'],fog:['#c5cbd1','#dde1e4'],sun:['#f6b562','#ffe9b8'],snow:['#b9c2cc','#e6ebf0']}[c.wx];
 const g=ctx.createLinearGradient(0,0,0,HY);g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);ctx.fillStyle=g;ctx.fillRect(-20,-20,W+40,HY+20);
 if(!night&&c.wx!=='fog'){ctx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<4;i++){const x=((i*300-(RM?0:t*6))%1100+1100)%1100-150;ctx.beginPath();ctx.ellipse(x,40+i*22,70,16,0,0,7);ctx.fill()}}
 [['#7d9aa8',.012,30],['#5f8a5a',.02,16]].forEach((l,L)=>{ctx.fillStyle=night?'#0c1a14':l[0];ctx.beginPath();ctx.moveTo(-60,HY);for(let x=-60;x<=W+60;x+=40)ctx.lineTo(x+(RM?0:Math.sin(t*1.4)*(L+1)*3+look*(L+1)*7),HY-l[2]-l[2]*.6*Math.sin(x*l[1]*2+L*2));ctx.lineTo(W+60,HY);ctx.fill()});
 ctx.fillStyle=night?'#1f3a1a':dusk?'#2f4a2a':{clear:'#4f8a3c',rain:'#3d6b30',fog:'#6d8a62',sun:'#7a9a4a',snow:'#e3e9ef'}[c.wx];ctx.fillRect(-20,HY,W+40,H-HY+20);
 poly([[CX-12,HY],[CX+12,HY],[CX+342,H],[CX-342,H]],({rain:'#3a3d44',snow:'#8a9099'}[c.wx]||'#4a4d54'));
 ctx.strokeStyle='#bfc3c8';ctx.lineWidth=3;[-1,1].forEach(s=>{ctx.beginPath();ctx.moveTo(CX+s*12,HY);ctx.lineTo(CX+s*342,H);ctx.stroke()});
 if(c.side){const z=c.side-v*t;if(z>3){const sd=c.sd||-1,ex=sd<0?0:W,a=proj(z+5,sd*ROAD),b=proj(z-5,sd*ROAD),a2=proj(z+5,sd*60),b2=proj(z-5,sd*60);poly([[a.x,a.y],[b.x,b.y],[ex,b2.y],[ex,a2.y]],'#3a3d44')}}
 ctx.strokeStyle='#e8e8e8';for(let k=0;k<22;k++){const z=((8*k-v*t)%176+176)%176;if(z<3)continue;const a=proj(z,0),b=proj(z-3,0);ctx.lineWidth=Math.max(1,7*a.d);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
 const sc=[];for(let k=0;k<8;k++)[-1,1].forEach(s=>{const z=((25*k+(s>0?12:0)-v*t)%200+200)%200;if(z>3)sc.push({k:'tree',z,lat:s*(6.5+(k%2))})});
 for(let k=0;k<7;k++)[-1,1].forEach(s=>{const z=((30*k+(s>0?15:0)-v*t)%210+210)%210;if(z>7)sc.push({k:'house',z,lat:s*9,col:(k+(s>0?1:0))%3})});
 for(let k=0;k<5;k++)[-1,1].forEach(s=>{const z=((40*k+(s>0?20:0)-v*t)%200+200)%200;if(z>4)sc.push({k:'lamp',z,lat:s*3.9})});
 c.objs.forEach(o=>{const s=o.st(t);sc.push(Object.assign({},o,{z:s.z,lat:s.lat}))});
 sc.sort((a,b)=>(b.z+(b.g?1e3:0))-(a.z+(a.g?1e3:0))).forEach(o=>{if(o.z>=2.5)sprite(o)});
 if(c.wx==='fog'){const f=ctx.createLinearGradient(0,HY-10,0,HY+170);f.addColorStop(0,'rgba(205,210,214,.95)');f.addColorStop(1,'rgba(205,210,214,.08)');ctx.fillStyle=f;ctx.fillRect(-20,HY-10,W+40,H)}
 if(night){const r=ctx.createRadialGradient(CX,H,60,CX,H-120,520);r.addColorStop(0,'rgba(5,10,25,.05)');r.addColorStop(1,'rgba(5,10,25,.82)');ctx.fillStyle=r;ctx.fillRect(-20,-20,W+40,H+40);ctx.save();ctx.globalCompositeOperation='lighter';const hl=ctx.createLinearGradient(0,H,0,HY+20);hl.addColorStop(0,'rgba(255,240,190,.24)');hl.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=hl;ctx.beginPath();ctx.moveTo(CX-150,H);ctx.lineTo(CX-14,HY+20);ctx.lineTo(CX+14,HY+20);ctx.lineTo(CX+150,H);ctx.fill();ctx.restore()}
 if(c.wx==='rain'){ctx.strokeStyle='rgba(205,220,240,.55)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<90;i++){const x=(i*89)%W,y=((i*53)+(RM?0:t*700))%H;ctx.moveTo(x,y);ctx.lineTo(x-4,y+14)}ctx.stroke()}
 if(c.wx==='sun'){const gl=ctx.createRadialGradient(CX,HY-20,10,CX,HY-20,300);gl.addColorStop(0,'rgba(255,255,235,.95)');gl.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=gl;ctx.fillRect(-20,-20,W+40,H+40)}
 if(dusk){ctx.fillStyle='rgba(40,20,60,.28)';ctx.fillRect(-20,-20,W+40,H+40)}
 if(c.wx==='snow'){ctx.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<110;i++){const x=(((i*61)%W+(RM?0:Math.sin(t*1.5+i)*14))+W)%W,y=((i*37)+(RM?0:t*80))%H;ctx.fillRect(x,y,3,3)}}
 if(P.mode!=='test'&&WIN(c).length)hint(c,t);
 ctx.restore();dash(c,t,RM);
 $('#prog').style.width=(t/c.dur*100)+'%';const ph=$('#ph');if(ph)ph.style.left=(t/c.dur*100)+'%';
}
const SW={van:130,car:120,bus:145,child:22,bike:40,ball:28,moto:20,dog:50,ped:24,lorry:140,tractor:100,horse:50,deer:50,amb:130};
function dash(c,t,RM){
 if(c.wx==='rain'){const a=-1.57+(RM?-.5:Math.sin(t*3.2)*1.15);ctx.strokeStyle='#0a0a0a';ctx.lineWidth=5;ctx.lineCap='round';[CX-110,CX+30].forEach(px=>{ctx.beginPath();ctx.moveTo(px,H-34);ctx.lineTo(px+Math.cos(a)*200,H-34+Math.sin(a)*200);ctx.stroke()})}
 const m=ctx.createLinearGradient(0,6,0,40);m.addColorStop(0,'#38414d');m.addColorStop(1,'#10151b');ctx.fillStyle=m;ctx.fillRect(CX-72,6,144,32);ctx.strokeStyle='#05070a';ctx.lineWidth=3;ctx.strokeRect(CX-72,6,144,32);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(CX-66,12,60,4);
 const g=ctx.createLinearGradient(0,H-76,0,H);g.addColorStop(0,'#1f242b');g.addColorStop(1,'#0a0c0f');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,H-34);ctx.quadraticCurveTo(CX,H-78,W,H-34);ctx.lineTo(W,H);ctx.fill();
 ctx.save();ctx.translate(CX+50,H+38);ctx.rotate(RM?0:Math.sin(t*.7)*.04);ctx.strokeStyle='#0d0f12';ctx.lineWidth=20;ctx.beginPath();ctx.ellipse(0,0,185,80,0,0,7);ctx.stroke();ctx.strokeStyle='#2d333c';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-3,185,80,0,3.3,6.1);ctx.stroke();ctx.fillStyle='#0d0f12';ctx.fillRect(-18,-80,36,60);ctx.restore();
 const gx=CX-250,gy=H-30;ctx.fillStyle='#0b0d10';ctx.beginPath();ctx.arc(gx,gy,34,0,7);ctx.fill();ctx.strokeStyle='#3a414c';ctx.lineWidth=3;ctx.stroke();const na=-2.4+Math.min(1,c.mph/70)*4.8+(RM?0:Math.sin(t*5)*.03);ctx.strokeStyle='#ff5a5a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+Math.cos(na)*28,gy+Math.sin(na)*28);ctx.stroke();ctx.fillStyle='#8fe3ff';ctx.font='10px Segoe UI, Arial';ctx.textAlign='center';ctx.fillText(c.mph+' mph',gx,gy+22);ctx.textAlign='start';
}
function hint(c,t){
 WIN(c).forEach((w,i)=>{const z=HZ[i+1];if(!z)return;const cy=z.y-70*z.d;
  if(t>=w.hs-.3&&t<=w.he){ctx.save();ctx.strokeStyle='#f2b705';ctx.shadowColor='#f2b705';ctx.shadowBlur=20;ctx.lineWidth=4+Math.sin(t*10)*1.5;ctx.beginPath();ctx.ellipse(z.x,cy,55*z.d+14,85*z.d+14,0,0,7);ctx.stroke();ctx.restore()}
  if(P.tipw&&P.tipw[i]){const txt=t>=w.hs&&t<=w.hs+1.4?'Press Space now!':t>=w.hs-1.8&&t<w.hs?'Watch this area...':'';
   if(txt){ctx.font='bold 20px Segoe UI, Arial';const tw=ctx.measureText(txt).width+28,x=Math.max(8,Math.min(W-tw-8,z.x-tw/2)),y=Math.max(30,cy-85*z.d-48);ctx.fillStyle=txt[0]==='P'?'#f2b705':'#fff';ctx.fillRect(x,y,tw,34);ctx.fillStyle='#111';ctx.fillText(txt,x+14,y+24)}}});
}
function sprite(o){
 const p=proj(o.z,o.lat),d=p.d,x=p.x,y=p.y;if(o.h)HZ[o.h]={x,y,d};
 const sw=SW[o.k];if(sw){ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y,sw*d,10*d,0,0,7);ctx.fill()}
 if(o.k==='tree'){ctx.fillStyle='#5a3d28';ctx.fillRect(x-6*d,y-120*d,12*d,120*d);ctx.fillStyle='#2e6b2e';ctx.beginPath();ctx.arc(x,y-150*d,55*d,0,7);ctx.fill()}

 else if(o.k==='zebra'){if(o.z<3)return;for(let i=0;i<8;i++){const l0=-3.4+i*.85,A=proj(o.z+3,l0),B=proj(o.z+3,l0+.5),C=proj(o.z,l0+.5),D=proj(o.z,l0);poly([[A.x,A.y],[B.x,B.y],[C.x,C.y],[D.x,D.y]],'#f2f2f2')}}
 else if(o.k==='flood'){if(o.z<3)return;const L=proj(o.z,-3.3),R=proj(o.z,3.3),F=proj(o.z+14,0);ctx.fillStyle='rgba(95,150,205,.7)';ctx.beginPath();ctx.ellipse((L.x+R.x)/2,(L.y+F.y)/2,(R.x-L.x)/2,Math.max(2,(L.y-F.y)/2),0,0,7);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.stroke()}
 else if(o.k==='ped'){const h=165*d;ctx.fillStyle=o.c||'#555';ctx.fillRect(x-19*d,y-h*.72,38*d,h*.46);ctx.fillStyle='#222';ctx.fillRect(x-15*d,y-h*.28,30*d,h*.28);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.84,15*d,0,7);ctx.fill()}
 else if(o.k==='cone'){ctx.fillStyle='#ff6a1a';ctx.beginPath();ctx.moveTo(x-14*d,y);ctx.lineTo(x+14*d,y);ctx.lineTo(x+4*d,y-60*d);ctx.lineTo(x-4*d,y-60*d);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x-9*d,y-36*d,18*d,8*d)}
 else if(o.k==='lorry'){const w=260*d,h=250*d;ctx.fillStyle=o.c||'#d8dde3';ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle='#2b3440';ctx.fillRect(x-w/2,y-18*d,w,18*d);ctx.fillStyle='#ff3b3b';ctx.fillRect(x-w/2+6*d,y-60*d,24*d,30*d);ctx.fillRect(x+w/2-30*d,y-60*d,24*d,30*d);ctx.fillStyle='#f2c200';ctx.fillRect(x-w/2+10*d,y-110*d,w-20*d,10*d)}
 else if(o.k==='tractor'){const w=170*d;ctx.fillStyle='#2e8b3a';ctx.fillRect(x-w*.35,y-150*d,w*.7,100*d);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-w*.28,y-145*d,w*.56,50*d);ctx.fillStyle='#111';[-1,1].forEach(s=>{ctx.beginPath();ctx.arc(x+s*w*.5,y-45*d,45*d,0,7);ctx.fill()});ctx.fillStyle='#ff9f1a';ctx.fillRect(x-8*d,y-175*d,16*d,24*d)}
 else if(o.k==='horse'){const w=70*d;ctx.fillStyle='#6b3f1e';ctx.fillRect(x-w/2,y-150*d,w,100*d);ctx.fillRect(x-w/2,y-50*d,18*d,50*d);ctx.fillRect(x+w/2-18*d,y-50*d,18*d,50*d);ctx.fillStyle='#c0392b';ctx.fillRect(x-16*d,y-215*d,32*d,65*d);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-228*d,14*d,0,7);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(x-17*d,y-244*d,34*d,10*d)}
 else if(o.k==='deer'){ctx.fillStyle='#9a6a3a';ctx.fillRect(x-40*d,y-90*d,80*d,45*d);[-34,-14,12,30].forEach(a=>ctx.fillRect(x+a*d,y-46*d,8*d,46*d));ctx.fillRect(x+30*d,y-130*d,16*d,48*d);ctx.fillRect(x+26*d,y-140*d,30*d,18*d);ctx.strokeStyle='#5a3a1a';ctx.lineWidth=Math.max(1,3*d);ctx.beginPath();ctx.moveTo(x+36*d,y-140*d);ctx.lineTo(x+30*d,y-170*d);ctx.moveTo(x+46*d,y-140*d);ctx.lineTo(x+52*d,y-170*d);ctx.stroke()}
 else if(o.k==='amb'){const w=250*d,h=190*d,f=Math.floor(P.t*6)%2;ctx.fillStyle='#f4f4f0';ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle='#8fbf3a';ctx.fillRect(x-w/2,y-90*d,w,30*d);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-w/2+14*d,y-h+16*d,w-28*d,55*d);ctx.shadowColor='#2a6bff';ctx.shadowBlur=16;ctx.fillStyle=f?'#2a6bff':'#9bbcff';ctx.fillRect(x-w/2+20*d,y-h-14*d,50*d,14*d);ctx.fillStyle=f?'#9bbcff':'#2a6bff';ctx.fillRect(x+w/2-70*d,y-h-14*d,50*d,14*d);ctx.shadowBlur=0;ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-12*d,w,12*d)}
 else if(o.k==='barrier'){if(o.z<3)return;const L=proj(o.z,-4.2),R=proj(o.z,4.2),f=Math.min(1,Math.max(0,(P.t-o.at)/1.5)),h=110*d,lift=(1-f)*170*d,on=P.t>=o.at-.8,fl=Math.floor(P.t*4)%2;ctx.fillStyle='#d6232a';ctx.fillRect(L.x-6*d,L.y-190*d,12*d,190*d);ctx.fillRect(R.x-6*d,R.y-190*d,12*d,190*d);ctx.lineWidth=Math.max(2,16*d);ctx.strokeStyle='#d6232a';ctx.beginPath();ctx.moveTo(L.x,L.y-h);ctx.lineTo(R.x,R.y-h-lift);ctx.stroke();ctx.strokeStyle='#fff';ctx.setLineDash([26*d,26*d]);ctx.stroke();ctx.setLineDash([]);if(on){ctx.fillStyle=fl?'#ff2a2a':'#552';ctx.beginPath();ctx.arc(L.x,L.y-205*d,10*d,0,7);ctx.fill();ctx.fillStyle=fl?'#552':'#ff2a2a';ctx.beginPath();ctx.arc(R.x,R.y-205*d,10*d,0,7);ctx.fill()}}
 else if(o.k==='sign'){ctx.fillStyle='#8a8f98';ctx.fillRect(x-2*d,y-150*d,4*d,150*d);const im=simg(o.s);if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,x-45*d,y-240*d,90*d,90*d)}
 else if(o.k==='house'){const sg=Math.sign(o.lat),L=Math.abs(o.lat);if(o.z<6)return;const A=proj(o.z,sg*L),B=proj(o.z+9,sg*L),C=proj(o.z,sg*(L+8)),hh=540,col=['#a9553d','#b4764a','#8d6f5b'][o.col||0],nt=P.c.time!=='day';
  poly([[A.x,A.y],[B.x,B.y],[B.x,B.y-hh*B.d],[A.x,A.y-hh*A.d]],col);poly([[A.x,A.y],[B.x,B.y],[B.x,B.y-hh*B.d],[A.x,A.y-hh*A.d]],'rgba(0,0,0,.3)');
  poly([[A.x,A.y],[C.x,C.y],[C.x,C.y-hh*C.d],[A.x,A.y-hh*A.d]],col);poly([[A.x,A.y-hh*A.d],[C.x,C.y-hh*C.d],[(A.x+C.x)/2,A.y-(hh+70)*A.d]],'#4a3a3a');
  ctx.fillStyle=nt?'#ffd98a':'#bcd2e6';[.15,.62].forEach(u=>ctx.fillRect(A.x+(C.x-A.x)*u,A.y-hh*A.d*.6,(C.x-A.x)*.22,hh*A.d*.25));ctx.fillStyle='#3b2a22';ctx.fillRect(A.x+(C.x-A.x)*.4,A.y-hh*A.d*.38,(C.x-A.x)*.18,hh*A.d*.38)}
 else if(o.k==='lamp'){const sg=Math.sign(o.lat),ax=x-sg*55*d,nt=P.c.time!=='day';ctx.fillStyle='#555';ctx.fillRect(x-3*d,y-330*d,6*d,330*d);ctx.fillRect(Math.min(x,ax),y-332*d,55*d,5*d);
  if(nt){const gl=ctx.createRadialGradient(ax,y-322*d,0,ax,y-322*d,90*d);gl.addColorStop(0,'rgba(255,230,150,.9)');gl.addColorStop(1,'rgba(255,230,150,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(ax,y-322*d,90*d,0,7);ctx.fill()}ctx.fillStyle=nt?'#fff3c0':'#ddd';ctx.beginPath();ctx.arc(ax,y-324*d,9*d,0,7);ctx.fill()}
 else if(o.k==='bus'){const w=280*d*(o.sc||1),h=215*d;ctx.fillStyle=o.c;ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-w/2+12*d,y-h+16*d,w-24*d,70*d);ctx.fillStyle='#fff';ctx.fillRect(x-w/2+12*d,y-h+100*d,w-24*d,14*d);ctx.fillStyle='#ffd24a';ctx.fillRect(x-w/2+8*d,y-50*d,22*d,26*d);ctx.fillRect(x+w/2-30*d,y-50*d,22*d,26*d);ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-14*d,w,14*d)}
 else if(o.k==='ball'){ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.arc(x,y-28*d,28*d,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,4*d);ctx.beginPath();ctx.arc(x,y-28*d,28*d,.3,2.4);ctx.stroke()}
 else if(o.k==='moto'){ctx.fillStyle='#222';ctx.fillRect(x-16*d,y-100*d,32*d,70*d);ctx.fillRect(x-7*d,y-34*d,14*d,34*d);ctx.fillStyle='#e8591a';ctx.beginPath();ctx.arc(x,y-118*d,17*d,0,7);ctx.fill();ctx.fillStyle='#ff3b3b';ctx.fillRect(x-6*d,y-62*d,12*d,8*d)}
 else if(o.k==='dog'){ctx.fillStyle='#8a5a2e';ctx.fillRect(x-45*d,y-62*d,90*d,38*d);ctx.fillRect(x+30*d,y-84*d,26*d,26*d);ctx.fillRect(x-40*d,y-26*d,10*d,26*d);ctx.fillRect(x+26*d,y-26*d,10*d,26*d);ctx.fillRect(x-58*d,y-70*d,18*d,8*d)}
 else if(o.k==='door'){ctx.fillStyle='#173a68';ctx.fillRect(x-28*d,y-105*d,56*d,70*d);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-24*d,y-100*d,48*d,28*d)}
 else if(o.k==='van'){const w=250*d,h=190*d;ctx.fillStyle='#e6e8ec';ctx.fillRect(x-w/2,y-h,w,h);ctx.fillStyle='#8c95a3';ctx.fillRect(x-w/2+10*d,y-h+12*d,w-20*d,60*d);ctx.fillStyle='#d6232a';ctx.fillRect(x-w/2+6*d,y-45*d,22*d,26*d);ctx.fillRect(x+w/2-28*d,y-45*d,22*d,26*d);ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-12*d,w,12*d)}
 else if(o.k==='car'){const w=230*d,h=130*d;ctx.fillStyle=o.c;ctx.fillRect(x-w/2,y-h*.6,w,h*.6);ctx.fillRect(x-w*.36,y-h,w*.72,h*.45);ctx.fillStyle='#bcd2e6';ctx.fillRect(x-w*.3,y-h*.95,w*.6,h*.38);const br=o.br&&o.br(P.t);ctx.fillStyle=o.f?'#fff3a6':br?'#ff1010':'#ff3b3b';if(br||o.f){ctx.shadowColor=o.f?'#fff3a6':'#f00';ctx.shadowBlur=18}ctx.fillRect(x-w/2+4*d,y-h*.5,(br?28:20)*d,(br?16:12)*d);ctx.fillRect(x+w/2-(br?32:24)*d,y-h*.5,(br?28:20)*d,(br?16:12)*d);ctx.shadowBlur=0;ctx.fillStyle='#111';ctx.fillRect(x-w/2,y-8*d,w,8*d);if(o.fl&&Math.floor(P.t*3)%2){ctx.fillStyle='#ffb000';ctx.shadowColor='#ffb000';ctx.shadowBlur=14;ctx.fillRect(x-w/2-6*d,y-h*.55,14*d,14*d);ctx.fillRect(x+w/2-8*d,y-h*.55,14*d,14*d);ctx.shadowBlur=0}}
 else if(o.k==='child'){const h=140*d;ctx.fillStyle='#f2c200';ctx.fillRect(x-17*d,y-h*.72,34*d,h*.45);ctx.fillStyle='#2a3a6a';ctx.fillRect(x-14*d,y-h*.28,28*d,h*.28);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.84,15*d,0,7);ctx.fill()}
 else if(o.k==='bike'){const h=150*d;ctx.strokeStyle='#111';ctx.lineWidth=Math.max(1,5*d);[-26,26].forEach(dx=>{ctx.beginPath();ctx.arc(x+dx*d,y-24*d,24*d,0,7);ctx.stroke()});ctx.fillStyle='#e8591a';ctx.fillRect(x-14*d,y-h*.75,28*d,h*.4);ctx.fillStyle='#e0b08c';ctx.beginPath();ctx.arc(x,y-h*.85,13*d,0,7);ctx.fill();ctx.fillStyle='#f5d400';ctx.fillRect(x-13*d,y-h*.95,26*d,8*d)}
}

/* ---------- playback ---------- */
function loop(now){
 if(!P.run)return;const dt=Math.min(.1,(now-P.last)/1000);P.last=now;P.t+=dt*P.sp;
 if(P.t>=P.c.dur){P.t=P.c.dur;P.run=false;try{draw();if(P.mode==='demo')demoUI()}catch(err){console.error(err)}if(P.mode==='test')finish();return}
 try{draw();if(P.mode==='demo')demoUI()}catch(err){console.error(err)}raf=requestAnimationFrame(loop);
}
function play(c,mode,sp,tip){cancelAnimationFrame(raf);P={c,t:0,sp,run:true,mode,last:performance.now(),tipw:tip===true?WIN(c).map(()=>true):(tip||null),dem:{}};raf=requestAnimationFrame(loop)}
const FLAGSVG='<svg viewBox="0 0 40 40" width="30" height="30"><path d="M8 4v32M8 5h24l-6 8 6 8H8" fill="#d6232a" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>';
function addFlagEl(t){const f=document.createElement('div');f.className='fl';f.title='Flag at '+t.toFixed(1)+'s';f.innerHTML=FLAGSVG;const fl=$('#flags');if(!fl.querySelector('.fl'))fl.innerHTML='';fl.appendChild(f);const st=$('.stage');st.classList.add('hit');setTimeout(()=>st.classList.remove('hit'),250)}
function flag(){
 if(!(P.run&&P.mode==='test'))return;clicks.push(P.t);addFlagEl(P.t);$('#sr').textContent='Flag '+clicks.length;
}
/* ---------- test flow ---------- */
function steps(){const s=$('#steps');s.classList.remove('hidden');s.innerHTML='<span>Clip '+(M.i+1)+' of '+M.list.length+(M.grp?' · '+GN(M.grp):'')+'</span>'+M.list.map((c,i)=>'<i class="'+(i<M.res.length?'done':i===M.i?'cur':'')+'"></i>').join('')}
function pick(){const d=sh(CLIPS.filter(c=>c.hs==null)),h=sh(CLIPS.filter(c=>c.hs!=null));return sh(d.slice(0,1).concat(h.slice(0,7)))}
function start(grp,opt){M={i:0,res:[],mx:[],on:true,grp:grp||null,exam:!!(opt&&opt.exam),lesson:false,list:(opt&&opt.list)||(grp?sh(CLIPS.filter(c=>c.g===grp)):pick())};startClip()}
function startClip(){
 const c=M.list[M.i];clicks=[];if(document.activeElement)document.activeElement.blur();
 $('#clipLbl').textContent='Clip '+(M.i+1)+' of '+M.list.length;$('#speedLbl').textContent=c.mph+' mph';
 $('#flags').innerHTML='<span>Flags appear here</span>';$('#capt').textContent=c.cap;$('#capt').classList.toggle('hidden',!$('#cc').checked);
 $('#live').classList.remove('hidden');$('#rev').classList.add('hidden');$('#lesson').classList.add('hidden');steps();show('clip');play(c,'test',1,false);
}
const WIN=c=>c.w||(c.hs==null?[]:[{hs:c.hs,he:c.he}]);
function score(c,cl){
 const ws=WIN(c);if(!ws.length)return{s:cl.length?0:5,mx:5,parts:[],f:[],spam:0};
 const mx=ws.length*MAX;if(cl.length>(ws.length>1?6:4))return{s:0,mx,parts:ws.map(()=>0),f:ws.map(()=>null),spam:1};
 const f=[],parts=ws.map((w,i)=>{const bw=(w.he-w.hs)/MAX;let b=0,ft=null;cl.forEach(t=>{if(t>=w.hs&&t<=w.he){b=Math.max(b,MAX-Math.min(MAX-1,Math.floor((t-w.hs)/bw)));if(ft==null||t<ft)ft=t}});f[i]=ft;return b});
 return{s:parts.reduce((a,b)=>a+b,0),mx,parts,f,spam:0};
}
function tlBuild(tl,c,phid,cl){
 tl.innerHTML='';const cols=['#1b8a4f','#5aa13c','#c9a30a','#e07a14','#d6232a'];
 WIN(c).forEach(w=>{const bw=(w.he-w.hs)/MAX;for(let i=0;i<MAX;i++){const b=document.createElement('div');b.className='band';b.style.cssText='left:'+((w.hs+i*bw)/c.dur*100)+'%;width:'+(bw/c.dur*100)+'%;background:'+cols[i]+';transition-delay:'+(i*150)+'ms';b.textContent=MAX-i;tl.appendChild(b);setTimeout(()=>b.classList.add('in'),60)}});
 cl.forEach(t=>{const m=document.createElement('div');m.className='mk';m.style.left=(t/c.dur*100)+'%';tl.appendChild(m)});
 const ph=document.createElement('div');ph.id=phid;ph.className='phl';tl.appendChild(ph);
}
function ring(f){const a=$('#sarc');if(!a)return;a.style.transition='none';a.style.strokeDashoffset=327;void a.getBoundingClientRect();a.style.transition='stroke-dashoffset 1s ease';a.style.strokeDashoffset=327*(1-f)}
function finish(){
 const c=P.c,r=score(c,clicks),s=r.s,ws=WIN(c),ratio=s/r.mx;lastS=s;lastParts=r.parts;M.res.push(s);M.mx.push(r.mx);
 S.hist.push({title:c.title,cat:c.cat,g:c.g,s,mx:r.mx});
 if(ws.length)S.streak=ratio>=.8?S.streak+1:0;else if(s<5)S.streak=0;
 S.best=Math.max(S.best,S.streak);
 award('first');if(ws.length&&s===r.mx)award('perfect');if(!ws.length&&s===5)award('decoy');if(S.streak>=5)award('streak5');
 if(M.exam){M.i++;if(M.i>=M.list.length)results();else startClip();return}
 steps();$('#live').classList.add('hidden');$('#rev').classList.remove('hidden');
 $('#rvTitle').textContent='Clip '+(M.i+1)+': '+c.title+(!ws.length?(s===5?'  ✅ Correct, no hazard':'  ❌ Flagged a non-hazard'):ws.length>1?(s===r.mx?'  ✅ Both hazards spotted':s>0?'  ⚠️ One hazard spotted':'  ❌ Hazards missed'):(s>0?'  ✅ Hazard spotted':'  ❌ Hazard missed'));
 $('#rvMax').textContent=r.mx;countUp($('#rvScore'),s,900);ring(s/r.mx);
 const cls=t=>{for(let i=0;i<ws.length;i++){const w=ws[i];if(t>=w.hs&&t<=w.he)return'in hazard '+(i+1)+' window ('+(MAX-Math.min(MAX-1,Math.floor((t-w.hs)/((w.he-w.hs)/MAX))))+' pts)'}return t<ws[0].hs?'before the first window':t>ws[ws.length-1].he?'after the last window':'between the windows'};
 let rows;
 if(!ws.length)rows=[['Hazards in this clip','None'],['Your flags',clicks.length]];
 else{rows=[];ws.forEach((w,i)=>{rows.push(['Hazard '+(i+1)+' window',w.hs+'s to '+w.he+'s']);rows.push(['Your first flag in it',r.f[i]!=null?r.f[i].toFixed(1)+'s ('+(r.f[i]-w.hs).toFixed(1)+'s after it opened): '+r.parts[i]+' pts':'None: 0 pts'])});rows.push(['Flags used',clicks.length+(r.spam?' (too many, scored 0)':'')]);rows.push(['Each flag',clicks.length?clicks.map(t=>t.toFixed(1)+'s: '+cls(t)).join('; '):'None'])}
 $('#rvTable').innerHTML=rows.map(x=>'<tr><th scope="row">'+x[0]+'</th><td>'+x[1]+'</td></tr>').join('');
 $('#rvMsg').textContent=!ws.length?(s===5?'Well done. You correctly left this clip unflagged.':'There was no hazard here, so flagging scores 0.'):r.spam?'Too many flags. Repeated clicking scores 0.':!clicks.length?'You did not flag anything.':s===0?'Your flags were outside the scoring windows.':s===r.mx?'Perfect reaction.':(ws.length>1&&r.parts.some(p=>!p))?'You missed one of the two hazards.':ratio>=.6?'Good, but earlier scores higher.':'Late. React as soon as the hazard starts to develop.';
 $('#rvTip').innerHTML='<b>'+(s===r.mx?'Full marks. ':'How to score full marks: ')+'</b>'+(s===r.mx?c.why:c.why+' '+c.tip);
 const sids=c.objs.filter(o=>o.k==='sign').map(o=>o.s);
 $('#rvSigns').innerHTML=sids.length?'<h3>Signs in this clip</h3>'+sids.map(id=>'<div class="sgc">'+svgOf(SGM[id],'sign sm')+'<div><b>'+SGM[id].n+'</b><br>'+SGM[id].d+'</div></div>').join(''):'';
 if(ws.length&&s===r.mx)confetti(innerWidth/2,innerHeight/3);
 SQ=null;const sqe=$('#rvSignQ');
 if(sids.length){const id=sids[Math.floor(Math.random()*sids.length)],sg=SGM[id],o=sh([sg.d].concat(sh(SGL.filter(x=>x.d!==sg.d)).slice(0,3).map(x=>x.d)));SQ={a:o.indexOf(sg.d)};sqe.innerHTML='<h3>Sign check</h3><div class="sgc">'+svgOf(sg,'sign sm')+'<b>What does this sign mean and what should you do?</b></div><div class="opts">'+o.map((t,i)=>'<button data-j="'+i+'">'+t+'</button>').join('')+'</div><div id="sqf" aria-live="polite"></div>'}else sqe.innerHTML='';
 tlBuild($('#tl'),c,'ph',clicks);
 $('#next').textContent=M.i===M.list.length-1?'See results':'Next clip';
 $('#sr').textContent='Clip scored '+s+' out of '+r.mx+'. '+$('#rvMsg').textContent;
 if(r.parts.some(p=>p<MAX))setTimeout(()=>{if(M.on&&!$('#rev').classList.contains('hidden'))replay(true)},1200);
}
function replay(tip){const sp=+$('#spd').value;play(P.c,'replay',sp,tip===true?lastParts.map(p=>p<MAX):null)}
function countUp(el,to,ms){if(document.body.classList.contains('rm')||!to){el.textContent=to;return}const t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/ms);el.textContent=Math.round(to*k);if(k<1)requestAnimationFrame(f)})(t0)}
function results(){
 const ex=M.exam&&E,tot=M.res.reduce((a,b)=>a+b,0),max=M.mx.reduce((a,b)=>a+b,0),pct=Math.round(tot/max*100),ok=ex?tot>=44:pct>=PASS,thOk=ex?E.score>=E.pass:true;
 S.att.push(pct);if(ok&&thOk){award('mock');confetti(innerWidth/2,innerHeight/3)}M.on=false;$('#steps').classList.add('hidden');
 $('#fMax').textContent=max;$('#cDate').textContent=new Date().toLocaleDateString('en-GB');countUp($('#fTotal'),tot,1200);
 $('#cTitle').textContent=ex?'Theory test practice result':(M.grp?GN(M.grp)+' practice':'Hazard perception practice')+' certificate';
 $('#fVerdict').innerHTML=ex?'<strong class="'+(ok&&thOk?'pass':'fail')+'">'+(ok&&thOk?'Pass':'Not yet a pass')+'</strong><br>Multiple choice: '+E.score+' / '+E.qs.length+' (pass mark '+E.pass+') '+(thOk?'✅':'❌')+'<br>Hazard perception: '+tot+' / '+max+' (pass mark 44) '+(ok?'✅':'❌')+'<br>You must pass both parts.':'<strong class="'+(ok?'pass':'fail')+'">'+(ok?'Pass':'Not yet a pass')+'</strong> at '+pct+'% (pass mark '+PASS+'%, matching 44 out of 75).';
 $('#fRows').innerHTML=M.list.map((c,i)=>'<div class="rr"><span>'+c.title+'</span><div class="meter"><i data-w="'+M.res[i]/M.mx[i]*100+'"></i></div><b>'+M.res[i]+'/'+M.mx[i]+'</b></div>').join('');
 const wrong=ex?E.qs.map((q,i)=>({q,i})).filter(x=>!same(x.q,E.ans[x.i])):[];
 $('#fMore').innerHTML=ex?(wrong.length?'<h3>Questions to review</h3>'+wrong.map(x=>'<p><b>Q'+(x.i+1)+'. '+x.q.q+'</b><br>Your answer: '+((E.ans[x.i]||[]).map(k=>x.q.o[k]).join(' / ')||'Not answered')+'<br>Correct: '+x.q.a.map(k=>x.q.o[k]).join(' / ')+'. '+x.q.why+'</p>').join(''):'<p>You answered every multiple-choice question correctly.</p>'):'';
 show('results');$$('#fRows i').forEach((e,i)=>setTimeout(()=>e.style.width=e.dataset.w+'%',300+i*450));
 $('#sr').textContent='Practice finished. You scored '+tot+' out of '+max+' in hazard perception'+(ex?' and '+E.score+' out of '+E.qs.length+' in the multiple choice part':'')+'.';
}

/* ---------- badges, router, settings ---------- */
function award(id){if(S.badges[id])return;S.badges[id]=1;const b=BADGES[id],t=$('#toast');t.textContent=b[0]+' Badge unlocked: '+b[1];t.classList.add('on');setTimeout(()=>t.classList.remove('on'),3200);confetti(innerWidth-120,innerHeight-80)}
function show(id){
 if(id!=='clip'){P.run=false;cancelAnimationFrame(raf)}
 if(id!=='clip'&&id!=='results')$('#steps').classList.add('hidden');
 $$('.screen').forEach(s=>s.classList.add('hidden'));const el=$('#'+id);el.classList.remove('hidden','enter');void el.offsetWidth;el.classList.add('enter');
 $$('nav button').forEach(b=>b.removeAttribute('aria-current'));const nb=$('nav [data-go="'+(id==='clip'||id==='results'?(M.exam?'exam':M.lesson?'learn':M.grp?'hazards':'practice'):id)+'"]');if(nb)nb.setAttribute('aria-current','page');
 if(id==='profile')profile();if(id==='hazards')renderHazards();if(id==='learn')renderLearn();if(id==='exam')examIntro();if(id==='theory')quiz(Q.mode);window.scrollTo(0,0);
}

/* ---------- hazard groups ---------- */
function renderHazards(){
 $('#groups').innerHTML=GROUPS.map((g,i)=>{const n=CLIPS.filter(c=>c.g===g.id).length,h=S.hist.filter(x=>x.g===g.id),av=h.length?(h.reduce((a,b)=>a+b.s,0)/(h.reduce((a,b)=>a+b.mx,0)/5)).toFixed(1)+'/5 per hazard':'Not tried yet';
  return'<button class="gcard" data-grp="'+g.id+'" style="--i:'+i+'"><span class="gi">'+g.icon+'</span><b>'+g.name+'</b><span class="mut">'+g.desc+'</span><span class="gm">'+n+' clips · '+av+'</span><span class="go">Start practising →</span></button>'}).join('');
}
$('#rvSignQ').addEventListener('click',e=>{const b=e.target.closest('[data-j]');if(!b||!SQ||b.disabled)return;const j=+b.dataset.j;$$('#rvSignQ .opts button').forEach((x,k)=>{x.disabled=true;if(k===SQ.a)x.classList.add('ok')});if(j!==SQ.a)b.classList.add('bad');S.sq.push(j===SQ.a?1:0);$('#sqf').innerHTML='<p><b>'+(j===SQ.a?'Correct. ':'Not quite. ')+'</b>This sign appeared in the clip you just drove.</p>'});
/* ---------- profile ---------- */
function profile(){
 const n=S.hist.length,avg=n?(S.hist.reduce((a,b)=>a+b.s,0)/(S.hist.reduce((a,b)=>a+b.mx,0)/5)).toFixed(1):'-';
 $('#stats').innerHTML=[['Clips completed',n],['Average score',avg+(n?' / 5':'')],['Current streak','🔥 '+S.streak],['Best streak',S.best],['Sign checks',S.sq.length?S.sq.reduce((a,b)=>a+b,0)+' / '+S.sq.length:'-']].map(x=>'<div class="card"><span class="mut">'+x[0]+'</span><b>'+x[1]+'</b></div>').join('');
 if(!n)$('#chart').innerHTML='<p class="mut">Complete a clip to see your history chart.</p>';
 else{const w=900,h=170,pts=S.hist.map((x,i)=>[n>1?30+i*(w-60)/(n-1):w/2,h-20-x.s/x.mx*MAX/MAX*(h-40)]);
  $('#chart').innerHTML='<svg viewBox="0 0 '+w+' '+h+'" width="100%" role="img" aria-label="Line chart of your clip scores over time, out of 5">'+[0,5].map(v=>'<line x1="30" x2="'+(w-30)+'" y1="'+(h-20-v/MAX*(h-40))+'" y2="'+(h-20-v/MAX*(h-40))+'" stroke="currentColor" opacity=".2"/>').join('')+'<polyline fill="none" stroke="#d6232a" stroke-width="3" points="'+pts.map(p=>p.join(',')).join(' ')+'"/>'+pts.map((p,i)=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="#d6232a"><title>Clip '+(i+1)+': '+S.hist[i].s+'/'+S.hist[i].mx+'</title></circle>').join('')+'</svg>'}
 $('#badges').innerHTML=Object.keys(BADGES).map(k=>{const b=BADGES[k];return'<div class="bd'+(S.badges[k]?' on':'')+'"><span>'+b[0]+'</span><b>'+b[1]+'</b><div class="mut">'+b[2]+'</div></div>'}).join('');
 $('#hist').innerHTML=n?S.hist.slice(-8).reverse().map(x=>'<tr><td>'+x.title+'</td><td>'+x.cat+'</td><td>'+x.s+' / '+x.mx+'</td></tr>').join(''):'<tr><td class="mut">No clips yet.</td></tr>';
}

/* ---------- theory and signs ---------- */
const THEORY=[
{q:'In ideal conditions, what is the typical overall stopping distance at 30 mph?',o:['9 metres (30 feet)','23 metres (75 feet)','36 metres (120 feet)','53 metres (175 feet)'],a:1,why:'Thinking distance plus braking distance at 30 mph is about 23 metres, or 6 car lengths.'},
{q:'What is the legal minimum tyre tread depth for a car?',o:['1.0 mm','1.6 mm','2.0 mm','3.0 mm'],a:1,why:'The legal minimum is 1.6 mm across the central three-quarters of the tread, around the whole tyre.'},
{q:'On wet roads, stopping distances are at least...',o:['The same as dry roads','1.5 times longer','Twice as long','Ten times longer'],a:2,why:'Wet roads roughly double stopping distances, so leave at least a 4 second gap.'},
{q:'When may you use front fog lights?',o:['Whenever it is raining','When visibility is seriously reduced, under about 100 metres','At night on any road','Only on motorways'],a:1,why:'Use fog lights only when visibility is seriously reduced, and switch them off when it improves.'},
{q:'You approach a zebra crossing and someone has stepped onto it. You should...',o:['Sound your horn','Flash your lights','Give way and let them cross','Speed up to pass before they cross'],a:2,why:'You must give way to anyone who has moved onto a zebra crossing.'},
{q:'What is the safest advice about alcohol and driving?',o:['Stay under the limit','Drink only one drink','Do not drink any alcohol if you are driving','Drink water between drinks'],a:2,why:'Alcohol slows reactions and affects judgement even below the limit. The only safe amount is none.'}];
/* ---------- learn mode: animated lessons ---------- */
let LF='all';
function renderLearn(){
 $('#lchips').innerHTML=['all'].concat(GROUPS.map(g=>g.id)).map(id=>'<button class="chip'+(LF===id?' on':'')+'" data-f="'+id+'">'+(id==='all'?'All lessons':GROUPS.find(g=>g.id===id).icon+' '+GN(id))+'</button>').join('');
 $('#lessons').innerHTML=CLIPS.filter(c=>LF==='all'||c.g===LF).map((c,i)=>{const g=GROUPS.find(x=>x.id===c.g),n=WIN(c).length;return'<button class="gcard" data-l="'+c.id+'" style="--i:'+(i%20)+'"><span class="gi">'+g.icon+'</span><b>'+c.title+'</b><span class="mut">'+(n>1?'Two hazards · ':n?'':'No hazard · ')+g.name+'</span><span class="go">▶ Watch lesson</span></button>'}).join('');
}
$('#lchips').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(b){LF=b.dataset.f;renderLearn()}});
$('#lessons').addEventListener('click',e=>{const b=e.target.closest('[data-l]');if(b)startLesson(b.dataset.l)});
function startLesson(id){
 const c=CLIPS.find(x=>x.id===id);M={i:0,res:[],mx:[],on:true,grp:null,exam:false,lesson:true,list:[c]};clicks=[];
 if(document.activeElement)document.activeElement.blur();
 $('#clipLbl').textContent='Lesson: '+c.title;$('#speedLbl').textContent=c.mph+' mph';
 $('#capt').textContent=c.cap;$('#capt').classList.toggle('hidden',!$('#cc').checked);
 $('#live').classList.add('hidden');$('#rev').classList.add('hidden');$('#lesson').classList.remove('hidden');
 $('#dTitle').textContent=c.title;$('#dWhy').innerHTML='<b>What develops:</b> '+c.why;$('#dTip').innerHTML='<b>What to do:</b> '+c.tip;
 const sids=c.objs.filter(o=>o.k==='sign').map(o=>o.s);
 $('#dSigns').innerHTML=sids.length?'<h3>Signs in this clip</h3>'+sids.map(s=>'<div class="sgc">'+svgOf(SGM[s],'sign sm')+'<div><b>'+SGM[s].n+'</b><br>'+SGM[s].d+'</div></div>').join(''):'';
 tlBuild($('#dtl'),c,'dph',[]);show('clip');$('#steps').classList.add('hidden');runLesson();
}
function runLesson(){const c=M.list[0];$('#flags').innerHTML='<span>The lesson presses Space for you</span>';play(c,'demo',+$('#dspd').value,true)}
function demoUI(){
 const c=P.c,t=P.t,ws=WIN(c),k=$('#kbd');let ph='Watch the road and look for clues',sub='Something may be about to develop. Keep scanning.',pts='–',hot=false,press=false;
 if(!ws.length){ph='No hazard in this clip';sub='Nothing develops, so do not press Space.';pts='0'}
 else{let cur=-1;ws.forEach((w,i)=>{if(t>=w.hs-2&&t<=w.he+.6)cur=i});
  if(cur>=0){const w=ws[cur],bw=(w.he-w.hs)/MAX;
   if(t<w.hs){ph='A hazard is about to develop';sub='Do not press yet. Wait until it starts to develop.'}
   else if(t<=w.he){const p=MAX-Math.min(MAX-1,Math.floor((t-w.hs)/bw));ph=p===MAX?'Hazard developing: press Space now!':'The window is open but the points are dropping';sub=p===MAX?'This is the earliest moment, worth 5 points.':'Pressing now scores '+p+'. Earlier is better.';pts=p;hot=true;press=(t>=w.hs+.15&&t<=w.hs+.55)}
   else{ph='Window closed';sub='Keep watching and slow down safely.'}}}
 $('#dPhase').textContent=ph;$('#dSub').textContent=sub;$('#dPts').textContent=pts;k.classList.toggle('hot',hot);k.classList.toggle('press',press);
 const d=$('#dph');if(d)d.style.left=(t/c.dur*100)+'%';
 ws.forEach((w,i)=>{if(!P.dem[i]&&t>=w.hs+.2){P.dem[i]=1;addFlagEl(t)}});
}
$('#dReplay').addEventListener('click',()=>{if(M.lesson)runLesson()});
$('#dspd').addEventListener('input',e=>{$('#dspdv').textContent=e.target.value+'x';if(P.mode==='demo')P.sp=+e.target.value});
$('#dTry').addEventListener('click',()=>{start(null,{list:[M.list[0]]})});
$('#dNext').addEventListener('click',()=>{const f=CLIPS.filter(c=>LF==='all'||c.g===LF),i=f.findIndex(c=>c.id===M.list[0].id);startLesson(f[(i+1)%f.length].id)});

/* ---------- full mock exam (follows the real car theory test format) ---------- */
const NEWQ=[
{q:'What is the national speed limit for cars on a single carriageway?',o:['50 mph','60 mph','70 mph','80 mph'],a:1,why:'The limit for cars on a single carriageway is 60 mph unless signs show otherwise.'},
{q:'What is the national speed limit for cars on a motorway?',o:['60 mph','70 mph','80 mph','50 mph'],a:1,why:'Cars may travel at up to 70 mph on a motorway unless a lower limit applies.'},
{q:'Which lane should you normally use on a motorway?',o:['The right-hand lane','The middle lane','The left-hand lane','The hard shoulder'],a:2,why:'Keep to the left-hand lane unless you are overtaking.'},
{q:'When may you use the hard shoulder on a motorway?',o:['To overtake slow traffic','In an emergency or breakdown','When you feel tired','If traffic is slow'],a:1,why:'The hard shoulder is for emergencies only, unless signs say it is a running lane.'},
{q:'What does a flashing amber light at a pelican crossing mean?',o:['Stop and wait','Give way to pedestrians on the crossing, and go if it is clear','Speed up to clear the crossing','The road is closed'],a:1,why:'You must give way to anyone still on the crossing, but may go if it is clear.'},
{q:'An ambulance with flashing blue lights approaches. What should you do?',o:['Ignore it','Speed up','Consider the route and let it pass when it is safe','Stop wherever you are'],a:2,why:'Stay calm, check where the vehicle needs to go and pull in safely. Do not stop on crossings or in box junctions.'},
{q:'What is the minimum age to drive a car on UK roads with a provisional licence?',o:['16','17','18','21'],a:1,why:'You can drive a car from age 17, or 16 if you get the enhanced rate of the PIP mobility component.'},
{q:'You have a tyre blow-out on a straight road. What is the best action?',o:['Brake hard','Grip the wheel firmly and ease off the accelerator','Steer sharply to the side','Switch off the engine'],a:1,why:'Hold the wheel firmly, ease off the accelerator and let the car slow, then brake gently.'},
{q:'You approach double white lines and the line nearest to you is solid. What should you do?',o:['Overtake if it is clear','Not cross or straddle the line to overtake','Stop and wait','Flash your headlights'],a:1,why:'You must not cross a solid line nearest you, except to enter a side road or to pass a stationary vehicle.'},
{q:'When should you use dipped headlights in daytime?',o:['Always','When visibility is seriously reduced','Never','Only in tunnels'],a:1,why:'Use headlights when you cannot see clearly, generally when visibility is under 100 metres.'},
{q:'You feel tired while driving. What should you do?',o:['Open a window and carry on','Stop in a safe place and rest','Drink a coffee and keep going','Turn up the radio'],a:1,why:'Find a safe place to stop, such as a service area, and rest. Caffeine only helps briefly.'},
{q:'How often must a car over three years old have an MOT test?',o:['Every 6 months','Every year','Every 2 years','Every 3 years'],a:1,why:'Cars over three years old need an MOT every year.'},
{q:'What does a red traffic light mean?',o:['Stop and wait behind the stop line','Prepare to go','Give way','Proceed with caution'],a:0,why:'You must stop behind the line and wait for green.'},
{q:'What is the rule for a yellow box junction?',o:['You may enter if your exit is clear','Never stop in it under any circumstances','Do not enter unless your exit road is clear, except when turning right and waiting for oncoming traffic','You may stop in it at any time'],a:2,why:'Enter only if your exit is clear, unless you are turning right and are only stopped by oncoming traffic.'},
{q:'When is it acceptable to overtake on the left?',o:['Never','When the vehicle ahead signals to turn right and there is room','Whenever traffic is slow','On bends'],a:1,why:'You may pass on the left if the vehicle ahead is signalling right and there is room to do so safely.'},
{q:'What is the two-second rule used for?',o:['Passing a cyclist','Keeping a safe gap behind the vehicle in front in good conditions','Time to signal before turning','Checking mirrors'],a:1,why:'Leave at least two seconds behind the vehicle ahead on good dry roads.'},
{q:'In wet weather, you should leave a gap of at least...',o:['One second','Two seconds','Four seconds','Eight seconds'],a:2,why:'Wet roads roughly double stopping distances, so double the gap to four seconds.'},
{q:'Who has priority at a roundabout?',o:['Traffic approaching from the right','Traffic approaching from the left','The largest vehicle','The fastest vehicle'],a:0,why:'Give way to traffic from the right unless signs or markings say otherwise.'},
{q:'People are waiting to cross at a zebra crossing. What should you do?',o:['Sound your horn','Slow down and be ready to stop','Wave them across and speed up','Flash your lights'],a:1,why:'Slow down and be prepared to stop, and give way to anyone who has stepped onto the crossing.'},
{q:'Which TWO should you do if your vehicle breaks down on a motorway?',o:['Stand behind the vehicle','Switch on the hazard lights','Leave by the left-hand door and wait behind the barrier','Try to repair it quickly'],a:[1,2],why:'Use hazard lights, and get everyone out by the left side and behind the barrier, away from traffic.'},
{q:'Which TWO are signs of driver fatigue?',o:['Yawning','Feeling alert','Heavy eyelids','Excessive chatting'],a:[0,2],why:'Yawning, heavy eyelids and difficulty concentrating are signs you need to stop and rest.'}];
const CASE={scn:'Jo has just passed their practical test and is driving a family car on a wet evening. They will join a motorway, then drive through a town with a school.',qs:[
{q:'Jo joins the motorway. How should Jo join?',o:['Along the hard shoulder','From the slip road, matching speed with traffic','By driving straight into the right-hand lane','By stopping at the end of the slip road'],a:1,why:'Use the slip road to match the speed of traffic and merge when there is a safe gap.'},
{q:'It is raining heavily. What should Jo do about the gap behind the vehicle in front?',o:['Halve it','Keep it the same','At least double it','Stay close so they can see'],a:2,why:'Stopping distances are at least doubled on wet roads.'},
{q:'The windscreen mists up. What is the best action?',o:['Use the demister and ventilation, and stop safely if needed','Wipe it by hand while driving','Switch off the headlights','Close all the vents'],a:0,why:'Use the demister and ventilation to clear it, and pull over if you cannot see.'},
{q:'In town Jo sees a children warning sign. What should Jo expect?',o:['Children may cross, so slow down','A level crossing','Road works','A speed camera only'],a:0,why:'The sign warns that children may be crossing or near the road, so slow down and be ready to stop.'},
{q:'Jo’s phone rings while driving. What should Jo do?',o:['Answer it holding the phone','Let it go to voicemail and call back when safely parked','Read the message at the lights','Reply by text'],a:1,why:'Do not use a handheld phone while driving. Park safely before using it.'}]};
const EXAMQ=THEORY.concat(NEWQ),ETIME=34*60;
let E=null,ET=0;
const eq=x=>{const idx=sh(x.o.map((_,i)=>i));return{q:x.q,o:idx.map(i=>x.o[i]),a:(Array.isArray(x.a)?x.a:[x.a]).map(a=>idx.indexOf(a)),why:x.why}};
const same=(q,a)=>(a||[]).slice().sort().join()===q.a.slice().sort().join();
function examIntro(){clearInterval(ET);E=null;$('#examBox').innerHTML='<div class="exh"><b>Theory test practice</b><span>Candidate: Learner</span></div><div class="exq"><h2>Before you start</h2><p>This mock follows the real car theory test as closely as a practice site can.</p><ul class="how"><li><b>Part 1, multiple choice:</b> 30 questions here (50 in the real test) in 34 minutes (57 in the real test). Pass mark 26 of 30 (43 of 50). The last five questions are a case study. Flag questions and review them before you finish.</li><li><b>Optional 3-minute break</b> between the parts.</li><li><b>Part 2, hazard perception:</b> a short tutorial, then 14 clips with one attempt each and no going back. 15 scoreable hazards, one clip has two. Pass mark 44 of 75.</li><li>You must pass both parts to pass the theory test.</li></ul><p class="mut">At a real centre you show your photocard licence, store your belongings and can take a 15 minute practice session first. The real hazard test uses a mouse click, here you press Space.</p><div class="row"><button id="eprac">Start practice questions</button><button class="sec" id="estart">Skip to the test</button></div></div>'}
function startExam(practice){
 const std=sh(EXAMQ).slice(0,25).map(eq),cs=CASE.qs.map(q=>Object.assign(eq(q),{scn:CASE.scn}));
 E={practice,qs:practice?sh(THEORY).slice(0,2).map(eq):std.concat(cs),i:0,ans:[],flag:[],end:Date.now()+ETIME*1000};
 clearInterval(ET);if(!practice)ET=setInterval(etick,500);renderQ();
}
function etick(){if(!E||E.practice||E.score!=null)return;const r=Math.max(0,Math.round((E.end-Date.now())/1000)),el=$('#etime');if(el)el.textContent='Time remaining '+Math.floor(r/60)+':'+String(r%60).padStart(2,'0');if(r<=0){clearInterval(ET);finishTheory()}}
function renderQ(){
 const q=E.qs[E.i],sel=E.ans[E.i]||[],n=E.qs.length;
 $('#examBox').innerHTML='<div class="exh"><b>'+(E.practice?'Practice question ':'Question ')+(E.i+1)+' of '+n+'</b><span id="etime"></span><span><button class="sec" id="eflag">'+(E.flag[E.i]?'🚩 Flagged':'⚑ Flag')+'</button> '+(E.practice?'':'<button class="sec" id="erev">Review</button>')+'</span></div><div class="exq">'+(q.scn?'<div class="scn"><b>Case study.</b> '+q.scn+'</div>':'')+'<h2>'+q.q+'</h2>'+(q.a.length>1?'<p class="mut">Mark two answers.</p>':'')+'<div class="opts" id="eo">'+q.o.map((t,i)=>'<button data-o="'+i+'" class="'+(sel.includes(i)?'sel':'')+'">'+t+'</button>').join('')+'</div></div><div class="exf"><button class="sec" id="eprev"'+(E.i?'':' disabled')+'>Previous</button><button id="enext">'+(E.i===n-1?(E.practice?'Finish practice':'Review answers'):'Next')+'</button></div>';
 etick();
}
function renderReview(){
 const n=E.qs.length,un=E.qs.filter((_,i)=>!(E.ans[i]||[]).length).length,fl=E.flag.filter(Boolean).length;
 $('#examBox').innerHTML='<div class="exh"><b>Review your answers</b><span id="etime"></span></div><div class="exq"><p>'+(un?'<b class="fail">'+un+' unanswered</b>. ':'Every question is answered. ')+fl+' flagged. Select a question to go back to it.</p><div class="tiles">'+E.qs.map((_,i)=>'<button class="tile '+((E.ans[i]||[]).length?'ans':'un')+'" data-t="'+i+'">'+(i+1)+(E.flag[i]?' 🚩':'')+'</button>').join('')+'</div>'+(E.sure?'<p class="fail"><b>You still have unanswered questions.</b> Do you want to finish anyway?</p>':'')+'</div><div class="exf"><button class="sec" id="eback">Back to questions</button><button id="efin">Finish test</button></div>';
 etick();
}
function practiceDone(){$('#examBox').innerHTML='<div class="exh"><b>Practice complete</b></div><div class="exq"><h2>Ready for the test?</h2><p>The timer starts as soon as you begin. You can flag questions and review your answers before you finish.</p><button id="estart">Start the test</button></div>'}
function finishTheory(){clearInterval(ET);let sc=0;E.qs.forEach((q,i)=>{if(same(q,E.ans[i]))sc++});E.score=sc;E.pass=Math.ceil(E.qs.length*.86);renderBreak()}
function renderBreak(){$('#examBox').innerHTML='<div class="exh"><b>Part 1 complete</b></div><div class="exq"><h2>Optional break</h2><p>You can take a break of up to 3 minutes before the hazard perception test, or continue straight away. Your multiple-choice result is shown at the end.</p><div id="brk" class="brk"></div><div class="row"><button id="ebrk">Take a 3-minute break</button><button class="sec" id="econt">Continue now</button></div></div>'}
function startBreak(){let s=180;clearInterval(ET);const el=$('#brk'),f=()=>{el.innerHTML='<div class="meter"><i style="width:'+((180-s)/180*100)+'%"></i></div><p><b>'+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'</b> remaining</p>'};f();ET=setInterval(()=>{s--;if(s<=0){clearInterval(ET);hpIntro()}else f()},1000)}
function hpIntro(){clearInterval(ET);$('#examBox').innerHTML='<div class="exh"><b>Part 2: hazard perception</b></div><div class="exq"><h2>How this part works</h2><div class="tut"><div class="card"><span class="gi">🎬</span><b>14 clips</b><p>Each clip plays once. You cannot pause or go back.</p></div><div class="card"><span class="gi">⌨️</span><b>Press Space</b><p>Press when a hazard starts to develop, something that would make you slow down or change direction.</p></div><div class="card"><span class="gi">⏱️</span><b>Earlier scores more</b><p>Up to 5 points per hazard. One clip has two hazards.</p></div><div class="card"><span class="gi">🚫</span><b>Do not spam</b><p>Pressing again and again scores 0 for that clip.</p></div></div><span class="kbd hot">Space</span><p class="mut">You need 44 out of 75 to pass. Your clip-by-clip summary is shown at the end.</p><button id="ebegin">Begin hazard perception</button></div>'}
function examList(){const dbl=sh(CLIPS.filter(c=>c.g==='dbl'))[0],sing=sh(CLIPS.filter(c=>WIN(c).length===1&&c.g!=='dbl')).slice(0,13);return sh(sing.concat(dbl))}
$('#examBox').addEventListener('click',e=>{
 const id=e.target.id,o=e.target.closest('[data-o]'),t=e.target.closest('[data-t]');
 if(id==='eprac')startExam(true);else if(id==='estart')startExam(false);
 else if(o&&E){const q=E.qs[E.i],i=+o.dataset.o;let s=E.ans[E.i]||[];if(q.a.length>1){s=s.includes(i)?s.filter(x=>x!==i):s.concat(i).slice(-2)}else s=[i];E.ans[E.i]=s;$$('#eo button').forEach((b,k)=>b.classList.toggle('sel',s.includes(k)))}
 else if(id==='eflag'){E.flag[E.i]=!E.flag[E.i];e.target.textContent=E.flag[E.i]?'🚩 Flagged':'⚑ Flag'}
 else if(id==='eprev'){E.i--;renderQ()}
 else if(id==='enext'){if(E.i<E.qs.length-1){E.i++;renderQ()}else if(E.practice)practiceDone();else renderReview()}
 else if(id==='erev')renderReview();
 else if(t&&E){E.i=+t.dataset.t;renderQ()}
 else if(id==='eback')renderQ();
 else if(id==='efin'){const un=E.qs.filter((_,i)=>!(E.ans[i]||[]).length).length;if(un&&!E.sure){E.sure=1;renderReview()}else finishTheory()}
 else if(id==='ebrk')startBreak();else if(id==='econt')hpIntro();
 else if(id==='ebegin')start(null,{exam:true,list:examList()});
});

let Q={mode:'theory',items:[],i:0,sc:0,done:false};
function quiz(mode){
 const cat=$('#sigCat').value,pool=SGL.filter(s=>cat==='All'||s.c===cat);
 Q={mode,i:0,sc:0,done:false,items:[]};
 $$('[data-mode]').forEach(b=>b.setAttribute('aria-selected',b.dataset.mode===mode));$('#sigBar').classList.toggle('hidden',mode==='theory');
 if(mode==='lib'){$('#quiz').innerHTML='<div class="lib">'+pool.map((s,i)=>'<div class="sg flip" style="--i:'+(i%24)+'" tabindex="0"><div class="fi"><div class="ff">'+svgOf(s,'sign sm')+'<b>'+s.n+'</b><span class="mut">Hover to flip</span></div><div class="fb"><b>'+s.n+'</b><span>'+s.d+'</span></div></div></div>').join('')+'</div>';return}
 Q.items=mode==='signs'?sh(pool).slice(0,10).map(s=>{const o=sh([s.d].concat(sh(SGL.filter(x=>x.d!==s.d)).slice(0,3).map(x=>x.d)));return{svg:svgOf(s,'sign'),q:'What does this sign mean and what should you do?',o,a:o.indexOf(s.d),why:s.n+': '+s.d}}):sh(THEORY.concat(NEWQ.filter(x=>typeof x.a==='number'))).map(x=>{const o=sh(x.o.map((t,i)=>[t,i===x.a]));return{q:x.q,o:o.map(z=>z[0]),a:o.findIndex(z=>z[1]),why:x.why}});
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
$$('[data-start]').forEach(b=>b.addEventListener('click',()=>start()));
$('#again').addEventListener('click',()=>start(M.grp));
$('#groups').addEventListener('click',e=>{const b=e.target.closest('[data-grp]');if(b)start(b.dataset.grp)});
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
 document.body.style.setProperty('--gx',e.clientX+'px');document.body.style.setProperty('--gy',e.clientY+'px');
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
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});
$$('.rv').forEach(x=>io.observe(x));
const words=['hazard','pedestrian','cyclist','junction','child'];let wi=0;
setInterval(()=>{const r=$('#rot');if(!r||document.body.classList.contains('rm')||$('#home').classList.contains('hidden'))return;
 r.classList.add('out');setTimeout(()=>{wi=(wi+1)%words.length;r.textContent=words[wi];r.classList.remove('out')},300)},2300);
[['clips',CLIPS.length],['signs',SGL.length],['theory',THEORY.length]].forEach(a=>{const el=$('[data-cnt="'+a[0]+'"]');if(el)countUp(el,a[1],1400)});
$('#sigCat').addEventListener('change',()=>quiz(Q.mode));

const TIPS=['A developing hazard is something that would make you change speed or direction.','Press once or twice per hazard. Pressing constantly scores zero.','Look for clues first: parked vans, gaps between cars, junction signs.','The earlier you press inside the window, the more points you score.','Slow down for children, cyclists and animals before they appear.','Not every clip has a hazard. Do not press for things that stay put.'];
let ti=0;$('#tick').textContent=TIPS[0];
setInterval(()=>{const t=$('#tick');if(!t||document.body.classList.contains('rm')||$('#home').classList.contains('hidden'))return;t.classList.add('out');setTimeout(()=>{ti=(ti+1)%TIPS.length;t.textContent=TIPS[ti];t.classList.remove('out')},350)},4200);
window.addEventListener('scroll',()=>{const h=document.documentElement,m=h.scrollHeight-h.clientHeight;h.style.setProperty('--sp',(m>0?h.scrollTop/m*100:0)+'%')});
document.addEventListener('pointermove',e=>{if(document.body.classList.contains('rm'))return;const b=e.target.closest&&e.target.closest('.cta,.ghost');$$('.cta,.ghost').forEach(x=>{if(x!==b)x.style.translate=''});if(b){const r=b.getBoundingClientRect();b.style.translate=((e.clientX-r.left-r.width/2)*.12)+'px '+((e.clientY-r.top-r.height/2)*.2)+'px'}});
show('home');
})();
