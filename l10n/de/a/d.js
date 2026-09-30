(function(){
var H=document.documentElement,mo=H.classList.contains('mo'),live=document.getElementById('live');
/* v3: строки из landing.ru.json с параметрами ПАРАМЕТРЫ-демо.md — целыми фразами */
var T={
'scenario.resale.label':'Wiederverkauf','scenario.newListing.label':'Neues Listing',
'live.scenario.noOffer':'Szenario: {scenario}, ohne Lieferantenangebot.','live.scenario.withOffer':'Szenario: {scenario}, mit Lieferantenangebot.',
'live.offerExample.resale':'Angezeigt wird ein Beispiel: Preisliste des Lieferanten vom 25.09.2026, Angebot 2,00\u00a0€ unter der berechneten Obergrenze.',
'live.offerExample.newListing':'Angezeigt wird ein Beispiel: Preisliste des Lieferanten vom 24.09.2026, Vergleich mit der Obergrenze für das Set unter Vorbehalt.',
'form.email.errorEmpty':'Bitte geben Sie Ihre E-Mail-Adresse ein','form.email.errorInvalid':'Bitte prüfen Sie die E-Mail-Adresse',
'form.submit':'Anfrage senden','form.submitting':'Wird gesendet\u00a0…',
'form.success.demo':'Demo: Die Anfrage wurde nicht gesendet.'};
/* БРИФ-26: числа и диапазоны в .nw (без слов) изолируются и читаются слева направо и на RTL-странице; фразы с числом («8–12 шт.») не трогаем — число в них оборачивает сборка */
[].forEach.call(document.querySelectorAll('.nw'),function(e){var s=e.textContent;if(/[\d\u0660-\u0669\u06f0-\u06f9]/.test(s)&&/^[\s\d\u0660-\u0669\u06f0-\u06f9\u066b\u066c.,:()+\-–−€%P]+$/.test(s))e.dir='ltr'});
function t(k,p){var s=T[k];if(p)for(var n in p)s=s.split('{'+n+'}').join(p[n]);return s}
function isN(){return H.getAttribute('data-path')==='n'}
function sync(k){var v=H.getAttribute('data-'+k);
[].forEach.call(document.querySelectorAll('[data-set="'+k+'"]'),function(b){if(b.classList.contains('addb'))return;var on=b.getAttribute('data-v')===v;
if(b.getAttribute('role')==='radio'){b.setAttribute('aria-checked',on);b.tabIndex=on?0:-1}else b.setAttribute('aria-pressed',on)})}
var at,rt;
function set(k,v,anim){if(H.getAttribute('data-'+k)===v&&!anim)return;H.setAttribute('data-'+k,v);sync(k);
if(k==='path'){try{sessionStorage.setItem('lp-demo2-path',v)}catch(e){}}
if(k==='offer'&&v==='1'&&mo&&anim!==false){H.classList.remove('arrive');void H.offsetWidth;H.classList.add('arrive');clearTimeout(at);at=setTimeout(function(){H.classList.remove('arrive')},2000)}
if(!live)return;
if(k==='offer'&&v==='1')live.textContent=t(isN()?'live.offerExample.newListing':'live.offerExample.resale');
else live.textContent=t(H.getAttribute('data-offer')==='1'?'live.scenario.withOffer':'live.scenario.noOffer',{scenario:t(isN()?'scenario.newListing.label':'scenario.resale.label')})}
[].forEach.call(document.querySelectorAll('[data-set]'),function(b){b.addEventListener('click',function(){clearTimeout(rt);var k0=b.getAttribute('data-set'),v0=b.getAttribute('data-v'),was=H.getAttribute('data-'+k0),y0=b.getBoundingClientRect().top;set(k0,v0);if(k0==='path'&&was!==v0){var d=b.getBoundingClientRect().top-y0;if(Math.abs(d)>1)window.scrollBy({top:d,left:0,behavior:'instant'})}if(k0==='offer'&&v0==='1'&&was!=='1'&&!b.classList.contains('addb'))requestAnimationFrame(function(){var s=document.querySelector('.oc3 .slip:not([hidden])');if(!s)return;var r=s.getBoundingClientRect();if(r.top<70||r.top>innerHeight*0.6)s.scrollIntoView({behavior:mo?'smooth':'auto',block:'start'})});
if(b.classList.contains('addb')){var f=document.querySelector('[data-set=offer][data-v="1"][role=radio]');if(f)f.focus({preventScroll:true})}})});
[].forEach.call(document.querySelectorAll('[role=radiogroup]'),function(g){var bs=[].slice.call(g.querySelectorAll('[role=radio]'));
bs.forEach(function(b,i){b.addEventListener('keydown',function(e){var k=e.key,j=-1,rl=getComputedStyle(g).direction==='rtl';
if(k==='ArrowDown'||k===(rl?'ArrowLeft':'ArrowRight'))j=(i+1)%bs.length;else if(k==='ArrowUp'||k===(rl?'ArrowRight':'ArrowLeft'))j=(i-1+bs.length)%bs.length;else if(k==='Home')j=0;else if(k==='End')j=bs.length-1;
if(j>=0){e.preventDefault();bs[j].focus();bs[j].click()}})})});
sync('path');sync('offer');
/* v3.1: подвал — скрытые места для сведений оператора видны только в режиме ?review=footer */
if(new URLSearchParams(location.search).get('review')==='footer')[].forEach.call(document.querySelectorAll('[data-review]'),function(e){e.hidden=false;if(!e.classList.contains('wrap'))e.classList.add('review')});
/* v3: ссылки подвала «Перепродажа» / «Новый листинг» — сценарий без перезагрузки, затем к #how; href ?p=…#how — запасной вариант без JS */
[].forEach.call(document.querySelectorAll('a[data-go]'),function(a){a.addEventListener('click',function(e){var s=document.getElementById('how');if(!s)return;e.preventDefault();set('path',a.getAttribute('data-go'));window.scrollTo({top:s.getBoundingClientRect().top+window.pageYOffset-80,behavior:mo?'smooth':'instant'});var h=document.getElementById('h-how');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}})});
/* БРИФ-20: на компьютере полосы сравнения стоят на уровне числа потолка в левой колонке */
function vis(s){return [].filter.call(document.querySelectorAll(s),function(e){return e.offsetParent!==null})[0]}
function al(){var c=document.querySelector('.oc3 .cmp2');if(!c)return;c.style.marginTop='';if(innerWidth<981||H.getAttribute('data-offer')!=='1')return;var a=vis('.oc3 .c-ce .cres b.num'),b=vis('.oc3 .cmp2 .bar.c .num');if(!a||!b)return;var ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect(),d=(ra.top+ra.height/2)-(rb.top+rb.height/2);if(d>0)c.style.marginTop=d+'px'}
new MutationObserver(function(){requestAnimationFrame(al)}).observe(H,{attributes:true,attributeFilter:['data-path','data-offer']});
addEventListener('resize',al);if(document.fonts)document.fonts.ready.then(al);al();
var rp=document.getElementById('replay');
if(rp){rp.addEventListener('click',function(){clearTimeout(rt);if(!mo){set('offer','1',false);return}set('offer','0');rt=setTimeout(function(){set('offer','1',true)},600)})}
var mb=document.querySelector('.menu-btn'),dr=document.getElementById('drawer');
/* переключатель языка (ЯЗЫК-переключатель.md §§2, 5, 6, 8; БРИФ-25 §2; порядок — корневая сортировка CLDR через 'en': Intl.Collator('und') в браузерах берёт язык посетителя, и порядок плавал бы): шапка, меню, подвал — один компонент. Данные — window.LP_L10N от сборки {cur, ready, names, href(code)}; без него страница ru и все три места скрыты */
(function(){var C=window.LP_L10N;if(!C||!C.ready||C.ready.length<2||typeof C.href!=='function')return;
var N=C.names||{},X=C.search||{},K=C.codes||{},RTL={ar:1,he:1,fa:1,ur:1},co=new Intl.Collator('en'),L=C.ready.slice().sort(function(a,b){return co.compare(N[a]||a,N[b]||b)});
/* БРИФ-26: при > 8 языках — поле «Найти язык» (самоназвание, код, C.search[код] — английское и русское название, если сборка передаст); коды полные: pt-BR → PT-BR, zh-Hant → ZH-HANT */
function fold(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function sec(){var m=innerHeight/2,id='';[].forEach.call(document.querySelectorAll('main > section[id]'),function(s){if(s.getBoundingClientRect().top<m)id=s.id});return id&&id!=='hero'?'#'+id:''}
function url(c){var u=C.href(c),q='p='+(H.getAttribute('data-path')||'r')+(H.getAttribute('data-offer')==='1'?'&o=1':'');return u+(u.indexOf('?')<0?'?':'&')+q+sec()}
function nm(el,c){el.lang=c;if(RTL[String(c).split('-')[0].toLowerCase()])el.dir='rtl';el.textContent=N[c]||c}
[].forEach.call(document.querySelectorAll('.lang'),function(w){var b=w.querySelector('.lang-b'),p=document.getElementById(b.getAttribute('aria-controls')),as=[];if(!p)return;var l=p.querySelector('.lang-u')||p,s=p.querySelector('.lang-s'),q=s&&s.querySelector('.lang-q');if(q&&L.length>8)s.hidden=false;else q=null;
nm(b.querySelector('.lang-c'),C.cur);
L.forEach(function(c){var li=document.createElement('li'),a=document.createElement('a'),n=document.createElement('span'),k=document.createElement('bdi');a.hreflang=c;a.href=url(c);n.className='n';nm(n,c);k.className='c';k.setAttribute('aria-hidden','true');k.textContent=K[c]||String(c).toUpperCase();a.appendChild(n);a.appendChild(k);li.setAttribute('data-q',fold([N[c]||'',c,X[c]||''].join(' ')));
if(c===C.cur)a.setAttribute('aria-current','true');
a.addEventListener('click',function(e){try{localStorage.setItem('lp:ui_language',c)}catch(x){}if(c===C.cur){e.preventDefault();cl(true);return}a.href=url(c)});
li.appendChild(a);l.appendChild(li);as.push([a,c,li])});
function shown(){return as.filter(function(x){return !x[2].hidden}).map(function(x){return x[0]})}
function flt(){var v=q?fold(q.value.trim()):'';as.forEach(function(x){x[2].hidden=!!v&&x[2].getAttribute('data-q').indexOf(v)<0})}
if(q){q.addEventListener('input',flt);q.addEventListener('keydown',function(e){var v=shown();if(e.key==='ArrowDown'&&v[0]){e.preventDefault();v[0].focus()}else if(e.key==='Enter'){e.preventDefault();if(v.length===1)v[0].click()}})}
l.addEventListener('keydown',function(e){if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;var v=shown(),i=v.indexOf(document.activeElement);if(i<0)return;e.preventDefault();var j=i+(e.key==='ArrowDown'?1:-1);if(j>=0&&j<v.length)v[j].focus();else if(j<0&&q)q.focus()});
function op(){if(q){q.value='';flt()}as.forEach(function(x){x[0].href=url(x[1])});p.hidden=false;b.setAttribute('aria-expanded','true');l.scrollTop=0;var cu=l.querySelector('[aria-current]');if(cu&&l.scrollHeight>l.clientHeight){var a=cu.getBoundingClientRect(),r=l.getBoundingClientRect();l.scrollTop=Math.max(0,a.top-r.top-(l.clientHeight-a.height)/2)}}
function cl(f){if(p.hidden)return;p.hidden=true;b.setAttribute('aria-expanded','false');if(f)b.focus()}
b.addEventListener('click',function(){p.hidden?op():cl(false)});
w.addEventListener('keydown',function(e){if(e.key==='Escape'&&!p.hidden){e.stopPropagation();cl(true)}});
w.addEventListener('focusout',function(e){if(e.relatedTarget&&!w.contains(e.relatedTarget))cl(false)});
document.addEventListener('click',function(e){if(!w.contains(e.target))cl(false)});
w.hidden=false})})();
/* БРИФ-26: строка шапки не переносится и не наезжает на любом языке. Переполнение — по факту (ResizeObserver): по очереди язык-значок (≥ 1280), разделы в меню, «Войти» в меню, кнопка заявки в меню. Язык остаётся сверху */
var sh=document.querySelector('.site-h'),nv=sh&&sh.querySelector('.nav'),HS=['h-lc','h-nav','h-in','h-cta'];
function hOver(){var cs=getComputedStyle(nv),av=nv.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),g=parseFloat(cs.columnGap)||0,s=0,n=0;[].forEach.call(nv.children,function(e){var w=e.getBoundingClientRect().width;if(w){s+=w;n++}});return s+g*(n-1)>av+.5}
function fit(){if(!nv)return;HS.forEach(function(c){sh.classList.remove(c)});for(var i=0;i<HS.length&&hOver();i++)sh.classList.add(HS[i]);if(innerWidth>980&&!sh.classList.contains('h-nav')&&dr&&dr.classList.contains('open')){dr.classList.remove('open');mb.setAttribute('aria-expanded','false')}}
window.LPhdr=fit;
if(nv){fit();if(window.ResizeObserver)new ResizeObserver(function(){fit()}).observe(nv);else addEventListener('resize',fit);if(document.fonts)document.fonts.ready.then(fit);addEventListener('load',fit)}
/* заявка: демо-диалог, фокус возвращается на кнопку, Esc закрывает */
var dlg=document.getElementById('req');
if(dlg&&dlg.showModal){var form=document.getElementById('req-f'),fs=document.getElementById('req-fs'),sb=document.getElementById('req-s'),stx=document.getElementById('req-st'),mail=document.getElementById('rq-mail'),merr=document.getElementById('rq-mail-e'),ok=document.getElementById('req-ok'),okm=document.getElementById('req-okm'),opener=null,st;
var RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function inv(on){mail.setAttribute('aria-invalid',on?'true':'false');merr.hidden=!on;if(on)merr.textContent=t(mail.value.trim()?'form.email.errorInvalid':'form.email.errorEmpty')}
function reset(){clearTimeout(st);form.reset();form.hidden=false;ok.hidden=true;okm.textContent='';inv(false);fs.disabled=false;sb.removeAttribute('data-state');if(stx)stx.textContent=t('form.submit')}
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
inv(false);sb.setAttribute('data-state','loading');if(stx)stx.textContent=t('form.submitting');fs.disabled=true;st=setTimeout(function(){form.hidden=true;ok.hidden=false;okm.textContent=t('form.success.demo');okm.focus()},mo?900:0)})}
if(mb&&dr){mb.addEventListener('click',function(){var o=!dr.classList.contains('open');dr.classList.toggle('open',o);mb.setAttribute('aria-expanded',o)});
[].forEach.call(dr.querySelectorAll(':scope > a'),function(a){a.addEventListener('click',function(){dr.classList.remove('open');mb.setAttribute('aria-expanded','false')})});function closeMenu(f){if(!dr.classList.contains('open'))return;dr.classList.remove('open');mb.setAttribute('aria-expanded','false');if(f)mb.focus()}document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu(true)});document.addEventListener('click',function(e){if(!dr.contains(e.target)&&!mb.contains(e.target))closeMenu(false)})}
})();
