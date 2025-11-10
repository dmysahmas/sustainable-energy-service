// Mobile Menu Toggle
const hamburger = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            hamburger.textContent = '☰';
        }
    });
});


// =========================================
// LOGIKA PORTFOLIO MARQUEE & MODAL
// =========================================

const marqueeContainer = document.getElementById('marqueeContainer');
const marqueeContent = document.getElementById('marqueeContent');

let isDown = false;
let startX;
let scrollLeftVal;
let autoScrollSpeed = 0.5;
let autoScrollId = null;
let isAutoScrolling = false;

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
    if (autoScrollId) {
        cancelAnimationFrame(autoScrollId);
        autoScrollId = null;
    }
}

if (marqueeContainer) {
    marqueeContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        marqueeContainer.classList.add('active');
        startX = e.pageX - marqueeContainer.offsetLeft;
        scrollLeftVal = marqueeContainer.scrollLeft;
        stopAutoScroll();
    });

    marqueeContainer.addEventListener('mouseup', () => {
        isDown = false;
        marqueeContainer.classList.remove('active');
        if (!marqueeContainer.matches(':hover')) {
             startAutoScroll();
        }
    });

    marqueeContainer.addEventListener('mouseleave', () => {
        isDown = false;
        marqueeContainer.classList.remove('active');
        startAutoScroll();
    });

    marqueeContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - marqueeContainer.offsetLeft;
        const walk = (x - startX) * 2;
        marqueeContainer.scrollLeft = scrollLeftVal - walk;
    });

    marqueeContainer.addEventListener('mouseenter', () => {
        if (!isDown) stopAutoScroll();
    });

    marqueeContainer.addEventListener('touchstart', stopAutoScroll, { passive: true });
    marqueeContainer.addEventListener('touchend', () => {
        setTimeout(startAutoScroll, 1000);
    });

    startAutoScroll();
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopAutoScroll();
    } else {
        if (modal.style.display !== "flex") {
            startAutoScroll();
        }
    }
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

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

document.addEventListener('keydown', function(event) {
    if (modal && (event.key === 'Escape' || event.key === 'Esc') && modal.style.display === 'flex') {
        closeModal();
    }
});


// =========================================
// LOGIKA CHART
// =========================================
const chartCanvas = document.getElementById('renewableChart');
if (chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Global Renewable Additions (GW)',
                data: [280, 295, 320, 440, 510],
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 4,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 9,
                pointBackgroundColor: '#059669',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                hoverBorderWidth: 3,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'nearest', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: '#065f46', font: { family: 'Inter', size: 14 } }
                },
                title: {
                    display: true,
                    text: 'Global Renewable Capacity Additions 2020–2024',
                    color: '#1f2937',
                    font: { size: 20, weight: '600', family: 'Inter' },
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    backgroundColor: '#065f46',
                    titleFont: { weight: '600' },
                    bodyFont: { size: 14 },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) { return context.parsed.y + ' GW'; }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#374151', font: { family: 'Inter' } },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#374151', font: { family: 'Inter' } },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    title: {
                        display: true,
                        text: 'Capacity (GW)',
                        color: '#374151',
                        font: { size: 14, family: 'Inter', weight: '600' }
                    }
                }
            }
        }
    });
}


// ===================================================
// [DIROMBAK] LOGIKA KALKULATOR ROI (Model SolarHub)
// ===================================================

const roiForm = document.getElementById('roiForm');
const roiResultDiv = document.getElementById('roiResult');

