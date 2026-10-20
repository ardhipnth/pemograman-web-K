const STORE_KEY = "laundrytrack_orders";

const OLD_STORE_KEYS = ["laundrytrack_orders_v2", "laundrytrack_orders_v3"];

const SESSION_KURIR_KEY = "laundrytrack_kurir_aktif";

const PAKET_LAYANAN = {
  Kilat: {
    Komplit: {
      harga: 20000,
      estimasi: "2–3 jam",
    },

    Biasa: {
      harga: 18000,
      estimasi: "2–3 jam",
    },

    Setrika: {
      harga: 15000,
      estimasi: "2–3 jam",
    },
  },

  Express: {
    Komplit: {
      harga: 15000,
      estimasi: "5 jam",
    },

    Biasa: {
      harga: 12000,
      estimasi: "5 jam",
    },

    Setrika: {
      harga: 9000,
      estimasi: "5 jam",
    },
  },

  Regular: {
    Komplit: {
      harga: 8000,
      estimasi: "1 hari",
    },

    Biasa: {
      harga: 6000,
      estimasi: "1 hari",
    },

    Setrika: {
      harga: 5000,
      estimasi: "1 hari",
    },
  },
};

const DAFTAR_KURIR = [
  {
    id: "KR-01",
    nama: "Budi",
    pin: "1234",
  },

  {
    id: "KR-02",
    nama: "Andi",
    pin: "1234",
  },
];

const STATUS = {
  menunggu: {
    label: "Menunggu Penjemputan",
    badge: "badge-jemput",
  },

  ditugaskan_jemput: {
    label: "Kurir Ditugaskan - Jemput",
    badge: "badge-assigned",
  },

  dijemput: {
    label: "Sudah Dijemput",
    badge: "badge-assigned",
  },

  dicuci: {
    label: "Sedang Dicuci",
    badge: "badge-cuci",
  },

  disetrika: {
    label: "Sedang Disetrika",
    badge: "badge-cuci",
  },

  siap: {
    label: "Siap Diantar",
    badge: "badge-antar",
  },

  ditugaskan_antar: {
    label: "Kurir Ditugaskan - Antar",
    badge: "badge-assigned",
  },

  selesai: {
    label: "Selesai",
    badge: "badge-selesai",
  },
};

function ambilOrder() {
  try {
    const raw = localStorage.getItem(STORE_KEY);

    if (raw) {
      const data = JSON.parse(raw);

      if (Array.isArray(data)) {
        return data.map(normalisasiOrder);
      }
    }
  } catch (error) {
    console.error("Gagal membaca data:", error);
  }

  return [];
}

function simpanOrder(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

function normalisasiOrder(order) {
  const o = {
    ...order,
  };

  if (!o.id) {
    o.id = buatIdNotaDariList([]);
  }

  o.nama = o.nama || "-";

  o.hp = normalisasiHp(o.hp || "");

  o.alamat = o.alamat || "-";

  o.paket = o.paket || "Regular";

  o.layanan = o.layanan || "Biasa";

  if (typeof o.berat !== "number" || o.berat <= 0) {
    o.berat = null;
  }

  if (typeof o.hargaPerKg !== "number" || o.hargaPerKg <= 0) {
    o.hargaPerKg = null;
  }

  if (typeof o.total !== "number" || o.total <= 0) {
    o.total = null;
  }

  o.kurirJemput = o.kurirJemput || null;

  o.kurirAntar = o.kurirAntar || null;

  o.status = o.status || "menunggu";

  if (!STATUS[o.status]) {
    if (o.status === "ditugaskan") {
      o.status = "ditugaskan_jemput";
    } else if (o.status === "diantar") {
      o.status = "ditugaskan_antar";
    } else {
      o.status = "menunggu";
    }
  }

  o.log = Array.isArray(o.log) ? o.log : [];

  o.dibuat = o.dibuat || Date.now();

  return o;
}

function normalisasiHp(hp) {
  let angka = String(hp).replace(/\D/g, "");

  if (angka.startsWith("62")) {
    angka = "0" + angka.slice(2);
  }

  return angka;
}

function hpValid(hp) {
  return /^08\d{8,11}$/.test(normalisasiHp(hp));
}

function buatIdNotaDariList(list) {
  let maks = 0;

  list.forEach(function (order) {
    const match = /^INV-(\d+)$/.exec(order.id || "");

    if (match) {
      maks = Math.max(maks, Number(match[1]));
    }
  });

  return "INV-" + String(maks + 1).padStart(4, "0");
}

function buatIdNota() {
  return buatIdNotaDariList(ambilOrder());
}

function hargaLayanan(paket, layanan) {
  if (PAKET_LAYANAN[paket] && PAKET_LAYANAN[paket][layanan]) {
    return PAKET_LAYANAN[paket][layanan].harga;
  }

  return 0;
}

function estimasiLayanan(paket, layanan) {
  if (PAKET_LAYANAN[paket] && PAKET_LAYANAN[paket][layanan]) {
    return PAKET_LAYANAN[paket][layanan].estimasi;
  }

  return "-";
}

function hitungTotal(paket, layanan, berat) {
  const harga = hargaLayanan(paket, layanan);

  const kg = Number(berat);

  if (!harga || !kg || kg <= 0) {
    return 0;
  }

  return harga * kg;
}

function rupiah(n) {
  return "Rp " + Number(n || 0).toLocaleString("id-ID");
}

function esc(teks) {
  return String(teks ?? "").replace(/[&<>"']/g, function (c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c];
  });
}

function formatTanggal(timestamp) {
  if (!timestamp) {
    return "-";
  }

  return new Date(timestamp).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function tambahLog(order, teks) {
  if (!Array.isArray(order.log)) {
    order.log = [];
  }

  order.log.push({
    waktu: Date.now(),

    teks,
  });
}

function resetSemuaData() {
  localStorage.removeItem(STORE_KEY);

  OLD_STORE_KEYS.forEach(function (key) {
    localStorage.removeItem(key);
  });

  localStorage.removeItem(SESSION_KURIR_KEY);
}
