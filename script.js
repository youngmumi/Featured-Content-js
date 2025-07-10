// Util: Debounce function
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 1) Load contents from JSON, return fallback on error
async function loadContents() {
  try {
    const res = await fetch('data/contents.json');
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Failed to load contents:', e);
    return [{
      id: 0,
      title: '샘플 콘텐츠',
      category: 'drama',
      year: 2023,
      genre: '드라마',
      poster: 'https://via.placeholder.com/300x375/667eea/ffffff?text=Sample',
      description: '데이터를 불러올 수 없습니다. 네트워크 연결을 확인해주세요.',
      rating: 0
    }];
  }
}

// 2) Filter by category
function filterByCategory(list, category) {
  return (!category || category === 'all')
    ? list
    : list.filter(item => item.category === category);
}

// 3) Render hero section
function renderHero(item) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  hero.style.backgroundImage = `url(${item.poster})`;
  hero.querySelector('.hero-title').textContent = item.title;
  hero.querySelector('.hero-meta').textContent = `${item.year} · ${item.genre}`;
}

// 4) Render card grid
function renderCards(items) {
  const grid = document.getElementById('cardGrid');
  if (!grid) return;
  grid.innerHTML = items.map(item => `
    <a href="detail.html?id=${item.id}" class="card">
      <div class="card-img" style="background-image:url(${item.poster});"></div>
      <div class="card-overlay">
        <h3>${item.title}</h3>
        <p>${item.year} · ${item.genre}</p>
      </div>
    </a>
  `).join('');
}

// 5) Render detail page
function renderDetail(item) {
  const container = document.getElementById('detail');
  if (!container) return;
  let infoHTML = `<p>${item.description}</p>`;

  const meta = [];
  if (item.director) meta.push(`<p><strong>감독:</strong> ${item.director}</p>`);
  if (item.cast)     meta.push(`<p><strong>출연:</strong> ${item.cast.join(', ')}</p>`);
  if (item.episodes) meta.push(`<p><strong>에피소드:</strong> ${item.episodes}화</p>`);
  if (item.awards)   meta.push(`<p><strong>수상:</strong> ${item.awards.join(', ')}</p>`);

  container.innerHTML = `
    <img src="${item.poster}" alt="${item.title}" class="detail-image">
    <div class="info">
      <h2>${item.title}</h2>
      <div class="meta">
        <span>${item.year}</span>
        <span>${item.genre}</span>
        <span>평점: ${item.rating}/10</span>
      </div>
      ${infoHTML}
      <div class="additional-info">
        ${meta.join('')}
      </div>
    </div>
  `;
}

// 6) Setup search and clear
function setupSearch(contents, currentCat = '') {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const perform = () => {
    const term = input.value.trim().toLowerCase();
    let list = filterByCategory(contents, currentCat);
    if (term) {
      list = list.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.genre.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }
    if (document.querySelector('.hero')) {
      if (list.length) {
        renderHero(list[0]);
        renderCards(list.slice(1));
      } else {
        renderCards([]);
      }
    } else {
      renderCards(list);
    }
    clearBtn.classList.toggle('visible', !!term);
  };
  const debounced = debounce(perform, 300);
  input.addEventListener('input', debounced);
  clearBtn?.addEventListener('click', () => {
    input.value = '';
    perform();
    input.focus();
  });
}

// 7) Setup filters
function setupFilters(contents) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat || '';
      const list = filterByCategory(contents, cat);
      if (document.querySelector('.hero')) {
        if (list.length) {
          renderHero(list[0]);
          renderCards(list.slice(1));
        } else {
          renderCards([]);
        }
      } else {
        renderCards(list);
        const titleEl = document.getElementById('pageTitleHeading');
        if (titleEl) {
          titleEl.textContent = { '': '전체', drama: '드라마', movie: '영화', game: '게임', book: '책' }[cat] || '전체';
        }
      }
      setupSearch(contents, cat);
    });
  });
}

// 8) Initialize page
window.addEventListener('DOMContentLoaded', async () => {
  const contents = await loadContents();
  const path = window.location.pathname;
  if (path.includes('detail.html')) {
    const id = parseInt(new URLSearchParams(location.search).get('id'));
    const item = contents.find(c => c.id === id);
    if (item) renderDetail(item);
    else document.getElementById('detail').innerHTML = '<div class="error">콘텐츠를 찾을 수 없습니다.</div>';
    document.title = item ? `${item.title} - 상세 정보` : '상세 정보';
  } else {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat') || '';
    const list = filterByCategory(contents, cat);
    if (path.includes('category.html')) {
      renderCards(list);
    } else {
      if (contents.length) {
        renderHero(contents[0]);
        renderCards(contents.slice(1));
      }
    }
    setupFilters(contents);
    setupSearch(contents, cat);
    document.querySelector(`.filter-btn[data-cat="${cat}"]`)?.classList.add('active');
  }
});