if (roiForm) {
    
    // --- KONSTANTA YANG WAJIB ANDA SESUAIKAN ---

    // 1. Asumsi Tarif Dasar Listrik (TDL) per kWh (Non-Subsidi)
    //    Update harga ini secara berkala sesuai tarif PLN terbaru.
    const TDL_PER_KWH = {
        'R1-1300': 1444.70,
        'R1-2200': 1444.70,
        'R2-3500': 1699.53, 
        'R3-6600': 1699.53,
        'B2': 1444.70, 
    };

    // 2. Asumsi Harga Investasi (Rp per kWp)
    //    Harga per kWp biasanya menurun seiring besarnya sistem.
    //    (1 kWp = 1000 Wp)
    function getHargaPerKwp(kwp) {
        if (kwp < 3) return 18000000;  // Misal: 18 jt/kWp untuk sistem < 3 kWp
        if (kwp < 5) return 16000000;  // Misal: 16 jt/kWp untuk sistem 3-5 kWp
        if (kwp < 10) return 14000000; // Misal: 14 jt/kWp untuk sistem 5-10 kWp
        return 12000000;              // Misal: 12 jt/kWp untuk sistem > 10 kWp
    }

    // 3. Multiplier Biaya Berdasarkan Jenis Atap
    const MULTIPLIER_ATAP = {
        'metal': 1.0,   // Atap metal/spandek (paling murah)
        'genteng': 1.1, // Atap genteng (lebih mahal 10% untuk mounting)
        'dak': 1.3,     // Atap dak beton (lebih mahal 30% untuk struktur)
    };

    // 4. Asumsi Teknis
    const ASUMSI_PSH = 4.5; // Peak Sun Hour rata-rata Indonesia (jam)
    const EFISIENSI_SISTEM = 0.85; // Efisiensi total (Inverter, kabel, suhu, dll)
    
    // 5. Asumsi Finansial
    const ASUMSI_KENAIKAN_TDL = 0.05; // 5% kenaikan tarif listrik per tahun

    // --- FUNGSI FORMATTER ---
    const formatRupiah = (angka) => {
        return "Rp " + Math.round(angka).toLocaleString('id-ID');
    };
    const formatTahun = (angka) => {
        return angka.toFixed(1) + " Tahun";
    };
    const formatKwp = (angka) => {
        return angka.toFixed(1) + " kWp";
    };
     const formatKwh = (angka) => {
        return Math.round(angka).toLocaleString('id-ID') + " kWh";
    };

    // --- EVENT LISTENER FORM ---
    roiForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Ambil Input
        const tagihanBulanan = parseFloat(document.getElementById('tagihanBulanan').value);
        const golonganListrik = document.getElementById('golonganListrik').value;
        const tipeAtap = document.getElementById('tipeAtap').value;

        // 2. Validasi
        const tdl = TDL_PER_KWH[golonganListrik];
        if (!tdl || !tagihanBulanan || !tipeAtap) {
            alert("Harap isi semua kolom dengan benar.");
            return;
        }

        // --- 3. Mulai Kalkulasi ---

        // Konversi Tagihan (Rp) ke Kebutuhan Energi (kWh)
        const totalKwhBulanan = tagihanBulanan / tdl;
        const pemakaianHarianKwh = totalKwhBulanan / 30;

        // Hitung Rekomendasi Ukuran Sistem (kWp)
        // Rumus: Kebutuhan harian / (PSH * Efisiensi)
        const rekomendasiKwp = pemakaianHarianKwh / (ASUMSI_PSH * EFISIENSI_SISTEM);
        
        // Hitung Estimasi Biaya Total
        const hargaPerKwp = getHargaPerKwp(rekomendasiKwp);
        const multiplierAtap = MULTIPLIER_ATAP[tipeAtap];
        const estimasiBiayaTotal = rekomendasiKwp * hargaPerKwp * multiplierAtap;

        // Hitung Estimasi Produksi Energi
        // Rumus: Ukuran Sistem (kWp) * PSH * 30 hari
        const produksiBulananKwh = rekomendasiKwp * ASUMSI_PSH * 30;

        // Hitung Penghematan Bulanan (Rp)
        // Penghematan = Produksi (kWh) * TDL (Rp/kWh)
        // Kita batasi (cap) penghematan maksimal sebesar tagihan bulanan
        let penghematanBulananRp = produksiBulananKwh * tdl;
        penghematanBulananRp = Math.min(penghematanBulananRp, tagihanBulanan);
        
        // Hitung Waktu Balik Modal (Tahun)
        const penghematanTahunanRp = penghematanBulananRp * 12;
        const paybackPeriodTahun = estimasiBiayaTotal / penghematanTahunanRp;

        // Hitung Akumulasi Penghematan 25 Tahun (dengan asumsi kenaikan TDL)
        let totalHemat25Tahun = 0;
        let hematTahunIni = penghematanTahunanRp;
        for (let i = 0; i < 25; i++) {
            totalHemat25Tahun += hematTahunIni;
            hematTahunIni *= (1 + ASUMSI_KENAIKAN_TDL); // Naik 5% tiap tahun
        }

        // --- 4. Tampilkan Hasil ke Kartu Metrik ---
        document.getElementById('result-kwp').textContent = formatKwp(rekomendasiKwp);
        document.getElementById('result-biaya').textContent = formatRupiah(estimasiBiayaTotal);
        document.getElementById('result-produksi-kwh').textContent = formatKwh(produksiBulananKwh);
        document.getElementById('result-hemat-bulan').textContent = formatRupiah(penghematanBulananRp);
        document.getElementById('result-roi-tahun').textContent = formatTahun(paybackPeriodTahun);
        document.getElementById('result-hemat-25th').textContent = formatRupiah(totalHemat25Tahun);

        // Tampilkan div hasil
        roiResultDiv.style.display = 'block';

        // Auto-scroll ke hasil
        roiResultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}