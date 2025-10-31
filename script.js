function hitungKebutuhan() {
  const daya = parseFloat(document.getElementById("daya").value);
  const tegangan = parseFloat(document.getElementById("tegangan").value);
  const sistem = document.getElementById("sistem").value;

  if (!daya || daya <= 0) {
    alert("Masukkan daya beban dengan benar!");
    return;
  }

  let panel = (daya * 5) / 1000; // misal 5 jam efektif matahari
  let baterai = sistem !== "ongrid" ? (daya * 5) / tegangan : 0;
  let inverter = daya * 1.2;
  let harga = panel * 5000000; // estimasi kasar per kWp

  document.getElementById("panel").innerText = panel.toFixed(2) + " kWp";
  document.getElementById("baterai").innerText =
    sistem !== "ongrid" ? baterai.toFixed(0) + " Ah" : "-";
  document.getElementById("inverter").innerText = inverter.toFixed(0) + " Watt";
  document.getElementById("harga").innerText = "Rp " + harga.toLocaleString();

  document.getElementById("hasil").classList.remove("hidden");
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Rencana Anggaran Biaya (RAB)", 20, 20);
  doc.setFontSize(12);
  doc.text("CV Sustainable Energy Service", 20, 30);

  doc.text("Kapasitas Panel: " + document.getElementById("panel").innerText, 20, 50);
  doc.text("Kapasitas Baterai: " + document.getElementById("baterai").innerText, 20, 60);
  doc.text("Inverter: " + document.getElementById("inverter").innerText, 20, 70);
  doc.text("Estimasi Harga: " + document.getElementById("harga").innerText, 20, 80);

  doc.save("RAB_SolarSystem.pdf");
}