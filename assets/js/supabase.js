// ============================================================
// Supabase Connection & Data Layer — Vylogix Studio
// ============================================================
// File ini menginisialisasi koneksi ke Supabase dan menyediakan
// fungsi fetch data untuk tabel "portofolio" dan "pricelist".
// ============================================================

// --- Konfigurasi Supabase ---
const SUPABASE_URL = 'https://bjidgmnbrkgecdtankpg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0yFmVFF7hQjJ9iOq0FipQg_klzKHsLo';

// --- Inisialisasi Client ---
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client berhasil diinisialisasi.');

// --- Cache sederhana agar tidak fetch berulang ---
let _cachePortofolio = null;
let _cachePricelist = null;

// ============================================================
// Fetch semua data dari tabel "portofolio"
// Return: Array of objects atau [] jika gagal
// ============================================================
async function fetchPortofolio() {
  if (_cachePortofolio) return _cachePortofolio;

  try {
    const { data, error } = await supabaseClient
      .from('portofolio')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Gagal fetch portofolio:', error.message);
      return [];
    }

    console.log(`✅ Portofolio: ${data.length} baris berhasil diambil.`);
    _cachePortofolio = data;
    return data;
  } catch (err) {
    console.error('❌ Error tak terduga (portofolio):', err);
    return [];
  }
}

// ============================================================
// Fetch semua data dari tabel "pricelist"
// Return: Array of objects atau [] jika gagal
// ============================================================
async function fetchPricelist() {
  if (_cachePricelist) return _cachePricelist;

  try {
    const { data, error } = await supabaseClient
      .from('pricelist')
      .select('*');

    if (error) {
      console.error('❌ Gagal fetch pricelist:', error.message);
      return [];
    }

    console.log(`✅ Pricelist: ${data.length} baris berhasil diambil.`);
    _cachePricelist = data;
    return data;
  } catch (err) {
    console.error('❌ Error tak terduga (pricelist):', err);
    return [];
  }
}

// ============================================================
// Helper: Tampilkan loading skeleton di dalam container
// ============================================================
function showLoadingState(container, count = 3) {
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'animate-pulse bg-surface rounded-card border border-gray-100 overflow-hidden';
    skeleton.innerHTML = `
      <div class="bg-gray-200 h-48 w-full"></div>
      <div class="p-6 space-y-3">
        <div class="h-5 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-100 rounded w-full"></div>
        <div class="flex gap-2 mt-2">
          <div class="h-6 bg-gray-100 rounded-full w-16"></div>
          <div class="h-6 bg-gray-100 rounded-full w-20"></div>
        </div>
      </div>
    `;
    container.appendChild(skeleton);
  }
}
