# PT Rahaza ERP — PRD (Product Requirements Document)

## Original Problem Statement
Continue development from `https://github.com/pandekomangyogaswastika-dot/garmentrahaza11`.
Repo dicopy lengkap, dokumen dibaca; latest feature request:
> "Lembar kerja untuk operator, dimana saat membuat produksi sebelum memulai bisa
> cetak surat kerja lengkap dimana didalamnya terdapat penjelasan yang lengkap hingga
> SOP. Otomatis terbuat dalam bentuk PDF. Goal: produksi mendapat guide perintah yang jelas."

## Architecture
- **Stack:** React (CRACO + Tailwind + Shadcn) + FastAPI (Motor async MongoDB) + MongoDB
- **5 Portal:** Manajemen, Produksi, Gudang, Keuangan, SDM
- **Auth:** JWT (24h), bcrypt
- **Storage:** Emergent Object Storage (PDF + foto produk)
- **PDF:** reportlab (Python)

## User Personas
1. **Operator Lantai** — penerima utama LKP (Lembar Kerja Produksi). Butuh visual guide + SOP step-by-step.
2. **Supervisor / Line Leader** — review LKP, tanda tangan release.
3. **PPIC / Planner** — buat LKP, tentukan assignment.
4. **QC Inspector** — pakai checkpoint LKP saat inspeksi.
5. **Manager Produksi** — audit trail siapa cetak, kapan, versi berapa.
6. **Admin / Superadmin** — kelola master Model + foto produk.

## Core Requirements (Static)
- LKP harus auto-generated PDF dengan section lengkap (A–L)
- Versioning per WO (v1, v2, v3...)
- Audit trail (created, downloaded, regenerated, revoked) lengkap dengan user + timestamp
- Foto produk per model (max 3, max 5MB)
- SOP per proses diketik manual saat buat LKP (bukan dari master)
- Bahasa Indonesia, A4 portrait, multi-page
- BOM auto-resolve dari WO snapshot atau master BOM (handle 2 format: legacy + unified)
- QR code di header LKP untuk traceability

## What's Been Implemented

### 2026-04-28 — LKP Feature (Lembar Kerja Produksi)
**Backend:**
- `routes/rahaza_lkp.py` — full CRUD: GET list per-WO, POST create + auto-PDF, GET detail + audit,
  GET pdf (header & ?auth= query), POST regenerate, GET cross-WO list, DELETE soft-delete
- `utils/lkp_pdf.py` — reportlab generator dengan sections A–L (header, order, product+foto, BOM, assignment,
  flow, SOP, QC, packing, signature, notes, footer). QR code di header.
- `routes/rahaza_production.py` — POST/DELETE `/models/{mid}/images` untuk upload foto (max 3, max 5MB)
- Versioning auto-increment per WO. Audit log array di setiap LKP doc.

**Frontend:**
- `RahazaModelsModule.jsx` — kustom dengan kolom Foto (thumbnail + X/3 badge) dan modal Kelola Foto
- `LKPDialog.jsx` — wizard 5-step: Tech Pack → SOP per Proses → QC → Packing → Notes & Submit
- `RahazaWorkOrdersModule.jsx` — section LKP di detail WO: list versions, preview/download/regenerate/audit

**Testing:**
- 26/26 backend pytest tests pass (iter_2)
- Frontend 95% verified (iter_4) — 2 critical bugs found & fixed

### 2026-04-28 — Phase 1 Critical Fixes + Sprint 22 (Supervisor Power Tools)

**Phase 1 P0 Fixes:**
- `/api/health` endpoint dengan DB ping + latency
- `/api/metrics` endpoint (collection counts)
- `/api/docs` OpenAPI Swagger (docs_url)
- Global error handler (HTTP 422, 500 tidak bocorkan stack trace)
- Tiered rate limiting: 10/min untuk auth login, 20/min untuk AI, 300/min umum
- Request timing/logging middleware (log slow req >2s + error 5xx)
- Pagination: employees (limit/skip), work-orders (limit/skip), material-issues (limit/skip), payroll-runs (limit/skip), orders (limit/skip)
- New DB indexes: attendance, payslips, materials, material-stock (Sprint 3.4)

**Sprint 22 — Supervisor Power Tools:**
1. **Bulk MI Generator** (`/api/rahaza/supervisor/bulk-mi/preview` + `/generate`)
   - Preview ketersediaan stok per WO sebelum generate
   - Batch generate MI untuk 1-50 WO sekaligus
   - Skip protection: WO yang sudah punya MI di-skip otomatis
   - Option `skip_shortage` untuk tetap generate walau stok kurang
   - Frontend: `RahazaBulkMIModule.jsx` di Produksi > Eksekusi

