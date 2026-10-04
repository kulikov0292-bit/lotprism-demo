/* LotPrism · доводка 8 · дашборд «Что требует моего внимания?» и список товаров «Что проверить первым?» как один сценарий.
   Слой поверх prototype.js / prototype-2.js: маршрут #/products, новый дашборд, боковой список карточки и возврат в выборку.
   Компоненты 21st перенесены принципом (разметка, состояния, клавиатура) в ванильный JS: Filters (andrewlu0), Role Filter Chips (cnippet-dev), Search Empty State (arihantcodes), Sortable Table (felipemenezes098) + aria-sort. */
(function(){
'use strict';
const LP=window.LP,{D,$,$$,esc,T,fdt,K,IC,av,acc,REG,E4,S,thumb,VAR,LIST,NL,STEP}=LP;
const ALL=LIST.concat(NL);
const CH=D.dashboard.changes,CP=D.dashboard.capital;
const SITO=D.research.main_batch.positions[0].amazon.ceilings;

/* ══ интерфейс, из данных ══
   Таблицы ниже — формулировки интерфейса. Числа (предложение, предел, разница, даты, источник) берутся из D: charts.E4, registry.freshness, research, dashboard.
   Группы собирает интерфейс по правилам п. 2 брифа — это не оценка LotPrism и не приоритет. */
const UI={
 G:[['mine','Ваш ход','Ваш ход'],['wait','Ждём','Ждём'],['blocked','Нельзя продолжить без данных','Нельзя без данных'],['stop','Не заниматься','Не заниматься'],['bought','Куплено','Куплено']],
 /* покупка оформлена: dashboard.capital.open_cost_basis.composition — «партия 2» Термокружки */
 bought:['P08'],
 /* дольше всего без движения — сверху; дата начала текущего шага (из данных: предложение, исследование, решение, изменение цены). null — дата неизвестна, в конец группы */
 since:{P01:'2026-09-25T10:20',P13:null,P02:null,P07:'2026-09-29T15:00',P16:'2026-09-30T10:00',P06:'2026-09-30T10:20',P15:'2026-09-30T13:40',P03:'2026-10-01T09:40',P18:'2026-08-09T10:00',P04:'2026-09-24T22:10',P09:'2026-09-29T08:44',P14:'2026-09-24',P12:'2026-09-25',P10:'2026-09-27',P05:'2026-09-29',P08:'2026-09-10'},
 /* причина в полосе групп */
 why:{P06:'исследование',P15:'исследование',P16:'исследование',P07:'ответ поставщика',P03:'ваше условие по цене',P04:'нет оценки FBA',P09:'нет оценки FBA',P18:'цена устарела',P14:'отклонено правилом',P12:'отклонено правилом',P10:'отклонено правилом',P05:'не стоит искать'},
 short:{P01:'Чайник',P02:'Сито',P03:'Мельница',P04:'Форма',P05:'Доски',P06:'Банки',P07:'Ножеточка',P08:'Термокружка',P09:'Кофемолка',P10:'Сковорода',P12:'Дозатор',P13:'Хлебница',P14:'Овощерезка',P15:'Баночки',P16:'Салатница',P18:'Кастрюля'},
 /* мешает → дальше: начинается с того, кто решил или чего ждём; глагол — только из шага LotPrism */
 mb:{P01:['объём 450 / 400 мл не подтверждён, доставка не посчитана','проверить предложение: запрос поставщику, образец'],
  P13:['данные на 19.09 — предел мог устареть','проверить предложение'],
  P02:['нет предложения поставщика','найти предложение поставщика'],
  P07:['единица цены не подтверждена · вопрос задан вне системы','ждём ответа поставщика с 29.09'],
  P16:['по версии 2 решения нет; ваша заметка к версии 1: ждём условия возврата боя','ждём итог исследования, запрошено 30.09 · что именно — в данных не указано'],
  P06:['состав набора не проверен, цена продажи — сценарий','ждём итог исследования, обновлено 30.09'],
  P15:['аналогов на amazon.de нет','ждём итог исследования, запрошено 30.09'],
  P03:['вы 01.10: «Наблюдать» до цены ниже 8,53 € · сейчас 9,40 €','ждём цену ниже 8,53 € — условие не выполнено'],
  P18:['цена на Amazon не менялась с 09.08 — дольше 45 дней, вывода нет; предложения нет','следующий шаг не задан'],
  P04:['нет оценки FBA (платы Amazon за обработку и отправку заказа) и закупочной цены','нужны данные; кто их даст — в данных не указано'],
  P09:['нет оценки FBA, поэтому нет предела','определить предел; кто даст оценку — в данных не указано'],
  P14:['LotPrism: отклонено правилом, причина в данных не указана','не заниматься'],
  P12:['LotPrism: отклонено правилом, причина не указана · исследование закрыто 25.09','следующий шаг не задан'],
  P10:['вы 27.09: «Отклонить» · LotPrism: отклонено правилом, причина не указана','не по этой цене'],
  P05:['LotPrism: Amazon на листинге с 28.09','не стоит искать предложение'],
  P08:['вы 10.09: «Одобрить покупку»','куплено · заказ оформлен вне системы']},
 /* предложение: вторая строка; число — из E4 */
 off:{P01:'S1 Чехия · прайс 25.09 · мин. 60 шт.',P13:'источник не указан',P07:'за шт. или за упаковку? · источник не указан',P16:'источник не указан',P06:'за набор',P03:'источник не указан',P08:'цена закупки партии 2'},
 offT:{P01:'S1 Чехия, прайс 25.09 · мин. 60 шт. = 456,00 €',P13:'источник и мин. заказ не указаны'},
 noOff:{P05:'не нужно'},
 lim:{P02:['4,91 €','COND','по позиции партии BT01-01'],P06:[null,'','по похожим товарам, сценарий'],P12:[null,'','по похожим товарам'],P15:['не посчитан','','нет цены продажи'],P04:['неизвестен','u'],P09:['неизвестен','u'],P18:['нет'],P05:['нет']},
 /* разница: основание (E4.draw_rules[0] — доставка от поставщика в разницу не входит) */
 base:{P03:'доставка 0 €',P14:'доставка 0 €',P16:'доставка 0 €',P12:'доставка 0 €',P01:'без доставки',P08:'без доставки',P06:'без доставки',P07:'без доставки',P10:'без доставки',P13:'доставка не расшифрована'},
 /* разница: [направление, сумма] или текст в той же позиции */
 diff:{P03:['выше на','0,87 €'],P06:['условно ниже на','3,50 €'],P07:['условно ниже на','0,68 €'],P14:'не показывается: отклонено правилом',P12:'выше всех расчётных пределов',P10:'выше всех расчётных пределов',P08:'—'},
 base2:{P07:'только если цена за 1 шт.'},
 demand:['P01','P02'],
 /* дашборд «Ваш ход»: что мешает */
 /* препятствия: маркер как в карточке — chk (круг: нужна проверка), u (пунктир: неизвестно), clk (часы: данные) */
 dmb:{P01:[['chk','объём не совпадает: 450 мл в прайсе, 400 мл на листинге — нужен образец'],['u','доставка не посчитана']],P13:[['clk','данные на 19.09 — предел мог устареть'],['u','доставка в данных не расшифрована']]},
 dsub:{P01:'предложение с 25.09',P02:'с какого дня — неизвестно',P13:'с какого дня — неизвестно'},
 /* дашборд «Изменилось»: язык карточки вместо «потолка», «v2», кодов BY- */
 chg:{P01:'Чайник: получено предложение 7,60 € → «Проверить предложение»',P05:'Доски: «рынок держится» → «не стоит» · Amazon на листинге с 28.09',P18:'Кастрюля: «рынок держится» → «недостаточно данных» · цена не менялась с 09.08',P03:'Мельница: предложение 9,40 € выше предела 8,53 € → «Нужна закупочная цена ниже»'}
};
LP.UI8=UI;
STEP.P08='Куплено · заказ оформлен вне системы';

/* ══ группы ══ */
const GN=Object.fromEntries(UI.G.map(g=>[g[0],g[1]])),GS=Object.fromEntries(UI.G.map(g=>[g[0],g[2]])),GORD=UI.G.map(g=>g[0]);
const decOf=id=>S.dec[id]?S.dec[id].v:(REG[id].decision&&REG[id].decision.value_ru);
const ceilOf=id=>E4[id]?E4[id].ceiling_30:id==='P02'?SITO['30']:null;
function grp(id){const r=REG[id],e=E4[id],d=decOf(id),vd=LP.verdict(id);
 if(d==='Одобрить покупку'&&UI.bought.includes(id))return 'bought';
 if((e&&e.verdict==='REJECTED')||vd==='Рынок: не стоит искать предложение'||d==='Отклонить')return 'stop';
 if(['запрошено','идёт'].includes(r.research.state_ru)||d==='Наблюдать'||d==='Отложить')return 'wait';
 if((!e&&!ceilOf(id))||r.freshness.engine_gate.outcome==='failed')return 'blocked';
 return 'mine'}
LP.grp8=grp;
const NOW='2026-10-01T10:00';
const since=id=>S.dec[id]?NOW:UI.since[id];
const MAT=CH.filter(c=>c.material_change===true&&c.item);
const matOf=id=>MAT.find(c=>c.item===id);
const lastCh=id=>{if(S.dec[id])return NOW;const a=CH.filter(c=>c.item===id).map(c=>c.at);const d=REG[id].decision;if(d)a.push(d.at);return a.sort().pop()||null};
const isFail=id=>REG[id].freshness.source==='DS1',isOld=id=>!!REG[id].freshness.ui_stale,isStale=id=>REG[id].freshness.engine_gate.outcome==='failed';
const reason=id=>S.dec[id]?'ваше решение':UI.why[id];

/* ══ выборка из адреса ══ */
const PK=['state','lane','chg','data','q','sort'];
function sel(q){const g=k=>(q.get(k)||'').split(',').filter(Boolean);return {state:g('state').filter(x=>GN[x]),lane:q.get('lane')||'',chg:q.get('chg')||'',data:g('data'),q:(q.get('q')||'').trim(),sort:q.get('sort')||'group',from:q.get('from')||''}}
function qs(s,over){const o=Object.assign({},s,over||{});const p=new URLSearchParams();if(o.state&&o.state.length)p.set('state',o.state.join(','));if(o.lane)p.set('lane',o.lane);if(o.chg)p.set('chg',o.chg);if(o.data&&o.data.length)p.set('data',o.data.join(','));if(o.q)p.set('q',o.q);if(o.sort&&o.sort!=='group')p.set('sort',o.sort);if(o.from)p.set('from',o.from);return p.toString()}
const keyOf=s=>'lp8:'+qs(s,{from:''});
const norm=t=>String(t).toLowerCase().replace(/ё/g,'е');
function match(id,s,skip){if(!skip||skip!=='state')if(s.state.length&&!s.state.includes(grp(id)))return false;
 if(s.lane&&!(s.lane==='new'?NL:LIST).includes(id))return false;
 if(s.chg==='material'&&!matOf(id))return false;
 if(s.data.length&&!s.data.some(d=>d==='failed'?isFail(id):d==='old'?isOld(id):d==='stale'?isStale(id):false))return false;
 if(skip!=='q'&&s.q){const t=norm(REG[id].title_ru+' '+VAR(REG[id].title_ru)+' '+id+' '+id.slice(1));if(!norm(s.q).split(/\s+/).every(w=>t.includes(w)))return false}
 return true}
const byGroup=(a,b)=>{const ga=GORD.indexOf(grp(a)),gb=GORD.indexOf(grp(b));if(ga!==gb)return ga-gb;const x=since(a),y=since(b);if(x==null&&y==null)return a<b?-1:1;if(x==null)return 1;if(y==null)return -1;return x<y?-1:x>y?1:0};
function order(ids,sort){const a=ids.slice();if(sort==='name'||sort==='name-d'){a.sort((x,y)=>REG[x].title_ru.localeCompare(REG[y].title_ru,'ru'));if(sort==='name-d')a.reverse()}else if(sort==='changed'||sort==='changed-a'){a.sort((x,y)=>{const p=lastCh(x),q=lastCh(y);if(p==null&&q==null)return 0;if(p==null)return 1;if(q==null)return -1;return sort==='changed'?(p<q?1:-1):(p<q?-1:1)})}else a.sort(byGroup);return a}
function title(s){const one=[s.state.length===1,!!s.lane,!!s.chg,s.data.length===1&&!s.state.length].filter(Boolean).length;
 if(!s.state.length&&!s.lane&&!s.chg&&!s.data.length)return 'Все товары';
 if(s.state.length===1&&!s.lane&&!s.chg&&!s.data.length)return GN[s.state[0]];
 if(s.chg&&!s.state.length&&!s.lane&&!s.data.length)return 'Изменилось 24.09–01.10: меняют вывод или шаг';
 if(s.data.length===1&&!s.state.length&&!s.lane&&!s.chg)return {failed:'Обновление 30.09 23:40 не удалось',old:'Данные давно не обновлялись',stale:'Данные устарели'}[s.data[0]];
 if(s.lane&&!s.state.length&&!s.chg&&!s.data.length)return s.lane==='new'?'Новый листинг':'Перепродажа';
 return 'Отбор'}
/* снимок выборки: состав и группы на момент ухода в карточку; пересчёт — только по «Обновить выборку» */
const ss={get:k=>{try{return JSON.parse(sessionStorage.getItem(k)||'null')}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,JSON.stringify(v))}catch(e){}},del:k=>{try{sessionStorage.removeItem(k)}catch(e){}}};
function rowsOf(s){const live=order(ALL.filter(i=>match(i,s)),s.sort);const snap=ss.get(keyOf(s));
 if(!snap||!snap.ids)return {ids:live,moved:{},was:null};
 const ids=s.sort==='group'?snap.ids.filter(i=>REG[i]):order(snap.ids.filter(i=>REG[i]),s.sort);
 const moved={};ids.forEach(i=>{if(snap.g[i]&&snap.g[i]!==grp(i))moved[i]=snap.g[i]});
 return {ids,moved,was:Object.keys(moved).length?snap.ids.length:null,snapG:snap.g}}
