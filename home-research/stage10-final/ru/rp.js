/* rp.js · #research, пример отчёта: вкладки «Вывод · Экономика · Неизвестное · Следующий шаг» выбирают участок настоящего листа (::part hl-*); лист показан окном — сдвиг хоста transform, без внутренней прокрутки. «Развернуть весь фрагмент» показывает лист целиком. Без JS: лист целиком, пояснения — текст. Без зависимостей */
(function(){
var W=document.getElementById('rs8-rs');if(!W)return;
var host=W.querySelector('.rs8-rp'),cl=document.getElementById('rs8-cl'),tb=W.querySelector('.rs8-tb'),mr=W.querySelector('.rs8-mr'),mo=W.querySelector('.rs8-mo');
if(!host||!cl||!tb||!mo||!host.shadowRoot)return;
var sr=host.shadowRoot,tabs=[].slice.call(tb.querySelectorAll('[role="tab"]')),pns=[].slice.call(W.querySelectorAll('.rs8-pn')),cur='verdict',open=false,H=document.documentElement;
var RM=matchMedia('(prefers-reduced-motion: reduce)');
function part(k){return sr.querySelector('[part~="hl-'+k+'"]')}
function top(p){var s=p.previousElementSibling;return s&&/^H[1-6]$/.test(s.tagName)?s:p}
function geo(){var p=part(cur);if(!p)return null;var a=top(p),h=host.getBoundingClientRect(),ra=a.getBoundingClientRect(),r=p.getBoundingClientRect(),pad=innerWidth<=600?20:28,min=innerWidth<=600?200:260,y=Math.max(0,ra.top-h.top-pad),ht=Math.max(min,r.bottom-ra.top+pad*2);return{y:y,h:Math.min(ht,host.offsetHeight-y)}}
function lay(){if(open){cl.style.height='';host.style.transform='';return}var g=geo();if(!g)return;cl.style.height=g.h+'px';host.style.transform='translateY('+(-g.y)+'px)'}
function sel(k,focus,user){cur=k;tabs.forEach(function(t){var on=t.dataset.k===k;t.setAttribute('aria-selected',on?'true':'false');t.tabIndex=on?0:-1;if(on&&focus)t.focus()});
pns.forEach(function(p){p.hidden=p.dataset.k!==k});host.setAttribute('data-focus',k);
lay();if(open&&user){var p=part(k);if(p){var r=p.getBoundingClientRect();if(r.top<0||r.top>innerHeight-120)scrollTo({top:scrollY+r.top-96,behavior:RM.matches||H.classList.contains('kb')?'auto':'smooth'})}}
else if(user&&innerWidth<=1100){var b=cl.getBoundingClientRect();if(b.bottom>innerHeight){var tt=tb.getBoundingClientRect().top,hd=document.querySelector('header'),hb=hd?Math.max(0,hd.getBoundingClientRect().bottom):0;scrollTo({top:scrollY+Math.min(tt-hb-8,b.bottom-innerHeight+16),behavior:RM.matches||H.classList.contains('kb')?'auto':'smooth'})}}}
tabs.forEach(function(t,i){
t.addEventListener('click',function(){sel(t.dataset.k,false,true)});
t.addEventListener('keydown',function(e){var n=tabs.length,j=null;
if(e.key==='ArrowRight'||e.key==='ArrowDown')j=(i+1)%n;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')j=(i+n-1)%n;else if(e.key==='Home')j=0;else if(e.key==='End')j=n-1;
if(j!==null){e.preventDefault();sel(tabs[j].dataset.k,true,true)}})});
pns.forEach(function(p){p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby','rs8-t-'+p.dataset.k);p.tabIndex=0});
mo.addEventListener('click',function(){open=!open;cl.toggleAttribute('data-open',open);mo.setAttribute('aria-expanded',open?'true':'false');mo.textContent=open?'Показать только выбранный участок':'Развернуть весь фрагмент';lay();
if(!open){var b=cl.getBoundingClientRect();if(b.top<0)scrollTo({top:scrollY+b.top-96})}});
W.classList.add('rp-on');tb.hidden=false;mr.hidden=false;
sel('verdict',false,false);
if('ResizeObserver' in window)new ResizeObserver(function(){lay()}).observe(host);else addEventListener('resize',lay);
if(document.fonts)document.fonts.ready.then(lay);
})();
