// =========================================
// Mobile Menu Toggle
// =========================================
const hamburger = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
}
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.textContent = '☰';
        }
    });
});

// =========================================
// LOGIKA PORTFOLIO MARQUEE
// =========================================
const marqueeContainer = document.getElementById('marqueeContainer');
const marqueeContent = document.getElementById('marqueeContent');
let isDown = false, startX, scrollLeftVal, autoScrollSpeed = 0.5, autoScrollId = null, isAutoScrolling = false;
function startAutoScroll() {
    if (isAutoScrolling || !marqueeContainer) return; 
    isAutoScrolling = true;
    loop(); 
}
function loop() {
    if (!isAutoScrolling) return;
    marqueeContainer.scrollLeft += autoScrollSpeed;
    const halfWidth = marqueeContent.scrollWidth / 2;
    if (marqueeContainer.scrollLeft >= halfWidth) {
         marqueeContainer.scrollLeft -= halfWidth;
    }
    autoScrollId = requestAnimationFrame(loop);
}
function stopAutoScroll() {
    isAutoScrolling = false;
    if (autoScrollId) cancelAnimationFrame(autoScrollId);
    autoScrollId = null;
}
if (marqueeContainer) {
    marqueeContainer.addEventListener('mousedown', (e) => { isDown = true; marqueeContainer.classList.add('active'); startX = e.pageX - marqueeContainer.offsetLeft; scrollLeftVal = marqueeContainer.scrollLeft; stopAutoScroll(); });
    marqueeContainer.addEventListener('mouseup', () => { isDown = false; marqueeContainer.classList.remove('active'); if (!marqueeContainer.matches(':hover')) startAutoScroll(); });
    marqueeContainer.addEventListener('mouseleave', () => { isDown = false; marqueeContainer.classList.remove('active'); startAutoScroll(); });
    marqueeContainer.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - marqueeContainer.offsetLeft; const walk = (x - startX) * 2; marqueeContainer.scrollLeft = scrollLeftVal - walk; });
    marqueeContainer.addEventListener('mouseenter', () => { if (!isDown) stopAutoScroll(); });
    marqueeContainer.addEventListener('touchstart', stopAutoScroll, { passive: true });
    marqueeContainer.addEventListener('touchend', () => { setTimeout(startAutoScroll, 1000); });
    startAutoScroll();
}
document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoScroll();
    else if (modal && modal.style.display !== "flex") startAutoScroll();
});

// =========================================
// LOGIKA MODAL POP-UP
// =========================================
const modal = document.getElementById('projectModal');
const modalImg = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDescription');
function openModal(imgSrc, title, desc) {
    if (!modal) return;
    modal.style.display = "flex";
    modalImg.src = imgSrc;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    stopAutoScroll(); 
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    modalImg.src = "";
    startAutoScroll();
    document.body.style.overflow = 'auto';
}
window.onclick = (event) => { if (event.target == modal) closeModal(); }
document.addEventListener('keydown', (event) => {
    if (modal && (event.key === 'Escape' || event.key === 'Esc') && modal.style.display === 'flex') closeModal();
});

// =========================================
// LOGIKA CHART (Bagian Hero)
// =========================================
const chartCanvas = document.getElementById('renewableChart');
if (chartCanvas) {
    // ... (Logika chart Anda yang sudah ada tetap di sini) ...
    const ctx = chartCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    new Chart(ctx, { type: 'line', data: { /* ... data ... */ }, options: { /* ... options ... */ } });
}


// ===================================================
// [BARU] LOGIKA KALKULATOR WIZARD (Model SolarHub)
// ===================================================

// --- [WAJIB DISESUAIKAN] "DATABASE" TARIF ANDA ---
// Ini adalah "database" yang Anda minta.
// Kunci utamanya adalah Kategori, dan valuenya adalah objek
// yang berisi Pilihan Tarif (key) dan Harga TDL-nya (value).
// HARAP LENGKAPI DAN UPDATE HARGA TDL INI!
const TARIFF_DATABASE = {
    "Rumah Tangga": {
        "R-1/900 VA (Subsidi)": 586, // Contoh, mungkin perlu logika beda
        "R-1/1300 VA": 1444.70,
        "R-1/2200 VA": 1444.70,
        "R-2/3500-5500 VA": 1699.53,
        "R-3/6600 VA ke atas": 1699.53
    },
    "Bisnis": {
        "B-1/450-900 VA (Subsidi)": 605,
        "B-1/1300-5500 VA": 1444.70,
        "B-2/6600-200kVA": 1444.70,
        "B-3/>200 kVA": 1114.74
    },
    "Industri": {
        "I-1/450-900 VA (Subsidi)": 586,
        "I-1/1300-5500 VA": 1444.70,
        "I-2/6600-200kVA": 1444.70,
        "I-3/>200 kVA (TM)": 1035.78,
        "I-4/>30 MVA (TT)": 996.74
    }
    // Tambahkan "Pemerintah", "Sosial", dll jika perlu
};