function snapshot(s){const k=keyOf(s);if(ss.get(k))return;const ids=order(ALL.filter(i=>match(i,s)),s.sort);ss.set(k,{ids,g:Object.fromEntries(ids.map(i=>[i,grp(i)]))})}

/* ══ ячейки строки: число — в слоте по правому краю, метка вида знания — в своём слоте; числа, метки, основания и свежесть не обрезаются ══ */
const thumb8=id=>id==='P01'?`<span class="th-w">${thumb(id)}<span class="th-l" aria-hidden="true">илл.</span></span>`:thumb(id);
const kd=id=>E4[id]&&E4[id].conditional?K.COND:K.FACT;
const money=(v,k)=>`<span class="pl-m"><b class="pl-num n">${v}</b><span class="pl-k">${k||''}</span></span>`;
const word=t=>`<span class="pl-w">${t}</span>`;
function cOffer(id){const e=E4[id];if(!e)return word(UI.noOff[id]||'нет');return money(e.offer.display,id==='P08'?'':kd(id))+(UI.off[id]?`<span class="pl-s pl-src${UI.off[id]==='за набор'?' pl-unit':''}" title="${esc(UI.offT[id]||UI.off[id])}">${esc(UI.off[id])}</span>`:'')}
function cLim(id){const l=UI.lim[id],e=E4[id];
 if(l&&!l[0]&&e)return money(e.ceiling_30.display,'')+`<span class="pl-s">${l[2]}</span>`;
 if(l&&l[1]==='COND')return money(esc(SITO['30'].display),K.COND)+`<span class="pl-s">${l[2]}</span>`;
 if(l&&l[1]==='u')return word(`<span class="ms u">${l[0]}</span>`);
 if(l)return word(l[0])+(l[2]?`<span class="pl-s">${l[2]}</span>`:'');
 return e?money(e.ceiling_30.display,''):word('<span class="ms u">неизвестен</span>')}
