# plan.md — PT Rahaza ERP

**Status:** Phase 21 + Phase 20C + Portal Saya **COMPLETED**; Flow Produksi Refactor **COMPLETED**; P1 **COMPLETED**; LKP Security Hardening **COMPLETED**; Sprint 1 (Inv/Warehouse/HR) **COMPLETED**; Sprint 2 (Core Ops: PO↔GR, MI Approval, Leave, Opname→GL) **COMPLETED ✅**; **Sprint 3 (HR Reports + Standardisasi Inventory UI/Endpoint + Payroll Validation + Low Stock) — IN PROGRESS ⏳**

## Objectives

- **Status terkini (sudah tervalidasi):**
  - ✅ **Phase 21 (Decision Support & Quality Metrics)** selesai (Defect Codes, Pareto, FPY, Backlog/Forecast, Downtime).
  - ✅ **Phase 20C (AI Layer)** selesai (AI Chatbot, Daily Summary, Root Cause, Smart Search, audit logs).
  - ✅ **Portal Saya (Staff Self‑Service)** selesai (Attendance & Payslip personal + linking user→employee).
  - ✅ **Phase 4B (P0) Refactor Flow Produksi + Simplifikasi Rework** selesai.
  - ✅ **Phase 4C (P1) QC↔WIP Integration + WO Auto‑Completion** selesai.
  - ✅ **LKP Feature Security & Quality Hardening (Audit Patch)** selesai:
    - H1 blob preview (no token-in-URL for PDF preview)
    - H2 RBAC on LKP write endpoints
    - H3 JWT_SECRET no hardcoded fallback
    - H4 atomic counters for LKP numbering/version
    - H5 PDF Paragraph escaping (prevent HTML injection)
    - plus MEDIUM fixes (indexes, magic-bytes validation, storage cleanup, dll.)

- ✅ **Sprint 1 (Inventory/Warehouse/HR) — Data integrity + usability** selesai:
  1) ✅ **Fix dual-ledger (I-1 + W-1)**: GR di portal Gudang kini *sync* ke `rahaza_material_stock` via `material_id` per item.
     - Backend: `warehouse.py` menambah `material_id` pada item GR dan saat `status='received'` melakukan upsert ke `rahaza_material_stock` + log ke `rahaza_material_movements`.
     - Frontend: `ReceivingModule.jsx` menambah *material picker* dari master material.
     - Tambahan: nomor GR atomic counter (`GR-00001` dst) untuk menghindari race condition.
  2) ✅ **HR Dashboard nyata (HR-1)**: placeholder diganti dashboard KPI.
     - Backend: `GET /api/rahaza/hr/dashboard`.
     - Frontend: `HRDashboard.jsx`.
  3) ✅ **Expose Master Karyawan di Portal SDM (HR-2 + HR-10)**:
     - Nav Portal SDM menambahkan item `hr-employees`.
     - `moduleRegistry` memetakan `hr-employees` → `RahazaEmployeesModule`.

- ✅ **Sprint 2 (Fungsional Inti) — procurement→warehouse→inventory→finance→HR compliance** selesai dan sudah dites end-to-end:
  1) ✅ **W-2:** Purchase Order master + GR matching (starter 3-way match: PO→GR)
  2) ✅ **I-3:** Material Issue (MI) approval workflow: `draft → pending_approval → issued`
  3) ✅ **HR-3:** Modul Izin/Cuti (request, saldo, approval) + auto-fill attendance
  4) ✅ **W-3:** Post Opname adjustment ke GL (jurnal otomatis)
  5) ✅ **Wiring & Navigation**: route, menu portal, registry module
  6) ✅ **Regression/Comprehensive Testing** (agent):
     - Backend: **96%** (51/53), 2 hasil "expected behavior" (bukan bug kritikal)
     - Frontend: **100%** (smoke test semua modul Sprint 2 OK)

