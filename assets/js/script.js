/* ===================================================
   Vylogix Studio — Interaction Logic
   Modules: smooth scroll, mobile menu, portfolio filter
   (cross-wired to navbar + service cards), and the
   hybrid modal (image / video) lightbox.

   UPDATED: Semua render function sekarang async,
   mengambil data dari Supabase via supabase.js
=================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initNavbarScrollState();
  initSmoothScroll();
  initMobileMenu();
  initModal();
  initFooterYear();
  initScrollSpy();

  // Render data dari Supabase (async)
  await initVideoRender();
  await initDesainRender();
  await initWebRender();
  await initHomeRender();
  await initPricelistSystem();

  initPortfolioFilter();
  initWhatsAppHandler();
  initFadeUpAnimations(); // Digabungkan agar tidak tumpang tindih
});

/* ---------------------------------------------------
   1. Navbar — shadow state on scroll
--------------------------------------------------- */
function initNavbarScrollState() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    navbar.classList.toggle('scrolled', currentScroll > 12);

    if (currentScroll > lastScroll && currentScroll > 100) {
      navbar.classList.add('-translate-y-full');
    } else {
      navbar.classList.remove('-translate-y-full');
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ---------------------------------------------------
   2. Smooth scroll for all in-page anchor links
--------------------------------------------------- */
function initSmoothScroll() {
  const NAV_OFFSET = 96;

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobileMenu();
    });
  });
}

/* ---------------------------------------------------
   3. Mobile menu toggle
--------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  const iconMenu = document.getElementById('iconMenu');
  const iconClose = document.getElementById('iconClose');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  function openMobileMenu() {
    menu.classList.remove('hidden');
    iconMenu.classList.add('hidden');
    iconClose.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
  }

  window.closeMobileMenu = function () {
    menu.classList.add('hidden');
    iconMenu.classList.remove('hidden');
    iconClose.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  };
}

function closeMobileMenu() {
  if (typeof window.closeMobileMenu === 'function') {
    window.closeMobileMenu();
  }
}

/* ---------------------------------------------------
   4. Portfolio filter — Presisi Grid Diperbaiki
--------------------------------------------------- */
function initPortfolioFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const filterTriggers = document.querySelectorAll('.filter-trigger');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filter);
    });
  });

  filterTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      applyFilter(trigger.dataset.filter);
    });
  });

  applyFilter('all');
}

function applyFilter(category) {
  const items = document.querySelectorAll('.portfolio-item');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const emptyState = document.getElementById('emptyState');
  let visibleCount = 0;

  items.forEach((item) => {
    const matches = category === 'all' || item.dataset.category === category;

    if (matches) {
      item.classList.remove('item-hidden');
      
      if (category === 'all') {
        item.className = item.dataset.originalClass || item.className;
      } else {
        if (!item.dataset.originalClass) {
          item.dataset.originalClass = item.className;
        }
        // PERBAIKAN PRESISI GRID:
        // Hanya hapus start-position agar CSS grid auto-flow merapikan ke kiri,
        // tapi TETAP PERTAHANKAN col-span & row-span agar ukuran kartu tetap estetis!
        item.classList.remove(
          'md:col-start-1', 'md:col-start-2', 'md:col-start-3', 'md:col-start-4',
          'md:row-start-1', 'md:row-start-2', 'md:row-start-3'
        );
      }

      item.classList.remove('item-enter');
      void item.offsetWidth; 
      item.classList.add('item-enter');
      visibleCount++;
    } else {
      item.classList.add('item-hidden');
    }
  });

  filterButtons.forEach((btn) => {
    btn.classList.toggle('active-filter', btn.dataset.filter === category);
  });

  if (emptyState) {
    emptyState.classList.toggle('hidden', visibleCount > 0);
  }
}

