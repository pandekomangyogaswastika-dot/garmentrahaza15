import { useState, useEffect } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, Search, Play, CheckCircle2,
  AlertTriangle, Package, ClipboardList, Users, DollarSign, Warehouse,
  BarChart3, Settings, Workflow, FileText, Shield, BookMarked, HelpCircle
} from 'lucide-react';

/* ─── DATA: Panduan ─────────────────────────────────────────────── */
const SECTIONS = [
  {
    id: 'overview',
    icon: BookOpen,
    title: 'Overview Sistem ERP Rahaza',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    content: `
## Apa itu PT Rahaza ERP?
Sistem ERP (Enterprise Resource Planning) Rahaza adalah platform terpadu untuk mengelola seluruh operasional PT Rahaza Global Indonesia — mulai dari perencanaan produksi, manajemen gudang, keuangan, hingga sumber daya manusia.

## 5 Portal Utama

| Portal | Pengguna | Fungsi Utama |
|--------|----------|--------------|
| **Manajemen** | Direktur, Manager | Dashboard executive, analytics, order buyer |
| **Produksi** | Supervisor, PPIC, Operator | WO, LKP, APS, Line assignment, OEE |
| **Gudang** | Kepala Gudang, Staff | Material, inventori, PO, reservasi |
| **Keuangan** | Finance Staff | Jurnal, payroll, laporan keuangan |
| **SDM** | HR Staff | Karyawan, absensi, laporan HR |

## Login & Navigasi
1. Akses sistem melalui URL yang diberikan admin
2. Login menggunakan email & password yang terdaftar
3. Pilih portal sesuai peran Anda
4. Menu navigasi ada di sidebar kiri
5. Klik nama portal di kiri atas untuk pindah antar portal
    `,
  },
  {
    id: 'manajemen',
    icon: BarChart3,
    title: 'Portal Manajemen',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    subsections: [
      {
        title: 'Dashboard Eksekutif',
        content: `**Menu**: Dashboard > Dashboard Eksekutif
- **KPI Overview**: Total WO aktif, WO selesai bulan ini, OEE rata-rata, total karyawan
- **Production Trend Chart**: Grafik output produksi 30 hari terakhir
- **Top Issues**: Masalah produksi yang paling sering muncul
- **Penggunaan**: Dibuka pertama kali saat masuk portal Manajemen. Refresh otomatis setiap 5 menit.`,
      },
      {
        title: 'Style Master (Model Produk)',
        content: `**Menu**: Master Data > Model Produk
- **Daftar Model**: Semua desain yang pernah/akan diproduksi
- **Tambah Model**: Kode, nama, kategori, berat benang per pcs, ukuran bundle, upload foto desain
- **BOM (Bill of Materials)**: Daftar material per model, qty per pcs
- **Upload Foto**: Foto desain akan otomatis muncul di LKP PDF`,
      },
      {
        title: 'Order Management',
        content: `**Menu**: Order > Order Produksi
- **Buat Order**: Pilih buyer/customer, model, qty, ukuran, tanggal kirim
- **Status Order**: Draft → Confirmed → In Production → Shipped
- **Generate WO**: Dari order, buat Work Order secara otomatis per batch
- **Tracking**: Pantau progress order vs target`,
      },
    ],
  },
  {
    id: 'produksi',
    icon: Workflow,
    title: 'Portal Produksi',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    subsections: [
      {
        title: 'Work Order (WO)',
        content: `**Menu**: Eksekusi > Work Order
- **Buat WO Manual**: Isi WO#, model, lini, qty, tanggal mulai/selesai
- **Generate dari Order**: Otomatis buat WO batch dari order
- **Status WO**: Draft → Released → In Progress → Completed / Cancelled
- **Release WO**: Mengubah status ke Released dan otomatis mem-blokir/reserve material di gudang
- **Cetak LKP Massal**: Tombol di header — melihat status LKP semua WO aktif sekaligus, dengan link cetak PDF langsung
- **⚠️ Catatan**: Saat WO di-release, sistem otomatis buat reservasi material sesuai BOM`,
      },
      {
        title: 'LKP (Lembar Kerja Produksi)',
        content: `**Menu**: Eksekusi > Work Order > [klik WO] > LKP
- **LKP adalah**: Dokumen instruksi kerja untuk satu WO — berisi SOP, BOM, QC checklist, instruksi packing
- **Buat LKP**: Pilih WO → isi data → generate PDF
- **Upload Foto Produksi**: Di detail LKP, tombol "Upload Foto" — foto QC, foto defect, foto progres
- **Foto otomatis muncul di PDF** setelah di-upload (Section L)
- **Download PDF**: Klik tombol PDF — selalu generate ulang dengan foto terbaru
- **Versioning**: LKP punya versi — setiap revisi buat versi baru
- **Bulk LKP**: Cetak LKP Massal dari halaman WO untuk melihat semua WO aktif`,
      },
      {
        title: 'APS Gantt (Penjadwalan Otomatis)',
        content: `**Menu**: Monitoring > Penjadwalan APS (Gantt)
- **Gantt Chart**: Visualisasi jadwal semua WO per lini produksi
- **Auto Schedule**: Tombol "Auto Schedule" — AI mengoptimalkan urutan WO berdasarkan due date & kapasitas lini
- **Holiday Highlight**: Kolom hari libur berwarna merah (dari Kalender Produksi)
- **Drag & Reschedule**: Klik WO di gantt, ubah tanggal
- **Line Balance Tab**: Lihat keseimbangan beban per lini
- **Filter**: Per lini, per proses, per status WO`,
      },
      {
        title: 'Assign Lini Hari Ini',
        content: `**Menu**: Eksekusi > Assign Lini Hari Ini
- **Fungsi**: Tentukan karyawan dan mesin yang bertugas di lini & shift mana hari ini
- **Cara Pakai**: Pilih tanggal → pilih lini → assign karyawan per stasiun kerja
- **Copy Yesterday**: Tombol "Copy dari Kemarin" untuk mengisi otomatis dari assignment hari sebelumnya
- **Auto-Assign dari Template**: Tombol "Auto-Assign dari Template" mengisi sesuai template tersimpan`,
      },
      {
        title: 'Bulk Material Issue (Bulk MI)',
        content: `**Menu**: Eksekusi > Bulk Material Issue
- **Fungsi**: Keluarkan (issue) material ke lantai produksi untuk banyak WO sekaligus
- **Filter**: Default tampil WO status "in_progress" — bisa filter ke "released"
- **Langkah**: Pilih WO yang ingin di-issue → review BOM → konfirmasi → material terkurangi dari stok
- **⚠️ Catatan**: Pastikan stok material cukup sebelum issue`,
      },
      {
        title: 'Shift Handover',
        content: `**Menu**: Eksekusi > Shift Handover
- **Buat Handover**: Klik "Buat Handover Baru" → pilih shift & tanggal → isi checklist, catatan, masalah, task
- **Checklist**: 5 item standar (target produksi, quality, downtime, material, keselamatan)
- **Issues**: Catat masalah dengan tipe (mesin/material/karyawan/kualitas) dan prioritas
- **Pending Tasks**: Task yang harus diselesaikan shift berikutnya
- **Sign Off**: Supervisor shift berikutnya klik tombol "Sign Off" di kartu → modal konfirmasi → status jadi "Signed Off"
- **Download PDF**: Di detail handover, tombol "Download PDF" → generate End-of-Shift Report PDF`,
      },
      {
        title: 'Reservasi Material',
        content: `**Menu**: Eksekusi > Reservasi Material (juga di Gudang)
- **Tab Per Work Order**: Pilih WO → lihat semua reservasi aktif → tombol Release per item atau "Release Semua"
- **Tab Per Material**: Grid semua material dengan bar availability (hijau/kuning/merah)
- **Buat Reservasi Manual**: Tombol "Buat Reservasi" → pilih WO + material + qty
- **Auto-Reservasi**: Saat WO di-release, sistem otomatis reserve material dari BOM
- **Stok Tersedia = Stok Total - Reserved**`,
      },
      {
        title: 'Kalender Produksi',
        content: `**Menu**: Master Data > Kalender Produksi
- **Kalender Grid**: Lihat hari libur & pengecualian per bulan
- **Seed Libur Nasional**: Tombol "Seed Libur Nasional 2026" untuk isi otomatis 20 hari libur nasional
- **Tambah Entri**: Tambah hari libur khusus, pengecualian, atau catatan penting
- **Tipe Entri**: Hari Libur (merah), Pengecualian (kuning), Catatan Khusus (biru)
- **Kalkulator Hari Kerja**: Masuk tanggal dari-sampai → hitung hari kerja efektif (minus libur & Minggu)
- **Integrasi APS**: Kolom hari libur otomatis merah di APS Gantt Chart`,
      },
      {
        title: 'OEE Dashboard',
        content: `**Menu**: Monitoring > OEE Dashboard
- **OEE = Availability × Performance × Quality**
- **4 KPI Cards**: OEE rata-rata, Availability, Performance, Quality Rate
- **Tren Chart**: Grafik OEE per hari selama rentang tanggal
- **Bar Chart**: Perbandingan OEE per lini produksi
- **Drilldown per Lini**: Klik ikon expand di tabel → lihat downtime events & output events detail
- **Filter**: Pilih lini tertentu atau semua lini; atur rentang tanggal
- **Target OEE industri garment: 65%** (garis kuning di chart)`,
      },
      {
        title: 'Line Balancing',
        content: `**Menu**: Monitoring > Line Balancing
- **SAM (Standard Allowance Minutes)**: Waktu standar per proses dari SOP
- **Bottleneck Detection**: Lini yang paling lambat (SAM tertinggi) ditandai merah
- **Rekomendasi**: Sistem saran penambahan/pengurangan operator per stasiun
- **Input**: Pilih model → hitung otomatis berdasarkan SAM dari SOP`,
      },
      {
        title: 'SOP Produksi',
        content: `**Menu**: Master Data > SOP Produksi
- **SOP per Model + Proses**: Instruksi kerja detail untuk setiap kombinasi model-proses
- **Fields**: Langkah kerja, SAM (menit), target pcs per operator, alat, APD, kriteria penerimaan
- **Terintegrasi LKP**: SOP otomatis masuk ke Section H (Tahapan Proses) di LKP PDF`,
      },
    ],
  },
  {
    id: 'gudang',
    icon: Warehouse,
    title: 'Portal Gudang',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    subsections: [
      {
        title: 'Material (Benang & Aksesoris)',
        content: `**Menu**: Inventori > Benang / Aksesoris
- **Daftar Material**: Kode, nama, tipe (yarn/accessory/packaging), stok, min stok
- **Low Stock Badge**: Material dengan stok < min_stock ditandai badge merah
- **Tambah Material**: Isi kode, nama, tipe, satuan, stok awal, minimum stok
- **Edit Stok**: Langsung di tabel atau melalui transaksi (lebih akurat)`,
      },
      {
        title: 'Penerimaan Barang (Receiving)',
        content: `**Menu**: Inventori > Penerimaan Barang
- **Scan/Input PO**: Masuk PO number → tampil item yang dipesan
- **Konfirmasi Penerimaan**: Centang item yang datang, isi qty aktual
- **Stok Otomatis Bertambah**: Setelah konfirmasi, stok material update otomatis
- **Dokumen**: Generate Bon Penerimaan Barang (BPB)`,
      },
      {
        title: 'Reservasi Material',
        content: `**Menu**: Inventori > Reservasi Material
- Sama seperti di portal Produksi — admin gudang bisa lihat semua reservasi aktif
- **Release**: Batalkan reservasi jika WO dibatalkan`,
      },
    ],
  },
  {
    id: 'keuangan',
    icon: DollarSign,
    title: 'Portal Keuangan',
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    subsections: [
      {
        title: 'Jurnal & Akuntansi',
        content: `**Menu**: Akuntansi > Chart of Accounts / Jurnal
- **CoA**: Kelola akun-akun keuangan (aset, kewajiban, modal, pendapatan, beban)
- **Jurnal Entri**: Input transaksi dengan debit-kredit
- **Auto-Posting**: Transaksi dari modul lain (payroll, pembelian) bisa auto-post ke jurnal`,
      },
      {
        title: 'Payroll',
        content: `**Menu**: Penggajian > Payroll Run
- **Proses Payroll**: Pilih periode → sistem hitung gaji berdasarkan absensi + komponen
- **Validasi Absensi**: Tombol "Periksa Sekarang" untuk validasi data absensi sebelum proses
- **Komponen Gaji**: Gaji pokok, lembur, tunjangan, potongan
- **Cetak Slip**: Generate slip gaji individual atau massal`,
      },
    ],
  },
  {
    id: 'sdm',
    icon: Users,
    title: 'Portal SDM',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    subsections: [
      {
        title: 'Data Karyawan',
        content: `**Menu**: Karyawan > Data Karyawan
- **Master Karyawan**: NIK, nama, jabatan, departemen, shift, tanggal bergabung
- **Tambah/Edit/Nonaktifkan**: CRUD karyawan
- **Filter**: Per departemen, shift, status aktif`,
      },
      {
        title: 'Absensi',
        content: `**Menu**: Karyawan > Absensi
- **Rekap Absensi**: Lihat per tanggal atau per karyawan
- **Input Manual**: Untuk koreksi atau karyawan tanpa mesin absen
- **Export Excel**: Export data absensi untuk payroll`,
      },
      {
        title: 'Laporan HR',
        content: `**Menu**: SDM > Laporan HR & Analytics
- **Laporan Kehadiran**: Rekap hadir/alpha/terlambat per periode
- **Laporan Lembur**: Total jam lembur per karyawan
- **Laporan Payroll Summary**: Ringkasan penggajian per departemen
- **Turnover Analysis**: Analisis perputaran karyawan
- **Export Excel**: Semua laporan bisa di-export`,
      },
    ],
  },
  {
    id: 'scenarios',
    icon: Play,
    title: 'Test Scenarios & Use Cases',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    subsections: [
      {
        title: 'Skenario 1: Produksi Normal (WO → Selesai)',
        content: `**Deskripsi**: Buyer memesan 200 pcs sweater, produksi berjalan normal, semua lulus QC.

**Langkah**:
1. **[Manajemen]** Buat Order: Order → Buat Order → isi buyer, model "Sweater Klasik V-Neck", qty 200, size M, delivery 30 Jun
2. **[Produksi]** Generate WO: Buka order → klik "Generate WO" → WO otomatis dibuat (status: Draft)
3. **[Produksi]** Review & Release WO: Buka WO → cek BOM → klik "Release" → status jadi Released, material otomatis ter-reserve
4. **[Produksi]** Buat LKP: Di detail WO, klik "Buat LKP" → isi data instruksi → Generate PDF → bagikan ke operator
5. **[Produksi]** Assign Lini: Assign Lini Hari Ini → pilih tanggal → assign karyawan ke Line A
6. **[Produksi]** Issue Material: Bulk MI → pilih WO → konfirmasi issue → material keluar dari gudang
7. **[Produksi]** Update Progress: WO → isi qty_produced harian
8. **[QC]** Semua 200 pcs lulus QC → qty_passed_qc = 200
9. **[Produksi]** WO Complete: Ubah status WO → Completed
10. **[Shift]** Supervisor buat Shift Handover di akhir shift, checklist semua OK, download PDF

**Hasil yang Diharapkan**:
- ✅ WO status: Completed
- ✅ LKP PDF tersimpan & bisa di-cetak ulang
- ✅ Stok material berkurang sesuai BOM
- ✅ Shift Handover ter-sign off, PDF bisa didownload`,
      },
      {
        title: 'Skenario 2: Ada Defect — Tidak Lulus QC → Rework',
        content: `**Deskripsi**: 200 pcs diproduksi, 30 pcs cacat (jahitan lepas), harus rework.

**Langkah**:
1. **[Produksi]** WO sudah in_progress, qty_produced = 200
2. **[QC]** QC check: 170 lulus, 30 defect (kode: jaitan-lepas)
3. **[Produksi]** Buka WO → Update: qty_passed_qc = 170, qty_rework = 30
4. **[Produksi]** Papan Rework → klik "Tambah Rework" → isi WO, qty, jenis defect, assign ke operator rework
5. **[LKP]** Upload Foto Defect: Buka LKP → tombol "Upload Foto" → pilih foto jahitan lepas → caption "Defect: jahitan lepas area bahu" → tipe "defect_evidence"
6. **[Produksi]** Rework selesai: 28 pcs berhasil rework, 2 pcs reject total
7. **[Produksi]** Update WO: qty_passed_qc = 198, qty_reject = 2
8. **[Shift Handover]** Supervisor catat di Shift Handover: issues → tipe "kualitas", deskripsi "30 pcs defect jahitan lepas area bahu, sudah rework 28", priority "medium"
9. **[LKP PDF]** Download LKP PDF → Section L (Foto Produksi & QC) menampilkan foto defect

**Hasil yang Diharapkan**:
- ✅ Papan Rework terdokumentasi
- ✅ Foto defect muncul di LKP PDF Section L
- ✅ Shift handover mencatat masalah kualitas
- ✅ Net output: 198 pcs (bukan 200)`,
      },
      {
        title: 'Skenario 3: Material Kurang — Produksi Tertunda',
        content: `**Deskripsi**: Saat WO di-release, stok benang tidak cukup untuk full qty.

**Langkah**:
1. **[Produksi]** Release WO → sistem auto-reserve material
2. **[Sistem]** Response API menampilkan "material_reservation.warnings: ['Stok YRN-W-002 tidak cukup: butuh 45kg, tersedia 30kg']"
3. **[Gudang]** Cek Low Stock: Inventori > Benang → badge merah pada YRN-W-002 (di bawah minimum)
4. **[Gudang]** Buat PO: Purchase Order → buat PO ke supplier untuk YRN-W-002 qty 100kg
5. **[Shift Handover]** Supervisor shift catat: issues → tipe "material", deskripsi "Kekurangan benang YRN-W-002 untuk WO-2026-0003, PO sudah dibuat", priority "high"
6. **[Gudang]** Barang datang: Receiving → konfirmasi terima 100kg → stok bertambah
7. **[Produksi]** WO bisa dilanjutkan: Bulk MI → issue material → produksi berjalan

**Hasil yang Diharapkan**:
- ✅ Warning muncul saat release WO
- ✅ Low stock badge terlihat di modul material
- ✅ PO terdokumentasi
- ✅ Shift handover mencatat masalah material`,
      },
      {
        title: 'Skenario 4: Mesin Breakdown — OEE Turun',
        content: `**Deskripsi**: Mesin Rajut M-001 breakdown 3 jam di Line A, OEE hari ini turun.

**Langkah**:
1. **[Produksi]** Operator laporkan ke supervisor: Mesin M-001 mati jam 09:00
2. **[Shift Handover]** Supervisor buat Shift Handover (bisa di-buat di tengah shift jika darurat):
   - Checklist: "Ada downtime mesin?" → centang ✓ → notes "Mesin M-001 breakdown jam 09:00"
   - Issues: tipe "mesin", deskripsi "Mesin Rajut M-001 error kode E-03 bearing rusak", priority "high"
   - Pending tasks: "Hubungi teknisi eksternal untuk M-001", assigned_to "Pak Irwan (Teknisi)"
3. **[OEE]** OEE Dashboard → lihat hari ini → Line A OEE turun → klik expand Line A → downtime events terlihat
4. **[Produksi]** Mesin diperbaiki jam 12:00 (downtime 3 jam dari total 8 jam = Availability 62.5%)
5. **[Shift Handover Sign-Off]** Supervisor shift sore sign off handover: notes "M-001 sudah diperbaiki jam 12:00, produksi normal kembali"
6. **[Download PDF]** Download End-of-Shift PDF → semua kejadian terdokumentasi

**Hasil yang Diharapkan**:
- ✅ OEE Line A turun (availability < 100%)
- ✅ Downtime terdokumentasi di shift handover & OEE dashboard
- ✅ Sign-off dengan catatan perbaikan
- ✅ PDF report lengkap`,
      },
      {
        title: 'Skenario 5: Shift Malam — Serah Terima Lengkap',
        content: `**Deskripsi**: Shift 1 (07:00-15:00) selesai, serah terima ke Shift 2 (15:00-23:00).

**Langkah**:
1. **[Shift 1 Supervisor]** Jam 14:45, buat Shift Handover:
   - Pilih Shift: Shift 1 (07:00-15:00), tanggal hari ini
   - Catatan Umum: "Produksi Line A 180 dari target 200 pcs. Line B normal. Sisa 20 pcs dilanjutkan shift 2"
   - Checklist: Isi semua 5 item sesuai kondisi aktual
   - Issues: 1 masalah kualitas (5 pcs defect warna tidak rata) — priority low
   - Pending Tasks: "Selesaikan sisa 20 pcs WO-2026-0001 di Line A" → assigned "Supervisor Shift 2"
2. **[Shift 2 Supervisor]** Lihat handover di tab "Hari Ini"
3. **[Shift 2 Supervisor]** Klik "Sign Off" → isi notes "Diterima, sisa WO dipahami, siap dilanjutkan" → Konfirmasi Sign Off
4. **[Keduanya]** Download PDF → arsip dokumen serah terima

**Hasil yang Diharapkan**:
- ✅ Handover terdaftar dengan status "Signed Off"
- ✅ Badge "Signed Off" hijau muncul di kartu
- ✅ PDF berisi semua informasi + blok tanda tangan kedua supervisor`,
      },
      {
        title: 'Skenario 6: Hari Libur — Produksi Tidak Jalan',
        content: `**Deskripsi**: 1 Mei (Hari Buruh) — pabrik libur. APS perlu tahu ini.

**Langkah**:
1. **[Produksi/Admin]** Kalender Produksi → klik "Seed Libur Nasional 2026" → 20 hari libur otomatis masuk
2. **[Produksi]** APS Gantt → navigasi ke bulan Mei → kolom tanggal 1 Mei berwarna merah dengan tooltip "Hari Buruh Internasional"
3. **[PPIC]** APS Auto-Schedule → sistem tidak menempatkan WO di tanggal merah
4. **[Kalkulator]** Kalender Produksi → Kalkulator Hari Kerja → from: 2026-05-01, to: 2026-05-31 → hasil: 20 hari kerja (dari 31 hari kalender, minus 4 Minggu, minus 2 hari libur Mei)
5. **[Produksi]** Jika ada WO yang due date 1 Mei → APS otomatis reschedule ke 30 April atau 4 Mei

**Hasil yang Diharapkan**:
- ✅ Hari libur merah di APS Gantt
- ✅ Auto-schedule skip hari libur
- ✅ Kalkulator hari kerja akurat`,
      },
      {
        title: 'Skenario 7: New Buyer — Full Flow',
        content: `**Deskripsi**: Buyer baru dari Korea memesan 500 pcs cardigan, belum pernah diproduksi sebelumnya.

**Langkah**:
1. **[Manajemen]** Tambah Customer: Buat profil buyer baru K-Fashion Ltd
2. **[Manajemen]** Tambah Model: Model baru "Cardigan Korea 2026" — isi spesifikasi, upload foto desain
3. **[Produksi]** Buat BOM: Untuk model baru, input kebutuhan material (benang, aksesoris)
4. **[Produksi]** Buat SOP: Untuk setiap proses, input langkah kerja + SAM + target pcs
5. **[Manajemen]** Buat Order: Order dari K-Fashion Ltd, 500 pcs Cardigan Korea, delivery 15 Juli
6. **[PPIC]** APS Auto-Schedule: Masuk APS → auto-schedule → sistem bagi ke beberapa lini
7. **[Produksi]** Generate WO dari Order → 3 WO (Line A: 200, Line B: 150, Line C: 150)
8. **[Gudang]** Cek Material: Stok benang cukup? Jika tidak, buat PO dulu
9. **[Produksi]** Release WO satu per satu → material ter-reserve → produksi mulai
10. **[Produksi]** Buat LKP per WO → upload foto sample yang sudah diapprove buyer
11. Lanjutkan ke Skenario 1 (produksi normal)

**Hasil yang Diharapkan**:
- ✅ Master data model & SOP tersedia sebelum produksi
- ✅ APS bisa schedule semua 3 WO sekaligus
- ✅ LKP berisi foto sample buyer`,
      },
      {
        title: 'Skenario 8: Lembur & Payroll Akhir Bulan',
        content: `**Deskripsi**: Ada lembur di akhir bulan, payroll harus akurat.

**Langkah**:
1. **[SDM]** Input absensi lembur: SDM > Absensi → input jam lembur per karyawan
2. **[SDM]** Export data absensi untuk review
3. **[Keuangan]** Validasi Payroll: Keuangan > Payroll Run → tombol "Periksa Sekarang" → sistem cek anomali absensi
4. **[Keuangan]** Jika ada anomali (misal: lembur > 3 jam tanpa approval) → warning muncul → selesaikan dulu
5. **[Keuangan]** Proses Payroll: Konfirmasi → sistem hitung gaji pokok + lembur + tunjangan - potongan
6. **[Keuangan]** Cetak Slip: Generate slip gaji semua karyawan
7. **[HR]** Laporan HR: SDM > Laporan HR → Laporan Lembur → export Excel → kirim ke manajemen

**Hasil yang Diharapkan**:
- ✅ Lembur terhitung otomatis
- ✅ Warning anomali absensi terdeteksi sebelum payroll
- ✅ Slip gaji akurat
- ✅ Laporan lembur ter-export`,
      },
    ],
  },
  {
    id: 'tips',
    icon: Shield,
    title: 'Tips, FAQ & Troubleshooting',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    content: `
## Tips Penggunaan Sehari-hari

### Produksi
- **Selalu release WO sebelum issue material** — sistem otomatis reserve material saat release
- **Upload foto ke LKP segera setelah QC** — foto muncul di PDF yang didownload berikutnya
- **Buat Shift Handover di akhir setiap shift** — bukan hanya saat ada masalah

### Gudang
- **Pantau Low Stock indicator** setiap pagi — material dengan badge merah perlu reorder segera
- **Konfirmasi PO tepat waktu** agar stok selalu update

### Keuangan
- **Validasi absensi sebelum run payroll** — lebih mudah koreksi sebelum proses
- **Buat jurnal entri setiap hari** — jangan tumpuk sampai akhir bulan

## FAQ

**Q: LKP saya tidak ada foto walaupun sudah upload?**
A: Pastikan upload selesai (ada notifikasi sukses). Download PDF ulang — sistem selalu ambil foto terbaru saat generate PDF.

**Q: Stok material berkurang sendiri?**
A: Normal — terjadi saat WO di-release (auto-reserve) atau Bulk Material Issue dikonfirmasi.

**Q: APS tidak mau schedule WO ke tanggal tertentu?**
A: Periksa apakah tanggal tersebut adalah hari libur di Kalender Produksi.

**Q: OEE Dashboard kosong / tidak ada data?**
A: OEE membutuhkan data event produksi (output WIP) dan downtime dari mesin. Pastikan tracking produksi aktif.

**Q: Shift Handover tidak bisa di-sign off?**
A: Pastikan user yang login berbeda dari yang membuat handover (supervisor shift berbeda). Atau bisa sign off dengan user yang sama jika diperlukan.

**Q: Saldo budget LLM habis?**
A: Pergi ke Profile → Universal Key → Add Balance, atau aktifkan Auto Top-Up.

## Shortcut Keyboard
- **Ctrl + K** atau klik ikon pencarian: Quick search semua menu
- **Esc**: Tutup modal/dialog
    `,
  },
];

