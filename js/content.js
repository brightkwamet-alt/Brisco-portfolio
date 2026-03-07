/**
 * Brisco Media – load news and artwork from JSON and render on the page.
 * Edit data/news.json and data/artwork.json to add or change content.
 */
(function () {
  'use strict';

  const DATA_DIR = 'data';

  /** Base URL so image paths work from any page (index, news, gallery) and with file:// */
  function getBaseUrl() {
    var href = window.location.href.replace(/[#?].*$/, '');
    return href.indexOf('/') === -1 ? '' : href.replace(/[^/]+$/, '');
  }

  function resolveImgSrc(path) {
    if (!path) return '';
    if (path.indexOf('http:') === 0 || path.indexOf('https:') === 0 || path.indexOf('//') === 0) return path;
    var base = getBaseUrl();
    return base ? (base + path.replace(/^\//, '')) : path;
  }

  function escapeHtml(text) {
    if (text == null) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Placeholder when image fails to load (gray box) */
  var placeholderSvg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="#1a1a1a" width="400" height="300"/><text fill="#666" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14">Image</text></svg>');

  function renderNewsCard(item) {
    var src = resolveImgSrc(item.image);
    var idAttr = item.id ? ' id="' + escapeHtml(item.id) + '"' : '';
    return (
      '<div class="news-card">' +
      '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(item.alt || item.title) + '" class="modal-img" onerror="this.onerror=null;this.src=\'' + placeholderSvg + '\'">' +
      '<h3' + idAttr + '>' + escapeHtml(item.title) + '</h3>' +
      '<p>' + escapeHtml(item.description) + '</p>' +
      '</div>'
    );
  }

  function renderTrendingCard(item) {
    var src = resolveImgSrc(item.image);
    var id = item.id || '';
    var link = id ? 'news.html#' + escapeHtml(id) : 'news.html';
    return (
      '<article class="trending-card">' +
      '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(item.alt || item.title) + '" class="trending-img modal-img" onerror="this.onerror=null;this.src=\'' + placeholderSvg + '\'">' +
      '<div class="trending-content">' +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<p>' + escapeHtml(item.description) + '</p>' +
      '<a href="' + link + '">Read More →</a>' +
      '</div>' +
      '</article>'
    );
  }

  function renderArtItem(item) {
    var src = resolveImgSrc(item.src);
    return (
      '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(item.alt || 'Art') + '" class="modal-img" onerror="this.onerror=null;this.src=\'' + placeholderSvg + '\'">'
    );
  }

  function fetchJson(path) {
    var url = path.indexOf('http') === 0 ? path : (getBaseUrl() + path);
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('Could not load ' + path);
      return res.json();
    });
  }

  function loadNews() {
    var container = document.querySelector('.news-grid');
    if (!container) return;
    fetchJson(DATA_DIR + '/news.json')
      .then(function (news) {
        container.innerHTML = news.map(renderNewsCard).join('');
      })
      .catch(function () {
        container.innerHTML = '<p class="content-error">News could not be loaded. Check that <code>data/news.json</code> exists.</p>';
      });
  }

  function loadArtwork() {
    var container = document.querySelector('.art-section .art-grid');
    if (!container) return;
    fetchJson(DATA_DIR + '/artwork.json')
      .then(function (artwork) {
        container.innerHTML = artwork.map(renderArtItem).join('');
      })
      .catch(function () {
        container.innerHTML = '<p class="content-error">Artwork could not be loaded. Check that <code>data/artwork.json</code> exists.</p>';
      });
  }

  function loadHome() {
    var trendingEl = document.querySelector('body.home .trending-grid');
    var artEl = document.querySelector('body.home .art-section .art-grid');
    if (!trendingEl && !artEl) return;

    function done() {
      if (trendingEl && window.__briscoNews) {
        var first = window.__briscoNews.slice(0, 2);
        trendingEl.innerHTML = first.map(renderTrendingCard).join('');
      }
      if (artEl && window.__briscoArtwork) {
        artEl.innerHTML = window.__briscoArtwork.map(renderArtItem).join('');
      }
    }

    Promise.all([
      fetchJson(DATA_DIR + '/news.json').then(function (n) { window.__briscoNews = n; return n; }),
      fetchJson(DATA_DIR + '/artwork.json').then(function (a) { window.__briscoArtwork = a; return a; })
    ]).then(done).catch(function () {
      if (trendingEl) trendingEl.innerHTML = '<p class="content-error">Content could not be loaded.</p>';
      if (artEl) artEl.innerHTML = '<p class="content-error">Artwork could not be loaded.</p>';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  function run() {
    if (document.body.classList.contains('home')) {
      loadHome();
    } else {
      if (document.querySelector('.news-grid')) loadNews();
      if (document.querySelector('.art-section .art-grid')) loadArtwork();
    }
  }
})();
