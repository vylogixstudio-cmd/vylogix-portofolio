/* ===================================================
   Vylogix Studio — Admin Panel Logic
   Modules: Auth, Dashboard, CRUD Portofolio & Pricelist
=================================================== */

// ============================================================
// 1. SUPABASE CLIENT (Sama persis dengan supabase.js utama)
// ============================================================
const SUPABASE_URL = 'https://bjidgmnbrkgecdtankpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0yFmVFF7hQjJ9iOq0FipQg_klzKHsLo';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 2. STATE
// ============================================================
let allPortofolio = [];
let allPricelist = [];
let currentKategori = 'all';

// ============================================================
// 3. DOM REFERENCES
// ============================================================
const $ = (id) => document.getElementById(id);

// ============================================================
// 4. INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Set year
  const yearEl = $('loginYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Check auth state
  checkAuth();

  // Setup event listeners
  setupEventListeners();
});

// ============================================================
// 5. AUTH — Login, Logout, Session Check
// ============================================================
async function checkAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    showDashboard(session.user);
  } else {
    showLogin();
  }

  // Listen for auth changes (login/logout from other tabs)
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      showDashboard(session.user);
    } else if (event === 'SIGNED_OUT') {
      showLogin();
    }
  });
}

async function handleLogin(e) {
  e.preventDefault();

  const email = $('loginEmail').value.trim();
  const password = $('loginPassword').value;
  const errorEl = $('loginError');
  const btnText = $('loginBtnText');
  const spinner = $('loginSpinner');

  // UI: loading state
  errorEl.classList.add('hidden');
  btnText.textContent = 'Memproses...';
  spinner.classList.remove('hidden');
  $('loginBtn').disabled = true;

  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  // UI: reset
  btnText.textContent = 'Masuk ke Dashboard';
  spinner.classList.add('hidden');
  $('loginBtn').disabled = false;

  if (error) {
    errorEl.textContent = '❌ ' + error.message;
    errorEl.classList.remove('hidden');
    return;
  }

  showDashboard(data.user);
}

async function handleLogout() {
  await sb.auth.signOut();
  showLogin();
}

function showLogin() {
  $('loginScreen').classList.remove('hidden');
  $('dashboard').classList.add('hidden');
}

function showDashboard(user) {
  $('loginScreen').classList.add('hidden');
  $('dashboard').classList.remove('hidden');
  $('userEmail').textContent = user.email;
  loadDashboard();
}

// ============================================================
// 6. DASHBOARD — Load Data & Render
// ============================================================
async function loadDashboard() {
  // Fetch both in parallel
  const [portoData, priceData] = await Promise.all([
    fetchAllPortofolio(),
    fetchAllPricelist()
  ]);

  allPortofolio = portoData;
  allPricelist = priceData;

  updateSummaryCards();
  renderPortofolioTable();
  renderPricelistTable();
}

async function refreshAll() {
  const [portoData, priceData] = await Promise.all([
    fetchAllPortofolio(),
    fetchAllPricelist()
  ]);

  allPortofolio = portoData;
  allPricelist = priceData;

  updateSummaryCards();
  renderPortofolioTable();
  renderPricelistTable();
}

// ============================================================
// 7. FETCH DATA
// ============================================================
async function fetchAllPortofolio() {
  const { data, error } = await sb.from('portofolio').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Fetch portofolio error:', error); return []; }
  return data || [];
}

async function fetchAllPricelist() {
  const { data, error } = await sb.from('pricelist').select('*').order('id', { ascending: true });
  if (error) { console.error('Fetch pricelist error:', error); return []; }
  return data || [];
}

// ============================================================
// 8. SUMMARY CARDS
// ============================================================
function updateSummaryCards() {
  $('statWeb').textContent    = allPortofolio.filter(i => i.kategori === 'web').length;
  $('statDesain').textContent = allPortofolio.filter(i => i.kategori === 'design').length;
  $('statVideo').textContent  = allPortofolio.filter(i => i.kategori === 'video').length;
  $('statPricelist').textContent = allPricelist.length;
}

