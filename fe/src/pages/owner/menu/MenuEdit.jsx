import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function MenuEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ nama_menu: '', kategori: '', harga: '', status_menu: 'tersedia' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Ambil data menu saat halaman dimuat
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menu/${id}`, config);
        const data = res.data.data;
        setFormData({
          nama_menu: data.nama_menu,
          kategori: data.kategori || '',
          harga: data.harga,
          status_menu: data.status_menu
        });
      } catch (err) {
        setErrorMessages(['Gagal memuat data menu.']);
      } finally {
        setIsFetching(false);
      }
    };
    fetchMenu();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/menu/${id}`, {
        ...formData,
        harga: Number(formData.harga)
      }, config);
      navigate('/menu');
    } catch (err) {
      setErrorMessages([err.response?.data?.message || 'Gagal update menu.']);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="text-center p-5"><i className="fas fa-spinner fa-spin fa-2x"></i></div>;

  return (
    <div className="container-fluid px-0 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 fw-bold text-primary">Edit Menu</h1>
        <Link to="/menu" className="btn btn-light border rounded-pill"><i className="fas fa-arrow-left me-1"></i>Kembali</Link>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-lg-6">
              <label className="form-label fw-semibold">Nama <span className="text-danger">*</span></label>
              <input type="text" className="form-control" value={formData.nama_menu} onChange={(e) => setFormData({...formData, nama_menu: e.target.value})} required />
            </div>
            <div className="col-lg-6">
              <label className="form-label fw-semibold">Kategori</label>
              <input type="text" className="form-control" value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} />
            </div>
            <div className="col-lg-6">
              <label className="form-label fw-semibold">Harga (Rp) <span className="text-danger">*</span></label>
              <input type="number" className="form-control" value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})} required />
            </div>
            <div className="col-lg-6 d-flex align-items-end">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" checked={formData.status_menu === 'tersedia'} onChange={(e) => setFormData({...formData, status_menu: e.target.checked ? 'tersedia' : 'habis'})} />
                <label className="form-check-label fw-semibold">Aktif</label>
              </div>
            </div>
            <div className="col-12 mt-4">
              <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isLoading}>Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}