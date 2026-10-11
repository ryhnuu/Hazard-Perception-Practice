(function(){
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const cv=$('#cv'),ctx=cv.getContext('2d'),W=800,H=450,HY=165,CX=400,FOC=14,ROAD=3.5,MAX=5,PASS=59;
const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);

/* Session-only state (nothing is stored in the browser; a refresh clears it) */
const S={hist:[],att:[],quiz:[],sq:[],tq:[],streak:0,best:0,badges:{}};
const BADGES={first:['🏁','First clip','Complete any clip'],perfect:['🎯','Perfect 5','Score 5 out of 5 on a clip'],streak5:['🔥','Hot streak','5 clips in a row scoring 4 or more'],decoy:['🛡️','Cool head','Leave a decoy clip unflagged'],mock:['🏆','Test passed','Pass a full practice test'],quiz:['📘','Quiz ace','Score 100% in a theory topic quiz']};

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
function steps(){if(M.mixed){mixSteps();return}const s=$('#steps');s.classList.remove('hidden');s.innerHTML='<span>Clip '+(M.i+1)+' of '+M.list.length+(M.grp?' · '+GN(M.grp):'')+'</span>'+M.list.map((c,i)=>'<i class="'+(i<M.res.length?'done':i===M.i?'cur':'')+'"></i>').join('')}
function pick(){const d=sh(CLIPS.filter(c=>c.hs==null)),h=sh(CLIPS.filter(c=>c.hs!=null));return sh(d.slice(0,1).concat(h.slice(0,7)))}
function start(grp,opt){HT='practice';M={i:0,res:[],mx:[],on:true,grp:grp||null,exam:!!(opt&&opt.exam),lesson:false,list:(opt&&opt.list)||(grp?sh(CLIPS.filter(c=>c.g===grp)):pick())};startClip()}
function startClip(){
 const c=M.list[M.i];clicks=[];if(document.activeElement)document.activeElement.blur();
 $('#clipLbl').textContent=M.lbl||'Clip '+(M.i+1)+' of '+M.list.length;$('#speedLbl').textContent=c.mph+' mph';
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
 $('#next').textContent=M.after?'Continue':M.i===M.list.length-1?'See results':'Next clip';
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
 if(id!=='theory')stopTV();
 if(id!=='clip'){P.run=false;cancelAnimationFrame(raf)}
 if(id!=='clip'&&id!=='results'&&id!=='qs')$('#steps').classList.add('hidden');
 const sw=$('#sw');sw.classList.remove('go');void sw.offsetWidth;sw.classList.add('go');
 $$('.screen').forEach(s=>s.classList.add('hidden'));const el=$('#'+id);el.classList.remove('hidden','enter');void el.offsetWidth;el.classList.add('enter');
 $$('nav button').forEach(b=>b.removeAttribute('aria-current'));const nb=$('nav [data-go="'+(id==='qs'||id==='mix'?'practice':id==='clip'||id==='results'?(M.exam?'exam':(M.lesson||M.grp)?'hazards':'practice'):id)+'"]');if(nb)nb.setAttribute('aria-current','page');
 if(id==='profile')profile();if(id==='hazards')hazTab(HT);if(id==='exam')examIntro();if(id==='theory')quiz(Q.mode);window.scrollTo(0,0);
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
 $('#stats').innerHTML=[['Clips completed',n],['Average score',avg+(n?' / 5':'')],['Current streak','🔥 '+S.streak],['Best streak',S.best],['Sign checks',S.sq.length?S.sq.reduce((a,b)=>a+b,0)+' / '+S.sq.length:'-'],['Theory quizzes',S.tq.length?Math.round(S.tq.reduce((a,b)=>a+b.sc,0)/S.tq.reduce((a,b)=>a+b.n,0)*100)+'%':'-']].map(x=>'<div class="card"><span class="mut">'+x[0]+'</span><b>'+x[1]+'</b></div>').join('');$$('#stats b').forEach(b=>{if(/^\d+$/.test(b.textContent))countUp(b,+b.textContent,700)});
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
 HT='learn';const c=CLIPS.find(x=>x.id===id);M={i:0,res:[],mx:[],on:true,grp:null,exam:false,lesson:true,list:[c]};clicks=[];
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

/* ---------- hazards: two tabs ---------- */
let HT='practice';
function hazTab(t){HT=t;$('#htP').setAttribute('aria-selected',t==='practice');$('#htL').setAttribute('aria-selected',t==='learn');$('#hpPractice').classList.toggle('hidden',t!=='practice');$('#hpLearn').classList.toggle('hidden',t!=='learn');if(t==='practice')renderHazards();else renderLearn()}
$$('[data-ht]').forEach(b=>b.addEventListener('click',()=>hazTab(b.dataset.ht)));
/* ---------- Theory and Signs: Theory (animated lessons) + Sign library ---------- */
const TG=[
{id:'alert',n:'Alertness',i:'👀',d:'Stay observant, avoid distractions and know when you are unfit to drive.'},
{id:'att',n:'Attitude',i:'🤝',d:'Be patient, considerate and calm, whatever other drivers do.'},
{id:'saf',n:'Safety and your vehicle',i:'🔧',d:'Checks, tyres, brakes, seat belts and keeping your vehicle roadworthy.'},
{id:'mar',n:'Safety margins',i:'📏',d:'Stopping distances, gaps and leaving enough space in all conditions.'},
{id:'haz',n:'Hazard awareness',i:'⚠️',d:'Spot and anticipate developing hazards early.'},
{id:'vru',n:'Vulnerable road users',i:'🚶',d:'Pedestrians, cyclists, motorcyclists, horse riders and the hierarchy of road users.'},
{id:'oth',n:'Other types of vehicle',i:'🚌',d:'Motorcycles, large vehicles, buses, trams, tractors and emergency vehicles.'},
{id:'han',n:'Vehicle handling',i:'🛞',d:'Weather, road surfaces, skids and driving at night.'},
{id:'mw',n:'Motorway rules',i:'🛣️',d:'Joining, lanes, overtaking, breakdowns and smart motorways.'},
{id:'rul',n:'Rules of the road',i:'📘',d:'Speed limits, junctions, roundabouts, crossings, lights, markings and parking.'},
{id:'sig',n:'Road and traffic signs',i:'🛑',d:'Sign shapes and colours, road markings and signals. The Sign library has every sign.'},
{id:'doc',n:'Documents',i:'📄',d:'Licences, insurance, MOT, vehicle tax and penalty points.'},
{id:'inc',n:'Incidents, accidents and emergencies',i:'🚑',d:'Breakdowns, first aid and what to do at the scene of a crash.'},
{id:'load',n:'Vehicle loading',i:'📦',d:'Loads, roof racks, towing, passengers and pets.'}];
const AR=(cx,cy,r,a0,a1,t0,t1,n)=>Array.from({length:n+1},(_,i)=>{const u=i/n,a=(a0+(a1-a0)*u)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a),t0+(t1-t0)*u]});
const TDS={
 give:['td','cross',[['car','#2f6fd0',[[720,175,.5],[0,175,5]]],['car','#8a8f98',[[0,125,1],[720,125,6]]],['car','#d6232a',[[343,320,0],[343,222,1.4],[343,222,3.4],[335,196,4],[300,176,4.6],[0,176,7.5]]]],[['Give way: wait for a safe gap',360,30,0,3.3],['Go when the way is clear',360,30,3.4,8]]],
 rbt:['td','rbt',[['car','#2f6fd0',AR(360,150,70,40,250,0,4.4,24).concat([[343,60,4.8],[343,-30,6]])],['car','#d6232a',[[0,132,0],[240,132,1.5],[240,132,4.2]].concat(AR(360,150,70,198,342,4.3,6.9,18),[[480,132,7.4],[720,132,8]])]],[['Give way to traffic from the right',360,30,0,4.2],['Signal, then enter when there is a safe gap',360,30,4.3,8]]],
 zebra:['td','zebra',[['car','#d6232a',[[0,125,0],[290,125,2.5],[290,125,6],[720,125,8]]],['ped','',[[360,70,1.5],[360,230,6]]]],[['Slow down and be ready to stop',360,30,0,2.5],['Stop for people on the crossing',360,30,2.6,5.8],['Move off when it is clear',360,30,5.9,8]]],
 over:['td','two',[['van','#c9a05a',[[130,125,0],[520,125,8]]],['car','#d6232a',[[-40,125,0],[60,125,2],[190,125,3],[240,175,3.6],[470,175,5.2],[540,125,5.9],[720,125,7.6]]],['car','#2f6fd0',[[720,175,0],[720,175,5.5],[560,175,8]]]],[['Check the road ahead is clear',360,30,0,2.9],['Pass quickly and safely',360,30,3,5.5],['Move back when you can see the vehicle in your mirror',360,30,5.6,8]]],
 dual:['td','dual',[['van','#c9a05a',[[120,75,0],[500,75,8]]],['car','#d6232a',[[0,75,0],[90,75,1.5],[160,115,2.4],[420,115,4.8],[500,75,5.6],[720,75,7.6]]]],[['Keep to the left-hand lane',360,30,0,1.5],['Overtake on the right',360,30,1.6,4.8],['Return to the left when it is safe',360,30,4.9,8]]],
 join:['td','dual',[['car','#2f6fd0',[[-50,75,0],[720,75,3.6]]],['car','#d6232a',[[0,32,0],[230,32,2.2],[300,60,3],[360,75,3.6],[720,75,7]]]],[['Check mirrors and match speed on the slip road',360,30,0,2.2],['Join when there is a safe gap',360,30,2.3,8]],'slip'],
 amb:['td','two',[['car','#2f6fd0',[[0,125,0],[150,125,2],[220,108,3.4],[260,108,4.5],[260,108,6],[400,125,7.5]]],['amb','',[[-120,125,.5],[120,125,2.6],[200,150,3.4],[500,150,5],[560,125,5.4],[760,125,6.4]]]],[['Check your mirrors and stay calm',360,30,0,2.8],['Pull in safely, within the law',360,30,2.9,5],['Move off once it has passed',360,30,5.1,8]]],
 cyc:['td','two',[['bike','#f2b705',[[100,112,0],[520,112,8]]],['car','#d6232a',[[-60,125,0],[140,125,2],[210,150,3],[420,150,5],[500,125,5.8],[760,125,8]]]],[['Do not squeeze past',360,30,0,2.8],['Leave at least 1.5 metres',360,30,2.9,5.5],['Move back in only when clear',360,30,5.6,8]]],
 lorry:['td','cross',[['bus','#e8e8e0',[[0,125,0],[200,125,1.5],[260,145,2.6],[320,140,3.3],[343,100,4],[343,-20,5.5]]],['car','#d6232a',[[0,125,1],[170,125,2.8],[170,125,4.6],[720,125,7.8]]]],[['Large vehicles swing out before they turn',360,30,0,3.5],['Stay back. Never squeeze up the inside',360,30,3.6,8]]]
};
const TL=[
['alert','Observation and mirrors','Know what is around you before you signal or move.',['Check your mirrors regularly, and always before you signal, change speed or change direction.','Use the Mirrors, Signal, Manoeuvre routine every time.','Mirrors have blind spots, so glance over your shoulder before moving off or changing lanes.','Windscreen and junction pillars can hide cyclists and pedestrians. Move your head to see around them.','Keep your windscreen, mirrors and windows clean and clear.'],['flow',['Mirrors','Signal','Manoeuvre']]],
['alert','Distractions','Anything that takes your eyes or mind off the road is dangerous.',['Using a hand-held phone while driving is illegal: 6 penalty points and a £200 fine.','Set up your sat nav and music before you set off, and stop safely if you need to change them.','Even hands-free calls can distract you. Let calls go to voicemail.','Do not eat, drink or search for items while driving.','Passengers can distract too. Ask them to keep the noise down if it affects your concentration.'],['icons',[['📱','Phone'],['🗺️','Sat nav'],['🎵','Music'],['🍔','Eating'],['💬','Passengers'],['🔔','Notifications']]]],
['alert','Tiredness','Fatigue slows your reactions and can make you fall asleep at the wheel.',['Take a break of at least 15 minutes every two hours of driving.','Do not start a long journey if you are already tired. Plan your rest stops.','Warning signs are yawning, heavy eyelids, trouble concentrating and drifting in your lane.','Fresh air, loud music or coffee only help for a short time. Stop in a safe place and rest.','Tiredness crashes are most common late at night, early in the morning and in the mid-afternoon.'],['clock','2 hours','Take a break at least every two hours']],
['alert','Alcohol, drugs and medicine','They slow your reactions and affect your judgement.',['The drink-drive limit is 80 mg of alcohol per 100 ml of blood in England, Wales and Northern Ireland, and 50 mg in Scotland.','The safest advice is to drink nothing at all if you are going to drive.','Alcohol stays in your body for hours, so you may still be over the limit the next morning.','Some medicines make you drowsy. Check the label and ask your doctor or pharmacist.','Driving under the influence of illegal drugs is an offence. A drink-drive conviction usually means a ban of at least 12 months.'],['icons',[['🍺','Alcohol'],['💊','Medicines'],['🚫','Illegal drugs'],['☕','Coffee does not sober you up']]]],
['att','Patience and consideration','Good drivers stay calm and make allowances for others.',['Be patient. Do not hold up traffic or rush other road users.','Give way when it is safe, and acknowledge courtesy with a wave or a thank you.','Flashing your headlights only means "I am here". Never treat it as an invitation to go.','Use the horn only to warn of danger. Do not use it in a built-up area between 11:30 pm and 7 am unless another vehicle poses a danger.','Allow extra time and room for learners, who may be nervous.'],['icons',[['😌','Stay calm'],['👋','Say thanks'],['🚦','Be patient'],['🤝','Let others in']]]],
['att','Tailgating and road rage','Do not react to aggressive drivers.',['If someone is tailgating you, do not speed up or brake suddenly. Slow down gently and let them pass when it is safe.','Do not retaliate, make gestures or race other drivers.','If you feel threatened, stay in the car with the doors locked and drive to a place of safety such as a police station.','Never use your vehicle to block another driver.','Leave a safe gap behind the vehicle ahead so you never become the tailgater.'],['flow',['Stay calm','Ease off','Let them pass','Drive on safely']]],
['att','Sharing the road and parking','Think about how your driving affects everyone else.',['Give priority to buses pulling out, and make way for emergency vehicles.','Do not park where you block drives, dropped kerbs, bus stops or entrances.','Do not use bus lanes during their hours of operation.','Electric and hybrid vehicles are very quiet, so pedestrians may not hear them.','Allow others to cross, merge or turn when it is safe to do so.'],['icons',[['🚌','Buses'],['🚲','Cyclists'],['🐴','Horses'],['🚚','Large vehicles'],['🅿️','Parking'],['🚑','Emergency vehicles']]]],
['saf','Daily vehicle checks','A quick check can prevent a breakdown or a crash.',['Remember POWDERY: Petrol, Oil, Water, Damage, Electrics, Rubber and Yourself.','Check engine oil, coolant and windscreen washer fluid regularly.','Check that all lights and indicators work, and that lights and number plates are clean.','Check tyres for cuts, bulges and for the correct pressure and tread.','Make sure you are fit to drive: well rested, sober and comfortable.'],['check',['Petrol (fuel level)','Oil','Water (coolant and screenwash)','Damage','Electrics (lights, indicators)','Rubber (tyres)','Yourself']]],
['saf','Tyres','Your tyres are the only part of the car that touches the road.',['The legal minimum tread depth for cars is 1.6 mm across the central three-quarters of the tread, around the whole tyre.','Check tyre pressures regularly when the tyres are cold, and check the spare too.','Under-inflated or over-inflated tyres wear unevenly and affect handling and braking.','Look for cuts, bulges and objects stuck in the tread, and replace damaged tyres.','The correct pressures are in your vehicle handbook.'],['bars',[['Legal minimum',1.6,8,'#d6232a','1.6 mm'],['Advised: replace around',3,8,'#f2b705','3 mm'],['A new tyre (about)',8,8,'#1b8a4f','8 mm']]]],
['saf','Brakes, lights and MOT','Keep every safety system working.',['If your ABS warning light stays on, your normal brakes still work but ABS may not. Get it checked.','Brakes that pull to one side, feel spongy or make noise need checking at once.','A car needs an MOT after three years and then every year. Service it regularly too.','Use headlights in poor daytime visibility, and do not dazzle others.','Do not use hazard lights while driving, except on a motorway or dual carriageway to warn of a hazard ahead.'],['icons',[['🛑','Brakes'],['🎯','Steering'],['💡','Lights'],['📋','MOT']]]],
['saf','Seat belts and child safety','Wear a seat belt on every journey.',['The driver must make sure passengers under 14 wear seat belts or use the right child seat.','Children must use a child car seat until they are 12 years old or 135 cm tall, whichever comes first.','Adjust head restraints so the top is at least level with your eyes.','Never put a rear-facing baby seat in front of an active airbag.','Lock your car and take valuables with you.'],['icons',[['🧒','Under 14: driver is responsible'],['💺','Child seat until 12 or 135 cm'],['🛡️','Head restraint up'],['🔒','Lock the car']]]],
['mar','Stopping distances','Overall stopping distance is thinking distance plus braking distance.',['Thinking distance is how far you travel before you react. Braking distance is how far you travel once the brakes are on.','At 30 mph the typical stopping distance is 23 metres, about 6 car lengths. At 70 mph it is 96 metres.','If you double your speed, your braking distance becomes about four times longer.','Tiredness, alcohol and distractions all lengthen thinking distance.','Worn tyres or brakes, wet roads and heavy loads lengthen braking distance.'],['stop']],
['mar','The two-second rule','Keep a safe gap behind the vehicle in front.',['Pick a fixed object ahead, such as a lamp post. When the car ahead passes it, say "Only a fool breaks the two-second rule".','If you pass the object before you finish saying it, you are too close.','Leave at least two seconds in good conditions, and double it to four seconds on wet roads.','Leave even more on icy roads, up to ten times the normal gap.','Leave extra room behind large vehicles and motorcycles, and when towing.'],['gap',2]],
['mar','Wet, icy and foggy weather','Bad weather means you must slow down and leave more room.',['On wet roads stopping distances are at least double. On ice they can be up to ten times longer.','In fog, slow down and use dipped headlights. Use fog lights only when visibility is under 100 metres, and turn them off when it improves.','Do not follow the tail lights of the vehicle ahead too closely in fog.','On ice, be gentle: pull away in a higher gear and brake and steer smoothly.','Look out for spray, puddles and standing water, and slow down.'],['bars',[['Dry road',1,10,'#1b8a4f','×1'],['Wet road',2,10,'#f2b705','×2 or more'],['Icy road',10,10,'#d6232a','up to ×10']]]],
['mar','Overtaking and giving space','Overtake only when it is safe, and leave room.',['Only overtake when it is safe and legal, and you can see well ahead.','Do not overtake near junctions, bends, hill crests, pedestrian crossings, or where there are double white lines with the solid line nearest you.','Give cyclists at least 1.5 metres when passing at up to 30 mph, and more at higher speeds.','Give horse riders and pedestrians at least 2 metres, and pass horses slowly.','After overtaking, move back only when you can see the vehicle in your mirror.'],TDS.over],
['haz','What is a developing hazard?','Learn what you are looking for in the hazard perception test.',['A hazard is anything that may make you change speed or direction.','A developing hazard is one that is getting more dangerous, such as a car edging out of a junction.','In the hazard perception test you press Space when a hazard starts to develop, and the earlier the better.','Not everything is a hazard. A parked car that stays still is not a developing hazard.','Practise in the Hazards section to learn the clues.'],['icons',[['🚶','Pedestrian steps out'],['🚗','Car pulls out'],['🚲','Cyclist swerves'],['⚽','Ball in the road']]]],
['haz','Scanning and anticipation','Good drivers look ahead and predict what could happen.',['Look as far ahead as you can and keep scanning, not just at the car in front.','Look for clues such as brake lights, parked vans, bus stops, junctions, schools and gaps between parked cars.','Ask yourself what could happen next, and be ready for it.','Reduce your speed early and gently rather than braking late.','Check your mirrors often so you know what is behind before you slow or move out.'],['flow',['Scan far ahead','Scan the sides','Check mirrors','Predict','Act early']]],
['haz','Weather and visibility hazards','Poor visibility hides hazards until the last moment.',['Slow down when visibility drops, and use dipped headlights in poor light.','In low sun, use your sun visor, slow down and expect people you cannot see.','At night, drive at a speed that lets you stop in the distance you can see.','Use wipers and demisters to keep a clear view.','Rain and ice mean longer stopping distances.'],['icons',[['🌧️','Rain'],['🌫️','Fog'],['☀️','Low sun glare'],['🌙','Night'],['❄️','Ice']]]],
['vru','Hierarchy of road users','Those who can cause the most harm have the most responsibility.',['The Highway Code introduced a hierarchy of road users in 2022.','Pedestrians are the most vulnerable, then cyclists, horse riders and motorcyclists.','Cars, vans, buses and lorries must take the most care, especially large vehicles.','It does not remove responsibility from vulnerable users. Everyone must take care.','When turning into a side road, give way to pedestrians who are crossing or waiting to cross.'],['icons',[['🚶','Pedestrians'],['🚲','Cyclists'],['🐴','Horse riders'],['🏍️','Motorcyclists'],['🚗','Cars and taxis'],['🚐','Vans and minibuses'],['🚚','Buses and lorries']]]],
['vru','Pedestrians and children','Expect people to step out, especially near schools and shops.',['Slow down near schools, shops and bus stops, where children may run out.','A white stick means a pedestrian is visually impaired. A white stick with a red band means they are both deaf and blind.','A guide dog or hearing dog means the person may not see or hear you, so be patient.','Older and disabled pedestrians may cross slowly. Do not rush them or sound your horn.','Stop for a school crossing patrol showing a STOP sign.'],['icons',[['🚶','People stepping out'],['🦯','White stick'],['🦮','Guide dog'],['🧓','Older people'],['🧒','Children'],['🏫','School patrol']]]],
['vru','Cyclists and motorcyclists','They are small, fast to appear and easy to miss.',['Leave at least 1.5 metres when overtaking cyclists at up to 30 mph, and more at higher speeds. If you cannot, wait.','Cyclists may ride in the middle of the lane to be seen and stay safe, so be patient.','Look twice at junctions. Motorcyclists and cyclists are easy to miss.','Use the Dutch reach: open your car door with the hand furthest from the door to check for cyclists.','Do not cut across cyclists at junctions or when turning.'],TDS.cyc],
['vru','Horse riders, animals and scooters','Give animals and slow users plenty of time and space.',['Pass horses slowly, under 10 mph, and give at least 2 metres. Do not sound your horn or rev your engine.','Watch for animals on country roads, especially at dusk and dawn, and slow down for animal signs.','If a herd is being driven along the road, stop and switch off your engine if needed.','Mobility scooters can travel at up to 8 mph on the road, so pass with care.','Children and pets can dart into the road without warning.'],['icons',[['🐴','Pass horses slowly and wide'],['🐕','Dogs and animals'],['🛴','Mobility scooters, max 8 mph'],['🐑','Livestock on rural roads']]]],
['oth','Motorcycles','Motorcyclists need extra care and space.',['Motorcycles are small and easy to miss, especially at junctions and when filtering between lanes.','Check mirrors and blind spots before changing lanes or turning, and look twice.','A motorcyclist may move around potholes, drains and oil, so give them room.','Leave extra space behind a motorcyclist, especially in wet or icy weather.','Strong winds can blow motorcyclists off line.'],['icons',[['🏍️','Hard to see'],['🔍','Check blind spots'],['👀','Look twice at junctions'],['📏','Leave space']]]],
['oth','Large vehicles and buses','Long vehicles need more room and cannot see everything.',['Large vehicles need more room to turn and may swing out to the right before turning left.','Never squeeze into the gap on the inside of a turning lorry.','If you cannot see the driver in their mirrors, they cannot see you. Keep well back.','Give priority to buses pulling out from a stop if it is safe.','Expect lorries to take a wide line on bends and roundabouts.'],TDS.lorry],
['oth','Trams, tractors and emergency vehicles','Know how to share the road with special vehicles.',['Emergency vehicles: stay calm, check the route they need to take, and pull in safely. Do not break the law to make way.','Never stop on a crossing or in a box junction to let one pass.','Trams cannot swerve and take a long distance to stop. Do not stop or park on tram tracks.','Tractors and farm machinery are slow and may leave mud on the road. Overtake only when it is safe.','Electric vehicles are quiet, so take extra care around pedestrians.'],TDS.amb],
['han','Wet, windy and flooded roads','Adapt your driving to the surface and conditions.',['Aquaplaning is when your tyres lose contact with the road on standing water. Ease off the accelerator and do not brake hard.','Cross floods slowly in a low gear, and test your brakes afterwards.','In strong winds, hold the steering firmly and take extra care near cyclists, motorcyclists and high-sided vehicles.','Wet roads can be very slippery, especially just after rain starts.','Keep your speed down on bends in wet conditions.'],['icons',[['🌧️','Wet: double the gap'],['💨','Wind: grip the wheel'],['🌊','Flood: go slowly'],['🛞','Aquaplaning: ease off']]]],
['han','Skids and braking','Smooth control keeps the car balanced.',['If you start to skid, ease off the accelerator and steer smoothly in the direction the rear of the car is sliding.','With ABS, brake firmly and keep your foot on the pedal. Do not pump the brakes.','On a long downhill, use a lower gear and engine braking so your brakes do not overheat and fade.','Brake early and smoothly so the car stays balanced.'],['flow',['Ease off the accelerator','Steer gently into the skid','Do not brake hard','Straighten up']]],
['han','Driving in the dark','See and be seen at night.',['Use dipped headlights from sunset to sunrise and whenever visibility is poor.','You should be able to stop in the distance you can see.','Dip your headlights for oncoming traffic and when following another vehicle.','If you are dazzled, slow down and stop if you have to. Do not stare at oncoming headlights.','Pedestrians and cyclists are harder to see at night, so slow down in built-up areas.'],['icons',[['🌙','Dipped headlights'],['🔆','Dip for oncoming traffic'],['🦌','Animals on the road'],['👀','Drive within your headlights']]]],
['mw','Joining and leaving','Join smoothly and leave in good time.',['Use the slip road to match your speed to the traffic, check your mirrors and signal.','Join the left-hand lane when there is a safe gap, and do not force others to slow down.','Give way to traffic already on the motorway unless signs or markings say otherwise.','To leave, signal in good time, move into the left-hand lane and slow down on the slip road.','After a long motorway journey, check your speed because it can feel slower than it is.'],TDS.join],
['mw','Lanes and overtaking','Keep left, overtake on the right.',['Keep to the left-hand lane unless you are overtaking, and move back when it is safe.','Overtake on the right. Do not overtake on the left except in slow-moving queues.','Do not cut in. Leave at least a two-second gap, and more in the wet.','Do not stay in the middle or right-hand lane when the left lane is clear.','Learner drivers may use motorways only with an approved driving instructor in a dual-controlled car.'],TDS.dual],
['mw','Breakdowns, smart motorways and signs','Know what to do and what the signals mean.',['The hard shoulder is for emergencies only unless signs say it is a running lane.','A red X above a lane means the lane is closed. Do not use it.','Variable speed limits shown in red circles must be obeyed.','Flashing amber lights warn of a hazard ahead. Flashing red lights mean stop.','On a motorway never use a warning triangle, and do not try to repair your vehicle on the hard shoulder.'],['flow',['Signal left and stop','Hazard lights on','Leave by the left door','Wait behind the barrier','Call for help']]],
['rul','Speed limits','Limits are maximums, not targets.',['A built-up area with street lights has a 30 mph limit unless signs show otherwise.','Cars: 60 mph on single carriageways, and 70 mph on dual carriageways and motorways.','Cars towing a caravan or trailer: 50 mph on single carriageways and 60 mph on dual carriageways and motorways.','Drive more slowly when conditions are poor.','Look for speed limit signs, repeater signs and 20 mph zones near schools.'],['icons',[['🏘️','30 mph in built-up areas'],['🛤️','60 mph on single carriageways'],['🚗','70 mph on dual carriageways and motorways'],['🚐','Towing: 50 single, 60 dual and motorway']]]],
['rul','Junctions and roundabouts','Give way correctly and signal clearly.',['At a roundabout, give way to traffic from your right unless signs or markings say otherwise.','Signal left when exiting, and use the left lane to turn left and the right lane to turn right.','Watch for cyclists and motorcyclists, who may take a wide line.','At give way lines, slow down, look both ways and go only when it is safe.','Do not pull out in front of vehicles you have not seen properly.'],TDS.rbt],
['rul','Pedestrian crossings','Know your crossings and who has priority.',['At a zebra crossing, slow down and stop for anyone who has stepped on to the crossing.','Do not overtake the moving vehicle nearest the crossing, or park on the zigzag lines.','At a pelican crossing, a flashing amber light means give way to pedestrians, and go if it is clear.','Puffin and toucan crossings use sensors and lights. Toucans also let cyclists cross, and pegasus crossings are for horse riders.','Do not wave people across, because other traffic may not stop.'],TDS.zebra],
['rul','Traffic lights and signals','Obey the lights and understand each stage.',['Red means stop. Red and amber together also means stop. Green means go if the way is clear.','Amber means stop unless you are so close to the line that stopping would be unsafe.','Do not move forward on green if your exit is blocked, and never cross a red light.','A flashing red light at a level crossing means stop.','A police officer\'s signals overrule traffic lights.'],['lights']],
['rul','Markings and parking','Read the lines and park where it is allowed.',['Double white lines: do not cross if the line nearest you is solid.','Double yellow lines mean no waiting at any time. Single yellow lines restrict waiting at the times shown on signs.','Yellow box junctions: do not enter unless your exit is clear, except when turning right and waiting for oncoming traffic.','Do not park within 10 metres of a junction, on a bend, near a school entrance or on zigzag lines.','Blue badge bays are for badge holders only.'],['icons',[['⬜','Double white: solid nearest, no overtaking'],['🟨','Yellow lines: waiting restrictions'],['🔲','Box junction: enter only if clear'],['⚠️','Zigzags: no stopping or parking']]]],
['sig','Sign shapes and colours','The shape and colour tell you what kind of sign it is.',['Circular signs give orders. Red rings say what not to do, and blue circles say what you must do.','Triangular signs warn of hazards ahead.','Rectangular signs give information. Blue is for motorways, green for primary routes and white for local roads.','A red octagon is STOP, and an inverted triangle means give way.','Browse every sign in the Sign library tab.'],['icons',[['🔴','Circles: orders'],['🔵','Blue circles: must do'],['🔺','Triangles: warnings'],['🟦','Blue rectangles: information'],['🟩','Green: primary routes'],['⬜','White: other routes']]]],
['sig','Road markings and studs','Lines and studs guide you day and night.',['Cat\'s eyes: red on the left edge, white between lanes, amber on the central reservation side, and green at slip roads and lay-bys.','Long lines with short gaps warn of a hazard ahead.','Hatched markings protect traffic turning right. Do not enter them unless you have to.','Arrows show which way you must go in that lane.','Stop and give way lines show exactly where to stop.'],['icons',[['🔴','Red studs: left edge'],['⚪','White studs: lanes'],['🟠','Amber studs: central reservation'],['🟢','Green studs: slip roads and lay-bys']]]],
['sig','Signals and police directions','Signal clearly and obey the police.',['Use your indicators in good time, and cancel them after the manoeuvre.','If your indicators are not working, use arm signals. Right turn: arm straight out.','Left turn: arm out, moving in a small circle. Slowing down: arm moving up and down.','A police officer\'s signals overrule traffic lights and signs.','Flashing headlights only warn others that you are there. They are not a signal to go.'],['icons',[['👉','Right turn: arm straight out'],['🔄','Left turn: arm out, in a circle'],['🤚','Slowing: arm up and down'],['👮','Police: obey their signals']]]],
['doc','Licences and age rules','Know what you need before you drive.',['You need a valid provisional licence before driving as a learner.','You can drive a car from age 17, or 16 if you get the enhanced rate of the mobility part of PIP.','Learners must show L plates (D plates in Wales) and be supervised by someone aged 21 or over who has held a full licence for at least three years.','A photocard licence must be renewed every 10 years. Tell DVLA if your name, address or health changes.','New drivers who get 6 or more points within two years of passing lose their licence.'],['icons',[['🪪','Photocard licence'],['🎂','Car at 17'],['🔁','Renew every 10 years'],['🅻','L plates and a supervisor'],['🏥','Tell DVLA about medical conditions']]]],
['doc','Insurance, MOT and vehicle tax','Keep your vehicle legal.',['You must have at least third party insurance to drive on a public road.','Cars need an MOT every year from the third anniversary of registration.','Your vehicle must be taxed unless it has been declared off the road with a SORN.','The V5C registration certificate shows the registered keeper. Tell DVLA when you buy or sell a vehicle.','Driving without insurance can mean a fine, penalty points and your vehicle being seized.'],['check',['Insurance (at least third party)','MOT (after 3 years, then yearly)','Vehicle tax (VED)','SORN if kept off the road','V5C registration certificate']]],
['doc','Penalty points','Points add up quickly.',['If you collect 12 or more points within three years you can be disqualified.','Using a hand-held phone while driving means 6 points and a £200 fine.','Speeding usually means at least 3 points and a fine.','New drivers who reach 6 points within two years of passing lose their licence and must re-take both tests.','Drink-driving usually means a driving ban of at least 12 months.'],['bars',[['Speeding (minimum)',3,12,'#f2b705','3 points'],['Hand-held phone',6,12,'#e07a14','6 points'],['New driver: licence revoked at',6,12,'#d6232a','6 points'],['Disqualified at',12,12,'#d6232a','12 points']]]],
['inc','Breakdowns','Get safe first, then get help.',['Get your vehicle off the road if you can, as far from traffic as possible.','Switch on hazard lights. Put a warning triangle about 45 metres behind your vehicle if it is safe, but never on a motorway.','Leave the vehicle by the side away from traffic and keep passengers safe.','If you break down on a level crossing, get everyone out and away, then call the railway.','Do not stand between your vehicle and traffic, and keep animals secure.'],['flow',['Pull over safely','Hazard lights on','Get everyone out','Triangle (not on motorways)','Call for help']]],
['inc','At the scene of a crash','Stay calm and follow the steps.',['Switch off engines and ask people not to smoke. Warn oncoming traffic, for example with hazard lights.','Call 999 or 112 as soon as possible and give your exact location.','Use DR ABC: Danger, Response, Airway, Breathing, Circulation.','Do not move casualties unless they are in danger from fire. Do not remove a motorcyclist\'s helmet unless it is essential.','Apply firm pressure to stop bleeding, and do not give anyone food or drink.'],['flow',['Make it safe','Warn others','Call 999 or 112','First aid','Stay until help comes']]],
['inc','Fire, tunnels and reporting','Know the rules for emergencies and paperwork.',['If your vehicle catches fire, get everyone out and stay away, then call the fire service.','In a tunnel, use dipped headlights and keep your distance. If you break down, switch on hazards and call for help.','If you are involved in a crash, stop and exchange names, addresses and insurance details.','Report the crash to the police within 24 hours if you did not exchange details or if anyone was injured.','Tell your insurer even if you do not plan to claim.'],['icons',[['🔥','Fire: get out and call 999'],['🚇','Tunnels: dipped lights, never stop'],['📞','Report injuries to police'],['📝','Exchange details']]]],
['load','Loads and roof racks','A badly loaded vehicle is harder to control.',['Overloading affects steering, braking and tyre wear. Check the weight limits in your handbook.','Put heavy items as low and as close to the middle of the vehicle as possible.','Secure all loads, and make sure nothing sticks out dangerously or hides your lights or number plate.','Roof racks and boxes affect handling and fuel use. Remove them when you do not need them.','Adjust tyre pressures if your handbook recommends it for a heavy load.'],['icons',[['⚖️','Do not overload'],['🧳','Heavy items low and central'],['🪢','Secure everything'],['🏔️','Roof racks: check the limit']]]],
['load','Towing and trailers','Towing changes how your vehicle behaves.',['Do not exceed the towing weight or nose weight limits in your vehicle handbook.','A trailer needs working lights, a visible number plate and a secure coupling.','If a caravan starts to snake, ease off the accelerator. Do not brake hard or steer sharply.','On motorways with three or more lanes, vehicles towing must not use the right-hand lane.','Allow extra stopping distance and take care when reversing.'],['bars',[['Towing: single carriageway',50,70,'#e07a14','50 mph'],['Towing: dual carriageway',60,70,'#e07a14','60 mph'],['Towing: motorway',60,70,'#e07a14','60 mph'],['Car alone: motorway',70,70,'#1b8a4f','70 mph']]]],
['load','Passengers and pets','Everyone and everything must be secure.',['The driver must make sure children under 14 are properly restrained.','Passengers should not block your view or stand in the vehicle.','Restrain pets so they cannot distract you or be thrown about in an emergency stop.','Never carry loose heavy items in the cabin. They can become dangerous in a crash.','Make sure everyone gets out on the pavement side where possible.'],['icons',[['👨‍👩‍👧','Everyone belted'],['🧒','Child seats'],['🐕','Restrain pets'],['🧳','Luggage secured']]]]
];

