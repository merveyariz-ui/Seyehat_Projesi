# 🧳 Seyahat ve Rota Planlayıcısı (Sefer Defteri)

Bu proje, **Sistem Analizi ve Tasarımı** dersi kapsamında geliştirdiğim, Vanilla JavaScript tabanlı bir Tek Sayfa Uygulamasıdır (SPA). Sistem temel olarak seyahat rotalarımı planlamamı, PNR kodlarımı güvenli bir şekilde saklamamı, gittiğim yerlerdeki anı fotoğraflarımı/gezi notlarımı arşivlememi ve tüm bunları yapırken seyahat harcamalarımı dinamik olarak hesaplayan bir bütçe takip motorunu (Expense Tracker) yönetmemi sağlıyor.

---

## 🛠️ Kullandığım Teknolojiler ve Mimari Structure

Projeyi yazılım mühendisliği prensiplerine uygun olarak, kod kalitesini ve modülerliği korumak adına katmanlı MVC mimarisiyle tasarladım:

- **Frontend Katmanı:** Projede **React, Vue veya Angular gibi hiçbir JS framework'ü kullanmadım**. Tamamen saf (Vanilla) JavaScript, HTML5 ve CSS3 kullandım. Sayfa içi geçişleri ve veri güncellemelerini, asenkron `fetch` API çağrıları üzerinden yaptığım için sistemde asla tam sayfa yenilemesi (F5) yaşanmaz; tam bir SPA (Single Page Application) mimarisidir.
- **Backend Katmanı:** Node.js ve Express framework kullanarak RESTful bir API geliştirdim. Hocamızın özellikle belirttiği "iş mantığının route içinde olmaması" kuralına sadık kalarak, tüm business logic algoritmalarımı doğrudan Controller katmanına izole ettim.
- **Veri Katmanı (Database):** Veritabanı olarak **SQLite (`database.sqlite`)** kullandım ve veri yönetimini Sequelize ORM katmanı ile sağladım. 
- **Siber Güvenlik & Doğrulama:** Kullanıcı şifrelerini veritabanına düz metin olarak asla kaydetmiyorum; `bcrypt` kütüphanesiyle hash'leyerek şifreliyorum. Oturum yönetimini ise stateless (durum bilgisi içermeyen) JWT (JSON Web Token) mekanizmasıyla mimariye entegre ettim. Boş alan veya tarih doğrulamalarını (Validation) hem frontend hem backend tarafında çift katmanlı olarak kontrol ediyorum.

---

## ⚙️ Kurulum ve Projeyi Çalıştırma Adımları

Projeyi kendi yerel ortamınızda sıfırdan ayağa kaldırmak için aşağıdaki adımları sırasıyla uygulayabilirsiniz:

### 1. Bağımlılıkları İndirme
Terminal üzerinden `backend` klasörünün içine girip gerekli npm paketlerini yüklüyoruz:

```bash
cd backend
npm install
```

### 2. Çevre Değişkenlerinin (.env) Ayarlanması
Backend sunucusunun port ayarını ve JWT (JSON Web Token) şifreleme anahtarını okuyabilmesi için `backend` klasörünün içerisinde **`.env`** adında bir dosya oluşturun ve içerisine aşağıdaki satırları ekleyip kaydedin:

```env
PORT=5000
JWT_SECRET=arel_computer_engineering_secret_key_2026
```

### 3. Backend (Sunucu) ve Veritabanının Başlatılması
Gerekli paketler yüklendikten ve `.env` dosyası hazırlandıktan sonra, veritabanı tablolarını senkronize etmek ve API sunucusunu aktif etmek için yine `backend` klasörünün içindeyken şu komutu çalıştırıyoruz:

```bash
npm start
```

*Sunucumuz başarıyla başlatıldığında konsolda `Sunucu 5000 portunda çalışıyor...` ve `SQLite Bağlantısı Başarılı.` çıktılarını göreceksiniz.*

### 4. Frontend (Arayüz) Sunucusunun Başlatılması
Arayüz bileşenlerimizi (SPA) yerel ağda canlıya almak için VS Code üzerinden yeni bir terminal sekmesi açıyoruz. Projenin ana dizinindeyken arayüzü ayağa kaldırmak için şu komutu tetikliyoruz:

```bash
npx serve frontend
```

*Bu komutun ardından terminal size yerel bir adres (örneğin `http://localhost:3000`) verecektir. Bu adresi tarayıcınızda açarak uygulamayı tam fonksiyonel şekilde kullanmaya başlayabilirsiniz.*

### 🧪 API Testlerinin Koşturulması
Backend sisteminde kurgulanan REST API endpoint'lerinin kararlılığını ve entegrasyon testlerini (Mocha/Chai) doğrulamak için `backend` klasörünün içindeyken şu komutla test senaryolarını tetikleyebilirsiniz:

```bash
npm test
```
```

---