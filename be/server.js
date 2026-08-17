require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server backend Waroeng Bakmi berjalan di port ${PORT}`);
});