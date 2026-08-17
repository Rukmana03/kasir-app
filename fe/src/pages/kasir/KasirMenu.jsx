import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function KasirMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Ambil data dari KasirDashboard (Meja & Pelanggan)
  const orderData = location.state;

  // Jika diakses langsung tanpa lewat dashboard, kembalikan ke /pos
  useEffect(() => {
    if (!orderData) {
      navigate('/dashboard');
    }
  }, [orderData, navigate]);

  // 2. State Manajemen Data
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState(['Makanan', 'Minuman', 'Cemilan']);
  const [loading, setLoading] = useState(true);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // State Keranjang & Input per Menu
  const [cart, setCart] = useState([]);
  const [menuInputs, setMenuInputs] = useState({}); // Menyimpan input qty & catatan sementara di grid menu
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // 3. Fetch Data Menu dari Backend
  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/menu', axiosConfig);
      setMenus(res.data.data || []);
      
      // Ambil kategori unik dari data menu (jika kategori tidak di-hardcode)
      if (res.data.data) {
        const uniqueCategories = [...new Set(res.data.data.map(item => item.kategori).filter(Boolean))];
        if(uniqueCategories.length > 0) setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Gagal memuat menu", error);
      // Data dummy sementara jika API belum siap
      setMenus([
        { id_menu: 1, nama_menu: 'Bakmi Ayam Jamur', harga: 20000, kategori: 'Makanan' },
        { id_menu: 2, nama_menu: 'Es Teh Manis', harga: 5000, kategori: 'Minuman' },
        { id_menu: 3, nama_menu: 'Pangsit Rebus', harga: 15000, kategori: 'Cemilan' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 4. Logika Keranjang & Input Menu
  const handleInputMenu = (id_menu, field, value) => {
    setMenuInputs(prev => ({
      ...prev,
      [id_menu]: {
        ...prev[id_menu],
        [field]: value
      }
    }));
  };

  const getMenuInput = (id_menu) => {
    return menuInputs[id_menu] || { qty: 1, notes: '' };
  };

  const addToCart = (menu) => {
    const input = getMenuInput(menu.id_menu);
    const qtyToAdd = parseInt(input.qty) || 1;
    
    setCart(prevCart => {
      // Cek apakah menu yang sama dengan catatan yang SAMA persis sudah ada di keranjang
      const existingItemIndex = prevCart.findIndex(item => item.id_menu === menu.id_menu && item.notes === input.notes);
      
      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].qty += qtyToAdd;
        newCart[existingItemIndex].total = newCart[existingItemIndex].qty * newCart[existingItemIndex].harga;
        return newCart;
      }

      // Jika belum ada, tambahkan sebagai item baru
      return [...prevCart, {
        id_cart: Date.now() + Math.random(), // Unique ID untuk list key
        id_menu: menu.id_menu,
        nama_menu: menu.nama_menu,
        harga: menu.harga,
        qty: qtyToAdd,
        notes: input.notes,
        total: menu.harga * qtyToAdd
      }];
    });

    // Reset input setelah dimasukkan ke keranjang
    handleInputMenu(menu.id_menu, 'qty', 1);
    handleInputMenu(menu.id_menu, 'notes', '');
  };

  // Membuat Draft ID otomatis (Contoh: 20260629-002)
  const [draftId] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomUrut = String(Math.floor(Math.random() * 999)).padStart(3, '0');
    return `${yyyy}${mm}${dd}-${randomUrut}`; 
  });

  const updateCartItem = (id_cart, deltaQty) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id_cart === id_cart) {
        const newQty = Math.max(1, item.qty + deltaQty); // Minimal 1
        return { ...item, qty: newQty, total: newQty * item.harga };
      }
      return item;
    }));
  };

  const removeFromCart = (id_cart) => {
    setCart(prevCart => prevCart.filter(item => item.id_cart !== id_cart));
  };

  // 5. Kalkulasi & Checkout
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('Keranjang masih kosong!');
    
    // Redirect ke halaman Konfirmasi dengan membawa seluruh data
    navigate('/kasir/confirm', {
      state: {
        ...orderData,
        cart,
        subtotal,
        paymentMethod,
        draftId: draftId
      }
    });
  };

  // Filter Menu yang Tampil
  const filteredMenus = menus.filter(m => {
    const matchSearch = m.nama_menu.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory ? m.kategori === selectedCategory : true;
    return matchSearch && matchCategory;
  });

  if (!orderData) return null; // Mencegah render sesaat sebelum redirect

  return (
    <div className="container-fluid py-4 fade-in" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h4 fw-bold text-primary mb-1"><i className="fas fa-utensils me-2"></i>Pilih Menu</h1>
          <p className="text-muted mb-0">
            Transaksi #{draftId} 
          {orderData.customer_name && orderData.customer_name !== 'Guest' && ` • Pelanggan: ${orderData.customer_name}`}
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-white text-dark px-3 py-2 border shadow-sm">
            {orderData.tipePesanan === 'Takeaway' ? 'Takeaway' : (orderData.nama_meja || orderData.name || `meja ${orderData.id_meja || '-'}`).toLowerCase()}
          </span>
          <span className="badge bg-primary px-3 py-2 shadow-sm">
            {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date())}
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* ================= KIRI: PENCARIAN & GRID MENU ================= */}
        <div className="col-xl-8 col-lg-7">
          
          {/* Section Pencarian & Filter */}
          <div className="card border-0 shadow-sm mb-4 rounded-4">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-12 col-lg-7">
                  <label className="form-label small text-muted fw-semibold mb-2">
                    <i className="fas fa-search me-1"></i>Pencarian Menu
                  </label>
                  <div className="position-relative">
                    <input 
                      type="text" 
                      className="form-control form-control-lg pe-5 search-input bg-light border-0" 
                      placeholder="Ketik nama menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-2 text-muted" onClick={() => setSearchQuery('')}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-12 col-lg-5">
                  <label className="form-label small text-muted fw-semibold mb-2">
                    <i class="fas fa-tags me-1"></i>Kategori
                  </label>
                  <select 
                    className="form-select form-select-lg category-select bg-light border-0"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">🍽️ Semua Kategori</option>
                    {categories.map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading / Empty State */}
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : filteredMenus.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body text-center py-5">
                <i class="fas fa-search fa-4x text-muted opacity-25 mb-4"></i>
                <h5 className="text-muted mb-2">Tidak ada menu yang ditemukan</h5>
                <button className="btn btn-outline-primary rounded-pill mt-3" onClick={() => {setSearchQuery(''); setSelectedCategory('');}}>
                  <i class="fas fa-undo me-2"></i>Reset Filter
                </button>
              </div>
            </div>
          ) : (
            
            /* Grid Kartu Menu */
            <div className="row g-4 menu-grid">
              {filteredMenus.map(m => (
                <div className="col-12 col-sm-6 col-xl-4" key={m.id_menu}>
                  <div className="card h-100 border-0 shadow-sm menu-card rounded-4">
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                          {m.kategori || '🍽️ Umum'}
                        </span>
                        <div className="h5 fw-bold text-success mb-0">Rp {m.harga.toLocaleString('id-ID')}</div>
                      </div>

                      <h5 className="card-title mb-3 fw-bold text-dark">{m.nama_menu}</h5>

                      {/* Form Tambah ke Keranjang */}
                      <div className="mt-auto pt-3 border-top">
                        <div className="mb-3">
                          <label className="form-label small text-muted mb-1">Jumlah</label>
                          <div className="input-group input-group-sm">
                            <button className="btn btn-outline-secondary" onClick={() => handleInputMenu(m.id_menu, 'qty', Math.max(1, getMenuInput(m.id_menu).qty - 1))}>
                              <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" className="form-control text-center fw-bold" value={getMenuInput(m.id_menu).qty} readOnly />
                            <button className="btn btn-outline-secondary" onClick={() => handleInputMenu(m.id_menu, 'qty', getMenuInput(m.id_menu).qty + 1)}>
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small text-muted mb-1">Catatan</label>
                          <input 
                            type="text" 
                            className="form-control form-control-sm bg-light border-0" 
                            placeholder="Tambahan, pedas, dll"
                            value={getMenuInput(m.id_menu).notes}
                            onChange={(e) => handleInputMenu(m.id_menu, 'notes', e.target.value)}
                          />
                        </div>

                        <button className="btn btn-primary w-100 fw-semibold rounded-pill shadow-sm" onClick={() => addToCart(m)}>
                          <i className="fas fa-plus-circle me-2"></i>Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= KANAN: KERANJANG BELANJA ================= */}
        <div className="col-xl-4 col-lg-5">
          <div className="position-sticky" style={{ top: '2rem' }}>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              
              {/* Header Keranjang */}
              <div className="card-header bg-primary text-white border-0 py-3 px-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-shopping-cart me-2 fs-5"></i><strong className="fs-5">Keranjang</strong>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <span className="badge bg-white text-primary rounded-pill px-2">{cart.length} item</span>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-sm btn-outline-light rounded-pill border-0" title="Ganti Meja">
                      <i className="fas fa-exchange-alt"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-body p-4 bg-white">
                {cart.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-shopping-cart fa-3x text-muted opacity-25 mb-3"></i>
                    <h6 className="text-muted mb-0">Keranjang masih kosong</h6>
                  </div>
                ) : (
                  <>
                    {/* List Item Keranjang */}
                    <div className="cart-items mb-4 pe-2" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                      {cart.map((item) => (
                        <div className="border rounded-4 p-3 mb-3 bg-light" key={item.id_cart}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="flex-grow-1 pe-2">
                              <h6 className="mb-1 fw-bold text-dark">{item.nama_menu}</h6>
                              <div className="small text-muted">
                                Rp {item.harga.toLocaleString('id-ID')} × {item.qty}
                                <span className="fw-bold text-success ms-2">= Rp {item.total.toLocaleString('id-ID')}</span>
                              </div>
                              {item.notes && (
                                <div className="small text-primary mt-1 fw-semibold"><i className="fas fa-sticky-note me-1"></i>{item.notes}</div>
                              )}
                            </div>
                            <button className="btn btn-sm btn-outline-danger border-0" onClick={() => removeFromCart(item.id_cart)}>
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>

                          <div className="d-flex align-items-center mt-2">
                            <div className="input-group input-group-sm w-auto shadow-sm rounded-pill overflow-hidden">
                              <button className="btn btn-white border px-3" onClick={() => updateCartItem(item.id_cart, -1)}><i className="fas fa-minus text-danger"></i></button>
                              <div className="form-control text-center border-top border-bottom fw-bold" style={{ width: '50px' }}>{item.qty}</div>
                              <button className="btn btn-white border px-3" onClick={() => updateCartItem(item.id_cart, 1)}><i className="fas fa-plus text-success"></i></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ringkasan & Pembayaran */}
                    <div className="border-top pt-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="h5 mb-0 fw-bold text-muted">Subtotal</span>
                        <span className="h4 mb-0 fw-bold text-primary">Rp {subtotal.toLocaleString('id-ID')}</span>
                      </div>

                      <form onSubmit={handleCheckout}>
                        <div className="mb-4">
                          <label className="form-label fw-semibold mb-2">Metode Pembayaran</label>
                          <div className="row g-2">
                            <div className="col-6">
                              <input type="radio" className="btn-check" name="payment" id="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                              <label className="btn btn-outline-success w-100 p-3 rounded-3 shadow-sm" htmlFor="cash">
                                <i className="fas fa-money-bill-wave d-block mb-2 fs-4"></i><strong>Cash</strong>
                              </label>
                            </div>
                            <div className="col-6">
                              <input type="radio" className="btn-check" name="payment" id="qris" checked={paymentMethod === 'qris'} onChange={() => setPaymentMethod('qris')} />
                              <label className="btn btn-outline-primary w-100 p-3 rounded-3 shadow-sm" htmlFor="qris">
                                <i className="fas fa-qrcode d-block mb-2 fs-4"></i><strong>QRIS</strong>
                              </label>
                            </div>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-success btn-lg w-100 fw-bold rounded-pill shadow py-3">
                          <i className="fas fa-check-circle me-2"></i>Konfirmasi Pesanan
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS KHUSUS HALAMAN INI */}
      <style>{`
        .menu-card { transition: all .3s ease; }
        .menu-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,.08) !important; }
        
        .search-input:focus, .category-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, .15);
          background-color: #fff !important;
        }

        .btn-check:checked + .btn {
          border-width: 2px;
          transform: scale(1.02);
          box-shadow: 0 8px 15px rgba(0,0,0,.1) !important;
        }

        /* Styling Scrollbar Keranjang */
        .cart-items::-webkit-scrollbar { width: 6px; }
        .cart-items::-webkit-scrollbar-track { background: transparent; }
        .cart-items::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }
        .cart-items::-webkit-scrollbar-thumb:hover { background: #adb5bd; }

        .menu-grid { animation: fadeInUp 0.4s ease-out; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}