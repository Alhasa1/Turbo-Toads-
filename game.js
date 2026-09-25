const c=document.getElementById('game'),x=c.getContext('2d'),hud=document.getElementById('hud');
const W=c.width,H=c.height,keys={};
let player,enemies,coins,parts,cam,won,gameOver;

addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

const platforms=[
 [0,500,960,40],[120,420,150,18],[340,350,150,18],[560,420,150,18],[770,330,140,18],
 [980,470,170,18],[1200,390,160,18],[1430,310,160,18],[1660,410,170,18],
 [1900,350,160,18],[2140,450,220,18],[2440,360,180,18],[2700,290,180,18],
 [2980,410,180,18],[3260,330,200,18],[3540,450,220,18]
];
const portal={x:3650,y:390,w:44,h:70};

function reset(){
 player={x:70,y:430,w:28,h:40,vx:0,vy:0,on:false,inv:0};
 enemies=[
  {x:400,y:315,w:30,h:35,vx:1.2,min:350,max:490},
  {x:1010,y:435,w:30,h:35,vx:1.5,min:980,max:1120},
  {x:1460,y:265,w:30,h:35,vx:1.1,min:1430,max:1590},
  {x:2170,y:410,w:30,h:35,vx:1.5,min:2140,max:2360},
  {x:3020,y:375,w:30,h:35,vx:1.4,min:2980,max:3160},
  {x:3320,y:295,w:30,h:35,vx:1.3,min:3260,max:3460}
 ];
 coins=[
  ...[[170,385],[390,315],[610,385],[820,295],[1030,435],[1250,355],[1480,275],[1710,375],[1950,315],[2200,415],[2480,325],[2740,255],[3030,375],[3330,295],[3610,390]].map(a=>({x:a[0],y:a[1],got:false}))
 ];
 parts=[];cam=0;won=false;gameOver=false;player.lives=3;
}
function restart(){reset()}
function rect(a,b){return a.x<a2(b).x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function a2(v){return v}

function spawn(x,y,n=8){
 for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*5,vy:-Math.random()*5-1,life:35+Math.random()*20});
}
function update(){
 if(won||gameOver)return;
 const left=keys['a']||keys['arrowleft'],right=keys['d']||keys['arrowright'];
 if(left)player.vx-=.55;if(right)player.vx+=.55;
 if(!left&&!right)player.vx*=.82;
 player.vx=Math.max(-6,Math.min(6,player.vx));
 if((keys['w']||keys['arrowup']||keys[' '])&&player.on){player.vy=-12;player.on=false}
 player.vy+=.55;player.vy=Math.min(14,player.vy);
 player.x+=player.vx;
 let oldY=player.y;player.y+=player.vy;player.on=false;
 for(const p of platforms){
   if(player.x+player.w>p[0]&&player.x<p[0]+p[2]&&oldY+player.h<=p[1]&&player.y+player.h>=p[1]&&player.vy>=0){
     player.y=p[1]-player.h;player.vy=0;player.on=true;
   }
 }
 if(player.x<0)player.x=0;
 for(const e of enemies){
   e.x+=e.vx;if(e.x<e.min||e.x+e.w>e.max)e.vx*=-1;
   if(player.inv<=0&&rect(player,e)){
     if(player.vy>1&&player.y+player.h-e.y<18){e.dead=true;player.vy=-8;spawn(e.x,e.y,12)}
     else hurt();
   }
 }
 enemies=enemies.filter(e=>!e.dead);
 for(const q of coins)if(!q.got&&Math.hypot(player.x+14-q.x,player.y+20-q.y)<30){q.got=true;player.score=(player.score||0)+1;spawn(q.x,q.y,5)}
 if(player.inv>0)player.inv--;
 if(player.y>H+100)hurt(true);
 if(player.x+player.w>portal.x&&player.x<portal.x+portal.w&&player.y+player.h>portal.y&&player.y<portal.y+portal.h){won=true;spawn(portal.x,portal.y,40)}
 cam+=(player.x-330-cam)*.08;cam=Math.max(0,Math.min(2780,cam));
 for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.15;q.life--}parts=parts.filter(q=>q.life>0);
 hud.textContent=`Coins: ${coins.filter(q=>q.got).length}/${coins.length} | Lives: ${player.lives}`;
}
function hurt(fall=false){
 player.lives--; if(player.lives<=0){gameOver=true;return}
 player.x=70;player.y=430;player.vx=0;player.vy=0;player.inv=90;
}
function draw(){
 x.clearRect(0,0,W,H);
 let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#38bdf8');g.addColorStop(1,'#dbeafe');x.fillStyle=g;x.fillRect(0,0,W,H);
 // clouds
 x.fillStyle='rgba(255,255,255,.65)';for(let i=0;i<7;i++){let cx=((i*230-cam*.2)%1100)-80,cy=70+(i%3)*55;x.beginPath();x.arc(cx,cy,28,0,7);x.arc(cx+32,cy-12,38,0,7);x.arc(cx+70,cy,25,0,7);x.fill()}
 x.save();x.translate(-cam,0);
 // background hills
 x.fillStyle='#86efac';for(let i=0;i<8;i++){x.beginPath();x.arc(i*520,500,180,Math.PI,2*Math.PI);x.fill()}
 // platforms
 for(const p of platforms){x.fillStyle='#334155';x.fillRect(...p);x.fillStyle='#22c55e';x.fillRect(p[0],p[1],p[2],6)}
 // coins
 for(const q of coins)if(!q.got){x.fillStyle='#facc15';x.beginPath();x.arc(q.x,q.y,9,0,7);x.fill();x.fillStyle='#fff7';x.fillRect(q.x-2,q.y-7,3,14)}
 // portal
 x.shadowBlur=20;x.shadowColor='#a855f7';x.fillStyle='#a855f7';x.fillRect(portal.x,portal.y,portal.w,portal.h);x.shadowBlur=0;x.fillStyle='#fff';x.fillRect(portal.x+8,portal.y+8,portal.w-16,portal.h-16);
 // enemies
 for(const e of enemies){x.fillStyle='#ef4444';x.fillRect(e.x,e.y,e.w,e.h);x.fillStyle='#111827';x.fillRect(e.x+6,e.y+8,5,5);x.fillRect(e.x+19,e.y+8,5,5);x.fillStyle='#fbbf24';x.fillRect(e.x+5,e.y+27,20,4)}
 // player
 if(player.inv%8<4){x.fillStyle='#111827';x.fillRect(player.x+5,player.y+5,18,8);x.fillStyle='#f59e0b';x.fillRect(player.x+3,player.y+12,22,21);x.fillStyle='#fde68a';x.fillRect(player.x+8,player.y+17,12,9);x.fillStyle='#111827';x.fillRect(player.x+8,player.y+20,3,3);x.fillRect(player.x+17,player.y+20,3,3);x.fillStyle='#2563eb';x.fillRect(player.x+3,player.y+31,9,9);x.fillRect(player.x+17,player.y+31,9,9)}
 for(const q of parts){x.globalAlpha=q.life/55;x.fillStyle='#facc15';x.fillRect(q.x,q.y,5,5);x.globalAlpha=1}
 x.restore();
 if(won||gameOver){x.fillStyle='rgba(15,23,42,.78)';x.fillRect(0,0,W,H);x.textAlign='center';x.fillStyle='#fff';x.font='bold 46px system-ui';x.fillText(won?'LEVEL COMPLETE!':'GAME OVER',W/2,220);x.font='22px system-ui';x.fillText(won?`You collected ${coins.filter(q=>q.got).length} coins!`:'Press Restart to try again',W/2,270);x.textAlign='left'}
}
function loop(){update();draw();requestAnimationFrame(loop)}
reset();loop();