- **Info baru (hasil konfirmasi user) untuk Sprint 3:**
  - ✅ Sprint 3 scope **DISETUJUI semua**: 3.1 sampai 3.4.
  - **HR Reports (3.1):** format **kombinasi** table + charts, export **Excel + PDF**, filter by **department / location / shift**.
  - **Payroll Attendance Validation (3.3):** validasi sifatnya **warning** (bukan block). Cutoff payroll: gaji dibayarkan sesuai attendance bulan berjalan (periode payroll).
  - **Low Stock Indicators (3.4):** threshold **bisa dikonfigurasi** (angka tetap dan/atau basis persentase), fokus output **indicator saja** (tanpa auto reorder).

- **Progress Sprint 3 terbaru (session ini):**
  - ✅ **Sprint 3.1 Backend HR Reports sudah selesai**: Attendance Summary, Overtime Summary, Payroll Summary, Turnover + export Excel.
  - ✅ Dependency Excel export: **openpyxl** sudah diinstall.
  - ⏳ Sprint 3.1 Frontend + Sprint 3.2-3.5 **belum dikerjakan** (akan dilanjutkan pada session berikutnya).

- **Catatan operasional (GitHub):**
  - User melaporkan **tidak bisa push ke GitHub**.
  - Temuan awal di environment: **`git remote` belum terkonfigurasi** (tidak ada `origin`).
  - Tindakan berikutnya: set `origin`, commit, push (lihat langkah pada section Sprint 3.0).

- **Prinsip:** perubahan **additive/non-breaking**, aman secara akses (RBAC), menjaga kompatibilitas seed/demo, dan menjaga single-source-of-truth data stock.

---

## Phase 1 — Core POC (AI Integration) (must pass before app dev)
> **STATUS: COMPLETED (superseded by full AI v1 implementation).**

### User Stories
1. Sebagai admin, saya ingin memanggil endpoint AI dan mendapatkan respons valid untuk memastikan koneksi LLM stabil.
2. Sebagai supervisor, saya ingin meminta ringkasan produksi harian dan mendapat output Bahasa Indonesia yang ringkas.
3. Sebagai manager, saya ingin menanyakan “kenapa QC fail tinggi?” dan mendapat jawaban berbasis data.
4. Sebagai user, saya ingin sistem menolak jika EMERGENT_LLM_KEY tidak ada dengan error yang jelas.

### Implementation Steps
- Integrasi LLM via **Emergent LLM Key** berhasil diterapkan.
- Model default dipakai: **claude-sonnet-4-5** (Anthropic) via `emergentintegrations`.

### Next Actions
- Tidak ada (Phase ini selesai). Lanjut ke hardening/iterasi jika diperlukan.

### Success Criteria
- Endpoint AI bekerja; fallback tersedia; error 503 saat key kosong.

---

## Phase 2 — V1 App Development (Phase 21 + Portal Saya + AI v1)
> **STATUS: COMPLETED**

### User Stories
1. Sebagai QC inspector, saya ingin memilih **kode cacat** dari dropdown agar input QC konsisten.
2. Sebagai QC head, saya ingin melihat **Pareto defect** top-10 dan filter per lini.
3. Sebagai manager produksi, saya ingin melihat **FPY** per line/model/operator/shift.
4. Sebagai maintenance/supervisor, saya ingin mencatat **downtime mesin** dengan reason + durasi.
5. Sebagai PPIC/supervisor, saya ingin melihat **WO backlog** dengan risk color + forecast completion untuk eskalasi cepat.
6. Sebagai karyawan, saya ingin melihat **absensi saya** tanpa melihat data orang lain.
7. Sebagai karyawan, saya ingin melihat **payslip saya** tanpa akses slip karyawan lain.
8. Sebagai admin/HR, saya ingin menghubungkan **user → employee** agar Portal Saya personal.
9. Sebagai supervisor, saya ingin akses **AI Daily Summary** dan AI tools lain untuk insight cepat.

