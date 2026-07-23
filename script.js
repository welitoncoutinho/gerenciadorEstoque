const menuToggle=document.getElementById("menuToggle"),sidebar=document.getElementById("sidebar"),overlay=document.getElementById("overlay");
menuToggle.addEventListener("click",()=>{sidebar.classList.toggle("open");overlay.classList.toggle("show")});
overlay.addEventListener("click",()=>{sidebar.classList.remove("open");overlay.classList.remove("show")});

const menuItems=document.querySelectorAll(".menu-item");
menuItems.forEach(item=>item.addEventListener("click",function(){menuItems.forEach(el=>el.classList.remove("active"));this.classList.add("active");if(window.innerWidth<=768){sidebar.classList.remove("open");overlay.classList.remove("show")}}));

const modal=document.getElementById("modal"),openModal=document.getElementById("openModal"),closeModal=document.getElementById("closeModal"),cancelModal=document.getElementById("cancelModal");
openModal.addEventListener("click",()=>modal.classList.add("show"));
closeModal.addEventListener("click",()=>modal.classList.remove("show"));
cancelModal.addEventListener("click",()=>modal.classList.remove("show"));
modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("show")});

const productForm=document.getElementById("productForm");
productForm.addEventListener("submit",e=>{e.preventDefault();const productName=document.getElementById("productName").value;alert(`Produto "${productName}" cadastrado com sucesso!`);productForm.reset();modal.classList.remove("show")});

const searchInput=document.getElementById("searchInput"),productsTable=document.getElementById("productsTable");
searchInput.addEventListener("input",()=>{const term=searchInput.value.toLowerCase();productsTable.querySelectorAll("tbody tr").forEach(row=>{row.style.display=row.textContent.toLowerCase().includes(term)?"":"none"})});