// Merve Yarız - İstanbul Arel Üniversitesi
// Sistem Analizi ve Tasarımı Projesi - Backend Sunucu Ana Dosyası

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');
const sequelize = require('./db'); // Bağımsız veritabanı bağlantımız
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Ayarları
app.use(cors());
app.use(express.json());

// 🔐 ROTALARI TANIMLA (Kullanıcı İşlemleri ve Seyahat Yönetimi)
const authRoutes = require('./routes/authRoutes');
const travelRoutes = require('./routes/travelRoutes');

app.use('/api/auth', authRoutes);       // Giriş ve Kayıt rotaları (/api/auth/register, /api/auth/login)
app.use('/api/travels', travelRoutes);   // Seyahat yönetim rotaları CRUD
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // API Dokümantasyonu

// Veritabanı Bağlantı Testi ve Güvenli Tablo Senkronizasyonu
sequelize.authenticate()
    .then(() => {
        console.log('SQLite Bağlantısı Başarılı.');
        
        // 🛡️ GÜVENLİ SENKRONİZASYON: Tablolarımız kuruldu, artık force:true parametresi yok.
        // Kayıtlı kullanıcılar ve seyahat rotaları kalıcı olarak korunur.
        return sequelize.sync();
    })
    .then(() => {
        console.log('Veritabanı tabloları senkronize edildi, tüm veriler güvende! 💖');
    })
    .catch(err => console.error('Bağlantı veya Senkronizasyon Hatası:', err));

// Sunucu Test Rotası
app.get('/', (req, res) => {
    res.send('Seyahat Planlayıcı SQLite API Çalışıyor (Kullanıcı + JWT Korumalı)... ✨');
});

// Sunucuyu Ateşle
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});