### Implementation Steps

**2A — Phase 21A (Defect Codes + QC v2)** — **DONE**
- Backend:
  - New collection `rahaza_defect_codes` (CRUD + active flag + category + severity).
  - Seed 20 kode default: `POST /api/rahaza/defect-codes/seed`.
  - QC v2: `POST /api/rahaza/qc-events` menyimpan `defect_code_ids[]` dan `defect_details[]`.
- Frontend:
  - Module **Master Kode Cacat**: `RahazaDefectCodesModule.jsx`.

**2B — Phase 21B/21C (Pareto + FPY)** — **DONE**
- Backend:
  - `GET /api/rahaza/qc/pareto?from=&to=&line_id=&employee_id=&model_id=&shift_id=`
  - `GET /api/rahaza/qc/fpy?from=&to=&group_by=`
  - `GET /api/rahaza/qc/summary?from=&to=`
- Frontend:
  - Pareto dashboard: `RahazaParetoModule.jsx`.
  - FPY dashboard: `RahazaFPYModule.jsx`.

**2C — Phase 21D (Machine Downtime)** — **DONE**
- Backend:
  - `rahaza_machine_downtime` collection + endpoints:
    - `GET/POST /api/rahaza/downtime`
    - `PUT /api/rahaza/downtime/{id}`
    - `GET /api/rahaza/downtime/summary`
    - `GET /api/rahaza/downtime/reason-codes`
- Frontend:
  - Module `RahazaDowntimeModule.jsx`.

**2D — Phase 21E (Backlog + Forecast)** — **DONE**
- Backend:
  - `GET /api/rahaza/backlog`
  - `POST /api/rahaza/backlog/escalate/{wo_id}`
- Frontend:
  - Module `RahazaBacklogModule.jsx`.

**2E — Portal Saya (Staff Self‑Service)** — **DONE**
- Data model:
  - `users.employee_id` (nullable) link ke `rahaza_employees`.
- Backend:
  - `GET /api/rahaza/self/profile`
  - `GET /api/rahaza/self/attendance?from=&to=`
  - `GET /api/rahaza/self/payslips`
  - `GET /api/rahaza/self/payslip/{id}`
  - `PUT /api/rahaza/self/admin/link-employee`
- Frontend:
  - Portal tile ke-6: **Portal Saya**.
  - `SelfServicePortal.jsx`: tab Kehadiran Saya + Payslip Saya.
  - `UserManagementModule.jsx`: link user→employee.

**2F — AI v1 in app (post-POC)** — **DONE**
- Backend: `backend/routes/rahaza_ai.py`.
- Frontend: `RahazaAIModule.jsx` + `AIChatbotWidget.jsx`.

### Next Actions
- Tidak ada untuk Phase 2 (sudah selesai).

### Success Criteria
- Semua modul Phase 21 tampil dan berjalan.
- Portal Saya aman (hanya data sendiri).
- AI endpoints merespons dan UI berfungsi.

---

## Phase 3 — Expand AI Features (20C.2–20C.5) + Hardening
> **STATUS: COMPLETED (delivered as part of Phase 2 implementation)**

### User Stories
1. Smart search untuk menemukan WO/order/karyawan.
2. Root-cause assistant yang menyebut data pendukung.
3. Prediksi delay WO.
4. Chatbot supervisor.
5. Audit trail request AI.

### Implementation Steps
- Smart Search implemented (keyword matching, aman; bisa di-upgrade).
- Root-cause implemented (agregasi metrik 7 hari + LLM narasi).
- Predictive delay implemented (baseline linear forecast + risk level).
- Chatbot implemented (floating UI + session history).
- Audit log implemented (`rahaza_ai_audit_logs`).

### Next Actions
- Upgrade Smart Search → intent parser + allowlist query builder (opsional).
- Guardrail: rate limit, max context size, caching ringkasan harian.

