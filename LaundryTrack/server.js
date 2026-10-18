const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());
app.use(express.json());

/* =========================================================
   FILE DATABASE SEDERHANA
========================================================= */

const DB_FILE = "./db.json";

/* =========================================================
   BACA DATABASE
========================================================= */

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ orders: [] }, null, 2));
      return { orders: [] };
    }

    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data);

    if (!parsed || typeof parsed !== "object") {
      return { orders: [] };
    }

    if (!Array.isArray(parsed.orders)) {
      parsed.orders = [];
    }

    return parsed;
  } catch (error) {
    console.error("Gagal membaca db.json:", error.message);
    return { orders: [] };
  }
}

/* =========================================================
   SIMPAN DATABASE
========================================================= */

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Gagal menyimpan db.json:", error.message);
    return false;
  }
}

/* =========================================================
   API TEST
========================================================= */

app.get("/api", (req, res) => {
  res.json({
    message: "LaundryTrack API aktif",
    status: "success",
  });
});

/* =========================================================
   ORDERS - GET SEMUA
========================================================= */

app.get("/api/orders", (req, res) => {
  const db = readDB();

  res.json({
    status: "success",
    data: db.orders,
  });
});

/* =========================================================
   ORDERS - GET BY ID
========================================================= */

app.get("/api/orders/:id", (req, res) => {
  const db = readDB();

  const order = db.orders.find(
    (order) => String(order.id) === String(req.params.id),
  );

  if (!order) {
    return res.status(404).json({
      status: "error",
      message: "Order tidak ditemukan",
    });
  }

  res.json({
    status: "success",
    data: order,
  });
});

/* =========================================================
   ORDERS - POST BARU
   (FIX: pakai ID dari frontend, cegah duplikat)
========================================================= */

app.post("/api/orders", (req, res) => {
  const db = readDB();
  const payload = req.body || {};

  if (!payload.id) {
    return res.status(400).json({
      status: "error",
      message: "Field 'id' wajib ada di payload.",
    });
  }

  // Cek duplikat: kalau ID sudah ada, anggap update (idempotent)
  const sudahAda = db.orders.findIndex(
    (o) => String(o.id) === String(payload.id),
  );

  if (sudahAda !== -1) {
    db.orders[sudahAda] = { ...db.orders[sudahAda], ...payload };
    writeDB(db);

    return res.json({
      status: "success",
      message: "Order sudah ada, diupdate.",
      data: db.orders[sudahAda],
    });
  }

  // Order baru — pakai ID dari frontend (bukan Date.now)
  const newOrder = { ...payload };

  db.orders.push(newOrder);
  writeDB(db);

  res.status(201).json({
    status: "success",
    message: "Order berhasil ditambahkan",
    data: newOrder,
  });
});

/* =========================================================
   ORDERS - PUT UPDATE
========================================================= */

app.put("/api/orders/:id", (req, res) => {
  const db = readDB();

  const index = db.orders.findIndex(
    (order) => String(order.id) === String(req.params.id),
  );

  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: "Order tidak ditemukan",
    });
  }

  db.orders[index] = {
    ...db.orders[index],
    ...req.body,
    id: db.orders[index].id, // ID tidak boleh berubah
  };

  writeDB(db);

  res.json({
    status: "success",
    message: "Order berhasil diperbarui",
    data: db.orders[index],
  });
});

/* =========================================================
   ORDERS - DELETE BY ID
========================================================= */

app.delete("/api/orders/:id", (req, res) => {
  const db = readDB();

  const index = db.orders.findIndex(
    (order) => String(order.id) === String(req.params.id),
  );

  if (index === -1) {
    return res.status(404).json({
      status: "error",
      message: "Order tidak ditemukan",
    });
  }

  const deletedOrder = db.orders.splice(index, 1)[0];

  writeDB(db);

  res.json({
    status: "success",
    message: "Order berhasil dihapus",
    data: deletedOrder,
  });
});

/* =========================================================
   ORDERS - DELETE SEMUA (RESET)
========================================================= */

app.delete("/api/orders", (req, res) => {
  writeDB({ orders: [] });

  res.json({
    status: "success",
    message: "Semua order berhasil dihapus",
  });
});

/* =========================================================
   404 FALLBACK
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Endpoint ${req.method} ${req.url} tidak ditemukan.`,
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log("");
  console.log("======================================");
  console.log("   LaundryTrack API Server Aktif");
  console.log("======================================");
  console.log(`   URL   : http://localhost:${PORT}`);
  console.log(`   API   : http://localhost:${PORT}/api/orders`);
  console.log(`   Data  : ${DB_FILE}`);
  console.log("======================================");
  console.log("   Tekan Ctrl + C untuk berhenti.");
  console.log("");
});
