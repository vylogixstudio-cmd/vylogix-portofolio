-- Migration: Menambahkan kolom 'galeri' dan 'demo_akun' ke tabel 'portofolio'
-- Untuk fitur halaman detail sampel Vylogix Studio

-- Kolom 'galeri' menyimpan array of objects:
-- [ { "gambar": "url...", "deskripsi": "Fitur A" }, ... ]
ALTER TABLE public.portofolio
ADD COLUMN IF NOT EXISTS galeri JSONB DEFAULT '[]'::jsonb;

-- Kolom 'demo_akun' menyimpan array of objects:
-- [ { "Role": "Super Admin", "Email": "admin@x.com", "Password": "123" }, ... ]
ALTER TABLE public.portofolio
ADD COLUMN IF NOT EXISTS demo_akun JSONB DEFAULT '[]'::jsonb;

-- Catatan: Eksekusi SQL ini di SQL Editor dashboard Supabase Anda.
