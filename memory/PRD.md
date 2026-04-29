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
- **LKP Bulk Print**: GET `/api/rahaza/lkp-bulk-today` + "Cetak LKP Massal" button in Work Orders header
- **Shift Handover frontend**: `RahazaShiftHandoverModule.jsx` — create/view handovers + sign-off flow (modal, status badge, supervisor acknowledgement)
- **Material Reservation frontend**: `RahazaMaterialReservationModule.jsx` — Per WO + Per Material tabs, reserve/release UI
- **Production Calendar**: `rahaza_production_calendar.py` + `RahazaProductionCalendarModule.jsx` — calendar, holidays, working days calculator
- **PWA**: `manifest.json` + `sw.js` service worker with cache-first static / network-first API strategy
- **Admin list endpoint**: GET `/api/rahaza/material-reservations`

### Sprint 25 (P1/P2 Backlog) — 2026-04-29
- **WO Release auto-reservation**: WO status → released now auto-triggers `_auto_reserve_materials_for_wo` and returns `material_reservation: {reserved_count, warnings, has_warnings}` in response
- **APS Gantt + Production Calendar**: GET `/api/rahaza/aps/gantt` now includes `holidays[]` array; Frontend APSGanttModule highlights holiday columns in red
- **Shift Handover sign-off**: POST `/api/rahaza/shift-handovers/{id}/sign-off` — stores signed_off_by, signed_off_at, sign_off_notes; Frontend adds Sign Off button + confirmation modal + signed-off badge
- **Service Worker (full PWA)**: `/sw.js` registered in index.js — Cache-First for static assets, Network-First for API, offline fallback for HTML
- **OEE Dashboard**: `RahazaOEEModule.jsx` — KPI cards (OEE/Availability/Performance/Quality), Recharts line/bar charts, per-line table with drilldown, date range + line filter. Registered as `prod-oee` in nav (Produksi > Monitoring)

---

## Test Credentials
- **Admin**: admin@garment.com / Admin@123

---

## Prioritized Backlog

### P0 (Critical / Quick Wins)
- [ ] LKP foto otomatis muncul di PDF (upload foto langsung terlihat)

### P1 (Done ✅ or Remaining)
- [x] Production Calendar ↔ APS integration — DONE
- [x] Material Reservation auto-trigger saat WO release — DONE
- [x] Shift Handover sign-off flow — DONE
- [x] OEE Dashboard — DONE
- [ ] OEE data seeding / event log from actual WIP recording

### P2 (Medium)
- [ ] End-of-Shift PDF Report
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

## Next Tasks List (Recommended)
1. Material Reservation auto-trigger on WO release
2. Production Calendar ↔ APS integration
3. OEE Dashboard (already has rahaza_oee.py backend)
4. Shift Handover sign-off (supervisor acknowledgement)
5. Service Worker for offline capability (full PWA)
