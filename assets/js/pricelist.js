// ==========================================
// DATA PRICELIST & PAKET - VYLOGIX STUDIO
// ==========================================
// Catatan Urutan Tampilan di Beranda (3 Kolom):
// 1. Kolom Kiri   : Paket Web Esensial (web-02)
// 2. Kolom Tengah : All-In Pro Combo (combo-01) -> VIP Glow!
// 3. Kolom Kanan  : Paket Aftermovie & Vlog (vid-02)
// ==========================================

const dataPricelist = [
  // ==========================================
  // 1. KATEGORI: WEB DEVELOPMENT
  // ==========================================
  {
    id: "web-01",
    kategori: "web",
    nama_paket: "Paket Ekspresi",
    harga: 150000,
    fitur: [
      "1 Halaman (Single Page / Landing Page)",
      "Desain Template Modern & Clean",
      "Sangat Responsive (Mobile-Friendly)",
      "Maksimal 1x Revisi Minor"
    ],
    is_combo_beranda: false, // <-- Cuma muncul di web.html
    is_populer: false
  },
  {
    id: "web-02",
    kategori: "web",
    nama_paket: "Paket Web Esensial",
    harga: 350000,
    fitur: [
      "Landing Page Custom (Tailwind CSS)",
      "Animasi Fade-Up & Interaktif yang Smooth",
      "Integrasi Tombol WhatsApp Otomatis",
      "Optimasi Kecepatan Load Super Cepat",
      "Maksimal 2x Revisi Layout"
    ],
    is_combo_beranda: true, // <-- MUNCUL DI BERANDA (Kolom Kiri)
    is_populer: true        // <-- Menjadi Best Seller di halaman web.html
  },
  {
    id: "web-03",
    kategori: "web",
    nama_paket: "Paket Bisnis Pro",
    harga: 750000,
    fitur: [
      "Multi-page Company Profile (Up to 4 Page)",
      "Desain UI/UX Premium & Eksklusif",
      "Struktur SEO Dasar & Mobile-First",
      "Gratis Panduan Pengelolaan Website",
      "Maksimal 3x Revisi Konsep & Layout"
    ],
    is_combo_beranda: false,
    is_populer: false
  },

  // ==========================================
  // 2. KATEGORI: ANCHOR COMBO (TARUH DISINI BIAR DI TENGAH BERANDA!)
  // ==========================================
  {
    id: "combo-01",
    kategori: "combo", // <-- Kategori combo otomatis dibuat menyala & besar oleh JS
    nama_paket: "All-In Pro Combo",
    harga: 399000,
    fitur: [
      "1 Website Landing Page Esensial (Tailwind)",
      "1 Video Promo Commercial / Reels (60 Detik)",
      "3 Desain Poster / Social Media Feed",
      "Integrasi Tombol WhatsApp Business Otomatis",
      "VIP Prioritas Pengerjaan Cepat (Express)"
    ],
    is_combo_beranda: true, // <-- MUNCUL DI BERANDA (Kolom Tengah - VIP Glow!)
    is_populer: true
  },

  // ==========================================
  // 3. KATEGORI: VIDEO EDITING
  // ==========================================
  {
    id: "vid-01",
    kategori: "video",
    nama_paket: "Paket Short / Reels",
    harga: 50000,
    fitur: [
      "Durasi Video Maksimal 1 Menit (Vertikal)",
      "Dynamic Cut & Transisi yang Mulus",
      "Basic Color Grading & Text Subtitle",
      "Audio Design & BGM (No-Copyright)",
      "Maksimal 1x Revisi Minor"
    ],
    is_combo_beranda: false,
    is_populer: false
  },
  {
    id: "vid-02",
    kategori: "video",
    nama_paket: "Paket Aftermovie & Vlog",
    harga: 150000,
    fitur: [
      "Durasi Video 3 - 5 Menit (Landscape/Portrait)",
      "Pacing Audio Presisi & Transisi Smooth",
      "Color Grading Standar Sinematik",
      "Bahan Video Mentah Maksimal 15 Menit",
      "Maksimal 2x Revisi Editing"
    ],
    is_combo_beranda: true, // <-- MUNCUL DI BERANDA (Kolom Kanan)
    is_populer: true        // <-- Menjadi Best Seller di halaman video.html
  },
  {
    id: "vid-03",
    kategori: "video",
    nama_paket: "Paket Cinematic Pro",
    harga: 350000,
    fitur: [
      "Profil Organisasi / Kampus / Commercial",
      "Cinematic Color Grading (Standar Duta Kampus)",
      "Light Leaks, VFX & Transisi Dinamis",
      "Audio Design Rapi & Sound Effect Profesional",
      "Maksimal 3x Revisi Konsep & Editing"
    ],
    is_combo_beranda: false,
    is_populer: false
  },

  // ==========================================
  // 4. KATEGORI: DESAIN GRAFIS
  // ==========================================
  {
    id: "des-01",
    kategori: "desain",
    nama_paket: "Paket Instan",
    harga: 35000,
    fitur: [
      "1 Desain Poster Event / Feed Sosmed",
      "Berbasis Template Berkualitas Tinggi",
      "Proses Pengerjaan Cepat & Rapi",
      "Maksimal 1x Revisi Minor"
    ],
    is_combo_beranda: false,
    is_populer: false
  },
  {
    id: "des-02",
    kategori: "desain",
    nama_paket: "Paket Custom Design",
    harga: 75000,
    fitur: [
      "Desain Custom & Manipulasi Foto",
      "Tipografi Khusus & Layout Modern",
      "File Resolusi Tinggi (PNG, JPG, PDF)",
      "Sangat Cocok untuk Campaign & Event",
      "Maksimal 2x Revisi Desain"
    ],
    is_combo_beranda: false,
    is_populer: true // <-- Menjadi Best Seller di halaman desain.html
  },
  {
    id: "des-03",
    kategori: "desain",
    nama_paket: "Paket Rebranding Identitas",
    harga: 350000,
    fitur: [
      "Perancangan Ulang Logo Brand / Usaha",
      "Panduan Warna & Tipografi Brand",
      "Bonus 3 Template Social Media Feed",
      "File Mentah Lengkap (AI / PSD / EPS)",
      "Maksimal 3x Revisi Sketsa & Digital"
    ],
    is_combo_beranda: false,
    is_populer: false
  }
];