/* ---------------------------------------------------
   5. Hybrid Modal (image / video lightbox)
--------------------------------------------------- */
function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalClose');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  if (!overlay) return;

  // Gunakan event delegation agar modal juga bekerja
  // pada elemen yang di-render secara dinamis (dari Supabase)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-type]');
    if (!trigger) return;
    openModal({
      type: trigger.dataset.modalType,
      title: trigger.dataset.title || 'Detail Proyek',
      src: trigger.dataset.src,
    });
  });

  function openModal({ type, title, src }) {
    titleEl.textContent = title;
    bodyEl.innerHTML = '';

    if (type === 'video') {
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      bodyEl.appendChild(iframe);
    } else if (type === 'image') {
      const img = document.createElement('img');
      img.src = src;
      img.alt = title;
      bodyEl.appendChild(img);
    }

    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      bodyEl.innerHTML = '';
      overlay.classList.add('hidden');
    }, 250);
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/* ---------------------------------------------------
   6. Footer — dynamic copyright year
--------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* ---------------------------------------------------
   7. Animasi Scroll (Fade-Up)
--------------------------------------------------- */
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
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------
   8. Render Data Video Otomatis (SUPABASE)
--------------------------------------------------- */
async function initVideoRender() {
  const videoContainer = document.getElementById('wadah-video');
  if (!videoContainer) return; 

  // Tampilkan loading state
  showLoadingState(videoContainer, 2);

  // Fetch dari Supabase, filter kategori = 'video'
  const allData = await fetchPortofolio();
  const dataVideo = allData.filter(item => item.kategori === 'video');

  videoContainer.innerHTML = '';

  dataVideo.forEach((video) => {
    const card = document.createElement('article');
    card.className = "portfolio-card fade-up relative group bg-surface rounded-card border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-accent/5";
    if(video.delay) card.style.transitionDelay = video.delay;

    const tags = Array.isArray(video.tags) ? video.tags : [];
    const tagsHTML = tags.map(tag => 
      `<span class="text-xs font-medium text-accent bg-blue-50 rounded-full px-3 py-1 ring-1 ring-accent/10">${tag}</span>`
    ).join('');

    card.innerHTML = `
      <div class="iframe-wrapper">
        <div class="aspect-video w-full">
          <iframe class="w-full h-full" src="https://www.youtube.com/embed/${video.id_youtube}" title="${video.judul}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
      <div class="p-6 flex flex-col gap-3">
        <h2 class="font-heading text-lg sm:text-xl font-bold text-primary leading-snug">${video.judul}</h2>
        <p class="text-secondary text-sm leading-relaxed">${video.deskripsi}</p>
        <div class="flex flex-wrap gap-2 mt-1">
          ${tagsHTML}
        </div>
      </div>
    `;
    videoContainer.appendChild(card);
  });
}

