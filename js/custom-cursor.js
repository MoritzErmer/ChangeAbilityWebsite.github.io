(function(){
  // robust custom cursor: dot + ring with lerp smoothing
  try{
    const hasTouchSupport = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    console.log('custom-cursor diag: hasTouchSupport=', hasTouchSupport, 'navigator.maxTouchPoints=', navigator.maxTouchPoints, 'prefersReduced=', prefersReduced, 'pointerFine=', pointerFine);
    // If device is touch-only (no fine pointer) or user prefers reduced motion, do not enable cursor
    if((hasTouchSupport && !pointerFine) || prefersReduced){
      console.log('custom-cursor: early exit (touch-only or reduced-motion)');
      return;
    }
    if(document.querySelector('.cursor-dot')){ console.log('custom-cursor: already present, skipping'); return; }

    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add('cursor-enabled');

    let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
    let ringX = mouseX, ringY = mouseY;

    const lerp = (a,b,t) => a + (b - a) * t;

    document.addEventListener('mousemove', (e)=>{
      mouseX = e.clientX;
      mouseY = e.clientY;
      // immediate dot position for crisp feel
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if(dot.style.opacity !== '1') dot.style.opacity = '1';
      if(ring.style.opacity !== '1') ring.style.opacity = '1';
    }, {passive:true});

    // smoothing loop for ring (dynamic lerp based on distance)
    const tick = ()=>{
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      // base speed; increase when further away for snappier catch-up
      const base = 0.18;
      const speed = Math.min(0.6, base + Math.min(dist / 200, 0.42));
      ringX = lerp(ringX, mouseX, speed);
      ringY = lerp(ringY, mouseY, speed);
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const interactive = 'a, button, .btn, input, textarea, select, label, [role="button"]';
    const setHover = ()=>{ dot.classList.add('hover'); ring.classList.add('hover'); };
    const clearHover = ()=>{ dot.classList.remove('hover'); ring.classList.remove('hover'); };

    document.querySelectorAll(interactive).forEach(elm=>{
      elm.addEventListener('pointerenter', setHover);
      elm.addEventListener('pointerleave', clearHover);
    });

    document.addEventListener('mousedown', ()=>{ dot.classList.add('active'); ring.classList.add('active'); });
    document.addEventListener('mouseup', ()=>{ dot.classList.remove('active'); ring.classList.remove('active'); });

    // hide on blur
    window.addEventListener('blur', ()=>{ dot.style.opacity = '0'; ring.style.opacity = '0'; });
    window.addEventListener('focus', ()=>{ dot.style.opacity = '1'; ring.style.opacity = '1'; });

    // small debug log for Chrome
    console.log('custom-cursor.js loaded — dot/ring created', dot, ring);
  }catch(e){
    console.warn('custom-cursor init error', e);
  }
})();
