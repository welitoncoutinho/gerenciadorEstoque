const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const productForm = document.getElementById("productForm");
const searchInput = document.getElementById("searchInput");
const productsTable = document.getElementById("productsTable");

let lastFocusedElement;

function setSidebar(open) {
    sidebar.classList.toggle("open", open);
    overlay.classList.toggle("show", open);
    menuToggle.setAttribute("aria-expanded", String(open));
}

function setModal(open) {
    modal.classList.toggle("show", open);
    modal.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", open);

    if (open) {
        lastFocusedElement = document.activeElement;
        requestAnimationFrame(() => document.getElementById("productName").focus());
    } else if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
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

function createCell(row, text) {
    const cell = row.insertCell();
    cell.textContent = text;
    return cell;
}

function addProductRow({ name, code, category, stock, minimum }) {
    const [statusLabel, statusClass] = getProductStatus(stock, minimum);
    const row = productsTable.tBodies[0].insertRow(0);
    createCell(row, `#${code}`);

    const productCell = row.insertCell();
    const product = document.createElement("div");
    product.className = "table-product";
    product.innerHTML = '<div class="product-icon"><i class="fa-solid fa-box"></i></div>';
    const nameElement = document.createElement("strong");
    nameElement.textContent = name;
    product.append(nameElement);
    productCell.append(product);

    createCell(row, category);
    createCell(row, stock);
    createCell(row, minimum);
    const statusCell = row.insertCell();
    const status = document.createElement("span");
    status.className = `status ${statusClass}`;
    status.textContent = statusLabel;
    statusCell.append(status);
    const actionCell = row.insertCell();
    actionCell.innerHTML = '<button class="action-button" type="button" aria-label="Mais ações"><i class="fa-solid fa-ellipsis"></i></button>';
}

menuToggle.addEventListener("click", () => setSidebar(!sidebar.classList.contains("open")));
overlay.addEventListener("click", () => setSidebar(false));

document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelector(".menu-item.active")?.classList.remove("active");
        item.classList.add("active");
        if (window.innerWidth <= 768) setSidebar(false);
    });
});

openModal.addEventListener("click", () => setModal(true));
closeModal.addEventListener("click", () => setModal(false));
cancelModal.addEventListener("click", () => setModal(false));
modal.addEventListener("click", (event) => {
    if (event.target === modal) setModal(false);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        setSidebar(false);
        if (modal.classList.contains("show")) setModal(false);
    }
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
    setModal(false);
    showToast(`Produto "${name}" cadastrado com sucesso.`);
});

searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLocaleLowerCase("pt-BR");
    productsTable.querySelectorAll("tbody tr").forEach((row) => {
        row.hidden = !row.textContent.toLocaleLowerCase("pt-BR").includes(term);
    });
});
