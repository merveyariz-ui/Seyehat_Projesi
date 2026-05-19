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