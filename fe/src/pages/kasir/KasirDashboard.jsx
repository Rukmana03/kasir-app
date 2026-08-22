import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function KasirDashboard() {
  const [waktu, setWaktu] = useState(new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
  const navigate = useNavigate();

  const [mejas, setMejas] = useState([]);
  const [customerNames, setCustomerNames] = useState({});
  const [loading, setLoading] = useState(true);

  const [isClosedToday, setIsClosedToday] = useState(false);
  const [checkingClosing, setCheckingClosing] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const getTodayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    const checkClosingStatus = async () => {
      try {
        setCheckingClosing(true);
        const date = getTodayLocal();
        // Cek ke API apakah hari ini sudah ada data closing
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/closing_harian?date=${date}`, axiosConfig);
        setIsClosedToday(true); // Jika sukses 200, berarti sudah closing
      } catch (err) {
        if (err.response?.status === 403) {
          setIsClosedToday(true); // Jika 403 (kasir dilarang lihat rincian), tapi data closing ada
        } else {
          setIsClosedToday(false); // Jika 404 (belum closing)
        }
      } finally {
        setCheckingClosing(false);
      }
    };

    checkClosingStatus();
    fetchMeja();

    const timer = setInterval(() => {
      setWaktu(new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMeja();
    const timer = setInterval(() => {
      setWaktu(new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchMeja = async () => {
    try {
      setLoading(true);
      const res = await axios.get(import.meta.env.VITE_API_BASE_URL + "/meja", axiosConfig);
      setMejas(res.data.data || []);
    } catch (error) {
      console.error("Gagal memuat data meja", error);
      alert("Gagal terhubung ke server untuk mengambil data meja.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (mejaId, value) => {
    setCustomerNames((prev) => ({ ...prev, [mejaId]: value }));
  };

  const handleMulaiPesanan = (e, meja) => {
    e.preventDefault();
    const customer = customerNames[meja.id_meja] || "Guest";
    navigate("/kasir/menu", {
      state: {
        tipePesanan: "Dine In",
        id_meja: meja.id_meja,
        nama_meja: meja.nomor_meja,
        customer_name: customer,
      },
    });
  };

  const handleTakeaway = (e) => {
    e.preventDefault();
    navigate("/kasir/menu", {
      state: {
        tipePesanan: "Takeaway",
        id_meja: null,
        nama_meja: "Takeaway",
        customer_name: "Guest",
      },
    });
  };

  const handleKosongkanMeja = async (e, meja) => {
    e.preventDefault();

    const namaMejaTampil = meja.nomor_meja || `Meja ${meja.id_meja}`;

    if (window.confirm(`Yakin ingin mengosongkan ${namaMejaTampil}?`)) {
      try {
        await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/meja/${meja.id_meja}/status`,
          {
            status_meja: "Tersedia",
          },
          axiosConfig,
        );

        fetchMeja();
      } catch (error) {
        console.error("Gagal mengosongkan meja", error);
        alert("Terjadi kesalahan saat mengosongkan meja.");
      }
    }
  };

  // PERBAIKAN 1: Logika hitung diubah agar membaca 'status_meja'
  const mejaTersedia = mejas.filter((m) => m.status_meja !== "Terisi").length;
  const mejaDipakai = mejas.filter((m) => m.status_meja === "Terisi").length;
  const totalMeja = mejas.length;

  return (
    <div className="container-fluid py-4 fade-in" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h3 fw-bold text-primary mb-1">Waroeng Bakmi</h1>
          <p className="text-muted mb-0">Pilih meja atau takeaway untuk memulai pesanan</p>
        </div>
        <div className="badge bg-white text-dark px-3 py-2 border shadow-sm fs-6">
          <i className="fas fa-clock me-2 text-primary"></i>
          {waktu} WIB
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-primary text-white shadow-sm h-100 rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <div className="small opacity-75 fw-semibold mb-1">Meja Tersedia</div>
                <div className="h3 fw-bold mb-0">{loading ? "-" : mejaTersedia}</div>
              </div>
              <i className="fas fa-chair fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-warning text-dark shadow-sm h-100 rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <div className="small opacity-75 fw-semibold mb-1">Meja Dipakai</div>
                <div className="h3 fw-bold mb-0">{loading ? "-" : mejaDipakai}</div>
              </div>
              <i className="fas fa-users fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-success text-white shadow-sm h-100 rounded-4">
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <div className="small opacity-75 fw-semibold mb-1">Total Meja</div>
                <div className="h3 fw-bold mb-0">{loading ? "-" : totalMeja}</div>
              </div>
              <i className="fas fa-table fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-info text-white shadow-sm h-100 rounded-4" style={{ cursor: "pointer" }} onClick={handleTakeaway}>
            <div className="card-body d-flex align-items-center justify-content-between p-4">
              <div>
                <div className="small opacity-75 fw-semibold mb-1">Takeaway</div>
                <div className="h3 fw-bold mb-0">
                  <i className="fas fa-shopping-bag"></i>
                </div>
              </div>
              <i className="fas fa-bag-shopping fa-2x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Memuat data meja...</p>
        </div>
      )}

      {/* LOADING STATE GABUNGAN */}
      {(loading || checkingClosing) && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Memeriksa sistem kasir...</p>
        </div>
      )}

      {/* TAMPILAN JIKA SUDAH CLOSING (DIKUNCI) */}
      {!loading && !checkingClosing && isClosedToday && (
        <div className="card border-0 shadow-sm rounded-4 mt-4">
          <div className="card-body py-5 text-center fade-in">
            <div className="icon-circle text-danger mx-auto mb-4" style={{ width: "60px", height: "60px", fontSize: "50px" }}>
              <i className="fas fa-lock"></i>
            </div>
            <h2 className="h4 fw-bold text-dark mb-2">Kasir Telah Ditutup</h2>
            <p className="text-muted mb-4">Laporan Closing Harian untuk hari ini sudah dicetak. Anda tidak dapat melayani pesanan baru atau mengubah status meja.</p>
            <div className="alert alert-warning d-inline-block border-0 small px-4 rounded-pill">
              <i className="fas fa-info-circle me-2"></i>Buka menu <strong>Closing Harian</strong> lalu pilih "Buka Kembali (Reopen)" untuk melanjutkan transaksi.
            </div>
          </div>
        </div>
      )}

      {!loading && !checkingClosing && !isClosedToday && (
        <div className="row g-4">
          {mejas.map((meja) => {
            // Kita simpan statusnya di variabel pendek agar kode rapi
            const isTerisi = meja.status_meja === "Terisi";

            return (
              <div className="col-6 col-md-4 col-lg-3" key={meja.id_meja}>
                {/* PERBAIKAN 2: Menggunakan isTerisi untuk styling border */}
                <div className={`card h-100 border-0 shadow-sm rounded-4 table-card ${isTerisi ? "occupied" : "available"}`}>
                  {/* Status Badge */}
                  <div className="position-absolute top-0 end-0 m-3">
                    {isTerisi ? (
                      <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
                        <i className="fas fa-user-friends me-1"></i> Dipakai
                      </span>
                    ) : (
                      <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm">
                        <i className="fas fa-check-circle me-1"></i> Kosong
                      </span>
                    )}
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <div className="text-center mb-4 mt-2">
                      <div className={`table-icon mb-3 ${isTerisi ? "icon-warn" : "icon-ok"}`}>
                        <i className="fas fa-utensils"></i>
                      </div>
                      <h5 className="card-title mb-1 fw-bold text-dark">{meja.nomor_meja || `Meja ${meja.id_meja}`}</h5>
                      {/* <p className="text-muted small mb-0">
                        ID: {meja.id_meja} {isTerisi && meja.customer_name ? `• ${meja.customer_name}` : ''}
                      </p> */}
                    </div>

                    {/* Form Mulai Pesanan (Jika Kosong) */}
                    {!isTerisi && (
                      <form onSubmit={(e) => handleMulaiPesanan(e, meja)} className="mt-auto">
                        <label className="form-label small text-muted fw-semibold">Nama Pelanggan (opsional)</label>
                        <div className="input-group input-group-sm mb-3 shadow-sm rounded-3">
                          <span className="input-group-text bg-white border-end-0">
                            <i className="fas fa-user text-muted"></i>
                          </span>
                          <input type="text" className="form-control border-start-0 ps-0" placeholder="Ketik nama..." value={customerNames[meja.id_meja] || ""} onChange={(e) => handleInputChange(meja.id_meja, e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary w-100 rounded-pill fw-semibold shadow-sm">
                          <i className="fas fa-play me-2"></i> Mulai Pesanan
                        </button>
                      </form>
                    )}

                    {/* Tombol Selesai (Jika Dipakai) */}
                    {isTerisi && (
                      <form onSubmit={(e) => handleKosongkanMeja(e, meja)} className="mt-auto">
                        <div className="alert alert-warning py-2 small text-center mb-3 border-0">Meja sedang melayani pesanan.</div>
                        <button type="submit" className="btn btn-outline-danger w-100 rounded-pill fw-semibold border-2">
                          <i className="fas fa-stop me-2"></i> Kosongkan Meja
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* KARTU TAKEAWAY */}
          <div className="col-6 col-md-4 col-lg-3">
            <div className="card h-100 border-0 shadow-sm rounded-4 takeaway-card text-white cursor-pointer" onClick={handleTakeaway} style={{ cursor: "pointer" }}>
              <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center">
                <div className="twk-circle mb-3 shadow">
                  <i className="fas fa-shopping-bag fa-2x"></i>
                </div>
                <h4 className="fw-bold mb-1 text-white">Takeaway</h4>
                <p className="opacity-75 mb-0 small">Pesan tanpa menggunakan meja</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .table-card { 
          transition: transform .25s ease, box-shadow .25s ease; 
          position: relative; 
          border-left: 4px solid transparent !important;
        }
        .table-card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 10px 24px rgba(0,0,0,.1) !important; 
        }
        .table-card.available { border-left-color: #198754 !important; }
        .table-card.occupied { border-left-color: #ffc107 !important; }

        .table-icon { 
          width: 64px; height: 64px; border-radius: 50%;
          display:flex; align-items:center; justify-content:center; 
          font-size:24px; color:#fff; margin:0 auto; 
          box-shadow: 0 4px 10px rgba(0,0,0,.15);
        }
        .icon-ok { background: linear-gradient(135deg, #198754, #20c997); }
        .icon-warn { background: linear-gradient(135deg, #ffc107, #fd7e14); }

        .takeaway-card { 
          background: linear-gradient(135deg, #0dcaf0, #0bacce); 
          transition: transform .25s ease, box-shadow .25s ease; 
        }
        .takeaway-card:hover { 
          transform: translateY(-5px); 
          box-shadow: 0 10px 24px rgba(13,202,240,.35) !important; 
        }
        .twk-circle { 
          width:80px; height:80px; border-radius:50%; 
          background: rgba(255,255,255,.25);
          display:flex; align-items:center; justify-content:center; 
        }
      `}</style>
    </div>
  );
}
