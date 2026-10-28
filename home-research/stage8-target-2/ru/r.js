/* Главная с Research: ссылки сценариев «Пример карточки / Пример гипотезы» — переключают сценарий примера и ведут к #example без перезагрузки (href ?p=…#example — запасной вариант без JS). */
(function(){
var H=document.documentElement,mo=H.classList.contains('mo');
[].forEach.call(document.querySelectorAll('a[data-to]'),function(a){a.addEventListener('click',function(e){
  var s=document.getElementById(a.getAttribute('data-to'));if(!s)return;e.preventDefault();
  var v=a.getAttribute('data-go'),b=s.querySelector('[data-set="path"][data-v="'+v+'"][role=radio]');if(b&&b.getAttribute('aria-checked')!=='true')b.click();
  window.scrollTo({top:s.getBoundingClientRect().top+window.pageYOffset-80,behavior:mo?'smooth':'instant'});
  var h=s.querySelector('h2');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}
})});
})();
/* 09 · вопрос по ссылке #access (публичная версия без формы) и любой другой details по адресу — открывается; после загрузки и смены адреса — в поле зрения под шапкой (прокрутка браузера к якорю срабатывает до догрузки разметки выше) */
(function(){function op(e){var d=location.hash&&document.getElementById(decodeURIComponent(location.hash.slice(1)));if(!d||d.tagName!=='DETAILS')return;d.open=true;
if(e)requestAnimationFrame(function(){window.scrollTo({top:d.getBoundingClientRect().top+window.pageYOffset-100,behavior:'instant'})})}
op();addEventListener('load',op);addEventListener('hashchange',op);})();