/* ---- animation engine for the lesson pictures ---- */
let TV=null,tvRaf=0,TH={g:null,l:null};const READ={};
function stopTV(){cancelAnimationFrame(tvRaf);TV=null}
function startTV(spec){stopTV();const cv=$('#tcv');if(!cv)return;const g=cv.getContext('2d'),RM=document.body.classList.contains('rm');TV={spec};const t0=performance.now();
 const step=now=>{if(!TV)return;try{tdraw(g,spec,RM?4:(now-t0)/1000)}catch(e){console.error(e)}if(!RM)tvRaf=requestAnimationFrame(step)};tvRaf=requestAnimationFrame(step)}
const rrp=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
const txt=(g,s,x,y,sz,c,al,b)=>{g.font=(b?'bold ':'')+(sz||16)+'px Segoe UI, Arial';g.fillStyle=c||'#fff';g.textAlign=al||'center';g.fillText(s,x,y)};
const wrap=(g,s,mw)=>{const w=String(s).split(' '),out=[];let l='';w.forEach(x=>{const t=l?l+' '+x:x;if(l&&g.measureText(t).width>mw){out.push(l);l=x}else l=t});if(l)out.push(l);return out};
const bgp=g=>{g.fillStyle='#10213b';g.fillRect(0,0,720,300)};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function tdraw(g,s,t){const k=s[0];
 if(k==='td')dTD(g,s,t);else if(k==='icons')dIcons(g,s[1],t);else if(k==='flow')dFlow(g,s[1],t);else if(k==='check')dCheck(g,s[1],t);
 else if(k==='bars')dBars(g,s[1],t);else if(k==='clock')dClock(g,s[1],s[2],t);else if(k==='lights')dLights(g,t);else if(k==='stop')dStop(g,t);else if(k==='gap')dGap(g,s[1],t)}
