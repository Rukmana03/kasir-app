import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { ProtectedRoute } from './components/guard/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import MenuIndex from './pages/owner/menu/MenuIndex';
import MenuCreate from './pages/owner/menu/MenuCreate';
import MenuEdit from './pages/owner/menu/MenuEdit';
import MejaIndex from './pages/owner/meja/MejaIndex';
import MejaCreate from './pages/owner/meja/MejaCreate';
import MejaEdit from './pages/owner/meja/MejaEdit';
import BahanIndex from './pages/owner/bahan/BahanIndex';
import BelanjaIndex from './pages/owner/belanja/BelanjaIndex';
import KasirDashboard from './pages/kasir/KasirDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import KasirMenu from './pages/kasir/KasirMenu';
import KasirConfirm from './pages/kasir/KasirConfirm';
import KasirReceipt from './pages/kasir/KasirReceipt';
import RiwayatTransaksi from './pages/RiwayatTransaksi';
import ClosingHarian from './pages/ClosingHarian';
import LaporanBulanan from './pages/LaporanBulanan';

const DashboardRouter = () => {
    const role = localStorage.getItem('userRole'); // Ambil role dari storage
    // Jika owner, beri OwnerDashboard. Jika bukan, beri KasirDashboard
    return role === 'owner' ? <OwnerDashboard /> : <KasirDashboard />;
};
// Komponen sementara untuk Dashboard sebelum kita buat yang asli
const DummyPage = ({ title }) => (
    <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm slide-up">
        <h1 className="text-2xl font-bold text-neutral-800 mb-4">{title}</h1>
        <p className="text-neutral-600">Ini adalah halaman {title.toLowerCase()}. Konten asli akan segera dibangun di sini.</p>
    </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Rute yang Dibungkus Navbar (MainLayout) */}
        <Route element={<MainLayout />}>
            
            {/* Rute untuk Owner DAN Kasir */}
            <Route element={<ProtectedRoute allowedRoles={['owner', 'kasir']} />}>

                <Route path="/dashboard" element={<DashboardRouter />} />

                <Route path="/kasir/menu" element={<KasirMenu />} />
                <Route path="/kasir/confirm" element={<KasirConfirm />} />
                <Route path="/kasir/receipt" element={<KasirReceipt />} />

                <Route path="/closing" element={<ClosingHarian />} />
                <Route path="/laporan" element={<LaporanBulanan />} />
                <Route path="/pos" element={<DummyPage title="Kasir / POS" />} />
                <Route path="/transaksi" element={<RiwayatTransaksi />} />
            </Route>

            {/* Rute KHUSUS Owner */}
            <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
                <Route path="/belanja" element={<BelanjaIndex />} />
                <Route path="/bahan" element={<BahanIndex />} />

                <Route path="/menu" element={<MenuIndex />} />
                <Route path="/menu/create" element={<MenuCreate />} />
                <Route path="/menu/edit/:id" element={<MenuEdit />} />
                
                <Route path="/meja" element={<MejaIndex />} />
                <Route path="/meja/create" element={<MejaCreate />} />
                <Route path="/meja/edit/:id" element={<MejaEdit />} />
            </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;