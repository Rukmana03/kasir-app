import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const MainLayout = () => {
    const navigate = useNavigate();
    
    // Ambil role dan nama dari LocalStorage
    const role = localStorage.getItem('userRole'); 
    const isAdmin = role === 'owner'; // Cek apakah dia owner/admin

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(import.meta.env.VITE_API_BASE_URL + '/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error logout", error);
        } finally {
            localStorage.clear();
            navigate('/login');
        }
    };

    return (
        <div style={{ background: 'var(--light-bg)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            {/* NAVBAR BOOTSTRAP CUSTOM */}
            <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
                <div className="container-fluid">
                    
                    <NavLink className="navbar-brand" to="/dashboard">
                        <img src="/images/logos/wb.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} onError={(e) => {e.target.style.display='none'}} />
                        <span>WAROENG BAKMI</span>
                    </NavLink>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="nav">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            
                            {/* Menu Kasir (HANYA UNTUK KASIR) */}
                            {!isAdmin && (
                                <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/dashboard">
                                        <i className="fas fa-cash-register nav-icon"></i>Kasir
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/transaksi">
                                        <i className="fas fa-list-check nav-icon"></i>Transaksi
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/closing">
                                        <i className="fas fa-file-invoice-dollar nav-icon"></i>Closing Harian
                                    </NavLink>
                                </li>
                            </>
                            )}

                            {/* Menu Kelola (HANYA UNTUK OWNER, Menggantikan Kasir) */}
                            {isAdmin && (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/transaksi">
                                            <i className="fas fa-list-check nav-icon"></i>Transaksi
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link px-3" to="/closing">
                                            <i className="fas fa-file-invoice-dollar nav-icon me-1"></i>Laporan Harian
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link px-2" to="/belanja">
                                            <i className="fas fa-tint nav-icon me-1"></i>Belanja
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link px-2" to="/laporan">
                                            <i className="fas fa-chart-line me-2 nav-icon"></i>Laporan Bulanan
                                        </NavLink>
                                    </li>
                                </>
                            )}
                            {/* Menu Stock & Laporan (HANYA UNTUK OWNER) */}
                            {isAdmin && (
                                <>
                                    {/* <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fas fa-boxes nav-icon"></i>Stock
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li><NavLink className="dropdown-item" to="/belanja"><i className="fas fa-tint"></i>Belanja</NavLink></li>
                                        </ul>
                                    </li> */}

                                    {/* <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                                            <i className="fas fa-file-alt nav-icon"></i> Laporan
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li><NavLink className="dropdown-item" to="/closing"><i className="fas fa-calendar-day"></i> Laporan Harian</NavLink></li>
                                            <li><NavLink className="dropdown-item" to="/laporan"><i className="fas fa-chart-line text-muted"></i> Laporan Bulanan</NavLink></li>
                                        </ul>
                                    </li> */}
                                </>
                            )}
                        </ul>

                        {/* RIGHT NAVBAR (USER MENU) */}
                        <div className="d-flex align-items-center gap-3">
                            <div className="dropdown">
                                <button className="btn user-menu-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fas fa-user-circle"></i>
                                    {isAdmin ? 'Owner' : 'Kasir'}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {/* <li>
                                        <button className="dropdown-item" onClick={() => alert('Fitur Print belum tersedia')}>
                                            <i className="fas fa-print"></i> Test Print
                                        </button>
                                    </li> */}
                                    {isAdmin && (
                                        <>
                                    <li>
                                        <button className="dropdown-item" onClick={() => navigate('/menu')}>
                                            <i className="fas fa-utensils me-2 text-muted"></i>Menu
                                        </button>
                                    </li>
                                    <li>
                                        <button className="dropdown-item" onClick={() => navigate('/meja')}>
                                            <i className="fas fa-table me-2 text-muted"></i>Meja
                                        </button>
                                    </li>
                                    <li>
                                        <button className="dropdown-item" onClick={() => navigate('/bahan')}>
                                            <i className="fas fa-cubes me-2 text-muted"></i>Bahan
                                        </button>
                                    </li>
                                    </>
                                    )}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button onClick={handleLogout} className="dropdown-item text-danger d-flex align-items-center gap-2">
                                            <i className="fas fa-sign-out-alt"></i> Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* TEMPAT KONTEN HALAMAN (MENGGANTIKAN @yield('content')) */}
            <main className="container main-container my-4 fade-in">
                <Outlet />
            </main>

        </div>
    );
};