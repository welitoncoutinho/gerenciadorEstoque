const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const stockModal = document.getElementById("stockModal");
const productForm = document.getElementById("productForm");
const stockForm = document.getElementById("stockForm");
const productsTable = document.getElementById("productsTable");
const allProductsTable = document.getElementById("allProductsTable");
const productsSearch = document.getElementById("productsSearch");
const productsCount = document.getElementById("productsCount");
const emptyProducts = document.getElementById("emptyProducts");
let lastFocusedElement;
let selectedProductRow;

function setSidebar(open) {
    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    menuToggle.setAttribute("aria-expanded", String(open));
}

function setModal(element, open, focusId) {
    element.classList.toggle("show", open);
    element.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", document.querySelector(".modal-overlay.show") !== null);
    if (open) {
        lastFocusedElement = document.activeElement;
        requestAnimationFrame(() => document.getElementById(focusId).focus());
    } else if (!document.querySelector(".modal-overlay.show") && lastFocusedElement) lastFocusedElement.focus();
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove("show"), 3500);
}

function getProductStatus(stock, minimum) {
    if (stock === 0) return ["Sem estoque", "empty"];
    if (stock <= minimum) return ["Estoque baixo", "low"];
    return ["Normal", "normal"];
}

function productNameFromRow(row) { return row.querySelector(".table-product strong").textContent; }

function updateRowStatus(row) {
    const stock = Number(row.querySelector(".stock-value")?.textContent ?? row.cells[3].textContent);
    const minimum = Number(row.querySelector(".minimum-value")?.textContent ?? row.cells[4].textContent);
    const [label, className] = getProductStatus(stock, minimum);
    const status = row.querySelector(".status");
    status.className = `status ${className}`;
    status.textContent = label;
}

function updateProductsCount() {
    const rows = [...allProductsTable.tBodies[0].rows];
    const visible = rows.filter((row) => !row.hidden).length;
    productsCount.textContent = `${visible} de ${rows.length} produto${rows.length === 1 ? "" : "s"}`;
    emptyProducts.hidden = visible !== 0;
}

function filterProducts(term) {
    const normalizedTerm = term.trim().toLocaleLowerCase("pt-BR");
    [...allProductsTable.tBodies[0].rows].forEach((row) => {
        row.hidden = !row.textContent.toLocaleLowerCase("pt-BR").includes(normalizedTerm);
    });
    updateProductsCount();
}

function addProductRow({ name, code, category, stock, minimum }) {
    const [statusLabel, statusClass] = getProductStatus(stock, minimum);
    const row = allProductsTable.tBodies[0].insertRow(0);
    row.dataset.code = code;
    row.innerHTML = `<td>#${code}</td><td><div class="table-product"><div class="product-icon"><i class="fa-solid fa-box"></i></div><strong></strong></div></td><td></td><td class="stock-value"></td><td class="minimum-value"></td><td><span class="status ${statusClass}">${statusLabel}</span></td><td><button class="stock-button" type="button"><i class="fa-solid fa-plus"></i>Adicionar estoque</button></td>`;
    row.querySelector("strong").textContent = name;
    row.cells[2].textContent = category;
    row.querySelector(".stock-value").textContent = stock;
    row.querySelector(".minimum-value").textContent = minimum;
    filterProducts(productsSearch.value);
}

function showPage(page) {
    const isProducts = page === "products";
    document.getElementById("dashboardPage").hidden = isProducts;
    document.getElementById("productsPage").hidden = !isProducts;
    document.querySelectorAll(".menu-item[data-page]").forEach((item) => item.classList.toggle("active", item.dataset.page === page));
    if (isProducts) { productsSearch.focus(); updateProductsCount(); }
}

menuToggle.addEventListener("click", () => setSidebar(!sidebar.classList.contains("open")));
overlay.addEventListener("click", () => setSidebar(false));
document.querySelectorAll(".menu-item").forEach((item) => item.addEventListener("click", (event) => {
    event.preventDefault();
    if (item.dataset.page) showPage(item.dataset.page);
    if (window.innerWidth <= 768) setSidebar(false);
}));

document.getElementById("openModal").addEventListener("click", () => setModal(modal, true, "productName"));
document.getElementById("openProductModal").addEventListener("click", () => setModal(modal, true, "productName"));
document.getElementById("closeModal").addEventListener("click", () => setModal(modal, false));
document.getElementById("cancelModal").addEventListener("click", () => setModal(modal, false));
document.getElementById("closeStockModal").addEventListener("click", () => setModal(stockModal, false));
document.getElementById("cancelStockModal").addEventListener("click", () => setModal(stockModal, false));
[modal, stockModal].forEach((item) => item.addEventListener("click", (event) => { if (event.target === item) setModal(item, false); }));

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setSidebar(false);
    if (modal.classList.contains("show")) setModal(modal, false);
    if (stockModal.classList.contains("show")) setModal(stockModal, false);
});

productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("productName").value.trim();
    const code = document.getElementById("productCode").value.trim();
    const category = document.getElementById("productCategory").value;
    const stock = Number(document.getElementById("initialStock").value);
    const minimum = Number(document.getElementById("minimumStock").value);
    addProductRow({ name, code, category, stock, minimum });
    productForm.reset();
    setModal(modal, false);
    showPage("products");
    showToast(`Produto "${name}" cadastrado com sucesso.`);
});

allProductsTable.addEventListener("click", (event) => {
    const button = event.target.closest(".stock-button");
    if (!button) return;
    selectedProductRow = button.closest("tr");
    document.getElementById("stockProductName").textContent = `Entrada para: ${productNameFromRow(selectedProductRow)}.`;
    stockForm.reset();
    setModal(stockModal, true, "stockQuantity");
});

stockForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const quantity = Number(document.getElementById("stockQuantity").value);
    if (!selectedProductRow || quantity < 1) return;
    const stockCell = selectedProductRow.querySelector(".stock-value");
    stockCell.textContent = Number(stockCell.textContent) + quantity;
    updateRowStatus(selectedProductRow);
    const productName = productNameFromRow(selectedProductRow);
    setModal(stockModal, false);
    showToast(`${quantity} unidade${quantity === 1 ? "" : "s"} adicionada${quantity === 1 ? "" : "s"} ao estoque de "${productName}".`);
});

productsSearch.addEventListener("input", () => filterProducts(productsSearch.value));
document.getElementById("searchInput").addEventListener("input", (event) => {
    if (document.getElementById("productsPage").hidden) return;
    productsSearch.value = event.target.value;
    filterProducts(event.target.value);
});
updateProductsCount();
