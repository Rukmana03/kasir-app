import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function MejaCreate() {
  const navigate = useNavigate();
  
  // State
  const [namaMeja, setNamaMeja] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]);
    
    const trimmedName = namaMeja.trim();
    if (!trimmedName) {
      setErrorMessages(['Nama Meja tidak boleh kosong.']);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(import.meta.env.VITE_API_BASE_URL + '/meja', {
        nomor_meja: trimmedName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/meja');
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.';
      setErrorMessages([errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-circle bg-primary-subtle text-primary" style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', backgroundColor: 'rgba(13,110,253,.12)' }}>
            <i className="fas fa-chair"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">Tambah Meja</h1>
            <div className="text-muted small">Buat entri meja baru untuk area restoran</div>
          </div>
        </div>
        <Link to="/meja" className="btn btn-light border rounded-pill">
          <i className="fas fa-arrow-left me-1"></i>Kembali
        </Link>
      </div>

      {errorMessages.length > 0 && (
        <div className="alert alert-danger border-0 shadow-sm slide-up">
          <strong>Periksa kembali input Anda.</strong>
          <ul className="mb-0 mt-2 small">
            {errorMessages.map((msg, index) => <li key={index}>{msg}</li>)}
          </ul>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ transition: 'transform .2s ease, box-shadow .2s ease' }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="row g-3" noValidate>
            
            <div className="col-md-6">
              <label htmlFor="name" className="form-label fw-semibold">
                Nama Meja <span className="text-danger">*</span>
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light"><i className="fas fa-tag text-muted"></i></span>
                <input 
                  type="text" id="name" className="form-control" 
                  placeholder="Contoh: Meja 1 / VIP A" 
                  value={namaMeja} 
                  onChange={(e) => setNamaMeja(e.target.value)}
                  maxLength="60" required autoComplete="off" autoFocus
                />
              </div>
              <div className="form-text">Maksimal 60 karakter. Gunakan penamaan yang mudah dikenali (mis. "Meja 1", "Terrace-3").</div>
            </div>

            <div className="col-12 d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isLoading}>
                {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Menyimpan...</> : 'Simpan'}
              </button>
              <Link to="/meja" className="btn btn-outline-secondary rounded-pill px-4">Batal</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}