2. **Auto-assign Template** (Copy Yesterday's Line Assignment)
   - `GET /api/rahaza/supervisor/assignments/yesterday` — template kemarin
   - `POST /api/rahaza/supervisor/assignments/bulk` — bulk create 1-200 assignments
   - Option `overwrite=true` untuk timpa assignment yang sudah ada
   - Frontend: Banner di `RahazaLineAssignmentsModule.jsx` — "Cek Template Kemarin" → preview → terapkan

3. **Line Balancing Dashboard** (`/api/rahaza/supervisor/line-balance`)
   - SAM-based capacity estimation per lini
   - Balance ratio (target / kapasitas SAM)
   - Imbalance detection: overloaded (>110%) + underutilized (<70%)
   - Factory-wide balance summary
   - Expandable operator list per lini
   - Frontend: `RahazaLineBalancingModule.jsx` di Produksi > Monitoring

**RBAC Fix:**
- `PortalSelector.jsx`: `staff_produksi`, `manager_produksi` → Portal Produksi + Portal Gudang
- `staff_gudang` → Portal Gudang, `staff_keuangan` → Portal Keuangan, `staff_hr` → Portal SDM
- `manager_produksi` → Portal Manajemen

**Repo migration:** Copied from `garmentrahaza13` (latest), installed all dependencies, seeded demo data.

**Sprint 3.1 — HR Reports Frontend (RahazaHRReportsModule.jsx):**
- 4 tabs: Kehadiran, Overtime, Payroll Summary, Turnover
- Recharts (LineChart/BarChart/PieChart) untuk tiap tab
- Excel export per tab via xlsx backend endpoint
- Filter: date range, location, shift, employee, payroll period
- Backend endpoints wired: `attendance-summary`, `overtime-summary`, `payroll-summary`, `turnover`

**Sprint 3.3 — Payroll Attendance Validation:**
- `CreateRunModal` (Payroll Run) sekarang punya panel validasi attendance
- Tombol "Periksa Sekarang" → `GET /api/rahaza/hr/reports/attendance-validation`
- Warning per karyawan (high/medium severity) dengan detail pesan
- Payroll tetap bisa dijalankan meskipun ada warning (warning-based only)

**Sprint 3.4 — Low Stock Indicators (Configurable Threshold):**
- `RahazaMaterialsModule.jsx`: field `min_stock_qty` (fixed qty) dan `min_stock_percentage` (% dari max hist)
- Low stock banner di materials list (badge AlertTriangle)
- Filter "Low Stock" aktif: `GET /api/rahaza/materials?low_stock=true`
- Search materials: `GET /api/rahaza/materials?search=YRN`
- Backend `/materials` create+update menyimpan `min_stock_qty` + `min_stock_percentage`

**Bug Fixes:**
- `_require_hr_admin` sekarang allow `staff_hr` + `manager_produksi` role
- `RahazaHRReportsModule` fix: `/api/rahaza/departments` (404) → `/api/rahaza/locations`
- `RahazaHRReportsModule` fix: `/api/rahaza/payroll/runs` (404) → `/api/rahaza/payroll-runs`
- Test users seeded: hr@garment.com, finance@garment.com, gudang@garment.com, manager.produksi@garment.com, supervisor@garment.com

## Pre-existing Status (per plan.md)
- ✅ Phase 21 (Decision Support: Defect Codes, Pareto, FPY, Backlog, Forecast, Downtime)
- ✅ Phase 20C (AI Layer: chat, daily summary, root cause, predictive delay, smart search)
- ✅ Portal Saya (Self Service: Attendance + Payslip)
- ✅ Phase 4B (Refactor flow: Rajut → Linking → Sewing → Steam → QC → Packing + REWORK)
- ✅ Phase 4C P1 (QC ↔ WIP integration, WO auto-complete)
- ✅ Phase 22A start (Material Reservation, Shift Handover routers exist)

## Backlog (P0 / P1 / P2 — sesuai roadmap docs)

### P0 — Quick win
- [ ] LKP foto otomatis muncul di PDF saat di-regenerate (sudah tersedia, tinggal verify)
- [ ] Add "Cetak LKP semua WO released hari ini" bulk action

### P1 — Phase 22 Supervisor & PPIC Power Tools
- [ ] Bulk Material Issue Generator
- [ ] Auto-assign Template ("pakai assignment kemarin")
- [ ] Line Balancing dengan SAM (Standard Allowed Minute)
- [ ] Material Reservation auto-block saat WO release (router ada, perlu integrasi)
- [ ] Production Calendar (libur nasional, exception day)
- [ ] Shift Handover Checklist (router ada, perlu UI)

### P2 — Phase 23 Mobility / PWA
- [ ] PWA install (manifest + service worker)
- [ ] End-of-Shift Auto Report PDF (mirip LKP tapi outbound)
- [ ] WhatsApp Bot read-only

### P2 — Phase 24 Buyer Compliance
- [ ] Style Master 2.0 (tech pack PDF attachment, size chart structured)
- [ ] BOM Versioning + costing snapshot link
- [ ] AQL Sampling Tool (MIL-STD-105E auto)
- [ ] Carton & Pack List (sudah ada shipment, perlu carton structure)

### P2 — Phase F4 Advanced Finance
- [ ] Cash Flow Indirect Method (PSAK)
- [ ] Tax Module (PPN multi-rate, PPh 21/22/23, SPT cetak)
- [ ] Multi-currency basic (USD/SGD)
- [ ] Budgeting & Variance Analysis

### P3 — UI Polish
- [ ] Replace native `<select>` dengan Shadcn `Select`/`Combobox` (10+ modul)
- [ ] Inline `?` tooltip per field penting
- [ ] Smart default filter di WO/Order list
- [ ] Accessibility audit + ARIA labels

## Known Limitations
- WIP events belum simpan `employee_id`/`shift_id` native — Pareto by employee/shift hanya akurat dari rahaza_qc_events
- Foto LKP hanya muncul saat LKP create/regenerate — kalau model image diupdate setelah LKP created, perlu manual regenerate
- LKP PDF tidak auto-revalidate saat WO data berubah (intentional: snapshot at create time, regenerate untuk refresh)

## Next Tasks
1. Sprint 23 (Mobility/PWA) — PWA manifest, service worker, offline support  
2. E2E test payroll run full cycle dengan data attendance real
3. SAM data sudah bisa diisi di SOP — minta tim isi SAM per proses agar Line Balancing akurat
4. Phase 2 Stabilization: comprehensive pytest suite coverage (saat ini 88% pada sprint tests)
5. Seed SOP data untuk enable SOP SAM testing lengkap