### Success Criteria
- AI features konsisten, grounded, tidak ada query injection.

---

## Phase 4 — Validation, Regression, Docs
> **STATUS: PARTIALLY DONE** (E2E validation dilakukan; seed/demo hardening masih bisa ditingkatkan)

### User Stories
1. Sebagai owner, saya ingin semua dashboard tetap cepat dan tidak error saat data besar.
2. Sebagai auditor internal, saya ingin perubahan punya audit trail.
3. Sebagai HR, Portal Saya mengurangi pertanyaan manual.
4. Sebagai QC head, metrik Pareto/FPY bisa di-export.
5. Sebagai admin, seed demo konsisten setelah penambahan koleksi.

### Implementation Steps
- E2E validation: sudah dilakukan untuk modul baru (Quality & Analytics, AI Insights, Portal Saya) + Flow Produksi + P1.
- Bug fixes applied (historical): setup wizard, Radix SelectItem empty-string.
- Tambahan hardening (selesai): **LKP Security Hardening**.
- Tambahan hardening (selesai): **Sprint 1 Inventory/Warehouse/HR**.
- ✅ Tambahan hardening/validasi (selesai): **Sprint 2 Core Ops + regression**.

### Success Criteria
- Semua automated tests pass; tidak ada permission leakage; seed/reset konsisten.

---

## Phase 4B — **P0 Hotfix/Refactor: Flow Produksi + Rework Simplification**
> **STATUS: COMPLETED ✅**

### (Isi sama seperti versi sebelumnya; tidak diubah)

---

## Phase 4C — **P1 Enhancements: QC↔WIP Integration + WO Auto-Completion**
> **STATUS: COMPLETED ✅**

### (Isi sama seperti versi sebelumnya; tidak diubah)

---

## Sprint LKP Audit Hardening (Security/Quality)
> **STATUS: COMPLETED ✅**

### Latar Belakang
Audit internal menemukan 41 finding pada fitur LKP (5 HIGH). Fokus patch: security (token handling, RBAC, injection) + data integrity (race condition) + performance basic (indexes).

### Delivered Fixes
- **H1** PDF preview: frontend gunakan `fetch + blob URL` (token tidak masuk query param).
- **H2** RBAC: endpoint write LKP dibatasi role/permission.
- **H3** JWT secret: tidak ada hardcoded fallback, fail-fast jika env tidak diset.
- **H4** Atomic counters untuk `lkp_number` + `version` per WO.
- **H5** Escape semua user input di ReportLab Paragraph.
- MEDIUM fixes: magic-bytes image validation, delete old PDF on regenerate, Mongo indexes, useMemo headers, extension whitelist, delete storage object on image delete.

### Validation
- `pytest backend/tests/test_rahaza_lkp.py` **26/26 passed**.
- Smoke test FE: login, create LKP, preview/download PDF.

---

## Sprint 1 — Inventory/Warehouse/HR (Data Integrity + Usability)
> **STATUS: COMPLETED ✅**

### Sprint 1.1 — Fix Dual Ledger Inventory vs Warehouse (I-1 + W-1)
- Backend `warehouse.py`:
  - `warehouse_receiving.items[]` menambahkan field `material_id` (optional).
  - Saat receipt berubah ke `status='received'`:
    - tetap update `warehouse_stock` (SKU-based)
    - **tambahan**: jika item punya `material_id`, upsert ke `rahaza_material_stock` dan insert `rahaza_material_movements` (`type='receive'`, reference GR)
  - `receipt_number` memakai atomic counter `db.counters` (`GR-00001` dst).
- Frontend `ReceivingModule.jsx`:
  - Material picker (load dari `/api/rahaza/materials`).
  - Jika `material_id` dipilih, otomatis mengisi sku/name/unit.