/* ─── COMPONENTS ────────────────────────────────────────────────── */

function MarkdownRenderer({ content }) {
  const lines = content.trim().split('\n');
  const elements = [];
  let i = 0;
  let tableRows = [];
  let inTable = false;

  const flushTable = () => {
    if (tableRows.length < 2) { tableRows = []; return; }
    const headers = tableRows[0].split('|').map(h => h.trim()).filter(Boolean);
    const body = tableRows.slice(2).map(r => r.split('|').map(c => c.trim()).filter(Boolean));
    elements.push(
      <div key={`table-${i}`} className="overflow-x-auto my-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>{headers.map((h, j) => (
              <th key={j} className="px-3 py-2 text-left text-xs font-semibold bg-[var(--card-surface)] border border-[var(--glass-border)] text-foreground/70"
                dangerouslySetInnerHTML={{ __html: h.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}</tr>
          </thead>
          <tbody>{body.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-foreground/[0.02]'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-1.5 border border-[var(--glass-border)] text-xs text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              ))}
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
    tableRows = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('|')) {
      inTable = true;
      tableRows.push(line);
      i++;
      continue;
    }
    if (inTable) {
      inTable = false;
      flushTable();
    }

    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="text-sm font-bold text-foreground mt-4 mb-2 pb-1 border-b border-[var(--glass-border)]">{line.slice(3)}</h3>);
    } else if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-xs font-semibold text-foreground/80 mt-3 mb-1">{line.slice(4)}</h4>);
    } else if (line.startsWith('- **') || line.startsWith('- ')) {
      const txt = line.slice(2);
      elements.push(
        <li key={i} className="text-xs text-foreground/75 leading-relaxed ml-3 list-disc"
          dangerouslySetInnerHTML={{ __html: txt.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
      );
    } else if (line.match(/^\d+\. /)) {
      const txt = line.replace(/^\d+\. /, '');
      elements.push(
        <li key={i} className="text-xs text-foreground/75 leading-relaxed ml-3 list-decimal"
          dangerouslySetInnerHTML={{ __html: txt.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
      );
    } else if (line.startsWith('**Q:')) {
      elements.push(<p key={i} className="text-xs font-bold text-[hsl(var(--primary))] mt-3">{line.replace(/\*\*/g, '')}</p>);
    } else if (line.startsWith('A:')) {
      elements.push(<p key={i} className="text-xs text-foreground/70 ml-3 mb-2">{line.slice(2).trim()}</p>);
    } else if (line.startsWith('- ✅') || line.startsWith('- ⚠️')) {
      elements.push(<p key={i} className="text-xs text-foreground/75 leading-relaxed ml-3">{line.slice(2)}</p>);
    } else if (line.trim()) {
      elements.push(
        <p key={i} className="text-xs text-foreground/75 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-foreground/10 font-mono text-[10px]">$1</code>') }} />
      );
    } else {
      elements.push(<div key={i} className="h-1.5" />);
    }
    i++;
  }
  if (inTable) flushTable();
  return <div className="space-y-0.5">{elements}</div>;
}

function SubsectionAccordion({ subsection }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[var(--glass-border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--glass-bg-hover)] text-left transition-colors"
        data-testid={`subsection-${subsection.title.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}
      >
        <span className="text-sm font-medium text-foreground">{subsection.title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-foreground/40 shrink-0" /> : <ChevronRight className="w-4 h-4 text-foreground/40 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--glass-border)] bg-foreground/[0.01]">
          <MarkdownRenderer content={subsection.content} />
        </div>
      )}
    </div>
  );
}

function SectionCard({ section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  return (
    <div className={`border rounded-2xl overflow-hidden ${section.bg}`} data-testid={`guide-section-${section.id}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-foreground/5 text-left transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl bg-foreground/10 grid place-items-center shrink-0 ${section.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${section.color}`}>{section.title}</p>
          {section.subsections && (
            <p className="text-xs text-foreground/40 mt-0.5">{section.subsections.length} sub-topik</p>
          )}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-foreground/40 shrink-0" /> : <ChevronRight className="w-4 h-4 text-foreground/40 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[var(--glass-border)] pt-4 space-y-3">
          {section.content && <MarkdownRenderer content={section.content} />}
          {section.subsections?.map(sub => (
            <SubsectionAccordion key={sub.title} subsection={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RahazaUserGuideModule({ token }) {
  const [search, setSearch] = useState('');
  const [activeScenario, setActiveScenario] = useState(null);

  // Filter sections based on search
  const filtered = SECTIONS.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (s.title.toLowerCase().includes(q)) return true;
    if (s.content?.toLowerCase().includes(q)) return true;
    if (s.subsections?.some(sub => sub.title.toLowerCase().includes(q) || sub.content.toLowerCase().includes(q))) return true;
    return false;
  });

  const scenarios = SECTIONS.find(s => s.id === 'scenarios')?.subsections || [];

  return (
    <div className="space-y-5" data-testid="user-guide-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Panduan Penggunaan ERP</h2>
          <p className="text-sm text-foreground/50 mt-0.5">Manual lengkap semua menu, fitur, dan skenario penggunaan PT Rahaza ERP</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-foreground/40 bg-[var(--glass-bg)] border border-[var(--glass-border)] px-3 py-1.5 rounded-xl">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Versi 2.5 · April 2026</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari panduan, menu, atau skenario..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--glass-border)] bg-[var(--input-surface)] text-sm text-foreground"
          data-testid="guide-search"
        />
      </div>

      {/* Quick Scenarios */}
      <div>
        <h3 className="text-xs font-semibold text-foreground/50 uppercase mb-2">Test Scenarios Cepat</h3>
        <div className="flex gap-2 flex-wrap">
          {scenarios.map((s, i) => (
            <button key={i}
              onClick={() => setActiveScenario(activeScenario === i ? null : i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${activeScenario === i ? 'bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]' : 'border-[var(--glass-border)] text-foreground/60 hover:bg-[var(--glass-bg-hover)]'}`}
              data-testid={`scenario-btn-${i}`}
            >
              <span className="mr-1 opacity-60">S{i + 1}:</span>
              {s.title.replace('Skenario ' + (i + 1) + ': ', '').slice(0, 35)}
            </button>
          ))}
        </div>
        {activeScenario !== null && (
          <div className="mt-3 p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Play className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-cyan-300">{scenarios[activeScenario].title}</h4>
            </div>
            <MarkdownRenderer content={scenarios[activeScenario].content} />
          </div>
        )}
      </div>

      {/* All Sections */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-foreground/40">
            <HelpCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Tidak ada hasil untuk "{search}"</p>
          </div>
        ) : filtered.map(section => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
