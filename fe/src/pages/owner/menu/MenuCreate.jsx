import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function MenuCreate() {
  const navigate = useNavigate();

  // State untuk form
  const [namaMenu, setNamaMenu] = useState("");
  const [kategori, setKategori] = useState("");
  const [harga, setHarga] = useState("");
  const [isActive, setIsActive] = useState(true); // true = tersedia, false = habis

  // State untuk UI
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  // Formatter Rupiah untuk Live Preview
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(isNaN(number) ? 0 : number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages([]);

    // Validasi Basic
    const trimmedName = namaMenu.trim();
    const priceVal = Number(harga);

    if (!trimmedName) {
      setErrorMessages(["Nama menu tidak boleh kosong."]);
      return;
    }
    if (isNaN(priceVal) || priceVal < 0 || harga === "") {
      setErrorMessages(["Harga harus berupa angka dan tidak boleh kurang dari 0."]);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      // Tembak API Backend
      await axios.post(
        import.meta.env.VITE_API_BASE_URL + "/menu",
        {
          nama_menu: trimmedName,
          kategori: kategori.trim() || null,
          harga: priceVal,
          status_menu: isActive ? "tersedia" : "habis", // Sesuaikan dengan Enum di Backend
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Jika sukses, arahkan kembali ke halaman index
      navigate("/menu");
    } catch (error) {
      // Tangkap pesan error dari backend
      const errMsg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      setErrorMessages([errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid px-0 fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-circle bg-primary-subtle text-primary" style={{ width: "42px", height: "42px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", backgroundColor: "rgba(13,110,253,.12)" }}>
            <i className="fas fa-utensils"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">Tambah Menu</h1>
            <div className="text-muted small">Buat item menu baru untuk penjualan</div>
          </div>
        </div>
        <Link to="/menu" className="btn btn-light border rounded-pill">
          <i className="fas fa-arrow-left me-1"></i>Kembali
        </Link>
      </div>

      {/* Alerts untuk error validasi */}
      {errorMessages.length > 0 && (
        <div className="alert alert-danger border-0 shadow-sm slide-up">
          <strong>Periksa kembali input Anda.</strong>
          <ul className="mb-0 mt-2 small">
            {errorMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Card Form */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ transition: "transform .2s ease, box-shadow .2s ease" }}>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="row g-3" noValidate>
            {/* Nama */}
            <div className="col-lg-6">
              <label htmlFor="name" className="form-label fw-semibold">
                Nama <span className="text-danger">*</span>
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light">
                  <i className="fas fa-tag text-muted"></i>
                </span>
                <input type="text" id="name" className="form-control" placeholder="Contoh: Bakmi Ayam" value={namaMenu} onChange={(e) => setNamaMenu(e.target.value)} maxLength="80" required autoComplete="off" autoFocus />
              </div>
              <div className="form-text">Gunakan nama singkat & jelas (maks. 80 karakter).</div>
            </div>

            {/* Kategori */}
            <div className="col-lg-6">
              <label htmlFor="category" className="form-label fw-semibold">
                Kategori
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light">
                  <i className="fas fa-layer-group text-muted"></i>
                </span>
                <input type="text" id="category" className="form-control" placeholder="Contoh: Mie / Minuman" value={kategori} onChange={(e) => setKategori(e.target.value)} maxLength="60" />
              </div>
              <div className="form-text">Opsional. Contoh: Makanan, Minuman, Tambahan.</div>
            </div>

            {/* Harga */}
            <div className="col-lg-6">
              <label htmlFor="price" className="form-label fw-semibold">
                Harga (Rp) <span className="text-danger">*</span>
              </label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light">Rp</span>
                <input type="number" id="price" className="form-control" placeholder="0" min="0" step="1" value={harga} onChange={(e) => setHarga(e.target.value)} required inputMode="numeric" />
              </div>
              <div className="form-text">
                <span className="text-muted">Pratinjau: </span>
                <span className="fw-semibold text-primary">{formatRupiah(harga)}</span>
              </div>
            </div>

            {/* Status Aktif */}
            <div className="col-lg-6 d-flex align-items-end">
              <div className="form-check form-switch pb-2">
                <input className="form-check-input" type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ width: "2.5em", height: "1.25em", cursor: "pointer" }} />
                <label className="form-check-label fw-semibold ms-2" htmlFor="isActive" style={{ cursor: "pointer" }}>
                  Menu Aktif (Tersedia)
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="col-12 d-flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </button>
              <Link to="/menu" className="btn btn-outline-secondary rounded-pill px-4">
                Batal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
