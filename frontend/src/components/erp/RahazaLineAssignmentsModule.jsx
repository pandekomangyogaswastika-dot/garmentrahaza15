import { useEffect, useState, useCallback } from 'react';
import { Copy, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import MasterDataCRUD from './MasterDataCRUD';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass';

function AutoAssignBanner({ token, onAssigned }) {
  const [state, setState] = useState('idle'); // idle | loading | preview | done | error
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState('');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const fetchPreview = async () => {
    setState('loading');
    try {
      const r = await fetch('/api/rahaza/supervisor/assignments/yesterday', { headers });
      if (!r.ok) { setState('error'); setMsg('Gagal mengambil template.'); return; }
      const d = await r.json();
      setPreview(d);
      setState('preview');
    } catch (e) { setState('error'); setMsg(String(e)); }
  };

  const applyTemplate = async () => {
    if (!preview?.assignments?.length) return;
    setState('loading');
    try {
      const r = await fetch('/api/rahaza/supervisor/assignments/bulk', {
        method: 'POST', headers,
        body: JSON.stringify({ assignments: preview.assignments, assign_date: today, overwrite: false }),
      });
      const d = await r.json();
      setState('done');
      setMsg(`${d.created} assignment berhasil disalin ke hari ini. ${d.skipped} dilewati (sudah ada).`);
      onAssigned && onAssigned();
    } catch (e) { setState('error'); setMsg(String(e)); }
  };

  if (state === 'idle') {
    return (
      <div className="bg-primary/8 border border-primary/20 rounded-xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Copy className="w-4 h-4 text-primary shrink-0" />
          <p className="text-sm text-foreground/80">
            <strong>Auto-assign:</strong> Salin assignment kemarin ({yesterday}) ke hari ini sebagai template awal.
          </p>
        </div>
        <Button size="sm" variant="ghost" className="border border-primary/30 h-8 px-3 text-xs shrink-0"
          onClick={fetchPreview} data-testid="auto-assign-preview-btn">
          Cek Template Kemarin
        </Button>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-3 flex items-center gap-2 text-sm text-muted-foreground">
        <RefreshCw className="w-4 h-4 animate-spin" /> Memuat template...
      </div>
    );
  }

  if (state === 'preview' && preview) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Copy className="w-4 h-4 text-primary" /> Template dari {yesterday}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {preview.count > 0
                ? `${preview.count} assignment siap disalin ke ${today}. Assignment yang sudah ada hari ini akan dilewati.`
                : `Tidak ada assignment kemarin (${yesterday}). Template kosong.`}
            </p>
            {preview.count > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {preview.assignments.slice(0, 8).map((a, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    {a.line_name} · {a.employee_name}
                  </span>
                ))}
                {preview.count > 8 && <span className="text-[10px] text-muted-foreground">+{preview.count - 8} lainnya</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs border border-[var(--glass-border)]"
              onClick={() => setState('idle')}>Batal</Button>
            {preview.count > 0 && (
              <Button size="sm" className="h-8 text-xs" onClick={applyTemplate} data-testid="auto-assign-apply-btn">
                Terapkan ke {today}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (state === 'done') {
    return (
      <div className="bg-emerald-400/10 border border-emerald-300/20 rounded-xl p-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
        <p className="text-sm text-emerald-300">{msg}</p>
        <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={() => setState('idle')}>✕</button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="bg-red-400/10 border border-red-300/20 rounded-xl p-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
        <p className="text-sm text-red-300">{msg}</p>
        <button className="ml-auto text-xs text-muted-foreground hover:text-foreground" onClick={() => setState('idle')}>✕</button>
      </div>
    );
  }
  return null;
}

export default function RahazaLineAssignmentsModule({ token }) {
  const [lines, setLines] = useState([]);
  const [emps, setEmps] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [models, setModels] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMasterData = useCallback(() => {
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/rahaza/lines', { headers: h }).then(r => r.ok ? r.json() : []),
      fetch('/api/rahaza/employees', { headers: h }).then(r => r.ok ? r.json() : []),
      fetch('/api/rahaza/shifts', { headers: h }).then(r => r.ok ? r.json() : []),
      fetch('/api/rahaza/models', { headers: h }).then(r => r.ok ? r.json() : []),
      fetch('/api/rahaza/sizes', { headers: h }).then(r => r.ok ? r.json() : []),
    ]).then(([l, e, s, m, sz]) => {
      setLines(l); setEmps(e); setShifts(s); setModels(m); setSizes(sz);
    });
  }, [token]);

  useEffect(() => { loadMasterData(); }, [loadMasterData]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Sprint 22: Auto-assign banner */}
      <AutoAssignBanner token={token} onAssigned={() => setRefreshKey(k => k + 1)} />

      <MasterDataCRUD
        key={refreshKey}
        title="Assign Line (Operator + Shift + Target)"
        description="Setiap hari/shift, setiap Line dapat di-assign dengan Operator, Model, Size, dan Target produksi."
        endpoint="/api/rahaza/line-assignments"
        token={token}
        testIdPrefix="rahaza-line-assign"
        columns={[
          { key: 'assign_date', label: 'Tanggal' },
          { key: 'line_name', label: 'Line' },
          { key: 'operator_name', label: 'Operator', render: v => v || '-' },
          { key: 'shift_name', label: 'Shift', render: v => v || '-' },
          { key: 'model_name', label: 'Model', render: v => v || '-' },
          { key: 'size_name', label: 'Size', render: v => v || '-' },
          { key: 'target_qty', label: 'Target', render: v => v ? `${v} pcs` : '-' },
        ]}
        fields={[
          { key: 'assign_date', label: 'Tanggal', type: 'text', placeholder: 'YYYY-MM-DD', required: true },
          { key: 'line_id', label: 'Line', type: 'select', required: true,
            options: lines.filter(l => l.active).map(l => ({ value: l.id, label: `${l.code} · ${l.name}` })) },
          { key: 'operator_id', label: 'Operator', type: 'select',
            options: emps.filter(e => e.active).map(e => ({ value: e.id, label: `${e.employee_code} · ${e.name}` })) },
          { key: 'shift_id', label: 'Shift', type: 'select',
            options: shifts.filter(s => s.active).map(s => ({ value: s.id, label: `${s.name} (${s.start_time}-${s.end_time})` })) },
          { key: 'model_id', label: 'Model', type: 'select',
            options: models.filter(m => m.active).map(m => ({ value: m.id, label: `${m.code} · ${m.name}` })) },
          { key: 'size_id', label: 'Size', type: 'select',
            options: sizes.filter(s => s.active).map(s => ({ value: s.id, label: s.code })) },
          { key: 'target_qty', label: 'Target pcs', type: 'number', placeholder: 'Contoh: 200' },
          { key: 'notes', label: 'Catatan' },
        ]}
        defaultItem={{ assign_date: today, line_id: '', operator_id: '', shift_id: '', model_id: '', size_id: '', target_qty: 0, notes: '' }}
      />
    </div>
  );
}
