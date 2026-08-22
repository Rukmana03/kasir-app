import { useState, useEffect } from "react";
import axios from "axios";

export default function KalkulatorBelanja() {
  const [menuList, setMenuList] = useState([]);
  const [targetItems, setTargetItems] = useState([]);
  const [hasilKalkulasi, setHasilKalkulasi] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState("");
  const [porsi, setPorsi] = useState("");

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_BASE_URL + "/menu", axiosConfig);
        setMenuList(res.data.data || []);
      } catch (error) {
        console.error("Gagal memuat master menu");
      }
    };
    fetchMenu();
  }, []);

  const handleTambahItem = () => {
    if (!selectedMenu || !porsi || porsi <= 0) return;

    const menuObj = menuList.find((m) => m.id_menu === Number(selectedMenu));
    if (!menuObj) return;

    const existingIndex = targetItems.findIndex((item) => item.id_menu === menuObj.id_menu);
    if (existingIndex >= 0) {
      const updated = [...targetItems];
      updated[existingIndex].porsi += Number(porsi);
      setTargetItems(updated);
    } else {
      setTargetItems([...targetItems, { id_menu: menuObj.id_menu, nama_menu: menuObj.nama_menu, porsi: Number(porsi) }]);
    }

    setSelectedMenu("");
    setPorsi("");
    setHasilKalkulasi([]);
    setIsCalculated(false);
  };

  const handleHapusItem = (id_menu) => {
    setTargetItems(targetItems.filter((item) => item.id_menu !== id_menu));
    setHasilKalkulasi([]);
    setIsCalculated(false);
  };

  const handleHitung = async () => {
    if (targetItems.length === 0) return;
    setLoading(true);
    try {
      const payload = {
        targetMenu: targetItems.map((item) => ({ id_menu: item.id_menu, porsi: item.porsi })),
      };

      const res = await axios.post(import.meta.env.VITE_API_BASE_URL + "/rekomendasi/kalkulator", payload, axiosConfig);

      const responseData = res.data.data || res.data;

      // LOGIKA BARU: Menyiapkan field khusus untuk Kemasan Pasar
      const dataDenganKemasan = responseData.map((item) => {
        // Secara default, jika gram/ml kita asumsikan per 1000 (1 Kg / 1 Liter)
        const defaultIsi = item.satuan === "gram" || item.satuan === "ml" ? 1000 : 1;
        const hargaAsumsi = (item.estimasi_harga_satuan || 0) * defaultIsi;

        return {
          ...item,
          harga_kemasan: hargaAsumsi,
          isi_kemasan: defaultIsi,
          estimasi_biaya_total: item.harus_beli > 0 ? (item.harus_beli / defaultIsi) * hargaAsumsi : 0,
        };
      });

      setHasilKalkulasi(dataDenganKemasan);
      setIsCalculated(true);
    } catch (error) {
      console.error(error);
      alert("Gagal memproses kalkulasi. Pastikan server berjalan.");
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI BARU: Dinamis mengubah Harga atau Isi Kemasan
  const handleUbahPasar = (index, field, value) => {
    const newHasil = [...hasilKalkulasi];
    newHasil[index][field] = Number(value);

    // Hitung ulang Total Biaya = (Butuh / Isi Kemasan) * Harga Kemasan
    const butuh = newHasil[index].harus_beli;
    const harga = newHasil[index].harga_kemasan || 0;
    const isi = newHasil[index].isi_kemasan || 1;

    if (isi > 0) {
      newHasil[index].estimasi_biaya_total = (butuh / isi) * harga;
    } else {
      newHasil[index].estimasi_biaya_total = 0;
    }

    setHasilKalkulasi(newHasil);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
      <div className="card-body p-4 bg-primary-subtle rounded-4" style={{ backgroundColor: "rgba(13,110,253,.05)" }}>
        <div className="d-flex align-items-center mb-3">
          <div className="icon-circle bg-primary text-white me-3" style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="fas fa-calculator"></i>
          </div>
          <div>
            <h2 className="h6 mb-0 fw-bold text-primary">Kalkulator Target Perporsi</h2>
            <small className="text-muted">Hitung belanja berdasarkan target porsi spesifik</small>
          </div>
        </div>

        {/* Input Form */}
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <select className="form-select" value={selectedMenu} onChange={(e) => setSelectedMenu(e.target.value)}>
              <option value="">-- Pilih Menu --</option>
              {menuList.map((m) => (
                <option key={m.id_menu} value={m.id_menu}>
                  {m.nama_menu}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" placeholder="Jml Porsi" value={porsi} onChange={(e) => setPorsi(e.target.value)} min="1" />
          </div>
          <div className="col-md-3">
            <button className="btn btn-outline-primary w-100 fw-bold" onClick={handleTambahItem}>
              <i className="fas fa-plus me-1"></i> Tambah
            </button>
          </div>
        </div>

        {/* List Target Menu */}
        {targetItems.length > 0 && (
          <div className="mb-3">
            <div className="d-flex flex-wrap gap-2">
              {targetItems.map((item) => (
                <span key={item.id_menu} className="badge bg-white text-dark border p-2 d-flex align-items-center">
                  <span className="fw-bold me-2">
                    {item.nama_menu} ({item.porsi} porsi)
                  </span>
                  <i className="fas fa-times text-danger ms-2" style={{ cursor: "pointer" }} onClick={() => handleHapusItem(item.id_menu)}></i>
                </span>
              ))}
            </div>
            <button className="btn btn-primary w-100 mt-3 fw-bold shadow-sm" onClick={handleHitung} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="fas fa-bolt me-2"></i>}
              Hitung Kebutuhan Bahan
            </button>
          </div>
        )}

        {/* Hasil Kalkulasi - DIUPDATE DENGAN DUA INPUT KEMASAN */}
        {hasilKalkulasi.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-3 border shadow-sm fade-in">
            <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
              <i className="fas fa-clipboard-list me-2 text-success"></i>Estimasi Belanja & Anggaran
            </h6>

            {/* 1. CSS INLINE UNTUK MENGHILANGKAN PANAH (SPINNERS) PADA INPUT NUMBER */}
            <style>
              {`
                /* Chrome, Safari, Edge, Opera */
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                /* Firefox */
                input[type=number] {
                  -moz-appearance: textfield;
                }
              `}
            </style>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                {/* 2. PENGATURAN LEBAR KOLOM (LAYOUTING) */}
                <thead className="table-light text-center">
                  <tr>
                    <th className="text-start" style={{ width: "25%" }}>
                      Bahan Baku
                    </th>
                    <th style={{ width: "15%" }}>Wajib Beli</th>
                    <th style={{ width: "40%" }}>Input Harga Pasar & Takaran</th>
                    <th className="text-end" style={{ width: "20%" }}>
                      Estimasi Biaya
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {hasilKalkulasi.map((h, index) => (
                    <tr key={index}>
                      <td className="fw-semibold text-start">
                        {h.nama_bahan} <br />
                        <small className="text-muted fw-normal">
                          Sisa: {h.sisa_stok} {h.satuan}
                        </small>
                      </td>

                      <td className="text-center text-danger fw-bold fs-6">
                        {h.harus_beli > 0 ? (
                          <>
                            {h.harus_beli} <span className="fs-7">{h.satuan}</span>
                          </>
                        ) : (
                          <span className="text-success fs-6">
                            <i className="fas fa-check me-1"></i> Aman
                          </span>
                        )}
                      </td>

                      <td>
                        {h.harus_beli > 0 ? (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            {/* 3. KOTAK INPUT DIBUAT FIX MAX-WIDTH AGAR RAPIH */}
                            <div className="input-group input-group-sm shadow-sm" style={{ maxWidth: "140px" }}>
                              <span className="input-group-text bg-light text-muted px-2 border-end-0">Rp</span>
                              <input type="number" className="form-control text-end border-start-0 ps-0" value={h.harga_kemasan || ""} onChange={(e) => handleUbahPasar(index, "harga_kemasan", e.target.value)} placeholder="Harga" />
                            </div>

                            <span className="text-muted small fw-semibold">per</span>

                            <div className="input-group input-group-sm shadow-sm" style={{ maxWidth: "120px" }}>
                              <input type="number" className="form-control text-center border-end-0 pe-0" value={h.isi_kemasan || ""} onChange={(e) => handleUbahPasar(index, "isi_kemasan", e.target.value)} placeholder="Takaran" />
                              <span className="input-group-text bg-light text-muted px-2" style={{ fontSize: "0.75rem" }}>
                                {h.satuan}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-muted">-</div>
                        )}
                      </td>

                      <td className="text-end fw-bold text-primary">{h.harus_beli > 0 ? `Rp ${Math.round(h.estimasi_biaya_total || 0).toLocaleString("id-ID")}` : "Rp 0"}</td>
                    </tr>
                  ))}

                  {/* Baris Total Anggaran Keseluruhan */}
                  <tr className="table-primary border-primary">
                    <td colSpan="3" className="text-end fw-bold fs-6">
                      TOTAL ESTIMASI ANGGARAN:
                    </td>
                    <td className="text-end fw-bold fs-5 text-primary">Rp {Math.round(hasilKalkulasi.reduce((total, item) => total + (item.estimasi_biaya_total || 0), 0)).toLocaleString("id-ID")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="alert alert-info mt-3 mb-0 small py-2 border-0 shadow-sm rounded-3">
              <i className="fas fa-info-circle me-2 fs-6"></i>
              <strong>Cara Pakai:</strong> Jika Anda butuh 250 gram daging, namun di pasar dijual 1 Pack isi <strong>800 gram</strong> seharga <strong>Rp 40.000</strong>, cukup isi kotak harga dengan 40000 dan kotak takaran dengan 800.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