### Sprint 1.2 — HR Dashboard Real (Replace Placeholder) (HR-1)
- Backend: `GET /api/rahaza/hr/dashboard`.
- Frontend: `HRDashboard.jsx`.

### Sprint 1.3 — Expose Master Karyawan di Portal SDM (HR-2 + HR-10)
- Frontend:
  - PortalShell: tambah nav `hr-employees`.
  - moduleRegistry: map `hr-employees` → `RahazaEmployeesModule`.

### Sprint 1.4 — Regression Tests (Sprint 1)
- Backend smoke: GR received + material_id → `rahaza_material_stock` bertambah.
- UI smoke: HR dashboard load, HR employees load.

---

## Sprint 2 — Fungsional Inti (Procurement↔Warehouse↔Inventory↔Finance↔HR)
> **STATUS: COMPLETED ✅**

### (Isi sama seperti versi sebelumnya; tidak diubah)

---

## Sprint 3 — Reporting & Operational Guardrails (HR + Inventory)
> **STATUS: IN PROGRESS ⏳**

**Goal Sprint 3:**
- Memberikan visibilitas (reporting) untuk HR (attendance/overtime/payroll/turnover) dan guardrails untuk payroll.
- Menyelesaikan standardisasi endpoint inventory (aksesori) agar 1 sumber data (`rahaza_materials`).
- Menambah indikator low-stock configurable untuk kontrol persediaan.

### Sprint 3.0 — Git Hygiene  Push ke GitHub (BLOCKER: user)
**Status:** ⛔ Perlu diselesaikan sebelum rilis Sprint 3.

**Temuan:** `git remote` belum ada.

**Checklist fix push:**
1. Set identitas git:
   - `git config --global user.name "NAMA"`
   - `git config --global user.email "EMAIL"`
2. Tambah remote:
   - `git remote add origin https://github.com/<username>/garmentrahaza12.git`
3. Commit:
   - `git add .`
   - `git commit -m "Sprint 2 + Sprint 3.1 backend"`
4. Push:
   - `git push -u origin main`

**Jika auth error:** gunakan GitHub Personal Access Token (PAT):
- `git remote set-url origin https://<TOKEN>@github.com/<username>/garmentrahaza12.git`

---

### Sprint 3.1 — HR-4: HR Reports Module (Attendance, Overtime, Turnover, Payroll Summary)
**Scope (user confirmed):**
- Tampilan **kombinasi**: table + charts.
- Export: **Excel + PDF**.
- Filter: **department / location / shift** (+ period date range).

**Status:** ✅ Backend selesai, ⏳ Frontend belum.

#### Delivered (Backend) ✅
- Router baru: `/app/backend/routes/rahaza_hr_reports.py`
- Endpoints JSON:
  - `GET /api/rahaza/hr/reports/attendance-summary?from_date=&to_date=&department_id=&location_id=&shift_id=&employee_id=`
  - `GET /api/rahaza/hr/reports/overtime-summary?from_date=&to_date=&department_id=&location_id=&shift_id=&employee_id=`
  - `GET /api/rahaza/hr/reports/payroll-summary?period_code=&department_id=&location_id=&shift_id=`
  - `GET /api/rahaza/hr/reports/turnover?from_date=&to_date=&department_id=`
- Endpoints export Excel:
  - `GET /api/rahaza/hr/reports/attendance-summary.xlsx`
  - `GET /api/rahaza/hr/reports/overtime-summary.xlsx`
  - `GET /api/rahaza/hr/reports/payroll-summary.xlsx`
  - `GET /api/rahaza/hr/reports/turnover.xlsx` (multi-sheet)
- Dependency: `openpyxl` sudah diinstall.

#### Remaining (Frontend) ⏳
- Buat module: `RahazaHRReportsModule.jsx`
  - Tabs: Attendance | Overtime | Payroll | Turnover
  - Filter bar: periode, dept, loc, shift
  - Charts: trend harian (attendance/OT), pie/bar breakdown (payroll), trend bulanan (turnover)
  - Export buttons: Excel + PDF
