import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const chartRef = useRef();

  const [period, setPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  // State diperbarui untuk menangkap array grafik asli
  const [dashboardData, setDashboardData] = useState({
    keuangan: { pendapatan: 0, pengeluaran: 0, laba_bersih: 0 },
    menuTerlaris: [],
    stokKritis: [],
    grafik: { labels: [], keys: [], income: [], expense: [], txCount: [] },
  });

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard?period=${period}`, axiosConfig);
      const data = res.data.data || res.data;

      setDashboardData({
        keuangan: data?.keuangan_hari_ini || { pendapatan: 0, pengeluaran: 0, laba_bersih: 0 },
        menuTerlaris: data?.menu_terlaris || [],
        stokKritis: data?.stok_kritis || [],
        grafik: data?.grafik || { labels: [], keys: [], income: [], expense: [], txCount: [] },
      });
    } catch (error) {
      console.error("Gagal memuat data dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const formatRp = (num) => Number(num || 0).toLocaleString("id-ID");

  const getPeriodText = () => {
    if (period === "daily") return "14 Hari Terakhir";
    if (period === "weekly") return "12 Minggu Terakhir";
    if (period === "monthly") return "Tahun Ini";
    if (period === "yearly") return "5 Tahun Terakhir";
    return "Periode";
  };

  // MENGGUNAKAN DATA GRAFIK ASLI DARI BACKEND
  const chartData = {
    labels: dashboardData.grafik.labels,
    datasets: [
      {
        label: `Pemasukan`,
        data: dashboardData.grafik.income,
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253, 0.1)",
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
      {
        label: `Pengeluaran`,
        data: dashboardData.grafik.expense,
        borderColor: "#198754",
        backgroundColor: "rgba(25,135,84, 0.1)",
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { callback: (v) => "Rp " + formatRp(v) } },
    },
  };

  return (
    <div className="container-fluid py-4 fade-in">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-circle bg-primary-subtle text-primary shadow-sm" style={{ width: "48px", height: "48px", fontSize: "20px" }}>
            <i className="fas fa-chart-pie"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">Dashboard Owner</h1>
            <div className="text-muted small">Ringkasan finansial & status operasional restoran</div>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button onClick={() => fetchDashboardData()} className="btn btn-outline-secondary btn-sm rounded-pill fw-medium px-3">
            <i className="fas fa-sync-alt me-2"></i>Refresh Data
          </button>
        </div>
      </div>

      {/* KPI CARDS DINAMIS */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm section-card h-100 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-start justify-content-between">
                <div>
                  <div className="text-uppercase small text-muted fw-semibold">Pendapatan ({getPeriodText()})</div>
                  <div className="h3 fw-bold mb-0 text-dark mt-1">Rp {formatRp(dashboardData.keuangan.pendapatan)}</div>
                </div>
                <div className="icon-pill text-primary bg-primary-subtle fs-4">
                  <i className="fas fa-arrow-trend-up"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm section-card h-100 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-start justify-content-between">
                <div>
                  <div className="text-uppercase small text-muted fw-semibold">Pengeluaran ({getPeriodText()})</div>
                  <div className="h3 fw-bold mb-0 text-dark mt-1">Rp {formatRp(dashboardData.keuangan.pengeluaran)}</div>
                </div>
                <div className="icon-pill text-danger bg-danger-subtle fs-4">
                  <i className="fas fa-arrow-trend-down"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm section-card h-100 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-start justify-content-between">
                <div>
                  <div className="text-uppercase small text-muted fw-semibold">Net Cashflow ({getPeriodText()})</div>
                  <div className={`h3 fw-bold mb-0 mt-1 ${dashboardData.keuangan.laba_bersih >= 0 ? "text-success" : "text-danger"}`}>Rp {formatRp(dashboardData.keuangan.laba_bersih)}</div>
                </div>
                <div className="icon-pill text-secondary bg-light fs-4">
                  <i className="fas fa-scale-balanced"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GRAFIK & FILTER (FULL WIDTH) */}
      <div className="card border-0 shadow-sm section-card mb-4 rounded-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div className="d-flex align-items-center gap-2">
              <div className="icon-circle-small bg-info-subtle text-info">
                <i className="fas fa-wave-square"></i>
              </div>
              <h2 className="h6 fw-bold mb-0">Arus Kas</h2>
            </div>

            {/* FILTER SESUAI BLADE */}
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted mb-0 fw-medium">Periode:</label>
              <select className="form-select form-select-sm w-auto rounded-pill fw-semibold border-secondary-subtle" value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="daily">Harian (14d)</option>
                <option value="weekly">Mingguan (12w)</option>
                <option value="monthly">Bulanan (Tahun Ini)</option>
                <option value="yearly">Tahunan (5y)</option>
              </select>
            </div>
          </div>

          <div className="position-relative" style={{ height: "380px", width: "100%" }}>
            {loading ? (
              <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-white" style={{ zIndex: 10, opacity: 0.8 }}>
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      {/* BARIS BAWAH: 3 KOLOM SEJAJAR */}
      <div className="row g-4">
        {/* 1. MENU TERLARIS */}
        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm section-card h-100 rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom p-4 d-flex align-items-center gap-2">
              <div className="icon-circle-small bg-success-subtle text-success">
                <i className="fas fa-star"></i>
              </div>
              <h3 className="h6 fw-bold mb-0">5 Menu Terlaris</h3>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-sm">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Menu</th>
                      <th className="text-end pe-4">Terjual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.menuTerlaris.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-muted">
                          Belum ada data penjualan
                        </td>
                      </tr>
                    ) : (
                      dashboardData.menuTerlaris.map((item, idx) => (
                        <tr key={idx}>
                          <td className="ps-4">
                            <div className="fw-medium text-dark">{item.nama_menu}</div>
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              {item.kategori}
                            </div>
                          </td>
                          <td className="text-end pe-4 fw-bold text-success">{item.total_terjual}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 2. REKOMENDASI BELANJA */}
        <div className="col-xl-4 col-md-6">
          <div className="card border-0 shadow-sm section-card h-100 rounded-4 overflow-hidden">
            <div className="card-header bg-white border-bottom p-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="icon-circle-small bg-danger-subtle text-danger">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className="h6 fw-bold mb-0">Rekomendasi Belanja (Besok)</h3>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 text-sm">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Bahan</th>
                      <th className="text-end pe-4">Rekomendasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.stokKritis.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-muted">
                          <i className="fas fa-check-circle text-success fs-5 mb-2"></i>
                          <br />
                          Stok masih aman.
                        </td>
                      </tr>
                    ) : (
                      dashboardData.stokKritis.map((item, idx) => (
                        <tr key={idx}>
                          <td className="ps-4">
                            <div className="fw-medium text-dark">{item.nama_bahan}</div>
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              Sisa: {item.stok} {item.satuan}
                            </div>
                          </td>
                          <td className="text-end pe-4">
                            <span className={`badge ${item.stok <= 0 ? "bg-danger" : "bg-warning text-dark"} rounded-pill`}>
                              Beli {item.kurang} {item.satuan}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card-footer bg-white p-3 text-center border-top">
              <button onClick={() => navigate("/belanja")} className="btn btn-outline-primary btn-sm rounded-pill w-100 fw-semibold">
                Mulai Belanja <i className="fas fa-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 3. TIPS OWNER */}
        <div className="col-xl-4 col-md-12">
          <div className="card border-0 shadow-sm section-card h-100 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle-small bg-warning-subtle text-warning">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <h3 className="h6 fw-bold mb-0 ms-2">Tips Owner</h3>
              </div>
              <ul className="small text-muted mb-0 ps-3" style={{ lineHeight: "1.8", textAlign: "justify", listStyleType: "disc" }}>
                <li>
                  <strong>Periode Filter</strong> digunakan untuk melihat pergerakan finansial jangka panjang.
                </li>
                <li>
                  <strong>Daftar Menu Terlaris</strong> otomatis berubah mengikuti periode filter untuk menganalisa tren penjualan.
                </li>
                <li>
                  <strong>Rekomendasi Belanja</strong> memonitor stok secara <em>Real-Time</em> (tidak dipengaruhi filter). Segera belanja jika ada yang menipis!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .section-card { transition: transform .25s ease, box-shadow .25s ease; }
        .section-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.09) !important; }
        .icon-circle { border-radius: 50%; display:flex; align-items:center; justify-content:center; }
        .icon-circle-small { width: 34px; height: 34px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-size: 14px; }
        .icon-pill { width: 42px; height: 42px; border-radius: 50%; display:flex; align-items:center; justify-content:center; }
        .text-sm { font-size: 0.875rem; }
      `}</style>
    </div>
  );
}
