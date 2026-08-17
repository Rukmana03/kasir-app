import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    // Jika tidak ada token (belum login), tendang ke halaman login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Jika role user tidak ada di daftar yang diizinkan untuk halaman ini
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Arahkan ke dashboard standar mereka
        return <Navigate to="/dashboard" replace />;
    }

    // Jika lolos semua, render komponen halamannya (Outlet)
    return <Outlet />;
};