/* LotPrism · доводка 11 · 4.3 (правка a): у значений S1 Чайника — 7,60 € и 6,90 € — происхождение «по прайсу поставщика» вместо ФАКТ в любом месте карточки #/p/P01, её панелей и строки списка #/products. Остальные ФАКТ не меняются. */
(function(){
'use strict';
const LP=window.LP;if(!LP||!LP.K)return;
const S1=/7,60|6,90/;
function fix(k){if(k.dataset.p11||!/ФАКТ/.test(k.textContent))return;const row=k.closest('li,tr,.sp-pr,.cx-af,.pl-r,.kc')||k.parentElement;if(!row||!S1.test(row.textContent))return;
 k.dataset.p11='1';k.outerHTML=LP.K.PRICE.replace('class="k pp"','class="k pp" data-p11="1"')+(/S1/.test(row.textContent)?'':'<span class="pp-s">S1, прайс 25.09</span>')}
function pp(){const h=location.hash;
 document.querySelectorAll('.pl-r[data-id="P01"] .pl-of .k.f, .pl-r[data-id="P01"] .pl-of .pl-k .k').forEach(fix);
 if(/^#\/p\/P01(\?|$)/.test(h))document.querySelectorAll('#cd .k.f, #panel .k.f').forEach(fix)}
['view','panel'].forEach(id=>{const n=document.getElementById(id);if(n)new MutationObserver(pp).observe(n,{childList:true,subtree:true})});
addEventListener('hashchange',()=>setTimeout(pp,0));
pp();
})();
