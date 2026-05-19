// Merve Yarız - İstanbul Arel Üniversitesi
// Sistem Analizi ve Tasarımı Projesi - Güncel Unit Test Senaryoları

const request = require('supertest');
const { expect } = require('chai');
const express = require('express');
const sequelize = require('../db');
const travelRoutes = require('../routes/travelRoutes');
const authRoutes = require('../routes/authRoutes');

// Testler için izole bir Express geçici sunucu kabuğu oluşturuyoruz
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/travels', travelRoutes);

describe('🧳 Seyahat Planlayıcısı & Günlük Motoru - Unit Testleri', () => {
    let userToken = '';
    let testTravelId = null;

    // Test serisi başlamadan önce veritabanını temizle ve sıfırdan tabloları kur
    before(async () => {
        await sequelize.sync({ force: true });
    });

    // 1. TEST: Kullanıcı Kayıt Senaryosu
    it('Sisteme yeni bir kullanıcı başarıyla kayıt olabilmeli', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'testmerve@arel.edu.tr',
                password: 'sifre12345'
            });
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('message');
    });

    // 2. TEST: Kullanıcı Giriş ve JWT Token Alma Senaryosu
    it('Kayıtlı kullanıcı giriş yaparak JWT Token alabilmeli', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testmerve@arel.edu.tr',
                password: 'sifre12345'
            });
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token');
        userToken = res.body.token; // Sonraki korumalı isteklerde kullanmak için token'ı sakla
    });

    // 3. TEST: Token İle Seyahat Ekleme (Kullanıcıya Özgü CRUD - Create)
    it('Giriş yapmış kullanıcı kendi hesabına yeni seyahat ekleyebilmeli', async () => {
        const res = await request(app)
            .post('/api/travels')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                destination: 'Van',
                date: '2026-09-15', // Gelecek bir tarih
                pnr: 'VANGNLK65'
            });
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
        expect(res.body.destination).to.equal('Van');
        testTravelId = res.body.id; // Günlük yükleme testi için bu seyahat ID'sini sakla
    });

    // 4. TEST: İş Mantığı Doğrulaması (Validation - Geçmiş Tarih Engeli)
    it('Geçmiş bir tarihe seyahat planlanması backend tarafından engellenmeli (400 Request)', async () => {
        const res = await request(app)
            .post('/api/travels')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                destination: 'İstanbul',
                date: '2020-05-17', // Geçmiş tarih
                pnr: 'IST34'
            });
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error');
    });

    // 5. TEST: Günlük Notu ve Fotoğraf Verisi Paketleme Senaryosu (Update)
    it('Seyahate ait günlük notları ve anı fotoğrafları veritabanına şifreli JSON olarak işlenebilmeli', async () => {
        const fakePayload = JSON.stringify({
            notes: "Urartu Han'da harika bir Van kahvaltısı yaptık! 🌸",
            photos: ["data:image/png;base64,sanalResimVerisi1", "data:image/png;base64,sanalResimVerisi2"]
        });

        const res = await request(app)
            .put(`/api/travels/${testTravelId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                checklist: fakePayload
            });
        
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('checklist');
        
        // Veritabanından dönen string veriyi tekrar açıp doğruluğunu kontrol et
        const parsedChecklist = JSON.parse(res.body.checklist);
        expect(parsedChecklist.notes).to.include("Van kahvaltısı");
        expect(parsedChecklist.photos).to.have.lengthOf(2);
    });

    // Bütün senaryolar başarıyla koştuktan sonra veritabanı havuzunu güvenli kapat
    after(async () => {
        await sequelize.close();
    });
});