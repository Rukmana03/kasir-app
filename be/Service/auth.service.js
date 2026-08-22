const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "RAHASIA_NEGARA_WAROENG_BAKMI_123";

const loginUser = async (username, password) => {
  // 1. Cari user berdasarkan username
  const user = await prisma.user.findUnique({
    where: { username: username },
  });

  if (!user) {
    throw new Error("Username atau Password salah");
  }

  let isPasswordValid = false;

  // Cek apakah password di DB sudah di-hash (cirinya panjang 60 karakter & diawali $2b$)
  if (user.password.startsWith("$2b$")) {
    isPasswordValid = await bcrypt.compare(password, user.password);
  } else {
    // Fallback untuk password dummy teks biasa (misal: "password123")
    isPasswordValid = password === user.password;
  }

  if (!isPasswordValid) {
    throw new Error("Password salah!");
  }

  // 3. Jika cocok, buatkan Token JWT
  const token = jwt.sign(
    {
      id_user: user.id_user,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "12h" }, // Token berlaku 12 jam (cocok untuk 1 shift kerja kasir)
  );

  // Kembalikan data user (tanpa password) beserta tokennya
  return {
    id_user: user.id_user,
    nama: user.nama,
    role: user.role,
    token: token,
  };
};

module.exports = {
  loginUser,
  JWT_SECRET,
};
