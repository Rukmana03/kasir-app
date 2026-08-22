import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function MejaEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [namaMeja, setNamaMeja] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch data meja spesifik dari backend
  useEffect(() => {
    const fetchMeja = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/meja/${id}`, config);
        setNamaMeja(res.data.data.nomor_meja);
      } catch (err) {
        setErrorMessages(['Gagal memuat data meja.']);
      } finally {
        setIsFetching(false);
      }
    };
    fetchMeja();
  }, [id]);

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
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/meja/${id}`, {
        nomor_meja: trimmedName
      }, config);
      navigate('/meja');
    } catch (err) {
      setErrorMessages([err.response?.data?.message || 'Gagal update meja.']);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="text-center p-5"><i className="fas fa-spinner fa-spin fa-2x text-primary"></i></div>;

  return (
    <div className="container-fluid px-0 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-circle bg-primary-subtle text-primary" style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', backgroundColor: 'rgba(13,110,253,.12)' }}>
            <i className="fas fa-chair"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">Edit Meja</h1>
            <div className="text-muted small">Perbarui informasi nama meja</div>
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

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
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
                  maxLength="60" required autoComplete="off"
                />
              </div>
              <div className="form-text">Maksimal 60 karakter. Gunakan penamaan yang mudah dikenali (mis. "Meja 1", "Terrace-3").</div>
            </div>

            <div className="col-12 d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isLoading}>
                {isLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Memproses...</> : 'Update'}
              </button>
              <Link to="/meja" className="btn btn-outline-secondary rounded-pill px-4">Batal</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}