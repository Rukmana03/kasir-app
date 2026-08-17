import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function KasirReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;
  
  const [kasirName, setKasirName] = useState('Kasir');
  const [isPrinting, setIsPrinting] = useState(false);
  const hasPrinted = useRef(false);

  // FUNGSI PRINT KE BACKEND
  const handlePrintDirect = async () => {
    // Mencegah print dobel jika sedang loading
    if (isPrinting) return; 
    
    setIsPrinting(true);
    try {
      const payload = { ...orderData, kasirName };
      // Pastikan URL ini sesuai dengan port backend Node.js Anda
      const res = await axios.post(import.meta.env.VITE_API_BASE_URL + '/cetak/struk', payload);
      
      if (res.data.success) {
        console.log("Struk berhasil dikirim ke mesin printer.");
      }
    } catch (error) {
      console.error("Gagal cetak:", error);
      alert("Gagal terhubung ke printer. Pastikan backend jalan dan printer menyala.");
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    if (!orderData) {
      navigate('/pos');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.nama) setKasirName(user.nama);

    // 1. Auto-Print saat halaman terbuka (Memanggil fungsi baru)
    if (!hasPrinted.current) {
        handlePrintDirect();
        hasPrinted.current = true; // Tandai bahwa sudah dicetak
    }

    // 2. Shortcut Keyboard: Tekan Ctrl+P untuk print via Backend
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault(); // Mencegah jendela print Google Chrome muncul
        handlePrintDirect(); // Memanggil fungsi cetak backend
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData, navigate]); // Dependensi dikunci agar aman

  const handleSelesai = () => {
    navigate('/dashboard'); 
  };

  if (!orderData) return null;

  // Formatting Tanggal untuk tampilan layar
  const rawDate = orderData.waktuSelesai ? new Date(orderData.waktuSelesai) : new Date();
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).format(rawDate);

  return (
    <div className="receipt-wrapper">
      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="container d-flex flex-column align-items-center">
          <h5 className="mb-3 text-white fw-bold"><i className="fas fa-receipt me-2"></i>Struk Pembayaran</h5>
          <div className="btn-group shadow-sm">
            
            {/* Tombol dimodifikasi untuk memanggil fungsi handlePrintDirect */}
            <button 
                onClick={handlePrintDirect} 
                className="btn btn-primary fw-bold px-4 rounded-start-pill"
                disabled={isPrinting}
            >
              {isPrinting ? (
                <><i className="fas fa-spinner fa-spin me-2"></i>Mencetak...</>
              ) : (
                <><i className="fas fa-print me-2"></i>Print Ulang</>
              )}
            </button>

            <button onClick={handleSelesai} className="btn btn-light fw-bold px-4 rounded-end-pill text-primary">
              <i className="fas fa-table me-2"></i>Ke Daftar Meja
            </button>
          </div>
        </div>
      </div>

      {/* AREA STRUK DI LAYAR (Hanya untuk preview kasir, tidak di-print via browser) */}
      <div className="receipt-container">
        <div className="receipt">
          <div className="header">
            <div className="store-name">🍜 Waroeng Bakmi</div>
            <div className="store-info">Jl. Margonda Raya No. 123, Depok</div>
            <div className="store-info">Telp: (021) 1234-5678</div>
            <div className="store-info">IG: @waroengbakmidepok</div>
          </div>

          <div className="transaction-info">
            <div><strong>No. Transaksi:</strong> {formattedDate.substring(6,10)}{formattedDate.substring(3,5)}{formattedDate.substring(0,2)}-{String(orderData.id_transaksi_real || orderData.draftId).padStart(3, '0')}</div>
            <div><strong>Tanggal:</strong> {formattedDate.replace(/\./g, ':')}</div>
            <div><strong>Kasir:</strong> {kasirName}</div>
            
            {orderData.customer_name && orderData.customer_name !== 'Guest' && (
              <div><strong>Pelanggan:</strong> {orderData.customer_name}</div>
            )}
            
            <div>
              <strong>{orderData.tipePesanan === 'Takeaway' ? 'Jenis' : 'Meja'}: </strong> 
              {orderData.tipePesanan === 'Takeaway' ? 'Takeaway' : (orderData.id_meja || '-')}
            </div>
          </div>

          <div className="divider"></div>

          <table className="items-table">
            <tbody>
              {orderData.cart.map((item, idx) => (
                <tr key={idx}>
                  <td className="item-name">
                    {item.nama_menu}
                    {item.notes && <div className="item-note">Catatan: {item.notes}</div>}
                  </td>
                  <td className="item-qty">{item.qty}x</td>
                  <td className="item-price">
                    {item.total.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divider"></div>

          <table className="totals-table">
            <tbody>
              <tr className="grand-total">
                <td className="label"><strong>TOTAL:</strong></td>
                <td className="value"><strong>Rp {orderData.subtotal.toLocaleString('id-ID')}</strong></td>
              </tr>
              <tr>
                <td className="label">Pembayaran:</td>
                <td className="value fw-bold">{orderData.paymentMethod.toUpperCase()}</td>
              </tr>
              
              {orderData.paymentMethod === 'cash' && (
                <>
                  <tr>
                    <td className="label">Tunai Diterima:</td>
                    <td className="value">Rp {orderData.uangDiterima.toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td className="label">Kembalian:</td>
                    <td className="value">Rp {orderData.kembalian.toLocaleString('id-ID')}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          <div className="footer">
            <div className="footer-message fw-bold">Terima kasih atas kunjungan Anda! 🙏</div>
            <div className="footer-message">Selamat menikmati hidangan</div>
            
            {orderData.paymentMethod === 'qris' && (
              <div className="qr-placeholder">
                <i className="fas fa-qrcode fa-2x mb-1 text-dark"></i>
                <br/>LUNAS QRIS
              </div>
            )}
            
            <div className="mt-3 text-muted" style={{ fontSize: '9px' }}>
              <div>Powered by Sistem Kasir Waroeng Bakmi</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS LAYAR SAJA (Media Print sudah dihilangkan karena print diproses Backend) */}
      <style>{`
        .receipt-wrapper { background-color: #f1f5f9; min-height: 100vh; padding-bottom: 40px; font-family: 'Courier New', Courier, monospace; }
        .toolbar { background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%); padding: 20px 0; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .receipt-container { width: 320px; margin: 0 auto; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 4px; overflow: hidden; }
        .receipt { padding: 20px 15px; line-height: 1.4; font-size: 12px; color: #000; }
        .header { text-align: center; margin-bottom: 15px; }
        .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
        .store-info { font-size: 10px; margin-bottom: 2px; }
        .transaction-info { margin-bottom: 12px; font-size: 11px; }
        .transaction-info div { margin-bottom: 3px; }
        .items-table { width: 100%; margin-bottom: 10px; }
        .items-table td { padding: 4px 0; font-size: 11px; vertical-align: top; }
        .item-name { width: 55%; font-weight: bold; }
        .item-qty { width: 15%; text-align: center; }
        .item-price { width: 30%; text-align: right; }
        .item-note { font-size: 10px; font-weight: normal; font-style: italic; margin-top: 2px; }
        .divider { border-top: 1px dashed #000; margin: 12px 0; }
        .totals-table { width: 100%; margin-bottom: 15px; }
        .totals-table td { padding: 3px 0; font-size: 11px; }
        .totals-table .label { width: 55%; }
        .totals-table .value { width: 45%; text-align: right; }
        .grand-total { font-size: 13px; }
        .footer { text-align: center; margin-top: 15px; font-size: 11px; }
        .footer-message { margin-bottom: 5px; }
        .qr-placeholder { width: 80px; height: 80px; border: 2px dashed #000; border-radius: 8px; margin: 15px auto; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; }
      `}</style>
    </div>
  );
}