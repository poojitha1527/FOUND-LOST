// ===== API CONFIGURATION =====
const API_URL = (window.APP_CONFIG?.API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// ===== STATE =====
let items = [];
let currentFilter = { status: 'open', category: 'all', search: '' };
let reportType = 'lost';
let pendingPhoto = null;
let isSyncing = false;

// ===== API CALLS =====
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function getItems(filters = {}) {
  const params = new URLSearchParams({
    limit: 50,
    sort: '-createdAt',
    status: filters.status || 'open',
    category: filters.category || 'all',
    ...(filters.search && { search: filters.search })
  });
  
  return apiCall(`/items?${params}`);
}

async function getItemById(id) {
  return apiCall(`/items/${id}`);
}

async function createItem(itemData) {
  return apiCall('/items', {
    method: 'POST',
    body: JSON.stringify(itemData)
  });
}

async function updateItemStatus(id, status) {
  return apiCall(`/items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

async function markItemResolved(id) {
  return apiCall(`/items/${id}/resolve`, { method: 'POST' });
}

async function getStats() {
  return apiCall('/items/stats/overview');
}

async function registerUser(name, email, password, phone = '') {
  return apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone })
  });
}

async function loginUser(email, password) {
  return apiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

async function logoutUser() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  renderUserMenu();
  render();
}

// ===== IMAGE HANDLING =====
function compressImage(file, maxDim = 520, quality = 0.62) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('not an image'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('too large'));
      return;
    }

    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round(height * (maxDim / width));
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round(width * (maxDim / height));
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('bad image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

async function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const zone = document.getElementById('photoUploadZone');
  zone.innerHTML = `<div class="ph-text" style="padding:10px 0;">Processing photo…</div>`;
  
  try {
    const dataUrl = await compressImage(file);
    pendingPhoto = dataUrl;
    renderPhotoPreview();
  } catch (err) {
    pendingPhoto = null;
    showToast('Could not use that photo — try a smaller image.', 'error');
    resetPhotoZone();
  }
}

function renderPhotoPreview() {
  const zone = document.getElementById('photoUploadZone');
  zone.innerHTML = `
    <div class="photo-preview-wrap">
      <img src="${pendingPhoto}" alt="Selected photo preview">
      <button type="button" class="photo-remove" onclick="removePendingPhoto()">✕</button>
    </div>`;
}

function removePendingPhoto() {
  pendingPhoto = null;
  resetPhotoZone();
}

function resetPhotoZone() {
  const zone = document.getElementById('photoUploadZone');
  zone.innerHTML = `
    <label class="photo-upload" id="photoDropLabel">
      <svg class="ph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 15l-5-5-9 9"/></svg>
      <div class="ph-text">Tap to add a photo</div>
      <div class="ph-sub">Helps people recognize it at a glance</div>
      <input type="file" accept="image/*" id="f-photo" onchange="handlePhotoSelect(event)">
    </label>`;
}

// ===== CONSTANTS =====
const ICONS = {
  electronics: '<path d="M4 6h16v10H4z"/><path d="M9 20h6"/><path d="M4 10h16"/>',
  bag: '<path d="M6 8h12l1 12H5z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2"/><path d="M14 10h5M14 14h5"/>',
  keys: '<circle cx="7" cy="10" r="4"/><path d="M10 13l10 10M17 17l3-3M14 20l2.5-2.5"/>',
  clothing: '<path d="M8 4l4 3 4-3 3 4-3 2v11H8V10L5 8z"/>',
  books: '<path d="M4 4h6v16H4z"/><path d="M14 4h6v16h-6z"/><path d="M10 4v16M14 4v16"/>',
  bottle: '<path d="M9 3h6v3l2 3v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3z"/><path d="M8 12h8"/>',
  other: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>'
};

const CAT_LABELS = {
  electronics: 'Electronics',
  bag: 'Bags & Accessories',
  id: 'ID / Cards',
  keys: 'Keys',
  clothing: 'Clothing',
  books: 'Books & Stationery',
  bottle: 'Water Bottles',
  other: 'Other'
};

function svgIcon(cat, size = 19) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[cat] || ICONS.other}</svg>`;
}

function fmtDate(d) {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return d;
  }
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

function rotFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 1000;
  }
  return (((h / 1000) * 3 - 1.5).toFixed(2));
}

