/* LotPrism · доводка 2 · ядро: формат, состояние, маршруты, дашборд, карточка, панель, решение, имитация анализа */
(function(){
'use strict';
const D=window.DATA,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const LP=window.LP={D,$,$$};
/* суммы показываются форматтером из cents; исходная строка display сохраняется в display_src только для сверки */
(function norm(o){if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(norm);return}
 if(typeof o.cents==='number'&&typeof o.display==='string'&&/€/.test(o.display)){const n=o.cents<0;let [a,b]=(Math.abs(o.cents)/100).toFixed(2).split('.');a=a.replace(/\B(?=(\d{3})+(?!\d))/g,'\u202F');o.display_src=o.display;o.display=(n?'\u2212':'')+a+','+b+'\u202F€'}
 for(const k in o)if(k!=='display_src')norm(o[k])})(D);
/* ── формат: один форматтер ru-RU, разряды U+202F (+ .g для Onest), минус U+2212 ── */
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function T(h){let svg=0;return h.split(/(<[^>]+>)/).map(p=>{if(p[0]==='<'){if(/^<svg/i.test(p))svg++;else if(/^<\/svg/i.test(p))svg--;return p}let t=p.replace(/(^|[\s(«·\/])-(?=\d)/g,'$1−').replace(/(\d) €/g,'$1\u202F€').replace(/(\d) (%|шт\.|мл|кг|ед\.|дн\.|мес\.|нед\.)/g,'$1\u00A0$2');return t.replace(/(\d)[ \u202F](?=\d{3}(?!\d))/g,svg?'$1\u202F':'$1<span class="g">\u202F</span>')}).join('')}
const eur=c=>{if(c==null)return null;const n=c<0;let [a,b]=(Math.abs(c)/100).toFixed(2).split('.');a=a.replace(/\B(?=(\d{3})+(?!\d))/g,' ');return (n?'−':'')+a+','+b+' €'};
const fdt=iso=>{if(!iso)return '';const m=iso.match(/^\d{4}-(\d\d)-(\d\d)(?:T(\d\d):(\d\d))?/);return m[2]+'.'+m[1]+(m[3]?' '+m[3]+':'+m[4]:'')};
const K={FACT:'<span class="k f">ФАКТ</span>',CALC:'<span class="k c">РАСЧЁТ</span>',SCENARIO:'<span class="k s">СЦЕНАРИЙ</span>',UNKNOWN:'<span class="k u">НЕИЗВЕСТНО</span>',ASSUMED:'<span class="k a">ДОПУЩЕНИЕ</span>',COND:'<span class="k y">УСЛОВНО</span>',CLAIM:'<span class="k cl">ФАКТ · ЗАЯВЛЕНО</span>',FORECAST:'<span class="k p">ПРОГНОЗ</span>',NOT_APPLICABLE:'<span class="kx">не применимо</span>'};
const IC={chv:'<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m3 4.5 3 3 3-3"></path></svg>',
clk:'<svg viewBox="0 0 12 12" fill="none" stroke="#AAB2C2" stroke-width="1.3" aria-hidden="true"><circle cx="6" cy="6" r="5"></circle><path d="M6 3.2V6l2 1.3"></path></svg>',
clkd:'<svg viewBox="0 0 12 12" fill="none" stroke="#AAB2C2" stroke-width="1.3" aria-hidden="true"><circle cx="6" cy="6" r="5" stroke-dasharray="2.2 1.6"></circle><path d="M6 3.2V6l2 1.3"></path></svg>',
na:'<svg viewBox="0 0 12 12" fill="none" stroke="#AAB2C2" stroke-width="1.3" aria-hidden="true"><circle cx="6" cy="6" r="5"></circle><path d="M2.6 9.4 9.4 2.6"></path></svg>',
menu:'<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12"></path></svg>'};
const AVL={prod:'есть в продукте',data:'данные есть, интерфейса нет',svc:'данные есть, интерфейса нет · служебный доступ',dev:'нужна разработка',hyp:'гипотеза · решение Founder',des:'вариант дизайна',none:'статус не задан'};
AVL.no='нет в продукте';
const av=s=>` data-av="${s}" data-avl="${AVL[s]}"`;
Object.assign(LP,{esc,T,eur,fdt,K,IC,av});
/* ── состояние ── */
const S=LP.S={};
function reset(){clearTimeout(S.timer);Object.assign(S,{view:'user',av:false,outcome:'full',dec:{},sim:null,panel:null,pnFrom:null,pnH:'half',x:0,route:'RT-1',price:7.60,sent:false,req:false,open:{},timer:null,pop:null,draft:false})}
reset();
const REG={};D.registry.forEach(r=>REG[r.id]=r);
const E4={};D.charts.E4_price_vs_ceiling.rows.forEach(r=>E4[r.item]=r);
const LIST=['P01','P02','P03','P04','P05','P07','P08','P09','P10','P13','P14','P16','P18'];
const NL=['P06','P12','P15'];
const STEP={P01:'Проверить предложение',P02:'Найти предложение поставщика',P03:'Нужна закупочная цена ниже',P04:'Нужны данные',P05:'Не стоит искать предложение',P07:'Сначала подтвердить предложение',P09:'Определить предел',P10:'Не по этой цене',P13:'Проверить предложение',P14:'Не заниматься',P16:'Проверить предложение',P18:'Недостаточно данных',P06:'Исследование нового листинга идёт',P12:'Отклонено правилом',P15:'Недостаточно данных'};
const VW={CANDIDATE_FOR_FURTHER_CHECK:'Кандидат для проверки',MARKET_OPPORTUNITY:'Рынок: стоит искать предложение',REJECTED:'Отклонено правилом',INSUFFICIENT_DATA:'Недостаточно данных'};
const VX={P02:'Рынок: стоит искать предложение',P05:'Рынок: не стоит искать предложение',P09:'Рынок: стоит искать предложение',P18:'Недостаточно данных',P15:'Недостаточно данных'};
const verdict=id=>E4[id]?VW[E4[id].verdict]:(VX[id]||null);
const IMG='../assets/img/k18.jpg';
const thumb=(id,cls='th')=>id==='P01'?`<img class="${cls}" src="${IMG}" alt="Иллюстрация: заварочный чайник" width="40" height="50">`:`<span class="ph" role="img" aria-label="${esc(REG[id]?REG[id].thumb.alt:'')}"><span aria-hidden="true">${REG[id]?REG[id].thumb.glyph:''}</span></span>`;
Object.assign(LP,{REG,E4,LIST,NL,STEP,verdict,thumb,reset});
/* ── маршруты ── */
function parse(){const h=location.hash.replace(/^#/,'')||'/';const [p,q]=h.split('?');return {p:p||'/',q:new URLSearchParams(q||'')}}
LP.parse=parse;
function setQ(k,v){const r=parse();v==null?r.q.delete(k):r.q.set(k,v);const s=r.q.toString();history.replaceState(null,'','#'+r.p+(s?'?'+s:''))}
LP.setQ=setQ;
function route(){
 const r=parse(),app=$('#app');app.classList.toggle('adm',S.view==='admin');
 shell(r);let html='',m;
 if(r.p==='/'||r.p==='')html=S.view==='admin'?LP.adminDash():dash();
 else if(m=r.p.match(/^\/p\/([A-Z]\d\d)$/))html=card(m[1],r.q);
 else if(r.p==='/research')html=LP.rsEntry();
 else if(m=r.p.match(/^\/research\/(BT-0\d)$/))html=LP.rsLot(m[1]);
 else html=`<main class="main"><h1 class="h1">Адрес не найден</h1><a href="#/">На главную</a></main>`;
 $('#view').innerHTML=T(html);
 const pid=m&&r.p.startsWith('/p/')?m[1]:null;S.pid=pid;
 const pq=r.q.get('panel');
 if(pid&&pq&&['calc','assistant','sources'].includes(pq)){if(!S.pnFrom)S.pnFrom={calc:'calc-btn',assistant:'as-btn',sources:'src-btn'}[pq];S.panel=pq;renderPanel();openPanel(false)}else if(!pid){closePanel(false)}else if(!pq&&S.panel){closePanel(false)}
 LP.mountCharts&&LP.mountCharts($('#view'));
 proto();
}
LP.route=route;
/* ── оболочка ── */
const GR=[['Товары',[['Перепродажа','#/p/P01','13'],['Новый листинг','#/p/P06']]],['Поставщики',[['Предложения и прайсы'],['Задания ассистента']]],['Деньги',[['Закупки и продажи'],['Результаты']]],['Пространство',[['Источники данных'],['Команда и настройки']]]];
function shell(r){
 const adm=S.view==='admin';
 const rs=r.p.startsWith('/research');
 const pr=$('#proto');if(pr&&$('#top').contains(pr))document.body.appendChild(pr);
 $('#top').innerHTML=T(`<a class="logo" href="#/" aria-label="LotPrism — главная"><img src="../assets/logo.svg" alt="LotPrism" width="144" height="19"></a>`+
 (adm?`<div class="ws"><b>Все пространства</b><span>без данных клиентов</span></div><span class="sp"></span><span class="tag">Администрирование</span><span class="user"><i>F</i>Founder</span>`:
 rs?`<div class="ws"><b>Research</b><span>инструмент оптовика: партии и покупатели</span></div><span class="sp"></span><a class="tool" href="#/">← LotPrism · перепродажа и новый листинг</a><span class="user"><i>ИБ</i>Ирина Беккер</span>`:
 `<div class="ws"><b>Demo-Handel GmbH</b><span>Amazon Германия · EUR</span></div><span class="sp"></span><a class="tool" href="#/research"${av('hyp')}>LotPrism Research ↗</a><span class="user"><i>ИБ</i>Ирина Беккер</span>`)+
 `<button class="mnav" type="button" data-act="mnav" aria-expanded="false" aria-controls="rail" aria-label="Разделы">${IC.menu}</button>`);
 if(pr)($('#top .ws')||$('#top .logo')).after(pr);
 $('#band').innerHTML=adm?T(`<div class="adm-band"><b>Платформа LotPrism · администратор</b><span class="t2">частные данные клиентов скрыты</span></div>`):'';
 const cur=r.p.startsWith('/p/')?(NL.includes(r.p.slice(3))?'Новый листинг':'Перепродажа'):'';
 $('#rail').innerHTML=rs&&!adm?T(`<div class="rg"><span class="eyebrow">Research</span><a href="#/research"${r.p==='/research'?' aria-current="page"':''}>Партии по запросу</a><a href="#/research/BT-01"${r.p==='/research/BT-01'?' aria-current="page"':''}>Партия, Познань</a></div><div class="rg"><a href="#/">← Вернуться в LotPrism</a></div>`):
 adm?T(`<div class="rg"><span class="eyebrow">Платформа</span><a href="#/"${r.p==='/'?' aria-current="page"':''}>Состояние платформы</a><a href="#/p/P01"${r.p.startsWith('/p/')?' aria-current="page"':''}>Карточка рынка · Чайник</a></div>`):
 T(`<div class="rg"><a href="#/"${r.p==='/'?' aria-current="page"':''}>Главная</a></div>`+GR.map(([g,it])=>`<div class="rg"><span class="eyebrow">${g}</span>`+it.map(([n,h,c])=>h?`<a href="${h}"${n===cur?' aria-current="page"':''}>${n}${c?`<span class="c">${c}</span>`:''}</a>`:`<a href="#/" data-act="na" data-what="${n}">${n}</a>`).join('')+`</div>`).join(''));
}
/* доводка 3: «Требует вашего действия» — объект → изменение → препятствие → действие */
function attn3(){const it=(o)=>`<li class="it3${o.go?' click':''}"${o.go?` data-go="${o.go}"`:''}${o.av}><div class="it-m">${o.media}</div><div class="it-c"><p class="it-t"><b>${o.t}</b>${o.dl?`<span class="it-dl">${o.dl}</span>`:''}</p><p class="it-ch">${o.ch}</p><p class="it-ob"><span class="it-ol">${o.ol||'мешает:'}</span>${o.ob}</p>${acc(o.id,'<span class="sq">подробнее</span>',o.more)}</div><div class="it-a">${o.act}</div></li>`;
 return `<ul class="rows it3-l">${it({id:'a1',go:'#/research/BT-01',av:av('hyp'),media:'<img class="th" src="../assets/img/q16.jpg" alt="Иллюстрация: кухонная утварь" width="40" height="50">',t:'Партия кухонных товаров, Познань',dl:'до 08.10 18:00',
  ch:'Предложение продавца действует до <span class="n">08.10 18:00</span>; интерес покупателя к паллетам 1 и 3 — необязывающий',
  ob:'<span class="ms u">количество — не названо</span><span class="ms u">твёрдая цена — не названа</span>',
  more:'<p class="t2">14 позиций, 6 паллет · Research. Один покупатель проявил необязывающий интерес, количество не назвал — это не подтверждённый спрос. Черновик обращения подготовлен, не отправлен.</p>',
  act:'<a class="btn btn-s" href="#/research/BT-01">Открыть в Research ↗</a>'})}
${it({id:'a2',go:'#/p/P01',av:av('dev'),media:thumb('P01'),t:'Чайник заварочный, глина, 400 мл',
  ch:'Предложение <span class="n">7,60 €</span> ниже предела <span class="n">9,60 €</span>; разница <span class="n">2,00 €</span> — не прибыль',
  ob:'<span class="ms u">число посылок — неизвестно</span><span class="ms chk">объём 400 / 450 мл — образец не проверен</span>',
  more:'<p class="t2">Все цены без НДС. Расчётный предел — при доходности 30 % — значение по умолчанию, как порог не утверждено. Предложение получено 25.09; '+(S.dec.P01?'ваше решение: «'+S.dec.P01.v+'» · сейчас':'решения по текущей версии нет')+'.</p>',
  act:'<a class="btn btn-p" href="#/p/P01">Открыть карточку</a>'})}
${it({id:'a3',av:av('prod'),media:`<span class="it-glyph" role="img" aria-label="не обновлено">${IC.clkd}</span>`,t:'Данные рынка не обновились',dl:'30.09 23:40',
  ch:'Обновление Keepa · кухня не удалось; у 11 товаров данные на <span class="n">30.09 18:05</span>, у Хлебницы — на <span class="n">19.09</span>',
  ol:'затронуто:',ob:'<span>Чайник, Мельница, Салатница и ещё 9</span>',
  more:'<p class="t2">Новые наблюдения не приходят: 12 товаров источника Keepa · кухня: у 11 данные на 30.09 18:05, у Хлебницы — 19.09 21:00. Например, Чайник: предел 9,60 € посчитан по цене листинга 24,90 € на 30.09 18:05. Если цена после этого изменилась, вывод её не учитывает.</p>',
  act:`<a class="btn btn-s" href="#/p/P01?filter=ds1"${av('dev')}>Показать 12 товаров</a><button class="btn btn-s" type="button" data-act="na" data-what="Обновить данные" aria-describedby="upd-why"${av('dev')}>Обновить данные</button><span class="why" id="upd-why">расход неизвестен</span>`})}</ul>`}
/* ── дашборд пользователя ── */
function dash(){
 const ch=D.dashboard.changes,mat=ch.filter(c=>c.material_change===true),rest=ch.filter(c=>c.material_change!==true);
 const cp=D.dashboard.capital;
 const chRow=c=>{const t=`<span class="tm">${fdt(c.at)}</span><b style="font-weight:500">${esc(c.what.split(':')[0])}</b><span>${esc(c.what.split(':').slice(1).join(':').trim()||c.what)}</span>`;return c.item&&LIST.concat(NL).includes(c.item)?`<li><button class="chg" type="button" data-go="#/p/${c.item}">${t}</button></li>`:`<li class="chg">${t}</li>`};
 return `<main class="main" id="main">
<div class="pg-h"><h1 class="h1">Главная</h1><p class="t2">Ирина Беккер · Demo-Handel GmbH · Amazon Германия · EUR · на 01.10.2026 10:00</p></div>
<section class="sec" aria-labelledby="s1"><div class="sec-h"><h2 class="h2" id="s1">Требует вашего действия</h2><p class="t2">порядок — по сроку и давности; приоритета LotPrism не задаёт</p></div>
${attn3()}
<div class="quiet"${av('hyp')}><span class="eyebrow">Пространство и доступ</span><span>Ана Гарсия: второй фактор начат 28.09, не подтверждён</span><button class="lnk" type="button" data-act="na" data-what="Команда">Команда</button></div></section>
<section class="sec" aria-labelledby="s2"><div class="sec-h"><h2 class="h2" id="s2">Новые карточки 24–30.09</h2><p class="t2">сгруппированы по шагу LotPrism; оценки «стоит / не стоит» нет</p></div>
<ul class="rows">
${ncRow('P16','Проверить предложение','Кандидат для проверки',`<span>Предложение <b class="n">6,95 €</b> ${K.FACT}</span><span>предел <b class="n">8,05 €</b> ${K.CALC}</span><span>разница <b class="n">1,10 €</b> ${K.CALC}</span><span class="t2">все без НДС</span><span class="t2" style="flex-basis:100%"${av('data')}>Решения по текущей версии нет · по прежней версии вы записали «Отложить» 30.09 10:05 · изменение с тех пор несущественное: продавцов 3 → 4</span>`)}
${ncRow('P09','Определить предел','Рынок: стоит искать предложение',`<span>Предел <span class="ms u">неизвестно</span></span><span class="t2">нет оценки FBA</span>`)}
${ncRow('P07','Сначала подтвердить предложение','Недостаточно данных',`<span>Предложение <b class="n">3,20 €</b> ${K.COND}</span><span class="t2">за штуку или за упаковку — не подтверждено</span><span>предел <b class="n">3,88 €</b></span><span class="t2">без НДС</span>`)}
<li>${acc('nc3','ещё 3 · Форма для выпечки, Овощерезка-мандолина, Сковорода чугунная',`<ul>${ncRow('P04','Нужны данные','',`<span class="t2">Форма для выпечки, 26 см</span>`)}${ncRow('P14','Не заниматься','Отклонено правилом','')}${ncRow('P10','Не по этой цене','Отклонено правилом',`<span class="t2">ваше решение «Отклонить», 27.09</span>`)}</ul>`)}</li>
</ul>
<div class="line1"><span class="eyebrow">Новый листинг</span><span>2 новые гипотезы: <button class="lnk" type="button" data-go="#/p/P12">Дозатор для мыла</button> — отклонено правилом; <button class="lnk" type="button" data-go="#/p/P15">Баночки для специй</button> — недостаточно данных</span></div>
<div class="line1"${av('hyp')}><span class="eyebrow">Research</span><span>4 новые партии: 1 соответствует запросу с оговоркой, 3 не соответствуют</span><a href="#/research" style="margin-left:auto">Открыть в Research ↗</a></div></section>
<section class="sec" aria-labelledby="s3"${av('hyp')}><div class="sec-h"><h2 class="h2" id="s3">Ассистент: завершено и идёт</h2></div>
<div class="asg"><article class="as"><div class="item">${thumb('P01')}<div class="tx"><span class="eyebrow">Завершено</span><b>Поиск поставщиков для Чайника</b></div></div>
<dl class="dl2"><dt>Кто выполнял</dt><dd>команда LotPrism</dd><dt>Ожидалось</dt><dd>оптовые предложения в ЕС по коду листинга, до 100 шт.</dd><dt>Ход</dt><dd><span class="mono">21.09 09:30</span> → итог <span class="mono">24.09 16:10</span></dd><dt>Найдено</dt><dd>4 предложения: Чехия — код совпал; Польша — кода нет; Германия, розница — только сравнение; Китай — проверить не удалось</dd></dl>
<a href="#/p/P01?panel=assistant">Открыть итог</a></article>
<article class="as"><div class="item"><img class="th" src="../assets/img/k15.jpg" alt="Иллюстрация: стеклянные банки" width="40" height="50"><div class="tx"><span class="eyebrow">Идёт · новый листинг</span><b>Исследование «Банки стеклянные разного объёма»</b></div></div>
<dl class="dl2"><dt>Ожидаемый результат</dt><dd><span class="ms u">в данных не указан</span></dd><dt>Ход</dt><dd>последняя отметка <span class="mono">30.09 10:20</span></dd><dt>Основания</dt><dd>пока нет</dd></dl>
<p class="t2">Лимит исследований исчерпан до 03.10 09:00 — что будет с идущим исследованием, не определено.</p></article></div></section>
<section class="sec" aria-labelledby="s4"${av('dev')}><div class="sec-h"><h2 class="h2" id="s4">Что изменилось 24.09–01.10</h2><p class="t2">сначала ${mat.length} изменения, которые меняют вывод или шаг · всего ${ch.length}</p></div>
<ul class="rows">${mat.map(chRow).join('')}<li>${acc('chg12','ещё '+rest.length,`<ul>${rest.map(chRow).join('')}</ul>`)}</li></ul></section>
<section class="sec" aria-labelledby="s5">${LP.d1Chart()}</section>
<section class="sec" aria-labelledby="s6"${av('prod')}><div class="sec-h"><h2 class="h2" id="s6">Капитал</h2></div>
<div class="capital"><div><p class="eyebrow">Вложено за всё время</p><p class="v">${eur(cp.lifetime_committed.cents)} ${K.FACT}</p><p class="t2">${cp.purchase_count} закупки, с доставкой от поставщика</p></div><span class="sep">величины не складываются</span><div><p class="eyebrow">Сумма закупки открытых позиций</p><p class="v">${eur(cp.open_cost_basis.cents)} ${K.FACT}</p><p class="t2">${cp.open_position_count} позиция, без доставки</p></div></div></section>
</main>`}
function ncRow(id,step,vd,vals){return `<li><button class="nc" type="button" data-go="#/p/${id}"><span class="st"><b>${step}</b><span class="t2">${vd}</span></span><span class="item">${thumb(id)}<span class="tx"><b>${esc(REG[id].title_ru)}</b></span></span><span class="vals">${vals}</span></button></li>`}
/* раскрытие: высота между измеренными значениями + opacity */
function acc(id,label,inner,open){const o=open||S.open[id];return `<button class="acc-t" type="button" data-act="acc" aria-expanded="${o?'true':'false'}" aria-controls="acc-${id}" data-id="${id}"><span>${label}</span><span class="chev" aria-hidden="true">${IC.chv}</span></button><div class="acc-b" id="acc-${id}" ${o?'':'hidden'}>${inner}</div>`}
LP.acc=acc;
function toggleAcc(b){const id=b.dataset.id,el=$('#acc-'+id),open=b.getAttribute('aria-expanded')!=='true';S.open[id]=open;b.setAttribute('aria-expanded',open);const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const from=el._a&&!el.hidden?el.getBoundingClientRect().height:null;if(el._a)el._a.cancel();
 if(open){el.hidden=false;if(rm)return;const h=el.scrollHeight;el._a=el.animate([{height:(from==null?0:from)+'px',opacity:from==null?0:1},{height:h+'px',opacity:1}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});el._a.onfinish=()=>el._a=null}
 else{if(rm){el.hidden=true;return}const h=from==null?el.offsetHeight:from;el._a=el.animate([{height:h+'px',opacity:1},{height:'0px',opacity:0}],{duration:160,easing:'cubic-bezier(.23,1,.32,1)'});el._a.onfinish=()=>{el.hidden=true;el._a=null}}}
/* ── карточка ── */
function listHtml(cur,q){const f=q.get('filter')==='ds1';const ids=f?LIST.filter(i=>REG[i].freshness.source==='DS1'):LIST;
 return `<aside class="lst" id="lst" aria-label="Перепродажа"><div class="lst-strip"><button class="btn btn-s sm" type="button" data-act="lstopen">Список</button></div>
<div class="lst-h"${f?av('dev'):''}><div class="r"><b>Перепродажа · ${f?ids.length+' из '+LIST.length:LIST.length}</b>${f?`<a class="t2" href="#/p/${cur}">Все ${LIST.length}</a>`:`<a class="t2" href="#/">Главная</a>`}<button class="x lst-x" type="button" data-act="lstopen" aria-label="Закрыть список">×</button></div>${f?'<span class="t2">данные на 30.09 18:05 · у Хлебницы — 19.09 21:00</span>':''}</div>
<div role="listbox" aria-label="Товары" id="lbx"${av('dev')}>${ids.map(i=>`<div class="li" role="option" id="li-${i}" data-id="${i}" tabindex="${i===cur?0:-1}" aria-selected="${i===cur}">${thumb(i)}<span class="tx"><b>${esc(REG[i].title_ru)}</b><small>${i==='P13'?`<span class="ms nu">${IC.clkd}не обновлено</span> · `:''}${S.dec[i]?'ваше решение «'+S.dec[i].v+'» · сейчас':esc(STEP[i]||'')}</small></span></div>`).join('')}</div></aside>`}
LP.listHtml=listHtml;
function card(id,q){
 if(!REG[id])return `<main class="main"><p>Товар не найден.</p></main>`;
 if(S.view==='admin')return LP.adminCard(id);
 const inList=LIST.includes(id);
 return `<div class="w-list">${inList?listHtml(id,q):`<aside class="lst" aria-label="Новый листинг"><div class="lst-h"><div class="r"><b>Новый листинг</b><a class="t2" href="#/">Главная</a></div></div><div role="listbox" aria-label="Новый листинг">${NL.map(i=>`<div class="li" role="option" tabindex="${i===id?0:-1}" data-id="${i}" aria-selected="${i===id}">${thumb(i)}<span class="tx"><b>${esc(REG[i].title_ru)}</b><small>${STEP[i]}</small></span></div>`).join('')}</div></aside>`}
<main class="cd" id="cd" aria-labelledby="cd-h1">${id==='P01'?p01():gen(id)}</main></div>${S.view==='user'?(id==='P01'&&!(S.sim&&S.sim.phase!=='done')?`<div class="mbar mbar3" hidden>${reqBtn('mreq-btn')}</div>`:`<div class="mbar" hidden><button class="btn btn-p" type="button" data-act="decide" data-pf="mbar">Записать решение</button><span class="t2">решение не разрешает тратить капитал</span></div>`):''}`}
function head(id,extra){const r=REG[id];return `<div class="cd-h"><figure>${id==='P01'?`<img class="pic" src="${IMG}" alt="" width="56" height="70"><figcaption class="illu">иллюстрация</figcaption>`:`<span class="ph pic" role="img" aria-label="${esc(r.thumb.alt)}" style="font-size:var(--f18)"><span aria-hidden="true">${r.thumb.glyph}</span></span>`}</figure>
<div class="ttl">${NL.includes(id)?'<span class="eyebrow">новый листинг</span>':''}<h1 class="h1" id="cd-h1" style="font-size:var(--f22)"${av('dev')}>${esc(r.title_ru)}</h1><p class="orig" title="${esc(r.title_listing)}">${esc(r.title_listing.split(' – ')[0])}…</p><p class="t2">Amazon Германия · EUR · ${NL.includes(id)?'новый листинг':'перепродажа'}${extra||''}</p></div>
<div class="acts"><button class="btn btn-s sm" type="button" data-act="panel" data-tab="sources" data-pf="src-btn">Источники и история</button><button class="btn btn-s sm" type="button" data-act="lstopen" style="display:none" id="mlist">Список</button></div></div>`}
function decStrip(id,ver){const d=S.dec[id];const r=REG[id];let yours;
 if(d)yours=`<span class="sv">${d.v} · Ирина Беккер · сейчас · ${ver}</span>`;
 else if(r.decision_on_previous_version)yours=`<span class="sv">решения по текущей версии нет</span><span class="sn"${av('data')}>${esc(r.decision_on_previous_version.display_ru)}</span>`;
 else if(r.decision)yours=`<span class="sv">«${r.decision.value_ru}» · ${fdt(r.decision.at)}</span><span class="sn">${r.decision.note?esc(r.decision.note):''}</span>`;
 else yours=`<span class="sv">не записано</span><span class="sn">${ver}</span>`;
 return `<div class="dec" id="dec" data-just="${d&&d.just?1:0}"${av('data')}><div><span class="eyebrow">Рекомендация</span><span class="sv">${esc(verdict(id)||STEP[id])} — исследовательский вывод</span><span class="sn">рекомендация посчитана по сохранённым данным — это не разрешение покупать, выставлять на продажу или вкладывать капитал</span></div>
<div class="yours"${av('prod')}><span class="eyebrow">Ваше решение</span>${yours}</div>
<div><span class="eyebrow">Разрешение тратить капитал</span><span class="sv">вне системы, не записано</span><span class="sn">Решение не разрешает тратить капитал</span></div>
<div class="dec-btn"><button class="btn btn-p" type="button" data-act="decide" data-pf="dec-btn">Записать решение</button><button class="lnk" type="button" data-act="acc-open" data-id="st7" style="font-size:var(--f13);margin-top:8px">Ещё 4 стадии</button></div></div>`}
/* ── доводка 3: эталон карточки P01 ── */
const REQ_L='Запросить у S1: посылки, объём, образец',REQ_W='Ожидает ответа S1 · имитация';
function reqBtn(pf,cls){const w=S.req;return `<span class="req-w"><button class="btn btn-p${cls||''}" type="button" data-act="${w?'reqwait':'req'}" data-pf="${pf}" id="${pf}"${w?' aria-disabled="true" aria-describedby="ob-st1"':''} data-av="no" data-avl="нет в продукте"><span class="req-l" aria-hidden="true">${REQ_L}</span><span class="req-v">${w?REQ_W:REQ_L}</span></button><span class="req-tag">имитация · в продукте нет</span></span>`}
function p01v3(){const E=D.P01_offer_economics,sim=S.sim,done=sim&&sim.phase==='done';
 const fl=done?' flash':'';const upd=done?' <span class="upd">обновлено</span>':'';const ver=done?'по оценке от 25.09':'по оценке от 28.09';
 const rqs=i=>S.req?`<span class="ob-st"${i===1?' id="ob-st1"':''}>запрос подготовлен · ответа нет · имитация</span>`:'';
 const sg=D.P01_explanation_v1.signals.filter(s=>s.role==='decided');
 const nu=`<span class="ms nu" style="font-size:var(--f13)">${IC.clkd}не обновлено · данные на 30.09 18:05</span>`;
 return (sim?`<div class="sim-band" role="note"><b>ИМИТАЦИЯ</b><span>воспроизведение истории Чайника 21.09–25.09 на демоданных; время сжато; в продукте поиск выполняет команда LotPrism, запуск пользователем — план</span><button class="btn btn-s sm" type="button" data-act="simexit">Вернуться к текущему состоянию (28.09)</button></div>`:'')+head('P01',' · оценка от '+(done?'25.09 10:20':'28.09 08:30')+(done?'':'<span class="m-sep"> · </span><br class="m-br">'+nu))+`<section class="hero hero3" aria-label="Вывод и экономика за 1 шт., без НДС"${av('prod')}>
<div class="h3-vd"><span class="pill">Кандидат для проверки</span><p class="vd-t">Предложение ниже расчётного предела, но закупка не готова: полная себестоимость неизвестна, объём не подтверждён.</p></div>
<div class="kpi" role="list" aria-label="Ключевые числа за 1 шт., без НДС">
<div class="kc kc-big" role="listitem"><span class="kl">${K.FACT}предложение</span><span class="kn${fl}" data-fl>7,60 €</span><span class="kx">прайс S1, 25.09</span></div>
<div class="kc kc-big" role="listitem"><span class="kl">${K.CALC}<span class="lng">расчётный </span>предел</span><span class="kn">9,60 €</span><span class="kx">при 30 %, не утверждён · <button class="lnk lnk-in" type="button" data-act="panel" data-tab="calc" data-pf="calc-btn">как посчитан</button></span></div>
<div class="kc" role="listitem"><span class="kl">${K.CALC}разница</span><span class="kn${fl}" data-fl>2,00 €</span><span class="kx">не прибыль</span></div>
<div class="kc" role="listitem"><span class="kl">полная себестоимость</span><span class="kn kn-u"><span class="unk">неизвестно</span></span><span class="kx">посылки, подготовка, хранение, возвраты</span></div>
<div class="kbar"><div class="bar" role="img" aria-label="предложение составляет ${E.bar_offer_to_ceiling_pct} % расчётного предела"><i style="width:${E.bar_offer_to_ceiling_pct}%"></i></div><div class="kbar-l"><span>предложение · расчётный предел</span>${upd}</div></div></div>
<div class="obs3"><h2 class="h3" id="ob-h">Что мешает закупке</h2><ul class="ob-l" aria-labelledby="ob-h">
<li${av('dev')}><span class="ob-g"><span class="ms chk" aria-hidden="true"></span></span><div><p class="ob-t">Объём не совпадает · <span class="t2">не разрешено, образец обязателен</span></p><p class="ob-d">В прайсе S1 — 450 мл, на листинге — 400 мл. Если образец покажет 450 мл, предложение отпадает.</p>${rqs(1)}</div></li>
<li${av('prod')}><span class="ob-g"><span class="ms u" role="img" aria-label="неизвестно"></span></span><div><p class="ob-t">Доставка не посчитана · <span class="t2">6,90 € за посылку, число посылок на 60 шт. не указано</span></p><p class="ob-d">Выплата при мин. заказе и результат после доставки — неизвестно. Известная часть выплаты — 549,54 € ${K.SCENARIO}; результат по учтённой стоимости 293,40 € ${K.SCENARIO} — до доставки.</p>${rqs(2)}</div></li></ul>
<p class="ob-n">И с доставкой себестоимость останется неполной: подготовка, хранение, возвраты не учтены.</p></div>
<div class="acts3" role="group" aria-label="Следующий шаг">${S.view==='user'?reqBtn('req-btn',' req-main'):''}<button class="btn btn-s" type="button" data-act="decide" data-pf="dec-top"${S.view==='user'?'':' aria-disabled="true"'}>Записать решение</button></div>
</section>
<div class="u2 more3">
<section${av('prod')}>${acc('fnd','<span class="sq">Основания</span><span class="tot">4 показания · источник следующего шага · ассистент</span>',`<ul class="rd">${sg.map(s=>`<li><span class="v">${esc(s.value)}</span><span class="l">${esc(s.line)}</span><span style="white-space:nowrap">${K[s.kind]} <span class="mono t2">${fdt(s.provider_answered_at)}</span></span></li>`).join('')}<li><span class="v">7,60 €</span><span class="l">закупочная цена, без НДС</span><span style="white-space:nowrap">${K.FACT} <span class="mono t2">25.09 10:20</span></span></li></ul>
<p class="t2">Справочно: цена за 90 дней 23,90–25,90 € с НДС · куплено 300+ за прошлый месяц — нижняя граница, 26.09</p>
<p class="t2">Следующий шаг — из итога исследования «Поиск поставщиков» 24.09; LotPrism этот шаг не вычислял.</p>
<p${av('hyp')}>Ассистент: Поиск поставщиков · выполняла команда LotPrism · 21.09 → 24.09 · 4 предложения, условно сопоставимы два · <button class="lnk" type="button" data-act="panel" data-tab="assistant" data-pf="as-btn">Открыть итог</button></p>`)}</section>
<section${av('prod')}>${acc('par','<span class="sq">Параметры расчёта</span><span class="tot">мин. заказ 60 шт. · 456,00 € · выплата и результат — сценарий</span>',`<dl class="kv">
<div><dt>Минимальный заказ 60 шт., товар</dt><span class="kd">${K.CALC}<span class="kx">без НДС</span></span><dd>${E.goods_at_moq.display}</dd></div>
<div><dt>Выплата поставщику, известная часть</dt><span class="kd">${K.SCENARIO}<span class="kx">с НДС 19 % DE; полная — неизвестно</span></span><dd>${E.cash_known.display}</dd></div>
<div><dt>Результат по учтённой стоимости</dt><span class="kd">${K.SCENARIO}<span class="kx">без НДС; после доставки — минус X посылок × 6,90 €, X неизвестен</span></span><dd>${E.lot_result_counted.display}</dd></div>
<div><dt>Остаток на единицу по известным статьям</dt><span class="kd">${K.CALC}</span><dd>${E.left_per_unit_at_offer.display}</dd></div>
<div><dt>Расчётный предел</dt><span class="kd">${K.CALC}<span class="kx">при доходности 30 % — значение по умолчанию, как порог не утверждено</span></span><dd>9,60 €</dd></div></dl>`)}</section>
<section${av('none')}>${acc('same','<span class="sq">Тот же товар? и прочие ограничения</span><span class="tot">EAN совпал · прочие расходы — неизвестно</span>',`<ul class="lm"><li><span class="lt">Тот же товар?</span><p>Вывод верен, только если это тот же товар. У поставщика совпал код EAN, упаковка 1 шт. ${K.FACT} Совпадение кода ≠ проверка товара.</p></li>
<li><span class="lt">${K.UNKNOWN} Прочие расходы</span><p>Подготовка, хранение, возвраты, реклама → полный результат неизвестен.</p></li>
<li${av('prod')}><span class="lt">${nu}</span><p>Обновление 30.09 23:40 не удалось.</p></li></ul>`)}</section>
<section${av('prod')}><button class="acc-t" type="button" data-act="panel" data-tab="sources" data-pf="hist-btn"><span class="sq">История и источники</span><span class="tot">открывается в панели справа</span><span class="ext" aria-hidden="true">↗</span></button></section>
</div>
<div class="dec3">${decStrip('P01',ver)}</div>
<div class="u2">
<section${av('dev')}>${acc('pc','<span class="sq">Насколько устойчива цена, от которой посчитан предел?</span><span class="tot">90 дней: 23,90–25,90 € с НДС</span>',LP.priceChart(),true)}</section>
<section${av('dev')}>${acc('cmp','<span class="sq">Какие предложения сопоставимы и где они относительно предела?</span><span class="tot">без оговорок не сопоставимо ни одно, условно — два</span>',LP.cmpChart('c1'))}</section>`+p01tail(false,done?'25.09':'28.09')}
function p01(){
 const sim=S.sim,pre=sim&&sim.phase!=='done';const E=D.P01_offer_economics;
 if(!pre&&S.view==='user')return p01v3();
 const fl=sim&&sim.phase==='done'?' flash':'';const upd=sim&&sim.phase==='done'?' <span class="upd">обновлено</span>':'';
 const band=sim?`<div class="sim-band" role="note"><b>ИМИТАЦИЯ</b><span>воспроизведение истории Чайника 21.09–25.09 на демоданных; время сжато; в продукте поиск выполняет команда LotPrism, запуск пользователем — план</span><button class="btn btn-s sm" type="button" data-act="simexit">Вернуться к текущему состоянию (28.09)</button></div>`:'';
 const done=sim&&sim.phase==='done';const ver=pre?'по оценке от 21.09':done?'по оценке от 25.09':'по оценке от 28.09';const vtx=pre?'21.09':done?'25.09':'28.09';
 const left=pre?`<span class="pill">Рынок: стоит искать предложение</span><p class="vd-t">Рынок держится; предложения поставщика нет. Следующий шаг — найти предложение поставщика.</p>
<p class="pair"><span class="ms u" style="font:500 var(--f18) Onest">предложение — нет</span><small>предел</small><span>9,60 €</span></p><div class="bar"></div><div class="bar-l"><span>закупочная цена — неизвестно</span><span>расчётный предел</span></div>
<dl class="kv"><div><dt>Расчётный предел</dt><span class="kd">${K.CALC}<span class="kx">при доходности 30 % — значение по умолчанию, как порог не утверждено</span></span><dd>9,60 €</dd></div><div><dt>Предложение</dt><span class="kd"><span class="ms u">нет</span></span><dd></dd></div></dl>`
 :`<span class="pill">Кандидат для проверки</span><p class="vd-t">Предложение поставщика ниже расчётного предела, но к закупке пока не готово: неизвестна доставка партии.</p>
<p class="pair${fl}" data-fl><span>7,60 €</span><small>из</small><span>9,60 €</span>${upd}</p><div class="bar"><i style="width:${E.bar_offer_to_ceiling_pct}%"></i></div><div class="bar-l"><span>предложение</span><span>расчётный предел</span></div>
<p class="diff${fl}" data-fl>Разница <b class="n">2,00 €</b> до неучтённых расходов — это не прибыль ${K.CALC}</p>
<dl class="kv"><div><dt>Предложение</dt><span class="kd">${K.FACT}<span class="kx">прайс поставщика, 25.09</span></span><dd>7,60 €</dd></div><div><dt>Расчётный предел</dt><span class="kd">${K.CALC}<span class="kx">при доходности 30 % — значение по умолчанию, как порог не утверждено</span></span><dd>9,60 €</dd></div></dl>
<p class="t2" style="color:var(--ink)"${av('prod')}>Минимальный заказ 60 шт.: товар 456,00 € без НДС ${K.CALC} · плюс доставка <span class="ms u">неизвестно</span></p>`;
 const right=pre?`<span class="eyebrow">Чего пока недостаточно</span><ul class="lm"><li><span class="lt">${K.UNKNOWN} Закупочная цена</span><p>предложения поставщика нет · до анализа</p></li><li><span class="lt">${K.UNKNOWN} Прочие расходы</span><p>Подготовка, хранение, возвраты, реклама → полный результат неизвестен.</p></li></ul><span class="eyebrow">Что я могу сделать дальше</span><p class="nx">Найти предложение поставщика не дороже 9,60 € без НДС за шт.</p>`
 :`<span class="eyebrow">Чего пока недостаточно</span><ul class="lm">
<li><span class="lt">Тот же товар?</span><p>Вывод верен, только если это тот же товар. У поставщика совпал код EAN, упаковка 1 шт. ${K.FACT} Совпадение кода ≠ проверка товара.</p></li>
<li><span class="lt">${K.UNKNOWN} Доставка партии</span><p>6,90 € за посылку, число посылок на 60 шт. не указано → полная выплата и результат после доставки неизвестны.</p></li>
<li><span class="lt">${K.UNKNOWN} Прочие расходы</span><p>Подготовка, хранение, возвраты, реклама → полный результат неизвестен.</p></li>
<li${av('dev')}><span class="lt"><span class="ms chk">ещё не проверено</span> · Образец</span><p>В прайсе 450 мл, на листинге 400 мл; если 450 мл — предложение отпадает.</p></li>
<li${av('prod')}><span class="lt"><span class="ms nu">${IC.clkd}не обновлено</span></span><p>Данные рынка на 30.09 18:05: обновление 30.09 23:40 не удалось.</p></li></ul>
<span class="eyebrow">Что я могу сделать дальше</span><p class="nx${fl}" data-fl>Уточнить у поставщика число посылок на 60 шт. и объём (400 или 450 мл), запросить образец</p><p class="t2">из итога исследования «Поиск поставщиков» 24.09; LotPrism этот шаг не вычислял</p>`;
 const sg=D.P01_explanation_v1.signals.filter(s=>s.role==='decided');
 return band+head('P01',' · оценка от '+(pre?'21.09 07:05':done?'25.09 10:20':'28.09 08:30'))+`<section class="hero" aria-label="Вывод и экономика за 1 шт., без НДС"${av('prod')}><div>${left}<button class="lnk" type="button" data-act="panel" data-tab="calc" data-pf="calc-btn">Как посчитан предел</button></div><div>${right}</div></section>
<div class="quiet3"><section aria-labelledby="why-h"${av('prod')}><h2 class="eyebrow" id="why-h">Почему такой вывод</h2><ul class="rd" style="margin-top:8px">${sg.map(s=>`<li><span class="v">${esc(s.value)}</span><span class="l">${esc(s.line)}</span><span style="white-space:nowrap">${K[s.kind]} <span class="mono t2">${fdt(s.provider_answered_at)}</span></span></li>`).join('')}${pre?'':`<li><span class="v">7,60 €</span><span class="l">закупочная цена, без НДС</span><span style="white-space:nowrap">${K.FACT} <span class="mono t2">25.09 10:20</span></span></li>`}</ul>
<p class="t2" style="margin-top:8px">Справочно: цена за 90 дней 23,90–25,90 € с НДС · куплено 300+ за прошлый месяц — нижняя граница, 26.09${sim?' · <span class="tag">данные на 30.09</span>':''}</p></section>
<section aria-labelledby="as-h"${av('hyp')}><h2 class="eyebrow" id="as-h">Ассистент</h2>${pre?'<p class="t2" style="margin-top:8px">заданий нет · до анализа</p>':'<p style="margin-top:8px">Поиск поставщиков · выполняла команда LotPrism · 21.09 → 24.09 · 4 предложения, условно сопоставимы два</p>'}<button class="lnk" type="button" data-act="panel" data-tab="assistant" data-pf="as-btn">Открыть итог</button></section></div>
${decStrip('P01',ver)}
<div class="u2">
<section${av('dev')}>${acc('pc','<span class="sq">Насколько устойчива цена, от которой посчитан предел?</span><span class="tot">90 дней: 23,90–25,90 € с НДС</span>',LP.priceChart(),true)}</section>
<section${av('dev')}>${acc('cmp','<span class="sq">Какие предложения сопоставимы и где они относительно предела?</span><span class="tot">без оговорок не сопоставимо ни одно, условно — два</span>',pre?'<p class="nodata">До анализа предложений нет.</p>':LP.cmpChart('c1'))}</section>
`+p01tail(pre,vtx)}
function p01tail(pre,vtx){const sim=S.sim;return `<section${av('prod')}>${acc('lot60','<span class="sq">Экономика партии при 60 шт.</span><span class="tot">выплата и результат после доставки — неизвестно</span>',pre?'<p class="nodata">До анализа предложения нет — экономики партии нет.</p>':econ60())}</section>
<section${av('none')}>${acc('chg','<span class="sq">Что изменит вывод</span><span class="tot">'+(pre?'до анализа — нет':'4 условия')+'</span>',pre?'<p class="nodata">до анализа — нет</p>':`<ul class="lm">${D.P01_explanation_v3.change_conditions.map(c=>`<li><p style="color:var(--ink)">${esc(c.if||'')}${c.if?' → ':''}${esc(c.then)}</p></li>`).join('')}</ul>`)}</section>
<section${av('none')}>${acc('risk','<span class="sq">Риски, которые правило не учитывает</span><span class="tot">'+(pre?'до анализа — нет':'5 продавцов на листинге; объём 450 / 400 мл')+'</span>',pre?'<p class="nodata">до анализа — нет</p>':`<ul class="lm"><li><p style="color:var(--ink)">5 продавцов на листинге ${K.FACT}</p></li><li><p style="color:var(--ink)">Объём в описании прайса 450 мл против 400 мл на листинге ${K.FACT} · противоречие не разрешено</p></li></ul>`)}</section>
<section${av('data')}>${acc('st7','<span class="sq">Семь стадий</span><span class="tot">решения по версии от '+vtx+' нет; разрешение, резерв и исполнение — вне системы</span>',`<table class="tbl" data-density="dense"><tbody>${[['Прогноз','исследовательский, на вывод не влияет'],['Рекомендация','исследовательский вывод, не каноническая'],['Решение',S.dec.P01?'«'+S.dec.P01.v+'» · сейчас':'нет по версии от '+vtx],['Разрешение капитала','вне системы, не записано'],['Резерв капитала','вне системы, не записано'],['Исполнение','вне системы, не записано'],['Реализованный результат','не наступил']].map(r=>`<tr><th scope="row">${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</tbody></table>`)}</section>
<section${av('hyp')}>${acc('op','<span class="sq">Мнение команды</span><span class="tot">мнение, не решение</span>',sim?'<p class="nodata">на момент имитации — нет</p>':'<p>Ана Гарсия: согласна с выводом версии от 28.09, 29.09 11:02 <span class="t2">— мнение, не решение</span></p>')}</section>
</div>`}
function econ60(){const E=D.P01_offer_economics;return `<table class="tbl" data-density="dense"><thead><tr><th scope="col">Статья</th><th scope="col" class="num">€</th><th scope="col">Вид знания и база</th></tr></thead><tbody>
<tr><th scope="row">Товар, 60 шт.</th><td class="num">${eur(E.goods_at_moq.cents)}</td><td>${K.CALC} <span class="kx">без НДС</span></td></tr>
<tr><th scope="row">Одна посылка</th><td class="num">${eur(E.one_parcel.cents)}</td><td>${K.FACT} <span class="kx">база НДС не названа</span></td></tr>
<tr><th scope="row">Число посылок</th><td class="num"><span class="ms u">неизвестно</span></td><td></td></tr>
<tr><th scope="row">Выплата поставщику, известная часть</th><td class="num">${eur(E.cash_known.cents)}</td><td>${K.SCENARIO} <span class="kx">с НДС 19 % DE; полная — неизвестно</span></td></tr>
<tr><th scope="row">Результат по учтённой стоимости</th><td class="num">${eur(E.lot_result_counted.cents)}</td><td>${K.SCENARIO} <span class="kx">без НДС; после доставки — неизвестно, не больше ${eur(E.lot_result_after_delivery_upper.cents)}</span></td></tr></tbody></table><p class="t2">Поставщик в Чехии: какой НДС применится — вопрос; в сценарии LotPrism — 19 % DE.</p>`}
function gen(id){const r=REG[id],e=E4[id],vd=verdict(id),nl=NL.includes(id);const st=STEP[id];
 const sito=id==='P02'?D.research.main_batch.positions[0].amazon.ceilings:null;
 let left=`${vd?`<span class="pill">${vd}</span>`:'<span class="t2">вывод: в демоданных нет</span>'}<p class="vd-t">${esc(st)}${S.dec[id]?'':''}</p>`;
 if(e){const neg=e.headroom.cents<0,over=e.pct_of_ceiling>100,rej=e.verdict==='REJECTED',mk=over?+(e.ceiling_30.cents/e.offer.cents*100).toFixed(2):0;left+=`<p class="pair"><span>${e.offer.display}</span><small>${over?'при пределе':'из'}</small><span>${e.ceiling_30.display}</span>${e.conditional?' '+K.COND:''}</p><div class="bar${over?' over':''}">${over?`<i style="width:${mk}%"></i><i class="ovr" style="left:${mk}%;width:${(100-mk).toFixed(2)}%"></i><b class="mk" style="left:${mk}%"></b>`:`<i style="width:${e.pct_of_ceiling}%"></i>`}</div><div class="bar-l"><span>предложение${e.conditional?', условно':''}</span><span>${over?'риска — расчётный предел; штриховка — выше предела':'расчётный предел'}</span></div>
${rej?'':`<p class="diff">${neg?`Разница <b class="n">${e.headroom.display}</b> · выше предела`:`Разница <b class="n">${e.headroom.display}</b> до неучтённых расходов — это не прибыль`} ${K.CALC}</p>`}
<dl class="kv"><div><dt>Предложение</dt><span class="kd">${e.conditional?K.COND:K.FACT}<span class="kx">без НДС за единицу продажи</span></span><dd>${e.offer.display}</dd></div><div><dt>Предел при 30 %</dt><span class="kd">${K.CALC}<span class="kx">значение по умолчанию, как порог не утверждено</span></span><dd>${e.ceiling_30.display}</dd></div><div><dt>Предел при 0 %</dt><span class="kd">${K.CALC}</span><dd>${e.ceiling_0.display}</dd></div></dl>${rej?`<p class="t2">Правило отклонило карточку; разница не считается · причина правила в демоданных не указана.</p>`:''}`}
 else if(sito)left+=`<p class="pair"><span class="ms u" style="font:500 var(--f18) Onest">предложения нет</span><small>предел</small><span>${sito['30'].display}</span></p><dl class="kv"><div><dt>Расчётный предел при 30 %</dt><span class="kd">${K.CALC}<span class="kx">значение по умолчанию, как порог не утверждено</span></span><dd>${sito['30'].display}</dd></div></dl>`;
 else left+=`<p class="nodata">Экономика и пределы: в демоданных нет.</p>`;
 const F=r.freshness;const lim=(r.completeness.items||[]).filter(i=>i.state!=='known').map(i=>`<li><span class="lt">${i.state==='unknown'?K.UNKNOWN:i.state==='conditional'?K.COND:`<span class="ms na">${IC.na}не применимо</span>`} ${esc(i.name)}</span>${i.note?`<p>${esc(i.note)}</p>`:''}</li>`).join('');
 const fr=F.engine_gate&&F.engine_gate.outcome==='failed'?`<li><span class="lt"><span class="ms old">${IC.clk}устарело</span></span><p>цена не менялась ${F.engine_gate.value_days} дня, правило — не больше 45</p></li>`:F.ui_stale?`<li><span class="lt"><span class="ms nu">${IC.clkd}не обновлено</span></span><p>данные на ${fdt(F.provider_answered_at)}</p></li>`:'';
 return head(id,' · исследование: '+esc(r.research.state_ru))+`<section class="hero" aria-label="Вывод и экономика"><div>${left}</div><div><span class="eyebrow">Чего пока недостаточно</span><ul class="lm"${av('dev')}>${lim}${fr}</ul><span class="eyebrow">Следующий шаг</span><p class="nx">${esc(st)}</p></div></section>
<div class="quiet3"><section><h2 class="eyebrow">Почему такой вывод</h2><p class="nodata" style="margin-top:8px">в демоданных нет</p></section><section><h2 class="eyebrow">Ассистент</h2><p class="nodata" style="margin-top:8px">в демоданных нет · исследование: ${esc(r.research.state_ru)}</p></section></div>
${decStrip(id,'по текущей версии')}`}
LP.card=card;
/* ── панель подробностей ── */
function renderPanel(){const id=S.pid;if(!id)return;const r=REG[id],adm=S.view==='admin';
 const tabs=[['calc','Как посчитано'],['assistant','Ассистент'],['sources','Источники и история']];
 $('#panel').innerHTML=T(`<button class="handle" type="button" data-act="sheeth" aria-label="Изменить высоту листа" aria-expanded="${S.pnH==='full'}"></button><div class="pn-h"><div style="min-width:0"><span class="eyebrow">Подробности</span><p class="h3">${esc(r.title_ru)}</p></div><button class="x" type="button" data-act="pclose" aria-label="Закрыть подробности">×</button></div>
<div class="tabs" role="tablist" aria-label="Разделы подробностей">${tabs.map(([k,l])=>`<button class="tab" role="tab" id="tab-${k}" aria-controls="tp" aria-selected="${S.panel===k}" tabindex="${S.panel===k?0:-1}" data-act="tab" data-tab="${k}">${l}</button>`).join('')}</div>
<div class="pn-b" id="tp" role="tabpanel" aria-labelledby="tab-${S.panel}" tabindex="0">${S.panel==='calc'?LP.pCalc(id,adm):S.panel==='assistant'?pAssist(id,adm):pSources(id,adm)}</div>`);
 LP.mountCharts&&LP.mountCharts($('#panel'))}
LP.renderPanel=renderPanel;
function openPanel(anim){const p=$('#panel');p.dataset.open='1';p.dataset.h=S.pnH;$('#app').classList.add('pn-open');if(anim)setTimeout(()=>{const t=$('.tab[aria-selected=true]',p);t&&t.focus()},50)}
function closePanel(ret){const p=$('#panel');if(p.dataset.open!=='1'){S.panel=null;return}const tab=S.panel;p.dataset.open='0';$('#app').classList.remove('pn-open');S.panel=null;setQ('panel',null);if(ret)focusChain([S.pnFrom&&`#view [data-pf="${S.pnFrom}"]`,tab&&`#view [data-act=panel][data-tab="${tab}"]`,'#cd-h1','#view'])}
function focusChain(sels){for(const s of sels){if(!s)continue;const el=$(s);if(!el)continue;if(s==='#cd-h1')el.tabIndex=-1;el.focus();if(document.activeElement===el)return}}
LP.openPanel=openPanel;LP.closePanel=closePanel;
function pSources(id,adm){const r=REG[id];
 if(id!=='P01')return `<div class="sg"><h3 class="h3">Источник и свежесть</h3><div class="sr"><span>${esc(r.freshness.source)}</span><span class="r2 mono">${fdt(r.freshness.provider_answered_at)}</span><span class="r3">значение изменилось ${fdt(r.freshness.value_changed_at)}</span></div></div><div class="sg"><h3 class="h3">Полный заголовок листинга</h3><p class="t2" lang="de">${esc(r.title_listing)}</p></div><p class="nodata">Правила, проверки, история версий и коды для этой карточки: в демоданных нет.</p>`;
 const sim=S.sim;const st=sim?'<span class="tag">ИМИТАЦИЯ · позже имитируемого момента</span> ':'';const vs=D.P01_versions.filter(v=>!sim||(sim.phase==='done'?v.version<=2:v.version<=1));
 const vt={1:'«Рынок: стоит искать предложение», предел 9,60 €',2:'Получено предложение 7,60 € → «Проверить предложение», разница 2,00 €',3:'Изменилось правило расчёта: выплата при минимальном заказе стала двумя строками; вывод тот же'};
 return `<div class="sg"${av('prod')}><h3 class="h3">Источники и время ответа</h3><div class="sr"><span>${st}Keepa · рынок amazon.de, кухня</span><span class="r2 mono">30.09 18:05</span><span class="r3"><span class="ms nu">${IC.clkd}обновление 30.09 23:40 не удалось</span></span></div>${adm||(sim&&sim.phase!=='done')?'':`<div class="sr"><span>Прайс поставщика</span><span class="r2 mono">25.09 10:20</span></div>`}<div class="sr"><span>${st}FBA</span><span class="r2">оценка провайдера · 30.09 18:05</span></div></div>
<div class="sg"${av('none')}><h3 class="h3">Правила и значения по умолчанию</h3><div class="sr"><span>Доходность 30 %</span><span class="r2">по умолчанию</span><span class="r3">не утверждено Founder</span></div><div class="sr"><span>Комиссия 15 %</span><span class="r2">по умолчанию</span></div><div class="sr"><span>Доставка до склада 0,50 €</span><span class="r2">сценарий по умолчанию</span></div><div class="sr"><span>${st}Правило объяснения</span><span class="r2">explanation-v1 · правило доставки 28.09.2026</span></div></div>
${adm?'<p class="hide">Проверки предложения и история предложений — частные данные пространства скрыты.</p>':`<div class="sg"${av('none')}><h3 class="h3">Проверки</h3><p>${st}Держатся ${D.P01_explanation_v3.gates_offer.filter(g=>g.outcome==='held').length}. <span class="t2">Проверка цены с доставкой для источника вне ЕС — не проверялась: применяется только к источнику вне ЕС, поставщик в Чехии.</span></p></div>
<div class="sg"${av('prod')}><h3 class="h3">История версий · только дописывается</h3>${vs.map(v=>`<div class="sr"><span>${sim?'<span class="tag">ИМИТАЦИЯ</span> ':''}${vt[v.version]}</span><span class="r2 mono">${fdt(v.created_at)}</span></div>`).join('')}</div>`}
<div class="sg"${av('data')}><h3 class="h3">Исходный текст LotPrism · англ.</h3><p class="en" lang="en">${esc(D.P01_explanation_v1.summary.headline_en)}</p><p class="en" lang="en">${esc(D.P01_explanation_v1.summary.authority.replace(/ \(.*\)$/,''))}</p></div>
<div class="sg"${av('none')}><h3 class="h3">Коды и полный заголовок</h3><p class="codes"><span>ASIN B0DEMOTP01</span><span>EAN 4006…217</span>${adm?'':'<span>CHECK_OFFER</span>'}<span>rule_change</span></p><p class="t2" lang="de">${esc(REG.P01.title_listing)}</p></div>`}
/* ── ассистент и имитация анализа ── */
const STG=[['Поставлено','21.09 09:30'],['В работе у команды LotPrism',''],['Итог получен','24.09 16:10'],['Прайс поставщика прикреплён','25.09 10:20'],['Карточка пересчитана','версия от 25.09']];
const SW={inactive:['○','ожидает'],loading:['','идёт'],completed:['✓','готово'],nodata:['–','нет данных'],failed:['!','не удалось']};
function pAssist(id,adm){
 if(adm)return `<p class="hide">Итог и содержимое задания — частные данные пространства скрыты.</p><div class="sg"><h3 class="h3">Состояние платформы для этого товара</h3><p>Лимит исследователя исчерпан до 03.10 09:00 — что будет с заданиями, не определено.</p></div><button class="btn btn-s" type="button" aria-disabled="true" aria-describedby="ra-w">Запустить анализ</button><p class="why" id="ra-w">недоступно в виде администратора: это действие над объектом клиента</p>`;
 if(id!=='P01')return `<p class="nodata">Ассистент по этой карточке: в демоданных нет · исследование: ${esc(REG[id].research.state_ru)}</p>`;
 const R=D.P01_research,sim=S.sim;
 const found=`<div class="sg" id="found"${av('hyp')}><h3 class="h3">Что найдено</h3><ol class="found">${[['Чехия, прайс оптовика','код совпал',K.FACT,'7,60 €'],['Польша, оптовая площадка','кода нет',K.COND,'8,10 €'],['Германия, розница','только сравнение','<span class="kx">сравнение</span>','16,72 €'],['Китай, производитель','проверить не удалось',K.UNKNOWN,'—']].map(f=>`<li><span>${f[0]}<span class="t2" style="display:block">${f[1]}</span></span><span>${f[2]} <span class="n">${f[3]}</span></span></li>`).join('')}</ol><p class="t2">Расчётный предел исследователю не передавался. Цены без НДС за 1 шт.</p></div>`;
 if(!sim)return `<div class="sg"><span class="eyebrow">Завершено · Поиск поставщиков</span><dl class="dl2"><dt>Кто выполнял</dt><dd>${esc(R.asked_by)}</dd><dt>Ожидалось</dt><dd>оптовые предложения в ЕС по коду листинга, до 100 шт.</dd><dt>Ход</dt><dd><span class="mono">${fdt(R.asked_at)}</span> → итог <span class="mono">${fdt(R.answered_at)}</span></dd><dt>Вывод</dt><dd>${esc(R.conclusion)}</dd></dl></div>${found}
<div class="sg"><span class="ms chk" style="font-size:var(--f13)">Противоречие не разрешено</span><p class="t2">${esc(R.contradiction.what)}</p></div>
<div class="sg"><button class="btn btn-s" type="button" aria-disabled="true" aria-describedby="rp-w">Повторить поиск</button><span class="why" id="rp-w">недоступно: лимит исследований исчерпан до 03.10 09:00 · итог поиска от 24.09 уже есть</span></div>
<div class="sg"${av('hyp')}><button class="btn btn-s" type="button" data-act="simstart" data-pf="sim-btn">Показать, как карточка получила предложение</button><span class="t2">имитация на демоданных; карточка временно показывает версию от 21.09</span></div>`;
 const n=sim.stages.findIndex(s=>s==='loading')+1;
 let btn;if(sim.phase==='pre')btn=`<button class="btn btn-s" type="button" data-act="pop" data-pf="run-btn" id="run-btn" style="min-width:260px">Найти поставщиков</button>`;
 else if(sim.phase==='run')btn=`<button class="btn btn-s" type="button" id="run-btn" aria-busy="true" aria-disabled="true" aria-describedby="run-why" style="min-width:260px">Анализ идёт · этап ${n} из 5</button><span class="why" id="run-why">недоступно, пока анализ идёт</span>`;
 else if(sim.phase==='fail')btn=`<button class="btn btn-s" type="button" data-act="na" data-what="Повторить" style="min-width:260px">Повторить</button><span class="why">пример состояния</span>`;
 else btn=`<span class="t2">${sim.phase==='partial'?'Карточка не пересчитана · пример состояния':'Анализ завершён · карточка пересчитана'}</span>`;
 return `<div class="sg"${av('hyp')}><span class="eyebrow">Дополнительный анализ · Поиск поставщиков</span>${btn}</div>
<ol class="stp" aria-label="Ход анализа"${av('dev')}>${STG.map((s,i)=>{const st=sim.stages[i];return `<li data-state="${st}"><span class="gl" aria-hidden="true">${SW[st][0]}</span><span>${s[0]}${s[1]?` <span class="mono t2 stt"${st==='inactive'?' hidden':''}>${s[1]}</span>`:''}</span><span class="w">${SW[st][1]}</span></li>`}).join('')}</ol>
${sim.phase==='done'||sim.phase==='partial'?found:''}
${sim.phase==='done'?`<div class="sg"><h3 class="h3">Что изменилось в карточке</h3><ul class="ba">${[['Шаг','Найти предложение поставщика','Проверить предложение'],['Предложение','нет','7,60 € '+K.FACT+' <span class="kx">прайс 25.09</span>'],['Закупочная цена','неизвестно','7,60 €'],['Разница до предела','нет','2,00 € '+K.CALC]].map(b=>`<li class="flash" data-fl><span class="t2">${b[0]}</span><span><span class="was">${b[1]}</span> <span class="kx">до анализа</span></span><span class="ar" aria-hidden="true">→</span><span>${b[2]} <span class="upd">обновлено</span></span></li>`).join('')}</ul></div>`:''}
<button class="btn btn-s sm" type="button" data-act="simexit">Вернуться к текущему состоянию (28.09)</button>`}
function simStart(){S.sim={phase:'pre',stages:['inactive','inactive','inactive','inactive','inactive']};S.panel='assistant';setQ('panel','assistant');LP.route();const b=$('#run-btn');b&&b.focus()}
function simRun(){const sim=S.sim;if(!sim||sim.phase!=='pre')return;closePop();sim.phase='run';const out=S.outcome;
 const plan=out==='full'?['completed','completed','completed','completed','completed']:out==='partial'?['completed','completed','completed','nodata','inactive']:['completed','failed','inactive','inactive','inactive'];
 let i=0;const step=()=>{if(S.sim!==sim)return;if(i>0)sim.stages[i-1]=plan[i-1];
  const stopAt=plan.findIndex(p=>p!=='completed');const last=stopAt<0?5:stopAt+1;
  if(i>=last){sim.phase=out==='full'?'done':out==='partial'?'partial':'fail';announce(out==='full'?'Анализ завершён: карточка пересчитана, версия от 25.09':out==='partial'?'Этап 4: нет данных. Карточка не пересчитана':'Этап 2: не удалось');refresh();if(out==='full'){fade();if(!vis($('#cd .hero')))toast('sim','Карточка обновлена','Открыть',()=>{if(!$('#cd .hero'))location.hash='#/p/P01?panel=assistant';else scrollTo({top:0})})}return}
  sim.stages[i]='loading';announce('Этап '+(i+1)+' из 5: '+STG[i][0]+' — идёт');if(i===0){refresh();const b=$('#run-btn');b&&b.focus()}else tick();i++;S.timer=setTimeout(step,1100)};
 step()}
/* на тике — точечно: этапы и подпись кнопки; полная перерисовка — только на смене фазы */
function tick(){const sim=S.sim;if(!sim)return;const rb=$('#run-btn');if(rb&&sim.phase==='run'){const n=sim.stages.findIndex(s=>s==='loading')+1;rb.textContent='Анализ идёт · этап '+n+' из 5'}
 $$('#panel .stp li').forEach((li,i)=>{const st=sim.stages[i];if(li.dataset.state===st)return;li.dataset.state=st;$('.gl',li).textContent=SW[st][0];$('.w',li).textContent=SW[st][1];const t=$('.stt',li);if(t)t.hidden=st==='inactive'})}
function refresh(){if(S.pid!=='P01'||S.view!=='user'){if(S.panel)renderPanel();return}const ae=document.activeElement,aid=ae&&ae.id;const cd=$('#cd');if(cd)cd.innerHTML=T(p01());if(S.panel)renderPanel();LP.mountCharts($('#view'));if(aid){const e=document.getElementById(aid);if(e){e.focus({preventScroll:true});return}}if(ae&&ae!==document.body&&!document.contains(ae)){const f=$('#found h3')||$('#tp');if(f){if(!f.hasAttribute('tabindex'))f.tabIndex=-1;f.focus({preventScroll:true})}}}
function fade(){requestAnimationFrame(()=>requestAnimationFrame(()=>$$('[data-fl].flash').forEach(e=>e.classList.add('off'))))}
const vis=el=>{if(!el)return false;const b=el.getBoundingClientRect();return b.bottom>56&&b.top<innerHeight};
function simExit(){clearTimeout(S.timer);S.sim=null;closePop();LP.route()}
/* ── popover контракта анализа ── */
function openPop(btn){closePop();const p=document.createElement('div');p.className='pop';p.id='pop';p.setAttribute('role','dialog');p.setAttribute('aria-label','Что будет проверено');
 p.innerHTML=T(`<p class="h3">Найти поставщиков</p><dl><dt>Что проверяется</dt><dd>оптовые предложения в ЕС по коду листинга, до 100 шт.</dd><dt>Что не передаётся</dt><dd>расчётный предел</dd><dt>Кто выполняет</dt><dd>команда LotPrism</dd><dt>Расход</dt><dd><span class="ms u">неизвестно</span></dd></dl><p class="t2">Анализ никому не пишет и карточку сам не меняет.</p><div style="display:flex;gap:8px"><button class="btn btn-p" type="button" data-act="simrun" style="height:40px">Поставить</button><button class="btn btn-s" type="button" data-act="popx">Отмена</button></div>`);
 btn.insertAdjacentElement('afterend',p);btn.parentNode.style.position='relative';p.style.cssText='position:absolute;left:0;top:calc(100% + 8px);z-index:30;width:min(360px,calc(100vw - 32px))';S.pop=btn.dataset.pf;p.addEventListener('focusout',e=>{if(e.relatedTarget&&!p.contains(e.relatedTarget)&&e.relatedTarget!==btn)closePop()});requestAnimationFrame(()=>{p.dataset.open='1';$('[data-act=simrun]',p).focus()})}
function closePop(ret){const p=$('#pop');if(!p)return;const rw=p.closest('.req-w');rw&&(rw.style.position='');p.remove();if(ret&&S.pop){const b=$(`[data-pf="${S.pop}"]`);b&&b.focus()}S.pop=null}
function openReq(btn){closePop();const p=document.createElement('div');p.className='pop';p.id='pop';p.setAttribute('role','dialog');p.setAttribute('aria-labelledby','req-h');
 p.innerHTML=`<p class="h3" id="req-h">Запрос поставщику S1 · ИМИТАЦИЯ</p><p class="t2">Черновик из трёх вопросов:</p><ol class="req-q"><li>Сколько посылок нужно на 60 шт.?</li><li>Объём — 400 или 450 мл?</li><li>Можно ли получить образец?</li></ol><p class="t2" style="color:var(--ink)">В продукте этой функции нет. Черновик никуда не отправляется, расход неизвестен.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-s sm" type="button" data-act="reqsent">Отметить отправленным (имитация)</button><button class="btn btn-s sm" type="button" data-act="popx">Закрыть</button></div>`;
 const w=btn.closest('.req-w')||btn.parentNode;w.appendChild(p);const up=!!btn.closest('.mbar');w.style.position='relative';p.style.cssText='position:absolute;left:0;'+(up?'bottom:calc(100% + 8px)':'top:calc(100% + 8px)')+';z-index:30;width:min(400px,calc(100vw - 32px))';S.pop=btn.dataset.pf;void p.offsetWidth;{const bh=btn.getBoundingClientRect(),ph=p.offsetHeight,vh=innerHeight-8;if(!up&&bh.bottom+8+ph>vh){if(bh.top-8-ph>=8){p.style.top='auto';p.style.bottom='calc(100% + 8px)'}else{const pr=p.getBoundingClientRect();if(pr.bottom>vh)window.scrollBy(0,pr.bottom-vh)}}}p.dataset.open='1';$('[data-act=reqsent]',p).focus({preventScroll:true});
 p.addEventListener('focusout',e=>{if(e.relatedTarget&&!p.contains(e.relatedTarget)&&e.relatedTarget!==btn)closePop()})}
/* ── решение ── */
const DV=[['watch','Наблюдать'],['defer','Отложить'],['approve_purchase','Одобрить покупку'],['decline','Отклонить']];
function decide(from){const id=S.pid;const d=$('#dlg');const sm=S.sim,ver=id==='P01'?(sm&&sm.phase==='done'?'по оценке от 25.09 · версия 2':sm?'по оценке от 21.09 · версия 1':'по оценке от 28.09 · версия 3'):'по текущей версии карточки';
 d.innerHTML=T(`<form method="dialog" id="dform"><h2 class="h2" id="dlg-h">Записать решение</h2><p class="t2">${esc(REG[id].title_ru)}</p><fieldset style="border:0"><legend class="eyebrow" style="margin-bottom:8px">Ваше решение</legend><div class="opts" role="radiogroup">${DV.map((v,i)=>`<label><input type="radio" name="v" value="${v[1]}">${v[1]}</label>`).join('')}</div></fieldset>
<div class="sr" style="border:0;padding:0"><span>Версия</span><span class="r2">${ver}</span><span class="r3">подставлено, не редактируется</span></div><label class="t2" for="dnote">Заметка — по желанию</label><textarea id="dnote" name="note"></textarea><p class="t2">Решение не разрешает тратить капитал.</p>
<div class="ft"><span class="why" id="dlg-w" style="margin-right:auto">выберите решение</span><button class="btn btn-s" type="button" data-act="dlgx">Отмена</button><button class="btn btn-p" value="ok" type="submit" style="height:40px" id="dlg-ok" aria-disabled="true" aria-describedby="dlg-w">Записать</button></div></form>`);
 d.returnValue='';d.showModal();const fm=$('#dform',d);fm.addEventListener('change',()=>{if($('input[name=v]:checked',d)){$('#dlg-ok').removeAttribute('aria-disabled');$('#dlg-w').hidden=true}});fm.addEventListener('submit',e=>{if(!$('input[name=v]:checked',d))e.preventDefault()});d._from=from;d.onclose=()=>{if(d.returnValue==='ok'){const v=$('input[name=v]:checked',d).value;S.dec[id]={v,just:true};LP.route();const nd=$('#dec');if(!vis(nd))toast('dec','Решение записано: «'+v+'»','Открыть',()=>nd&&nd.scrollIntoView&&scrollTo({top:nd.getBoundingClientRect().top+scrollY-120}));announce('Решение записано: '+v);setTimeout(()=>{S.dec[id].just=false},0)}const f=$(`[data-pf="${d._from}"]`);f&&f.focus()}}
/* ── toast: один на запуск, обновление по id, действие, ≥ 6 с ── */
function toast(id,msg,act,fn){let t=$('#t-'+id);if(!t){t=document.createElement('div');t.className='toast';t.id='t-'+id;$('#toasts').appendChild(t);t.addEventListener('mouseenter',()=>tStop(t));t.addEventListener('focusin',()=>tStop(t));t.addEventListener('mouseleave',()=>tArm(t));t.addEventListener('focusout',()=>tArm(t))}t.innerHTML=`<span>${esc(msg)}</span>`+(act?`<button class="lnk" type="button">${act}</button>`:'');if(fn)$('button',t).onclick=()=>{fn();tStop(t);t.remove()};requestAnimationFrame(()=>t.dataset.open='1');tArm(t)}
function tStop(t){clearTimeout(t._h);clearTimeout(t._r);t.dataset.open='1'}
function tArm(t){tStop(t);t._h=setTimeout(()=>{t.dataset.open='0';t._r=setTimeout(()=>t.remove(),200)},6500)}
const announce=m=>{$('#live').textContent=m};
Object.assign(LP,{toast,announce});
/* ── панель прототипа ── */
function proto(){const b=$('#proto-b');if(b.dataset.done)return;b.dataset.done=1;
 b.innerHTML=T(`<p class="cap">демоданные · срез 01.10.2026 10:00 · Demo-Handel GmbH, синтетика</p>
<fieldset><legend>Вид</legend><label><input type="radio" name="pv" value="user" checked>Пользователь — Ирина</label><label><input type="radio" name="pv" value="admin">Администратор платформы</label></fieldset>
<label><input type="checkbox" id="pav">Что работает в продукте</label>
<fieldset><legend>Исход имитации анализа</legend><label><input type="radio" name="po" value="full" checked>полный</label><label><input type="radio" name="po" value="partial">частичный</label><label><input type="radio" name="po" value="fail">не удалось</label></fieldset>
<button class="btn btn-s sm" type="button" data-act="reset">Сбросить демо</button>`);
 b.addEventListener('change',e=>{const t=e.target;if(t.name==='pv'){S.view=t.value;closePanel();LP.route()}else if(t.id==='pav'){S.av=t.checked;document.body.classList.toggle('av',S.av)}else if(t.name==='po'){S.outcome=t.value}})}
/* ── события ── */
const ACT={
 acc:b=>toggleAcc(b),
 'acc-open':b=>{const t=$(`.acc-t[data-id="${b.dataset.id}"]`);if(t){if(t.getAttribute('aria-expanded')!=='true')toggleAcc(t);t.focus();t.scrollIntoView?scrollTo({top:t.getBoundingClientRect().top+scrollY-80,behavior:'auto'}):0}},
 panel:b=>{S.pnFrom=b.dataset.pf;S.panel=b.dataset.tab;setQ('panel',S.panel);renderPanel();openPanel(true)},
 pclose:()=>closePanel(true),
 tab:b=>{S.panel=b.dataset.tab;setQ('panel',S.panel);renderPanel();$('#tab-'+S.panel).focus()},
 sheeth:b=>{S.pnH=S.pnH==='half'?'full':'half';$('#panel').dataset.h=S.pnH;b.setAttribute('aria-expanded',S.pnH==='full')},
 dlgx:()=>$('#dlg').close('cancel'),
 decide:b=>{if(S.view==='admin')return;decide(b.dataset.pf)},
 simstart:()=>simStart(),simexit:()=>simExit(),pop:b=>openPop(b),popx:()=>closePop(true),simrun:()=>simRun(),
 req:b=>openReq(b),reqwait:()=>toast('na','Ожидает ответа S1 — в прототипе ответа не будет'),
 reqsent:()=>{const pf=S.pop;S.req=true;closePop();LP.route();LP.announce&&LP.announce('Запрос подготовлен, ответа нет · имитация');const b=$('#'+(pf||'req-btn'));b&&b.focus()},
 na:b=>toast('na','«'+(b.dataset.what||'Действие')+'» — '+(b.dataset.msg||'в прототипе не выполняется')),
 reset:()=>{reset();$$('#proto input').forEach(i=>{i.checked=i.value==='user'||i.value==='full'});$('#pav').checked=false;document.body.classList.remove('av');closePanel();location.hash='#/';LP.route()},
 mnav:b=>{const r=$('#rail'),o=!r.classList.contains('open');r.classList.toggle('open',o);b.setAttribute('aria-expanded',o)},
 lstopen:()=>{const l=$('#lst');if(!l)return;if(innerWidth<=760){const o=!l.classList.contains('open');l.classList.toggle('open',o);if(o){const s=$('.li[aria-selected=true]',l);s&&s.focus()}else{const m=$('#mlist');m&&m.focus()}}else{closePanel(false);const s=$('.li[aria-selected=true]');s&&s.focus()}}
};
LP.ACT=ACT;
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(a&&!a.closest('[aria-disabled=true]')&&a.getAttribute('aria-disabled')!=='true'){e.preventDefault();ACT[a.dataset.act]&&ACT[a.dataset.act](a,e);return}
 if(a&&a.getAttribute('aria-disabled')==='true'){e.preventDefault();return}
 const g=e.target.closest('[data-go]');if(g&&!e.target.closest('a,button:not([data-go]),[id^="acc-"]')){location.hash=g.dataset.go;return}
 const li=e.target.closest('.li');if(li){const r=parse();const q=r.q.toString();location.hash='#/p/'+li.dataset.id+(q?'?'+q:'');$('#lst')&&$('#lst').classList.remove('open')}
 if(S.pop&&!e.target.closest('#pop'))closePop();
 if(!e.target.closest('#rail,.mnav'))$('#rail').classList.remove('open')});
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn');if(b){b.classList.add('pressed');const up=()=>{b.classList.remove('pressed');removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};addEventListener('pointerup',up);addEventListener('pointercancel',up)}});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if($('#lst.open')){ACT.lstopen();return}if($('#pop')){closePop(true);return}if($('#panel').dataset.open==='1'&&!$('#dlg').open){closePanel(true);return}}
 const li=e.target.closest('.li');if(li&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();const all=$$('.li',li.parentNode);const i=all.indexOf(li)+(e.key==='ArrowDown'?1:-1);const n=all[Math.max(0,Math.min(all.length-1,i))];all.forEach(x=>x.tabIndex=-1);n.tabIndex=0;n.focus();return}
 if(li&&(e.key==='Enter'||e.key===' ')){e.preventDefault();li.click();return}
 const tb=e.target.closest('.tab');if(tb&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const all=$$('.tab',tb.parentNode);let i=all.indexOf(tb);i=e.key==='Home'?0:e.key==='End'?all.length-1:(i+(e.key==='ArrowRight'?1:-1)+all.length)%all.length;all.forEach(x=>x.tabIndex=-1);all[i].tabIndex=0;all[i].focus();return}
 const sg=e.target.closest('[role=radiogroup] [role=radio]');if(sg&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const all=$$('[role=radio]',sg.parentNode);const i=(all.indexOf(sg)+(e.key==='ArrowRight'?1:-1)+all.length)%all.length;all[i].click();all[i].focus()}
});
/* после смены товара: фокус на выбранной строке, панель обновляется без повторного открытия */
const _r=route;LP.route=function(){const f=document.activeElement&&document.activeElement.classList.contains('li');_r();if(S.panel)renderPanel();if(f){const s=$('.li[aria-selected=true]');s&&s.focus({preventScroll:true})}const mb=$('.mbar');if(mb)mb.hidden=innerWidth>760;const ml=$('#mlist');if(ml)ml.style.display=innerWidth<=760&&$('#lst')?'':'none'};
removeEventListener('hashchange',route);
addEventListener('hashchange',()=>{const f=document.activeElement&&document.activeElement.classList.contains('li');LP.route();if(!f){$('#view').focus({preventScroll:true});scrollTo(0,0)}});
addEventListener('resize',()=>{const mb=$('.mbar');if(mb)mb.hidden=innerWidth>760});
})();
