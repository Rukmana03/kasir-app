import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function KasirConfirm() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderData = location.state;

  useEffect(() => {
    if (!orderData || !orderData.cart) {
      navigate('/dashboard');
    }
  }, [orderData, navigate]);

  const [paymentMethod, setPaymentMethod] = useState(orderData?.paymentMethod || 'cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waktu, setWaktu] = useState(
    new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date())
  );
  
  const [uangDiterima, setUangDiterima] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setWaktu(new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!orderData) return null;

  // Kalkulasi Dasar
  const cart = orderData.cart;
  const subtotal = orderData.subtotal;
//   const tax = 0; 
//   const discount = 0;
//   const grandTotal = subtotal + tax - discount;

  // LOGIKA KALKULASI KEMBALIAN
  const kembalian = paymentMethod === 'cash' ? (Number(uangDiterima) - subtotal) : 0;
  const isUangKurang = paymentMethod === 'cash' && Number(uangDiterima) > 0 && kembalian < 0;
  const isSubmitDisabled = isSubmitting || (paymentMethod === 'cash' && (Number(uangDiterima) < subtotal));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsSubmitting(true);

    try {
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : {};
        
      const payload = {
        id_user: user?.id_user || user?.id || 1,
        id_meja: orderData.tipePesanan === 'Takeaway' ? null : orderData.id_meja,
        jenis_transaksi: orderData.tipePesanan,
        nama_pelanggan: orderData.customer_name,
        metode_pembayaran: paymentMethod,
        total_bayar: subtotal,
        
        uang_diterima: paymentMethod === 'cash' ? Number(uangDiterima) : subtotal,
        kembalian: kembalian > 0 ? kembalian : 0,

        items: cart.map(item => ({
          id_menu: item.id_menu,
          jumlah: item.qty,
          harga: item.harga,
          catatan: item.notes,
          subtotal: item.total
        }))
      };

      // 1. AMBIL TOKEN UNTUK OTORISASI
      const token = localStorage.getItem('token');
      
      // 2. TEMBAK DATA KE API BACKEND TRANSAKSI
      // Pastikan endpoint ini sesuai dengan route di backend Anda (misal: /api/transaksi)
      const res = await axios.post(import.meta.env.VITE_API_BASE_URL + '/transaksi', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (orderData.id_meja && orderData.tipePesanan !== 'Takeaway') {
        try {
          await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/meja/${orderData.id_meja}/status`, {
            status_meja: 'Terisi'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error("Gagal mengupdate status meja menjadi Terisi:", error);
        }
      }

      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/kasir/receipt', { 
          state: { 
            ...orderData, 
            paymentMethod, 
            grandTotal: subtotal,
            uangDiterima: payload.uang_diterima, 
            kembalian: payload.kembalian,        
            waktuSelesai: new Date().toISOString(),
            id_transaksi_real: res.data.data?.id_transaksi
          } 
        });
      }, 1000);

    } catch (error) {
      console.error("Gagal menyimpan transaksi", error);
      const errorMsg = error.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran atau koneksi ke server terputus!";
      alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid py-4 fade-in" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 fw-bold text-primary mb-1">
            <i className="fas fa-clipboard-check me-2"></i>Konfirmasi Pesanan
          </h1>
          <p className="text-muted mb-0">Periksa kembali pesanan sebelum checkout</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-white text-dark px-3 py-2 border shadow-sm fs-6">
            <i className="fas fa-clock me-2 text-primary"></i>{waktu} WIB
          </span>
          <span className="badge bg-primary px-3 py-2 shadow-sm fs-6">
            #{orderData.draftId}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* ================= KIRI: RINGKASAN PESANAN ================= */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="card-header bg-primary text-white border-0 py-3 px-4">
              <div className="d-flex align-items-center">
                <i className="fas fa-receipt me-2 fs-5"></i>
                <h5 className="mb-0 fw-bold">Ringkasan Pesanan</h5>
              </div>
            </div>
            
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 py-3 ps-4"><i className="fas fa-utensils me-2 text-muted"></i>Item</th>
                      <th className="border-0 py-3 text-center"><i className="fas fa-sort-numeric-up me-2 text-muted"></i>Qty</th>
                      <th className="border-0 py-3 text-end"><i className="fas fa-tag me-2 text-muted"></i>Harga</th>
                      <th className="border-0 py-3 text-end pe-4"><i className="fas fa-calculator me-2 text-muted"></i>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx} className="item-row">
                        <td className="py-3 ps-4">
                          <div className="fw-semibold text-dark">{item.nama_menu}</div>
                          {item.notes && (
                            <small className="text-primary fw-medium"><i className="fas fa-sticky-note me-1"></i>{item.notes}</small>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge bg-light text-dark px-3 py-2 rounded-pill shadow-sm border">
                            {item.qty}
                          </span>
                        </td>
                        <td className="py-3 text-end">
                          <span className="text-muted">Rp {item.harga.toLocaleString('id-ID')}</span>
                        </td>
                        <td className="py-3 text-end pe-4">
                          <span className="fw-bold text-success">Rp {item.total.toLocaleString('id-ID')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* REVISI DESAIN: FOOTER TABEL UNTUK KALKULASI */}
                  <tfoot className="table-light border-top border-2">
                    <tr>
                      <td colSpan="3" className="py-3 ps-4 text-start text-muted fw-semibold">
                        <i className="fas fa-shopping-cart me-2"></i>Subtotal
                      </td>
                      <td className="py-3 text-end pe-4 fw-semibold text-dark">
                        Rp {subtotal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    {/* {tax > 0 && (
                      <tr>
                        <td colSpan="3" className="py-2 text-end text-muted fw-semibold">
                          <i className="fas fa-percent me-2"></i>Pajak
                        </td>
                        <td className="py-2 text-end pe-4 fw-semibold text-dark">
                          Rp {tax.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )} */}
                    {/* {discount > 0 && (
                      <tr>
                        <td colSpan="3" className="py-2 text-end text-success fw-semibold">
                          <i className="fas fa-percentage me-2"></i>Diskon
                        </td>
                        <td className="py-2 text-end pe-4 fw-semibold text-success">
                          -Rp {discount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )} */}
                    {/* <tr className="border-top">
                      <td colSpan="3" className="py-4 text-end">
                        <strong className="fs-6"><i className="fas fa-money-check-alt me-2 text-primary"></i>Grand Total</strong>
                      </td>
                      <td className="py-4 text-end pe-4">
                        <span className="fs-5 fw-bold text-primary mb-0">Rp {grandTotal.toLocaleString('id-ID')}</span>
                      </td>
                    </tr> */}
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PEMBAYARAN */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-header bg-success text-white border-0 py-3 px-4">
              <div className="d-flex align-items-center">
                <i className="fas fa-credit-card me-2 fs-5"></i>
                <h5 className="mb-0 fw-bold">Metode Pembayaran</h5>
              </div>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="form-check-payment h-100">
                      <input 
                        className="form-check-input" type="radio" name="payment_method" id="pay_cash" 
                        checked={paymentMethod === 'cash'} 
                        onChange={() => { setPaymentMethod('cash'); setUangDiterima(''); }} 
                      />
                      <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4 border rounded-4 text-center bg-white" htmlFor="pay_cash">
                        <i className="fas fa-money-bill-wave fa-3x text-success mb-3"></i>
                        <h5 className="fw-bold mb-2 text-dark">Cash</h5>
                        <p className="text-muted small mb-0">Pembayaran tunai</p>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check-payment h-100">
                      <input 
                        className="form-check-input" type="radio" name="payment_method" id="pay_qris" 
                        checked={paymentMethod === 'qris'} 
                        onChange={() => { setPaymentMethod('qris'); setUangDiterima(''); }} 
                      />
                      <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center p-4 border rounded-4 text-center bg-white" htmlFor="pay_qris">
                        <i className="fas fa-qrcode fa-3x text-primary mb-3"></i>
                        <h5 className="fw-bold mb-2 text-dark">QRIS</h5>
                        <p className="text-muted small mb-0">Pembayaran digital</p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* FORM INPUT UANG DITERIMA (HANYA MUNCUL JIKA CASH) */}
                {paymentMethod === 'cash' && (
                  <div className="bg-light p-4 rounded-4 mb-4 border fade-in">
                    <label className="form-label fw-bold text-dark mb-2">Nominal Uang Diterima (Rp)</label>
                    <div className="input-group input-group-lg shadow-sm">
                      <span className="input-group-text bg-white fw-bold border-end-0">Rp</span>
                      <input 
                        type="number" 
                        className={`form-control border-start-0 fw-bold ${isUangKurang ? 'is-invalid text-danger' : 'text-success'}`}
                        placeholder="0"
                        value={uangDiterima}
                        onChange={(e) => setUangDiterima(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        required
                        autoFocus
                      />
                    </div>
                    {/* INDIKATOR KEMBALIAN / UANG KURANG */}
                    {uangDiterima !== '' && (
                      <div className={`mt-3 p-3 rounded-3 border ${isUangKurang ? 'bg-danger-subtle border-danger' : 'bg-primary-subtle border-primary'}`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className={`fw-semibold ${isUangKurang ? 'text-danger' : 'text-primary'}`}>
                            {isUangKurang ? 'Uang Masih Kurang:' : 'Uang Kembalian:'}
                          </span>
                          <span className={`h4 mb-0 fw-bold ${isUangKurang ? 'text-danger' : 'text-primary'}`}>
                            Rp {Math.abs(kembalian).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-success btn-lg py-3 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center" 
                    disabled={isSubmitDisabled}
                  >
                    {isSubmitting ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span> Memproses...</>
                    ) : (
                      <><i className="fas fa-check-circle me-2 fs-5"></i> Konfirmasi & Cetak Struk</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ================= KANAN: SIDEBAR INFO ================= */}
        <div className="col-lg-4">
          <div className="position-sticky" style={{ top: '2rem' }}>
            
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-header bg-info text-white border-0 py-3 px-4">
                <div className="d-flex align-items-center">
                  <i className="fas fa-user-circle me-2 fs-5"></i>
                  <h5 className="mb-0 fw-bold">Detail Pesanan</h5>
                </div>
              </div>
              
              <div className="card-body p-4 bg-white">
                <div className="info-item mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="info-icon"><i className="fas fa-user"></i></div>
                    <span className="small text-muted ms-2 fw-semibold">Nama Pelanggan</span>
                  </div>
                  <div className="fw-bold h6 mb-0 ms-4 ps-2 text-dark">
                    {orderData.customer_name || 'Guest'}
                  </div>
                </div>

                <div className="info-item mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="info-icon">
                      <i className={`fas ${orderData.tipePesanan === 'Takeaway' ? 'fa-shopping-bag' : 'fa-chair'}`}></i>
                    </div>
                    <span className="small text-muted ms-2 fw-semibold">
                      {orderData.tipePesanan === 'Takeaway' ? 'Jenis Pesanan' : 'Nomor Meja'}
                    </span>
                  </div>
                  <div className="fw-bold h6 mb-0 ms-4 ps-2 text-dark">
                    {orderData.tipePesanan === 'Takeaway' ? 'Takeaway' : (orderData.nama_meja || orderData.name || `Meja ${orderData.id_meja || ''}`)}
                  </div>
                </div>

                <div className="info-item mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="info-icon"><i className="fas fa-clock"></i></div>
                    <span className="small text-muted ms-2 fw-semibold">Waktu Pemesanan</span>
                  </div>
                  <div className="fw-bold h6 mb-0 ms-4 ps-2 text-dark">
                    {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())} {waktu}
                  </div>
                </div>

                <div className="info-item mb-0">
                  <div className="d-flex align-items-center mb-2">
                    <div className="info-icon"><i className="fas fa-hashtag"></i></div>
                    <span className="small text-muted ms-2 fw-semibold">Nomor Transaksi</span>
                  </div>
                  <div className="fw-bold h6 mb-0 ms-4 ps-2 text-dark">
                    #{orderData.draftId}
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 mt-4 bg-white">
              <div className="card-body p-4 text-center">
                <h6 className="fw-bold mb-3 text-dark">Aksi Cepat</h6>
                <div className="d-grid gap-2">
                  <button onClick={() => navigate(-1)} className="btn btn-outline-primary rounded-pill fw-semibold">
                    <i className="fas fa-arrow-left me-2"></i>Kembali ke Menu
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="btn btn-outline-secondary rounded-pill fw-semibold">
                    <i className="fas fa-table me-2"></i>Batalkan & Ganti Meja
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        /* Payment Radio Button Styles */
        .form-check-payment .form-check-input { display: none; }
        .form-check-payment .form-check-label {
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 180px;
        }
        .form-check-payment .form-check-label:hover {
          background: #f8f9fa !important;
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
        }
        .form-check-payment .form-check-input:checked + .form-check-label {
          background: linear-gradient(135deg, #f0f8ff, #e6f3ff) !important;
          border-color: #0d6efd !important;
          border-width: 2px;
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(13,110,253,0.15) !important;
        }

        /* Timeline Info Sidebar */
        .info-icon {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e7f3ff, #f0f8ff);
          color: #0d6efd;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          box-shadow: 0 2px 5px rgba(13,110,253,0.2);
        }
        .info-item { position: relative; }
        .info-item:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 17px; top: 40px; bottom: -20px;
          width: 2px;
          background: #e9ecef;
        }

        /* Table Hover Effects */
        .item-row { border-left: 4px solid transparent; transition: all 0.2s ease; }
        .item-row:hover {
          background-color: #f8f9ff !important;
          border-left-color: #0d6efd !important;
        }

        /* Sembunyikan panah panah pada input number */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}