// ============================================================
// 9. RENDER TABLE: PORTOFOLIO
// ============================================================
function renderPortofolioTable() {
  const tbody = $('tbodyPortofolio');
  
  // Filter berdasarkan sub-tab aktif
  const filtered = currentKategori === 'all'
    ? allPortofolio
    : allPortofolio.filter(i => i.kategori === currentKategori);

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-16">
          <div class="text-secondary">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"/></svg>
            <p class="text-sm font-medium">Belum ada data portofolio.</p>
            <p class="text-xs mt-1">Klik "+ Tambah Karya Baru" untuk menambahkan.</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const thumb = getThumbnail(item);
    const katBadge = categoryBadge(item.kategori);
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const tagsHTML = tags.slice(0, 3).map(t => `<span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">${t}</span>`).join(' ');
    const berandaBadge = item.terpilih
      ? '<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Aktif</span>'
      : '<span class="text-xs text-gray-400">—</span>';

    return `
      <tr class="table-row border-b border-gray-50 last:border-0">
        <td class="px-5 py-3">
          <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            ${thumb ? `<img src="${thumb}" alt="" class="w-full h-full object-cover">` : `<div class="w-full h-full grid place-items-center text-gray-400"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>`}
          </div>
        </td>
        <td class="px-5 py-3">
          <p class="font-semibold text-primary text-sm leading-tight">${item.judul}</p>
          <p class="text-xs text-secondary mt-0.5 line-clamp-1">${item.deskripsi || ''}</p>
        </td>
        <td class="px-5 py-3 hidden md:table-cell">${katBadge}</td>
        <td class="px-5 py-3 hidden lg:table-cell"><div class="flex flex-wrap gap-1">${tagsHTML || '<span class="text-xs text-gray-400">—</span>'}</div></td>
        <td class="px-5 py-3 text-center">${berandaBadge}</td>
        <td class="px-5 py-3 text-center">
          <div class="flex items-center justify-center gap-1">
            <button onclick="editPortofolio(${item.id})" title="Edit"
              class="w-8 h-8 grid place-items-center rounded-lg text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button onclick="deletePortofolio(${item.id})" title="Hapus"
              class="w-8 h-8 grid place-items-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function getThumbnail(item) {
  if (item.gambar) return item.gambar;
  if (item.kategori === 'video' && item.id_youtube) {
    return `https://img.youtube.com/vi/${item.id_youtube}/mqdefault.jpg`;
  }
  return null;
}

