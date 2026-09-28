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
[].forEach.call(document.querySelectorAll('[data-set]'),function(b){b.addEventListener('click',function(){clearTimeout(rt);set(b.getAttribute('data-set'),b.getAttribute('data-v'));
if(b.classList.contains('addb')){var r=document.querySelector('.oc3 .slip:not([hidden])');var f=document.querySelector('[data-set=offer][data-v="1"][role=radio]');if(f)f.focus({preventScroll:true})}})});
[].forEach.call(document.querySelectorAll('[role=radiogroup]'),function(g){var bs=[].slice.call(g.querySelectorAll('[role=radio]'));
bs.forEach(function(b,i){b.addEventListener('keydown',function(e){var k=e.key,j=-1;
if(k==='ArrowRight'||k==='ArrowDown')j=(i+1)%bs.length;else if(k==='ArrowLeft'||k==='ArrowUp')j=(i-1+bs.length)%bs.length;else if(k==='Home')j=0;else if(k==='End')j=bs.length-1;
if(j>=0){e.preventDefault();bs[j].focus();bs[j].click()}})})});
sync('path');sync('offer');
var rp=document.getElementById('replay');
if(rp){rp.addEventListener('click',function(){clearTimeout(rt);if(!mo){set('offer','1',false);return}set('offer','0');rt=setTimeout(function(){set('offer','1',true)},600)})}
var mb=document.querySelector('.menu-btn'),dr=document.getElementById('drawer');
/* заявка: демо-диалог, фокус возвращается на кнопку, Esc закрывает */
var dlg=document.getElementById('req');
if(dlg&&dlg.showModal){var form=document.getElementById('req-f'),fs=document.getElementById('req-fs'),sb=document.getElementById('req-s'),mail=document.getElementById('rq-mail'),merr=document.getElementById('rq-mail-e'),ok=document.getElementById('req-ok'),okm=document.getElementById('req-okm'),opener=null,st;
var RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function inv(on){mail.setAttribute('aria-invalid',on?'true':'false');merr.hidden=!on}
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
[].forEach.call(dr.querySelectorAll('a'),function(a){a.addEventListener('click',function(){dr.classList.remove('open');mb.setAttribute('aria-expanded','false')})})}
})();