function cDiff(id){const e=E4[id],d=UI.diff[id],b=UI.base[id];let v;
 if(typeof d==='string')return word(d==='—'?'<span class="t2">—</span>':esc(d));
 if(Array.isArray(d))v=`<span class="pl-d"><span class="pl-dw">${d[0]}</span> <b class="n">${d[1]}</b></span>`;
 else if(e)v=`<span class="pl-d"><span class="pl-dw">ниже на</span> <b class="n">${e.headroom.display}</b></span>`;
 else return word('<span class="t2">—</span>');
 return v+(b?`<span class="pl-s pl-bs"${b==='без доставки'?' title="без доставки от поставщика: в разницу не входит"':''}>${[UI.base2[id],b].filter(Boolean).join(' · ')}</span>`:'')}
function cData(id,s){const F=REG[id].freshness,src=F.source;let h;const ch=s&&s.sort.startsWith('changed')?lastCh(id):null;
 if(src==='DS1')h=`<span class="pl-v n">${fdt(F.provider_answered_at).slice(0,5)}</span><span class="pl-s pl-fr"><span class="pl-mk" title="обновление 30.09 23:40 не удалось">${IC.clkd}сбой</span>${F.ui_stale?'<span class="pl-mk">давно не обновлялись</span>':''}${F.engine_gate.outcome==='failed'?`<span class="pl-mk pl-old">${IC.clk}устарело</span>`:''}</span>`;
 else if(src==='DS2')h=`<span class="pl-v n">${fdt(F.provider_answered_at).slice(0,5)}</span><span class="pl-s pl-fr">другой источник</span>`;
 else h=`<span class="pl-v pl-var">архив <span class="n">${fdt(F.provider_answered_at).slice(0,5)}</span></span>`;
 if(s&&s.sort.startsWith('changed'))h+=`<span class="pl-s pl-ch">изм. ${ch?'<span class="n">'+fdt(ch).slice(0,5)+'</span>':'дата неизвестна'}</span>`;
 return h}
function tags(id){const p=[];if(NL.includes(id))p.push('<span class="pl-tag">новый листинг</span>');const m=matOf(id);if(m)p.push(`<span class="pl-tag pl-chg">изменилось ${fdt(m.at).slice(0,5)}</span>`);if(UI.demand.includes(id))p.push('<button class="lnk pl-dem" type="button" data-act="pl-dem">есть сигнал спроса</button>');return p.length?`<span class="pl-tags">${p.join('')}</span>`:''}
const mbT=id=>UI.mb[id]||['','следующий шаг не задан'];
function mbOf(id){const [m,n]=mbT(id);const dn=S.dec[id]&&!['Наблюдать','Отложить','Отклонить'].includes(S.dec[id].v)?`<span class="pl-s">ваше решение «${esc(S.dec[id].v)}» сейчас — не разрешает тратить капитал</span>`:'';
 return (m?`<span class="pl-mz" title="${esc(m)}">${esc(m)}</span>`:'')+`<span class="pl-nx"><span class="pl-ar" aria-hidden="true">→ </span><span class="sr-only">дальше: </span>${esc(n)}</span>`+dn}

/* ══ экран списка ══ */
const GTIP='группы собраны из шага LotPrism и ваших записей · приоритета LotPrism нет';
const HOW=`<div class="pl-how"><p><b>Группы и порядок.</b> Группы собраны из шага LotPrism и ваших записей — это не оценка; приоритета LotPrism нет. По умолчанию — по группам, внутри — дольше всего без движения сверху; дата неизвестна — в конце, по номеру товара.</p>
<p id="pl-lim"><b>Предел закупочной цены</b> — самая высокая цена закупки, при которой по известным статьям остаётся 30 % от закупки. 30 % — параметр расчёта: значение по умолчанию, порогом не утверждено.</p>
<p id="pl-demand">Сигналы спроса есть у 2 из 16: Чайник — куплено за прошлый месяц 300+, отметка Amazon, нижняя граница; Сито — куплено 100+ по позиции партии BT01-01, условно. У остальных спрос неизвестен.</p>
<p>У всех товаров не измерены подготовка, хранение, возвраты, реклама и спрос в штуках.</p>
<p><b>До предела</b> — насколько предложение ниже или выше предела, до доставки от поставщика: это не прибыль. Основание подписано в строке: «доставка 0 €» — доставка от поставщика в данных указана нулём; «без доставки» — доставка от поставщика в разницу не входит; «доставка не расшифрована» — поле в данных есть, состав не подтверждён. Сортировки по разнице нет.</p></div>`;
const gOpts=s=>{const base=ALL.filter(i=>match(i,s,'state'));const cur=s.state.length===1?s.state[0]:s.state.length?'multi':'';return `<option value=""${cur===''?' selected':''}>Все · ${base.length}</option>`+(cur==='multi'?`<option value="multi" selected>${s.state.map(g=>GS[g]).join(' + ')}</option>`:'')+UI.G.map(([g,,sh])=>{const c=base.filter(i=>grp(i)===g).length;return `<option value="${g}"${cur===g?' selected':''}${!c&&cur!==g?' disabled':''}>${sh} · ${c}</option>`}).join('')};
function plPage(q){const s=sel(q);
 return `<main class="main pl" id="pl"${av('dev')}><a class="pl-back" href="#/" data-act="pl-home">← Главная</a>
<div class="pl-hd"><h1 class="h1" id="pl-h1" tabindex="-1"></h1><p class="t2" id="pl-meta"></p></div>
<div class="pl-ctl"><div class="pl-bar" role="search" aria-label="Поиск и фильтры"><div class="pl-sr"><label for="pl-q">Поиск по названию, варианту, номеру</label><input id="pl-q" type="search" autocomplete="off" value="${esc(s.q)}" placeholder="название, объём или номер"></div>
<div class="pl-fw"><button class="btn btn-s sm pl-fb" type="button" id="pl-fb" data-act="pl-fb" aria-expanded="false" aria-controls="pl-fp"></button><div class="pl-fp" id="pl-fp" role="dialog" aria-label="Добавить фильтр" hidden></div></div>
<label class="pl-gsf"><span class="sr-only">Группа</span><select id="pl-gs" title="${GTIP}"></select></label>
<div class="pl-chips" id="pl-chips" role="group" aria-label="Группы" title="${GTIP}"${av('des')}></div></div>
<div class="pl-ah"><div class="pl-act" id="pl-act"></div><label class="pl-sortf"><span>Порядок</span><select id="pl-sort"><option value="group">по группам</option><option value="changed">по последнему изменению</option><option value="name">по названию</option></select></label><div class="pl-help">${acc('pl-how','<span class="sq">Как читать список</span>',HOW)}</div></div></div>
<div id="pl-res"></div></main>`}
function chipsHtml(s){const base=ALL.filter(i=>match(i,s,'state'));const n=g=>base.filter(i=>grp(i)===g).length;const all=!s.state.length;
 return `<button class="pl-chip" type="button" data-act="pl-chip" data-g="" aria-pressed="${all}">Все <span class="n">${base.length}</span></button>`+UI.G.map(([g,,sh])=>{const c=n(g),on=s.state.includes(g);return `<button class="pl-chip pl-g-${g}" type="button" data-act="pl-chip" data-g="${g}" aria-pressed="${on}"${!c&&!on?' aria-disabled="true"':''}><i class="gl gl-${g}" aria-hidden="true"></i>${sh} <span class="n">${c}</span></button>`}).join('')}
