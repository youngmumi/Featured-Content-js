// script.js: Adapted for "추천 콘텐츠" index page without hero section

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
  if (!category || category === 'all') return list;
  return list.filter(item => item.category === category);
}

// 3) Render card grid
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

// 4) Setup search and clear button
function setupSearch(contents, currentCat = '') {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');

  const performSearch = () => {
    const term = input.value.trim().toLowerCase();
    let list = filterByCategory(contents, currentCat);
    if (term) {
      list = list.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.genre.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term)
      );
    }
    renderCards(list);
    clearBtn.classList.toggle('visible', term.length > 0);
  };

  const debounced = debounce(performSearch, 300);
  input.addEventListener('input', debounced);
  clearBtn.addEventListener('click', () => {
    input.value = '';
    performSearch();
    input.focus();
  });
}

// 5) Setup category filter buttons
function setupFilters(contents, currentCat = '') {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter and render
      const cat = btn.dataset.cat || '';
      currentCat = cat;
      const list = filterByCategory(contents, cat);
      renderCards(list);

      // Clear search input when changing category
      const input = document.getElementById('searchInput');
      input.value = '';
      document.getElementById('clearSearch').classList.remove('visible');
    });
  });
}

// 6) Initialize index page
window.addEventListener('DOMContentLoaded', async () => {
  const contents = await loadContents();
  const params = new URLSearchParams(location.search);
  const currentCat = params.get('cat') || '';

  // Initial render
  const initialList = filterByCategory(contents, currentCat);
  renderCards(initialList);

  // Highlight active category button
  document.querySelector(`.filter-btn[data-cat="${currentCat}"]`)?.classList.add('active');

  // Initialize interactions
  setupFilters(contents, currentCat);
  setupSearch(contents, currentCat);
});
