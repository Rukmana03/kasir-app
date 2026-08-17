import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Alert } from '../components/UI/Alert';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Tembak API Backend
            const response = await axios.post(import.meta.env.VITE_API_BASE_URL + '/auth/login', {
                username: username,
                password: password
            });

            // Jika sukses, simpan token ke LocalStorage
            const { token, role } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);

            // Arahkan ke halaman utama/dashboard
            navigate('/dashboard'); 
            
        } catch (err) {
            // Tangkap pesan error dari backend
            setError(err.response?.data?.message || 'Terjadi kesalahan koneksi ke server.');
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md fade-in">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        {/* Pastikan kamu menaruh file wb.png di folder public/images/logos/ */}
                        <img src="/images/logos/wb.png" alt="Waroeng Bakmi Logo" className="w-16 h-16 slide-up" 
                             onError={(e) => {e.target.style.display='none'}} /* Fallback jika gambar belum ada */
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-800 slide-up">Waroeng Bakmi</h1>
                    <p className="text-neutral-600 mt-2 slide-up">Silakan masuk ke akun Anda</p>
                </div>

                {/* Card Form */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 slide-up">
                    <div className="p-8 text-center">
                        
                        <Alert message={error} />

                        <form onSubmit={handleLogin} className="space-y-6">
                            <Input 
                                label="Username" 
                                id="username" 
                                placeholder="Username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required 
                            />
                            
                            <Input 
                                label="Password" 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />

                            <div className="flex items-center">
                                <input type="checkbox" id="remember" className="h-4 w-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2 transition-all" />
                                <label htmlFor="remember" className="ml-3 text-sm text-neutral-700">Ingat saya</label>
                            </div>

                            <Button type="submit" isLoading={isLoading}>
                                Masuk
                            </Button>
                        </form>

                        <div className="mt-6 text-sm text-neutral-500">
                            Waroeng Bakmi Depok POS System
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}