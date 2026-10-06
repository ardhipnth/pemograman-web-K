// ==================================================
// ADMIN - LaundryTrack (class Tailwind)
// ==================================================

// Kumpulan class Tailwind yang dipakai ulang di HTML buatan JS
const TD =
  "border-b border-slate-100 px-5 py-[18px] align-middle text-[0.78rem] text-slate-600";
const BTN =
  "cursor-pointer rounded-[7px] px-2.5 py-[7px] text-[0.68rem] transition ";
const BTN_ASSIGN = BTN + "bg-sky-100 text-sky-600 hover:bg-sky-200";
const BTN_NEXT = BTN + "bg-violet-100 text-violet-700 hover:bg-violet-200";
const BTN_DONE = BTN + "cursor-default bg-green-100 text-green-700";
const BTN_VIEW =
  BTN +
  "ml-1 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700";
const LABEL = "mb-1.5 mt-3 block text-[0.72rem] font-semibold text-slate-600";
const INPUT =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[0.8rem] outline-none focus:border-sky-500 focus:ring-[3px] focus:ring-sky-500/10";
const BTN_FULL =
  "mt-[18px] w-full cursor-pointer rounded-lg bg-sky-500 py-3 text-[0.8rem] text-white transition hover:bg-sky-600";

const BADGE = {
  menunggu: "bg-amber-100 text-amber-700",
  ditugaskan: "bg-blue-100 text-blue-700",
  dicuci: "bg-violet-100 text-violet-700",
  disetrika: "bg-violet-100 text-violet-700",
  siap: "bg-green-100 text-green-700",
  diantar: "bg-green-100 text-green-700",
  selesai: "bg-slate-200 text-slate-600",
};

function render() {
  const list = ambilOrder();
  const aktif = list.filter(function (o) {
    return o.status !== "selesai";
  });

  // Statistik
  const proses = list.filter(function (o) {
    return o.status === "dicuci" || o.status === "disetrika";
  }).length;
  const menunggu = list.filter(function (o) {
    return o.status === "menunggu" || o.status === "ditugaskan";
  }).length;
  const pendapatan = list
    .filter(function (o) {
      return o.status === "selesai";
    })
    .reduce(function (t, o) {
      return t + (HARGA_LAYANAN[o.layanan] || 0);
    }, 0);

  document.getElementById("statMasuk").innerText = list.length;
  document.getElementById("statJemput").innerText = menunggu;
  document.getElementById("statProses").innerText = proses;
  document.getElementById("statUang").innerText = rupiah(pendapatan);

  const body = document.getElementById("orderBody");

  if (aktif.length === 0) {
    body.innerHTML =
      '<tr><td colspan="6" class="' +
      TD +
      ' text-center text-slate-400">Belum ada pesanan aktif.</td></tr>';
    return;
  }

  body.innerHTML = aktif
    .map(function (o) {
      const kurirHtml = o.kurir
        ? '<strong class="font-semibold text-slate-600">' +
          esc(o.kurir.nama) +
          " (" +
          o.kurir.id +
          ")</strong>"
        : "-";

      let tombol;
      if (o.status === "menunggu" || o.status === "siap") {
        const label =
          o.status === "menunggu" ? "Assign Jemput" : "Assign Antar";
        tombol =
          '<button class="' +
          BTN_ASSIGN +
          '" onclick="bukaAssign(\'' +
          o.id +
          '\')"><i class="fa-solid fa-motorcycle"></i> ' +
          label +
          "</button>";
      } else if (o.status === "dicuci" || o.status === "disetrika") {
        const label = o.status === "dicuci" ? "Mulai Setrika" : "Siap Diantar";
        tombol =
          '<button class="' +
          BTN_NEXT +
          '" onclick="lanjutStatus(\'' +
          o.id +
          '\')"><i class="fa-solid fa-arrow-right"></i> ' +
          label +
          "</button>";
      } else {
        const label =
          o.status === "ditugaskan" ? "Menunggu Kurir" : "Sedang Diantar";
        tombol =
          '<button class="' +
          BTN_DONE +
          '" disabled><i class="fa-solid fa-hourglass-half"></i> ' +
          label +
          "</button>";
      }

      return (
        '<tr class="transition hover:bg-slate-50">' +
        '<td class="' +
        TD +
        ' whitespace-nowrap font-bold text-sky-600">#' +
        o.id +
        "</td>" +
        '<td class="' +
        TD +
        '"><strong class="font-semibold">' +
        esc(o.nama) +
        '</strong><br><span class="mt-1 inline-block text-[0.72rem] text-slate-400"><i class="fa-solid fa-location-dot mr-[3px]"></i>' +
        esc(o.alamat) +
        "</span></td>" +
        '<td class="' +
        TD +
        '">' +
        esc(o.layanan) +
        "</td>" +
        '<td class="' +
        TD +
        '"><span class="inline-block whitespace-nowrap rounded-full px-2.5 py-1.5 text-[0.68rem] font-semibold ' +
        BADGE[o.status] +
        '">' +
        STATUS[o.status].label +
        "</span></td>" +
        '<td class="' +
        TD +
        '">' +
        kurirHtml +
        "</td>" +
        '<td class="' +
        TD +
        ' whitespace-nowrap">' +
        tombol +
        '<button class="' +
        BTN_VIEW +
        '" title="Detail" onclick="bukaDetail(\'' +
        o.id +
        '\')"><i class="fa-solid fa-eye"></i></button></td>' +
        "</tr>"
      );
    })
    .join("");
}

