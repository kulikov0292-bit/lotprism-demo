(function(){
var H=document.documentElement,mo=H.classList.contains('mo'),live=document.getElementById('live');
var names={r:'Перепродажа',n:'Новый листинг'};
function sync(k){var v=H.getAttribute('data-'+k);
[].forEach.call(document.querySelectorAll('[data-set="'+k+'"]'),function(b){if(b.classList.contains('addb'))return;var on=b.getAttribute('data-v')===v;
if(b.getAttribute('role')==='radio'){b.setAttribute('aria-checked',on);b.tabIndex=on?0:-1}else b.setAttribute('aria-pressed',on)})}
var at,rt;
function set(k,v,anim){if(H.getAttribute('data-'+k)===v&&!anim)return;H.setAttribute('data-'+k,v);sync(k);
if(k==='path'){try{sessionStorage.setItem('lp-demo2-path',v)}catch(e){}}
if(k==='offer'&&v==='1'&&mo&&anim!==false){H.classList.remove('arrive');void H.offsetWidth;H.classList.add('arrive');clearTimeout(at);at=setTimeout(function(){H.classList.remove('arrive')},2000)}
if(live)live.textContent='Сценарий: '+names[H.getAttribute('data-path')]+', '+(H.getAttribute('data-offer')==='1'?'с предложением поставщика':'без предложения поставщика')+'.'}
[].forEach.call(document.querySelectorAll('[data-set]'),function(b){b.addEventListener('click',function(){clearTimeout(rt);var k0=b.getAttribute('data-set'),v0=b.getAttribute('data-v'),was=H.getAttribute('data-'+k0),y0=b.getBoundingClientRect().top;set(k0,v0);if(k0==='path'&&was!==v0)requestAnimationFrame(function(){var d=b.getBoundingClientRect().top-y0;if(Math.abs(d)>1)window.scrollBy(0,d)});if(k0==='offer'&&v0==='1'&&was!=='1'&&!b.classList.contains('addb'))requestAnimationFrame(function(){var s=document.querySelector('.oc3 .slip:not([hidden])');if(!s)return;var r=s.getBoundingClientRect();if(r.top<70||r.top>innerHeight*0.6)s.scrollIntoView({behavior:mo?'smooth':'auto',block:'start'})});
if(b.classList.contains('addb')){var r=document.querySelector('.oc3 .slip:not([hidden])');var f=document.querySelector('[data-set=offer][data-v="1"][role=radio]');if(f)f.focus({preventScroll:true})}})});
[].forEach.call(document.querySelectorAll('[role=radiogroup]'),function(g){var bs=[].slice.call(g.querySelectorAll('[role=radio]'));
bs.forEach(function(b,i){b.addEventListener('keydown',function(e){var k=e.key,j=-1;
if(k==='ArrowRight'||k==='ArrowDown')j=(i+1)%bs.length;else if(k==='ArrowLeft'||k==='ArrowUp')j=(i-1+bs.length)%bs.length;else if(k==='Home')j=0;else if(k==='End')j=bs.length-1;
if(j>=0){e.preventDefault();bs[j].focus();bs[j].click()}})})});
sync('path');sync('offer');
/* БРИФ-20: на компьютере полосы сравнения стоят на уровне числа потолка в левой колонке */
function vis(s){return [].filter.call(document.querySelectorAll(s),function(e){return e.offsetParent!==null})[0]}
function al(){var c=document.querySelector('.oc3 .cmp2');if(!c)return;c.style.marginTop='';if(innerWidth<981||H.getAttribute('data-offer')!=='1')return;var a=vis('.oc3 .c-ce .cres b.num'),b=vis('.oc3 .cmp2 .bar.c .num');if(!a||!b)return;var ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect(),d=(ra.top+ra.height/2)-(rb.top+rb.height/2);if(d>0)c.style.marginTop=d+'px'}
new MutationObserver(function(){requestAnimationFrame(al)}).observe(H,{attributes:true,attributeFilter:['data-path','data-offer']});
addEventListener('resize',al);if(document.fonts)document.fonts.ready.then(al);al();
var rp=document.getElementById('replay');
if(rp){rp.addEventListener('click',function(){clearTimeout(rt);if(!mo){set('offer','1',false);return}set('offer','0');rt=setTimeout(function(){set('offer','1',true)},600)})}
var mb=document.querySelector('.menu-btn'),dr=document.getElementById('drawer');
/* заявка: демо-диалог, фокус возвращается на кнопку, Esc закрывает */
var dlg=document.getElementById('req');
if(dlg&&dlg.showModal){var form=document.getElementById('req-f'),fs=document.getElementById('req-fs'),sb=document.getElementById('req-s'),mail=document.getElementById('rq-mail'),merr=document.getElementById('rq-mail-e'),ok=document.getElementById('req-ok'),okm=document.getElementById('req-okm'),opener=null,st;
var RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function inv(on){mail.setAttribute('aria-invalid',on?'true':'false');merr.hidden=!on;if(on)merr.textContent=mail.value.trim()?'Проверьте адрес почты':'Укажите рабочую почту'}
function reset(){clearTimeout(st);form.reset();form.hidden=false;ok.hidden=true;okm.textContent='';inv(false);fs.disabled=false;sb.removeAttribute('data-state')}
[].forEach.call(document.querySelectorAll('[data-req]'),function(a){a.addEventListener('click',function(e){e.preventDefault();opener=a.closest('.drawer')?mb:a;if(dr&&dr.classList.contains('open')){dr.classList.remove('open');mb.setAttribute('aria-expanded','false')}reset();dlg.showModal();mail.focus()})});
function back(){clearTimeout(st);if(opener&&document.activeElement!==opener)opener.focus()}
function shut(){if(dlg.open)dlg.close();back()}
document.getElementById('req-x').addEventListener('click',shut);
document.getElementById('req-c').addEventListener('click',shut);
dlg.addEventListener('click',function(e){if(e.target===dlg)shut()});
dlg.addEventListener('cancel',function(){setTimeout(back,0)});
dlg.addEventListener('close',back);
mail.addEventListener('input',function(){if(mail.getAttribute('aria-invalid')==='true'&&RE.test(mail.value.trim()))inv(false)});
form.addEventListener('submit',function(e){e.preventDefault();if(sb.dataset.state)return;if(!RE.test(mail.value.trim())){inv(true);mail.focus();return}
inv(false);sb.setAttribute('data-state','loading');fs.disabled=true;st=setTimeout(function(){form.hidden=true;ok.hidden=false;okm.textContent=(H.getAttribute('data-path')==='n'?'Демо: запрос на обсуждение исследования сформирован, но не отправлен.':'Демо: заявка сформирована, но не отправлена.')+' После подключения получателя здесь будет подтверждение.';okm.focus()},mo?900:0)})}
if(mb&&dr){mb.addEventListener('click',function(){var o=!dr.classList.contains('open');dr.classList.toggle('open',o);mb.setAttribute('aria-expanded',o)});
[].forEach.call(dr.querySelectorAll('a'),function(a){a.addEventListener('click',function(){dr.classList.remove('open');mb.setAttribute('aria-expanded','false')})});function closeMenu(f){if(!dr.classList.contains('open'))return;dr.classList.remove('open');mb.setAttribute('aria-expanded','false');if(f)mb.focus()}document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu(true)});document.addEventListener('click',function(e){if(!dr.contains(e.target)&&!mb.contains(e.target))closeMenu(false)})}
})();
