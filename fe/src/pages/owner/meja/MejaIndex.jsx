import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MejaIndex() {
  const [mejas, setMejas] = useState([]);

  // State untuk UI (Loading, Alert, Modal Delete)
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mejaToDelete, setMejaToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Efek untuk mengambil data dari Backend
  useEffect(() => {
    fetchMejas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMejas = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(import.meta.env.VITE_API_BASE_URL + "/meja", axiosConfig);

      const data = response.data.data;
      setMejas(data.items || data);
    } catch (error) {
      showAlert("danger", "Gagal mengambil data meja dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Fungsi Buka Modal Hapus
  const confirmDelete = (meja) => {
    setMejaToDelete(meja);
    setShowDeleteModal(true);
  };

  // Fungsi Eksekusi Hapus
  const handleDelete = async () => {
    if (!mejaToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/meja/${mejaToDelete.id_meja}`, axiosConfig);
      showAlert("success", "Meja berhasil dihapus.");
      setShowDeleteModal(false);
      fetchMejas();
    } catch (error) {
      showAlert("danger", "Gagal menghapus meja karena masih terhubung ke transaksi aktif.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container-fluid px-0 fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-circle bg-primary-subtle text-primary" style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            <i className="fas fa-chair"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">Kelola Meja</h1>
            <div className="text-muted small">Lihat, ubah, dan hapus data meja</div>
          </div>
        </div>
        <Link to="/meja/create" className="btn btn-primary rounded-pill btn-add-responsive d-flex align-items-center">
          <i className="fas fa-plus me-2"></i>
          <span className="d-none d-md-inline">Tambah Meja</span>
        </Link>
      </div>

      {/* Alerts */}
      {alert && (
        <div className={`alert alert-${alert.type} border-0 shadow-sm alert-dismissible fade show slide-up`}>
          <i className={`fas ${alert.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} me-2`}></i>
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* Card: Table + Tools */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden slide-up">
        <div className="card-body p-0">
          {/* Table Section */}
          <div className="table-responsive p-4">
            <table className="table align-middle table-hover mb-0" id="mejaTable">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: "80px" }}>
                    ID
                  </th>
                  <th>Nama Meja</th>
                  <th style={{ width: "140px" }}>Status</th>
                  <th className="text-end" style={{ width: "140px" }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                    </td>
                  </tr>
                ) : mejas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <i className="fas fa-chair fa-3x mb-3"></i>
                      <p>Belum ada data meja</p>
                    </td>
                  </tr>
                ) : (
                  mejas.map((r) => (
                    <tr key={r.id_meja}>
                      <td className="text-muted text-center fw-semibold">#{r.id_meja}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="table-icon">
                            <i className="fas fa-chair text-primary"></i>
                          </div>
                          <span className="fw-semibold">{r.nomor_meja}</span>
                        </div>
                      </td>
                      <td>
                        {/* Status dipetakan dari is_occupied / status string */}
                        {r.status_meja === "Terisi" ? (
                          <span className="badge bg-warning-subtle text-warning">
                            <i className="fas fa-user-friends me-1"></i> Terisi
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success">
                            <i className="fas fa-check-circle me-1"></i> Tersedia
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Link to={`/meja/edit/${r.id_meja}`} className="btn btn-sm btn-outline-primary rounded-start-pill" title="Edit Meja">
                            <i className="fas fa-pen"></i>
                          </Link>
                          <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split rounded-end-pill" data-bs-toggle="dropdown">
                            <span className="visually-hidden">Toggle Dropdown</span>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => confirmDelete(r)}>
                                <i className="fas fa-trash me-2"></i>Hapus Meja
                              </button>
                            </li>
                          </ul>
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

      {/* Modal Hapus */}
      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="fas fa-triangle-exclamation me-2"></i>Konfirmasi Hapus
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body text-center py-4">
                <div className="text-danger mb-3">
                  <i className="fas fa-chair fa-3x"></i>
                </div>
                <p className="mb-2">Yakin ingin menghapus meja:</p>
                <p className="fw-bold fs-5 text-primary mb-3">{mejaToDelete?.nomor_meja}</p>
                <p className="text-muted small">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>
                  <i className="fas fa-times me-1"></i>Batal
                </button>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    "Menghapus..."
                  ) : (
                    <>
                      <i className="fas fa-trash me-1"></i>Ya, Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
