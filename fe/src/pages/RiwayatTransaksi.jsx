import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RiwayatTransaksi() {
  const navigate = useNavigate();

  // 1. State untuk Filter Tanggal (Default: Hari Ini)
  const [date, setDate] = useState(() => {
    const today = new Date();
    // Format ke YYYY-MM-DD
    return today.toISOString().split("T")[0];
  });
  const formatNoStruk = (id, tanggal) => {
    if (!tanggal) return `#${id}`;
    const d = new Date(tanggal);
    const datePart = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    return `${datePart}-${String(id).padStart(3, "0")}`; // Hasil: TRX-20260703-015
  };

  // 2. State Data
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ count: 0, subtotal: 0, discount: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Konfigurasi API
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // 3. Fungsi Ambil Data
  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/transaksi?date=${date}`, axiosConfig);

      // PERBAIKAN: Kita baca datanya lebih cerdas.
      // Jika res.data.data langsung berupa Array, kita pakai itu.
      // Jika dibungkus lagi dalam object 'transactions', kita ambil dari situ.
      const responseData = res.data.data || [];
      const dataTx = Array.isArray(responseData) ? responseData : responseData.transactions || [];

      setTransactions(dataTx);

      // Kalkulasi Ringkasan Otomatis dari data yang diterima
      setSummary({
        count: dataTx.length,
        subtotal: dataTx.reduce((sum, tx) => sum + (Number(tx.total_bayar) || 0), 0),
        discount: 0,
        total: dataTx.reduce((sum, tx) => sum + (Number(tx.total_bayar) || 0), 0),
      });
    } catch (error) {
      console.error("Gagal memuat riwayat transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // 4. Fungsi Ubah Metode Pembayaran (Fitur Kasir/Owner Ralat)
  const handleUpdatePayment = async (idTransaksi, newMethod) => {
    if (window.confirm(`Ubah metode pembayaran menjadi ${newMethod.toUpperCase()}?`)) {
      try {
        // Tembak API untuk update metode pembayaran
        await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/transaksi/${idTransaksi}/payment`,
          {
            metode_pembayaran: newMethod,
          },
          axiosConfig,
        );

        // Refresh data setelah berhasil
        fetchRiwayat();
      } catch (error) {
        console.error("Gagal update pembayaran:", error);
        alert("Gagal mengubah metode pembayaran.");
      }
    }
  };

  // 5. Fungsi Cetak Ulang Struk
  const handlePrintReceipt = (tx) => {
    // Arahkan ke halaman struk dengan membawa data transaksi yang sudah diformat
    navigate("/kasir/receipt", {
      state: {
        draftId: tx.id_transaksi || tx.id,
        id_transaksi_real: tx.id_transaksi,
        tipePesanan: tx.jenis_transaksi,
        id_meja: tx.id_meja,
        nama_meja: tx.meja?.nama_meja || `Meja ${tx.id_meja || "-"}`,
        customer_name: tx.nama_pelanggan || "Guest",
        waktuSelesai: tx.tanggal,
        subtotal: Number(tx.total_bayar),
        paymentMethod: tx.metode_pembayaran,
        uangDiterima: Number(tx.uang_diterima || tx.total_bayar),
        kembalian: Number(tx.kembalian || 0),
        cart: (tx.detail_transaksi || []).map((item) => ({
          nama_menu: item.menu?.nama_menu || item.nama_menu,
          qty: Number(item.jumlah),
          harga: Number(item.harga),
          total: Number(item.subtotal),
          notes: item.catatan,
        })),
      },
    });
  };

  // Format Rupiah
  const formatRp = (num) => {
    return Number(num || 0).toLocaleString("id-ID");
  };

  // Format Jam
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(dateString));
  };

  return (
    <div className="container-fluid py-4 fade-in" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-circle bg-primary-subtle text-primary">
            <i className="fas fa-list-check"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">Riwayat Transaksi Harian</h1>
            <div className="text-muted small">Pantau, ralat metode bayar, atau cetak ulang struk</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-pill shadow-sm border">
          <label className="text-muted small fw-semibold mb-0">
            <i className="fas fa-calendar-alt me-2"></i>Tanggal:
          </label>
          <input type="date" className="form-control form-control-sm border-0 fw-bold" style={{ width: "130px", boxShadow: "none" }} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {/* RINGKASAN */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 section-card">
            <div className="card-body p-4">
              <div className="small text-muted text-uppercase fw-semibold mb-1">Jumlah Transaksi</div>
              <div className="h3 fw-bold text-dark mb-0">{loading ? "-" : summary.count}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 section-card bg-primary text-white">
            <div className="card-body p-4">
              <div className="small opacity-75 text-uppercase fw-semibold mb-1">Total Pemasukan</div>
              <div className="h3 fw-bold mb-0">Rp {loading ? "-" : formatRp(summary.total)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* DAFTAR TRANSAKSI */}
      <div className="card border-0 shadow-sm rounded-4 section-card overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 px-4">
          <h5 className="fw-bold mb-0 text-dark">
            <i className="fas fa-receipt me-2 text-primary"></i>Daftar Nota
          </h5>
        </div>
        <div className="card-body p-0">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="text-muted mt-2">Memuat data transaksi...</p>
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted opacity-25 mb-3"></i>
              <h6 className="text-muted">Belum ada transaksi pada tanggal ini.</h6>
            </div>
          )}

          {!loading &&
            transactions.length > 0 &&
            transactions.map((tx, index) => (
              <div className={`p-4 ${index !== transactions.length - 1 ? "border-bottom" : ""} hover-bg-light`} key={tx.id_transaksi || index}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  {/* Info Kiri */}
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-light text-dark border">
                        <i className="fas fa-clock text-primary me-1"></i>
                        {formatTime(tx.tanggal)}
                      </span>
                      <span className="fw-bold text-secondary">#{formatNoStruk(tx.id_transaksi || tx.id, tx.tanggal)}</span>
                    </div>
                    <div className="mb-1">
                      {!tx.id_meja || tx.jenis_transaksi === "Takeaway" ? (
                        <span className="badge bg-info text-white me-2">Takeaway</span>
                      ) : (
                        <span className="fw-semibold text-dark me-2">
                          <i className="fas fa-chair text-muted me-1"></i>
                          {tx.meja?.nama_meja || tx.nama_meja || `Meja ${tx.id_meja}`}
                        </span>
                      )}
                      {tx.nama_pelanggan && (
                        <span className="text-muted small">
                          • Pelanggan: <strong className="text-dark">{tx.nama_pelanggan}</strong>
                        </span>
                      )}
                    </div>

                    {/* Item List */}
                    <div className="small text-muted mt-2">
                      {tx.detail_transaksi &&
                        tx.detail_transaksi.map((it, idx) => (
                          <div key={idx}>
                            • {it.menu?.nama_menu || it.nama_menu} × {it.jumlah} @ Rp {formatRp(it.harga)}
                            {it.catatan && <em className="text-primary ms-1">({it.catatan})</em>}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Info Kanan (Total, Payment, Aksi) */}
                  <div className="text-end">
                    <div className="h5 fw-bold text-dark mb-2">Rp {formatRp(tx.total_bayar)}</div>

                    <div className="d-flex align-items-center justify-content-end gap-2 mb-2">
                      <span className="small text-muted">Metode:</span>
                      <select
                        className={`form-select form-select-sm d-inline w-auto rounded-pill fw-bold ${tx.metode_pembayaran === "cash" ? "text-success border-success" : "text-primary border-primary"}`}
                        value={tx.metode_pembayaran || "cash"}
                        onChange={(e) => handleUpdatePayment(tx.id_transaksi || tx.id, e.target.value)}
                      >
                        <option value="cash">CASH</option>
                        <option value="qris">QRIS</option>
                      </select>
                    </div>

                    <button onClick={() => handlePrintReceipt(tx)} className="btn btn-outline-primary btn-sm rounded-pill mt-1">
                      <i className="fas fa-print me-1"></i>Cetak Struk
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <style>{`
        .section-card { 
          transition: transform .25s ease, box-shadow .25s ease; 
        }
        .section-card:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 10px 25px rgba(0,0,0,.08) !important; 
        }
        .icon-circle {
          width: 46px; height: 46px; border-radius: 50%;
          display:flex; align-items:center; justify-content:center; 
          font-size: 20px;
        }
        .bg-primary-subtle { background-color: rgba(13,110,253,.12) !important; }
        .hover-bg-light:hover { background-color: #f8f9fa; transition: background-color 0.2s ease; }
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; }
      `}</style>
    </div>
  );
}
