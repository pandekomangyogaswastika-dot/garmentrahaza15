# PRD — PT Rahaza ERP (Garment Manufacturing System)

**Last Updated**: 2026-04-29
**Version**: Sprint 26 Complete

---

## Problem Statement
Membangun sistem ERP terpadu untuk PT Rahaza Global Indonesia — pabrik garment rajut. Sistem mencakup 5 portal utama: Manajemen, Produksi, Gudang, Keuangan, dan SDM.

---

## Architecture
- **Frontend**: React 18 + CRACO + Tailwind + Shadcn/ui
- **Backend**: FastAPI (Python 3.11) + Motor async MongoDB
- **Database**: MongoDB (local `test_database`)
- **Auth**: JWT (HS256), bcrypt password hashing
- **Storage**: Emergent Object Storage (via EMERGENT_LLM_KEY)
- **PDF**: ReportLab (LKP, End-of-Shift)
- **Async images**: aiohttp (production photos in LKP PDF)
- **Deployment**: Supervisor-managed, port 3000 (FE) + 8001 (BE)

---

## User Personas
- **Admin / Superadmin**: Full access, all portals
- **Supervisor**: Produksi + SDM, shift handover, LKP management
- **Operator**: Self-service portal
- **Finance Staff**: Keuangan portal
- **Warehouse Staff**: Gudang portal

---

## Core Requirements

### 5 Portals:
1. **Manajemen**: Dashboard, Style Master, Order Management, Analytics, **Panduan Penggunaan ERP**
2. **Produksi**: Work Orders, Bundles, APS Gantt, Line Assignments, Bulk MI, LKP, SOP, BOM, Shift Handover (+ End-of-Shift PDF), Material Reservation, Production Calendar, Line Balancing, Rework Board, OEE Dashboard
3. **Gudang**: Materials, Inventory, Purchase Orders, Receiving, Putaway, Stockopname, Material Reservation
4. **Keuangan**: CoA, Journal, Payroll, Finance Reports
5. **SDM**: Employees, Attendance, HR Reports

---

## What's Been Implemented

### Sprint 1 (Base Foundation)
- Auth system (JWT + bcrypt), user management, 5-portal structure
- Master data, Work Orders CRUD, Bundle generation/tracking
- Material management, Inventory (FIFO), Dashboard, Employee/Attendance

### Sprint 2 (Production Depth)
- APS Gantt scheduler, BOM, SOP management
- LKP: PDF generation, versioning, audit trail, photo upload, security hardening
- Rework Board, defect codes
- Finance: CoA, Journal, Payroll
- Warehouse: PO, Receiving, Put-Away, Stockopname

### Sprint 22 (Supervisor Power Tools) — 2026-04
- Bulk MI Generator, Auto-assign Template, Line Balancing SAM-based

### Sprint 23 — 2026-04
- APS Gantt + Line Balance integration, SOP SAM/Target fields
- Health/Metrics/Docs endpoints

### Sprint 3.x (HR + Inventory Depth) — 2026-04
- HR Reports + Excel export, Accessory module, Payroll Validation, Low Stock indicators

### Sprint 24 (Phase 22B) — 2026-04-28
- Demo Seed Data, LKP Bulk Print, Shift Handover frontend, Material Reservation UI
- Production Calendar, PWA manifest+sw, Admin material-reservation list

### Sprint 25 (P1/P2 Backlog) — 2026-04-29
- WO Release auto-reservation
- APS Gantt + Production Calendar holiday overlay
- Shift Handover sign-off flow
- Service Worker (full PWA)
- OEE Dashboard

### Sprint 26 (P0/P2 Final) — 2026-04-29
- **End-of-Shift PDF Report**: `utils/shift_report_pdf.py` + GET `/api/rahaza/shift-handovers/{id}/pdf`
- **LKP Foto Otomatis**: `utils/lkp_pdf.py` Section L "FOTO PRODUKSI & QC" rendered from `rahaza_lkp_photos`. Async fetch via aiohttp + Emergent Storage. Cache invalidated by `pdf_stale` flag on photo upload (regen+re-cache).
- **Panduan Penggunaan ERP**: `RahazaUserGuideModule.jsx` (707 lines) — search bar, 8 test scenarios (S1–S8 incl. defect→rework, mesin breakdown, shift malam, hari libur, etc.), 5 portal sections w/ accordion, Test Scenarios & Use Cases, Tips/FAQ/Troubleshooting. Routed via `mgmt-help` (replaces legacy HelpGuideModule).
- **Frontend Shift PDF download**: `RahazaShiftHandoverModule.jsx` `downloadHandoverPdf` (Bearer auth via fetch+blob, replaces broken `<a href>`)

---

## Test Credentials
- **Admin**: admin@garment.com / Admin@123 (see `/app/memory/test_credentials.md`)

---

## Prioritized Backlog

### P0 — All Done ✅
- [x] LKP foto otomatis muncul di PDF (Sprint 26)

### P1 — All Done ✅
- [x] Production Calendar ↔ APS integration
- [x] Material Reservation auto-trigger saat WO release
- [x] Shift Handover sign-off flow
- [x] OEE Dashboard
- [ ] OEE data seeding / event log from actual WIP recording

### P2 (Medium)
- [x] End-of-Shift PDF Report (Sprint 26)
- [ ] WhatsApp/Telegram notification (low stock, WO due date)
- [ ] Style Master 2.0 (design image management)
- [ ] AQL Sampling Tool (inline QC)

### P3 (Polish / Future)
- [ ] Replace native select → Shadcn Combobox
- [ ] Tooltip for all icon-only buttons
- [ ] Accessibility improvements (ARIA)
- [ ] Advanced Finance: Cash Flow, Tax module, Multi-currency, Budgeting
- [ ] Mobile app wrapper (Capacitor/Expo)

---

## Next Recommended Tasks
1. OEE event-log auto-seeding from WIP recording
2. WhatsApp/Telegram notification stack
3. Style Master 2.0 (design images, version control)
4. AQL Sampling Tool inline QC

---

## Known APIs (Sprint 26)
- `GET /api/rahaza/lkp/{id}/pdf` — generate or fetch cached LKP PDF (auto-includes photos)
- `POST /api/rahaza/lkp/{id}/photos` — upload QC/production photo (sets pdf_stale=True)
- `GET /api/rahaza/shift-handovers/{id}/pdf` — End-of-Shift PDF Report
- `POST /api/rahaza/shift-handovers/{id}/sign-off` — supervisor acknowledgement

---

## Critical Files
- `/app/backend/utils/lkp_pdf.py` — LKP PDF builder (sections A–L)
- `/app/backend/utils/shift_report_pdf.py` — End-of-Shift PDF builder (sections A–G)
- `/app/backend/routes/rahaza_lkp.py` — `_generate_pdf_bytes` (aiohttp), pdf_stale-aware download cache
- `/app/backend/routes/rahaza_shift_handover.py` — `download_shift_report_pdf` endpoint
- `/app/frontend/src/components/erp/RahazaUserGuideModule.jsx` — 707-line user guide
- `/app/frontend/src/components/erp/moduleRegistry.js` — `mgmt-help → RahazaUserGuideModule`
- `/app/frontend/src/components/erp/RahazaShiftHandoverModule.jsx` — `downloadHandoverPdf`
