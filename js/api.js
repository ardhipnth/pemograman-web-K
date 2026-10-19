/* =========================================================
   LAUNDRYTRACK - API BRIDGE
   Support 2 backend: Node.js (server.js) & PHP (backend-php)
========================================================= */

/* =========================================================
   KONFIGURASI BACKEND
   ---------------------------------------------------------
   Pilih salah satu:
   - "node" → pakai server.js di port 3000 (localhost:3000)
   - "php"  → pakai PHP di XAMPP (localhost/laundrytrack/backend-php)
========================================================= */

const BACKEND_MODE = "php"; // ← GANTI DI SINI SAJA

const API_CONFIG = {
  node: {
    baseUrl: "http://localhost:3000/api",
    // Node.js pakai REST path: /orders, /orders/:id
    buildUrl: (endpoint, id) => {
      if (endpoint === "orders" && id) {
        return `${API_CONFIG.node.baseUrl}/orders/${encodeURIComponent(id)}`;
      }
      return `${API_CONFIG.node.baseUrl}/${endpoint}`;
    },
  },
  php: {
    baseUrl: "http://localhost/laundrytrack/backend-php",
    // PHP pakai query string: orders.php, orders.php?id=xxx
    buildUrl: (endpoint, id) => {
      const base = `${API_CONFIG.php.baseUrl}/${endpoint}.php`;
      return id ? `${base}?id=${encodeURIComponent(id)}` : base;
    },
  },
};

function apiUrl(endpoint, id) {
  const cfg = API_CONFIG[BACKEND_MODE] || API_CONFIG.php;
  return cfg.buildUrl(endpoint, id);
}

/* =========================================================
   STATE
========================================================= */

let apiSyncing = false;
let apiWritingLocalStorage = false;
let apiInitialized = false;

/* =========================================================
   GET ORDERS
========================================================= */

async function getOrdersAPI() {
  const response = await fetch(apiUrl("orders"), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`GET orders gagal: ${response.status}`);
  }

  const result = await response.json();
  return Array.isArray(result.data) ? result.data : [];
}

/* =========================================================
   GET ORDER BY ID
========================================================= */

async function getOrderByIdAPI(id) {
  const response = await fetch(apiUrl("orders", id), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`GET order ${id} gagal: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

/* =========================================================
   CREATE ORDER
========================================================= */

async function createOrderAPI(order) {
  const response = await fetch(apiUrl("orders"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POST order gagal: ${response.status} ${text}`);
  }

  const result = await response.json();
  return result.data;
}

/* =========================================================
   UPDATE ORDER
========================================================= */