const FOPT=[['chg','material','Изменилось','24.09–01.10, меняют вывод или шаг'],['data','failed','Данные','обновление не удалось'],['data','old','Данные','давно не обновлялись'],['data','stale','Данные','устарело'],['lane','resale','Направление','перепродажа'],['lane','new','Направление','новый листинг']];
const fOn=(s,f)=>f[0]==='data'?s.data.includes(f[1]):s[f[0]]===f[1];
function fpHtml(s){const sec=[...new Set(FOPT.map(f=>f[2]))];return `<div class="pl-fph"><p class="h3">Добавить фильтр</p><button class="x" type="button" data-act="pl-fx" aria-label="Закрыть">×</button></div>`+sec.map(n=>`<div class="pl-fs" role="group" aria-label="${n}"><p class="pl-fl">${n}</p>${FOPT.filter(f=>f[2]===n).map(f=>{const c=ALL.filter(i=>match(i,Object.assign({},s,{[f[0]]:f[0]==='data'?[f[1]]:f[1]}))).length;return `<button class="pl-fo" type="button" data-act="pl-fo" data-k="${f[0]}" data-v="${f[1]}" aria-pressed="${fOn(s,f)}"><span>${f[3]}</span><span class="n">${c}</span></button>`}).join('')}</div>`).join('')}
function actHtml(s,n){const p=[];s.state.forEach(g=>p.push(['state',g,'Группа',GN[g]]));FOPT.forEach(f=>{if(fOn(s,f))p.push([f[0],f[1],f[2],f[3]])});if(s.q)p.push(['q',s.q,'Поиск','«'+s.q+'»']);
 if(!p.length)return `<span class="t2"><span class="n">${n}</span> из 16</span>`;
 return p.map(x=>`<span class="pl-pill"><span>${x[2]}: ${esc(x[3])}</span><button type="button" data-act="pl-x" data-k="${x[0]}" data-v="${esc(x[1])}" aria-label="Убрать фильтр ${x[2]}: ${esc(x[3])}">×</button></span>`).join('')+`<span class="t2"><span class="n">${n}</span> из 16</span><button class="lnk" type="button" data-act="pl-reset">Сбросить всё</button>`}
function sortBtn(lbl,k,s){const st=s.sort===k?(k==='changed'?'descending':'ascending'):s.sort===k+(k==='changed'?'-a':'-d')?(k==='changed'?'ascending':'descending'):'none';return {attr:` aria-sort="${st}"`,btn:`<button class="pl-so" type="button" data-act="pl-so" data-k="${k}">${lbl}<span class="pl-si" aria-hidden="true">${st==='ascending'?'↑':st==='descending'?'↓':'↕'}</span></button>`}}
function rowHtml(id,s,moved){const g=grp(id),href='#/p/'+id+'?'+qs(s);const mv=moved&&moved[id];
 return `<div class="pl-r${mv?' pl-mv':''}" role="row" data-id="${id}" data-g="${g}"><div class="pl-c pl-it" role="rowheader"><span class="pl-th">${thumb8(id)}</span><span class="pl-nm"><a class="pl-a" href="${href}" data-pl="${id}" title="${esc(REG[id].title_ru)}">${esc(REG[id].title_ru)}</a><span class="pl-q" title="${esc(LP.verdict(id)||'вывода в данных нет')}">${esc(LP.verdict(id)||'вывода в данных нет')}</span>${tags(id)}</span></div>
<div class="pl-c pl-mb" role="cell">${mv?`<span class="pl-mvn">перешёл: ${GN[g]}${S.dec[id]?' · ваше решение «'+esc(S.dec[id].v)+'» сейчас':''}</span>`:''}${mbOf(id)}</div>
<div class="pl-c pl-of" role="cell">${cOffer(id)}</div><div class="pl-c pl-li" role="cell">${cLim(id)}</div><div class="pl-c pl-df" role="cell">${cDiff(id)}</div><div class="pl-c pl-dt" role="cell">${cData(id,s)}</div></div>`}
function resHtml(s){const R=rowsOf(s),ids=R.ids,n=ALL.filter(i=>match(i,s)).length;
 if(!ids.length){const oth=s.q?ALL.filter(i=>match(i,s,'state')):[];const near=s.q&&!oth.length?ALL.find(i=>norm(REG[i].title_ru).split(/[\s,-]+/).some(w=>w.length>3&&norm(s.q).length>=3&&(w.startsWith(norm(s.q).slice(0,3))))):null;
  return s.q?`<div class="pl-empty" role="status"><p class="h3">По запросу «${esc(s.q)}»${s.state.length?' в «'+s.state.map(g=>GN[g]).join(', ')+'»':''} ничего не найдено</p>${oth.length&&s.state.length?`<p>В других группах найдено <span class="n">${oth.length}</span>: ${oth.map(i=>esc(UI.short[i])+' — '+GN[grp(i)]).join(', ')}. <button class="lnk" type="button" data-act="pl-other">Показать</button></p>`:''}${near?`<p>Возможно, вы искали: <button class="lnk" type="button" data-act="pl-near" data-v="${esc(UI.short[near])}">${esc(REG[near].title_ru)}</button></p>`:''}<p class="t2">Поиск идёт по названию, варианту (например, «400 мл») и номеру товара.</p><button class="btn btn-s sm" type="button" data-act="pl-qx">Сбросить поиск</button></div>`
  :`<div class="pl-empty" role="status"><p class="h3">Ничего не подходит под фильтры</p><p>Активно: ${actNames(s)}. Под все условия сразу не подходит ни один товар.</p><button class="btn btn-s sm" type="button" data-act="pl-reset">Сбросить всё</button></div>`}
 const so1=sortBtn('Товар','name',s),so2=sortBtn('Изменилось','changed',s);
 const gs=GORD.filter(g=>ids.some(i=>(R.moved[i]||grp(i))===g));const showGH=gs.length>1;
 let body='';if(s.sort==='group'){GORD.forEach(g=>{const m=ids.filter(i=>(R.moved[i]||grp(i))===g);if(!m.length)return;const quietG=(g==='stop'||g==='bought')&&title(s)==='Все товары'&&!s.q;const open=!quietG||S.plOpen&&S.plOpen[g];
   body+=(showGH?`<div class="pl-gh pl-gh-${g}" role="row"><div role="cell" class="pl-ghc"><span class="pl-gn"><i class="gl gl-${g}" aria-hidden="true"></i>${GN[g]} <span class="n">${m.length}</span></span>${quietG?`<button class="lnk" type="button" data-act="pl-grp" data-g="${g}" aria-expanded="${open?'true':'false'}">${open?'скрыть':'показать'}</button>`:''}</div></div>`:'')+(open?m.map(i=>rowHtml(i,s,R.moved)).join(''):'')})}
 else body=ids.map(i=>rowHtml(i,s,R.moved)).join('');
 return `<div class="pl-t" role="table" aria-label="${esc(title(s))}: ${n} товаров" aria-rowcount="${ids.length}"><div class="pl-r pl-hr" role="row"><div class="pl-c" role="columnheader"${so1.attr}>${so1.btn}</div><div class="pl-c" role="columnheader">Мешает → дальше</div><div class="pl-c" role="columnheader">Предложение</div><div class="pl-c" role="columnheader"><button class="pl-so" type="button" data-act="pl-limh" aria-controls="pl-lim">Предел<span class="pl-si" aria-hidden="true">?</span></button></div><div class="pl-c" role="columnheader">До предела · основание</div><div class="pl-c" role="columnheader"${so2.attr}><span class="pl-hd2">Данные · </span>${so2.btn}</div></div>${body}</div>`}