// ============================================================
// 10. RENDER TABLE: PRICELIST
// ============================================================
function renderPricelistTable() {
  const tbody = $('tbodyPricelist');

  if (allPricelist.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-16">
          <div class="text-secondary">
            <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p class="text-sm font-medium">Belum ada data pricelist.</p>
            <p class="text-xs mt-1">Klik "+ Tambah Paket Baru" untuk menambahkan.</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = allPricelist.map(paket => {
    const katBadge = categoryBadge(paket.kategori);
    const harga = !isNaN(paket.harga) ? `Rp ${Number(paket.harga).toLocaleString('id-ID')}` : paket.harga;
    const berandaBadge = paket.is_combo_beranda
      ? '<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Ya</span>'
      : '<span class="text-xs text-gray-400">—</span>';
    const populerBadge = paket.is_populer
      ? '<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">⭐ Ya</span>'
      : '<span class="text-xs text-gray-400">—</span>';

    return `
      <tr class="table-row border-b border-gray-50 last:border-0">
        <td class="px-5 py-3">
          <p class="font-semibold text-primary text-sm">${paket.nama_paket}</p>
          <p class="text-xs text-secondary mt-0.5">${(Array.isArray(paket.fitur) ? paket.fitur.length : 0)} fitur</p>
        </td>
        <td class="px-5 py-3">${katBadge}</td>
        <td class="px-5 py-3 font-semibold text-accent text-sm">${harga}</td>
        <td class="px-5 py-3 text-center hidden md:table-cell">${berandaBadge}</td>
        <td class="px-5 py-3 text-center hidden md:table-cell">${populerBadge}</td>
        <td class="px-5 py-3 text-center">
          <button onclick="deletePricelist(${paket.id})" title="Hapus"
            class="w-8 h-8 grid place-items-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </td>
      </tr>`;
  }).join('');
}

// ============================================================
// 11. CRUD — DELETE
// ============================================================
async function deletePortofolio(id) {
  if (!confirm('Yakin ingin menghapus karya ini? Data yang dihapus tidak bisa dikembalikan.')) return;

  const { error } = await sb.from('portofolio').delete().eq('id', id);

  if (error) {
    showToast('Gagal menghapus: ' + error.message, 'error');
    return;
  }

  showToast('Karya berhasil dihapus!', 'success');
  await refreshAll();
}

async function deletePricelist(id) {
  if (!confirm('Yakin ingin menghapus paket ini? Data yang dihapus tidak bisa dikembalikan.')) return;

  const { error } = await sb.from('pricelist').delete().eq('id', id);

  if (error) {
    showToast('Gagal menghapus: ' + error.message, 'error');
    return;
  }

  showToast('Paket berhasil dihapus!', 'success');
  await refreshAll();
}

// ============================================================
// 12. CRUD — INSERT (PORTOFOLIO)
// ============================================================
window.editPortofolio = function(id) {
  const item = allPortofolio.find(i => i.id === id);
  if (!item) return;

  const form = $('formPortofolio');
  form.reset();

  $('editPortofolioId').value = item.id;
  $('modalPortofolioTitle').textContent = 'Edit Karya';

  form.judul.value = item.judul;
  form.kategori.value = item.kategori;
  form.deskripsi.value = item.deskripsi || '';
  form.gambar.value = item.gambar || '';
  form.id_youtube.value = item.id_youtube || '';
  form.link.value = item.link || '';
  form.tags.value = Array.isArray(item.tags) ? item.tags.join(', ') : '';
  
  form.terpilih.checked = item.terpilih;
  document.getElementById('checkTerpilih').dispatchEvent(new Event('change'));

  if (item.layout_class && form.layout_class.querySelector(`option[value="${item.layout_class}"]`)) {
    form.layout_class.value = item.layout_class;
  } else {
    form.layout_class.value = 'auto';
  }

  // Setup galeri fields
  const wadah = $('wadahListGaleri');
  if (wadah) {
    wadah.innerHTML = '';
    const galeriArray = Array.isArray(item.galeri) ? item.galeri : [];
    if (galeriArray.length === 0) {
      addGaleriRow(wadah);
    } else {
      galeriArray.forEach(g => addGaleriRow(wadah, g.gambar, g.deskripsi, g.layout));
    }
  }

  // Setup Demo Akun fields
  const wadahDemo = $('wadahListDemo');
  if (wadahDemo) {
    wadahDemo.innerHTML = '';
    const demoArray = Array.isArray(item.demo_akun) ? item.demo_akun : [];
    if (demoArray.length > 0) {
      const keys = Object.keys(demoArray[0]);
      $('demoKolomInput').value = keys.join(', ');
      demoArray.forEach(akunObj => addDemoRow(wadahDemo, keys, akunObj));
    } else {
      $('demoKolomInput').value = 'Role, Email, Password';
      addDemoRow(wadahDemo, ['Role', 'Email', 'Password'], {});
    }
  }

  updatePortofolioFormFields();
  openModal('portofolio');
}

function addGaleriRow(wadah, img = '', desc = '', layout = 'auto') {
  const row = document.createElement('div');
  row.className = 'galeri-row flex gap-2 items-start relative mt-3 pt-3 border-t border-blue-100/50 first:mt-0 first:pt-0 first:border-0';
  
  // Opsi layout
  const l1 = layout === 'auto' ? 'selected' : '';
  const l2 = layout === 'md:col-span-1 md:row-span-1' ? 'selected' : '';
  const l3 = layout === 'md:col-span-2 md:row-span-1' ? 'selected' : '';
  const l4 = layout === 'md:col-span-2 md:row-span-2' ? 'selected' : '';

  row.innerHTML = `
    <div class="flex-grow space-y-2">
      <input type="text" value="${img}" class="galeri-img w-full px-3 py-2 rounded-btn border border-gray-200 text-xs focus:ring-accent/30 focus:border-accent transition-all" placeholder="URL Gambar (https://...)">
      <div class="flex gap-2">
        <input type="text" value="${desc}" class="galeri-desc w-2/3 px-3 py-2 rounded-btn border border-gray-200 text-xs focus:ring-accent/30 focus:border-accent transition-all" placeholder="Deskripsi (Opsional)">
        <select class="galeri-layout w-1/3 px-3 py-2 rounded-btn border border-gray-200 text-xs focus:ring-accent/30 focus:border-accent transition-all bg-white">
          <option value="auto" ${l1}>Auto</option>
          <option value="md:col-span-1 md:row-span-1" ${l2}>1x1</option>
          <option value="md:col-span-2 md:row-span-1" ${l3}>Lebar (2x1)</option>
          <option value="md:col-span-2 md:row-span-2" ${l4}>Besar (2x2)</option>
        </select>
      </div>
    </div>
    <button type="button" class="btn-hapus-galeri w-8 h-8 shrink-0 bg-red-100 text-red-500 rounded-btn flex items-center justify-center hover:bg-red-200 transition" title="Hapus">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  `;
  wadah.appendChild(row);
}

function addDemoRow(wadah, keys, dataObj = {}) {
  const row = document.createElement('div');
  row.className = 'demo-row flex gap-2 items-start relative mt-3 pt-3 border-t border-emerald-100/50 first:mt-0 first:pt-0 first:border-0';
  
  let inputsHTML = '';
  keys.forEach(key => {
    const val = dataObj[key] || '';
    inputsHTML += `<input type="text" data-key="${key}" value="${val}" class="demo-input w-full px-3 py-2 rounded-btn border border-gray-200 text-xs focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" placeholder="${key}">`;
  });

  row.innerHTML = `
    <div class="flex-grow grid grid-cols-2 sm:grid-cols-3 gap-2">
      ${inputsHTML}
    </div>
    <button type="button" class="btn-hapus-demo w-8 h-8 shrink-0 bg-red-100 text-red-500 rounded-btn flex items-center justify-center hover:bg-red-200 transition" title="Hapus">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  `;
  wadah.appendChild(row);
}

async function handleAddPortofolio(e) {
  e.preventDefault();

  const form = $('formPortofolio');
  const fd = new FormData(form);
  const kategori = fd.get('kategori');
  const editId = fd.get('id');

  // Parse tags: "Tag1, Tag2, Tag3" → ["Tag1", "Tag2", "Tag3"]
  const tagsRaw = fd.get('tags') || '';
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 0);

  // Default layout_class berdasarkan kategori
  const defaultLayouts = {
    web:    'md:col-span-2 md:row-span-1 min-h-[220px]',
    design: 'md:col-span-1 md:row-span-1 min-h-[220px]',
    video:  'md:col-span-2 md:row-span-2 min-h-[250px] md:min-h-[440px]',
  };

  let layoutClass = fd.get('layout_class');
  if (!layoutClass || layoutClass === 'auto') {
    layoutClass = defaultLayouts[kategori] || null;
  }

  // Default rasio untuk design
  const defaultRasio = kategori === 'design' ? 'aspect-square' : null;

  // Extract Galeri Array
  let galeriData = [];
  let demoAkunData = [];

  if (kategori === 'web') {
    // Galeri
    const rows = document.querySelectorAll('.galeri-row');
    rows.forEach(row => {
      const img = row.querySelector('.galeri-img').value.trim();
      const desc = row.querySelector('.galeri-desc').value.trim();
      const layout = row.querySelector('.galeri-layout').value;
      if (img) {
        galeriData.push({ gambar: img, deskripsi: desc, layout: layout });
      }
    });

    // Demo Akun
    const demoRows = document.querySelectorAll('.demo-row');
    demoRows.forEach(row => {
      let obj = {};
      let hasValue = false;
      row.querySelectorAll('.demo-input').forEach(input => {
        const key = input.getAttribute('data-key');
        const val = input.value.trim();
        obj[key] = val;
        if (val) hasValue = true;
      });
      if (hasValue) demoAkunData.push(obj);
    });
  }

  const payload = {
    kategori:     kategori,
    judul:        fd.get('judul'),
    deskripsi:    fd.get('deskripsi') || '',
    gambar:       fd.get('gambar') || null,
    tags:         tags,
    terpilih:     fd.get('terpilih') === 'on',
    layout_class: fd.get('terpilih') === 'on' ? layoutClass : null,
    link:         kategori === 'web' ? (fd.get('link') || null) : null,
    id_youtube:   kategori === 'video' ? (fd.get('id_youtube') || null) : null,
    rasio:        defaultRasio,
    delay:        '0ms',
    galeri:       galeriData,
    demo_akun:    demoAkunData
  };

  let error;
  if (editId) {
    const { error: err } = await sb.from('portofolio').update(payload).eq('id', editId);
    error = err;
  } else {
    const { error: err } = await sb.from('portofolio').insert([payload]);
    error = err;
  }

  if (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
    return;
  }

  showToast(editId ? 'Karya berhasil diperbarui! 🎉' : 'Karya baru berhasil ditambahkan! 🎉', 'success');
  form.reset();
  closeModal('portofolio');
  await refreshAll();
}

