const cetakService = require('../Service/cetak.service');

const printStruk = async (req, res) => {
    try {
        const orderData = req.body;

        // Validasi ketersediaan data pesanan
        if (!orderData || !orderData.cart) {
            return res.status(400).json({
                success: false,
                message: "Data pesanan tidak valid atau kosong"
            });
        }

        // Lempar tugas mencetak ke layer Service
        await cetakService.printStrukKasir(orderData);

        return res.status(200).json({
            success: true,
            message: "Struk berhasil dicetak ke mesin!"
        });
        
    } catch (error) {
        console.error("Error Cetak Controller:", error);
        return res.status(500).json({
            success: false,
            message: "Gagal mencetak. Pastikan printer menyala dan kabel USB terhubung."
        });
    }
};

module.exports = { printStruk };