function dIcons(g,items,t){
 bgp(g);const n=items.length,cols=n<=3?n:n===4?4:Math.ceil(n/2),rows=Math.ceil(n/cols),cw=680/cols,ch=Math.min(130,270/rows),all=n*.35+.6,pk=Math.floor(Math.max(0,t-all)/1.1)%n;
 items.forEach((it,i)=>{const r=Math.floor(i/cols),c=i%cols,x=20+c*cw+cw/2,y=24+r*ch+ch/2,s=clamp((t-i*.35)/.5,0,1),e=1+2.70158*Math.pow(s-1,3)+1.70158*Math.pow(s-1,2),hot=t>all&&i===pk;
  g.save();g.translate(x,y);g.scale(e,e);g.globalAlpha=s;g.fillStyle=hot?'rgba(255,122,61,.35)':'rgba(255,255,255,.08)';rrp(g,-cw/2+8,-ch/2+6,cw-16,ch-12,14);g.fill();
  if(hot){g.strokeStyle='#ff7a3d';g.lineWidth=3;g.stroke()}
  g.font=Math.round(ch*.36)+'px Segoe UI Emoji, Apple Color Emoji, sans-serif';g.textAlign='center';g.fillStyle='#fff';g.fillText(it[0],0,-ch*.04);
  wrap(g,it[1],cw-34).slice(0,3).forEach((l,j)=>txt(g,l,0,ch*.22+j*17,14,'#e9eef7','center',hot));g.restore()});
}
function dFlow(g,steps,t){
 bgp(g);const n=steps.length,bw=(680-(n-1)*34)/n,cyc=n*1.3+1.6,tt=t%cyc,act=Math.min(n,Math.floor(tt/1.3));
 steps.forEach((s,i)=>{const x=20+i*(bw+34),on=i===act,done=i<act,by=96-(on?8:0);
  g.fillStyle=on?'#d6232a':done?'#1b8a4f':'rgba(255,255,255,.1)';rrp(g,x,by,bw,116,14);g.fill();
  g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(x+22,by+22,14,0,7);g.fill();txt(g,done?'✓':String(i+1),x+22,by+28,16,'#fff','center',true);
  const ls=wrap(g,s,bw-20).slice(0,4);ls.forEach((l,j)=>txt(g,l,x+bw/2,by+66-(ls.length-1)*9.5+j*19,15,'#fff','center',on));
  if(i<n-1){g.fillStyle=i<act?'#1b8a4f':'rgba(255,255,255,.4)';g.beginPath();g.moveTo(x+bw+8,144);g.lineTo(x+bw+8,164);g.lineTo(x+bw+26,154);g.closePath();g.fill()}});
}
function dCheck(g,items,t){
 bgp(g);const n=items.length,two=n>4,per=two?Math.ceil(n/2):n,cyc=n*.7+2.4,tt=t%cyc;
 items.forEach((s,i)=>{const col=two?Math.floor(i/per):0,r=two?i%per:i,x=40+col*350,y=44+r*(two?58:50),on=tt>i*.7+.4,p=clamp((tt-i*.7-.4)/.35,0,1);
  g.fillStyle='rgba(255,255,255,.08)';rrp(g,x,y-22,320,42,10);g.fill();
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.beginPath();g.arc(x+24,y,13,0,7);g.stroke();
  if(on){g.fillStyle='#1b8a4f';g.beginPath();g.arc(x+24,y,13*p,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(x+18,y);g.lineTo(x+23,y+6);g.lineTo(x+31,y-6);g.stroke()}
  txt(g,s,x+48,y+6,16,'#fff','left',on)});
}
function dBars(g,rows,t){
 bgp(g);const n=rows.length,cyc=n*.5+4.5,tt=t%cyc,rh=Math.min(70,250/n);
 rows.forEach((r,i)=>{const y=34+i*rh+rh/2,p=clamp((tt-i*.5)/1.1,0,1),e=1-Math.pow(1-p,3),w=400*(r[1]/r[2])*e;
  txt(g,r[0],20,y+5,16,'#e9eef7','left');g.fillStyle='rgba(255,255,255,.1)';rrp(g,270,y-14,420,28,8);g.fill();
  g.fillStyle=r[3];rrp(g,270,y-14,Math.max(8,w),28,8);g.fill();if(p>.5){if(w>100)txt(g,r[4],270+w-8,y+5,14,'#111','right',true);else txt(g,r[4],270+Math.max(8,w)+10,y+5,14,'#fff','left',true)}});
}
function dClock(g,main,sub,t){
 bgp(g);const k=clamp((t%6)/4.5,0,1);g.lineWidth=22;g.strokeStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(190,150,90,0,7);g.stroke();
 g.strokeStyle='#ff7a3d';g.lineCap='round';g.beginPath();g.arc(190,150,90,-Math.PI/2,-Math.PI/2+Math.PI*2*k);g.stroke();g.lineCap='butt';
 txt(g,main,190,160,34,'#fff','center',true);wrap(g,sub,300).forEach((l,i)=>txt(g,l,330,130+i*34,24,'#e9eef7','left'));
 txt(g,k>=1?'Time for a break!':'Driving...',330,230,20,k>=1?'#ff7a3d':'#9fb0cc','left',true);
}
function dLights(g,t){
 bgp(g);const tt=t%8,st=tt<2.5?0:tt<3.5?1:tt<6?2:3;g.fillStyle='#1b1b1b';rrp(g,120,20,100,260,16);g.fill();
 [[st<=1,'#ff3b3b',70],[st===1||st===3,'#ffb000',150],[st===2,'#2fd070',230]].forEach(l=>{g.fillStyle=l[0]?l[1]:'rgba(255,255,255,.1)';if(l[0]){g.shadowColor=l[1];g.shadowBlur=26}g.beginPath();g.arc(170,l[2],32,0,7);g.fill();g.shadowBlur=0});
 ['RED: stop and wait behind the line','RED + AMBER: still stop, get ready','GREEN: go if the way is clear','AMBER: stop unless too close to stop safely'].forEach((s,i)=>txt(g,s,270,70+i*56,i===st?20:16,i===st?'#fff':'#7d8ba3','left',i===st));
}
function dStop(g,t){
 bgp(g);const sp=[20,30,40,50,60,70],th=[6,9,12,15,18,21],br=[6,14,24,38,55,75],cl=[3,6,9,13,18,24],cyc=3.6,i=Math.floor(t/cyc)%6,k=1-Math.pow(1-clamp((t%cyc)/1.5,0,1),3),sc=5.6;
 txt(g,sp[i]+' mph',20,50,38,'#fff','left',true);txt(g,(th[i]+br[i])+' metres overall (about '+cl[i]+' car lengths)',20,82,18,'#ff7a3d','left',true);
 g.fillStyle='#3b3f47';g.fillRect(0,150,720,60);g.fillStyle='#d6232a';rrp(g,20,166,44,26,6);g.fill();
 g.fillStyle='#ff9f1a';g.fillRect(70,160,th[i]*sc*k,38);g.fillStyle='#d6232a';g.fillRect(70+th[i]*sc*k,160,br[i]*sc*k,38);
 txt(g,'Thinking '+th[i]+' m',70,150,14,'#ff9f1a','left',true);txt(g,'Braking '+br[i]+' m',70+th[i]*sc+br[i]*sc/2,225,14,'#ff7a7a','center',true);
 sp.forEach((s,j)=>{g.fillStyle=j===i?'#ff7a3d':'rgba(255,255,255,.12)';rrp(g,20+j*112,250,100,34,8);g.fill();txt(g,s+' mph',70+j*112,272,15,'#fff','center',j===i)});
}
function dGap(g,secs,t){
 bgp(g);const v=120,ax=600,bx=ax-v*secs,cyc=(760-(bx-30))/v+1.8,tt=t%cyc,px=760-v*tt;
 g.fillStyle='#3b3f47';g.fillRect(0,120,720,100);g.strokeStyle='#e8e8e8';g.lineWidth=3;g.setLineDash([26,22]);g.lineDashOffset=(tt*v)%48;g.beginPath();g.moveTo(0,170);g.lineTo(720,170);g.stroke();g.setLineDash([]);
 const car=(x,c)=>{g.fillStyle=c;rrp(g,x-26,150,52,40,8);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x+2,154,14,32)};car(ax,'#2f6fd0');car(bx,'#d6232a');
 g.fillStyle='#f2b705';g.fillRect(px-3,70,6,50);g.fillRect(px-14,60,28,16);
 const el=clamp((ax-px)/v,0,secs),on=px<ax;txt(g,(px<=bx?secs:on?el:0).toFixed(1)+' s',20,56,42,'#fff','left',true);
 txt(g,px<=bx?'Gap: '+secs+' seconds':on?'Counting...':'Pick a marker ahead',20,90,18,'#ff7a3d','left',true);
 if(secs){g.strokeStyle='#ff7a3d';g.lineWidth=3;g.beginPath();g.moveTo(bx+26,240);g.lineTo(ax-26,240);g.stroke();txt(g,secs+' second gap',(bx+ax)/2,266,18,'#ff7a3d','center',true)}
}
/* top-down road scenes */
function dRoad(g,type,decor){
 const R='#3b3f47',road=(x,y,w,h)=>{g.fillStyle=R;g.fillRect(x,y,w,h)},dash=(a,b,c,d)=>{g.strokeStyle='#e8e8e8';g.lineWidth=3;g.setLineDash([16,14]);g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();g.setLineDash([])};
 g.fillStyle='#2f6b3c';g.fillRect(0,0,720,300);
 if(decor==='slip'){road(0,16,250,34);g.fillStyle=R;g.beginPath();g.moveTo(250,16);g.lineTo(250,50);g.lineTo(350,50);g.closePath();g.fill()}
 if(type==='two'||type==='zebra'){road(0,95,720,110);dash(0,150,720,150)}
 if(type==='zebra'){g.fillStyle='#f2f2f2';for(let i=0;i<8;i++)g.fillRect(330,98+i*13,60,8)}
 if(type==='cross'){road(0,95,720,110);road(305,0,110,300);dash(0,150,305,150);dash(415,150,720,150);dash(360,0,360,95);dash(360,205,360,300)}
 if(type==='rbt'){road(0,115,720,70);road(325,0,70,300);g.fillStyle=R;g.beginPath();g.arc(360,150,98,0,7);g.fill();g.fillStyle='#2f6b3c';g.beginPath();g.arc(360,150,42,0,7);g.fill();dash(0,150,262,150);dash(458,150,720,150);dash(360,0,360,52);dash(360,248,360,300)}
 if(type==='dual'){road(0,50,720,200);g.fillStyle='#2f6b3c';g.fillRect(0,138,720,24);g.fillStyle='#9aa3b2';g.fillRect(0,148,720,4);dash(0,95,720,95);dash(0,205,720,205)}
}
function dTD(g,s,t){
 const actors=s[2],labels=s[3],tt=t%8;dRoad(g,s[1],s[4]);
 actors.forEach(a=>{const k=a[0],c=a[1],pts=a[2];let i=0;while(i<pts.length-2&&tt>pts[i+1][2])i++;
  const p=pts[i],q=pts[i+1],u=tt<=p[2]?0:tt>=q[2]?1:(tt-p[2])/(q[2]-p[2]),x=p[0]+(q[0]-p[0])*u,y=p[1]+(q[1]-p[1])*u;
  let ang=0;for(let j=i;j>=0;j--)if(Math.hypot(pts[j+1][0]-pts[j][0],pts[j+1][1]-pts[j][1])>1){ang=Math.atan2(pts[j+1][1]-pts[j][1],pts[j+1][0]-pts[j][0]);break}
  if(k==='ped'){g.fillStyle='#f2c200';g.beginPath();g.arc(x,y,11,0,7);g.fill();g.font='20px Segoe UI Emoji, sans-serif';g.textAlign='center';g.fillStyle='#fff';g.fillText('🚶',x,y+7);return}
  const L=k==='bus'?84:k==='van'||k==='amb'?58:k==='bike'?32:44,Wd=k==='bus'?26:k==='van'||k==='amb'?24:k==='bike'?10:22;
  g.save();g.translate(x,y);g.rotate(ang);g.fillStyle=k==='amb'?'#f4f4f0':c;rrp(g,-L/2,-Wd/2,L,Wd,k==='bike'?4:6);g.fill();
  if(k!=='bike'){g.fillStyle='rgba(255,255,255,.55)';g.fillRect(L*.12,-Wd/2+3,L*.2,Wd-6);g.fillStyle='#ffe9a0';g.fillRect(L/2-4,-Wd/2+2,4,5);g.fillRect(L/2-4,Wd/2-7,4,5)}
  if(k==='bike'){g.fillStyle='#222';g.beginPath();g.arc(0,0,6,0,7);g.fill()}
  if(k==='amb'){const f=Math.floor(tt*8)%2;g.shadowColor='#2a6bff';g.shadowBlur=14;g.fillStyle=f?'#2a6bff':'#ff3b3b';g.fillRect(-4,-Wd/2,8,Wd);g.shadowBlur=0}
  g.restore()});
 labels.forEach(l=>{if(tt>=l[3]&&tt<=l[4]){g.font='bold 16px Segoe UI, Arial';const w=g.measureText(l[0]).width+28;g.fillStyle='rgba(0,0,0,.72)';rrp(g,l[1]-w/2,l[2]-18,w,32,16);g.fill();txt(g,l[0],l[1],l[2]+4,16,'#fff','center',true)}});
}
/* ---- views ---- */
function renderTheory(){
 stopTV();const b=$('#thBox');
 if(TH.l!=null){const L=TL[TH.l],G=TG.find(x=>x.id===L[0]);READ[TH.l]=1;
  b.innerHTML='<div class="crumbs"><button class="sec" data-th="home">← All topics</button><button class="sec" data-th="group">← '+G.n+'</button></div><div class="card tlesson"><h2>'+L[1]+'</h2><p class="mut">'+L[2]+'</p><canvas id="tcv" width="720" height="300" role="img" aria-label="Animated illustration: '+L[1]+'"></canvas><div class="row" style="margin:12px 0"><button class="sec" id="tvr">▶ Replay animation</button><button class="sec" data-th="prev">← Previous lesson</button><button data-th="next">Next lesson →</button></div><h3>Key points</h3><ul class="kp">'+L[3].map((p,i)=>'<li style="--i:'+i+'">'+p+'</li>').join('')+'</ul></div>';
  startTV(L[4]);
 }else if(TH.g){const G=TG.find(x=>x.id===TH.g);
  b.innerHTML='<div class="crumbs"><button class="sec" data-th="home">← All topics</button></div><h2>'+G.i+' '+G.n+'</h2><p class="mut">'+G.d+'</p><div class="groups">'+TL.map((l,i)=>[l,i]).filter(x=>x[0][0]===TH.g).map((x,j)=>'<button class="gcard" data-tl="'+x[1]+'" style="--i:'+j+'"><span class="gi">'+G.i+'</span><b>'+x[0][1]+'</b><span class="mut">'+x[0][2]+'</span><span class="go">'+(READ[x[1]]?'✓ Learned. Watch again →':'Start lesson →')+'</span></button>').join('')+'</div>';
 }else{
  b.innerHTML='<h2>Theory topics</h2><p class="mut">The 14 topic areas of the car theory test. Pick a topic, then a lesson. Each one has an animated picture and the key points to remember. For every road sign, use the Sign library tab.</p><div class="groups">'+TG.map((g,i)=>{const ls=TL.map((l,k)=>[l,k]).filter(x=>x[0][0]===g.id),dn=ls.filter(x=>READ[x[1]]).length;return'<button class="gcard" data-tg="'+g.id+'" style="--i:'+i+'"><span class="gi">'+g.i+'</span><b>'+g.n+'</b><span class="mut">'+g.d+'</span><span class="gm">'+ls.length+' lessons · '+dn+' learned</span><span class="go">Open topic →</span></button>'}).join('')+'</div>';
 }
}
$('#thBox').addEventListener('click',e=>{
 const tg=e.target.closest('[data-tg]'),tl=e.target.closest('[data-tl]'),a=e.target.closest('[data-th]');
 if(tg){TH.g=tg.dataset.tg;TH.l=null;renderTheory();window.scrollTo(0,0)}
 else if(tl){TH.l=+tl.dataset.tl;TH.g=TL[TH.l][0];renderTheory();window.scrollTo(0,0)}
 else if(e.target.id==='tvr'&&TH.l!=null)startTV(TL[TH.l][4]);
 else if(a){const v=a.dataset.th;if(v==='home'){TH.g=null;TH.l=null}else if(v==='group')TH.l=null;else{const n=TL.length;TH.l=(TH.l+(v==='next'?1:-1)+n)%n;TH.g=TL[TH.l][0]}renderTheory();window.scrollTo(0,0)}
});
let Q={mode:'theory'};
function quiz(mode){
 Q.mode=mode;const cat=$('#sigCat').value,pool=SGL.filter(s=>cat==='All'||s.c===cat);
 $$('[data-mode]').forEach(b=>b.setAttribute('aria-selected',b.dataset.mode===mode));
 $('#sigBar').classList.toggle('hidden',mode!=='lib');$('#thBox').classList.toggle('hidden',mode!=='theory');$('#quiz').classList.toggle('hidden',mode!=='lib');$('#ptBox').classList.toggle('hidden',mode!=='prac');
 if(mode==='theory'){renderTheory();return}
 stopTV();if(mode==='prac'){renderPT();return}
 $('#quiz').innerHTML='<div class="lib">'+pool.map((s,i)=>'<div class="sg flip" style="--i:'+(i%24)+'" tabindex="0"><div class="fi"><div class="ff">'+svgOf(s,'sign sm')+'<b>'+s.n+'</b><span class="mut">Hover to flip</span></div><div class="fb"><b>'+s.n+'</b><span>'+s.d+'</span></div></div></div>').join('')+'</div>';
}

