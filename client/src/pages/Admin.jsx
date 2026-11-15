import { useEffect, useState, useCallback } from 'react';
import api, { errMsg } from '../api';
import { Alert, Badge, Empty, FileLink, PageHead, fmtDate, stockLevel } from '../components/ui.jsx';

const TABS = ['Overview', 'Donations', 'Requests', 'Inventory', 'Users'];

function Stat({ label, value, accent }) {
  return <div className="panel"><div className="text-sm text-slate-500">{label}</div><div className={`font-display text-3xl font-extrabold ${accent ? 'text-blood' : ''}`}>{value}</div></div>;
}

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [edit, setEdit] = useState({});

  const load = useCallback(async () => {
    setErr('');
    try {
      const q = filter ? `?status=${filter}` : '';
      if (tab === 'Overview') setStats((await api.get('/admin/stats')).data);
      if (tab === 'Donations') setRows((await api.get(`/admin/donations${q}`)).data);
      if (tab === 'Requests') setRows((await api.get(`/admin/requests${q}`)).data);
      if (tab === 'Inventory') setRows((await api.get('/inventory')).data);
      if (tab === 'Users') setRows((await api.get('/admin/users')).data);
    } catch (e) { setErr(errMsg(e)); }
  }, [tab, filter]);
  useEffect(() => { setRows(null); load(); }, [load]);

  const act = async (kind, id, action) => {
    const note = ['reject'].includes(action) ? window.prompt('Reason for rejecting (shown to the user)') : '';
    if (action === 'reject' && note === null) return;
    setErr(''); setOk('');
    try { await api.patch(`/admin/${kind}/${id}`, { action, note }); setOk('Updated'); load(); } catch (e) { setErr(errMsg(e)); }
  };
  const saveStock = async (g) => {
    setErr(''); setOk('');
    try { await api.patch(`/admin/inventory/${encodeURIComponent(g)}`, { units: edit[g] }); setOk(`${g} stock saved`); setEdit({ ...edit, [g]: undefined }); load(); } catch (e) { setErr(errMsg(e)); }
  };
  const toggle = (u) => api.patch(`/admin/users/${u._id}/active`, { active: !u.active }).then(load).catch((e) => setErr(errMsg(e)));

  const Filter = () => (
    <select className="input mb-4 max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
      <option value="">All statuses</option>
      {(tab === 'Donations' ? ['pending', 'approved', 'completed', 'rejected', 'cancelled'] : ['pending', 'approved', 'fulfilled', 'rejected', 'cancelled']).map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );

  return (
    <>
      <PageHead title="Admin" />
      <div className="mb-5 flex flex-wrap gap-1 border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setOk(''); }}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${tab === t ? 'border-blood text-blood' : 'border-transparent text-slate-600'}`}>{t}</button>
        ))}
      </div>
      <div className="mb-4 space-y-2"><Alert>{err}</Alert><Alert type="ok">{ok}</Alert></div>

      {tab === 'Overview' && stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat label="Donors" value={stats.donors} /><Stat label="Receivers" value={stats.receivers} />
          <Stat label="Donations awaiting review" value={stats.pendingDonations} accent={stats.pendingDonations > 0} />
          <Stat label="Requests awaiting review" value={stats.pendingRequests} accent={stats.pendingRequests > 0} />
          <Stat label="Units in stock" value={stats.totalUnits} />
        </div>
      )}

      {tab === 'Donations' && <><Filter />{rows === null ? <p>Loading…</p> : rows.length === 0 ? <Empty>No donations with this status.</Empty> : (
        <div className="space-y-3">{rows.map((d) => (
          <div key={d._id} className="panel flex flex-wrap items-start justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">{d.donor?.name} · <span className="text-blood">{d.bloodGroup}</span> <Badge value={d.status} /></div>
              <div className="text-slate-500">{d.donor?.email} · {d.donor?.phone || 'no phone'}</div>
              <div className="mt-1">Appointment {fmtDate(d.appointmentDate)} · {d.weight} kg · Hb {d.hemoglobin} g/dL</div>
              {d.adminNote && <div className="text-slate-500">Note: {d.adminNote}</div>}
              <div className="mt-1"><FileLink name={d.document} /></div>
            </div>
            <div className="flex gap-2">
              {d.status === 'pending' && <><button className="btn-primary btn btn-sm" onClick={() => act('donations', d._id, 'approve')}>Approve</button><button className="btn-ghost btn btn-sm" onClick={() => act('donations', d._id, 'reject')}>Reject</button></>}
              {d.status === 'approved' && <button className="btn-primary btn btn-sm" onClick={() => act('donations', d._id, 'complete')}>Record collection</button>}
            </div>
          </div>))}</div>)}</>}

      {tab === 'Requests' && <><Filter />{rows === null ? <p>Loading…</p> : rows.length === 0 ? <Empty>No requests with this status.</Empty> : (
        <div className="space-y-3">{rows.map((r) => (
          <div key={r._id} className="panel flex flex-wrap items-start justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">{r.units} × <span className="text-blood">{r.bloodGroup}</span> for {r.patientName} <Badge value={r.urgency} /> <Badge value={r.status} /></div>
              <div className="text-slate-500">{r.hospital}{r.city ? `, ${r.city}` : ''} · needed by {fmtDate(r.requiredBy)}</div>
              <div className="text-slate-500">Requested by {r.receiver?.name} · {r.contactPhone}</div>
              {r.reason && <div className="mt-1">{r.reason}</div>}
              <div className="mt-1"><FileLink name={r.document} /></div>
            </div>
            <div className="flex gap-2">
              {r.status === 'pending' && <><button className="btn-primary btn btn-sm" onClick={() => act('requests', r._id, 'approve')}>Approve</button><button className="btn-ghost btn btn-sm" onClick={() => act('requests', r._id, 'reject')}>Reject</button></>}
              {r.status === 'approved' && <button className="btn-primary btn btn-sm" onClick={() => act('requests', r._id, 'fulfill')}>Issue blood</button>}
            </div>
          </div>))}</div>)}</>}

      {tab === 'Inventory' && rows && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{rows.map((s) => (
          <div key={s.bloodGroup} className="panel">
            <div className="flex items-baseline justify-between"><span className="font-display text-2xl font-extrabold">{s.bloodGroup}</span><span className="text-xs font-semibold">{stockLevel(s.units)}</span></div>
            <div className="mt-3 flex gap-2">
              <input className="input" type="number" min="0" aria-label={`Units of ${s.bloodGroup}`} value={edit[s.bloodGroup] ?? s.units} onChange={(e) => setEdit({ ...edit, [s.bloodGroup]: e.target.value })} />
              <button className="btn-primary btn btn-sm" disabled={edit[s.bloodGroup] === undefined} onClick={() => saveStock(s.bloodGroup)}>Save</button>
            </div>
          </div>))}
        </div>
      )}

      {tab === 'Users' && rows && (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs text-slate-600"><tr>{['Name', 'Email', 'Role', 'Blood', 'City', 'Joined', ''].map((h) => <th key={h} className="px-4 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody>{rows.map((u) => (
              <tr key={u._id} className="border-t border-line">
                <td className="px-4 py-2">{u.name}</td><td className="px-4 py-2">{u.email}</td><td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2">{u.bloodGroup || '–'}</td><td className="px-4 py-2">{u.city || '–'}</td><td className="px-4 py-2">{fmtDate(u.createdAt)}</td>
                <td className="px-4 py-2 text-right">{u.role !== 'admin' && <button className="btn-ghost btn btn-sm" onClick={() => toggle(u)}>{u.active ? 'Deactivate' : 'Activate'}</button>}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
