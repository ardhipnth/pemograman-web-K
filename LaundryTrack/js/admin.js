function tugaskanKurir(rowId, namaKurir) {
  const row = document.getElementById(rowId);

  if (!row) {
    return;
  }

  const courierCell = row.querySelector(".courier-cell");
  const statusBadge = row.querySelector(".badge");

  // Mengisi nama kurir
  if (courierCell) {
    courierCell.innerHTML =
      "<strong class='courier-name'>" + namaKurir + " (KR-01)</strong>";
  }

  // Mengubah status pesanan
  if (statusBadge) {
    statusBadge.textContent = "Kurir Ditugaskan";
    statusBadge.className = "badge badge-assigned";
  }

  // Mengubah tombol Assign
  const button = row.querySelector(".btn-assign");

  if (button) {
    button.innerHTML = '<i class="fa-solid fa-check"></i> Assigned';

    button.disabled = true;
    button.classList.add("assigned");
  }

  alert("Kurir " + namaKurir + " berhasil ditugaskan!");
}