const actNames=s=>[...s.state.map(g=>'«'+GN[g]+'»'),...FOPT.filter(f=>fOn(s,f)).map(f=>'«'+f[3]+'»')].join(' + ');
function metaHtml(s,ids){const aff=ids.filter(isFail),k=aff.filter(i=>!isOld(i)).length,bread=aff.some(isOld);
 return `amazon.de · EUR · цены без НДС · разница — не прибыль${aff.length?`<span class="pl-fail">${IC.clkd} обновление 30.09 23:40 не удалось · затронуто <span class="n">${aff.length}</span> из <span class="n">${ids.length}</span><span class="pl-fx2">: у <span class="n">${k}</span> цены на 30.09 18:05${bread?', у Хлебницы — на 19.09':''}</span></span>`:''}`}
function plUpdate(keep){const s=sel(LP.parse().q),R=rowsOf(s),n=ALL.filter(i=>match(i,s)).length;const t=title(s);
 const cur=R.was!=null?ids0(R).length:n;
 $('#pl-h1').innerHTML=T(`${esc(t)} · <span class="n">${cur}</span>${R.was!=null?` <span class="pl-was">(было <span class="n">${R.was}</span>)</span> <button class="lnk pl-rf" type="button" data-act="pl-refresh">Обновить выборку</button>`:''}`);
 $('#pl-meta').innerHTML=T(metaHtml(s,R.ids));$('#pl-chips').innerHTML=T(chipsHtml(s));
 const nf=FOPT.filter(f=>fOn(s,f)).length;$('#pl-fb').textContent=innerWidth<=760?'Фильтры'+(nf?' ('+nf+')':''):'+ Фильтр'+(nf?' · '+nf:'');
 if(!$('#pl-fp').hidden)$('#pl-fp').innerHTML=T(fpHtml(s));
 $('#pl-act').innerHTML=T(actHtml(s,n));$('#pl-gs').innerHTML=T(gOpts(s));$('#pl-sort').value=s.sort.replace(/-[ad]$/,'');$('#pl-res').innerHTML=T(resHtml(s));
 document.title='LotPrism — '+t;
 if(keep){const f=$(keep);f&&f.focus({preventScroll:true})}}
const ids0=R=>R.ids.filter(i=>!R.moved[i]);
function setSel(over,keep){const s=sel(LP.parse().q);const h='#/products'+(qs(s,over)?'?'+qs(s,over):'');history.replaceState(null,'',h);plUpdate(keep)}
LP.plUpdate=plUpdate;

