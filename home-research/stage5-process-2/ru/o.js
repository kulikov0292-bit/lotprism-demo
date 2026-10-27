/* o.js · раздел #offer: смена состояния с клавиатуры не анимируется (html.kb), с мыши/касания — короткий вход из r.css «06». Без зависимостей */
(function(){var H=document.documentElement;
addEventListener('keydown',function(e){if(/^(Arrow|Home|End|Enter| )/.test(e.key))H.classList.add('kb')},true);
addEventListener('pointerdown',function(){H.classList.remove('kb')},true);})();