// ---------- MODAL ----------

function tampilModal(judul, isi) {
  document.getElementById("modalRoot").innerHTML =
    '<div class="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-5" onclick="if(event.target===this)tutupModal()">' +
    '<div class="w-full max-w-[420px] overflow-hidden rounded-[14px] bg-white shadow-[0_20px_40px_rgba(15,23,42,0.25)]">' +
    '<div class="flex items-center justify-between border-b border-slate-200 px-[22px] py-[18px]">' +
    '<h3 class="text-base font-semibold">' +
    judul +
    "</h3>" +
    '<button class="cursor-pointer text-2xl text-slate-400" onclick="tutupModal()">&times;</button></div>' +
    '<div class="px-[22px] pb-6 pt-5">' +
    isi +
    "</div></div></div>";
}

function tutupModal() {
  document.getElementById("modalRoot").innerHTML = "";
}

// ---------- ORDER BARU ----------

function bukaFormOrder() {
  const opsi = Object.keys(HARGA_LAYANAN)
    .map(function (l) {
      return "<option>" + l + "</option>";
    })
    .join("");

  tampilModal(
    "Order Baru",
    '<label class="' +
      LABEL +
      '">Nama Pelanggan</label><input id="fNama" type="text" placeholder="Contoh: Bu Rina" class="' +
      INPUT +
      '">' +
      '<label class="' +
      LABEL +
      '">Nomor HP</label><input id="fHp" type="tel" placeholder="08xxxxxxxxxx" class="' +
      INPUT +
      '">' +
      '<label class="' +
      LABEL +
      '">Alamat Penjemputan</label><input id="fAlamat" type="text" placeholder="Jl. / Kos / Perumahan" class="' +
      INPUT +
      '">' +
      '<label class="' +
      LABEL +
      '">Layanan</label><select id="fLayanan" class="' +
      INPUT +
      '">' +
      opsi +
      "</select>" +
      '<p id="fError" class="mt-2.5 min-h-[1em] text-[0.72rem] text-red-600"></p>' +
      '<button class="' +
      BTN_FULL +
      '" onclick="simpanOrderBaru()">Simpan Order</button>',
  );
}