/* ══ дашборд ══ */
function dash8(){const ids=ALL;const by=g=>order(ids.filter(i=>grp(i)===g),'group');
 const fail=ids.filter(isFail),k=fail.filter(i=>!isOld(i)).length;
 const mat=MAT,after=mat.filter(c=>{const d=REG[c.item].decision;return (d&&d.at>c.at)||S.dec[c.item]}).length;
 const rs=g=>{const m=by(g);if(g==='mine')return m.map(i=>UI.short[i]).join(', ')||'никого';if(g==='bought')return m.map(i=>UI.short[i]+(i==='P08'?', партия 2':'')).join(', ');const c={};m.forEach(i=>{const r=reason(i);c[r]=(c[r]||0)+1});return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([r,n])=>r+' '+n).join(' · ')||'—'};
 const shape={mine:'■',wait:'□',blocked:'⬚',stop:'–',bought:'◆'};
 const bar=UI.G.map(([g,n])=>{const m=by(g);return `<li class="dg dg-${g}" style="flex-grow:${Math.max(1,m.length)}"><a class="dg-a" id="dg-${g}" href="#/products?state=${g}&amp;from=dg-${g}" data-fresh><span class="dg-cells" aria-hidden="true">${m.map(()=>'<i></i>').join('')}</span><span class="dg-n"><span class="dg-t">${n}</span> · <span class="n">${m.length}</span><span class="dg-ar" aria-hidden="true"> →</span></span><span class="dg-r">${esc(rs(g))}</span></a></li>`}).join('');
 const frq=i=>{const F=REG[i].freshness;if(F.source!=='DS1')return '';return isOld(i)?`<span class="dm-fr">${IC.clkd}данные на <span class="n">${fdt(F.provider_answered_at).slice(0,5)}</span> · сбой</span>`:`<span class="dm-fr">${IC.clkd}данные на <span class="n">${fdt(F.provider_answered_at)}</span> · сбой</span>`};
 const mine=by('mine').map(i=>{const e=E4[i];const hr='#/p/'+i+'?state=mine&from=dm-'+i;const ch=i==='P02'?`Предложения поставщика нет · предел <b class="n">${SITO['30'].display}</b> — условно, по позиции партии BT01-01.`:e?`<b class="n">${e.offer.display}</b> — на <b class="n">${e.headroom.display}</b> ниже расчётного предела при 30 % (<span class="n">${e.ceiling_30.display}</span>)${i==='P01'?', до доставки':''} · не прибыль.`:esc(mbT(i)[0]);
  const dsub=[frq(i),UI.dsub[i],S.dec[i]?'ваше решение «'+esc(S.dec[i].v)+'» · сейчас':'решения нет'].filter(Boolean).join(' <span aria-hidden="true">·</span> ');
  const mk=k=>k==='chk'?'<span class="ms chk" aria-hidden="true"></span>':k==='u'?'<span class="ms u" role="img" aria-label="неизвестно"></span>':`<span class="dm-ic" aria-hidden="true">${IC.clkd}</span>`;
  const ob=UI.dmb[i]?`<div class="dm-ob"><span class="it-ol">мешает:</span><ul>${UI.dmb[i].map(([k,t])=>`<li>${mk(k)}<span>${esc(t)}</span></li>`).join('')}</ul></div>`:'';
  return `<li class="it3 click dm" data-go="${hr}"><div class="it-m">${thumb8(i)}</div><div class="it-c"><p class="dm-t">${esc(REG[i].title_ru)}</p><p class="it-ch">${ch}</p>${ob}<p class="t2 dm-q">${dsub}</p></div><div class="it-a"><a class="btn btn-s" id="dm-${i}" href="${hr}">${esc(STEP[i])}</a></div></li>`}).join('');
 const clean=t=>esc(t).replace(/потолк[а-я]*/g,'предела').replace(/\bv(\d)\b/g,'версия $1').replace(/покупател[а-я]* BY-\d/g,'покупателю').replace(/BY-\d\s?/g,'').replace(/\(Ирина\)/g,'');
 const rest=CH.filter(c=>c.material_change!==true);
 const isDec=c=>!c.change_kind&&/решение «/.test(c.what);
 const cat=[['не меняют',rest.filter(c=>!isDec(c)&&c.material_change===false)],['существенность не задана',rest.filter(c=>!isDec(c)&&c.material_change==null&&c.item)],['ваши решения',rest.filter(isDec)],['другое',rest.filter(c=>!isDec(c)&&c.material_change==null&&!c.item)]];
 LP.chgSum8=MAT.length+cat.reduce((a,c)=>a+c[1].length,0);
 const chRow=c=>`<li class="dc"><span class="tm n">${fdt(c.at).slice(0,5)}</span><span>${UI.chg[c.item]?esc(UI.chg[c.item]):clean(c.what)}${c.item==='P03'&&REG.P03.decision?`<span class="t2 dc-s">после изменения: ваше решение «${esc(REG.P03.decision.value_ru)}» ${fdt(REG.P03.decision.at)}</span>`:''}</span></li>`;
 const matRows=mat.slice().sort((a,b)=>a.at<b.at?-1:1);
 return `<main class="main d8" id="main"><div class="pg-h"><h1 class="h1">Главная</h1><p class="t2">на 01.10.2026 10:00 · amazon.de · EUR · цены без НДС</p></div>
<section aria-labelledby="dmsg"${av('prod')}><h2 class="sr-only" id="dmsg">Сообщения</h2><ul class="msg">
<li class="msg-r msg-f"><span class="msg-g" role="img" aria-label="сбой обновления">${IC.clkd}</span><div class="msg-tx"><button class="lnk msg-tg" type="button" data-act="msg-tg" aria-expanded="false"><span>Сбой обновления <span class="n">30.09 23:40</span></span><span class="msg-cv" aria-hidden="true">▾</span></button><p><span class="msg-x">Обновление цен Amazon (Keepa) <span class="n">30.09 23:40</span> не удалось · у <span class="n">${k}</span> товаров данные на <span class="n">30.09 18:05</span>, у Хлебницы — на <span class="n">19.09</span> · если цена после этого изменилась, выводы её не учитывают.</span></p><span class="req-w msg-rp"><button class="btn btn-s sm" type="button" data-act="na" data-what="Повторить обновление" data-msg="имитация · в продукте нет" data-av="no" data-avl="нет в продукте">Повторить обновление</button><span class="req-tag">имитация · в продукте нет</span></span></div><div class="msg-a"><a class="btn btn-s sm" id="dm-fail" href="#/products?data=failed&amp;from=dm-fail" data-fresh${av('dev')}><span>Показать ${fail.length}<span class="msg-al"> товаров</span><span class="msg-ar" aria-hidden="true"> →</span></span></a></div></li>
<li class="msg-r"><span class="msg-g" aria-hidden="true">↻</span><div class="msg-tx"><p><span class="msg-s">Изменилось <span class="n">24.09–01.10</span></span><span class="msg-x">Изменилось 24.09–01.10: у <span class="n">${mat.length}</span> товаров меняется вывод или шаг · после <span class="n">${after}</span> уже есть ваше решение.</span></p></div><div class="msg-a"><a class="btn btn-s sm" id="dm-chg" href="#/products?chg=material&amp;from=dm-chg" data-fresh><span><span class="msg-al">Показать </span>${mat.length}<span class="msg-ar" aria-hidden="true"> →</span></span></a></div></li>
<li class="msg-r"${av('hyp')}><span class="msg-g" aria-hidden="true">✓</span><div class="msg-tx"><p><span class="msg-al">Готов и</span><span class="msg-s">И</span>тог: Чайник — 2 предложения<span class="msg-al"> поставщиков</span>.</p></div><div class="msg-a"><a class="btn btn-s sm" id="dm-res" href="#/p/P01" data-act="d-cmp"><span>Открыть<span class="msg-al"> предложения</span><span class="msg-ar" aria-hidden="true"> →</span></span></a></div></li></ul></section>
<section class="sec" aria-labelledby="dg-h"${av('des')}><div class="sec-h"><h2 class="h2" id="dg-h">Где сейчас ваши товары · <span class="n">${ids.length}</span></h2><p class="t2">группы собраны из шага LotPrism и ваших записей · это не оценка и не приоритет</p></div><ul class="dgs">${bar}</ul></section>
<section class="sec" aria-labelledby="dm-h"${av('dev')}><div class="sec-h"><h2 class="h2" id="dm-h"><a href="#/products?state=mine&amp;from=dm-h" id="dm-hl" data-fresh>Ваш ход · <span class="n">${by('mine').length}</span></a></h2><p class="t2">дольше всего без движения — сверху · дата неизвестна — в конце, по номеру товара · приоритета LotPrism нет</p></div><ul class="rows it3-l">${mine||'<li class="t2">сейчас ход не за вами</li>'}</ul></section>
<section class="sec" aria-labelledby="dd-h"${av('hyp')}><div class="sec-h"><h2 class="h2" id="dd-h">Срок</h2></div><div class="line8"><p>Партия <span class="code">BT-01</span> · LotPrism Research, другой раздел · предложение до <span class="n">08.10 18:00</span> · спрос не подтверждён</p><a class="btn btn-s sm" href="#/research/BT-01">Открыть в LotPrism Research ↗</a></div></section>
<section class="sec" aria-labelledby="dc-h"${av('dev')}><div class="sec-h"><h2 class="h2" id="dc-h"><a href="#/products?chg=material&amp;from=dc-hl" id="dc-hl" data-fresh>Изменилось 24.09–01.10 · меняют вывод или шаг · <span class="n">${mat.length}</span></a></h2><p class="t2">было → стало, с причиной</p></div>
<ul class="rows dcs">${matRows.map(chRow).join('')}</ul><div class="dc-more">${cat.map(([n,a],i)=>a.length?acc('dc'+i,`<span class="sq">${n} · <span class="n">${a.length}</span></span>`,`<ul class="rows dcs">${a.map(chRow).join('')}</ul>`):'').join('')}</div></section>
<section class="sec" aria-labelledby="dk-h"${av('prod')}><div class="sec-h"><h2 class="h2" id="dk-h">Деньги</h2></div><div class="line8 money"><p>Вложено за всё время <b class="n">${CP.lifetime_committed.display}</b> ${K.FACT} <span class="t2">с доставкой</span></p><p><a href="#/products?state=bought&amp;from=dk-op" id="dk-op" data-fresh>Сумма закупки открытых позиций</a> <b class="n">${CP.open_cost_basis.display}</b> ${K.FACT} <span class="t2">без доставки, при продажах не уменьшается</span></p><p class="t2">величины не складываются · свободный капитал <span class="ms u">неизвестен</span></p></div></section></main>`}

