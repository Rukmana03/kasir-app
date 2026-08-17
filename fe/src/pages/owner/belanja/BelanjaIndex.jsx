import { useState, useEffect } from 'react';
import axios from 'axios';
import KalkulatorBelanja from './KalkulatorBelanja';

export default function BelanjaIndex() {
  const [bahan, setBahan] = useState([]);
  const [rekomendasi, setRekomendasi] = useState([]);
  const [logBelanja, setLogBelanja] = useState([]);
  const [logPengambilan, setLogPengambilan] = useState([]);
  
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  // State untuk tanggal target Rekomendasi (Default: Besok untuk persiapan)
  const besok = new Date(now);
  besok.setDate(besok.getDate() + 1);
  const tglBesok = `${besok.getFullYear()}-${String(besok.getMonth() + 1).padStart(2, '0')}-${String(besok.getDate()).padStart(2, '0')}`;
  
  const [targetDate, setTargetDate] = useState(tglBesok);
  const [loadingPrediksi, setLoadingPrediksi] = useState(false);

  const [formBelanja, setFormBelanja] = useState({ id_bahan: '', qty: '', total_biaya: '', tanggal: today });
  const [loadingBelanja, setLoadingBelanja] = useState(false);
  const [formPengambilan, setFormPengambilan] = useState({ id_bahan: '', qty: '', catatan: '', tanggal: today });
  const [loadingPengambilan, setLoadingPengambilan] = useState(false);

  const [filterBelanja, setFilterBelanja] = useState(today);
  const [filterPengambilan, setFilterPengambilan] = useState(today);
  const [alert, setAlert] = useState(null);
  
  const currentMonth = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
  const currentTime = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date());

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchMasterBahan();
    fetchDrafRekomendasi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]); // Akan fetch draf tiap tanggal kalender diubah

  useEffect(() => { fetchLogBelanja(); }, [filterBelanja]);
  useEffect(() => { fetchLogPengambilan(); }, [filterPengambilan]);

  const fetchMasterBahan = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/bahan', axiosConfig);
      setBahan(res.data.data || []);
    } catch (error) { console.error("Gagal memuat master bahan"); }
  };

  // Membaca draf rekomendasi yang sudah tersimpan di database untuk tanggal tersebut
  const fetchDrafRekomendasi = async () => {
    try {
      const res = await axios.get(`\${import.meta.env.VITE_API_BASE_URL}/rekomendasi/draf?tanggal=${targetDate}`, axiosConfig);
      setRekomendasi(res.data.data || []);
    } catch (error) { console.error("Gagal memuat draf rekomendasi"); }
  };

  // Menjalankan Algoritma JIT Forecasting di Backend!
  const handleHitungPrediksi = async () => {
    setLoadingPrediksi(true);
    try {
      const res = await axios.get(`\${import.meta.env.VITE_API_BASE_URL}/rekomendasi/generate?tanggal=${targetDate}`, axiosConfig);
      setRekomendasi(res.data.data || []);
      showAlert('success', `Prediksi untuk tanggal ${targetDate} berhasil dikalkulasi!`);
    } catch (error) {
      showAlert('danger', 'Gagal memproses algoritma prediksi.');
    } finally {
      setLoadingPrediksi(false);
    }
  };

  const fetchLogBelanja = async () => {
    try {
      const res = await axios.get(`\${import.meta.env.VITE_API_BASE_URL}/belanja_bahan?tanggal=${filterBelanja}`, axiosConfig);
      setLogBelanja(res.data.data || []);
    } catch (error) {}
  };

  const fetchLogPengambilan = async () => {
    try {
      const res = await axios.get(`\${import.meta.env.VITE_API_BASE_URL}/penggunaan_stok?tanggal=${filterPengambilan}`, axiosConfig);
      setLogPengambilan(res.data.data || []);
    } catch (error) {}
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleBelanja = async (e) => {
    e.preventDefault();
    setLoadingBelanja(true);
    try {
      await axios.post(import.meta.env.VITE_API_BASE_URL + '/belanja_bahan', {
        id_bahan: Number(formBelanja.id_bahan),
        jumlah_belanja: Number(formBelanja.qty),
        harga_satuan: Number(formBelanja.total_biaya) / Number(formBelanja.qty),
        tanggal_belanja: formBelanja.tanggal
      }, axiosConfig);
      showAlert('success', 'Berhasil mencatat belanja & stok bertambah.');
      setFormBelanja({ id_bahan: '', qty: '', total_biaya: '', tanggal: today });
      fetchMasterBahan(); fetchLogBelanja(); fetchDrafRekomendasi();
    } catch (err) { showAlert('danger', 'Gagal mencatat pembelanjaan.'); } 
    finally { setLoadingBelanja(false); }
  };

  const handlePengambilan = async (e) => {
    e.preventDefault();
    setLoadingPengambilan(true);
    try {
      await axios.post(import.meta.env.VITE_API_BASE_URL + '/penggunaan_stok', {
        id_bahan: Number(formPengambilan.id_bahan),
        jumlah_pakai: Number(formPengambilan.qty),
        keterangan: formPengambilan.catatan,
        tanggal_penggunaan: formPengambilan.tanggal
      }, axiosConfig);
      showAlert('success', 'Berhasil mencatat pengambilan & stok berkurang.');
      setFormPengambilan({ id_bahan: '', qty: '', catatan: '', tanggal: today });
      fetchMasterBahan(); fetchLogPengambilan(); fetchDrafRekomendasi();
    } catch (err) { showAlert('danger', 'Gagal mencatat pengambilan.'); } 
    finally { setLoadingPengambilan(false); }
  };

  return (
    <div className="container-fluid px-0 fade-in">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 fw-bold text-primary mb-1"><i className="fas fa-boxes-stacked me-2"></i>Belanja & Restock</h1>
          <p className="text-muted mb-0">Catat pembelanjaan, pengambilan bahan, dan pantau stok</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-white text-dark px-3 py-2 border shadow-sm"><i className="fas fa-calendar-alt me-2 text-primary"></i>{currentMonth}</span>
          <span className="badge bg-primary px-3 py-2 shadow-sm"><i className="fas fa-clock me-2"></i>{currentTime} WIB</span>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} border-0 shadow-sm alert-dismissible fade show slide-up`}>
          <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>{alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-5">
          {/* PANEL REKOMENDASI CERDAS DENGAN KALENDER (DIUPDATE) */}
          <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ transition: 'transform .25s ease' }}>
            <div className="card-body p-4 bg-primary-subtle rounded-4" style={{ backgroundColor: 'rgba(13,110,253,.05)' }}>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center">
                  <div className="icon-circle bg-primary text-white me-3" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-robot"></i>
                  </div>
                  <div>
                    <h2 className="h6 mb-0 fw-bold text-primary">AI Prediksi Belanja</h2>
                    <small className="text-muted">Pilih tanggal untuk memprediksi</small>
                  </div>
                </div>
              </div>

              {/* Input Tanggal & Tombol Hitung */}
              <div className="d-flex gap-2 mb-3">
                <input 
                  type="date" 
                  className="form-control fw-semibold" 
                  value={targetDate} 
                  onChange={(e) => setTargetDate(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleHitungPrediksi} disabled={loadingPrediksi}>
                  {loadingPrediksi ? <span className="spinner-border spinner-border-sm"></span> : 'Hitung'}
                </button>
              </div>
              
              {rekomendasi.length === 0 ? (
                <div className="text-center p-3 bg-white rounded-3 border">
                  <i className="fas fa-check-circle text-success mb-2 fs-4"></i>
                  <p className="mb-0 small text-muted">Tidak ada peringatan belanja untuk tanggal ini.</p>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {rekomendasi.map(r => {
                    const stok = r.bahan?.stok || 0;
                    const satuan = r.bahan?.satuan || '';
                    const namaBahan = r.bahan?.nama_bahan || '';
                    const butuh = r.kebutuhan || 0;
                    const kurang = r.kurang || 0;

                    let pesan = "";
                    if (stok <= 0) {
                      pesan = `Stok Habis! Beli ${butuh} ${satuan}`;
                    } else {
                      pesan = `Butuh ${butuh} ${satuan}, Kurang ${kurang} ${satuan}`;
                    }

                    return (
                      <span key={r.id_bahan} className="badge bg-danger text-white p-2 border border-danger text-start lh-base">
                        <i className="fas fa-exclamation-triangle me-1"></i> 
                        {namaBahan} <br/><small className="fw-normal">({pesan})</small>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Form Input Belanja Harian */}
          <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-success-subtle text-success me-3" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(25,135,84,.12)' }}>
                  <i className="fas fa-cart-shopping"></i>
                </div>
                <div>
                  <h2 className="h6 mb-0 fw-bold">Input Belanja Harian</h2>
                  <small className="text-muted">Catat uang keluar & tambah stok</small>
                </div>
              </div>

              <form onSubmit={handleBelanja} className="row g-3">
                <div className="col-md-7">
                  <label className="form-label small text-muted mb-1">Pilih Bahan</label>
                  <select className="form-select form-select-sm" value={formBelanja.id_bahan} onChange={e => setFormBelanja({...formBelanja, id_bahan: e.target.value})} required>
                    <option value="">— Pilih bahan —</option>
                    {bahan.map(b => <option key={b.id_bahan} value={b.id_bahan}>{b.nama_bahan} ({b.satuan})</option>)}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label small text-muted mb-1">Tanggal</label>
                  <input type="date" className="form-control form-control-sm" value={formBelanja.tanggal} onChange={e => setFormBelanja({...formBelanja, tanggal: e.target.value})} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted mb-1">Qty (Jumlah Beli)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light"><i className="fas fa-boxes-stacked text-muted"></i></span>
                    <input type="number" step="0.01" className="form-control" value={formBelanja.qty} onChange={e => setFormBelanja({...formBelanja, qty: e.target.value})} placeholder="0.00" required />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted mb-1">Total Biaya (Rp)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">Rp</span>
                    <input type="number" className="form-control" value={formBelanja.total_biaya} onChange={e => setFormBelanja({...formBelanja, total_biaya: e.target.value})} placeholder="0" required />
                  </div>
                </div>
                <div className="col-12 mt-3">
                  <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold" disabled={loadingBelanja}>
                    {loadingBelanja ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-save me-2"></i>} Simpan Belanja
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Form Catat Pengambilan */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-warning-subtle text-warning me-3" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,193,7,.18)' }}>
                  <i className="fas fa-hand-holding"></i>
                </div>
                <div>
                  <h2 className="h6 mb-0 fw-bold">Catat Pengambilan</h2>
                  <small className="text-muted">Kurangi stok secara manual (pemakaian)</small>
                </div>
              </div>

              <form onSubmit={handlePengambilan} className="row g-3">
                <div className="col-md-7">
                  <label className="form-label small text-muted mb-1">Pilih Bahan</label>
                  <select className="form-select form-select-sm" value={formPengambilan.id_bahan} onChange={e => setFormPengambilan({...formPengambilan, id_bahan: e.target.value})} required>
                    <option value="">— Pilih bahan —</option>
                    {bahan.map(b => <option key={b.id_bahan} value={b.id_bahan}>{b.nama_bahan} (Stok: {b.stok || 0} {b.satuan})</option>)}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label small text-muted mb-1">Tanggal</label>
                  <input type="date" className="form-control form-control-sm" value={formPengambilan.tanggal} onChange={e => setFormPengambilan({...formPengambilan, tanggal: e.target.value})} required />
                </div>
                <div className="col-md-5">
                  <label className="form-label small text-muted mb-1">Qty (Diambil)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light"><i className="fas fa-minus text-muted"></i></span>
                    <input type="number" step="0.01" className="form-control" value={formPengambilan.qty} onChange={e => setFormPengambilan({...formPengambilan, qty: e.target.value})} placeholder="0.00" required />
                  </div>
                </div>
                <div className="col-md-7">
                  <label className="form-label small text-muted mb-1">Catatan (opsional)</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light"><i className="fas fa-sticky-note text-muted"></i></span>
                    <input type="text" className="form-control" value={formPengambilan.catatan} onChange={e => setFormPengambilan({...formPengambilan, catatan: e.target.value})} placeholder="Misal: Stok harian" />
                  </div>
                </div>
                <div className="col-12 mt-3">
                  <button type="submit" className="btn btn-warning w-100 rounded-pill fw-bold text-dark" disabled={loadingPengambilan}>
                    {loadingPengambilan ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-clipboard-check me-2"></i>} Catat Pengambilan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-info-subtle text-info me-3" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,202,240,.15)' }}>
                  <i className="fas fa-list-ul"></i>
                </div>
                <h2 className="h6 mb-0 fw-bold">Monitoring Stok Aktual</h2>
              </div>
              <div className="table-responsive" style={{ maxHeight: '40vh', overflow: 'auto' }}>
                <table className="table table-sm align-middle table-hover">
                  <thead className="table-light sticky-top shadow-sm">
                    <tr>
                      <th style={{ minWidth: '180px' }}>Bahan</th>
                      <th>Kategori</th>
                      <th className="text-end" style={{ minWidth: '100px' }}>Sisa Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bahan.length === 0 ? (
                      <tr><td colSpan="3" className="text-center text-muted py-4">Belum ada data bahan.</td></tr>
                    ) : (
                      bahan.map(b => {
                        // Cek apakah bahan ini masuk dalam daftar rekomendasi belanja
                        const isKritis = rekomendasi.some(r => r.id_bahan === b.id_bahan);
                        return (
                          <tr key={b.id_bahan}>
                            <td className="fw-semibold text-dark">{b.nama_bahan}</td>
                            <td>
                              <span className={`badge ${b.jenis_bahan === 'kering' ? 'bg-warning' : 'bg-info'} text-dark border`}>
                                {b.jenis_bahan}
                              </span>
                            </td>
                            <td className={`text-end fw-bold ${isKritis ? 'text-danger' : 'text-success'}`}>
                              {b.stok || 0} <span className="text-muted fw-normal fs-7">{b.satuan}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-receipt text-success me-2 fs-5"></i>
                      <h2 className="h6 mb-0 fw-bold">Riwayat Belanja</h2>
                    </div>
                    <input type="date" className="form-control form-control-sm w-auto bg-light border-0" value={filterBelanja} onChange={(e) => setFilterBelanja(e.target.value)} />
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '30vh', overflow: 'auto' }}>
                    <table className="table table-sm align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Bahan</th>
                          <th className="text-end">Qty</th>
                          <th className="text-end">Biaya</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logBelanja.length === 0 ? (
                          <tr><td colSpan="3" className="text-center text-muted py-4 small"><i className="fas fa-box-open mb-2 d-block fs-3"></i>Kosong</td></tr>
                        ) : (
                          logBelanja.map((log, i) => (
                            <tr key={i}>
                              <td className="small fw-semibold">{log.bahan?.nama_bahan}</td>
                              <td className="small text-end text-success">+{log.jumlah_belanja}</td>
                              <td className="small text-end">Rp {log.total_belanja}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-outdent text-warning me-2 fs-5"></i>
                      <h2 className="h6 mb-0 fw-bold">Riwayat Pakai</h2>
                    </div>
                    <input type="date" className="form-control form-control-sm w-auto bg-light border-0" value={filterPengambilan} onChange={(e) => setFilterPengambilan(e.target.value)} />
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '30vh', overflow: 'auto' }}>
                    <table className="table table-sm align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Bahan</th>
                          <th className="text-end">Qty</th>
                          <th className="text-end">Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logPengambilan.length === 0 ? (
                          <tr><td colSpan="3" className="text-center text-muted py-4 small"><i className="fas fa-box-open mb-2 d-block fs-3"></i>Kosong</td></tr>
                        ) : (
                          logPengambilan.map((log, i) => (
                            <tr key={i}>
                              <td className="small fw-semibold">{log.bahan?.nama_bahan}</td>
                              <td className="small text-end text-danger">-{log.jumlah_pakai}</td>
                              <td className="small text-muted text-truncate text-end" style={{ maxWidth: '80px' }} title={log.keterangan}>{log.keterangan || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <KalkulatorBelanja />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}