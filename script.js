function hitungKebutuhan() {
  const daya = parseFloat(document.getElementById("daya").value);
  const tegangan = parseFloat(document.getElementById("tegangan").value);
  const sistem = document.getElementById("sistem").value;

  if (!daya || daya <= 0) {
    alert("Masukkan daya beban puncak (Watt) dengan benar!");
    return;
  }

  // Asumsi dari kode asli: Beban (daya) berjalan 5 jam per hari.
  const JAM_PEMAKAIAN = 5;
  const JAM_MATAHARI_PUNCAK = 5; // PSH (Peak Sun Hours)

  // 1. Total Kebutuhan Energi Harian (Wh)
  // (misal: 2000 W * 5 jam = 10.000 Wh)
  const total_energy_wh = daya * JAM_PEMAKAIAN;

  // 2. Kapasitas Panel Surya (Wp)
  // (Total Energi / PSH) = 10.000 Wh / 5h = 2000 Wp
  // Kita tambahkan 25% untuk inefisiensi
  const panel_wp = (total_energy_wh / JAM_MATAHARI_PUNCAK) * 1.25;
  const panel_kwp = panel_wp / 1000;

  // 3. Kapasitas Baterai (Ah) (Hanya jika Off-Grid / Hybrid)
  // (Total Energi / Tegangan)
  // Ini adalah perhitungan sederhana untuk 1 hari otonomi & 100% DoD.
  const baterai_ah = total_energy_wh / tegangan;

  // 4. Kapasitas Inverter (Watt)
  // (Beban Puncak * 1.2) -> Buffer 20% untuk surge
  const inverter_w = daya * 1.2;

  // 5. Estimasi Harga (Harga per kWp)
  const HARGA_PER_KWP = 8000000; // Estimasi harga per kWp (misal 8jt)
  const harga = panel_kwp * HARGA_PER_KWP;

  // Tampilkan hasil
  document.getElementById("panel").innerText = panel_kwp.toFixed(2) + " kWp";
  
  if (sistem !== "ongrid") {
    document.getElementById("baterai").innerText = baterai_ah.toFixed(0) + " Ah";
    document.querySelector("#baterai").closest("tr").classList.remove("hidden");
  } else {
    document.getElementById("baterai").innerText = "-";
    document.querySelector("#baterai").closest("tr").classList.add("hidden");
  }

  document.getElementById("inverter").innerText = inverter_w.toFixed(0) + " Watt";
  document.getElementById("harga").innerText = "Rp " + harga.toLocaleString("id-ID");

  document.getElementById("hasil").classList.remove("hidden");
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const sistem = document.getElementById("sistem").value;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Rencana Anggaran Biaya (RAB)", 20, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("CV Sustainable Energy Service", 20, 30);

  doc.autoTable({
    startY: 40,
    head: [["Komponen", "Spesifikasi"]],
    body: [
      ["Kapasitas Panel", document.getElementById("panel").innerText],
      ["Kapasitas Baterai", sistem !== "ongrid" ? document.getElementById("baterai").innerText : "-"],
      ["Inverter", document.getElementById("inverter").innerText],
      ["Estimasi Harga", document.getElementById("harga").innerText],
    ],
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 11 },
    headStyles: { fillColor: [4, 120, 87] } // Warna hijau tua
  });
  
  doc.setFontSize(10);
  doc.text("*Ini adalah estimasi kasar, harga dapat berubah.", 20, doc.autoTable.previous.finalY + 10);

  doc.save("RAB_SolarSystem.pdf");
}

// Tambahkan library auto-table untuk PDF yang lebih baik
// (Perlu ditambahkan di HTML)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>