function showToast(msg, kind = '') {
  const stack = document.getElementById('toastStack');
  const t = document.createElement('div');
  t.className = 'toast ' + kind;
  t.innerHTML = `<span>${escapeHtml(msg)}</span><span class="x" onclick="this.parentElement.remove()">✕</span>`;
  stack.appendChild(t);
  setTimeout(() => { t.remove(); }, 5000);
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

// ===== SYNC & RENDER =====
async function syncFromServer() {
  if (isSyncing) return;
  isSyncing = true;
  
  try {
    const result = await getItems({
      status: currentFilter.status,
      category: currentFilter.category,
      search: currentFilter.search
    });
    
    items = result.data || [];
    document.getElementById('lastSync').textContent = 'synced ' + new Date().toLocaleTimeString();
  } catch (error) {
    console.error('Sync error:', error);
    document.getElementById('lastSync').textContent = 'sync failed';
    showToast('Connection error — retrying…', 'error');
  } finally {
    isSyncing = false;
    render();
  }
}

async function computeStats() {
  try {
    const stats = await getStats();
    if (stats.success) {
      document.getElementById('statLost').textContent = stats.data.lostOpen;
      document.getElementById('statFound').textContent = stats.data.foundOpen;
      document.getElementById('statResolved').textContent = stats.data.resolved;
    }
  } catch (error) {
    console.error('Stats error:', error);
  }
}

function matchesFilter(it) {
  if (currentFilter.status !== 'all') {
    if (currentFilter.status === 'resolved' && it.status !== 'resolved') return false;
    if (currentFilter.status !== 'resolved' && it.status === 'resolved') return false;
    if ((currentFilter.status === 'lost' || currentFilter.status === 'found') && it.type !== currentFilter.status) return false;
  }
  if (currentFilter.category !== 'all' && it.category !== currentFilter.category) return false;
  if (currentFilter.search) {
    const s = currentFilter.search.toLowerCase();
    const hay = (it.title + ' ' + it.description + ' ' + it.location).toLowerCase();
    if (!hay.includes(s)) return false;
  }
  return true;
}

function render() {
  const board = document.getElementById('board');
  const sorted = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filtered = sorted.filter(matchesFilter);

  if (filtered.length === 0) {
    board.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <h3>${items.length === 0 ? 'The board is empty' : 'No notices match'}</h3>
        <p>${items.length === 0 ? 'Be the first to post a lost or found notice — it takes under a minute.' : 'Try a different search term, category, or filter.'}</p>
      </div>`;
    return;
  }

  board.innerHTML = filtered.map(it => {
    const rot = rotFor(it.id);
    const stampLabel = it.status === 'resolved' ? 'resolved' : it.type;
    return `
    <div class="ticket" style="transform:rotate(${rot}deg)" onclick="openDetail('${it.id}')">
      <div class="ticket-main">
        <div class="stamp ${stampLabel}">${it.status === 'resolved' ? 'Reunited' : (it.type === 'lost' ? 'Lost' : 'Found')}</div>
        ${it.photo ? `<img class="ticket-photo" src="${it.photo}" alt="Photo of ${escapeHtml(it.title)}">` : ''}
        <div class="ticket-top">
          <div>
            <h3 class="ticket-title">${escapeHtml(it.title)}</h3>
            <div class="ticket-cat">${CAT_LABELS[it.category] || 'Other'}</div>
          </div>
          <div class="cat-icon">${svgIcon(it.category)}</div>
        </div>
        ${it.description ? `<div class="ticket-desc">${escapeHtml(it.description)}</div>` : ''}
        <div class="ticket-meta">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${escapeHtml(it.location)}</span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${fmtDate(it.date)} · posted ${timeAgo(it.createdAt)}</span>
        </div>
      </div>
      <div class="ticket-stub">
        <div class="stub-icon">${svgIcon(it.category, 16)}</div>
        <div class="stub-num">#${it.id.slice(-5).toUpperCase()}</div>
      </div>
    </div>`;
  }).join('');
}

// ===== USER MENU =====
function renderUserMenu() {
  const menu = document.getElementById('userMenu');
  if (currentUser) {
    menu.innerHTML = `
      <span style="color:rgba(239,227,200,0.7); font-size:13px;">Hi, ${escapeHtml(currentUser.name)}</span>
      <button class="user-btn" onclick="logoutUser()">Logout</button>`;
  } else {
    menu.innerHTML = `
      <button class="user-btn" onclick="openLoginModal()">Login</button>
      <button class="user-btn" onclick="openRegisterModal()">Register</button>`;
  }
}

async function openLoginModal() {
  const email = prompt('Email:');
  if (!email) return;
  const password = prompt('Password:');
  if (!password) return;
  
  try {
    const result = await loginUser(email, password);
    authToken = result.token;
    currentUser = result.user;
    localStorage.setItem('authToken', authToken);
    renderUserMenu();
    showToast(`Welcome back, ${currentUser.name}!`);
  } catch (error) {
    showToast('Login failed: ' + error.message, 'error');
  }
}

async function openRegisterModal() {
  const name = prompt('Full name:');
  if (!name) return;
  const email = prompt('Email:');
  if (!email) return;
  const password = prompt('Password (min 6 chars):');
  if (!password) return;
  
  try {
    const result = await registerUser(name, email, password);
    authToken = result.token;
    currentUser = result.user;
    localStorage.setItem('authToken', authToken);
    renderUserMenu();
    showToast(`Welcome, ${currentUser.name}!`);
  } catch (error) {
    showToast('Registration failed: ' + error.message, 'error');
  }
}

// ===== FILTER EVENTS =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('input', e => {
    currentFilter.search = e.target.value.trim();
    syncFromServer();
  });

  document.getElementById('categoryFilter').addEventListener('change', e => {
    currentFilter.category = e.target.value;
    syncFromServer();
  });

  document.getElementById('statusChips').addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    document.querySelectorAll('#statusChips .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    currentFilter.status = btn.dataset.status;
    syncFromServer();
  });

  // Overlay click to close
  document.querySelectorAll('.overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('show'); });
  });

  // ESC to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.overlay.show').forEach(o => o.classList.remove('show'));
    }
  });

  // Initialize
  renderUserMenu();
  syncFromServer();
  computeStats();
  setInterval(() => syncFromServer(), 5000);
  setInterval(() => computeStats(), 10000);
});

// ===== REPORT MODAL =====
function openReportModal(type) {
  setReportType(type);
  document.getElementById('reportForm').reset();
  document.getElementById('f-date').valueAsDate = new Date();
  pendingPhoto = null;
  resetPhotoZone();
  document.getElementById('reportOverlay').classList.add('show');
  document.getElementById('f-title').focus();
}

function setReportType(type) {
  reportType = type;
  const isLost = type === 'lost';
  document.getElementById('reportModalTitle').textContent = isLost ? 'Report a Lost Item' : 'Report a Found Item';
  document.getElementById('toggleLost').classList.toggle('active', isLost);
  document.getElementById('toggleFound').classList.toggle('active', !isLost);
  document.getElementById('f-date-label').textContent = isLost ? 'Date lost' : 'Date found';
  document.getElementById('f-location-label').textContent = isLost ? 'Last seen location' : 'Where you found it';
  document.getElementById('reportSubmitBtn').textContent = isLost ? 'Post Lost Notice' : 'Post Found Notice';
  document.getElementById('reportSubmitBtn').style.background = isLost ? 'var(--lost)' : 'var(--found)';
  document.getElementById('reportSubmitBtn').style.color = '#fff';
}

async function submitReport(e) {
  e.preventDefault();
  const btn = document.getElementById('reportSubmitBtn');
  
  const newItem = {
    type: reportType,
    title: document.getElementById('f-title').value.trim(),
    category: document.getElementById('f-category').value,
    date: document.getElementById('f-date').value,
    location: document.getElementById('f-location').value.trim(),
    description: document.getElementById('f-desc').value.trim(),
    contact: document.getElementById('f-contact').value.trim(),
    photo: pendingPhoto || null
  };
  
  btn.textContent = 'Posting…';
  btn.disabled = true;
  
  try {
    const result = await createItem(newItem);
    pendingPhoto = null;
    closeModal('reportOverlay');
    showToast(`Notice posted: "${newItem.title}"`);
    await syncFromServer();
    await computeStats();
  } catch (error) {
    showToast('Failed to post: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    setReportType(reportType);
  }
}

// ===== DETAIL MODAL =====
async function openDetail(id) {
  try {
    const result = await getItemById(id);
    const it = result.data;
    
    const stampLabel = it.status === 'resolved' ? 'resolved' : it.type;
    const container = document.getElementById('detailModalContent');
    container.innerHTML = `
      <div class="modal-head">
        <div>
          <h2>${escapeHtml(it.title)}</h2>
          <div class="ticket-id">Ticket #${it.id.slice(-5).toUpperCase()} · <span class="status-pill ${stampLabel}">${it.status === 'resolved' ? 'Reunited' : (it.type === 'lost' ? 'Lost' : 'Found')}</span></div>
        </div>
        <button class="close-btn" onclick="closeModal('detailOverlay')">✕</button>
      </div>
      <div class="modal-body">
        ${it.photo ? `<img class="detail-photo" src="${it.photo}" alt="Photo of ${escapeHtml(it.title)}">` : ''}
        ${it.description ? `<div class="detail-desc">${escapeHtml(it.description)}</div>` : `<div class="detail-desc" style="opacity:.6">No extra description provided.</div>`}
        <div class="detail-grid">
          <div class="detail-item"><div class="k">Category</div><div class="v">${CAT_LABELS[it.category] || 'Other'}</div></div>
          <div class="detail-item"><div class="k">${it.type === 'lost' ? 'Last seen' : 'Found at'}</div><div class="v">${escapeHtml(it.location)}</div></div>
          <div class="detail-item"><div class="k">${it.type === 'lost' ? 'Date lost' : 'Date found'}</div><div class="v">${fmtDate(it.date)}</div></div>
          <div class="detail-item"><div class="k">Posted</div><div class="v">${timeAgo(it.createdAt)}</div></div>
        </div>
        <div class="contact-box" id="contactBox">
          <div style="font-size:12.5px; color:var(--ink-soft); margin-bottom:10px; font-weight:600;">Think this is yours? Reach out directly.</div>
          <button class="contact-reveal-btn" onclick="revealContact('${it.id}')">Reveal contact info</button>
        </div>
        ${it.status !== 'resolved' ? `
        <div class="action-row">
          <button class="btn-resolve" onclick="markResolved('${it.id}')">Mark as reunited</button>
        </div>` : `<div style="text-align:center; font-size:13px; color:var(--found); font-weight:700;">✓ This item has been reunited with its owner</div>`}
      </div>
    `;
    document.getElementById('detailOverlay').classList.add('show');
  } catch (error) {
    showToast('Could not load item: ' + error.message, 'error');
  }
}

function revealContact(id) {
  const it = items.find(i => i.id === id);
  if (!it) return;
  document.getElementById('contactBox').innerHTML = `
    <div style="font-size:12.5px; color:var(--ink-soft); margin-bottom:6px; font-weight:600;">Contact the poster</div>
    <div class="contact-value">${escapeHtml(it.contact)}</div>`;
}

async function markResolved(id) {
  try {
    await markItemResolved(id);
    closeModal('detailOverlay');
    showToast('Marked as reunited 🎉');
    await syncFromServer();
    await computeStats();
  } catch (error) {
    showToast('Failed to update: ' + error.message, 'error');
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}