// ============================================================
// 13. CRUD — INSERT (PRICELIST)
// ============================================================
async function handleAddPricelist(e) {
  e.preventDefault();

  const form = $('formPricelist');
  const fd = new FormData(form);

  // Parse fitur: satu per baris → array
  const fiturRaw = fd.get('fitur') || '';
  const fitur = fiturRaw.split('\n').map(f => f.trim()).filter(f => f.length > 0);

  const payload = {
    kategori:         fd.get('kategori'),
    nama_paket:       fd.get('nama_paket'),
    harga:            parseInt(fd.get('harga')) || 0,
    fitur:            fitur,
    is_combo_beranda: fd.get('is_combo_beranda') === 'on',
    is_populer:       fd.get('is_populer') === 'on',
  };

  const { error } = await sb.from('pricelist').insert([payload]);

  if (error) {
    showToast('Gagal menyimpan: ' + error.message, 'error');
    return;
  }

  showToast('Paket baru berhasil ditambahkan! 🎉', 'success');
  form.reset();
  closeModal('pricelist');
  await refreshAll();
}

// ============================================================
// 14. TAB NAVIGATION
// ============================================================
function switchMainTab(tab) {
  const tabPortofolio = $('tabPortofolio');
  const tabPricelist = $('tabPricelist');

  if (tab === 'portofolio') {
    tabPortofolio.classList.remove('hidden');
    tabPricelist.classList.add('hidden');
  } else {
    tabPortofolio.classList.add('hidden');
    tabPricelist.classList.remove('hidden');
  }

  // Update tab button styles
  document.querySelectorAll('.main-tab').forEach(btn => {
    if (btn.dataset.tab === tab) {
      btn.className = btn.className.replace('tab-inactive', 'tab-active');
    } else {
      btn.className = btn.className.replace('tab-active', 'tab-inactive');
    }
  });
}

