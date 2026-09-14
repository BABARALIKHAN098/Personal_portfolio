(()=>{
  const canvas=document.getElementById('ai-background');
  if(!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:true});
  let accent=getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
  document.addEventListener('themechange',()=>{
    accent=getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
    draw(performance.now(),true);
  });
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer=matchMedia('(pointer: coarse)');
  let width=0,height=0,dpr=1,points=[],frame=0,running=true,scrollY=window.scrollY;

  const pointCount=()=>width<768?11:width<1100?17:25;
  function resize(){
    width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    points=Array.from({length:pointCount()},(_,i)=>({
      x:Math.random()*width,y:Math.random()*height,
      vx:(Math.random()-.5)*(width<768?.045:.075),vy:(Math.random()-.5)*(width<768?.04:.065),
      r:1.2+Math.random()*1.7,phase:Math.random()*Math.PI*2,speed:.00016+Math.random()*.00018,
      traveller:i%5===0,travel:Math.random()
    }));
    draw(performance.now(),true);
  }

  function draw(time,staticOnly=false){
    ctx.clearRect(0,0,width,height);
    const parallax=reduceMotion.matches?0:-(scrollY%height)*.012;
    ctx.save();ctx.translate(0,parallax);
    const maxDistance=width<768?145:205;
    for(let i=0;i<points.length;i++){
      const a=points[i];
      if(!staticOnly&&!reduceMotion.matches){
        a.x+=a.vx;a.y+=a.vy;
        if(a.x<-20||a.x>width+20)a.vx*=-1;
        if(a.y<-20||a.y>height+35)a.vy*=-1;
      }
      for(let j=i+1;j<points.length;j++){
        const b=points[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);
        if(dist<maxDistance){
          const alpha=(1-dist/maxDistance)*.11;
          ctx.strokeStyle=`rgba(${accent},${alpha})`;ctx.lineWidth=.8;
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
          if(a.traveller&&!staticOnly&&!reduceMotion.matches){
            a.travel=(a.travel+.00032*(16.67))%1;
            const t=(a.travel+Math.sin(time*a.speed)*.08+1)%1;
            ctx.fillStyle=`rgba(${accent},.12)`;ctx.beginPath();ctx.arc(a.x+dx*t,a.y+dy*t,1.7,0,Math.PI*2);ctx.fill();
          }
        }
      }
      const pulse=staticOnly?0:Math.sin(time*a.speed+a.phase)*.5+.5;
      ctx.fillStyle=`rgba(${accent},${.07+pulse*.06})`;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();
      if(i%7===0){ctx.strokeStyle=`rgba(${accent},${.025+pulse*.025})`;ctx.beginPath();ctx.arc(a.x,a.y,a.r+5+pulse*4,0,Math.PI*2);ctx.stroke()}
    }
    ctx.restore();
  }

  function animate(time){if(!running)return;draw(time);frame=requestAnimationFrame(animate)}
  function setMotion(){cancelAnimationFrame(frame);running=!document.hidden;if(!running)return;if(reduceMotion.matches)draw(performance.now(),true);else frame=requestAnimationFrame(animate)}
  addEventListener('resize',resize,{passive:true});
  addEventListener('scroll',()=>{scrollY=window.scrollY},{passive:true});
  document.addEventListener('visibilitychange',setMotion);
  reduceMotion.addEventListener?.('change',setMotion);
  resize();setMotion();
})();
