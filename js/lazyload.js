// Basic lazy loader for images using IntersectionObserver
document.addEventListener('DOMContentLoaded',()=>{
  const imgs = document.querySelectorAll('img[loading="lazy"], picture img');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img = entry.target;
          // if data-src or source available, swap
          const src = img.getAttribute('data-src');
          if(src) img.src = src;
          obs.unobserve(img);
        }
      });
    },{rootMargin:'200px 0px'});
    imgs.forEach(i=>io.observe(i));
  }
});
