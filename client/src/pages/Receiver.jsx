import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { Alert, Badge, Empty, FileLink, PageHead, fmtDate } from '../components/ui.jsx';

export default function Receiver() {
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const load = useCallback(() => api.get('/requests/mine').then((r) => setList(r.data)).catch((e) => setErr(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  const cancel = (id) => api.patch(`/requests/${id}/cancel`).then(load).catch((e) => setErr(errMsg(e)));

  return (
    <>
      <PageHead title={`Hello, ${user.name.split(' ')[0]}`}>
        <Link to="/receiver/request" className="btn-primary btn"><Plus size={16} /> New blood request</Link>
      </PageHead>
      <Alert>{err}</Alert>
      <h2 className="mb-3 mt-4 text-xl">Your requests</h2>
      {list === null ? <p className="text-slate-500">Loading…</p> : list.length === 0 ? <Empty>No requests yet. Raise one when a patient needs blood.</Empty> : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r._id} className="panel flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{r.units} unit{r.units > 1 ? 's' : ''} of <span className="text-blood">{r.bloodGroup}</span> for {r.patientName}</div>
                <div className="text-xs text-slate-500">{r.hospital} · needed by {fmtDate(r.requiredBy)}</div>
                {r.adminNote && <div className="mt-1 text-sm text-slate-600">Admin note: {r.adminNote}</div>}
              </div>
              <div className="flex items-center gap-3">
                <FileLink name={r.document} /><Badge value={r.urgency} /><Badge value={r.status} />
                {['pending', 'approved'].includes(r.status) && <button className="btn-ghost btn btn-sm" onClick={() => cancel(r._id)}>Cancel</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
