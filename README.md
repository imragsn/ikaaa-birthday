# Website Ulang Tahun Ikaaa 🎂

Website interaktif kado ulang tahun ke-27 Ikaa (8 November 2026).
Dibangun dari PRD v0.3 FINAL — gaya Monta (Dribbble), karakter 2.5D clay.

## Isi folder ini
- `index.html` — website utama
- `content.js` — SATU-SATUNYA sumber isi (teks, galeri, quiz, surat)
- `admin.html` — halaman admin: edit isi, download `content.js` baru
- `images/character/` — 3 gambar karakter (outfit-black / pink / navy)
- `images/gallery/` — 12 foto galeri (1.jpg–12.jpg, sudah dikompres)

## Cara publish ke GitHub Pages (GitHub Free, repo public)
1. Buat repo public baru di GitHub, misal `ikaaa-birthday`.
2. Upload SEMUA isi folder ini ke root repo (bukan folder `site/`-nya, tapi isinya).
3. Di repo: Settings → Pages → Source: Deploy from a branch → Branch: `main`, folder `/ (root)` → Save.
4. Tunggu 1–2 menit, buka `https://username.github.io/ikaaa-birthday/`.
5. Kirim link itu ke Ikaa tanggal 8 November jam 07:00 WIB.

## Cara ganti isi (tanpa utak-atik kode)
1. Buka `admin.html` di browser (atau `https://username.github.io/ikaaa-birthday/admin.html`).
2. Edit judul, caption galeri, soal quiz, surat, dll.
3. Klik "Download content.js baru".
4. Ganti file `content.js` di repo dengan file hasil download, commit + push.
5. Tunggu 1–2 menit, refresh website.

Foto diganti dengan menukar file di `images/gallery/` dengan nama yang sama
(1.jpg–12.jpg). Karakter diganti di `images/character/`.

## Gerbang
Ikaa harus memasukkan tanggal lahir `08-11-1999` untuk masuk.
Ini gerbang iseng, bukan pengaman beneran.

## Musik
Lagu Happy Birthday dimainkan dengan WebAudio (nada piano sintetis),
mulai setelah Ikaa menekan tombol "Mulai". Ada tombol mute di pojok.
Tidak ada file musik eksternal, jadi tidak ada masalah lisensi.