/* ---------- exam-style question sessions: Practice Theory (by topic) and mixed Practice ---------- */
const PQ=[
['alert','Which of these is most likely to distract you while you are driving?',['Setting your sat nav while moving','Checking your mirrors','Looking well ahead','Keeping both hands on the wheel'],0,'Set up sat navs before you set off. Do not adjust them while moving.'],
['alert','What is the penalty for using a hand-held phone while driving?',['A warning only','3 penalty points','6 penalty points and a £200 fine','No penalty if you are at traffic lights'],2,'Using a hand-held phone is illegal, including at traffic lights, and can mean 6 points and a £200 fine.'],
['alert','How often should you take a break on a long journey?',['Every 30 minutes','At least every two hours','Every five hours','Only when you run low on fuel'],1,'Take a break of at least 15 minutes every two hours to avoid fatigue.'],
['att','Another driver is tailgating you. What should you do?',['Brake sharply to scare them','Speed up to get away','Slow down gently and let them pass when it is safe','Flash your hazard lights'],2,'Do not react aggressively. Ease off, let them go by when it is safe, and keep your own safe gap.'],
['att','A driver flashes their headlights at you at a junction. What does it mean?',['They are giving you priority, so go','They are letting you know they are there','They want you to hurry','They are warning of a speed camera'],1,'Flashing headlights only means "I am here". Never assume it is an invitation to go.'],
['att','When may you use your horn in a built-up area between 11:30 pm and 7 am?',['To say hello to a friend','When another road user poses a danger','When waiting at traffic lights','To hurry other traffic'],1,'Do not use your horn in a built-up area at night unless another moving vehicle poses a danger.'],
['att','An aggressive driver is following you and you feel threatened. What should you do?',['Stop and confront them','Drive to a place of safety such as a police station','Race away','Brake suddenly'],1,'Do not retaliate. Drive to a safe, busy place such as a police station, and keep your doors locked.'],
['att','Which of these shows consideration for other road users?',['Parking across a driveway','Letting a bus pull out when it is safe','Using a bus lane to save time','Cutting in front of a cyclist'],1,'Giving way to buses when it is safe helps everyone.'],
['att','Why should you stay calm when another driver makes a mistake?',['Anger can lead you to drive dangerously','It saves fuel','It lets you drive faster','It helps you park'],0,'Anger and retaliation increase risk for everybody.'],
['saf','What does POWDERY remind you to check?',['Vehicle and driver checks such as petrol, oil, water and tyres','Passenger seat belts only','Road signs on your route','Parking restrictions'],0,'POWDERY: Petrol, Oil, Water, Damage, Electrics, Rubber and Yourself.'],
['saf','When should you check your tyre pressures?',['When the tyres are hot','Regularly, when the tyres are cold','Only at the MOT','Only after long journeys'],1,'Check pressures regularly when tyres are cold, including the spare.'],
['saf','Who is responsible for making sure passengers under 14 wear a seat belt?',['The passengers','The driver','The front seat passenger','Nobody'],1,'The driver is legally responsible for passengers under 14.'],
['saf','Until what age or height must a child use a child car seat?',['5 years old','12 years old or 135 cm tall, whichever comes first','14 years old','Only if under 1 metre tall'],1,'Children must use a car seat until they are 12 or 135 cm tall, whichever comes first.'],
['saf','Your ABS warning light stays on. What does this mean?',['The brakes have failed completely','The ABS may not be working, but your normal brakes should still work','The handbrake is on','A tyre is flat'],1,'Normal braking should still work, but get the ABS checked.'],
['mar','If you double your speed, what happens to your braking distance?',['It stays the same','It doubles','It becomes about four times longer','It halves'],2,'Braking distance becomes about four times longer when your speed doubles.'],
['mar','What is the typical overall stopping distance at 70 mph?',['53 metres','75 metres','96 metres','120 metres'],2,'At 70 mph the typical overall stopping distance is 96 metres, about 24 car lengths.'],
['haz','What is a developing hazard?',['A hazard that is getting more dangerous','A road sign ahead','A stationary parked car','A clear empty road'],0,'A developing hazard is something that may make you change speed or direction.'],
['haz','A ball rolls into the road ahead. What should you expect?',['Nothing, it is just a ball','A child may run out after it','A bus to stop','A cyclist to overtake you'],1,'A ball in the road often means a child is about to follow it.'],
['haz','Why should you be cautious when passing a parked van?',['It may be on fire','It may hide a pedestrian who steps out','It will definitely move off','It blocks your road signs'],1,'Large parked vehicles hide pedestrians. Slow down and watch for people stepping out.'],
['haz','A car is waiting to emerge from a side road ahead. What should you do?',['Speed up to pass it','Be ready to slow down or stop','Ignore it','Sound your horn only'],1,'Watch the driver and be ready to slow down. They may not have seen you.'],
['haz','You are driving into low winter sun. What should you do?',['Drive faster to get through','Slow down and use your sun visor','Switch off your headlights','Close your eyes briefly'],1,'Slow down, use the visor and expect people you cannot see.'],
['haz','What is the best way to scan the road?',['Look only at the car in front','Look well ahead, to the sides and in your mirrors','Look only in your mirrors','Look mainly at the dashboard'],1,'Scan far ahead and to the sides, and check your mirrors regularly.'],
['vru','Which road users are the most vulnerable?',['Pedestrians','Lorry drivers','Car drivers','Bus drivers'],0,'Pedestrians are at the top of the hierarchy of vulnerable road users, followed by cyclists, horse riders and motorcyclists.'],
['vru','How much space should you leave when overtaking a cyclist at up to 30 mph?',['0.5 metres','1 metre','At least 1.5 metres','3 metres'],2,'Leave at least 1.5 metres, and more at higher speeds.'],
['vru','You are turning into a side road and pedestrians are crossing it. What should you do?',['Sound your horn and go','Give way to them','Speed up to turn first','Flash your headlights'],1,'You must give way to pedestrians crossing or waiting to cross the road you are turning into.'],
['vru','A pedestrian carries a white stick with a red band. What does this mean?',['They are both deaf and blind','They are a child','They are a runner','They are lost'],0,'A white stick with a red band means the person is deaf and blind.'],
['vru','How should you pass a horse and rider?',['Quickly, sounding your horn','Slowly and with plenty of room','As close as possible','Revving your engine'],1,'Pass slowly, give at least 2 metres, and do not sound your horn or rev your engine.'],
['vru','What is the Dutch reach?',['A parking method','Opening your car door with the hand furthest from the door','A cyclist hand signal','A way of overtaking'],1,'The Dutch reach makes you turn and check for cyclists before you open the door.'],
['oth','Why should you take extra care around motorcyclists at junctions?',['They are small and easy to miss','They always speed','They never signal','They cannot stop'],0,'Motorcycles are small and easy to miss, so look twice.'],
['oth','A large vehicle ahead is turning left. What should you not do?',['Stay back','Squeeze up the inside','Watch its indicators','Slow down'],1,'Large vehicles swing out before turning. Never squeeze up the inside.'],
['oth','A tram is approaching a crossing. What should you do?',['Cross quickly','Stop and let it pass, as it cannot swerve','Race it','Sound your horn at it'],1,'Trams cannot swerve and take a long time to stop.'],
['oth','Why should you take extra care around electric vehicles?',['They are very quiet, so pedestrians may not hear them','They are always fast','They cannot brake','They have no lights'],0,'Electric vehicles are quiet, so pedestrians may step out without hearing them.'],
['oth','A tractor ahead is moving slowly. What should you do?',['Overtake immediately','Be patient and overtake only when it is safe','Sound your horn repeatedly','Tailgate it'],1,'Be patient and overtake only when you can see it is safe.'],
['han','What is aquaplaning?',['Tyres losing contact with the road on standing water','Driving too fast on ice','Brake failure','A skid on gravel'],0,'Aquaplaning happens when a layer of water lifts the tyres off the road.'],
['han','Your vehicle starts to skid. What should you do?',['Brake hard immediately','Ease off the accelerator and steer smoothly into the skid','Accelerate','Swerve the other way'],1,'Ease off and steer gently in the direction the rear is sliding.'],
['han','You have driven through a flood. What should you do afterwards?',['Test your brakes','Speed up','Switch off your lights','Nothing'],0,'Wet brakes may be less effective. Test them gently.'],
['mw','What does a red X above a lane on a smart motorway mean?',['The lane is open','Do not use that lane because it is closed','A speed camera is ahead','Slow down only'],1,'A red X means the lane is closed and you must not use it.'],
['mw','Which road users are not allowed on a motorway?',['Cars','Cyclists and pedestrians','Vans','Lorries'],1,'Pedestrians, cyclists, horse riders and some slow vehicles are banned from motorways.'],
['rul','What is the speed limit for a car towing a trailer on a single carriageway?',['40 mph','50 mph','60 mph','70 mph'],1,'Cars towing trailers are limited to 50 mph on single carriageways.'],
['rul','What does a flashing red light at a level crossing mean?',['Stop','Go slowly','Cross with care','Give way'],0,'You must stop when the red lights flash at a level crossing.'],
['sig','What shape are warning signs?',['Circular','Triangular','Octagonal','Square'],1,'Warning signs are triangular.'],
['sig','What do blue circular signs give?',['Warnings','Mandatory instructions','Directions to motorways','Tourist information'],1,'Blue circles give positive instructions that you must follow.'],
['sig','What colour are direction signs on primary routes?',['Blue','Green','White','Brown'],1,'Primary routes have green signs. Motorways have blue and local roads have white.'],
['sig','What colour road studs mark the left edge of the carriageway?',['White','Red','Amber','Green'],1,'Red studs mark the left edge, white between lanes, amber on the central reservation side and green at slip roads.'],
['sig','What does a long line with short gaps in the centre of the road warn of?',['A hazard ahead','A bus lane','A parking area','A speed camera'],0,'Long lines with short gaps are hazard warning lines.'],
['sig','How do you signal a right turn with your arm?',['Arm straight out','Arm moving up and down','Arm moving in a circle','Arm held straight up'],0,'For a right turn, hold your arm straight out.'],
['sig','What does a red ring around a sign usually mean?',['It gives an order, usually something you must not do','It is for information only','It is a warning','It is a route to a motorway'],0,'Red rings on circular signs are prohibitions or restrictions.'],
['doc','What is the minimum insurance you must have to drive on a public road?',['None','Third party','Fully comprehensive only','Breakdown cover'],1,'You must have at least third party insurance.'],
['doc','What does SORN mean?',['Statutory Off Road Notification','Safe On Road Number','Street Owner Registration Note','Speed Of Road Notice'],0,'A SORN declares that a vehicle is kept off the road, so it does not need tax or insurance.'],
['doc','How long is a photocard driving licence valid before it must be renewed?',['5 years','10 years','15 years','20 years'],1,'A photocard licence must be renewed every 10 years.'],
['doc','When should you tell DVLA about a medical condition that affects your driving?',['Never','As soon as it affects your driving','Only when you renew','Only after an accident'],1,'Tell DVLA as soon as a condition may affect your ability to drive safely.'],
['inc','You break down on a motorway. Where should you wait?',['In the vehicle on the hard shoulder','Behind the barrier, away from traffic','On the carriageway','Beside your car on the road'],1,'Leave by the left-hand door and wait behind the barrier, well away from traffic.'],
['inc','What does DR ABC stand for in first aid?',['Danger, Response, Airway, Breathing, Circulation','Drive, Reverse, Accelerate, Brake, Clutch','Dial, Repair, Assess, Bandage, Call','Danger, Run, Alert, Breathe, Call'],0,'DR ABC: Danger, Response, Airway, Breathing, Circulation.'],
['inc','When should you call 999 or 112?',['Only for fires','When there is an emergency such as injured people','Never at night','Only after exchanging details'],1,'Call as soon as possible when there are injuries or danger.'],
['inc','How far behind a broken-down vehicle should you place a warning triangle on an ordinary road, if it is safe?',['10 metres','About 45 metres','100 metres','200 metres'],1,'Place it about 45 metres behind your vehicle, but never on a motorway.'],
['inc','You are in a crash with injuries and do not exchange details. When must you report it to the police?',['Within 24 hours','Within a week','Within a month','You do not have to'],0,'Report it to the police as soon as possible and within 24 hours.'],
['inc','Your vehicle catches fire. What should you do?',['Fight the fire yourself','Get everyone out and away, then call the fire service','Drive faster','Open the bonnet'],1,'Get everyone out and keep clear, then call 999.'],
['load','Where should heavy items be placed in a vehicle?',['High and at the back','As low and as close to the middle as possible','On the roof','It does not matter'],1,'Heavy items should be low and central for stability.'],
['load','What can overloading a vehicle affect?',['Only your fuel use','Steering and braking','Only the radio','Nothing'],1,'Overloading affects steering, braking and tyre wear.'],
['load','A caravan starts to snake. What should you do?',['Brake hard','Ease off the accelerator','Steer sharply','Accelerate'],1,'Ease off the accelerator and do not brake hard or steer sharply.'],
['load','Which lane must a vehicle towing a trailer not use on a motorway with three or more lanes?',['The left lane','The right-hand lane','The middle lane','There is no restriction'],1,'Vehicles towing must not use the right-hand lane.'],
['load','How should pets be carried in a car?',['Loose on the back seat','Suitably restrained','Unrestrained on the front seat','Loose in the footwell'],1,'Pets must be restrained so they cannot distract you or be thrown about.'],
['load','What should you check before towing a trailer?',['Lights, coupling and tyre pressures','Nothing','That the mirrors are removed','That the headlights are off'],0,'Check the lights, coupling, number plate and tyres before towing.']];
const TAGS=['mar','saf','mar','han','rul','alert','rul','mw','mw','mw','rul','oth','doc','han','rul','han','alert','doc','rul','rul','rul','mar','mar','rul','rul','mw','alert'],CASETAGS=['mw','mar','han','sig','alert'];
const norm=(x,g)=>({g,q:x.q,o:x.o,a:Array.isArray(x.a)?x.a:[x.a],why:x.why});
const qsh=x=>{const idx=sh(x.o.map((_,i)=>i));return{g:x.g,t:x.t,svg:x.svg,q:x.q,o:idx.map(i=>x.o[i]),a:x.a.map(a=>idx.indexOf(a)),why:x.why}};
function topicBank(g){return EXAMQ.map((x,i)=>norm(x,TAGS[i])).concat(CASE.qs.map((x,i)=>norm(x,CASETAGS[i]))).concat(PQ.map(p=>norm({q:p[1],o:p[2],a:p[3],why:p[4]},p[0]))).filter(x=>x.g===g)}
function sgQ(s){const ds=[...new Set(SGL.map(x=>x.d))].filter(d=>d!==s.d),o=sh([s.d].concat(sh(ds).slice(0,3)));return{t:'s',g:'sig',svg:svgOf(s,'sign'),q:'What does this sign mean and what should you do?',o,a:[o.indexOf(s.d)],why:s.n+': '+s.d}}
let QS=null,BEST={},MX=null;
function qsStart(o){QS=Object.assign({i:0,ans:[]},o);qsRender()}
function qsRender(){
 const q=QS.items[QS.i],sel=QS.ans[QS.i]||[],n=QS.items.length,last=QS.i===n-1;
 $(QS.host).innerHTML='<div class="exh"><b>'+QS.title+'</b><span>'+(QS.nobar?'Question':'Question '+(QS.i+1)+' of '+n)+'</span></div>'+(QS.nobar?'':'<div class="qbar"><i id="qfill" style="width:'+(QS.i/n*100)+'%"></i></div>')+'<div class="exq qslide">'+(q.svg||'')+'<h2>'+q.q+'</h2>'+(q.a.length>1?'<p class="mut">Mark two answers.</p>':'')+'<div class="opts">'+q.o.map((t,i)=>'<button data-qo="'+i+'" class="'+(sel.includes(i)?'sel':'')+'">'+t+'</button>').join('')+'</div></div><div class="exf"><button class="sec" id="qprev"'+(QS.i&&QS.prev?'':' hidden')+'>Previous</button><button id="qnext">'+(last?(QS.finish||'Finish'):'Next')+'</button></div>';
 if(!QS.nobar)setTimeout(()=>{const f=$('#qfill');if(f)f.style.width=((QS.i+1)/n*100)+'%'},30);
}
document.addEventListener('click',e=>{
 if(!QS)return;const host=$(QS.host);if(!host||!host.contains(e.target))return;
 const o=e.target.closest('[data-qo]');
 if(o){const q=QS.items[QS.i],i=+o.dataset.qo;let s=QS.ans[QS.i]||[];if(q.a.length>1){s=s.includes(i)?s.filter(x=>x!==i):s.concat(i).slice(-2)}else s=[i];QS.ans[QS.i]=s;$$(QS.host+' [data-qo]').forEach((b,k)=>b.classList.toggle('sel',s.includes(k)));return}
 if(e.target.id==='qprev'){QS.i--;qsRender()}
 else if(e.target.id==='qnext'){if(QS.i<QS.items.length-1){QS.i++;qsRender()}else QS.onDone(QS)}
});
function qsReview(items,ans){
 return items.map((q,i)=>{const a=ans[i]||[],ok=same(q,a);return'<div class="rv2 '+(ok?'ok':'bad')+'" style="--i:'+Math.min(i,14)+'"><div class="rvh"><span class="mk2">'+(ok?'✓':'✗')+'</span><b>Q'+(i+1)+'. '+q.q+'</b></div><p>Your answer: '+(a.length?a.map(k=>q.o[k]).join(' / '):'Not answered')+'</p>'+(ok?'':'<p>Correct answer: <b>'+q.a.map(k=>q.o[k]).join(' / ')+'</b></p>')+'<p class="mut">'+q.why+'</p></div>'}).join('');
}
/* Practice Theory: topics -> exam-style session -> review of right and wrong answers */
function renderPT(){
 QS=null;
 $('#ptBox').innerHTML='<h2>Practice Theory</h2><p class="mut">Choose a topic for exam-style questions. When you finish, you will see which answers were right and which were wrong, with the correct answers explained.</p><div class="groups">'+TG.map((g,i)=>{const n=topicBank(g.id).length,b=BEST[g.id];return'<button class="gcard" data-pt="'+g.id+'" style="--i:'+i+'"><span class="gi">'+g.i+'</span><b>'+g.n+'</b><span class="mut">'+g.d+'</span><span class="gm">'+n+' questions · '+(b!=null?'Best '+b+'/'+n:'Not tried yet')+'</span>'+(b!=null?'<span class="pm"><i style="width:'+Math.round(b/n*100)+'%"></i></span>':'')+'<span class="go">Start practice →</span></button>'}).join('')+'</div>';
}
function startTopic(g){const G=TG.find(x=>x.id===g);qsStart({host:'#ptBox',title:G.n,g,items:sh(topicBank(g)).map(qsh),prev:true,finish:'Finish and see results',onDone:ptResult});window.scrollTo(0,0)}
function ptResult(qs){
 const n=qs.items.length,sc=qs.items.filter((q,i)=>same(q,qs.ans[i])).length,pct=Math.round(sc/n*100);
 S.tq.push({g:qs.g,sc,n});BEST[qs.g]=Math.max(BEST[qs.g]||0,sc);if(sc===n){award('quiz');confetti(innerWidth/2,innerHeight/3)}
 $(qs.host).innerHTML='<div class="exh"><b>'+qs.title+': results</b></div><div class="exq"><div class="big"><span id="qsScore">0</span><small> / '+n+'</small></div><div class="qm"><i data-w="'+pct+'"></i></div><p><b>'+pct+'%</b> '+(sc===n?'Perfect. You know this topic well.':pct>=86?'Excellent. That is above the real pass mark of 86%.':pct>=60?'Good progress. Review the answers you missed below.':'Keep learning this topic in Theory Learning, then try again.')+'</p><div class="row"><button id="qretry">Try again</button><button class="sec" id="qwrong">Show only wrong answers</button><button class="sec" id="qtopics">Back to topics</button></div><div id="qrev" class="qrev">'+qsReview(qs.items,qs.ans)+'</div></div>';
 countUp($('#qsScore'),sc,900);setTimeout(()=>{const m=$(qs.host+' .qm i');if(m)m.style.width=m.dataset.w+'%'},60);
 $('#sr').textContent='Quiz finished. You scored '+sc+' out of '+n+'.';
}
$('#ptBox').addEventListener('click',e=>{
 const pt=e.target.closest('[data-pt]');
 if(pt)startTopic(pt.dataset.pt);
 else if(e.target.id==='qretry'&&QS)startTopic(QS.g);
 else if(e.target.id==='qtopics')renderPT();
 else if(e.target.id==='qwrong'){const r=$('#qrev');r.classList.toggle('onlywrong');e.target.textContent=r.classList.contains('onlywrong')?'Show all answers':'Show only wrong answers'}
});
/* Practice: a random mix of theory questions, sign questions and hazard clips */
function mixSteps(){const s=$('#steps');s.classList.remove('hidden');s.innerHTML='<span>Practice · '+Math.min(MX.i+1,MX.items.length)+' of '+MX.items.length+'</span>'+MX.items.map((it,i)=>'<i class="'+(i<MX.i?'done':i===MX.i?'cur':'')+'"></i>').join('')}
function startMixed(){
 const pat=['q','q','c','s','q','c','s','q','c','q','s','c'],qs=sh(EXAMQ).slice(0,5).map(x=>Object.assign(qsh(norm(x,'x')),{t:'q'})),ss=sh(SGL).slice(0,3).map(sgQ),
  sing=sh(CLIPS.filter(c=>WIN(c).length===1)).slice(0,3),cs=sing.concat(sh(CLIPS.filter(c=>!sing.includes(c))).slice(0,1));
 let a=0,b=0,c=0;MX={items:pat.map(p=>p==='q'?qs[a++]:p==='s'?ss[b++]:{t:'c',clip:cs[c++]}),i:0,qa:[],hr:[]};
 runMix();
}
function runMix(){
 if(MX.i>=MX.items.length)return mixResults();
 const it=MX.items[MX.i];
 if(it.t==='c'){M={i:0,res:[],mx:[],on:true,grp:null,exam:false,lesson:false,mixed:true,lbl:'Practice clip',list:[it.clip],after:()=>{MX.hr.push({c:it.clip,s:M.res[0],mx:M.mx[0]});MX.i++;runMix()}};startClip()}
 else{mixSteps();show('qs');qsStart({host:'#qsBox',title:it.t==='s'?'Practice: road sign':'Practice: theory question',items:[it],prev:false,nobar:true,finish:'Next',onDone:q=>{MX.qa.push({it,ans:q.ans[0]||[]});MX.i++;runMix()}})}
}
function mixResults(){
 const qa=MX.qa,th=qa.filter(x=>x.it.t==='q'),sg=qa.filter(x=>x.it.t==='s'),ok=l=>l.filter(x=>same(x.it,x.ans)).length,hs=MX.hr.reduce((a,b)=>a+b.s,0),hm=MX.hr.reduce((a,b)=>a+b.mx,0);
 S.tq.push({g:'mix',sc:ok(qa),n:qa.length});$('#steps').classList.add('hidden');
 $('#mixBox').innerHTML='<div class="exh"><b>Practice results</b></div><div class="exq"><div class="tut"><div class="card"><span class="gi">📘</span><b>Theory questions</b><p><span class="mn">'+ok(th)+'</span> / '+th.length+'</p></div><div class="card"><span class="gi">🛑</span><b>Road signs</b><p><span class="mn">'+ok(sg)+'</span> / '+sg.length+'</p></div><div class="card"><span class="gi">🎬</span><b>Hazard clips</b><p><span class="mn">'+hs+'</span> / '+hm+'</p></div></div><h3>Hazard clips</h3>'+MX.hr.map((h,i)=>'<div class="rr"><span>'+h.c.title+'</span><div class="meter"><i data-w="'+Math.round(h.s/h.mx*100)+'"></i></div><b>'+h.s+'/'+h.mx+'</b></div>').join('')+'<h3>Questions</h3><div class="row"><button class="sec" id="qwrong">Show only wrong answers</button></div><div id="qrev" class="qrev">'+qsReview(qa.map(x=>x.it),qa.map(x=>x.ans))+'</div><div class="row" style="margin-top:16px"><button id="mixagain">Practise again</button><button class="sec" id="mixhaz">Hazards</button><button class="sec" id="mixth">Theory and Signs</button></div></div>';
 show('mix');$$('#mixBox .mn').forEach(e=>countUp(e,+e.textContent,900));$$('#mixBox .meter i').forEach((e,i)=>setTimeout(()=>e.style.width=e.dataset.w+'%',300+i*350));
 if(ok(qa)===qa.length&&hs===hm)confetti(innerWidth/2,innerHeight/3);
 $('#sr').textContent='Practice finished. Theory '+ok(th)+' of '+th.length+', signs '+ok(sg)+' of '+sg.length+', hazard clips '+hs+' of '+hm+'.';
}
$('#mixBox').addEventListener('click',e=>{
 if(e.target.id==='mixagain')startMixed();else if(e.target.id==='mixhaz')show('hazards');else if(e.target.id==='mixth')show('theory');
 else if(e.target.id==='qwrong'){const r=$('#qrev');r.classList.toggle('onlywrong');e.target.textContent=r.classList.contains('onlywrong')?'Show all answers':'Show only wrong answers'}
});

/* ---------- wiring ---------- */
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>b.dataset.go==='practice'?startMixed():show(b.dataset.go)));
$$('[data-start]').forEach(b=>b.addEventListener('click',()=>startMixed()));
$('#again').addEventListener('click',()=>{if(M.exam)show('exam');else start(M.grp)});
$('#groups').addEventListener('click',e=>{const b=e.target.closest('[data-grp]');if(b)start(b.dataset.grp)});
$$('[data-mode]').forEach(b=>b.addEventListener('click',()=>quiz(b.dataset.mode)));
$('#next').addEventListener('click',()=>{M.i++;M.i>=M.list.length?(M.after?M.after():results()):startClip()});
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