async function updateOrderAPI(id, data) {
  const response = await fetch(apiUrl("orders", id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PUT order gagal: ${response.status} ${text}`);
  }

  const result = await response.json();
  return result.data;
}

/* =========================================================
   DELETE ORDER
========================================================= */

async function deleteOrderAPI(id) {
  const response = await fetch(apiUrl("orders", id), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`DELETE order gagal: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

/* =========================================================
   LOCAL STORAGE HELPER
========================================================= */

function ambilLocalOrdersAPI() {
  try {
    const raw = localStorage.getItem("laundrytrack_orders");
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Gagal membaca localStorage:", error);
    return [];
  }
}

function simpanLocalOrdersAPI(orders) {
  try {
    apiWritingLocalStorage = true;
    localStorage.setItem(
      "laundrytrack_orders",
      JSON.stringify(Array.isArray(orders) ? orders : []),
    );
  } catch (error) {
    console.error("Gagal menyimpan data API ke localStorage:", error);
  } finally {
    apiWritingLocalStorage = false;
  }
}

/* =========================================================
   NOTIFY UI
========================================================= */

function notifyLaundryTrackUpdated() {
  window.dispatchEvent(new CustomEvent("laundrytrack:orders-updated"));
  window.dispatchEvent(new Event("storage"));
}

/* =========================================================
   CARI ORDER DI SERVER
========================================================= */

async function cariOrderServer(id) {
  try {
    return await getOrderByIdAPI(id);
  } catch {
    return null;
  }
}

/* =========================================================
   SINKRON LOCAL STORAGE -> API
========================================================= */

async function syncLocalToAPI() {
  if (apiSyncing) return;
  apiSyncing = true;

  try {
    const localOrders = ambilLocalOrdersAPI();
    if (!localOrders.length) return;

    let serverOrders = [];
    try {
      serverOrders = await getOrdersAPI();
    } catch (error) {
      console.error("API tidak bisa diakses:", error);
      return;
    }

    const serverMap = new Map();
    serverOrders.forEach((order) => {
      if (order && order.id) serverMap.set(String(order.id), order);
    });

    for (const localOrder of localOrders) {
      if (!localOrder || !localOrder.id) continue;
      const id = String(localOrder.id);
      const serverOrder = serverMap.get(id);

      if (!serverOrder) {
        try {
          console.log(`API [${BACKEND_MODE}]: POST`, localOrder.id);
          await createOrderAPI(localOrder);
        } catch (error) {
          console.error("Gagal POST order:", localOrder.id, error);
        }
        continue;
      }

      const localJSON = JSON.stringify(localOrder);
      const serverJSON = JSON.stringify(serverOrder);

      if (localJSON !== serverJSON) {
        try {
          console.log(`API [${BACKEND_MODE}]: PUT`, localOrder.id);
          await updateOrderAPI(id, localOrder);
        } catch (error) {
          console.error("Gagal PUT order:", localOrder.id, error);
        }
      }
    }
  } catch (error) {
    console.error("syncLocalToAPI error:", error);
  } finally {
    apiSyncing = false;
  }
}

/* =========================================================
   API -> LOCAL STORAGE
========================================================= */

async function syncAPIToLocal() {
  if (apiSyncing) return;

  try {
    const serverOrders = await getOrdersAPI();

    if (!serverOrders.length && !ambilLocalOrdersAPI().length) return;

    simpanLocalOrdersAPI(serverOrders);
    notifyLaundryTrackUpdated();

    console.log(
      `API [${BACKEND_MODE}] -> LocalStorage:`,
      serverOrders.length,
      "order",
    );
  } catch (error) {
    console.error("Gagal sync API -> localStorage:", error);
  }
}

/* =========================================================
   INITIAL SYNC
========================================================= */

async function initAPISync() {
  if (apiInitialized) return;
  apiInitialized = true;

  console.log("====================================");
  console.log("LaundryTrack API Bridge aktif");
  console.log("Mode  :", BACKEND_MODE.toUpperCase());
  console.log("URL   :", API_CONFIG[BACKEND_MODE].baseUrl);
  console.log("====================================");

  let serverOrders = [];
  try {
    serverOrders = await getOrdersAPI();
    console.log("Order di server:", serverOrders.length);
  } catch (error) {
    console.error("SERVER API TIDAK TERHUBUNG!", error);
    console.error("Cek apakah XAMPP (Apache + MySQL) sudah jalan.");
    return;
  }

  const localOrders = ambilLocalOrdersAPI();
  console.log("Order localStorage:", localOrders.length);

  if (serverOrders.length === 0 && localOrders.length > 0) {
    console.log("Server kosong. Upload order localStorage...");
    await syncLocalToAPI();
  } else {
    await syncAPIToLocal();
  }
}

/* =========================================================
   INTERCEPT localStorage.setItem
========================================================= */

(function pasangLocalStorageInterceptor() {
  const originalSetItem = Storage.prototype.setItem;

  Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (key !== "laundrytrack_orders") return;
    if (apiWritingLocalStorage) return;

    setTimeout(() => {
      syncLocalToAPI();
    }, 100);
  };
})();

/* =========================================================
   LISTEN EVENT
========================================================= */

window.addEventListener("laundrytrack:orders-updated", function () {
  try {
    if (typeof renderOrders === "function") renderOrders();
  } catch (error) {
    console.error("renderOrders error:", error);
  }

  try {
    if (typeof tampilkanRiwayat === "function") tampilkanRiwayat();
  } catch (error) {
    console.error("tampilkanRiwayat error:", error);
  }
});

/* =========================================================
   POLLING API (setiap 2 detik)
========================================================= */

setInterval(async function () {
  if (apiSyncing) return;

  try {
    const serverOrders = await getOrdersAPI();
    const localOrders = ambilLocalOrdersAPI();

    const serverJSON = JSON.stringify(serverOrders);
    const localJSON = JSON.stringify(localOrders);

    if (serverJSON !== localJSON) {
      console.log(`API [${BACKEND_MODE}] berubah -> update UI`);
      simpanLocalOrdersAPI(serverOrders);
      notifyLaundryTrackUpdated();
    }
  } catch (error) {
    console.warn("Polling API gagal:", error.message);
  }
}, 2000);

/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    initAPISync();
  }, 300);
});

/* =========================================================
   DISPLAY API ORDERS (untuk admin.html)
========================================================= */

async function tampilkanOrdersAPI() {
  const container = document.getElementById("api-orders");
  if (!container) return;

  container.innerHTML = `
    <div style="padding:20px;text-align:center;color:#64748b">
      Memuat data dari API...
    </div>`;

  try {
    const orders = await getOrdersAPI();

    if (!orders.length) {
      container.innerHTML = `
        <div style="padding:30px;text-align:center;color:#94a3b8">
          Belum ada data order dari API.
        </div>`;
      return;
    }

    container.innerHTML = orders
      .map(
        (order) => `
        <div style="
          border:1px solid #e2e8f0;
          border-radius:12px;
          padding:16px;
          margin-bottom:12px;
          background:white;
        ">
          <strong>${escapeHTMLAPI(order.id)}</strong>
          <div>${escapeHTMLAPI(order.nama)}</div>
          <div>${escapeHTMLAPI(order.hp)}</div>
          <div>${escapeHTMLAPI(order.paket)} - ${escapeHTMLAPI(order.layanan)}</div>
          <div>Status: <strong>${escapeHTMLAPI(order.status)}</strong></div>
        </div>`,
      )
      .join("");
  } catch (error) {
    container.innerHTML = `
      <div style="padding:20px;text-align:center;color:#dc2626">
        Gagal mengambil data API.
      </div>`;
    console.error(error);
  }
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTMLAPI(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
