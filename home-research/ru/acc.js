/* Главная с Research: заявка на доступ. Отдельный модуль поверх стилей диалога 853adacf (dialog, .dlg, .fld, .proto, .done); d.js не меняется.
   Режим берётся из <dialog data-endpoint>: без адреса — имитация (прототип), с адресом — POST на обработчик CTO (ПЕРЕДАЧА-CTO.md, дополнение к Т2).
   Успех показывается только после ответа сервера «сохранено». При любой ошибке введённое остаётся, повтор уходит с тем же request_id.
   Просмотр состояний для приёмки: ?acc=idle|invalid|sending|success|error|limit. */
(function(){
var S={ /* тексты — ключи для словаря сборки при переводе */
  'mail.empty':'Укажите почту для ответа','mail.invalid':'Проверьте адрес почты: в нём должен быть знак @ и домен',
  'int.empty':'Выберите, что хотите проверить',
  'submit':'Отправить заявку','sending':'Отправляем…','retry':'Отправить ещё раз',
  'err.net':'Не удалось отправить заявку. Проверьте соединение и повторите — введённое сохранено.',
  'err.limit':'Слишком много попыток. Повторите позже — введённое сохранено.',
  'ok':'Заявка получена. Ответим на {mail}.'
};
var dlg=document.getElementById('acc');if(!dlg||!dlg.showModal)return;
var H=document.documentElement,mo=H.classList.contains('mo'),EP=dlg.getAttribute('data-endpoint');
var f=document.getElementById('acc-f'),fs=document.getElementById('acc-fs'),sb=document.getElementById('acc-s'),stx=document.getElementById('acc-st'),
    mail=document.getElementById('acc-mail'),me=document.getElementById('acc-mail-e'),sel=document.getElementById('acc-int'),ie=document.getElementById('acc-int-e'),
    se=document.getElementById('acc-e'),intro=document.getElementById('acc-p'),ok=document.getElementById('acc-ok'),okm=document.getElementById('acc-okm'),
    mb=document.querySelector('.menu-btn'),dr=document.getElementById('drawer'),opener=null,rid=null,busy=false,tm;
var RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function uuid(){if(window.crypto&&crypto.randomUUID)return crypto.randomUUID();return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return (c==='x'?r:(r&3|8)).toString(16)})}
function fld(el,er,msg){el.setAttribute('aria-invalid',msg?'true':'false');er.hidden=!msg;er.textContent=msg||''}
function check(){var v=mail.value.trim(),a=!v?S['mail.empty']:!RE.test(v)?S['mail.invalid']:'',b=sel.value?'':S['int.empty'];
  fld(mail,me,a);fld(sel,ie,b);return a?mail:b?sel:null}
function sending(on){busy=on;fs.disabled=on;if(on){sb.setAttribute('data-state','loading');stx.textContent=S.sending}else{sb.removeAttribute('data-state')}}
function fail(key){sending(false);se.textContent=S[key];se.hidden=false;stx.textContent=S.retry;se.scrollIntoView({block:'nearest',behavior:mo?'smooth':'auto'})}
function done(){sending(false);f.hidden=true;intro.hidden=true;ok.hidden=false;okm.textContent=S.ok.replace('{mail}',mail.value.trim());okm.focus()}
function fresh(){clearTimeout(tm);f.reset();f.hidden=false;intro.hidden=false;ok.hidden=true;se.hidden=true;fld(mail,me,'');fld(sel,ie,'');sending(false);stx.textContent=S.submit;rid=null}
function open(a,interest){opener=a&&a.closest('.drawer')?mb:a;
  if(dr&&dr.classList.contains('open')){dr.classList.remove('open');if(mb)mb.setAttribute('aria-expanded','false')}
  if(!ok.hidden)fresh();                       /* после принятой заявки — новая; иначе введённое сохраняется между открытиями */
  if(interest&&!sel.value)sel.value=interest;
  dlg.showModal();mail.focus()}
[].forEach.call(document.querySelectorAll('[data-acc]'),function(a){a.addEventListener('click',function(e){e.preventDefault();open(a,a.getAttribute('data-interest'))})});
function back(){if(opener&&document.activeElement!==opener)opener.focus()}
function shut(){if(busy)return;if(dlg.open)dlg.close()}
document.getElementById('acc-x').addEventListener('click',shut);
document.getElementById('acc-c').addEventListener('click',shut);
dlg.addEventListener('click',function(e){if(e.target===dlg)shut()});
dlg.addEventListener('cancel',function(e){if(busy)e.preventDefault()});
dlg.addEventListener('close',back);
mail.addEventListener('input',function(){if(mail.getAttribute('aria-invalid')==='true'&&RE.test(mail.value.trim()))fld(mail,me,'')});
sel.addEventListener('change',function(){if(sel.value)fld(sel,ie,'')});
function payload(){var d=new FormData(f),o={request_id:rid,lang:H.lang||'ru',page:location.origin+location.pathname};
  ['email','interest','market','message','lp_extra'].forEach(function(k){o[k]=String(d.get(k)||'').trim()});return o}
function real(){var c=new AbortController(),to=setTimeout(function(){c.abort()},10000);
  fetch(EP,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload()),signal:c.signal})
  .then(function(r){clearTimeout(to);
    if(r.status===201||r.status===200)return r.json().then(function(j){if(j&&j.status==='received')done();else fail('err.net')},function(){fail('err.net')});
    if(r.status===429)return fail('err.limit');
    if(r.status===400)return r.json().then(function(j){sending(false);stx.textContent=S.retry;var x=j&&j.fields||{};
      if(x.email)fld(mail,me,S['mail.invalid']);if(x.interest)fld(sel,ie,S['int.empty']);(x.email?mail:x.interest?sel:sb).focus()},function(){fail('err.net')});
    fail('err.net')})
  .catch(function(){clearTimeout(to);fail('err.net')})}
function sim(){var v=(f.querySelector('input[name=sim]:checked')||{}).value||'ok';
  tm=setTimeout(function(){v==='ok'?done():fail(v==='limit'?'err.limit':'err.net')},mo?900:300)}
f.addEventListener('submit',function(e){e.preventDefault();if(busy)return;se.hidden=true;var bad=check();if(bad){bad.focus();return}
  if(!rid)rid=uuid();sending(true);EP?real():sim()});
/* приёмка: открыть диалог в нужном состоянии */
var q=new URLSearchParams(location.search).get('acc');
if(q){var demoMail='name@example.com';open(null,'');
  if(q==='invalid'){mail.value='name@';check()}
  else if(q==='sending'){mail.value=demoMail;sel.value='research';sending(true)}
  else if(q==='success'){mail.value=demoMail;sel.value='research';done()}
  else if(q==='error'||q==='limit'){mail.value=demoMail;sel.value='resale';document.getElementById('acc-mkt').value='Amazon Германия';
    document.getElementById('acc-msg').value='Чайники из глины, партия около 200 шт. Есть прайс поставщика.';fail(q==='limit'?'err.limit':'err.net')}}
})();
