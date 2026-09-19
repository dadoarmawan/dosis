# Pediatric Dose Calculator — OMSA Medic

Web app statis untuk GitHub Pages.

## Deploy
1. Upload seluruh folder/repository ini ke GitHub.
2. Pastikan `index.html`, `app.js`, `style.css`, dan folder `data/` berada pada root repository.
3. GitHub → Settings → Pages → Deploy from branch → pilih branch utama dan folder `/ (root)`.
4. Buka URL GitHub Pages.

## Struktur database
`data/medicines.json` berisi nama generik, regimen, sediaan, konsentrasi, dan referensi yang ditampilkan.

## Catatan keselamatan
Database awal adalah contoh terkurasi dan bukan formularium lengkap. Sebelum dipakai untuk keputusan klinis, setiap regimen harus diverifikasi terhadap pedoman pediatrik/formularium yang berlaku di fasilitas. Tambahkan obat/regimen hanya setelah sumber primer/otoritatif diverifikasi.


## Antibiotic stewardship
Antibiotic entries are reference calculations only. The WHO AWaRe antibiotic book provides indication-specific guidance on antibiotic choice, dose, route and duration; the app should not select an antibiotic solely from body weight. Verify diagnosis, age group, renal function, allergy, local resistance guidance, and the exact product concentration before prescribing.


## Database MIMS
Database diperluas menggunakan informasi publik MIMS Indonesia sebagai salah satu referensi monograf. Konten MIMS berhak cipta; proyek ini tidak menyalin database MIMS secara keseluruhan. Sediaan dibuat statis di `data/medicines.json` dan tidak ada menu untuk menambah sediaan dari browser. Selalu verifikasi monograf produk lokal dan protokol klinik sebelum penggunaan.


### Sumber tambahan dosis pediatrik
Database v6 menambahkan beberapa monograf dengan pembanding informasi publik dari Halodoc, Alodokter, dan K24Klik. Sumber tersebut digunakan sebagai referensi sekunder dan bukan pengganti pedoman/formularium atau informasi produk resmi. Untuk obat kombinasi, periksa seluruh komponen aktif agar tidak terjadi duplikasi dosis.
