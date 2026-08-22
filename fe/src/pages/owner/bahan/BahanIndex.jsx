import { useState, useEffect } from "react";
import axios from "axios";

export default function BahanIndex() {
  const [bahan, setBahan] = useState([]);

  // State untuk form Tambah Bahan
  const [namaBahan, setNamaBahan] = useState("");
  const [satuan, setSatuan] = useState("");
  const [kategori, setKategori] = useState("kering"); // Default 'kering'

  // State UI
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [alert, setAlert] = useState(null);

  const [editingBahan, setEditingBahan] = useState(null);
  const [editForm, setEditForm] = useState({
    nama_bahan: "",
    jenis_bahan: "",
    satuan: "",
    stok: 0,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchBahan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBahan = async () => {
    setIsFetching(true);
    try {
      // Sesuaikan endpoint ini dengan backend Anda
      const response = await axios.get(import.meta.env.VITE_API_BASE_URL + "/bahan", axiosConfig);
      setBahan(response.data.data || []);
    } catch (error) {
      showAlert("danger", "Gagal memuat daftar bahan.");
    } finally {
      setIsFetching(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleTambahBahan = async (e) => {
    e.preventDefault();
    const trimmedName = namaBahan.trim();
    const trimmedSatuan = satuan.trim();

    if (!trimmedName || !trimmedSatuan) {
      showAlert("danger", "Nama bahan dan satuan wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        import.meta.env.VITE_API_BASE_URL + "/bahan",
        {
          nama_bahan: trimmedName,
          satuan: trimmedSatuan,
          jenis_bahan: kategori,
          stok: 0,
        },
        axiosConfig,
      );

      showAlert("success", "Bahan berhasil ditambahkan.");
      setNamaBahan("");
      setSatuan("");
      fetchBahan(); // Refresh tabel
    } catch (error) {
      showAlert("danger", error.response?.data?.message || "Gagal menambahkan bahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus bahan ini?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/bahan/${id}`, axiosConfig);
      showAlert("success", "Bahan berhasil dihapus.");
      fetchBahan();
    } catch (error) {
      showAlert("danger", "Bahan tidak dapat dihapus karena sudah memiliki riwayat transaksi.");
    }
  };

  const openEditModal = (b) => {
    setEditingBahan(b);
    setEditForm({
      nama_bahan: b.nama_bahan,
      jenis_bahan: b.jenis_bahan,
      satuan: b.satuan,
      stok: b.stok,
    });
  };

  const closeEditModal = () => {
    setEditingBahan(null);
  };

  const handleSimpanEdit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);

    try {
      // Panggil API PUT update bahan yang sudah ada di Controller Anda
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/bahan/${editingBahan.id_bahan}`, editForm, axiosConfig);

      showAlert("success", "Data bahan berhasil diperbarui!");
      closeEditModal();
      fetchBahan(); // Refresh data tabel
    } catch (error) {
      showAlert("danger", "Gagal menyimpan perubahan.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="container-fluid px-0 fade-in">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 fw-bold text-primary mb-1">
            <i className="fas fa-box-open me-2"></i>Master Bahan Baku
          </h1>
          <p className="text-muted mb-0">Kelola daftar item bahan kering dan basah</p>
        </div>
      </div>

      {/* Alerts */}
      {alert && (
        <div className={`alert alert-${alert.type} border-0 shadow-sm alert-dismissible fade show slide-up`}>
          <i className={`fas ${alert.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} me-2`}></i>
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      <div className="row g-4">
        {/* LEFT COLUMN: Form Tambah */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 mb-3" style={{ transition: "transform .25s ease, box-shadow .25s ease" }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-primary-subtle text-primary me-3" style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", backgroundColor: "rgba(13,110,253,.12)" }}>
                  <i className="fas fa-plus"></i>
                </div>
                <div>
                  <h2 className="h6 mb-0 fw-bold">Tambah Bahan</h2>
                  <small className="text-muted">Buat item baru untuk daftar bahan</small>
                </div>
              </div>

              <form onSubmit={handleTambahBahan} className="row g-3">
                <div className="col-12">
                  <label className="form-label small text-muted mb-1">Kategori Bahan</label>
                  <select className="form-select form-select-sm bg-light" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                    <option value="kering">Bahan Kering (Mie, Kecap, dll)</option>
                    <option value="basah">Bahan Basah (Ayam, Sayur, dll)</option>
                  </select>
                </div>
                <div className="col-sm-7">
                  <label className="form-label small text-muted mb-1">Nama Bahan</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-tag text-muted"></i>
                    </span>
                    <input type="text" className="form-control" placeholder="Contoh: Mie kering" value={namaBahan} onChange={(e) => setNamaBahan(e.target.value)} required />
                  </div>
                </div>
                <div className="col-sm-5">
                  <label className="form-label small text-muted mb-1">Satuan</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light">
                      <i class="fas fa-ruler text-muted"></i>
                    </span>
                    <input type="text" className="form-control" placeholder="pak / kg" value={satuan} onChange={(e) => setSatuan(e.target.value)} required />
                  </div>
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary w-100 rounded-pill fw-semibold" disabled={isLoading}>
                    {isLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-plus-circle me-2"></i>}
                    Tambah Bahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabel Daftar Bahan */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-circle bg-info-subtle text-info me-3" style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", backgroundColor: "rgba(13,202,240,.15)" }}>
                  <i className="fas fa-list-ul"></i>
                </div>
                <h2 className="h6 mb-0 fw-bold">Daftar Bahan Utama</h2>
              </div>

              <div className="table-responsive mt-3" style={{ maxHeight: "60vh", overflow: "auto" }}>
                <table className="table table-sm align-middle table-hover">
                  <thead className="table-light sticky-top shadow-sm">
                    <tr>
                      <th style={{ minWidth: "150px" }}>Nama Bahan</th>
                      <th>Kategori</th>
                      <th style={{ minWidth: "80px" }}>Satuan</th>
                      <th className="text-end">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isFetching ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          <i className="fas fa-spinner fa-spin text-primary"></i> Memuat...
                        </td>
                      </tr>
                    ) : bahan.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4">
                          <i className="fas fa-circle-info me-1"></i>Belum ada bahan — tambahkan terlebih dahulu.
                        </td>
                      </tr>
                    ) : (
                      bahan.map((b) => (
                        <tr key={b.id_bahan}>
                          <td className="fw-semibold text-dark">{b.nama_bahan}</td>
                          <td>
                            {b.jenis_bahan === "kering" ? (
                              <span className="badge bg-warning text-dark">
                                <i className="fas fa-box me-1"></i>Kering
                              </span>
                            ) : (
                              <span className="badge bg-info text-dark">
                                <i className="fas fa-tint me-1"></i>Basah
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{b.satuan}</span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group">
                              {/* TOMBOL EDIT DITAMBAHKAN DI SINI */}
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(b)} title="Edit Bahan">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b.id_bahan)} title="Hapus Bahan">
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ================= MODAL EDIT BAHAN ================= */}
      {editingBahan && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 slide-up">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-primary">
                  <i className="fas fa-edit me-2"></i>Edit Bahan
                </h5>
                <button type="button" className="btn-close" onClick={closeEditModal}></button>
              </div>
              <div className="modal-body p-4">
                {/* Peringatan Keamanan Edit */}
                <div className="alert alert-warning border-0 small mb-4 py-2">
                  <i className="fas fa-info-circle me-1"></i> Jangan merubah wujud bahan secara drastis jika sudah terpakai di transaksi.
                </div>

                <form onSubmit={handleSimpanEdit} className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold small mb-1">Nama Bahan</label>
                    <input type="text" className="form-control" value={editForm.nama_bahan} onChange={(e) => setEditForm({ ...editForm, nama_bahan: e.target.value })} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small mb-1">Kategori</label>
                    <select className="form-select bg-light" value={editForm.jenis_bahan} onChange={(e) => setEditForm({ ...editForm, jenis_bahan: e.target.value })}>
                      <option value="kering">Kering</option>
                      <option value="basah">Basah</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-semibold small mb-1">Satuan</label>
                    <input type="text" className="form-control" value={editForm.satuan} onChange={(e) => setEditForm({ ...editForm, satuan: e.target.value })} required />
                  </div>

                  {/* Stok sengaja disembunyikan / dibuat readonly agar owner tidak memanipulasi stok secara diam-diam tanpa mencatat log belanja/penggunaan */}
                  <input type="hidden" value={editForm.stok} />

                  <div className="col-12 mt-4 d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={closeEditModal}>
                      Batal
                    </button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-semibold" disabled={isSavingEdit}>
                      {isSavingEdit ? <span className="spinner-border spinner-border-sm me-2"></span> : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
