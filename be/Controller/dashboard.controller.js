const dashboardService = require('../Service/dashboard.service');

const getDashboard = async (req, res) => {
    try {
        const period = req.query.period || 'daily'; 
        
        const data = await dashboardService.getRingkasanDashboard(period);
        
        res.status(200).json({ 
            success: true, 
            data: data,
            message: 'Data ringkasan dashboard berhasil dimuat'
        });
    } catch (error) {
        console.error("ERROR DASHBOARD:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboard
};