user_problem_statement: |
  Continue PT Rahaza ERP. New feature: Lembar Kerja Produksi (LKP) — Production Work Sheet PDF.
  Operator dapat surat kerja lengkap (SOP, foto produk, BOM, QC, packing) saat memulai produksi.
  User choices: 1.a A-L lengkap, 2.b SOP manual, 3.a upload foto max 3, 4.a reportlab, 5.a A4 portrait,
  6.a Bahasa Indonesia, 7.c auto-save + cetak ulang, 8 audit trail.

backend:
  - task: "Model image upload (max 3 per model)"
    implemented: true
    working: true
    file: "/app/backend/routes/rahaza_production.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: "100% pass (iter_2): POST/DELETE endpoints validated, content-type check, max 5MB, max 3."

  - task: "LKP CRUD endpoints"
    implemented: true
    working: true
    file: "/app/backend/routes/rahaza_lkp.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: |
          26/26 pytest tests pass (iter_2). Endpoints: list per WO, create with PDF gen, detail+audit,
          download (header & ?auth=), regenerate, cross-WO list, soft-delete. Versioning auto-increment.
          BOM resolution handles both legacy & unified materials format.

  - task: "PDF generator with reportlab (A4 portrait, multi-page, sections A-L)"
    implemented: true
    working: true
    file: "/app/backend/utils/lkp_pdf.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: "Valid %PDF-1.4 ~13-24KB multi-page. AI verification 95% confidence all sections A-L present."

  - task: "Audit trail (created/downloaded/regenerated/revoked)"
    implemented: true
    working: true
    file: "/app/backend/routes/rahaza_lkp.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: "All 4 actions logged correctly with user_id, user_name, timestamp, version."

frontend:
  - task: "RahazaModelsModule with image upload (max 3 per model)"
    implemented: true
    working: true
    file: "/app/frontend/src/components/erp/RahazaModelsModule.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: false
        agent: "testing"
        comment: "iter_3: CRITICAL — render(value, row) crashes vs DataTableV2 render(row, value)"
      - working: true
        agent: "testing"
        comment: |
          iter_4: FIXED & VERIFIED. Page renders, Foto column works (X/3 badge),
          upload PNG triggers 'Foto berhasil diupload' toast, counter advances 0/3 → 1/3.

  - task: "LKPDialog (multi-step wizard for creating LKP)"
    implemented: true
    working: true
    file: "/app/frontend/src/components/erp/LKPDialog.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: |
          iter_4: 5-step wizard opens cleanly. Dropdowns populate (4 lines, 7 machines, 19 employees, 3 shifts).
          0 console errors/warnings. <span><option> hydration warning eliminated via template literals.

  - task: "LKP section in Work Order detail (list, preview, download, regenerate, audit)"
    implemented: true
    working: true
    file: "/app/frontend/src/components/erp/RahazaWorkOrdersModule.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "testing"
        comment: |
          iter_4: LKPs list (LKP-2026-0001..0007 incl. revoked v5) renders with all 4 action button types.

metadata:
  created_by: "main_agent"
  version: "1.2"
  test_sequence: 4
  run_ui: true

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      LKP feature COMPLETE. Backend 100%, Frontend 95%.

      Implemented:
      - Backend: model image upload, LKP CRUD with versioning, reportlab PDF generator (A-L),
        audit trail, BOM resolution, cross-WO list.
      - Frontend: model image management (upload max 3), 5-step LKP wizard
        (Tech Pack → SOP → QC → Packing → Notes), LKP section in WO detail with
        preview/download/regenerate/audit actions.

      Both critical bugs found by testing agent (iter_3) FIXED and verified (iter_4):
      1. RahazaModelsModule render signature (row, value) per DataTableV2 convention.
      2. LKPDialog <option> children use template literals (no <span> children).

      Test Credentials: admin@garment.com / Admin@123
      Backend tests: /app/backend/tests/test_rahaza_lkp.py (26/26 pass)
