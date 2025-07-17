// script.js: detail.html 전용

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

// 2) Render detail into #detail container
function renderDetail(item) {
  const container = document.getElementById('detail');
  if (!container) return;
  // Clear loading state
  container.innerHTML = '';

  const img = document.createElement('img');
  img.src = item.poster;
  img.alt = item.title;
  img.className = 'detail-image';

  const info = document.createElement('div');
  info.className = 'info';

  const titleEl = document.createElement('h2');
  titleEl.textContent = item.title;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<span>${item.year}</span> · <span>${item.genre}</span> · <span>평점: ${item.rating}/10</span>`;

  const desc = document.createElement('p');
  desc.textContent = item.description;

  info.append(titleEl, meta, desc);

  // 추가 정보
  if (item.director || item.cast || item.episodes || item.awards) {
    const add = document.createElement('div');
    add.className = 'additional-info';
    if (item.director) add.innerHTML += `<p><strong>감독:</strong> ${item.director}</p>`;
    if (item.cast) add.innerHTML += `<p><strong>출연:</strong> ${item.cast.join(', ')}</p>`;
    if (item.episodes) add.innerHTML += `<p><strong>에피소드:</strong> ${item.episodes}화</p>`;
    if (item.awards) add.innerHTML += `<p><strong>수상:</strong> ${item.awards.join(', ')}</p>`;
    info.appendChild(add);
  }

  container.append(img, info);
}

// 3) Initialize detail page
window.addEventListener('DOMContentLoaded', async () => {
  const contents = await loadContents();
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id'));
  const item = contents.find(c => c.id === id);

  if (item) {
    renderDetail(item);
    document.title = `${item.title} - 상세 정보`;
  } else {
    document.getElementById('detail').innerHTML = '<div class="error">콘텐츠를 찾을 수 없습니다.</div>';
    document.title = '상세 정보';
  }
});
