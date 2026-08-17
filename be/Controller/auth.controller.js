const authService = require('../Service/auth.service');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
        }

        const dataLogin = await authService.loginUser(username, password);
        
        res.status(200).json({ 
            success: true, 
            data: dataLogin, 
            message: 'Login berhasil!' 
        });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

module.exports = { login };