const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT için gizli bir anahtar kelime (Normalde .env dosyasında saklanır)
const JWT_SECRET = process.env.JWT_SECRET || 'merve_arel_sad_projesi_gizli_anahtari_2026';

// 1. KULLANICI KAYDI (Register)
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Girdi Doğrulaması (Validation)
        if (!email || !password) {
            return res.status(400).json({ error: 'E-posta ve şifre alanları boş bırakılamaz! 🎀' });
        }

        // Kullanıcı daha önce kayıt olmuş mu kontrolü
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten sisteme kayıtlı! 🗓️' });
        }

        // 🛡️ GÜVENLİK: Şifreyi kırılması imkansız bir hash haline getiriyoruz
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı veritabanına kaydet
        const newUser = await User.create({
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'Kullanıcı kaydı başarıyla oluşturuldu! ✨', userId: newUser.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kayıt işlemi sırasında bir sunucu hatası oluştu.' });
    }
};

// 2. KULLANICI GİRİŞİ (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-posta ve şifre alanları zorunludur! 🎀' });
        }

        // Kullanıcıyı e-postaya göre bul
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Hatalı e-posta veya şifre girdiniz!' });
        }

        // Gelen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştır
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Hatalı e-posta veya şifre girdiniz!' });
        }

        // 🎫 KİMLİK KARTI (JWT Token) ÜRETME: Kullanıcıya 1 gün geçerli token veriyoruz
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Giriş başarılı! Hoş geldiniz 💖',
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Giriş işlemi sırasında bir sunucu hatası oluştu.' });
    }
};