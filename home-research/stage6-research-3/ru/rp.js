/* rp.js · #research, пример отчёта: пояснения подсвечивают фрагмент листа; лист свёрнут до «Lot economics» и разворачивается по кнопке или по выбору скрытого фрагмента. Без JS лист развёрнут, пояснения — текст. Без зависимостей */
(function(){
var W=document.getElementById('rs8-rs');if(!W)return;
var host=W.querySelector('.rs8-rp'),cl=document.getElementById('rs8-cl'),mr=W.querySelector('.rs8-mr'),mo=W.querySelector('.rs8-mo'),ks=[].slice.call(W.querySelectorAll('.rs8-k'));
if(!host||!cl||!mo)return;
var sr=host.shadowRoot,open=false,cur=null,HID={unknown:1,next:1};
function cut(){var m=sr&&sr.querySelector('[part~="hl-money"]');if(!m)return 0;return Math.ceil(m.getBoundingClientRect().bottom-host.getBoundingClientRect().top+28)}
function size(){var full=host.offsetHeight,c=cut();if(!c||c>=full-40){cl.style.height='';mr.hidden=true;return}mr.hidden=false;cl.style.height=(open?full:c)+'px'}
function setOpen(v){open=v;mo.setAttribute('aria-expanded',v?'true':'false');mo.textContent=v?'Свернуть фрагмент':'Развернуть фрагмент';cl.toggleAttribute('data-open',v);if(!v&&cur&&HID[cur])pick(null);size()}
function pick(k){cur=k;ks.forEach(function(el){el.setAttribute('aria-pressed',el.dataset.k===k?'true':'false')});if(k)host.setAttribute('data-focus',k);else host.removeAttribute('data-focus');if(k&&HID[k]&&!open)setOpen(true)}
ks.forEach(function(el){el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-pressed','false');el.setAttribute('aria-controls','rs8-doc');
el.addEventListener('click',function(){pick(cur===el.dataset.k?null:el.dataset.k)});
el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})});
mo.addEventListener('click',function(){setOpen(!open)});
W.classList.add('rp-on');
if('ResizeObserver' in window)new ResizeObserver(size).observe(host);else addEventListener('resize',size);
size();if(document.fonts)document.fonts.ready.then(size);
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){cl.classList.add('rp-pre');var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){cl.classList.remove('rp-pre');io.disconnect()}},{threshold:.08});io.observe(cl)}
})();
