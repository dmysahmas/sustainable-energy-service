function hitungKebutuhan() {
  const daya = parseFloat(document.getElementById("daya").value);
  const tegangan = parseFloat(document.getElementById("tegangan").value);
  const sistem = document.getElementById("sistem").value;

  if (!daya || daya <= 0) {
    alert("Masukkan daya beban puncak (Watt) dengan benar!");
    return;
  }

  // Asumsi: Beban (daya) berjalan 5 jam per hari.
  const JAM_PEMAKAIAN = 5;
  const JAM_MATAHARI_PUNCAK = 5; // PSH (Peak Sun Hours)

  // 1. Total Kebutuhan Energi Harian (Wh)
  const total_energy_wh = daya * JAM_PEMAKAIAN;

  // 2. Kapasitas Panel Surya (Wp)
  // (Total Energi / PSH) * 1.25 (25% buffer inefisiensi)
  const panel_wp = (total_energy_wh / JAM_MATAHARI_PUNCAK) * 1.25;
  const panel_kwp = panel_wp / 1000;

  // 3. Kapasitas Baterai (Ah) (Hanya jika Off-Grid / Hybrid)
  // (Total Energi / Tegangan)
  const baterai_ah = total_energy_wh / tegangan;

  // 4. Kapasitas Inverter (Watt)
  // (Beban Puncak * 1.2) -> Buffer 20% untuk surge
  const inverter_w = daya * 1.2;

  // 5. Estimasi Harga (Harga per kWp)
  const HARGA_PER_KWP = 8000000; // Estimasi harga per kWp
  const harga = panel_kwp * HARGA_PER_KWP;

  // Tampilkan hasil
  document.getElementById("panel").innerText = panel_kwp.toFixed(2) + " kWp";
  
  const bateraiRow = document.querySelector("#baterai").closest("tr");
  if (sistem !== "ongrid") {
    document.getElementById("baterai").innerText = baterai_ah.toFixed(0) + " Ah";
    bateraiRow.classList.remove("hidden");
  } else {
    document.getElementById("baterai").innerText = "-";
    bateraiRow.classList.add("hidden");
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
  doc.text("Mentary - Sustainable Energy Service", 20, 30);

  const tableBody = [
      ["Kapasitas Panel", document.getElementById("panel").innerText],
      ["Inverter", document.getElementById("inverter").innerText],
    ];

  if (sistem !== "ongrid") {
    tableBody.splice(1, 0, ["Kapasitas Baterai", document.getElementById("baterai").innerText]);
  }
  
  tableBody.push(["Estimasi Harga", document.getElementById("harga").innerText]);

  doc.autoTable({
    startY: 40,
    head: [["Komponen", "Spesifikasi"]],
    body: tableBody,
    theme: 'grid',
    styles: { font: "helvetica", fontSize: 11 },
    headStyles: { fillColor: [16, 185, 129] } // Warna Hijau Primary
  });
  
  doc.setFontSize(10);
  doc.text("*Ini adalah estimasi kasar, harga dapat berubah.", 20, doc.autoTable.previous.finalY + 10);

  doc.save("RAB_SolarSystem.pdf");
}