// --- [WAJIB DISESUAIKAN] KONSTANTA ASUMSI ---
const ASUMSI_PSH = 4.2; // Rata-rata Peak Sun Hour (Iradiasi) Indonesia
const ASUMSI_EFISIENSI = 0.85; // Efisiensi sistem (inverter, kabel, suhu, dll)
const ATURAN_EKSPOR_PLN = 0.65; // Nilai kWh ekspor (misal 65% atau 100% jika berubah)
const INFLASI_TDL_TAHUNAN = 0.05; // Asumsi kenaikan TDL 5% per tahun
const FAKTOR_CO2_GRID = 0.96; // kg CO2 per kWh (faktor grid Indonesia, bisa beda)
const FAKTOR_POHON_CO2 = 21.77; // kg CO2 diserap 1 pohon per tahun
const FAKTOR_MOBIL_KM = 0.12; // kg CO2 per km berkendara
const METER_PERSEGI_PER_PANEL = 2.1; // Asumsi luas 1 panel (m²)

// Fungsi harga berjenjang (Rp per kWp)
function getHargaPerKwp(kwp) {
    if (kwp < 3) return 18000000;
    if (kwp < 5) return 16000000;
    if (kwp < 10) return 14000000;
    return 12000000;
}
// -------------------------------------------------


// Variabel global untuk menyimpan data & chart
let wizardData = {};
let roiChartInstance = null;
const formatRupiah = (angka) => `Rp ${Math.round(angka).toLocaleString('id-ID')}`;
const formatAngka = (angka, desimal = 1) => `${angka.toFixed(desimal).replace('.', ',')}`;

