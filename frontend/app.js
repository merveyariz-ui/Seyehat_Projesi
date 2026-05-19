// Merve Yarız - İstanbul Arel Üniversitesi
// Sistem Analizi ve Tasarımı Projesi - Komple Seyahat ve Bütçe Asistanı

const API_URL = 'http://localhost:5000/api/travels';
const AUTH_URL = 'http://localhost:5000/api/auth';

let currentAuthMode = 'login';
let currentLoadedPhotos = []; // Geçici fotoğraf dizisi
let currentLoadedExpenses = []; // Geçici harcama kalemleri dizisi

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// 🌸 ÖZEL PEMBE BİLDİRİM MOTORU
function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `<i class="bi bi-sparkles" style="color: #ffb6c1; margin-right: 5px;"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 400);
    }, 3500);
}

// 🔒 KİMLİK KONTROLÜ VE EKRAN YÖNETİMİ
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
        const user = JSON.parse(userJson);
        document.getElementById('authRequiredPanel').style.display = 'none';
        document.getElementById('mainAppPanel').style.display = 'block';
        document.getElementById('userAuthBand').style.display = 'flex';
        document.getElementById('welcomeMessage').innerHTML = `<i class="bi bi-person-circle" style="color: #ffb6c1; margin-right: 5px;"></i> Hesap: ${user.email}`;
        getTravels();
    } else {
        document.getElementById('authRequiredPanel').style.display = 'block';
        document.getElementById('mainAppPanel').style.display = 'none';
        document.getElementById('userAuthBand').style.display = 'none';
    }
}

function openAuthModal(mode) {
    currentAuthMode = mode;
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
    
    const titleElement = document.getElementById('authModalTitle');
    
    if (mode === 'login') {
        if (titleElement) titleElement.textContent = 'Giriş Yap';
        document.getElementById('authSubmitBtn').innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Sisteme Giriş Yap';
    } else {
        if (titleElement) titleElement.textContent = 'Yeni Kayıt Oluştur';
        document.getElementById('authSubmitBtn').innerHTML = '<i class="bi bi-person-plus"></i> Hesap Oluştur';
    }
    document.getElementById('authModal').style.display = 'flex';
}
function closeAuthModal() { document.getElementById('authModal').style.display = 'none'; }

async function handleAuthSubmit() {
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    if (!email || !password) { showToast("Lütfen tüm alanları doldurun!"); return; }
    const endpoint = currentAuthMode === 'login' ? `${AUTH_URL}/login` : `${AUTH_URL}/register`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            if (currentAuthMode === 'login') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                closeAuthModal(); checkAuthStatus(); showToast(data.message);
            } else {
                showToast(data.message + " Şimdi giriş yapabilirsiniz."); openAuthModal('login');
            }
        } else { showToast(data.error || "Kimlik işlemi başarısız."); }
    } catch (error) { showToast("Sunucu hatası!"); }
}

function handleLogout() {
    localStorage.removeItem('token'); localStorage.removeItem('user');
    document.getElementById('rawViewer').style.display = 'none'; checkAuthStatus();
    showToast("Başarıyla çıkış yapıldı!");
}
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// 1. SEYAHATLERİ LİSTELE
async function getTravels() {
    try {
        const response = await fetch(API_URL, { headers: getAuthHeaders() });
        if (response.status === 401 || response.status === 403) { handleLogout(); return; }
        const data = await response.json();
        const container = document.getElementById('listContainer');
        container.innerHTML = '';
        let pnrCounter = 0;
        window.currentTravels = data;

        data.forEach((travel, index) => {
            if(travel.pnr && travel.pnr.trim() !== "") pnrCounter++;

            let totalCost = 0;
            if (travel.checklist) {
                try {
                    const parsed = JSON.parse(travel.checklist);
                    if (parsed.expenses) {
                        totalCost = parsed.expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                    }
                } catch(e) {}
            }

            const div = document.createElement('div');
            div.className = 'travel-card';
            div.innerHTML = `
                <div class="card-buttons">
                    <button class="diary-trigger-btn" onclick="openDiaryModal(${index})"><i class="bi bi-book"></i> Günlük & Bütçe</button>
                    <button class="edit-btn" onclick="prepareEditModal(${index})"><i class="bi bi-pencil"></i> Düzenle</button>
                    <button class="delete-btn" onclick="deleteTravel(${travel.id})"><i class="bi bi-trash"></i> Sil</button>
                </div>
                <h3><i class="bi bi-geo-alt-fill" style="color: #db7093; margin-right: 5px;"></i> ${travel.destination}</h3>
                <p><i class="bi bi-calendar3" style="color: #db7093; margin-right: 7px;"></i> ${travel.date}</p>
                <p><i class="bi bi-ticket-perforated" style="color: #db7093; margin-right: 7px;"></i> PNR: ${travel.pnr || '---'}</p>
                <div class="card-budget-badge"><i class="bi bi-cash-coin" style="margin-right: 5px;"></i> Toplam Harcama: ${totalCost.toFixed(2)} TL</div>
            `;
            container.appendChild(div);
        });

        if(document.getElementById('totalRoutes')) document.getElementById('totalRoutes').textContent = data.length;
        if(document.getElementById('pnrCount')) document.getElementById('pnrCount').textContent = pnrCounter;
    } catch (error) { console.error(error); }
}

// 2. SEYAHAT EKLE
document.getElementById('travelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const destination = document.getElementById('destination').value.trim();
    const date = document.getElementById('date').value;
    const pnr = document.getElementById('pnr').value.trim();

    const selectedDate = new Date(date);
    const today = new Date(); today.setHours(0,0,0,0);
    if (selectedDate < today) { showToast("Geçmiş bir tarihe seyahat planı oluşturamazsınız!"); return; }

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ destination, date, pnr })
    });
    if (response.ok) { document.getElementById('travelForm').reset(); getTravels(); showToast("Yeni rota başarıyla eklendi!"); }
});

// 3. SEYAHAT DÜZENLEME
function prepareEditModal(index) {
    const travel = window.currentTravels[index];
    document.getElementById('editId').value = travel.id;
    document.getElementById('editDestination').value = travel.destination;
    document.getElementById('editDate').value = travel.date;
    document.getElementById('editPnr').value = travel.pnr || '';
    document.getElementById('editModal').style.display = 'flex';
}
function closeEditModal() { document.getElementById('editModal').style.display = 'none'; }

async function saveEdit() {
    const id = document.getElementById('editId').value;
    const destination = document.getElementById('editDestination').value.trim();
    const date = document.getElementById('editDate').value;
    const pnr = document.getElementById('editPnr').value.trim();
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ destination, date, pnr })
    });
    if (response.ok) { closeEditModal(); getTravels(); showToast("Seyahat planı güncellendi!"); }
}

async function deleteTravel(id) {
    if(confirm('Bu seyahati silmek istediğine emin misin?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        getTravels(); showToast("Seyahat planı başarıyla silindi.");
    }
}

// 📖 SEYAHAT GÜNLÜĞÜ, FOTOĞRAF VE BÜTÇE MOTORU
function openDiaryModal(index) {
    const travel = window.currentTravels[index];
    document.getElementById('diaryTravelId').value = travel.id;
    document.getElementById('diaryModalTitle').innerHTML = `<i class="bi bi-book-half" style="margin-right: 8px;"></i> ${travel.destination.toUpperCase()} SEFERİ - GÜNLÜK VE BÜTÇE`;
    
    let diaryData = { notes: "", photos: [], expenses: [] };
    if (travel.checklist) {
        try {
            diaryData = JSON.parse(travel.checklist);
        } catch(e) {
            diaryData.notes = travel.checklist;
        }
    }

    document.getElementById('diaryNotes').value = diaryData.notes || "";
    currentLoadedPhotos = diaryData.photos || [];
    currentLoadedExpenses = diaryData.expenses || [];
    
    renderGallery();
    renderExpenses();
    document.getElementById('diaryModal').style.display = 'flex';
}

function closeDiaryModal() { document.getElementById('diaryModal').style.display = 'none'; }

function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';
    currentLoadedPhotos.forEach((photoBase64) => {
        const img = document.createElement('img');
        img.src = photoBase64; img.className = 'uploaded-photo-box';
        img.title = "Fotoğrafı Kaldırmak İçin Tıklayın";
        img.onclick = () => { currentLoadedPhotos = currentLoadedPhotos.filter(p => p !== photoBase64); renderGallery(); };
        grid.appendChild(img);
    });
    const emptySlotsCount = 3 - currentLoadedPhotos.length;
    for (let i = 0; i < emptySlotsCount; i++) {
        const slot = document.createElement('div'); slot.className = 'empty-photo-slot';
        slot.innerHTML = `<i class="bi bi-camera" style="font-size: 20px; color: #db7093; margin-bottom: 5px;"></i>FOTOĞRAF<br>EKLE`; grid.appendChild(slot);
    }
}

function handlePhotoUploadClick() {
    if (currentLoadedPhotos.length >= 3) {
        showToast("En fazla 3 adet anı fotoğrafı ekleyebilirsiniz!"); return;
    }
    document.getElementById('diaryFileInput').click();
}

function uploadDiaryPhoto(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) { currentLoadedPhotos.push(e.target.result); renderGallery(); };
    reader.readAsDataURL(file); event.target.value = '';
}

function addExpenseItem() {
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    
    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!title || isNaN(amount) || amount <= 0) {
        showToast("Lütfen geçerli bir harcama adı ve tutar girin!");
        return;
    }

    currentLoadedExpenses.push({
        id: Date.now(),
        title: title,
        amount: amount
    });

    titleInput.value = '';
    amountInput.value = '';
    renderExpenses();
}

function deleteExpenseItem(id) {
    currentLoadedExpenses = currentLoadedExpenses.filter(item => item.id !== id);
    renderExpenses();
}

function renderExpenses() {
    const container = document.getElementById('expenseListContainer');
    const totalBanner = document.getElementById('modalTotalExpense');
    container.innerHTML = '';

    let total = 0;

    currentLoadedExpenses.forEach(item => {
        total += item.amount;
        const div = document.createElement('div');
        div.className = 'expense-item';
        div.innerHTML = `
            <span class="expense-item-title"><i class="bi bi-dot" style="color: #db7093;"></i> ${item.title}</span>
            <div class="expense-item-right">
                <span class="expense-item-amount">${item.amount.toFixed(2)} TL</span>
                <button type="button" class="expense-delete-btn" onclick="deleteExpenseItem(${item.id})"><i class="bi bi-x"></i></button>
            </div>
        `;
        container.appendChild(div);
    });

    totalBanner.textContent = `${total.toFixed(2)} TL`;
}

async function saveDiaryData() {
    const id = document.getElementById('diaryTravelId').value;
    const notes = document.getElementById('diaryNotes').value;

    const payload = JSON.stringify({
        notes: notes,
        photos: currentLoadedPhotos,
        expenses: currentLoadedExpenses
    });

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ checklist: payload })
    });

    if (response.ok) {
        closeDiaryModal(); getTravels();
        showToast("Günlük, fotoğraflar ve harcamalar başarıyla arşivlendi!");
    } else {
        showToast("Kaydetme sırasında bir hata oluştu.");
    }
}

// 6. ARŞİV ZAMAN TÜNELİ
document.getElementById('exportBtn').addEventListener('click', async () => {
    try {
        const response = await fetch(API_URL, { headers: getAuthHeaders() });
        const data = await response.json();
        const viewer = document.getElementById('rawViewer');
        const timeline = document.getElementById('archiveTimeline');
        timeline.innerHTML = '';

        if (data.length === 0) {
            timeline.innerHTML = `<p style="text-align:center; color:#aaa;">Henüz seyahat kaydı bulunamadı.</p>`;
        } else {
            data.forEach(travel => {
                const sysDate = travel.createdAt ? new Date(travel.createdAt).toLocaleString('tr-TR') : '---';
                let diaryNotes = "Henüz not eklenmemiş.";
                let photoHtml = "";
                let expenseHtml = "";
                let totalCost = 0;

                if (travel.checklist) {
                    try {
                        const parsed = JSON.parse(travel.checklist);
                        diaryNotes = parsed.notes || "Not eklenmemiş.";
                        if(parsed.photos && parsed.photos.length > 0) {
                            parsed.photos.forEach(p => {
                                photoHtml += `<img src="${p}" style="width:50px; height:50px; border-radius:6px; object-fit:cover; margin-right:5px; margin-top:5px; border:1px solid #ffb6c1;">`;
                            });
                        }
                        if(parsed.expenses && parsed.expenses.length > 0) {
                            parsed.expenses.forEach(item => {
                                totalCost += item.amount;
                                expenseHtml += `<span style="display:inline-block; background:#fff; border:1px solid #ffe4e1; padding:2px 6px; border-radius:4px; font-size:11px; margin-right:4px; margin-top:4px;"><i class="bi bi-tag" style="color: #db7093;"></i> ${item.title}: ${item.amount.toFixed(2)} TL</span>`;
                            });
                        }
                    } catch(e) { diaryNotes = travel.checklist; }
                }

                const itemDiv = document.createElement('div');
                itemDiv.className = 'archive-item';
                itemDiv.innerHTML = `
                    <h4><i class="bi bi-geo-alt-fill" style="color: #db7093; margin-right: 5px;"></i> ${travel.destination}</h4>
                    <p><i class="bi bi-calendar3" style="color: #db7093; margin-right: 5px;"></i> <strong>Tarih:</strong> ${travel.date}</p>
                    <p><i class="bi bi-ticket-perforated" style="color: #db7093; margin-right: 5px;"></i> <strong>PNR:</strong> ${travel.pnr || '---'}</p>
                    <p style="font-size:12px; color:#666; background:#fff5f7; padding:8px; border-radius:8px; margin-top:5px;"><i class="bi bi-chat-left-heart" style="color: #db7093; margin-right: 5px;"></i> <strong>Günlük Notu:</strong> ${diaryNotes}</p>
                    ${photoHtml ? `<div style="margin-top:5px;">${photoHtml}</div>` : ''}
                    ${expenseHtml ? `<div style="margin-top:5px; border-top:1px dashed #ffb6c1; padding-top:5px;"><i class="bi bi-cash-coin" style="color: #db7093; margin-right: 5px;"></i> <strong>Harcamalar (${totalCost.toFixed(2)} TL):</strong><br>${expenseHtml}</div>` : ''}
                    <p class="archive-meta"><i class="bi bi-floppy" style="margin-right: 5px;"></i> Kayıt Tarihi: ${sysDate}</p>
                `;
                timeline.appendChild(itemDiv);
            });
        }
        viewer.style.display = 'block'; viewer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) { console.error(error); }
});

// 💡 SEYAHAT ASİSTANI İPUÇLARI MOTORU (Global Alana Çıkarıldı ve Tarayıcıya Tanıtıldı)
const travelTips = [
    "Valizini hazırlarken en ağır eşyaları tekerleklere yakın, yani en alta koyarak taşımayı kolaylaştırabilirsin!",
    "Uçuşundan 24 saat önce online check-in yapmayı unutma, böylece havalimanında sıra beklemezsin!",
    "Kıyafetlerini katlamak yerine rulo yaparak valize yerleştirirsen hem kırışmazlar hem de çok daha az yer kaplarlar!",
    "Seyahate çıkmadan önce PNR kodunun ve bilet bilgilerinin bir ekran görüntüsünü al; internetin çekmediği anlarda hayat kurtarır!",
    "Gittiğin şehirdeki yerel lezzetleri keşfetmek için turistik yerlerden 2-3 sokak arkadaki esnaf lokantalarını tercih edebilirsin!",
    "Seyahat bütçeni kontrol altında tutmak için harcamalarını günü gününe asistanına kaydetmeyi unutma!"
];

window.changeTip = function() {
    const tipElement = document.getElementById('dynamicTip');
    if (!tipElement) return;
    
    let currentTip = tipElement.textContent;
    let newTip = currentTip;
    
    while (newTip === currentTip) {
        const randomIndex = Math.floor(Math.random() * travelTips.length);
        newTip = travelTips[randomIndex];
    }
    
    tipElement.style.opacity = 0;
    setTimeout(() => {
        tipElement.textContent = newTip;
        tipElement.style.opacity = 1;
    }, 200);
}