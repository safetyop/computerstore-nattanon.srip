const API = "/api/products";

// ── UTILS ──
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const fmt = (n) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 }) + " ฿";

const CATEGORY_BADGE = {
  CPU: "b-cyan",
  GPU: "b-purple",
  RAM: "b-green",
  Storage: "b-orange",
  Motherboard: "b-red",
  PSU: "b-gray",
  Cooling: "b-cyan",
  Case: "b-gray",
  Monitor: "b-green",
  Peripheral: "b-orange",
};

function catBadge(cat) {
  return `<span class="badge ${CATEGORY_BADGE[cat] || "b-gray"}">${esc(
    cat || "—"
  )}</span>`;
}

function stockBadge(n) {
  if (n <= 0) return `<span class="badge b-red stock-out">SOLD OUT</span>`;
  if (n <= 5) return `<span class="badge b-orange stock-low">LOW ${n}</span>`;
  return `<span class="stock-ok">${n}</span>`;
}

function showAlert(id, type, msg) {
  const el = $(id);
  if (!el) return;
  el.className = `alert alert-${type} show`;
  el.innerHTML = `<span>${type === "success" ? "✓" : "✗"}</span> ${msg}`;
  setTimeout(() => (el.className = "alert"), 4000);
}

// ── INDEX PAGE ──
async function loadProducts() {
  const tbody = $("tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2.5rem;color:#6b6b80;letter-spacing:.1em">LOADING...</td></tr>`;

  try {
    const res = await fetch(API);
    const { data = [] } = await res.json();

    // Stats
    const totalVal = data.reduce((s, p) => s + p.price * p.stock, 0);
    const lowStock = data.filter((p) => p.stock <= 5).length;
    if ($("statCount")) $("statCount").textContent = data.length;
    if ($("statValue")) $("statValue").textContent = fmt(totalVal);
    if ($("statLow")) $("statLow").textContent = lowStock;

    renderTable(data);
    setupSearch(data);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="color:#ff3b5c;padding:2rem;text-align:center">ERROR: ${esc(
      err.message
    )}</td></tr>`;
  }
}

function renderTable(products) {
  const tbody = $("tbody");
  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">◻</div><p class="empty-text">NO PRODUCTS FOUND</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = products
    .map(
      (p, i) => `
    <tr class="fade-up" style="animation-delay:${i * 0.03}s">
      <td style="color:#6b6b80;font-size:.72rem">${String(i + 1).padStart(
        2,
        "0"
      )}</td>
      <td><span class="product-name">${esc(p.name)}</span></td>
      <td>${catBadge(p.category)}</td>
      <td style="color:#6b6b80">${esc(p.brand || "—")}</td>
      <td class="price-tag">${fmt(p.price)}</td>
      <td>${stockBadge(p.stock)}</td>
      <td style="color:#6b6b80;font-size:.76rem">${new Date(
        p.created_at
      ).toLocaleDateString("th-TH")}</td>
      <td style="display:flex;gap:.4rem">
        <a href="/edit?id=${p.id}" class="btn btn-edit btn-sm">EDIT</a>
        <button class="btn btn-danger btn-sm" onclick="openDelete('${
          p.id
        }','${esc(p.name)}')">DEL</button>
      </td>
    </tr>`
    )
    .join("");
}

function setupSearch(data) {
  const si = $("searchInput");
  const cf = $("catFilter");
  if (!si) return;
  const run = () => {
    const q = si.value.toLowerCase();
    const cat = cf?.value || "";
    renderTable(
      data.filter((p) => {
        const mq =
          p.name.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q);
        const mc = !cat || p.category === cat;
        return mq && mc;
      })
    );
  };
  si.addEventListener("input", run);
  cf?.addEventListener("change", run);
}

// ── DELETE MODAL ──
let _delId = null;
function openDelete(id, name) {
  _delId = id;
  const el = $("delName");
  if (el) el.textContent = name;
  $("delModal")?.classList.add("show");
}
function closeDelete() {
  _delId = null;
  $("delModal")?.classList.remove("show");
}
async function execDelete() {
  if (!_delId) return;
  try {
    const res = await fetch(`${API}/${_delId}`, { method: "DELETE" });
    const json = await res.json();
    closeDelete();
    if (json.success) {
      showAlert("pageAlert", "success", "ลบสินค้าสำเร็จ");
      loadProducts();
    } else showAlert("pageAlert", "error", json.message);
  } catch (e) {
    showAlert("pageAlert", "error", e.message);
  }
}

// ── ADD FORM ──
async function handleAdd(e) {
  e.preventDefault();
  const f = e.target;
  const btn = f.querySelector('button[type="submit"]');
  btn.innerHTML = '<span class="spinner"></span> SAVING...';
  btn.disabled = true;
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.name.value.trim(),
        category: f.category.value,
        brand: f.brand.value.trim(),
        price: f.price.value,
        stock: f.stock.value,
        description: f.description.value.trim(),
      }),
    });
    const json = await res.json();
    if (json.success) {
      showAlert("formAlert", "success", "เพิ่มสินค้าสำเร็จ");
      f.reset();
    } else showAlert("formAlert", "error", json.message);
  } catch (e) {
    showAlert("formAlert", "error", e.message);
  } finally {
    btn.innerHTML = "SAVE PRODUCT";
    btn.disabled = false;
  }
}

// ── EDIT PAGE ──
async function loadEditProduct() {
  const f = $("editForm");
  if (!f) return;
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return (location.href = "/");
  try {
    const res = await fetch(`${API}/${id}`);
    const { data: p } = await res.json();
    if (!p) {
      alert("ไม่พบสินค้า");
      return (location.href = "/");
    }
    $("productId").value = p.id;
    $("eName").value = p.name;
    $("eCategory").value = p.category || "";
    $("eBrand").value = p.brand || "";
    $("ePrice").value = p.price;
    $("eStock").value = p.stock;
    $("eDesc").value = p.description || "";
    $("editPageTitle").textContent = `EDIT / ${p.name}`;
    $("editBreadcrumb").textContent = p.name;
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function handleEdit(e) {
  e.preventDefault();
  const f = e.target;
  const id = $("productId").value;
  const btn = f.querySelector('button[type="submit"]');
  btn.innerHTML = '<span class="spinner"></span> SAVING...';
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: $("eName").value.trim(),
        category: $("eCategory").value,
        brand: $("eBrand").value.trim(),
        price: $("ePrice").value,
        stock: $("eStock").value,
        description: $("eDesc").value.trim(),
      }),
    });
    const json = await res.json();
    if (json.success) showAlert("formAlert", "success", "แก้ไขสินค้าสำเร็จ");
    else showAlert("formAlert", "error", json.message);
  } catch (e) {
    showAlert("formAlert", "error", e.message);
  } finally {
    btn.innerHTML = "UPDATE PRODUCT";
    btn.disabled = false;
  }
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadEditProduct();
  $("addForm")?.addEventListener("submit", handleAdd);
  $("editForm")?.addEventListener("submit", handleEdit);
});