document.addEventListener('DOMContentLoaded', () => {
    const wizard = document.getElementById('calculatorWizard');
    if (!wizard) return; // Hanya jalankan jika ada wizard di halaman

    const steps = wizard.querySelectorAll('.wizard-step');
    const progressSteps = wizard.querySelectorAll('.progress-step');
    const nextButtons = wizard.querySelectorAll('.btn-next');
    const prevButtons = wizard.querySelectorAll('.btn-prev');
    const hitungButton = document.getElementById('btn-hitung');

    const kategoriSelect = document.getElementById('calc-kategori');
    const tarifSelect = document.getElementById('calc-tarif');
    const tagihanInput = document.getElementById('calc-tagihan');
    const modulOptions = document.getElementById('calc-modul-options');
    
    // --- 1. LOGIKA NAVIGASI WIZARD ---
    
    function goToStep(stepNumber) {
        // Sembunyikan semua step
        steps.forEach(step => step.classList.remove('active'));
        // Tampilkan step yang dituju
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        
        // Update progress bar
        progressSteps.forEach(pStep => {
            if (parseInt(pStep.dataset.step) <= stepNumber) {
                pStep.classList.add('active');
            } else {
                pStep.classList.remove('active');
            }
        });
    }

    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextStep = btn.dataset.next;
            // Validasi sederhana sebelum lanjut
            if (validateStep(nextStep - 1)) {
                 goToStep(nextStep);
            }
        });
    });

    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            goToStep(btn.dataset.prev);
        });
    });

    // --- 2. LOGIKA VALIDASI STEP ---
    
    function validateStep(stepNumber) {
        if (stepNumber == 1) { // Validasi step 1 (Tarif)
            if (kategoriSelect.value && tarifSelect.value) {
                wizardData.kategori = kategoriSelect.value;
                wizardData.tarifKey = tarifSelect.value;
                wizardData.tdl = TARIFF_DATABASE[wizardData.kategori][wizardData.tarifKey];
                return true;
            }
            alert('Harap pilih Kategori dan Kapasitas Tarif.');
            return false;
        }
        if (stepNumber == 2) { // Validasi step 2 (Tagihan)
            if (tagihanInput.value && tagihanInput.value > 0) {
                wizardData.tagihanRp = parseFloat(tagihanInput.value);
                return true;
            }
            alert('Harap masukkan Tagihan Bulanan yang valid.');
            return false;
        }
        return true; // Step lain tidak butuh validasi
    }

    // --- 3. LOGIKA CASCADING DROPDOWN ---
    
    kategoriSelect.addEventListener('change', () => {
        const selectedKategori = kategoriSelect.value;
        tarifSelect.innerHTML = '<option value="">-- Pilih Kapasitas --</option>'; // Reset
        
        if (selectedKategori && TARIFF_DATABASE[selectedKategori]) {
            tarifSelect.disabled = false;
            const tarifOptions = TARIFF_DATABASE[selectedKategori];
            for (const key in tarifOptions) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                tarifSelect.appendChild(option);
            }
        } else {
            tarifSelect.disabled = true;
            tarifSelect.innerHTML = '<option value="">-- Pilih Kategori Dahulu --</option>';
        }
    });
    
    // --- 4. LOGIKA PILIHAN MODUL ---
    
    modulOptions.addEventListener('click', (e) => {
        if (e.target.classList.contains('module-btn')) {
            // Hapus aktif dari semua tombol
            modulOptions.querySelectorAll('.module-btn').forEach(btn => btn.classList.remove('active'));
            // Tambah aktif ke tombol yang diklik
            e.target.classList.add('active');
        }
    });

    // --- 5. LOGIKA PERHITUNGAN UTAMA ---
    
    hitungButton.addEventListener('click', () => {
        // Ambil data Wp modul
        const activeModule = modulOptions.querySelector('.module-btn.active');
        if (!activeModule) {
            alert('Harap pilih modul Wp.');
            return;
        }
        wizardData.modulWp = parseInt(activeModule.dataset.wp);
        
        // Lakukan perhitungan
        const hasil = hitungROI(wizardData);
        
        // Tampilkan hasil
        tampilkanHasil(hasil);
        
        // Pindah ke step hasil
        goToStep(4);
    });
    
    function hitungROI(data) {
        // 1. Kebutuhan Energi
        const totalKwhBulanan = data.tagihanRp / data.tdl;
        const pemakaianHarianKwh = totalKwhBulanan / 30;
        
        // 2. Rekomendasi Sistem & Ukuran Aktual
        const rekomendasiKwp = pemakaianHarianKwh / (ASUMSI_PSH * ASUMSI_EFISIENSI);
        const jumlahPanel = Math.ceil((rekomendasiKwp * 1000) / data.modulWp);
        const ukuranSistemKwp = (jumlahPanel * data.modulWp) / 1000;
        const luasAtap = jumlahPanel * METER_PERSEGI_PER_PANEL;
        
        // 3. Biaya Sistem
        const hargaPerKwp = getHargaPerKwp(ukuranSistemKwp);
        const biayaSistem = ukuranSistemKwp * hargaPerKwp;
        
        // 4. Produksi & Pemakaian
        const produksiBulananKwh = ukuranSistemKwp * ASUMSI_PSH * 30 * ASUMSI_EFISIENSI;
        const pemakaianSuryaBulananKwh = Math.min(produksiBulananKwh, totalKwhBulanan);
        
        // 5. Ekspor & Impor
        const eksporKwh = Math.max(0, produksiBulananKwh - pemakaianSuryaBulananKwh);
        const imporKwh = Math.max(0, totalKwhBulanan - pemakaianSuryaBulananKwh);
        
        // 6. Finansial
        const nilaiHematPemakaian = pemakaianSuryaBulananKwh * data.tdl;
        const nilaiEkspor = eksporKwh * data.tdl * ATURAN_EKSPOR_PLN;
        const hematBulananRp = nilaiHematPemakaian + nilaiEkspor;
        const tagihanBaruRp = imporKwh * data.tdl;
        const persenHemat = (hematBulananRp / data.tagihanRp) * 100;
        const paybackTahun = biayaSistem / (hematBulananRp * 12);
        
        // 7. Dampak Lingkungan
        const co2BulananKg = produksiBulananKwh * FAKTOR_CO2_GRID;
        const co2TahunanTon = (co2BulananKg * 12) / 1000;
        const setaraPohon = (co2TahunanTon * 1000) / FAKTOR_POHON_CO2;
        const setaraMobilKm = (co2TahunanTon * 1000) / FAKTOR_MOBIL_KM;

        // Kembalikan semua data
        return {
            ...data, totalKwhBulanan, ukuranSistemKwp, luasAtap, biayaSistem,
            produksiBulananKwh, pemakaianSuryaBulananKwh, eksporKwh, imporKwh,
            hematBulananRp, tagihanBaruRp, persenHemat, paybackTahun,
            co2BulananKg, co2TahunanTon, setaraPohon, setaraMobilKm
        };
    }
    
    // --- 6. LOGIKA TAMPILKAN HASIL ---
    
    function tampilkanHasil(h) {
        // Kartu Metrik
        document.getElementById('res-biaya').textContent = formatRupiah(h.biayaSistem);
        document.getElementById('res-persen-hemat').textContent = `${formatAngka(h.persenHemat)}%`;
        document.getElementById('res-co2').textContent = `${formatAngka(h.co2BulananKg)} kgCO₂/bln`;
        document.getElementById('res-pohon').textContent = `${formatAngka(h.setaraPohon, 0)} Pohon`;
        
        // Tabel Sistem & Energi
        document.getElementById('res-ukuran-kwp').textContent = `${formatAngka(h.ukuranSistemKwp)} kWp`;
        document.getElementById('res-luas-atap').textContent = `${formatAngka(h.luasAtap)} m²`;
        document.getElementById('res-prod-kwh').textContent = `${formatAngka(h.produksiBulananKwh, 0)} kWh`;
        document.getElementById('res-pakai-kwh').textContent = `${formatAngka(h.pemakaianSuryaBulananKwh, 0)} kWh`;
        document.getElementById('res-ekspor-kwh').textContent = `${formatAngka(h.eksporKwh, 0)} kWh`;
        document.getElementById('res-impor-kwh').textContent = `${formatAngka(h.imporKwh, 0)} kWh`;
        
        // Tabel Finansial & Dampak
        document.getElementById('res-tagihan-lama').textContent = formatRupiah(h.tagihanRp);
        document.getElementById('res-hemat-rp').textContent = formatRupiah(h.hematBulananRp);
        document.getElementById('res-tagihan-baru').textContent = formatRupiah(h.tagihanBaruRp);
        document.getElementById('res-roi-tahun').textContent = `${formatAngka(h.paybackTahun)} tahun`;
        document.getElementById('res-co2-tahunan').textContent = `${formatAngka(h.co2TahunanTon)} ton CO₂/th`;
        document.getElementById('res-jarak-mobil').textContent = `${formatAngka(h.setaraMobilKm, 0)} km/th`;
        
        // Gambar Grafik
        drawRoiChart(h.biayaSistem, h.tagihanRp, h.tagihanBaruRp);
    }

    // --- 7. LOGIKA GRAFIK ROI ---
    
    function drawRoiChart(biayaSistem, tagihanLamaBulanan, tagihanBaruBulanan) {
        const ctx = document.getElementById('roiChartCanvas').getContext('2d');
        const labels = Array.from({ length: 26 }, (_, i) => `${i} th`); // 0 s/d 25 th
        
        const dataTanpaPV = [];
        const dataDenganPV = [];
        
        let kumulatifTanpaPV = 0;
        let kumulatifDenganPV = biayaSistem; // Mulai dari biaya investasi
        
        let tagihanTahunanLama = tagihanLamaBulanan * 12;
        let tagihanTahunanBaru = tagihanBaruBulanan * 12;
        
        for (let i = 0; i <= 25; i++) {
            if (i === 0) {
                dataTanpaPV.push(0);
                dataDenganPV.push(biayaSistem);
                continue;
            }
            
            // Hitung biaya kumulatif
            kumulatifTanpaPV += tagihanTahunanLama;
            kumulatifDenganPV += tagihanTahunanBaru;
            
            dataTanpaPV.push(kumulatifTanpaPV);
            dataDenganPV.push(kumulatifDenganPV);
            
            // Terapkan inflasi untuk tahun berikutnya
            tagihanTahunanLama *= (1 + INFLASI_TDL_TAHUNAN);
            tagihanTahunanBaru *= (1 + INFLASI_TDL_TAHUNAN);
        }

        if (roiChartInstance) {
            roiChartInstance.destroy(); // Hancurkan chart lama jika ada
        }
        
        roiChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Tanpa PV (Proyeksi Biaya)',
                        data: dataTanpaPV,
                        borderColor: '#065f46', // Hijau Tua
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.1
                    },
                    {
                        label: 'Dengan PV (Proyeksi Biaya)',
                        data: dataDenganPV,
                        borderColor: '#f59e0b', // Kuning/Orange
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                if (value >= 1e9) return `Rp ${value / 1e9} M`;
                                if (value >= 1e6) return `Rp ${value / 1e6} jt`;
                                return formatRupiah(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatRupiah(context.parsed.y)}`;
                            }
                        }
                    }
                }
            }
        });
    }

});