function simpanOrderBaru() {
  const nama = document.getElementById("fNama").value.trim();
  const hp = document.getElementById("fHp").value.trim();
  const alamat = document.getElementById("fAlamat").value.trim();
  const layanan = document.getElementById("fLayanan").value;
  const err = document.getElementById("fError");

  if (!nama || !hp || !alamat) {
    err.innerText = "Semua kolom wajib diisi.";
    return;
  }
  if (!hpValid(hp)) {
    err.innerText = "Nomor HP tidak valid (contoh: 081234567890).";
    return;
  }

  const list = ambilOrder();
  list.push({
    id: buatIdNota(),
    nama: nama,
    hp: normalisasiHp(hp),
    alamat: alamat,
    layanan: layanan,
    status: "menunggu",
    kurir: null,
    log: [],
  });
  simpanOrder(list);

  tutupModal();
  render();
}

// ---------- ASSIGN KURIR ----------

function bukaAssign(id) {
  const o = ambilOrder().find(function (x) {
    return x.id === id;
  });
  const judul =
    o && o.status === "siap"
      ? "Tugaskan Kurir Pengantaran"
      : "Tugaskan Kurir Penjemputan";

  const opsi = DAFTAR_KURIR.map(function (k) {
    return (
      '<option value="' + k.id + '">' + k.nama + " (" + k.id + ")</option>"
    );
  }).join("");

  tampilModal(
    judul,
    '<label class="' +
      LABEL +
      '">Pilih Kurir</label><select id="fKurir" class="' +
      INPUT +
      '">' +
      opsi +
      "</select>" +
      '<button class="' +
      BTN_FULL +
      '" onclick="tugaskanKurir(\'' +
      id +
      "')\">Tugaskan</button>",
  );
}

function tugaskanKurir(id) {
  const idKurir = document.getElementById("fKurir").value;
  const kurir = DAFTAR_KURIR.find(function (k) {
    return k.id === idKurir;
  });

  const list = ambilOrder();
  const order = list.find(function (o) {
    return o.id === id;
  });
  if (!order || !kurir) return;

  order.kurir = kurir;
  order.status = order.status === "siap" ? "diantar" : "ditugaskan";
  simpanOrder(list);

  tutupModal();
  render();
}

// ---------- PROSES DI LAUNDRY (dicuci -> disetrika -> siap) ----------

function lanjutStatus(id) {
  const list = ambilOrder();
  const order = list.find(function (o) {
    return o.id === id;
  });
  if (!order) return;

  if (order.status === "dicuci") order.status = "disetrika";
  else if (order.status === "disetrika") order.status = "siap";

  simpanOrder(list);
  render();
}

// ---------- RESET DATA ----------

function resetData() {
  if (confirm("Hapus semua data pesanan?")) {
    localStorage.removeItem(STORE_KEY);
    render();
  }
}

// ---------- DETAIL ----------

function bukaDetail(id) {
  const o = ambilOrder().find(function (x) {
    return x.id === id;
  });
  if (!o) return;

  const baris = function (label, isi) {
    return (
      '<p class="flex justify-between gap-4 border-b border-slate-100 py-[9px] text-[0.8rem]"><span class="text-slate-400">' +
      label +
      '</span><strong class="text-right font-semibold text-slate-700">' +
      isi +
      "</strong></p>"
    );
  };

  tampilModal(
    "Detail #" + o.id,
    baris("Nama", esc(o.nama)) +
      baris("No. HP", o.hp) +
      baris("Alamat", esc(o.alamat)) +
      baris("Layanan", esc(o.layanan)) +
      baris("Harga", rupiah(HARGA_LAYANAN[o.layanan] || 0)) +
      baris("Status", STATUS[o.status].label) +
      baris(
        "Kurir",
        o.kurir ? esc(o.kurir.nama) + " (" + o.kurir.id + ")" : "-",
      ),
  );
}

document.addEventListener("DOMContentLoaded", render);
window.addEventListener("storage", render);
