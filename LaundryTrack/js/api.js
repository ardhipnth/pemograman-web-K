/* =========================================================
   LAUNDRYTRACK - API BRIDGE (FINAL STABLE)
========================================================= */

const BACKEND_MODE = "php";

const API_CONFIG = {
  php: {
    baseUrl: "http://127.0.0.1:8000/api",
    buildUrl: (endpoint, id) => {
      const base = `${API_CONFIG.php.baseUrl}/orders`;
      return id ? `${base}/${id}` : base;
    },
  },
};

function apiUrl(endpoint, id) {
  return API_CONFIG[BACKEND_MODE].buildUrl(endpoint, id);
}

let apiSyncing = false;

async function getOrdersAPI() {
  const response = await fetch(apiUrl("orders"), {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`GET gagal: ${response.status}`);
  const result = await response.json();
  return Array.isArray(result.data) ? result.data : [];
}

async function createOrderAPI(order) {
  const response = await fetch(apiUrl("orders"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error(`POST gagal: ${response.status}`);
  const result = await response.json();
  return result.data;
}

async function updateOrderAPI(id, data) {
  const response = await fetch(apiUrl("orders", id), {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`PUT gagal: ${response.status}`);
  const result = await response.json();
  return result.data;
}

async function deleteOrderAPI(id) {
  const response = await fetch(apiUrl("orders", id), {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`DELETE gagal: ${response.status}`);
  const result = await response.json();
  return result.data;
}

function ambilLocalOrdersAPI() {
  try {
    const raw = localStorage.getItem("laundrytrack_orders");
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function simpanLocalOrdersAPI(orders) {
  try {
    localStorage.setItem("laundrytrack_orders", JSON.stringify(orders));
  } catch (error) {}
}

function notifyLaundryTrackUpdated() {
  window.dispatchEvent(new CustomEvent("laundrytrack:orders-updated"));
}

async function syncData() {
  if (apiSyncing) return;
  apiSyncing = true;
  try {
    const serverOrders = await getOrdersAPI();
    simpanLocalOrdersAPI(serverOrders);
    notifyLaundryTrackUpdated();
  } catch (error) {
    console.warn("Server API tidak terjangkau:", error.message);
  } finally {
    apiSyncing = false;
  }
}

window.addEventListener("laundrytrack:orders-updated", function () {
  if (typeof renderOrders === "function") renderOrders();
  if (typeof renderCurrentPage === "function") renderCurrentPage();
});

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(syncData, 500);
  setInterval(syncData, 3000);
});

async function tampilkanOrdersAPI() {
  const container = document.getElementById("api-orders");
  if (!container) return;
  try {
    const orders = await getOrdersAPI();
    if (!orders.length) {
      container.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8">Belum ada data order dari API.</div>`;
      return;
    }
    container.innerHTML = orders
      .map(
        (order) => `
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;background:white;">
        <strong>${order.id}</strong><div>${order.nama}</div><div>Status: ${order.status}</div>
      </div>`,
      )
      .join("");
  } catch (error) {
    container.innerHTML = `<div style="color:#dc2626">Gagal mengambil data API.</div>`;
  }
}
