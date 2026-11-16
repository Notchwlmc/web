/* ============================================================
   动态搜索脚本  search.js
   功能：对 #content-area 中动态加载的 .plugin-card 做实时搜索
   匹配字段：标题(h3) + 描述(.card-info p) + 标签(.tags span)
   触发：输入框实时(input) + 搜索按钮点击 + 切换标签页后自动重新生效
   依赖：页面上存在 <input class="input">、<button id="searchbtn">、#content-area
   ============================================================ */
(function () {
  'use strict';

  // 1) 注入必要样式（隐藏命中失败的卡片 + 无结果提示），保证脚本自包含
  if (!document.getElementById('search-style')) {
    var style = document.createElement('style');
    style.id = 'search-style';
    style.textContent =
      '.plugin-card.hidden{display:none !important;}' +
      '.search-empty{color:#25e6c5;text-align:center;padding:40px;font-size:1.1rem;}';
    document.head.appendChild(style);
  }

  var input = document.querySelector('.input') || document.getElementById('input');
  var searchBtn = document.getElementById('searchbtn');
  var contentArea = document.getElementById('content-area');
  if (!input || !contentArea) return;

  // 2) 核心搜索：每次从内容区实时取卡片，兼容动态渲染
  function applyFilter() {
    var keyword = (input.value || '').toLowerCase().trim();
    var cards = contentArea.querySelectorAll('.plugin-card');
    var visible = 0;

    cards.forEach(function (card) {
      // 标题：优先 .title，回退 h3
      var titleEl = card.querySelector('.title') || card.querySelector('h3');
      var title = titleEl ? titleEl.textContent : '';
      // 描述
      var descEl = card.querySelector('.card-info p');
      var desc = descEl ? descEl.textContent : '';
      // 标签
      var tags = Array.prototype.map.call(
        card.querySelectorAll('.tags span'),
        function (t) { return t.textContent; }
      ).join(' ');

      var haystack = (title + ' ' + desc + ' ' + tags).toLowerCase();
      var matched = keyword === '' || haystack.indexOf(keyword) !== -1;

      // 卡片可能被 <a> 包裹，显隐要作用到最外层包裹
      var target = (card.parentElement && card.parentElement.tagName === 'A')
        ? card.parentElement : card;

      if (matched) {
        target.classList.remove('hidden');
        visible++;
      } else {
        target.classList.add('hidden');
      }
    });

    // 3) 无结果提示（关键词非空且一张都没匹配时显示）
    var old = contentArea.querySelector('.search-empty');
    if (old) old.remove();
    if (keyword !== '' && visible === 0 && cards.length > 0) {
      var tip = document.createElement('div');
      tip.className = 'search-empty';
      tip.textContent = '未找到与「' + input.value.trim() + '」相关的资源';
      contentArea.appendChild(tip);
    }
  }

  // 4) 事件绑定：输入实时 + 按钮点击
  input.addEventListener('input', applyFilter);
  if (searchBtn) searchBtn.addEventListener('click', applyFilter);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') applyFilter();
  });

  // 5) 监听内容区 DOM 变化：loadPage 切换标签注入新卡片后，自动套用当前关键词
  var observer = new MutationObserver(function () {
    applyFilter();
  });
  observer.observe(contentArea, { childList: true, subtree: true });

  // 初次执行一次，覆盖首次渲染
  applyFilter();
})();