/* ══ карточка: связь с выборкой ══ */
function cardCtx(pid,q){const s=sel(q);const has=PK.some(k=>q.has(k));const R=rowsOf(s);let ids=R.ids;if(!ids.includes(pid)){/* товар вне выборки — показываем все */}
 const t=title(s),n=R.was!=null?ids0(R).length:ALL.filter(i=>match(i,s)).length,i=ids.indexOf(pid),nx=ids[i+1];const lh='#/products'+(qs(s)?'?'+qs(s):'');
 const navIn=(cls)=>`<nav class="ctx ${cls}" aria-label="Выборка"${av('dev')}><a class="ctx-b" href="${lh}" data-back><span aria-hidden="true">← </span><span class="ctx-l">${esc(t)} · <span class="n">${n}</span></span><span class="ctx-m">Список</span></a>${i>=0?`<span class="ctx-k t2"><span class="n">${i+1}</span> из <span class="n">${ids.length}</span></span>${nx?`<a class="ctx-n" href="#/p/${nx}?${qs(s)}">следующий →</a>`:''}`:''}</nav>`;
 const nav=navIn('ctx-top');
 const li=id=>{const g=R.moved[id]||grp(id);const [m,nx2]=id==='P16'&&!S.dec.P16?['решения по версии 2 нет · по версии 1 «Отложить», 30.09',mbT(id)[1]]:mbT(id);return `<div class="li" role="option" id="li-${id}" data-id="${id}" tabindex="${id===pid?0:-1}" aria-selected="${id===pid}" aria-describedby="lst-hint">${thumb8(id)}<span class="tx"><b title="${esc(REG[id].title_ru)}">${esc(REG[id].title_ru)}</b><small class="li-m"><span class="li-g">${R.moved[id]?'перешёл: '+GN[grp(id)]:GN[g]}</span>${m?' · '+esc(m):''}</small><small class="li-n">→ ${esc(nx2)}</small></span></div>`};
 const aside=`<aside class="lst" id="lst" aria-label="${esc(t)}"><div class="lst-strip"><button class="btn btn-s sm" type="button" data-act="lstopen">Список</button></div>
<div class="lst-h"${av('dev')}><div class="r">${navIn('ctx-side')}<button class="x lst-x" type="button" data-act="lstopen" aria-label="Закрыть список">×</button></div><span class="t2">${s.sort==='group'?'по группам · дольше всего без движения — сверху':s.sort.startsWith('name')?'по названию':'по последнему изменению'}</span></div>
<div role="listbox" aria-label="${esc(t)}" id="lbx"${av('dev')}>${ids.map(li).join('')}</div><span class="sr-only" id="lst-hint">Enter — открыть товар</span></aside>`;
 return {nav,aside,s,has,n}}
function frLine(id){const F=REG[id].freshness;if(F.source==='DS1')return `<span class="ms nu">${IC.clkd}обновление 30.09 23:40 не удалось · данные на ${isOld(id)?fdt(F.provider_answered_at).slice(0,5):fdt(F.provider_answered_at)}</span>${isStale(id)?` <span class="ms old">${IC.clk}устарело: цена не менялась с 09.08</span>`:''}`;if(F.source==='DS2')return `данные на ${fdt(F.provider_answered_at).slice(0,5)} · другой источник`;return `архив ${fdt(F.provider_answered_at).slice(0,5)}`}
function patchCard(pid,q){const w=$('.w-list');if(!w)return;const c=cardCtx(pid,q);const a=w.querySelector('aside.lst');if(a)a.outerHTML=T(c.aside);const cd=$('#cd');if(cd&&!$('.ctx-top',cd))cd.insertAdjacentHTML('afterbegin',T(c.nav));
 $$('.cd-h .ttl>p.t2 .ms.nu').forEach(e=>{let p=e.previousSibling;while(p&&(p.nodeType===3&&!p.textContent.trim()||p.classList&&(p.classList.contains('m-br')||p.classList.contains('m-sep')))){const q=p.previousSibling;p.remove();p=q}e.remove()});
 const tt=$('.cd-h .ttl');if(tt&&!$('.cd-fr',tt))tt.insertAdjacentHTML('beforeend',`<p class="cd-fr t2">${frLine(pid)}</p>`);
 const ml=$('#mlist');if(ml)ml.textContent='Товары выборки · '+c.n;
 snapshot(c.s);ss.set('lp8:last:'+keyOf(c.s),pid)}

/* ══ маршрут ══ */
const _route=LP.route;
LP.route=function(){const r=LP.parse();
 if(r.q.get('filter')==='ds1'){history.replaceState(null,'','#/products?data=failed');return LP.route()}
 _route();
 const rail=$('#rail');if(rail){rail.classList.remove('open');const mn=$('.mnav');mn&&mn.setAttribute('aria-expanded','false');
  const s=sel(r.q);$$('a',rail).forEach(a=>{const h=a.getAttribute('href');if(h==='#/p/P01'){a.setAttribute('href','#/products?lane=resale');a.dataset.fresh=''}else if(h==='#/p/P06'){a.setAttribute('href','#/products?lane=new');a.dataset.fresh='';a.insertAdjacentHTML('beforeend','<span class="c">'+NL.length+'</span>')}});
  const cl=r.p==='/products'?(s.lane==='new'?'#/products?lane=new':s.lane==='resale'?'#/products?lane=resale':null):null;$$('a',rail).forEach(a=>{if(r.p==='/products'||r.p.startsWith('/p/'))a.removeAttribute('aria-current');if(cl&&a.getAttribute('href')===cl)a.setAttribute('aria-current','page')})}
 if(S.view!=='user')return;
 if(r.p==='/'||r.p===''){$('#view').innerHTML=T(dash8());const f=ss.get('lp8:from');if(f){ss.del('lp8:from');setTimeout(()=>{const el=document.getElementById(f);if(el){el.focus({preventScroll:true});near(el)}},0)}}
 else if(r.p==='/products'){$('#view').innerHTML=T(plPage(r.q));plUpdate();const s0=sel(r.q);setTimeout(()=>restore(s0),0)}
 else if(r.p.startsWith('/p/')){const pid=r.p.slice(3);if(REG[pid])patchCard(pid,r.q);const o=ss.get('lp8:open');if(o){ss.del('lp8:open');const t=$(`.acc-t[data-id="${o}"]`);if(t){if(t.getAttribute('aria-expanded')!=='true')t.click();t.focus({preventScroll:true});near(t,120)}}}
};
function near(el,pad){const b=el.getBoundingClientRect(),top=pad||72;if(b.top<top)scrollBy(0,b.top-top);else if(b.bottom>innerHeight-16)scrollBy(0,b.bottom-innerHeight+16+(innerWidth<=760?80:0))}
function restore(s){const k=keyOf(s),snap=ss.get(k),last=ss.get('lp8:last:'+k);
 if(snap&&snap.scroll!=null)scrollTo(0,snap.scroll);else scrollTo(0,0);
 const a=last&&$(`.pl-a[data-pl="${last}"]`);if(a){a.focus({preventScroll:true});near(a);const row=a.closest('.pl-r');row.classList.add('pl-here');setTimeout(()=>row.classList.remove('pl-here'),700)}else{const h=$('#pl-h1');h&&h.focus({preventScroll:true})}}

