const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

const printStrukKasir = async (orderData) => {
    // Inisialisasi koneksi ke printer fisik
    let printer = new ThermalPrinter({
        type: PrinterTypes.EPSON, // Perintah standar mesin POS/Thermal
        interface: 'printer:POS-58', // Pastikan nama ini SAMA PERSIS dengan nama printer di Windows
        characterSet: 'PC858_EURO',
        removeSpecialCharacters: false,
        lineCharacter: "-",
        width: 32, // Lebar maksimal huruf untuk kertas 58mm
    });

    // --- Mulai Menyusun Format Struk ---
    printer.alignCenter();
    printer.println("WAROENG BAKMI");
    printer.println("Jl. Margonda Raya No. 123, Depok");
    printer.println("Telp: (021) 1234-5678");
    printer.drawLine(); // Membuat garis putus-putus otomatis

    printer.alignLeft();
    printer.println(`No. Transaksi: ${orderData.id_transaksi_real || orderData.draftId || '-'}`);
    printer.println(`Tanggal      : ${new Date().toLocaleDateString('id-ID')}`);
    printer.println(`Kasir        : ${orderData.kasirName || 'Kasir'}`);
    printer.println(`Meja         : ${orderData.id_meja || 'Takeaway'}`);
    printer.drawLine();

    // Looping daftar pesanan (Keranjang)
    if (orderData.cart && Array.isArray(orderData.cart)) {
        orderData.cart.forEach(item => {
            // Baris 1: Nama Menu
            printer.println(item.nama_menu);
            // Baris 2: Qty (Kiri) dan Subtotal Harga (Kanan)
            printer.leftRight(
                `  ${item.qty}x`,
                `Rp ${item.total.toLocaleString('id-ID')}`
            );
        });
    }
    printer.drawLine();

    // Total dan Metode Pembayaran
    printer.leftRight("TOTAL:", `Rp ${orderData.subtotal.toLocaleString('id-ID')}`);
    printer.leftRight("Pembayaran:", orderData.paymentMethod ? orderData.paymentMethod.toUpperCase() : '-');

    if (orderData.paymentMethod === 'cash') {
        printer.leftRight("Tunai Diterima:", `Rp ${orderData.uangDiterima.toLocaleString('id-ID')}`);
        printer.leftRight("Kembalian:", `Rp ${orderData.kembalian.toLocaleString('id-ID')}`);
    }

    printer.drawLine();
    printer.alignCenter();
    printer.println("Terima kasih atas kunjungan Anda!");
    printer.println("Selamat menikmati hidangan");

    // Potong kertas (jika didukung mesin) atau beri jarak gulungan
    printer.cut();

    // Eksekusi tembak data ke mesin printer
    await printer.execute();
    return true;
};

module.exports = { printStrukKasir };