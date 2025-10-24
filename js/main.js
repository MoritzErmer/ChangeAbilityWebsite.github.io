// Small interactive behaviors: mobile menu and year insert
document.addEventListener('DOMContentLoaded',function(){
  // Setze dynamisch die Header-Höhe als CSS-Variable, damit der Graph bis zum unteren Bildschirmrand passt
  (function(){
    const headerEl = document.querySelector('.site-header');
    if(!headerEl) return;
    const setHeaderVar = ()=>{
      const h = Math.round(headerEl.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-h', h + 'px');
    };
    setHeaderVar();
    // Beobachte Größenänderungen am Header robust (z. B. bei Wraps)
    if('ResizeObserver' in window){
      const ro = new ResizeObserver(setHeaderVar);
      ro.observe(headerEl);
    } else {
      window.addEventListener('resize', setHeaderVar);
      window.addEventListener('orientationchange', setHeaderVar);
    }
  })();
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav') || document.querySelector('.nav');
  if(toggle && nav){
    // helper to find focusable elements inside an element
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let lastFocused = null;
    const openNav = ()=>{
      lastFocused = document.activeElement;
      toggle.setAttribute('aria-expanded', 'true');
      nav.classList.add('open');
      nav.setAttribute('aria-hidden', 'false');
      // move focus to first focusable element inside nav
      const first = nav.querySelector(focusableSelector);
      if(first) first.focus();
      // listen for keydown to close on Escape and keep focus trapped
      document.addEventListener('keydown', trapKeydown);
    };
    const closeNav = ()=>{
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden', 'true');
      document.removeEventListener('keydown', trapKeydown);
      // restore focus
      if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };

    const trapKeydown = (e)=>{
      if(e.key === 'Escape'){
        e.preventDefault();
        closeNav();
        return;
      }
      if(e.key === 'Tab'){
        const focusables = Array.from(nav.querySelectorAll(focusableSelector)).filter(n=> n.offsetParent !== null);
        if(focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length -1];
        if(e.shiftKey && document.activeElement === first){
          e.preventDefault();
          last.focus();
        } else if(!e.shiftKey && document.activeElement === last){
          e.preventDefault();
          first.focus();
        }
      }
    };

    toggle.addEventListener('click',()=>{
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if(expanded) closeNav(); else openNav();
    });
  }

  const y = new Date().getFullYear();
  const el = document.getElementById('year');
  if(el) el.textContent = String(y);

  // Header-Menüband bleibt immer sichtbar; Header-Logo nur zeigen,
  // wenn die Landing-Hero-Sektion NICHT im Viewport ist (1% genügt)
  (function(){
  const header = document.querySelector('.site-header');
  const headerLogo = document.querySelector('.site-header .logo img');
  const landingHero = document.querySelector('.landing-hero');
  const landingGraph = document.querySelector('.landing-graph');
  const landingLogo = document.querySelector('.landing-logo');
    if(!header || !headerLogo){ return; }
    // Wenn keine Landing vorhanden ist, Logo immer zeigen
    if(!landingHero && !landingLogo){
      header.classList.remove('hide-logo');
      return;
    }

    const setHidden = (hidden)=> header.classList.toggle('hide-logo', !!hidden);

    // Fallback-/Initial-Check per BoundingClientRect
    const boundingVisible = (el)=>{
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      return r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw; // irgendein Teil sichtbar
    };
  const target = landingHero || landingGraph || landingLogo;
    const checkNow = ()=> setHidden(boundingVisible(target));

    // IntersectionObserver mit threshold 0 (jedes Pixel zählt)
    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries)=>{
        // Falls mehrere Einträge kommen, prüfe den für landingLogo
        const entry = entries.find(e=> e.target === target) || entries[0];
        setHidden(entry && entry.isIntersecting);
      }, { root:null, threshold:0.01, rootMargin:'0px' });
      io.observe(target);
      // initialer Zustand
      checkNow();
    }else{
      // Fallback ohne IO
      checkNow();
      window.addEventListener('scroll', checkNow, { passive:true });
      window.addEventListener('resize', checkNow);
    }
  })();

  // Custom minimal circular cursor (disabled for touch and reduced-motion)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if(!isTouch && !prefersReduced){
  document.documentElement.classList.add('cursor-enabled');
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor hidden';
  document.body.appendChild(cursor);
  // debug: confirm cursor created (visible in Chrome DevTools console)
  console.log('Custom cursor created', cursor);
  console.log('cursor-enabled class on html?', document.documentElement.classList.contains('cursor-enabled'));


    let lastMove = 0;
    const move = (x,y)=>{
      cursor.style.left = x + 'px';
      cursor.style.top = y + 'px';
      if(cursor.classList.contains('hidden')) cursor.classList.remove('hidden');
      lastMove = Date.now();
    };

    let movedOnce = false;
    const onMouseMove = (e)=>{
      // throttle to animation frames
      requestAnimationFrame(()=> {
        move(e.clientX, e.clientY);
        if(!movedOnce){
          console.log('custom cursor first move', e.clientX, e.clientY);
          movedOnce = true;
        }
      });
    };

    const onMouseDown = ()=> cursor.classList.add('active');
    const onMouseUp = ()=> cursor.classList.remove('active');

    // enlarge cursor when hovering interactive elements
    const addHover = ()=> cursor.classList.add('hover');
    const removeHover = ()=> cursor.classList.remove('hover');

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    // add pointerenter/leave on common interactive selectors
    const interactive = 'a, button, .btn, input, textarea, select, label, [role="button"]';
    document.querySelectorAll(interactive).forEach(elm=>{
      elm.addEventListener('pointerenter', addHover);
      elm.addEventListener('pointerleave', removeHover);
    });

    // hide cursor briefly when window loses focus
    window.addEventListener('blur', ()=> cursor.classList.add('hidden'));
    window.addEventListener('focus', ()=>{ if(Date.now() - lastMove > 500) cursor.classList.add('hidden'); else cursor.classList.remove('hidden') });

    // cleanup when navigating away (SPA not present but safe)
    window.addEventListener('beforeunload', ()=>{
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    });
  }

  // small tilt/parallax on hero and project cards (desktop only) - softened for flow
  if(!(('ontouchstart' in window) || navigator.maxTouchPoints > 0)){
    // (ehem.) Hero-Parallax: auf Landing nicht nötig, daher deaktiviert

    // project card tilt with softened intensity
    document.querySelectorAll('.projects-list .project').forEach(card=>{
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const intensity = 6; // softer unified intensity
        card.style.transform = `perspective(700px) rotateX(${(-py*intensity/2)}deg) rotateY(${(px*intensity/2)}deg)`;
      });
      card.addEventListener('mouseleave', ()=> card.style.transform = '');
    });
  }

    // ripple effect on buttons
    document.querySelectorAll('.btn').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const rect = btn.getBoundingClientRect();
        const d = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = d + 'px';
        ripple.style.left = (e.clientX - rect.left - d/2) + 'px';
        ripple.style.top = (e.clientY - rect.top - d/2) + 'px';
        btn.appendChild(ripple);
        setTimeout(()=> ripple.remove(), 650);
      });
    });
    // add pressed state for primary buttons to briefly invert the label on active
    document.querySelectorAll('.btn.primary').forEach(btn=>{
      const add = ()=> btn.classList.add('pressed');
      const rem = ()=> btn.classList.remove('pressed');
      btn.addEventListener('pointerdown', add);
      document.addEventListener('pointerup', rem);
      btn.addEventListener('keydown', e=>{ if(e.key === ' ' || e.key === 'Enter'){ add(); setTimeout(rem,200); } });
      // ensure removal on pointer cancel/leave
      btn.addEventListener('pointercancel', rem);
      btn.addEventListener('blur', rem);
    });
    // open modal when clicking project 'Mehr' or the card
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><button class="close" aria-label="Schließen">×</button><div class="content"></div></div>`;
    document.body.appendChild(modal);

    const content = modal.querySelector('.content');
    modal.querySelector('.close').addEventListener('click', ()=> modal.classList.remove('open'));
    modal.addEventListener('click', e=>{ if(e.target === modal) modal.classList.remove('open') });

    document.querySelectorAll('.projects-list .project').forEach(card=>{
      const btn = card.querySelector('.btn');
      const open = ()=>{
        const title = card.querySelector('h3')?.textContent || 'Projekt';
        const desc = card.querySelector('p')?.textContent || '';
        content.innerHTML = `<h3>${title}</h3><p>${desc}</p><p class="muted">Mehr Infos folgen — melde dich im Green Lab!</p>`;
        modal.classList.add('open');
        modal.querySelector('.close').focus();
      };
      card.addEventListener('click', open);
      if(btn) btn.addEventListener('click', e=>{ e.stopPropagation(); open(); });
    });
});
