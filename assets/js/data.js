// ==========================================
// DATA PORTFOLIO - VYLOGIX STUDIO
// ==========================================

// ==========================================
// 1. DATA UNTUK WEB (web.html) - TARUH DI ATAS
// ==========================================
const dataWeb = [
 // {
    //gambar: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=720&h=450&fit=crop&q=80",
    //judul: "GreenTech Solutions",
    //deskripsi: "Website company profile dengan dashboard analitik.",
    //tags: ["Company Profile", "Next.js"],
    //link: "https://github.com",
    //delay: "0ms",
    //terpilih: true, // <-- Muncul di beranda (Karya Terpilih)
    //layoutClass: "md:col-span-2 md:row-span-2 min-h-[280px]" // Bikin kotak lebih gede di beranda
 // },
 // {
    //gambar: "https://images.unsplash.com/photo-1555421689-d68471e189f2?w=720&h=450&fit=crop&q=80",
    //judul: "FoodieSpot Indonesia",
    //deskripsi: "Platform direktori kuliner.",
    //tags: ["Web App", "React"],
    //link: "https://github.com",
    //delay: "120ms",
    //terpilih: false // <-- Nggak muncul di beranda
 // },
  {
    gambar: "assets/img/kado.png",
    judul: "Kado Buat Ade Keny",
    deskripsi: "Project website ucapan personal yang interaktif.",
    tags: ["Web", "Personal", "Website"],
    link: "https://muhammadzakimuharor-arch.github.io/kado-buat-ade-keny/",
    delay: "240ms",
    terpilih: true, // <-- Muncul di beranda (Karya Terpilih)
    layoutClass: "md:col-start-3 md:row-start-1 md:col-span-2 md:row-span-1 min-h-[180px] md:min-h-[210px]"
  }
];

// ==========================================
// 2. DATA UNTUK DESAIN (desain.html)
// ==========================================
const dataDesain = [
  {
    gambar: "https://images.unsplash.com/photo-1636955816868-fcb881e57954?w=640&h=800&fit=crop&q=80",
    judul: "Rebranding Kopi Kenangan",
    deskripsi: "Perancangan ulang identitas visual lengkap.",
    tags: ["Branding", "Logo"],
    delay: "0ms",
    rasio: "aspect-square",
    terpilih: true, // <-- Muncul di beranda
    layoutClass: "md:col-start-3 md:row-start-2 md:col-span-2 md:row-span-1 min-h-[180px] md:min-h-[210px]"
  },
  {
    gambar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=640&h=640&fit=crop&q=80",
    judul: "Poster Festival Musik Nusantara",
    deskripsi: "Desain poster event nasional.",
    tags: ["Poster", "Event"],
    delay: "100ms",
    rasio: "aspect-square",
    terpilih: false
  }
];

// ==========================================
// 3. DATA UNTUK VIDEO (video.html)
// ==========================================
const dataVideo = [
  {
    id_youtube: "ouaQpg7Zvv0",
    judul: "Video Profil Duta Kampus S1 Sistem Informasi — Universitas Sunan Gresik",
    deskripsi: "Dynamic cut dengan color grading cinematic.",
    tags: ["Aftermovie", "Event", "Cinematic"],
    delay: "0ms",
    terpilih: true, // <-- Muncul di beranda
    layoutClass: "md:col-start-1 md:row-start-1 md:col-span-2 md:row-span-2 min-h-[250px] md:min-h-[440px]"
  },
  //{
    //id_youtube: "jNQXAC9IVRw",
    //judul: "Promo Commercial — Brand Fashion Lokal",
    //deskripsi: "Video promosi 60 detik dengan pacing cepat.",
    //tags: ["Commercial", "Reels", "Fashion"],
    //delay: "150ms",
    //terpilih: false
  //}
];

// ==========================================
// 4. MESIN PENGUMPUL OTOMATIS (WAJIB DI PALING BAWAH!)
// ==========================================
const dataPortfolioHome = [];

// Otomatis ngambil dari dataWeb yang ada tanda 'terpilih: true'
if (typeof dataWeb !== 'undefined') {
  dataWeb.forEach(item => {
    if (item.terpilih) {
      dataPortfolioHome.push({
        kategori: "web",
        judul: item.judul,
        deskripsi: item.deskripsi,
        gambar: item.gambar,
        link_atau_src: item.link,
        layoutClass: item.layoutClass || "md:col-span-1 md:row-span-1 min-h-[220px]"
      });
    }
  });
}

// Otomatis ngambil dari dataDesain yang ada tanda 'terpilih: true'
if (typeof dataDesain !== 'undefined') {
  dataDesain.forEach(item => {
    if (item.terpilih) {
      dataPortfolioHome.push({
        kategori: "design",
        tipe_modal: "image",
        judul: item.judul,
        deskripsi: item.deskripsi,
        gambar: item.gambar,
        link_atau_src: item.gambar,
        layoutClass: item.layoutClass || "md:col-span-1 md:row-span-1 min-h-[220px]"
      });
    }
  });
}

// Otomatis ngambil dari dataVideo yang ada tanda 'terpilih: true'
if (typeof dataVideo !== 'undefined') {
  dataVideo.forEach(item => {
    if (item.terpilih) {
      const thumbUrl = item.gambar || `https://img.youtube.com/vi/${item.id_youtube}/maxresdefault.jpg`;
      dataPortfolioHome.push({
        kategori: "video",
        tipe_modal: "video",
        judul: item.judul,
        deskripsi: item.deskripsi,
        gambar: thumbUrl,
        link_atau_src: `https://www.youtube.com/embed/${item.id_youtube}?autoplay=1`,
        layoutClass: item.layoutClass || "md:col-span-1 md:row-span-1 min-h-[220px]"
      });
    }
  });
}