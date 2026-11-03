// ============================================================
// Script untuk Halaman Detail Sampel Web
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Animasi fade up saat dimuat
  initFadeUpAnimations();

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const contentState = document.getElementById('content-state');

  if (!id) {
    showError();
    return;
  }

  try {
    // Memanfaatkan fungsi fetchPortofolio dari supabase.js
    const dataPortofolio = await fetchPortofolio();
    const itemDetail = dataPortofolio.find(p => p.id.toString() === id);

    if (!itemDetail) {
      showError();
      return;
    }

    // Render Data Utama
    document.getElementById('detail-title').textContent = itemDetail.judul;
    document.getElementById('detail-desc').textContent = itemDetail.deskripsi;
    document.getElementById('detail-link').href = itemDetail.link || '#';

    // Render Galeri
    renderGaleri(itemDetail.galeri);

    // Render Tabel Demo
    renderDemoTable(itemDetail.demo_akun);

    // Tampilkan Konten, sembunyikan loading
    loadingState.classList.add('hidden');
    contentState.classList.remove('hidden');

    // Trigger ulang animasi fade up untuk elemen baru
    initFadeUpAnimations();

  } catch (err) {
    console.error(err);
    showError();
  }

  function showError() {
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
  }
});

function renderGaleri(galeri) {
  const galeriSection = document.getElementById('galeri-section');
  const galeriContainer = document.getElementById('galeri-container');

  if (!galeri || !Array.isArray(galeri) || galeri.length === 0) {
    return; // Tetap hidden
  }

  galeriSection.classList.remove('hidden');
  galeriContainer.innerHTML = '';

  galeri.forEach(item => {
    const card = document.createElement('div');
    
    let layoutClass = "";
    if (item.layout && item.layout !== 'auto') {
      layoutClass = item.layout;
    }
    
    card.className = `bg-surface flex flex-col rounded-card border border-gray-100 overflow-hidden shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md h-full ${layoutClass}`;
    
    const descHTML = `
      <div class="p-4 bg-white h-[100px] shrink-0 relative z-0">
        <div class="text-secondary text-sm leading-relaxed h-full overflow-y-auto custom-scrollbar pr-1">${item.deskripsi || ''}</div>
      </div>`;
    
    card.innerHTML = `
      <a href="${item.gambar || ''}" data-fancybox="gallery" data-caption="${item.deskripsi || ''}" class="block relative w-full flex-grow min-h-[160px] cursor-zoom-in z-10 shadow-[0_4px_12px_rgba(0,0,0,0.05)] bg-gray-50 border-b border-gray-100/50">
        <img src="${item.gambar || ''}" alt="Fitur" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
      </a>
      ${descHTML}
    `;
    galeriContainer.appendChild(card);
  });
  
  // Bind Fancybox
  if (typeof window.Fancybox !== 'undefined') {
    Fancybox.bind('[data-fancybox="gallery"]', {
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: [
            "zoomIn",
            "zoomOut",
            "toggle1to1",
            "rotateCCW",
            "rotateCW",
            "flipX",
            "flipY",
          ],
          right: ["slideshow", "thumbs", "close"],
        },
      },
    });
  }
}

function renderDemoTable(demoAkun) {
  const demoSection = document.getElementById('demo-section');
  const thead = document.getElementById('demo-thead');
  const tbody = document.getElementById('demo-tbody');

  if (!demoAkun || !Array.isArray(demoAkun) || demoAkun.length === 0) {
    return; // Tetap hidden
  }

  demoSection.classList.remove('hidden');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  // Mengambil keys dari object pertama sebagai header tabel
  const barisPertama = demoAkun[0];
  const keys = Object.keys(barisPertama);

  // Buat Header (th)
  const trHead = document.createElement('tr');
  // Menambahkan kolom nomor
  trHead.innerHTML += `<th class="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider w-16">No</th>`;
  
  keys.forEach(key => {
    trHead.innerHTML += `<th class="px-6 py-4 text-xs font-semibold text-secondary uppercase tracking-wider">${key}</th>`;
  });
  thead.appendChild(trHead);

  // Buat Baris (td)
  demoAkun.forEach((baris, index) => {
    const trBody = document.createElement('tr');
    trBody.className = "hover:bg-blue-50/50 transition-colors";
    
    // Nomor
    trBody.innerHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">${index + 1}</td>`;
    
    keys.forEach(key => {
      let value = baris[key] || '-';
      let isCopyable = false;

      // Jika key sepertinya password atau email, berikan fitur klik untuk copy
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('email')) {
        isCopyable = true;
      }

      if (isCopyable) {
        trBody.innerHTML += `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary">
            <div class="flex items-center gap-2 group cursor-pointer" onclick="navigator.clipboard.writeText('${value}'); alert('Disalin: ${value}');">
              <span>${value}</span>
              <svg class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
            </div>
          </td>`;
      } else {
        // Jika nilai adalah role/status, mungkin kita bisa beri badge
        if (key.toLowerCase() === 'role' || key.toLowerCase() === 'status') {
          trBody.innerHTML += `<td class="px-6 py-4 whitespace-nowrap"><span class="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">${value}</span></td>`;
        } else {
          trBody.innerHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm text-secondary">${value}</td>`;
        }
      }
    });
    tbody.appendChild(trBody);
  });
}

function initFadeUpAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
  );
  document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
}
