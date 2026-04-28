import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, CheckCircle2, XCircle, Calendar, Users, TrendingUp, Settings } from 'lucide-react';
import { GlassCard, GlassInput } from '@/components/ui/glass';
import { Button } from '@/components/ui/button';
import Modal from './Modal';
import { toast } from 'sonner';

const STATUS_META = {
  draft:             { label: 'Draft',             bg: 'bg-slate-400/15',   border: 'border-slate-300/25',   text: 'text-slate-300' },
  pending_approval:  { label: 'Menunggu Approval', bg: 'bg-amber-400/15',   border: 'border-amber-300/25',   text: 'text-amber-300' },
  approved:          { label: 'Disetujui',         bg: 'bg-emerald-400/15', border: 'border-emerald-300/25', text: 'text-emerald-300' },
  rejected:          { label: 'Ditolak',           bg: 'bg-red-400/15',     border: 'border-red-300/25',     text: 'text-red-300' },
  cancelled:         { label: 'Dibatalkan',        bg: 'bg-gray-400/15',    border: 'border-gray-300/25',    text: 'text-gray-300' },
};

function StatusBadge({ status }) {
  const s = STATUS_META[status] || STATUS_META.draft;
  return <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.border} border ${s.text}`}>{s.label}</span>;
}

export default function RahazaLeaveModule({ token }) {
  const [activeTab, setActiveTab] = useState('requests');  // requests | types | balance
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [requestModal, setRequestModal] = useState(false);
  const [typeModal, setTypeModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [saving, setSaving] = useState(false);

  const [requestForm, setRequestForm] = useState({
    employee_id: '',
    leave_type_id: '',
    from_date: '',
    to_date: '',
    reason: '',
  });

  const [typeForm, setTypeForm] = useState({
    code: '',
    name: '',
    paid: true,
    quota_default: 12,
    description: '',
  });

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const q = filterStatus ? `?status=${filterStatus}` : '';
      const [reqRes, typesRes, empRes] = await Promise.all([
        fetch(`/api/rahaza/leaves${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/rahaza/leave-types', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/rahaza/employees', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (reqRes.ok) setLeaveRequests(await reqRes.json());
      if (typesRes.ok) setLeaveTypes(await typesRes.json());
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees((Array.isArray(data) ? data : (data.items || [])).filter(e => e.active));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetRequestForm = () => {
    setRequestForm({
      employee_id: '',
      leave_type_id: '',
      from_date: '',
      to_date: '',
      reason: '',
    });
  };

  const resetTypeForm = () => {
    setTypeForm({
      code: '',
      name: '',
      paid: true,
      quota_default: 12,
      description: '',
    });
  };

  const openRequestModal = () => {
    resetRequestForm();
    setRequestModal(true);
  };

  const createRequest = async () => {
    setSaving(true);
    try {
      if (!requestForm.employee_id || !requestForm.leave_type_id || !requestForm.from_date || !requestForm.to_date) {
        throw new Error('Semua field wajib diisi.');
      }

      const r = await fetch('/api/rahaza/leaves/request', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestForm),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `Gagal membuat request (HTTP ${r.status})`);
      }

      toast.success('Request cuti berhasil dibuat');
      setRequestModal(false);
      resetRequestForm();
      fetchData();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openTypeModal = () => {
    resetTypeForm();
    setTypeModal(true);
  };

  const createLeaveType = async () => {
    setSaving(true);
    try {
      if (!typeForm.code || !typeForm.name) {
        throw new Error('Code & nama wajib diisi.');
      }

      const r = await fetch('/api/rahaza/leave-types', {
        method: 'POST',
        headers,
        body: JSON.stringify(typeForm),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `Gagal membuat leave type (HTTP ${r.status})`);
      }

      toast.success('Leave type berhasil dibuat');
      setTypeModal(false);
      resetTypeForm();
      fetchData();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (leave) => {
    const r = await fetch(`/api/rahaza/leaves/${leave.id}`, { headers });
    if (r.ok) {
      setSelectedLeave(await r.json());
      setDetailModal(true);
    }
  };

  const approveLeave = async (leave) => {
    if (!window.confirm(`Setujui request cuti ${leave.employee_name} (${leave.duration_days} hari)?`)) return;
    const r = await fetch(`/api/rahaza/leaves/${leave.id}/approve`, { method: 'POST', headers });
    if (r.ok) {
      toast.success('Request cuti disetujui');
      fetchData();
      if (detailModal && selectedLeave?.id === leave.id) {
        openDetail(leave);
      }
    } else {
      toast.error('Gagal approve request');
    }
  };

  const rejectLeave = async (leave) => {
    const reason = prompt(`Alasan menolak request cuti ${leave.employee_name}:`);
    if (!reason) return;
    const r = await fetch(`/api/rahaza/leaves/${leave.id}/reject`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason }),
    });
    if (r.ok) {
      toast.success('Request cuti ditolak');
      fetchData();
      if (detailModal && selectedLeave?.id === leave.id) {
        openDetail(leave);
      }
    } else {
      toast.error('Gagal reject request');
    }
  };

  const deleteLeave = async (leave) => {
    if (!window.confirm(`Hapus request cuti ${leave.employee_name}?`)) return;
    const r = await fetch(`/api/rahaza/leaves/${leave.id}`, { method: 'DELETE', headers });
    if (r.ok) {
      toast.success('Request cuti dihapus');
      fetchData();
      setDetailModal(false);
    } else {
      toast.error('Gagal menghapus request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="leave-management-page">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manajemen Izin & Cuti</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola pengajuan cuti karyawan dengan workflow approval dan tracking saldo cuti.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'requests' && (
            <>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[var(--glass-border)] bg-[var(--input-surface)] text-sm text-foreground"
                data-testid="leave-filter-status"
              >
                <option value="">Semua Status</option>
                <option value="pending_approval">Menunggu Approval</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
              <Button onClick={openRequestModal} data-testid="leave-request-btn">
                <Plus className="w-4 h-4 mr-1.5" /> Request Cuti
              </Button>
            </>
          )}
          {activeTab === 'types' && (
            <Button onClick={openTypeModal} data-testid="leave-type-btn">
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Tipe
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--glass-border)]">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          data-testid="tab-requests"
        >
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Request Cuti
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'types'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          data-testid="tab-types"
        >
          <Settings className="w-4 h-4 inline mr-1.5" />
          Tipe Cuti
        </button>
      </div>

      {/* Leave Requests Tab */}
      {activeTab === 'requests' && (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--glass-border)]">
                <tr className="text-left text-muted-foreground">
                  <th className="pb-3 pl-4 font-semibold">Karyawan</th>
                  <th className="pb-3 font-semibold">Tipe Cuti</th>
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Durasi</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {leaveRequests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Belum ada request cuti</p>
                    </td>
                  </tr>
                )}
                {leaveRequests.map((leave, idx) => (
                  <tr
                    key={leave.id}
                    className={`border-b border-[var(--glass-border)] ${idx % 2 === 0 ? 'bg-[var(--glass-bg)]/30' : ''}`}
                    data-testid={`leave-row-${leave.id}`}
                  >
                    <td className="py-3 pl-4">
                      <div className="font-medium">{leave.employee_name}</div>
                      <div className="text-xs text-muted-foreground">{leave.employee_code}</div>
                    </td>
                    <td className="py-3">
                      <div>{leave.leave_type_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {leave.is_paid ? 'Paid' : 'Unpaid'}
                      </div>
                    </td>
                    <td className="py-3 text-xs">
                      {new Date(leave.from_date).toLocaleDateString('id-ID')} -{' '}
                      {new Date(leave.to_date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 font-semibold">{leave.duration_days} hari</td>
                    <td className="py-3">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(leave)} data-testid={`leave-view-${leave.id}`}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {leave.status === 'pending_approval' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => approveLeave(leave)} data-testid={`leave-approve-${leave.id}`}>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => rejectLeave(leave)} data-testid={`leave-reject-${leave.id}`}>
                              <XCircle className="w-4 h-4 text-red-400" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Leave Types Tab */}
      {activeTab === 'types' && (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--glass-border)]">
                <tr className="text-left text-muted-foreground">
                  <th className="pb-3 pl-4 font-semibold">Kode</th>
                  <th className="pb-3 font-semibold">Nama</th>
                  <th className="pb-3 font-semibold">Paid/Unpaid</th>
                  <th className="pb-3 font-semibold">Quota Default</th>
                  <th className="pb-3 pr-4 font-semibold">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {leaveTypes.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-muted-foreground">
                      <Settings className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Belum ada tipe cuti</p>
                    </td>
                  </tr>
                )}
                {leaveTypes.map((lt, idx) => (
                  <tr
                    key={lt.id}
                    className={`border-b border-[var(--glass-border)] ${idx % 2 === 0 ? 'bg-[var(--glass-bg)]/30' : ''}`}
                    data-testid={`leave-type-${lt.code}`}
                  >
                    <td className="py-3 pl-4 font-mono text-xs font-semibold">{lt.code}</td>
                    <td className="py-3 font-medium">{lt.name}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${lt.paid ? 'bg-emerald-400/15 text-emerald-300' : 'bg-slate-400/15 text-slate-300'}`}>
                        {lt.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3">{lt.quota_default} hari/tahun</td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{lt.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Request Leave Modal */}
      {requestModal && (
        <Modal onClose={() => setRequestModal(false)} title="Request Cuti Baru">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Karyawan *</label>
              <select
                value={requestForm.employee_id}
                onChange={e => setRequestForm({ ...requestForm, employee_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-[var(--input-surface)] text-foreground text-sm"
                data-testid="request-form-employee"
              >
                <option value="">Pilih karyawan...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_code} - {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Tipe Cuti *</label>
              <select
                value={requestForm.leave_type_id}
                onChange={e => setRequestForm({ ...requestForm, leave_type_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-[var(--input-surface)] text-foreground text-sm"
                data-testid="request-form-type"
              >
                <option value="">Pilih tipe cuti...</option>
                {leaveTypes.filter(lt => lt.active).map(lt => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} ({lt.paid ? 'Paid' : 'Unpaid'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Dari Tanggal *</label>
                <GlassInput
                  type="date"
                  value={requestForm.from_date}
                  onChange={e => setRequestForm({ ...requestForm, from_date: e.target.value })}
                  data-testid="request-form-from"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Sampai Tanggal *</label>
                <GlassInput
                  type="date"
                  value={requestForm.to_date}
                  onChange={e => setRequestForm({ ...requestForm, to_date: e.target.value })}
                  data-testid="request-form-to"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Alasan</label>
              <textarea
                value={requestForm.reason}
                onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                placeholder="Alasan pengajuan cuti..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-[var(--input-surface)] text-foreground text-sm"
                rows="3"
                data-testid="request-form-reason"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--glass-border)]">
              <Button variant="secondary" onClick={() => setRequestModal(false)}>
                Batal
              </Button>
              <Button onClick={createRequest} disabled={saving} data-testid="request-form-submit">
                {saving ? 'Menyimpan...' : 'Ajukan Request'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Leave Type Modal */}
      {typeModal && (
        <Modal onClose={() => setTypeModal(false)} title="Tambah Tipe Cuti Baru">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Kode *</label>
                <GlassInput
                  value={typeForm.code}
                  onChange={e => setTypeForm({ ...typeForm, code: e.target.value.toUpperCase() })}
                  placeholder="TAHUNAN"
                  data-testid="type-form-code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nama *</label>
                <GlassInput
                  value={typeForm.name}
                  onChange={e => setTypeForm({ ...typeForm, name: e.target.value })}
                  placeholder="Cuti Tahunan"
                  data-testid="type-form-name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Paid/Unpaid</label>
                <select
                  value={typeForm.paid ? 'true' : 'false'}
                  onChange={e => setTypeForm({ ...typeForm, paid: e.target.value === 'true' })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-[var(--input-surface)] text-foreground text-sm"
                  data-testid="type-form-paid"
                >
                  <option value="true">Paid (Dibayar)</option>
                  <option value="false">Unpaid (Tidak Dibayar)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Quota Default (hari/tahun)</label>
                <GlassInput
                  type="number"
                  value={typeForm.quota_default}
                  onChange={e => setTypeForm({ ...typeForm, quota_default: parseInt(e.target.value) || 0 })}
                  data-testid="type-form-quota"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Deskripsi</label>
              <textarea
                value={typeForm.description}
                onChange={e => setTypeForm({ ...typeForm, description: e.target.value })}
                placeholder="Deskripsi tipe cuti..."
                className="w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-[var(--input-surface)] text-foreground text-sm"
                rows="2"
                data-testid="type-form-description"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[var(--glass-border)]">
              <Button variant="secondary" onClick={() => setTypeModal(false)}>
                Batal
              </Button>
              <Button onClick={createLeaveType} disabled={saving} data-testid="type-form-submit">
                {saving ? 'Menyimpan...' : 'Simpan Tipe Cuti'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Leave Modal */}
      {detailModal && selectedLeave && (
        <Modal onClose={() => setDetailModal(false)} title={`Detail Request Cuti`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
              <StatusBadge status={selectedLeave.status} />
              <div className="text-right text-sm text-muted-foreground">
                <div>Request: {new Date(selectedLeave.created_at).toLocaleString('id-ID')}</div>
                <div>Oleh: {selectedLeave.created_by_name}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Karyawan</div>
                <div className="font-medium">{selectedLeave.employee_name}</div>
                <div className="text-xs text-muted-foreground">{selectedLeave.employee_code}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Tipe Cuti</div>
                <div className="font-medium">{selectedLeave.leave_type_name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedLeave.is_paid ? 'Paid' : 'Unpaid'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Periode</div>
                <div>
                  {new Date(selectedLeave.from_date).toLocaleDateString('id-ID')} -{' '}
                  {new Date(selectedLeave.to_date).toLocaleDateString('id-ID')}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Durasi</div>
                <div className="font-semibold">{selectedLeave.duration_days} hari</div>
              </div>
            </div>

            {selectedLeave.reason && (
              <div className="p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="text-xs text-muted-foreground mb-1">Alasan</div>
                <div className="text-sm">{selectedLeave.reason}</div>
              </div>
            )}

            {selectedLeave.rejected_reason && (
              <div className="p-3 rounded-lg bg-red-400/10 border border-red-400/30">
                <div className="text-xs text-red-300 mb-1">Alasan Ditolak</div>
                <div className="text-sm text-red-300">{selectedLeave.rejected_reason}</div>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4 border-t border-[var(--glass-border)]">
              <div>
                {selectedLeave.status === 'pending_approval' && (
                  <>
                    <Button
                      onClick={() => { setDetailModal(false); approveLeave(selectedLeave); }}
                      className="mr-2"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Setujui
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => { setDetailModal(false); rejectLeave(selectedLeave); }}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" /> Tolak
                    </Button>
                  </>
                )}
              </div>
              <Button variant="secondary" onClick={() => setDetailModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
