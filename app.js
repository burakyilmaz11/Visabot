// Fransa Vize Randevu Takip – Istanbul
//
// Bu betik, VisasBot API'sini sorgular ve İstanbul Beyoğlu'ndaki kısa süreli
// Fransa vize kategorilerinin durumunu ekranda gösterir.  Her 5 dakikada bir
// otomatik yenilenir.  Tarayıcı API kısıtlamaları nedeniyle dış API’ye
// erişim başarısız olursa, kullanıcıya hata mesajı gösterilir.

async function fetchData() {
  const statusEl = document.getElementById('status');
  try {
    const response = await fetch('https://api.visasbot.com/api/visa/list');
    if (!response.ok) {
      throw new Error('API yanıtı ok değil: ' + response.status);
    }
    const json = await response.json();
    const visas = json.data && json.data.visas ? json.data.visas : [];
    // Filtreleme: Türkiye (tur) -> Fransa (fra) -> İstanbul
    const keywords = [
      'Short Term',
      'Court Sejour',
      'Professional-Ticari',
      'VIS',
      'France-EU Spouse',
      'Student',
    ];
    const filtered = visas.filter((visa) => {
      return (
        visa.country_code === 'tur' &&
        visa.mission_code === 'fra' &&
        visa.center && visa.center.toLowerCase().includes('istanbul') &&
        keywords.some((kw) =>
          (visa.visa_category && visa.visa_category.toLowerCase().includes(kw.toLowerCase())) ||
          (visa.visa_type && visa.visa_type.toLowerCase().includes(kw.toLowerCase()))
        )
      );
    });
    // Tablo HTML oluştur
    let html = '';
    if (filtered.length === 0) {
      html = '<p>İstanbul için kısa süreli Fransa vize kategorisi bulunamadı.</p>';
    } else {
      html += '<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>Kategori</th><th>Alt kategori</th><th>Durum</th><th>Son randevu tarihi</th></tr></thead><tbody>';
      filtered.forEach((visa) => {
        const lastDate = visa.last_available_date || '–';
        html += `<tr><td>${visa.visa_category || ''}</td><td>${visa.visa_type || ''}</td><td>${visa.status}</td><td>${lastDate}</td></tr>`;
      });
      html += '</tbody></table>';
    }
    statusEl.innerHTML = html;
  } catch (err) {
    statusEl.textContent = 'Hata: ' + err.message + '\nLütfen daha sonra tekrar deneyiniz.';
  }
}

// İlk yüklemede ve belirli aralıklarla yenile
fetchData();
setInterval(fetchData, 5 * 60 * 1000);