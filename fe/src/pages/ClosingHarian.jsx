import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClosingHarian() {
  const getTodayLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [date, setDate] = useState(() =>getTodayLocal());
  const [transactions, setTransactions] = useState([]);
  const [closingData, setClosingData] = useState(null);
  
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('userRole') === 'owner';
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Fungsi Tarik Data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Data transaksi tetap ditarik hanya untuk menghitung total yang belum di-closing
      const resTx = await axios.get(`\${import.meta.env.VITE_API_BASE_URL}/transaksi?date=${date}`, axiosConfig);
      const dataTx = Array.isArray(resTx.data.data) ? resTx.data.data : (resTx.data.data?.transactions || []);
      setTransactions(dataTx);

      try {
        const resClosing = await axios.get(`\${import.meta.env.VITE_API_BASE_URL}/closing_harian?date=${date}`, axiosConfig);
        setClosingData(resClosing.data.data);
        setIsClosed(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setClosingData(null);
          setIsClosed(false);
        }
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Fungsi Buat Closing
  const handleBuatClosing = async () => {
    if (window.confirm("Buat closing sekarang? Semua transaksi hari ini akan dikunci.")) {
      try {
        setIsSubmitting(true);
        await axios.post(import.meta.env.VITE_API_BASE_URL + '/closing_harian', { date }, axiosConfig);
        alert("Closing harian berhasil dibuat!");
        fetchData(); 
      } catch (error) {
        alert(error.response?.data?.message || "Gagal melakukan closing.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Fungsi Buka Kembali (Reopen)
  const handleReopen = async () => {
    if (window.confirm("Buka kembali closing hari ini? Transaksi akan diizinkan untuk diubah lagi.")) {
      try {
        setIsSubmitting(true);
        await axios.delete(`\${import.meta.env.VITE_API_BASE_URL}/closing_harian?date=${date}`, axiosConfig);
        alert("Closing berhasil dibuka kembali!");
        fetchData();
      } catch (error) {
        alert("Gagal membuka kembali closing. Pastikan API backend sudah mendukung fitur ini.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Helper Formatter
  const formatRp = (num) => Number(num || 0).toLocaleString('id-ID');
  const formatDate = (dateString) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));
  const isToday = date === getTodayLocal();
  
  // Kalkulasi jika belum closing
  const unclosedSalesTotal = transactions.reduce((sum, t) => sum + Number(t.total_bayar), 0);
  const unclosedTxCount = transactions.length;

  return (
    <div className="container-fluid py-4 fade-in" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      <div className="screen-only">
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="icon-circle bg-primary-subtle text-primary">
              <i className="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <h1 className="h4 fw-bold text-primary mb-1">{isAdmin ? 'Laporan Harian' : 'Closing Harian'}</h1>
              <div className="text-muted d-flex align-items-center mt-1">
                <i className="fas fa-calendar-day me-2"></i>
                {isAdmin ? (
                  <input 
                    type="date" 
                    className="border-0 bg-transparent text-muted p-0 fw-semibold" 
                    style={{ outline: 'none', cursor: 'pointer' }}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                ) : (
                  <span className="fw-semibold">{formatDate(date)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {!isAdmin && isClosed && isToday && (
              <button 
                onClick={handleReopen} 
                disabled={isSubmitting}
                className="btn btn-warning rounded-pill shadow-sm fw-semibold"
              >
                <i className="fas fa-unlock me-2"></i>Buka Kembali (Reopen)
              </button>
            )}
            
            {isClosed && (
              <button onClick={() => window.print()} className="btn btn-primary rounded-pill shadow-sm fw-semibold">
                <i className="fas fa-print me-2"></i>Cetak / Simpan PDF
              </button>
            )}
          </div>
        </div>

        {/* CONTAINER UTAMA */}
        <div className="card border-0 shadow-sm section-card mb-5">
          <div className="card-body p-4">

            <div className="mb-4">
              <span className="badge bg-light text-dark border px-3 py-2" style={{ fontSize: '13px' }}>
                <i className="fas fa-calendar-alt me-2 text-primary"></i>Tanggal: {formatDate(date)}
              </span>
            </div>

            {loading ? (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border text-primary mb-2"></div><br/>Memuat data...
              </div>
            ) : !isClosed ? (
              
              /* STATE: BELUM CLOSING */
              <div className="text-center py-4">
                <div className="p-4 text-muted">
                  <i className="fas fa-circle-info fa-2x mb-3 opacity-50"></i><br/>
                  <h5 className="fw-bold text-dark mb-1">Belum ada closing untuk tanggal ini.</h5>
                  <p className="small text-muted mb-0">Terdapat {unclosedTxCount} transaksi dengan total Rp {formatRp(unclosedSalesTotal)} yang belum dikunci.</p>
                </div>
                <div className="mt-2 d-inline-block">
                  {!isAdmin && (
                    <button 
                      onClick={handleBuatClosing} 
                      disabled={isSubmitting}
                      className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm px-4"
                    >
                      {isSubmitting ? 'Memproses...' : <><i className="fas fa-flag-checkered me-2"></i>Buat Closing Sekarang</>}
                    </button>
                  )}
                </div>
              </div>

            ) : (
              
              /* STATE: SUDAH CLOSING */
              <>
                {/* RINGKASAN KPI */}
                <h2 className="h6 fw-bold mb-3"><i className="fas fa-chart-pie me-2 text-primary"></i>Ringkasan</h2>
                <div className="row g-3 mb-5">
                  <div className="col-6 col-md-3">
                    <div className="mini-card border-0 shadow-sm h-100 section-card">
                      <div className="mini-card-body">
                        <div className="mini-icon text-success"><i className="fas fa-cash-register"></i></div>
                        <div className="mini-title">Jumlah Transaksi</div>
                        <div className="mini-value">{closingData.transactions_count}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="mini-card border-0 shadow-sm h-100 section-card">
                      <div className="mini-card-body">
                        <div className="mini-icon text-primary"><i className="fas fa-wallet"></i></div>
                        <div className="mini-title">Pemasukan</div>
                        <div className="mini-value">Rp {formatRp(closingData.sales_total)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="mini-card border-0 shadow-sm h-100 section-card">
                      <div className="mini-card-body">
                        <div className="mini-icon text-info"><i className="fas fa-water"></i></div>
                        <div className="mini-title">Belanja</div>
                        <div className="mini-value">Rp {formatRp(closingData.wet_spend_total)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="mini-card border-0 shadow-sm h-100 section-card">
                      <div className="mini-card-body">
                        <div className="mini-icon text-warning"><i className="fas fa-balance-scale"></i></div>
                        <div className="mini-title">Total Bersih</div>
                        <div className="mini-value text-warning">Rp {formatRp(closingData.sales_total - (closingData.wet_spend_total || 0))}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* METODE PEMBAYARAN */}
                {closingData.byMethod && closingData.byMethod.length > 0 && (
                  <div className="subcard mb-5">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-circle bg-info-subtle text-info me-2" style={{ width: '36px', height:'36px', fontSize:'15px' }}><i className="fas fa-credit-card"></i></div>
                      <h3 className="h6 fw-bold mb-0">Ringkasan per Metode Pembayaran</h3>
                    </div>
                    <div className="table-responsive border rounded">
                      <table className="table table-hover table-sm align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-3 py-2">Metode</th>
                            <th className="text-end py-2">Jumlah Transaksi</th>
                            <th className="text-end py-2">Subtotal</th>
                            <th className="text-end pe-3 py-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {closingData.byMethod.map((m, idx) => (
                            <tr key={idx}>
                              <td className="ps-3"><span className={`badge ${m.method === 'cash' ? 'bg-success' : 'bg-primary'}`}>{m.method.toUpperCase()}</span></td>
                              <td className="text-end">{m.count}</td>
                              <td className="text-end">Rp {formatRp(m.total)}</td>
                              <td className="text-end pe-3 fw-bold">Rp {formatRp(m.total)}</td>
                            </tr>
                          ))}
                          <tr className="fw-bold table-light">
                            <td className="ps-3 py-2">Total Harian</td>
                            <td className="text-end py-2">{closingData.transactions_count}</td>
                            <td className="text-end py-2">Rp {formatRp(closingData.sales_total)}</td>
                            <td className="text-end pe-3 py-2">Rp {formatRp(closingData.sales_total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* DETAIL BELANJA */}
                {closingData.wet_spend && Object.keys(closingData.wet_spend).length > 0 && (
                  <div className="subcard mb-5">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-circle bg-primary-subtle text-primary me-2" style={{ width: '36px', height:'36px', fontSize:'15px' }}><i className="fas fa-water"></i></div>
                      <h3 className="h6 fw-bold mb-0">Detail Belanja</h3>
                    </div>
                    <div className="table-responsive border rounded">
                      <table className="table table-hover table-sm mb-0">
                        <thead className="table-light"><tr><th className="ps-3 py-2">Item</th><th className="text-end pe-3 py-2">Biaya</th></tr></thead>
                        <tbody>
                          {Object.entries(closingData.wet_spend).map(([name, cost], idx) => (
                            <tr key={idx}><td className="ps-3">{name}</td><td className="text-end pe-3">Rp {formatRp(cost)}</td></tr>
                          ))}
                          <tr className="fw-bold table-light">
                            <td className="ps-3 py-2">Total Belanja</td>
                            <td className="text-end pe-3 py-2 text-danger">Rp {formatRp(closingData.wet_spend_total)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ITEM TERJUAL */}
                <div className="subcard">
                  <div className="d-flex align-items-center mb-3">
                    <div className="icon-circle bg-success-subtle text-success me-2" style={{ width: '36px', height:'36px', fontSize:'15px' }}><i className="fas fa-basket-shopping"></i></div>
                    <h3 className="h6 fw-bold mb-0">Item Terjual</h3>
                  </div>
                  <div className="table-responsive table-scroll border rounded">
                    <table className="table table-hover table-sm align-middle mb-0">
                      <thead className="table-light sticky-top">
                        <tr><th className="ps-3 py-2">Item</th><th className="text-end pe-3 py-2" style={{ width: '120px' }}>Qty</th></tr>
                      </thead>
                      <tbody>
                        {closingData.items_sold && Object.keys(closingData.items_sold).length > 0 ? (
                          Object.entries(closingData.items_sold).map(([name, qty], idx) => (
                            <tr key={idx}><td className="ps-3 fw-semibold text-secondary">{name}</td><td className="text-end pe-3"><span className="badge bg-light border text-dark">{qty}</span></td></tr>
                          ))
                        ) : (
                          <tr><td colSpan="2" className="text-center text-muted py-3">Belum ada data item terjual.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAMPILAN CETAK PDF (Bersih Tanpa Rincian Transaksi) */}
      {/* ========================================================= */}
      {isClosed && closingData && (
        <div className="print-only">
          <div className="print-header">
            <h1>{isAdmin ? 'Laporan Harian' : 'Closing Harian'} — {formatDate(date)}</h1>
          </div>
          <div className="print-container">
            <h2 className="print-title">Ringkasan</h2>
            <table className="print-table mb-4">
              <tbody>
                <tr><th>Tanggal</th><td>{formatDate(date)}</td></tr>
                <tr><th>Jumlah Transaksi</th><td>{closingData.transactions_count}</td></tr>
                <tr><th>Pemasukan</th><td>Rp {formatRp(closingData.sales_total)}</td></tr>
                <tr><th>Belanja</th><td>Rp {formatRp(closingData.wet_spend_total)}</td></tr>
                <tr><th>Total Bersih</th><td><strong>Rp {formatRp(closingData.sales_total - (closingData.wet_spend_total || 0))}</strong></td></tr>
              </tbody>
            </table>
            
            {closingData.byMethod && closingData.byMethod.length > 0 && (
              <>
                <h2 className="print-title">Ringkasan per Metode Pembayaran</h2>
                <table className="print-table mb-4">
                  <thead><tr><th>Metode</th><th className="text-end">Jumlah</th><th className="text-end">Total</th></tr></thead>
                  <tbody>
                    {closingData.byMethod.map((m, idx) => (
                      <tr key={idx}><td>{m.method.toUpperCase()}</td><td className="text-end">{m.count}</td><td className="text-end"><strong>Rp {formatRp(m.total)}</strong></td></tr>
                    ))}
                    <tr className="fw-bold" style={{ backgroundColor: '#fafafa' }}>
                      <td>Total Harian</td><td className="text-end">{closingData.transactions_count}</td><td className="text-end"><strong>Rp {formatRp(closingData.sales_total)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}

            {closingData.wet_spend && Object.keys(closingData.wet_spend).length > 0 && (
              <>
                <h2 className="print-title">Detail Belanja</h2>
                <table className="print-table mb-4">
                  <thead><tr><th>Item</th><th className="text-end">Biaya</th></tr></thead>
                  <tbody>
                    {Object.entries(closingData.wet_spend).map(([name, cost], idx) => (
                      <tr key={idx}><td>{name}</td><td className="text-end">Rp {formatRp(cost)}</td></tr>
                    ))}
                    <tr className="fw-bold" style={{ backgroundColor: '#fafafa' }}>
                      <td>Total Belanja</td><td className="text-end"><strong>Rp {formatRp(closingData.wet_spend_total)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
            
            {/* Rincian Transaksi dihapus dari cetakan PDF juga */}
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        /* --- STYLE LAYAR --- */
        .section-card { transition: transform .25s ease, box-shadow .25s ease; border-radius: 16px; }
        .section-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.09); }
        .icon-circle { width: 44px; height: 44px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-size: 18px; }
        .table-scroll { max-height: 52vh; overflow: auto; }
        .table thead.sticky-top { top: 0; z-index: 5; background-color: #f8f9fa; }
        .table-hover tbody tr:hover { background: #f6f9ff; }
        .mini-card { background: #fff; border-radius: 14px; border: 1px solid #eee !important; }
        .mini-card .mini-card-body { padding: 16px; }
        .mini-icon { font-size: 20px; margin-bottom: 6px; }
        .mini-title { font-size: .8rem; color: #6c757d; }
        .mini-value { font-size: 1.05rem; font-weight: 700; }
        .bg-primary-subtle { background: rgba(13,110,253,.12); }
        .bg-success-subtle { background: rgba(25,135,84,.12); }
        .bg-warning-subtle { background: rgba(255,193,7,.18); }
        .bg-info-subtle { background: rgba(13,202,240,.15); }
        .text-bg-secondary { background-color: #6c757d; color: white; }
        .print-only { display: none; }

        /* --- STYLE CETAK PDF --- */
        @media print {
          @page { margin: 15mm; size: auto; }
          body { background: white !important; font-family: system-ui, -apple-system, sans-serif !important; }
          .screen-only, nav, header, .navbar { display: none !important; }
          .print-only { display: block !important; width: 100%; color: black; }
          .print-header { border-bottom: 1px solid #dcdcdc; padding-bottom: 10px; margin-bottom: 20px; }
          .print-header h1 { font-size: 18px; margin: 0; font-weight: 600; }
          .print-title { font-size: 16px; margin-bottom: 8px; margin-top: 20px; font-weight: 600; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .print-table th, .print-table td { border: 1px solid #dcdcdc; padding: 8px; vertical-align: top; }
          .print-table th { background-color: #fafafa; text-align: left; }
        }
      `}</style>
    </div>
  );
}