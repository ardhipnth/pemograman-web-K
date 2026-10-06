function cekStatus() {
  const input = document.getElementById("noHpInput").value;

  if (input.trim() === "") {
    alert("Masukkan nomor HP dulu, cak!");
    return;
  }

  document.getElementById("searchSection").style.display = "none";

  document.getElementById("resultSection").style.display = "block";
}

function resetForm() {
  document.getElementById("noHpInput").value = "";

  document.getElementById("searchSection").style.display = "block";

  document.getElementById("resultSection").style.display = "none";
}
