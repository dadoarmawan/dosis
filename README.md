# OMSA Medic — Pediatric Dose Calculator

Versi final untuk **GitHub Pages**.

## Struktur

```text
index.html
app.js
style.css
README.md
data/
  medicines.json
  inventory-products.json
```

Semua file sudah berada di **root repository** sehingga `index.html` dapat langsung dikenali GitHub Pages.

## Upload ke GitHub

1. Ekstrak ZIP.
2. Upload **isi folder ZIP**, bukan folder pembungkusnya.
3. Di root repository harus langsung terlihat `index.html`, `app.js`, `style.css`, dan folder `data`.
4. Buka **Settings → Pages**.
5. Pilih **Deploy from a branch**, branch utama, folder **/(root)**.
6. Simpan dan tunggu proses deployment.

## Database

- `data/medicines.json` = database kalkulator dengan regimen pediatrik, sediaan, merek, dan referensi.
- `data/inventory-products.json` = daftar produk dari inventaris klinik yang diimpor.
- Sediaan bersifat **statis**; tidak ada menu untuk menambah sediaan dari aplikasi.

## Catatan klinis

Aplikasi ini merupakan alat bantu perhitungan dan bukan pengganti penilaian klinis. Verifikasi pasien, usia, BB, indikasi, alergi, kontraindikasi, interaksi, fungsi ginjal/hati, konsentrasi produk, dosis maksimum, dan monograf/formularium yang berlaku sebelum pemberian.

Untuk antibiotik, gunakan regimen berdasarkan diagnosis/indikasi dan pedoman yang sesuai; jangan memilih antibiotik hanya berdasarkan berat badan.

Sumber sekunder seperti MIMS, Halodoc, Alodokter, dan K24Klik digunakan sebagai referensi tambahan pada pengembangan database dan tidak menggantikan pedoman primer, formularium, atau informasi produk resmi.
