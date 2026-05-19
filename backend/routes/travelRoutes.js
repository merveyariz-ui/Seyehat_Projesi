const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travelController');
const authMiddleware = require('../middleware/authMiddleware'); // Güvenlik duvarını çağırıyoruz

// 🔒 TÜM SEYAHAT ROTALARINI JWT KORUMALI HALE GETİRİYORUZ
// Araya authMiddleware eklediğimiz için giriş yapmayan bu rotalara dokunamaz!

router.get('/', authMiddleware, travelController.getAllTravels);        // Sadece kendi seyahatlerini listele
router.post('/', authMiddleware, travelController.createTravel);       // Kendi hesabına seyahat ekle
router.put('/:id', authMiddleware, travelController.updateTravel);     // Kendi seyahatini düzenle
router.delete('/:id', authMiddleware, travelController.deleteTravel);  // Kendi seyahatini sil

module.exports = router;