function switchKategoriTab(kat) {
  currentKategori = kat;

  document.querySelectorAll('.kat-tab').forEach(btn => {
    if (btn.dataset.kat === kat) {
      btn.className = btn.className.replace('subtab-inactive', 'subtab-active');
    } else {
      btn.className = btn.className.replace('subtab-active', 'subtab-inactive');
    }
  });

  renderPortofolioTable();
}

// ============================================================
// 15. MODAL MANAGEMENT
// ============================================================
function openModal(type) {
  const modal = $('modal' + capitalize(type));
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(type) {
  const modal = $('modal' + capitalize(type));
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// 16. CONDITIONAL FORM FIELDS (Portofolio)
// ============================================================
function updatePortofolioFormFields() {
  const kategori = $('selectKategoriPorto').value;
  const fieldGambar  = $('fieldGambar');
  const fieldYoutube = $('fieldYoutube');
  const fieldLink    = $('fieldLink');
  const fieldGaleri  = $('fieldGaleri');
  const fieldDemo    = $('fieldDemoAkun');

  // Reset visibility
  fieldGambar.classList.remove('hidden');
  fieldYoutube.classList.add('hidden');
  fieldLink.classList.add('hidden');
  if(fieldGaleri) fieldGaleri.classList.add('hidden');
  if(fieldDemo) fieldDemo.classList.add('hidden');

  if (kategori === 'video') {
    fieldYoutube.classList.remove('hidden');
    // Gambar opsional untuk video (otomatis pakai thumbnail YouTube)
  } else if (kategori === 'web') {
    fieldLink.classList.remove('hidden');
    if(fieldGaleri) fieldGaleri.classList.remove('hidden');
    if(fieldDemo) fieldDemo.classList.remove('hidden');
  }
}

// ============================================================
// 17. TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'success') {
  const toast = $('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type}`;

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ============================================================
// 18. HELPER — Category Badge
// ============================================================
function categoryBadge(kat) {
  const badges = {
    web:    '<span class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">🌐 Web</span>',
    design: '<span class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">🎨 Desain</span>',
    video:  '<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">🎬 Video</span>',
    desain: '<span class="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">🎨 Desain</span>',
    combo:  '<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">⭐ Combo</span>',
  };
  return badges[kat] || `<span class="text-xs text-gray-400">${kat}</span>`;
}

// ============================================================
// 19. EVENT LISTENERS SETUP
// ============================================================
function setupEventListeners() {
  // Login
  $('loginForm').addEventListener('submit', handleLogin);
  $('logoutBtn').addEventListener('click', handleLogout);

  // Main Tabs
  document.querySelectorAll('.main-tab').forEach(btn => {
    btn.addEventListener('click', () => switchMainTab(btn.dataset.tab));
  });

  // Kategori Sub-Tabs
  document.querySelectorAll('.kat-tab').forEach(btn => {
    btn.addEventListener('click', () => switchKategoriTab(btn.dataset.kat));
  });

  // Open Modals
  $('btnTambahPortofolio').addEventListener('click', () => {
    $('formPortofolio').reset();
    $('editPortofolioId').value = '';
    $('modalPortofolioTitle').textContent = 'Tambah Karya Baru';
    
    // Reset Galeri & Demo
    const wadahGaleri = $('wadahListGaleri');
    if (wadahGaleri) {
      wadahGaleri.innerHTML = '';
      addGaleriRow(wadahGaleri);
    }

    const wadahDemo = $('wadahListDemo');
    if (wadahDemo) {
      wadahDemo.innerHTML = '';
      $('demoKolomInput').value = 'Role, Email, Password';
      addDemoRow(wadahDemo, ['Role', 'Email', 'Password'], {});
    }
    
    updatePortofolioFormFields();
    openModal('portofolio');
  });
  $('btnTambahPricelist').addEventListener('click', () => openModal('pricelist'));

  // Form Submissions
  $('formPortofolio').addEventListener('submit', handleAddPortofolio);
  $('formPricelist').addEventListener('submit', handleAddPricelist);

  // Conditional form fields
  $('selectKategoriPorto').addEventListener('change', updatePortofolioFormFields);

  // Galeri Dinamis
  const btnTambahGaleri = $('btnTambahGaleri');
  if (btnTambahGaleri) {
    btnTambahGaleri.addEventListener('click', () => {
      addGaleriRow($('wadahListGaleri'));
    });
    
    $('wadahListGaleri').addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-hapus-galeri');
      if (btn) {
        const baris = document.querySelectorAll('.galeri-row');
        if(baris.length > 1) {
          btn.closest('.galeri-row').remove();
        } else {
          showToast('Minimal harus ada 1 form, kosongkan saja jika tidak perlu.', 'error');
        }
      }
    });
  }

  // Demo Akun Dinamis
  const btnTambahDemo = $('btnTambahDemo');
  if (btnTambahDemo) {
    btnTambahDemo.addEventListener('click', () => {
      const kolomRaw = $('demoKolomInput').value;
      const keys = kolomRaw.split(',').map(k => k.trim()).filter(k => k.length > 0);
      if (keys.length === 0) {
        showToast('Isi nama kolom dulu di atas (pisahkan dengan koma)', 'error');
        return;
      }
      addDemoRow($('wadahListDemo'), keys, {});
    });
    
    $('demoKolomInput').addEventListener('change', () => {
      // Jika kolom berubah, kita bisa biarkan saja, row baru akan pakai kolom baru.
      // Atau bisa kita reset. Untuk amannya, biarkan saja. User yang atur.
    });

    $('wadahListDemo').addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-hapus-demo');
      if (btn) {
        btn.closest('.demo-row').remove();
      }
    });
  }

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('portofolio');
      closeModal('pricelist');
    }
  });
}
