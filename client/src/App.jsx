import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { useAuth, homeFor } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Donor from './pages/Donor.jsx';
import DonateForm from './pages/DonateForm.jsx';
import Receiver from './pages/Receiver.jsx';
import RequestForm from './pages/RequestForm.jsx';
import Admin from './pages/Admin.jsx';
import Reviews from './pages/Reviews.jsx';

function Guard({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-10 text-center text-slate-500">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/donor" element={<Guard role="donor"><Donor /></Guard>} />
        <Route path="/donor/donate" element={<Guard role="donor"><DonateForm /></Guard>} />
        <Route path="/receiver" element={<Guard role="receiver"><Receiver /></Guard>} />
        <Route path="/receiver/request" element={<Guard role="receiver"><RequestForm /></Guard>} />
        <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