/* ---------------------------------------------------
   9. Render Data Beranda / Bento Grid (SUPABASE)
--------------------------------------------------- */
async function initHomeRender() {
  const bentoGrid = document.getElementById('bentoGrid');
  if (!bentoGrid) return;

  // Tampilkan loading state
  showLoadingState(bentoGrid, 3);

  // Fetch dari Supabase, filter terpilih = true
  const allData = await fetchPortofolio();
  const dataPortfolioHome = allData.filter(item => item.terpilih === true);

  bentoGrid.innerHTML = ''; 

  dataPortfolioHome.forEach(item => {
    const kategori = item.kategori || '';
    const layoutClass = item.layout_class || 'md:col-span-1 md:row-span-1 min-h-[220px]';

    // Tentukan tipe elemen berdasarkan kategori
    const el = document.createElement(kategori === 'web' ? 'a' : 'button');
    el.className = `portfolio-item group relative rounded-card overflow-hidden text-left ${layoutClass}`;
    el.dataset.category = kategori;

    // Tentukan link/src berdasarkan kategori
    let linkAtauSrc = '';
    let tipeModal = '';

    if (kategori === 'web') {
      linkAtauSrc = `detail-web.html?id=${item.id}`;
      el.href = linkAtauSrc;
    } else if (kategori === 'video') {
      linkAtauSrc = `https://www.youtube.com/embed/${item.id_youtube}?autoplay=1`;
      tipeModal = 'video';
      el.type = "button";
      el.dataset.modalType = tipeModal;
      el.dataset.title = item.judul;
      el.dataset.src = linkAtauSrc;
    } else {
      // design
      linkAtauSrc = item.gambar || '';
      tipeModal = 'image';
      el.type = "button";
      el.dataset.modalType = tipeModal;
      el.dataset.title = item.judul;
      el.dataset.src = linkAtauSrc;
    }

    const isWeb = kategori === 'web';
    const isVideo = kategori === 'video';
    
    // Tentukan gambar yang ditampilkan
    let gambarSrc = item.gambar || '';
    if (isVideo && !gambarSrc) {
      gambarSrc = `https://img.youtube.com/vi/${item.id_youtube}/maxresdefault.jpg`;
    }

    // Pergelap gradient dari bawah agar teks putih selalu terbaca meskipun background gambar terang
    const bgGradient = isWeb ? 'bg-gradient-to-t from-black/90 via-black/60 to-transparent' : (kategori === 'design' ? 'bg-gradient-to-t from-black/80 via-black/30 to-transparent' : 'bg-black/40 group-hover:bg-black/60 transition-colors');
    const badgePos = isVideo ? 'top-4 left-4' : 'top-4 right-4';
    const badgeText = isWeb ? 'Website' : (isVideo ? 'Video' : 'Desain');
    const badgeIcon = isWeb ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>` : '';
    const playBtn = isVideo ? `<div class="absolute inset-0 grid place-items-center"><span class="w-14 h-14 rounded-full bg-white/95 grid place-items-center transition-transform group-hover:scale-110"><svg width="20" height="20" viewBox="0 0 24 24" fill="#2563EB"><polygon points="6 3 20 12 6 21 6 3"/></svg></span></div>` : '';

    const hasColSpan2 = layoutClass.includes('col-span-2');

    el.innerHTML = `
      <img src="${gambarSrc}" alt="${item.judul}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
      <div class="absolute inset-0 ${bgGradient}"></div>
      <div class="absolute ${badgePos} bg-white/90 backdrop-blur text-primary text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
        ${badgeText} ${badgeIcon}
      </div>
      ${playBtn}
      <div class="absolute bottom-0 left-0 right-0 p-5 ${isWeb && hasColSpan2 ? 'md:p-6' : ''} bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        <h3 class="font-heading font-bold text-white text-base drop-shadow-md ${isWeb && hasColSpan2 ? 'md:text-2xl text-xl' : (isVideo && hasColSpan2 ? 'text-xl' : '')}">${item.judul}</h3>
        <p class="text-white/90 text-xs mt-1 line-clamp-2 drop-shadow-sm ${isWeb ? 'text-sm' : ''}" title="${item.deskripsi}">${item.deskripsi}</p>
      </div>
    `;

    bentoGrid.appendChild(el);
  });

  // Re-init filter dan modal setelah render
  initPortfolioFilter();
}

/* ---------------------------------------------------
   10. Render Data Web Otomatis (SUPABASE)
--------------------------------------------------- */
async function initWebRender() {
  const webContainer = document.getElementById('wadah-web');
  if (!webContainer) return;

  // Tampilkan loading state
  showLoadingState(webContainer, 3);

  // Fetch dari Supabase, filter kategori = 'web'
  const allData = await fetchPortofolio();
  const dataWeb = allData.filter(item => item.kategori === 'web');

  webContainer.innerHTML = '';

  dataWeb.forEach((web) => {
    const card = document.createElement('article');
    card.className = "portfolio-card fade-up relative group bg-surface rounded-card border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-accent/5 h-full";
    if (web.delay) card.style.transitionDelay = web.delay;

    const tags = Array.isArray(web.tags) ? web.tags : [];
    const tagsHTML = tags.map(tag => `<span class="text-xs font-medium text-accent bg-blue-50 rounded-full px-3 py-1 ring-1 ring-accent/10">${tag}</span>`).join('');

    card.innerHTML = `
      <a href="detail-web.html?id=${web.id}" class="flex flex-col h-full w-full">
        <div class="relative overflow-hidden aspect-[16/10] shrink-0">
          <img src="${web.gambar}" alt="${web.judul}" class="card-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        <div class="p-6 flex flex-col flex-grow gap-3">
          <h2 class="font-heading text-lg sm:text-xl font-bold text-primary leading-snug group-hover:text-accent transition-colors">${web.judul}</h2>
          <div class="text-secondary text-sm leading-relaxed max-h-24 overflow-y-auto custom-scrollbar pr-1" onclick="event.stopPropagation()">${web.deskripsi}</div>
          <div class="flex flex-wrap gap-2 mt-1">${tagsHTML}</div>
          <hr class="border-gray-100 mt-auto pt-3" />
          <div class="flex items-center justify-end">
            <span class="visit-link inline-flex items-center gap-1 text-accent text-sm font-semibold group-hover:underline transition-all duration-300">
              Buka Sampel <svg class="arrow-icon w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </div>
      </a>
    `;
    webContainer.appendChild(card);
  });
}

/* ---------------------------------------------------
   11. Render Data Desain Otomatis (SUPABASE)
--------------------------------------------------- */
async function initDesainRender() {
  const desainContainer = document.getElementById('wadah-desain');
  if (!desainContainer) return;

  // Tampilkan loading state
  showLoadingState(desainContainer, 3);

  // Fetch dari Supabase, filter kategori = 'design'
  const allData = await fetchPortofolio();
  const dataDesain = allData.filter(item => item.kategori === 'design');

  desainContainer.innerHTML = '';

  dataDesain.forEach((desain) => {
    const card = document.createElement('article');
    card.className = "portfolio-card fade-up relative group bg-surface rounded-card border border-gray-100 overflow-hidden break-inside-avoid transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-accent/5";
    if (desain.delay) card.style.transitionDelay = desain.delay;

    const tags = Array.isArray(desain.tags) ? desain.tags : [];
    const tagsHTML = tags.map(tag => `<span class="text-xs font-medium text-accent bg-blue-50 rounded-full px-3 py-1 ring-1 ring-accent/10">${tag}</span>`).join('');

    const rasio = desain.rasio || 'aspect-square';

    card.innerHTML = `
      <div class="relative overflow-hidden ${rasio}">
        <img src="${desain.gambar}" alt="${desain.judul}" class="card-image w-full h-full object-cover transition-transform duration-700" loading="lazy" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      <div class="p-6 flex flex-col gap-3">
        <h2 class="font-heading text-lg sm:text-xl font-bold text-primary leading-snug">${desain.judul}</h2>
        <p class="text-secondary text-sm leading-relaxed">${desain.deskripsi}</p>
        <div class="flex flex-wrap gap-2 mt-1">${tagsHTML}</div>
      </div>
    `;
    desainContainer.appendChild(card);
  });
}

/* ---------------------------------------------------
   12. Render Data Pricelist Otomatis & Tab Toggle (SUPABASE)
--------------------------------------------------- */
async function initPricelistSystem() {
  const wadahPricelist = document.getElementById('wadah-pricelist');
  const btnPortofolio = document.getElementById('btn-tab-portofolio');
  const btnPricelist = document.getElementById('btn-tab-pricelist');
  
  let kategoriHalaman = '';
  let wadahPortofolio = null;

  if (document.getElementById('wadah-web')) {
    kategoriHalaman = 'web';
    wadahPortofolio = document.getElementById('wadah-web');
  } else if (document.getElementById('wadah-desain')) {
    kategoriHalaman = 'desain';
    wadahPortofolio = document.getElementById('wadah-desain');
  } else if (document.getElementById('wadah-video')) {
    kategoriHalaman = 'video';
    wadahPortofolio = document.getElementById('wadah-video');
  }

  // Fetch data pricelist dari Supabase
  const dataPricelist = await fetchPricelist();

  // ======= RENDER PRICELIST HALAMAN KATEGORI =======
  if (wadahPricelist && kategoriHalaman) {
    wadahPricelist.innerHTML = ''; 
    
    const filteredData = dataPricelist.filter(item => item.kategori === kategoriHalaman);

    filteredData.forEach((paket, index) => {
      const card = document.createElement('article');
      const isPopuler = paket.is_populer === true;
      const borderStyle = isPopuler ? 'border-2 border-accent shadow-xl shadow-accent/10 bg-gradient-to-b from-blue-50/30 to-surface scale-[1.02]' : 'border border-gray-100 bg-surface';
      const badgePopuler = isPopuler ? `<span class="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-sm">⭐ Paling Populer</span>` : '';

      const fiturList = Array.isArray(paket.fitur) ? paket.fitur : [];
      const fiturHTML = fiturList.map(f => `
        <li class="flex items-center gap-2.5 text-sm text-secondary">
          <svg class="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${f}</span>
        </li>
      `).join('');

      card.className = `portfolio-card fade-up relative rounded-card p-6 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 ${borderStyle}`;
      
      let teksHarga = paket.harga;
      if (!isNaN(paket.harga)) {
        teksHarga = `Rp ${Number(paket.harga).toLocaleString('id-ID')}`;
      }

      card.innerHTML = `
        <div>
          ${badgePopuler}
          <h3 class="font-heading text-lg font-bold text-primary">${paket.nama_paket}</h3>
          <p class="text-2xl font-extrabold text-accent mt-1.5 mb-5">${teksHarga}</p>
          <hr class="border-gray-100 mb-5" />
          <ul class="space-y-2.5 mb-6">
            ${fiturHTML}
          </ul>
        </div>
        <button data-wa-order="${paket.nama_paket}" class="w-full py-2.5 px-4 rounded-full font-semibold text-sm transition-all duration-300 ${isPopuler ? 'bg-accent text-white hover:bg-blue-700 shadow-md shadow-accent/20' : 'bg-blue-50 text-accent hover:bg-accent hover:text-white'}">
          Pesan via WhatsApp
        </button>
      `;
      wadahPricelist.appendChild(card);
    });
  }

  // ======= TAB TOGGLE (Portofolio <-> Pricelist) =======
  if (btnPortofolio && btnPricelist && wadahPortofolio && wadahPricelist) {
    btnPortofolio.addEventListener('click', () => {
      wadahPortofolio.classList.remove('hidden');
      wadahPricelist.classList.add('hidden');
      btnPortofolio.className = "bg-accent text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-accent/20";
      btnPricelist.className = "bg-surface text-secondary hover:text-primary border border-gray-200 font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-300 hover:border-accent";
    });

    btnPricelist.addEventListener('click', () => {
      wadahPortofolio.classList.add('hidden');
      wadahPricelist.classList.remove('hidden');
      btnPricelist.className = "bg-accent text-white font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-accent/20";
      btnPortofolio.className = "bg-surface text-secondary hover:text-primary border border-gray-200 font-semibold text-sm px-6 py-2.5 rounded-full transition-all duration-300 hover:border-accent";
    });
  }

  // ======= RENDER PRICELIST BERANDA (is_combo_beranda = true) =======
  const wadahBeranda = document.getElementById('wadah-pricelist-beranda');
  
  if (wadahBeranda) {
    wadahBeranda.innerHTML = '';
    const promoData = dataPricelist.filter(item => item.is_combo_beranda === true);
    
    if (promoData.length === 4) {
      wadahBeranda.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto";
    } else if (promoData.length <= 2) {
      wadahBeranda.className = "grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto";
    } else {
      wadahBeranda.className = "grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto";
    }

    promoData.forEach((paket) => {
      const card = document.createElement('article');
      const isComboVIP = paket.kategori === 'combo'; 
      
      const borderStyle = isComboVIP 
        ? 'bg-gradient-to-b from-blue-50/80 via-surface to-surface border-2 border-accent shadow-2xl shadow-accent/15 md:scale-105 z-10' 
        : 'bg-surface border border-gray-200/80 hover:-translate-y-1.5 hover:shadow-lg shadow-sm';
        
      const badgeTop = isComboVIP 
        ? `<div class="flex items-center justify-between gap-2 mb-2">
             <span class="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">⭐ PALING CUAN</span>
             <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full ring-1 ring-emerald-200">Opening Promo</span>
           </div>` 
        : `<span class="text-xs font-bold text-secondary uppercase tracking-wider block mb-1.5">${paket.kategori.toUpperCase()} &amp; CREATIVE</span>`;

      let teksHarga = paket.harga;
      if (!isNaN(paket.harga)) {
        teksHarga = `Rp ${Number(paket.harga).toLocaleString('id-ID')}`;
      }

      const fiturList = Array.isArray(paket.fitur) ? paket.fitur : [];
      const fiturHTML = fiturList.map(f => `
        <li class="flex items-center gap-2.5 text-sm text-secondary font-medium">
          <svg class="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${f}</span>
        </li>
      `).join('');

      card.className = `portfolio-card fade-up relative rounded-card p-8 flex flex-col justify-between transition-all duration-500 ${borderStyle}`;
      
      card.innerHTML = `
        <div>
          ${badgeTop}
          <h3 class="font-heading text-xl md:text-2xl font-bold text-primary mt-1">${paket.nama_paket}</h3>
          <p class="text-3xl md:text-4xl font-extrabold text-accent mt-4 mb-6">${teksHarga} <span class="text-xs font-normal text-secondary">/ project</span></p>
          <hr class="border-gray-100 mb-6" />
          <ul class="space-y-3 mb-8">
            ${fiturHTML}
          </ul>
        </div>
        <button data-wa-order="${paket.nama_paket}" class="w-full py-3.5 px-6 rounded-full font-bold text-sm transition-all duration-300 ${isComboVIP ? 'bg-accent text-white hover:bg-blue-700 shadow-lg shadow-accent/30' : 'bg-blue-50 text-accent hover:bg-accent hover:text-white'}">
          Pesan via WhatsApp &rarr;
        </button>
      `;
      wadahBeranda.appendChild(card);
    });
  }
}

/* ---------------------------------------------------
   13. Handle Klik Tombol WhatsApp (Order & Konsultasi)
   UPDATED: Sekarang lookup data dari Supabase cache
--------------------------------------------------- */
function initWhatsAppHandler() {
  const NOMOR_WA = "6287828703713"; // Nomor resmi Vylogix Studio

  document.addEventListener('click', async (e) => {
    const btnOrder = e.target.closest('[data-wa-order]');
    const btnConsult = e.target.closest('[data-wa-consult]');
    const btnCustom = e.target.closest('[data-wa-custom]');

    // 1. JIKA TOMBOL PESAN PAKET DIKLIK (Dari Pricelist)
    if (btnOrder) {
      const namaPaket = btnOrder.getAttribute('data-wa-order');
      
      // Cari data detail paket dari cache Supabase
      const dataPricelist = await fetchPricelist();
      let detailPaket = null;
      if (dataPricelist && dataPricelist.length > 0) {
        detailPaket = dataPricelist.find(p => p.nama_paket === namaPaket);
      }

      let teksPesan = "";

      if (detailPaket) {
        // Susun daftar fitur menjadi bullet points
        const fiturList = Array.isArray(detailPaket.fitur) ? detailPaket.fitur : [];
        const daftarFitur = fiturList.map(f => `  • ${f}`).join('\n');
        
        // Tentukan batas revisi berdasarkan Kategori dari Kitab Suci Operasional
        let ketentuanRevisi = "";
        if (detailPaket.kategori === 'web') {
          ketentuanRevisi = "  • *Ketentuan:* Maksimal 2x Revisi Layout/Struktur (Materi teks & foto dari klien).\n  • *Waktu Kerja:* Express Turnaround (Siap cepat & rapi).";
        } else if (detailPaket.kategori === 'video') {
          ketentuanRevisi = "  • *Ketentuan:* Maksimal 2x Revisi Editing (Bahan mentah maks. 15-20 menit).\n  • *Waktu Kerja:* Pacing Audio Presisi & Color Grading Sinematik.";
        } else if (detailPaket.kategori === 'desain') {
          ketentuanRevisi = "  • *Ketentuan:* Maksimal 2x Revisi Desain (File High-Res siap cetak & digital).\n  • *Waktu Kerja:* 100% Custom Design sesuai identitas brand.";
        } else if (detailPaket.kategori === 'combo') {
          ketentuanRevisi = "  • *Ketentuan:* Maksimal 2x Revisi per item jasa (Web, Video, & Desain).\n  • *Waktu Kerja:* 2 - 3 Hari Kerja (VIP Prioritas Express).";
        }

        // Format pesan resmi bergaya Agensi
        teksPesan = `Halo Admin Vylogix Studio! 👋\n\n` +
          `Saya tertarik untuk ambil pesanan *${detailPaket.nama_paket}* (Rp ${Number(detailPaket.harga).toLocaleString('id-ID')}).\n\n` +
          `*Spesifikasi yang saya dapatkan:*\n${daftarFitur}\n\n` +
          `*SOP & Batas Revisi:*\n${ketentuanRevisi}\n\n` +
          `Boleh minta informasi langkah selanjutnya (SOP pembayaran DP 50% & pengiriman bahan materi)? Terima kasih!`;
      } else {
        // Pesan cadangan jika data paket tidak ditemukan
        teksPesan = `Halo Admin Vylogix Studio! Saya tertarik dengan *${namaPaket}* yang ada di website. Boleh minta info detail alur kerja dan ketersediaan slot bulan ini?`;
      }

      const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(teksPesan)}`;
      window.open(url, '_blank');
    }

    // 2. JIKA TOMBOL KONSULTASI GRATIS DIKLIK (Kolom Biru / Navbar)
    if (btnConsult) {
      const pesan = `Halo Admin Vylogix Studio! 👋\n\n` +
        `Saya mau *Konsultasi Gratis* dulu mengenai kebutuhan digital branding dan development untuk bisnis/project saya.\n\n` +
        `Boleh arahan dari tim Vylogix enaknya mulai dari mana dan rekomendasi paket yang cocok?`;
      const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(pesan)}`;
      window.open(url, '_blank');
    }

    // 3. JIKA TOMBOL CUSTOM PROJECT DIKLIK (Kolom Biru)
    if (btnCustom) {
      const pesan = `Halo Admin Vylogix Studio! 👋\n\n` +
        `Saya memiliki kebutuhan *Custom Project / Event* (di luar paket standar yang ada di website).\n\n` +
        `Saya ingin mendiskusikan spesifikasi khusus, timeline pengerjaan, serta penawaran harganya. Apakah bisa dijadwalkan diskusi lebih lanjut?`;
      const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(pesan)}`;
      window.open(url, '_blank');
    }
  });
}

/* ---------------------------------------------------
   14. Navbar Active Underline on Scroll (ScrollSpy)
--------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150; 
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('text-accent', 'font-bold', 'border-b-2', 'border-accent', 'pb-1');
      link.classList.add('text-secondary');
      
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.classList.remove('text-secondary');
        link.classList.add('text-accent', 'font-bold', 'border-b-2', 'border-accent', 'pb-1');
      }
    });
  });
}