- Tambah menu HR Reports di Portal HR + mapping di `moduleRegistry.js`.

**Success Criteria:**
- HR dapat lihat laporan (table+chart) dan export Excel/PDF.

---

### Sprint 3.2 — I-4: Standardisasi Accessory Module ke Rahaza Materials
**Goal:** menghapus ketergantungan endpoint legacy `/api/accessories` dan gunakan `rahaza_materials`.

**Remaining Tasks:**
- Frontend: update `/app/frontend/src/components/erp/AccessoryModule.jsx`:
  - Ganti semua fetch menjadi `/api/rahaza/materials?type=accessory`
  - Pastikan CRUD/active toggle konsisten dengan material master

**Success Criteria:**
- Aksesori menjadi bagian dari master material (single source of truth).

---

### Sprint 3.3 — HR-5: Payroll Attendance Completeness Validation (Warning-based)
**Scope (user confirmed):**
- Validasi **warning** (tidak memblokir payroll run).
- Cutoff: payroll dibayar sesuai attendance di bulan/periode tersebut.

**Remaining Tasks:**
- Backend:
  - Endpoint: `GET /api/rahaza/payroll/validate-attendance?from=&to=&department_id=&employee_id=`
  - Hitung warning: `missing_days`, `missing_dates[]`, `late_count`, `alpha_count`, `leave_days`
  - Simpan warning di payroll run record (`attendance_validation`)
- Frontend:
  - `RahazaPayrollRunModule.jsx`: panel warning saat preview/run
  - Tetap bisa lanjut run, tapi warning terekam

**Success Criteria:**
- Payroll tidak gagal, tapi user mendapat warning jelas dan terdokumentasi.

---

### Sprint 3.4 — I-6: Low Stock Indicators (Configurable)
**Scope (user confirmed):**
- Threshold bisa dikonfigurasi (angka tetap dan/atau persentase).
- Output hanya **indicator**.

**Remaining Tasks:**
- Backend:
  - Tambah field di `rahaza_materials`: `min_stock_qty`, `min_stock_pct`.
  - Tambah filter `low_stock=true` di `GET /api/rahaza/materials` atau endpoint baru.
- Frontend:
  - Tambahkan badge low-stock di stock/material list.
  - Filter list “Low Stock”.

**Success Criteria:**
- Gudang dapat melihat item low stock dengan cepat.

---

### Sprint 3.5 — Wiring, Indexes, Testing (untuk Sprint 3)
**Remaining Tasks:**
- Wire router HR reports ke `server.py`.
- Tambah menu HR Reports di `PortalShell.jsx` + mapping di `moduleRegistry.js`.
- Index DB:
  - attendance_events: (employee_id, date), status
  - payroll_runs: period
  - materials: type, active, min_stock fields
- Testing:
  - Backend tests untuk report endpoints + validate-attendance
  - Frontend smoke test: HR Reports, Accessory endpoint change, low-stock indicators

---

## Phase 5 — Next Roadmap (Not Started)
> **STATUS: PLANNED**

### Phase 22 — Supervisor & PPIC Power Tools
- Bulk Material Issue Generator
- Auto-assign Template
- Line Balancing (SAM-based)
- Material Reservation saat WO Release
- Production Calendar + Shift Handover Checklist

### Phase 23 — Mobility / PWA
- PWA offline-lite (cache read-only)
- End-of-Shift Report via mobile
- Notifikasi/WhatsApp bot (opsional)

### Phase 24 — Buyer Compliance & Tech Pack
- Tech pack repository per model
- Compliance checklist, approvals, audit evidence

### Phase F4 — Advanced Finance
- Multi-currency
- Tax module
- Budgeting + variance

### UI Polish
- Standardisasi komponen select/combobox
- Tooltip consistency, keyboard accessibility, aria labels
