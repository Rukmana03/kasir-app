import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LaporanBulanan() {
  // 1. State untuk Filter (Pisah Bulan dan Tahun sesuai desain Blade)
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // getMonth dimulai dari 0

  const [month, setMonth] = useState(currentMonth.toString());
  const [year, setYear] = useState(currentYear.toString());
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Daftar nama bulan untuk dropdown
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // 2. Fungsi Tarik Data
  const fetchLaporan = async (e) => {
    if (e) e.preventDefault(); // Mencegah reload jika disubmit via tombol

    try {
      setLoading(true);
      // Gabungkan tahun dan bulan menjadi format YYYY-MM untuk backend
      const formattedMonth = month.padStart(2, '0');
      const queryParam = `${year}-${formattedMonth}`; 

      const res = await axios.get(`\${import.meta.env.VITE_API_BASE_URL}/laporan/bulanan?month=${queryParam}`, axiosConfig);
      setReportData(res.data.data);
    } catch (error) {
      console.error("Gagal memuat laporan:", error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchLaporan saat pertama kali halaman dibuka
  useEffect(() => {
    fetchLaporan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Helper Formatter
  const formatRp = (num) => Number(num || 0).toLocaleString('id-ID');
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString)).replace(/\//g, '-');
  };

  // Generate daftar tahun (dari tahun ini mundur ke 2020)
  const years = [];
  for (let y = currentYear; y >= 2020; y--) {
    years.push(y);
  }

  return (
    <div className="container py-4 fade-in">
      <h2 className="mb-4">Laporan Bulanan</h2>

      {/* FILTER BULAN & TAHUN (Sesuai Desain Blade) */}
      <form onSubmit={fetchLaporan} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-3">
            <label htmlFor="month" className="form-label fw-medium">Bulan</label>
            <select 
              id="month" 
              className="form-select" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label htmlFor="year" className="form-label fw-medium">Tahun</label>
            <select 
              id="year" 
              className="form-select" 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">Filter</button>
          </div>
        </div>
      </form>

      {/* TABEL LAPORAN (Sesuai Desain Blade) */}
      <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-bordered mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pemasukan</th>
                <th className="py-3 px-4">Pengeluaran</th>
                <th className="py-3 px-4">Net Cashflow</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border text-primary mb-2" role="status"></div>
                    <div>Memuat data...</div>
                  </td>
                </tr>
              ) : !reportData || reportData.detail_harian.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    Tidak ada data pada periode ini.
                  </td>
                </tr>
              ) : (
                reportData.detail_harian.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-4">{formatDate(row.tanggal)}</td>
                    <td className="px-4 text-success">Rp {formatRp(row.pemasukan)}</td>
                    <td className="px-4 text-danger">Rp {formatRp(row.belanja)}</td>
                    <td className="px-4 fw-bold">Rp {formatRp(row.total_bersih)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {/* FOOTER TOTAL */}
            {!loading && reportData && reportData.detail_harian.length > 0 && (
              <tfoot className="table-secondary">
                <tr>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-success">Rp {formatRp(reportData.summary.total_pemasukan)}</th>
                  <th className="py-3 px-4 text-danger">Rp {formatRp(reportData.summary.total_belanja)}</th>
                  <th className="py-3 px-4 text-dark fs-6">Rp {formatRp(reportData.summary.total_bersih)}</th>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
    </div>
  );
}