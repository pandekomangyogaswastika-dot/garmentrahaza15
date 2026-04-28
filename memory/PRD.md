# PRD — PT Rahaza ERP (Garment Manufacturing System)

**Last Updated**: 2026-04-28  
**Version**: Sprint 24 Complete

---

## Problem Statement
Membangun sistem ERP terpadu untuk PT Rahaza Global Indonesia — pabrik garment rajut. Sistem mencakup 5 portal utama: Manajemen, Produksi, Gudang, Keuangan, dan SDM.

---

## Architecture
- **Frontend**: React 18 + CRACO + Tailwind + Shadcn/ui
- **Backend**: FastAPI (Python 3.11) + Motor async MongoDB
- **Database**: MongoDB (local `test_database`)
- **Auth**: JWT (HS256), bcrypt password hashing
- **Deployment**: Supervisor-managed, port 3000 (FE) + 8001 (BE)

---

## User Personas
- **Admin / Superadmin**: Full access, all portals
- **Supervisor**: Produksi + SDM, shift handover, LKP management
- **Operator**: Self-service portal
- **Finance Staff**: Keuangan portal
- **Warehouse Staff**: Gudang portal

---

## Core Requirements (Static)

### 5 Portals:
1. **Manajemen**: Dashboard, Style Master, Order Management, Analytics
2. **Produksi**: Work Orders, Bundles, APS Gantt, Line Assignments, Bulk MI, LKP, SOP, BOM, Shift Handover, Material Reservation, Production Calendar, Line Balancing, Rework Board
3. **Gudang**: Materials, Inventory, Purchase Orders, Receiving, Putaway, Stockopname, Material Reservation
4. **Keuangan**: CoA, Journal, Payroll, Finance Reports
5. **SDM**: Employees, Attendance, HR Reports

---

## What's Been Implemented (with dates)

### Sprint 1 (Base Foundation)
- Auth system (JWT + bcrypt), user management, 5-portal structure
- Master data: Lines, Machines, Shifts, Locations, Sizes, Processes
- Work Orders CRUD, Bundle generation/tracking
- Material management (yarn + accessory), Inventory (FIFO)
- Basic Dashboard, Employee management, Attendance

### Sprint 2 (Production Depth)
- APS Gantt scheduler (auto-schedule, drag-reschedule)
- BOM (Bill of Materials), SOP management
- LKP Feature: PDF generation, versioning, audit trail, photo upload, security hardening (H1–H5)
- Rework Board, defect codes
- Finance: CoA, Journal, Payroll run
- Warehouse: PO, Receiving, Put-Away, Stockopname

### Sprint 22 (Supervisor Power Tools) — 2026-04
- Bulk MI Generator (`rahaza_sprint22.py` + `RahazaBulkMIModule.jsx`)
- Auto-assign Template (Copy Yesterday) — integrated in `RahazaLineAssignmentsModule.jsx`
- Line Balancing SAM-based (`RahazaLineBalancingModule.jsx`)

### Sprint 23 — 2026-04
- APS Gantt + Line Balance integration tab
- SOP SAM minutes + Target PCS per operator fields
- Health (`/api/health`), Metrics (`/api/metrics`), Docs (`/api/docs`) endpoints

### Sprint 3.x (HR + Inventory Depth) — 2026-04
- HR Reports: Attendance, Overtime, Payroll Summary, Turnover — backend `rahaza_hr_reports.py` + Excel export + frontend `RahazaHRReportsModule.jsx`
- Accessory Module migrated to `rahaza/materials?type=accessory`
- Payroll Attendance Validation — backend endpoint + frontend "Periksa Sekarang" button
- Low Stock Indicators: backend `?low_stock=true` filter + frontend badge in Materials module

### Sprint 24 (Phase 22B) — 2026-04-28
- **Demo Seed Data**: `rahaza_demo_seed.py` — POST `/api/rahaza/seed-demo` (idempotent)
  - Seeded: 15 employees, 10 materials (yarn+accessory+packaging), 5 WOs, 5 models, 3 orders, 3 customers, 4 SOPs, 30 attendance records
- **LKP Bulk Print**: GET `/api/rahaza/lkp-bulk-today` — lists all active WOs with LKP status. "Cetak LKP Massal" button in Work Orders header
- **Shift Handover frontend**: `RahazaShiftHandoverModule.jsx` — create/view handovers with checklist, issues, pending tasks. Nav: Produksi > Eksekusi > Shift Handover
- **Material Reservation frontend**: `RahazaMaterialReservationModule.jsx` — Per WO + Per Material tabs, reserve/release UI. Nav: Produksi + Gudang
- **Production Calendar**: `rahaza_production_calendar.py` + `RahazaProductionCalendarModule.jsx` — monthly calendar, CRUD exceptions, national holiday seed, working days calculator. Nav: Produksi > Master Data > Kalender Produksi
- **PWA**: `manifest.json` added to `/app/frontend/public/`, page title updated to "PT Rahaza ERP"
- **Admin list endpoint**: GET `/api/rahaza/material-reservations` — paginated list with filters

---

## Test Credentials
- **Admin**: admin@garment.com / Admin@123

---

## Prioritized Backlog

### P0 (Critical / Quick Wins)
- [ ] LKP foto otomatis muncul di PDF (upload foto langsung terlihat)

### P1 (High Value)
- [ ] Production Calendar: link with APS scheduler (block dates on APS)
- [ ] Material Reservation auto-block saat WO release (currently manual)
- [ ] OEE Dashboard (Machine efficiency tracking)
- [ ] Shift Handover: supervisor acknowledgement / sign-off flow

### P2 (Medium)
- [ ] End-of-Shift PDF Report
- [ ] WhatsApp Bot notification (low stock, WO due)
- [ ] Style Master 2.0 (design image management)
- [ ] AQL Sampling Tool (inline QC)
- [ ] Service Worker / offline support (full PWA)

### P3 (Polish / Future)
- [ ] Replace native select → Shadcn Combobox
- [ ] Tooltip for all icon-only buttons
- [ ] Accessibility improvements (ARIA)
- [ ] Advanced Finance: Cash Flow, Tax module, Multi-currency, Budgeting
- [ ] Mobile app wrapper (Capacitor/Expo)

---

## Next Tasks List (Recommended)
1. Material Reservation auto-trigger on WO release
2. Production Calendar ↔ APS integration
3. OEE Dashboard (already has rahaza_oee.py backend)
4. Shift Handover sign-off (supervisor acknowledgement)
5. Service Worker for offline capability (full PWA)
