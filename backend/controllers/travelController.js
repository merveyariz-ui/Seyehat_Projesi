// Merve Yarız - İstanbul Arel Üniversitesi
// Sistem Analizi ve Tasarımı Projesi - Seyahat Yönetim İş Mantığı (Controller)

const Travel = require('../models/Travel');

// 1. Kullanıcıya Özgü Seyahatleri Listele (Read - GET)
exports.getAllTravels = async (req, res) => {
    try {
        // 🛡️ KRİTİK FİLTRE: Veritabanından sadece giriş yapan kullanıcının seyahatlerini çekiyoruz
        const travels = await Travel.findAll({
            where: { userId: req.user.id } // user1 ise sadece user1'in rotaları gelir!
        });
        res.json(travels);
    } catch (err) {
        res.status(500).json({ error: 'Seyahatler getirilirken bir sunucu hatası oluştu.' });
    }
};

// 2. Kullanıcıya Özgü Yeni Seyahat Ekle (Create - POST)
exports.createTravel = async (req, res) => {
    try {
        const { destination, date, pnr } = req.body;

        if (!destination || !date) {
            return res.status(400).json({ error: 'Şehir ve tarih alanları boş bırakılamaz! 🎀' });
        }

        // Geçmiş Tarih Engeli (Business Logic)
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (selectedDate < today) {
            return res.status(400).json({ error: 'Geçmiş bir tarihe seyahat planı oluşturamazsınız! 🗓️' });
        }

        // 🔗 İLİŞKİ: Seyahati oluştururken userId alanına giriş yapan kişinin ID'sini gömüyoruz
        const newTravel = await Travel.create({
            destination,
            date,
            pnr,
            userId: req.user.id
        });

        res.status(201).json(newTravel);
    } catch (err) {
        res.status(500).json({ error: 'Seyahat kaydedilirken bir hata oluştu.' });
    }
};

// 3. Kullanıcıya Özgü Seyahat Düzenle (Update - PUT) - 🌟 GÜNLÜK VE FOTOĞRAFLAR İÇİN GÜNCELLENDİ
exports.updateTravel = async (req, res) => {
    try {
        const { id } = req.params;
        // 💡 checklist (yani günlüğün paketlenmiş not + fotoğrafları) buraya eklendi:
        const { destination, date, pnr, checklist } = req.body;

        // Düzenlenmek istenen seyahat gerçekten bu kullanıcıya mı ait kontrolü
        const travel = await Travel.findOne({
            where: { id, userId: req.user.id }
        });

        if (!travel) {
            return res.status(404).json({ error: 'Düzenlenecek seyahat kaydı bulunamadı veya yetkiniz yok! 🔒' });
        }

        // Güncelleme işlemi (Eğer yeni değer geldiyse ez, gelmediyse eskisini koru)
        travel.destination = destination || travel.destination;
        travel.date = date || travel.date;
        travel.pnr = pnr || travel.pnr;
        
        // 📸 Günlük verisi undefined değilse (boş metin gelse bile) veritabanına yazılmasına izin ver
        if (checklist !== undefined) {
            travel.checklist = checklist;
        }

        await travel.save();
        res.json(travel); // Güncellenmiş yeni seyahat objesini frontend'e geri fırlatıyoruz
    } catch (err) {
        console.error("Güncelleme sırasında backend hatası:", err);
        res.status(500).json({ error: 'Güncelleme sırasında bir hata oluştu.' });
    }
};

// 4. Kullanıcıya Özgü Seyahat Sil (Delete - DELETE)
exports.deleteTravel = async (req, res) => {
    try {
        const { id } = req.params;

        // Silinmek istenen seyahat gerçekten bu kullanıcıya mı ait kontrolü
        const travel = await Travel.findOne({
            where: { id, userId: req.user.id }
        });

        if (!travel) {
            return res.status(404).json({ error: 'Silinecek seyahat kaydı bulunamadı veya yetkiniz yok! 🔒' });
        }

        await travel.destroy();
        res.json({ message: 'Seyahat planı başarıyla silindi. ✨' });
    } catch (err) {
        res.status(500).json({ error: 'Silme işlemi sırasında bir hata oluştu.' });
    }
};