/* ══ действия ══ */
Object.assign(LP.ACT,{
 'pl-chip':b=>{if(b.getAttribute('aria-disabled')==='true')return;const s=sel(LP.parse().q),g=b.dataset.g;let st=g?(s.state.includes(g)?s.state.filter(x=>x!==g):s.state.concat(g)):[];setSel({state:st},`.pl-chip[data-g="${g}"]`)},
 'pl-fb':b=>{const p=$('#pl-fp');if(!p.hidden){fpClose(true);return}p.innerHTML=T(fpHtml(sel(LP.parse().q)));p.hidden=false;b.setAttribute('aria-expanded','true');if(innerWidth<=760){const bd=document.createElement('div');bd.className='sheet-bd pl-bd';bd.dataset.act='pl-fx';document.body.append(bd);requestAnimationFrame(()=>bd.dataset.open='1')}setTimeout(()=>{p.dataset.open='1';const f=$('.pl-fo',p);f&&f.focus()},0)},
 'pl-fx':()=>fpClose(true),
 'pl-fo':b=>{const s=sel(LP.parse().q),k=b.dataset.k,v=b.dataset.v;let o={};if(k==='data')o.data=s.data.includes(v)?s.data.filter(x=>x!==v):s.data.concat(v);else o[k]=s[k]===v?'':v;setSel(o,`.pl-fo[data-k="${k}"][data-v="${v}"]`)},
 'pl-x':b=>{const s=sel(LP.parse().q),k=b.dataset.k,v=b.dataset.v;const o={};if(k==='state')o.state=s.state.filter(x=>x!==v);else if(k==='data')o.data=s.data.filter(x=>x!==v);else{o[k]='';if(k==='q')$('#pl-q').value=''}setSel(o,'#pl-q')},
 'pl-reset':()=>{$('#pl-q').value='';setSel({state:[],lane:'',chg:'',data:[],q:''},'#pl-q')},
 'pl-qx':()=>{$('#pl-q').value='';setSel({q:''},'#pl-q')},
 'pl-other':()=>setSel({state:[]},'.pl-a'),
 'pl-near':b=>{$('#pl-q').value=b.dataset.v;setSel({q:b.dataset.v},'#pl-q')},
 'pl-so':b=>{const s=sel(LP.parse().q),k=b.dataset.k;const seq=k==='name'?['name','name-d','group']:['changed','changed-a','group'];const i=seq.indexOf(s.sort);setSel({sort:i<0?seq[0]:seq[(i+1)%seq.length]},`.pl-so[data-k="${k}"]`)},
 'pl-grp':b=>{S.plOpen=S.plOpen||{};S.plOpen[b.dataset.g]=!S.plOpen[b.dataset.g];plUpdate(`.pl-gh-${b.dataset.g} button`)},
 'pl-refresh':()=>{const s=sel(LP.parse().q);const run=()=>{ss.del(keyOf(s));plUpdate('#pl-h1')};const m=$$('.pl-mv');if(!m.length||matchMedia('(prefers-reduced-motion: reduce)').matches){run();return}m.forEach(r=>r.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateX(16px)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)',fill:'forwards'}));setTimeout(run,200)},
 'pl-dem':()=>{const t=$('.acc-t[data-id="pl-how"]');if(t.getAttribute('aria-expanded')!=='true')t.click();const p=$('#pl-demand');p.tabIndex=-1;p.focus({preventScroll:true});near(p)},
 'pl-home':()=>{const s=sel(LP.parse().q);if(s.from)ss.set('lp8:from',s.from);location.hash='#/'},
 'd-cmp':()=>{ss.set('lp8:open','cmp');location.hash='#/p/P01'},
 'msg-tg':b=>{const li=b.closest('.msg-r'),o=!li.classList.contains('open');li.classList.toggle('open',o);b.setAttribute('aria-expanded',o)},
 'pl-limh':()=>{const t=$('.acc-t[data-id="pl-how"]');if(t.getAttribute('aria-expanded')!=='true')t.click();const p=$('#pl-lim');p.tabIndex=-1;p.focus({preventScroll:true});near(p)}
});
function fpClose(ret){const p=$('#pl-fp');if(!p||p.hidden)return;p.hidden=true;p.dataset.open='0';const bd=$('.pl-bd');bd&&bd.remove();const b=$('#pl-fb');b.setAttribute('aria-expanded','false');if(ret)b.focus()}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#pl-fp')&&!$('#pl-fp').hidden){e.stopPropagation();e.preventDefault();fpClose(true)}},true);
document.addEventListener('click',e=>{const p=$('#pl-fp');if(p&&!p.hidden&&!e.target.closest('.pl-fw'))fpClose(false);
 const a=e.target.closest('a[href]');const dg=e.target.closest('.d8 [data-go]');if(dg&&!a){const hq=dg.dataset.go.split('?')[1]||'';const s=sel(new URLSearchParams(hq));ss.del(keyOf(s));ss.del('lp8:last:'+keyOf(s))}if(!a)return;const h=a.getAttribute('href');
 if(a.closest('.d8')&&h.startsWith('#/p/')){const s=sel(new URLSearchParams(h.split('?')[1]||''));ss.del(keyOf(s));ss.del('lp8:last:'+keyOf(s))}
 if(a.classList.contains('pl-a')){const s=sel(LP.parse().q);snapshot(s);const k=keyOf(s),v=ss.get(k);v.scroll=scrollY;ss.set(k,v)}
 if(h.startsWith('#/products')&&a.hasAttribute('data-fresh')){const s=sel(new URLSearchParams(h.split('?')[1]||''));ss.del(keyOf(s));ss.del('lp8:last:'+keyOf(s))}},true);
document.addEventListener('input',e=>{if(e.target.id==='pl-q')setSel({q:e.target.value.trim()},null)});
document.addEventListener('change',e=>{if(e.target.id==='pl-sort')setSel({sort:e.target.value},'#pl-sort');if(e.target.id==='pl-gs'){const v=e.target.value;if(v!=='multi')setSel({state:v?[v]:[]},'#pl-gs')}});
addEventListener('resize',()=>{const b=$('#pl-fb');if(!b)return;const s=sel(LP.parse().q),nf=FOPT.filter(f=>fOn(s,f)).length;b.textContent=innerWidth<=760?'Фильтры'+(nf?' ('+nf+')':''):'+ Фильтр'+(nf?' · '+nf:'')});
/* правка 3: неразрывность (число+единица, код партии, дата+время) и разделители «·» на телефоне — не в начале строки */
const NBR=[[/(\d) (л|мл|см|мм|шт\.|кг|г|°C)(?=[\s,.;)»]|$)/g,'$1\u00a0$2'],[/за (\d+) шт\./g,'за\u00a0$1\u00a0шт.'],[/(\d\d\.\d\d) (\d\d:\d\d)/g,'$1\u00a0$2'],[/\b([A-Z]{2}\d{2})-(\d{2})\b/g,'$1-\u2060$2']];
function nb8(root){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){let t=n.data,o=t;for(const [r,v] of NBR)t=t.replace(r,v);if(t!==o)n.data=t}}
function seps8(){if(innerWidth>760)return;$$('.pl-r:not(.pl-hr)').forEach(r=>{const els=[...r.querySelectorAll('.pl-li>.pl-m,.pl-li>.pl-w,.pl-df>.pl-d,.pl-df>.pl-w,.pl-df>.pl-s,.pl-dt>.pl-s')];els.forEach(e=>e.classList.remove('nosep'));for(let k=0;k<4;k++){const L=r.getBoundingClientRect().left;let ch=0;els.forEach(e=>{if(!e.classList.contains('nosep')&&e.getBoundingClientRect().left-L<2){e.classList.add('nosep');ch++}});if(!ch)break}})}
let raf8=0;const run8=()=>{clearTimeout(raf8);raf8=setTimeout(()=>{document.querySelectorAll('main.pl,main.d8').forEach(nb8);seps8()},30)};
new MutationObserver(run8).observe(document.body,{childList:true,subtree:true});addEventListener('resize',run8);if(window.ResizeObserver){let w8=0;new ResizeObserver(e=>{const w=e[0].contentRect.width;if(w!==w8){w8=w;run8()}}).observe(document.documentElement)}
LP.route();
})();
