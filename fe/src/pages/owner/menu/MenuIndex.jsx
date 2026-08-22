import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MenuIndex() {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, lastPage: 1 });

  const [sortField, setSortField] = useState("id_menu");
  const [sortOrder, setSortOrder] = useState("asc");

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ================= STATE UNTUK FITUR RESEP =================
  const [showResepModal, setShowResepModal] = useState(false);
  const [activeMenuResep, setActiveMenuResep] = useState(null);
  const [daftarBahanMaster, setDaftarBahanMaster] = useState([]); // Untuk pilihan Dropdown
  const [resepList, setResepList] = useState([]); // Daftar resep menu yang dipilih
  const [formResep, setFormResep] = useState({ id_bahan: "", jumlah_butuh: "" });
  const [isSavingResep, setIsSavingResep] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchMenus();
    // Saat halaman menu dibuka, sekalian fetch daftar bahan untuk jaga-jaga kalau Owner mau bikin resep
    fetchBahanMaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, categoryFilter, page, perPage]);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(import.meta.env.VITE_API_BASE_URL + "/menu", {
        ...axiosConfig,
        params: { search: debouncedSearch, status: statusFilter, category: categoryFilter, page, limit: perPage },
      });
      const data = response.data.data;
      setMenus(data.items || data);

      if (data.pagination) setPagination({ total: data.pagination.total, lastPage: data.pagination.totalPages });
      else setPagination({ total: (data.items || data).length, lastPage: 1 });

      const uniqueCategories = [...new Set((data.items || data).map((m) => m.kategori).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      showAlert("danger", "Gagal mengambil data menu.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBahanMaster = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_BASE_URL + "/bahan", axiosConfig);
      setDaftarBahanMaster(response.data.data || []);
    } catch (error) {
      console.error("Gagal load bahan master");
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleToggleStatus = async (menu) => {
    try {
      const newStatus = menu.status_menu === "tersedia" ? "habis" : "tersedia";
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/menu/${menu.id_menu}`, { ...menu, status_menu: newStatus }, axiosConfig);
      showAlert("success", `Status menu berhasil diubah.`);
      fetchMenus();
    } catch (error) {
      showAlert("danger", "Gagal mengubah status menu.");
    }
  };

  const confirmDelete = (menu) => {
    setMenuToDelete(menu);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!menuToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/menu/${menuToDelete.id_menu}`, axiosConfig);
      showAlert("success", "Menu berhasil dihapus.");
      setShowDeleteModal(false);
      fetchMenus();
    } catch (error) {
      showAlert("danger", "Tidak dapat dihapus karena terhubung transaksi.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ================= FUNGSI UNTUK MODAL RESEP =================
  const openResepModal = async (menu) => {
    setActiveMenuResep(menu);
    setShowResepModal(true);
    // Panggil resep dari backend untuk menu ini
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menu/${menu.id_menu}/resep`, axiosConfig);
      setResepList(res.data.data || []);
    } catch (error) {
      setResepList([]); // Jika error/kosong set jadi array kosong
    }
  };

  const closeResepModal = () => {
    setShowResepModal(false);
    setActiveMenuResep(null);
    setFormResep({ id_bahan: "", jumlah_butuh: "" });
  };

  const handleTambahResep = async (e) => {
    e.preventDefault();
    setIsSavingResep(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/menu/${activeMenuResep.id_menu}/resep`,
        {
          id_bahan: Number(formResep.id_bahan),
          jumlah_butuh: Number(formResep.jumlah_butuh),
        },
        axiosConfig,
      );

      // Refresh list resep di dalam modal
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menu/${activeMenuResep.id_menu}/resep`, axiosConfig);
      setResepList(res.data.data || []);
      setFormResep({ id_bahan: "", jumlah_butuh: "" });
    } catch (error) {
      showAlert("danger", "Gagal menambahkan bahan ke resep.");
    } finally {
      setIsSavingResep(false);
    }
  };

  const handleHapusResep = async (id_komposisi) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/menu/resep/${id_komposisi}`, axiosConfig);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/menu/${activeMenuResep.id_menu}/resep`, axiosConfig);
      setResepList(res.data.data || []);
    } catch (error) {
      showAlert("danger", "Gagal menghapus bahan dari resep.");
    }
  };

  const totalActive = menus.filter((m) => m.status_menu === "tersedia").length;
  const totalInactive = menus.length - totalActive;

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <i className="fas fa-sort text-muted ms-1" style={{ opacity: 0.3 }}></i>;
    return sortOrder === "asc" ? <i className="fas fa-sort-up ms-1"></i> : <i className="fas fa-sort-down ms-1"></i>;
  };

  const processedMenus = menus
    .filter((m) => {
      const matchSearch = m.nama_menu.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchStatus = statusFilter ? (statusFilter === "tersedia" ? m.status_menu === "tersedia" : m.status_menu !== "tersedia") : true;
      const matchCategory = categoryFilter ? m.kategori === categoryFilter : true;
      return matchSearch && matchStatus && matchCategory;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (sortField === "harga") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="container-fluid px-0 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-circle bg-primary-subtle text-primary" style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            <i className="fas fa-utensils"></i>
          </div>
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">Kelola Menu</h1>
            <div className="text-muted small">Lihat, ubah, nonaktifkan, dan atur resep menu</div>
          </div>
        </div>
        <Link to="/menu/create" className="btn btn-primary rounded-pill d-flex align-items-center">
          <i className="fas fa-plus me-2"></i>
          <span className="d-none d-md-inline">Tambah Menu</span>
        </Link>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type} border-0 shadow-sm alert-dismissible fade show slide-up`}>
          <i className={`fas ${alert.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} me-2`}></i>
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden slide-up">
        <div className="card-body p-0">
          <div className="bg-light p-4 border-bottom">
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-6">
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input type="text" className="form-control border-start-0 ps-0" placeholder="Cari berdasarkan nama menu..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  {search && (
                    <button className="btn btn-outline-secondary bg-white border-start-0" onClick={() => setSearch("")}>
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex gap-2">
                    <select className="form-select form-select-sm" style={{ minWidth: "140px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="">Semua Status</option>
                      <option value="tersedia">Aktif (Tersedia)</option>
                      <option value="habis">Tidak Aktif (Habis)</option>
                    </select>
                    <select className="form-select form-select-sm" style={{ minWidth: "160px" }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                      <option value="">Semua Kategori</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive p-4">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-center user-select-none" style={{ width: "80px", cursor: "pointer" }} onClick={() => handleSort("id_menu")}>
                    ID {getSortIcon("id_menu")}
                  </th>
                  <th className="user-select-none" style={{ cursor: "pointer" }} onClick={() => handleSort("nama_menu")}>
                    Nama Menu {getSortIcon("nama_menu")}
                  </th>
                  <th style={{ width: "160px" }}>Kategori</th>
                  <th className="text-end user-select-none" style={{ width: "140px", cursor: "pointer" }} onClick={() => handleSort("harga")}>
                    Harga {getSortIcon("harga")}
                  </th>
                  <th style={{ width: "120px" }}>Status</th>
                  <th className="text-end" style={{ width: "140px" }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                    </td>
                  </tr>
                ) : processedMenus.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-5">
                      <i className="fas fa-search fa-3x mb-3 text-secondary"></i>
                      <p>Menu tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  processedMenus.map((r) => (
                    <tr key={r.id_menu}>
                      <td className="text-muted text-center fw-semibold">#{r.id_menu}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-utensils text-primary"></i>
                          <span className="fw-semibold">{r.nama_menu}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info text-dark rounded-pill">{r.kategori}</span>
                      </td>
                      <td className="text-end fw-semibold">Rp {r.harga.toLocaleString("id-ID")}</td>
                      <td>
                        {r.status_menu === "tersedia" ? (
                          <span className="badge bg-success rounded-pill">
                            <i className="fas fa-check-circle me-1"></i> Aktif
                          </span>
                        ) : (
                          <span className="badge bg-secondary rounded-pill">
                            <i className="fas fa-times-circle me-1"></i> Tidak Aktif
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Link to={`/menu/edit/${r.id_menu}`} className="btn btn-sm btn-outline-primary rounded-start-pill" title="Edit Data Dasar">
                            <i className="fas fa-pen"></i>
                          </Link>
                          <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle dropdown-toggle-split rounded-end-pill" data-bs-toggle="dropdown"></button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                            {/* TOMBOL ATUR RESEP DI SINI */}
                            <li>
                              <button className="dropdown-item fw-bold text-primary" onClick={() => openResepModal(r)}>
                                <i className="fas fa-clipboard-list me-2"></i>Atur Resep Bahan
                              </button>
                            </li>
                            <li>
                              <hr className="dropdown-divider" />
                            </li>
                            <li>
                              <button className="dropdown-item" onClick={() => handleToggleStatus(r)}>
                                <i className="fas fa-power-off me-2"></i>
                                {r.status_menu === "tersedia" ? "Nonaktifkan Menu" : "Aktifkan Menu"}
                              </button>
                            </li>
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => confirmDelete(r)}>
                                <i className="fas fa-trash me-2"></i>Hapus Menu
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

      {/* ================= MODAL ATUR RESEP ================= */}
      {showResepModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 slide-up">
              <div className="modal-header border-bottom-0 pb-0 pt-4 px-4">
                <div>
                  <h5 className="modal-title fw-bold text-primary">
                    <i className="fas fa-clipboard-list me-2"></i>Resep Menu
                  </h5>
                  <p className="text-muted small mb-0">
                    Menu: <strong>{activeMenuResep?.nama_menu}</strong>
                  </p>
                </div>
                <button type="button" className="btn-close" onClick={closeResepModal}></button>
              </div>
              <div className="modal-body p-4">
                {/* Form Tambah Bahan ke Resep */}
                <form onSubmit={handleTambahResep} className="row g-2 mb-4 bg-light p-3 rounded-3 border">
                  <div className="col-md-5">
                    <label className="form-label small fw-semibold mb-1">Pilih Bahan Baku</label>
                    <select className="form-select form-select-sm" value={formResep.id_bahan} onChange={(e) => setFormResep({ ...formResep, id_bahan: e.target.value })} required>
                      <option value="">— Cari Bahan —</option>
                      {daftarBahanMaster.map((b) => (
                        <option key={b.id_bahan} value={b.id_bahan}>
                          {b.nama_bahan} ({b.satuan})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold mb-1">Kebutuhan per Porsi</label>
                    <div className="input-group input-group-sm">
                      <input type="number" step="0.01" className="form-control" placeholder="Cth: 100" value={formResep.jumlah_butuh} onChange={(e) => setFormResep({ ...formResep, jumlah_butuh: e.target.value })} required />
                    </div>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary btn-sm w-100 fw-bold" disabled={isSavingResep}>
                      {isSavingResep ? (
                        "Menyimpan..."
                      ) : (
                        <>
                          <i className="fas fa-plus me-1"></i> Tambah
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Tabel Daftar Resep Saat Ini */}
                <h6 className="fw-bold mb-3 border-bottom pb-2">Komposisi Bahan Saat Ini</h6>
                <div className="table-responsive" style={{ maxHeight: "30vh", overflow: "auto" }}>
                  <table className="table table-sm table-hover align-middle">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Bahan Baku</th>
                        <th>Kebutuhan per Porsi</th>
                        <th className="text-end">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resepList.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="text-center text-muted py-4 small">
                            Belum ada bahan yang ditambahkan ke resep ini.
                          </td>
                        </tr>
                      ) : (
                        resepList.map((resep) => (
                          <tr key={resep.id_komposisi}>
                            <td className="fw-semibold">{resep.bahan?.nama_bahan}</td>
                            <td>
                              <span className="badge bg-primary text-white p-2">
                                {resep.jumlah_butuh} {resep.bahan?.satuan}
                              </span>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleHapusResep(resep.id_komposisi)} title="Hapus dari resep">
                                <i className="fas fa-times"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 px-4 pb-4">
                <button type="button" className="btn btn-light rounded-pill px-4 w-100" onClick={closeResepModal}>
                  Selesai & Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Data Menu Tetap Dipertahankan */}
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
                <i className="fas fa-utensils fa-3x text-danger mb-3"></i>
                <p className="mb-2">Yakin ingin menghapus menu:</p>
                <p className="fw-bold fs-5 text-primary">{menuToDelete?.nama_menu}</p>
                <p className="text-muted small">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
              <div className="modal-footer justify-content-center border-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>
                  Batal
                </button>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? (
                    "Menghapus..."
                  ) : (
                    <>
                      <i className="fas fa-trash me-1"></i> Ya, Hapus
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
