const products = [
  {id:1,name:"Spider Mode Frame",category:"Frames",tags:["Marvel","Frames"],price:499,visual:"visual-red",art:"SPIDEY",sub:"WEB SLINGER / FRAME",desc:"A bold collector-style frame for your favourite wall."},
  {id:2,name:"Dark Knight Frame",category:"Frames",tags:["DC","Frames"],price:549,visual:"visual-light",art:"BATMAN",sub:"THE DARK KNIGHT",desc:"Minimal black-and-white hero styling for a clean display."},
  {id:3,name:"Legend 10 Tee",category:"T-Shirts",tags:["Football","T-Shirts"],price:699,visual:"visual-blue",art:"10",sub:"LEGENDS / TEE",desc:"Football-inspired oversized graphic tee concept."},
  {id:4,name:"GOAT 7 Frame",category:"Frames",tags:["Football","Frames"],price:599,visual:"visual-lime",art:"7",sub:"GOAT MODE / FRAME",desc:"A statement frame inspired by football culture."},
  {id:5,name:"Marvel Icon Keychain",category:"Keychains",tags:["Marvel","Keychains"],price:249,visual:"visual-red",art:"MARVEL",sub:"COLLECTOR KEYCHAIN",desc:"Compact fan collectible for your keys or bag."},
  {id:6,name:"Anime Mood Frame",category:"Frames",tags:["Anime","Frames"],price:499,visual:"visual-light",art:"ANIME",sub:"MOOD / FRAME",desc:"A clean anime-inspired piece for your room setup."},
  {id:7,name:"Comic Club Tee",category:"T-Shirts",tags:["Marvel","DC","T-Shirts"],price:749,visual:"visual-light",art:"COMIC",sub:"CLUB / OVERSIZED TEE",desc:"Graphic streetwear concept built for comic fans."},
  {id:8,name:"Custom Memory Frame",category:"Custom",tags:["Custom","Frames"],price:499,visual:"visual-lime",art:"YOUR<br>PHOTO",sub:"CUSTOM / MEMORY",desc:"Turn your favourite photo into a display piece."}
];

let cart = JSON.parse(localStorage.getItem("himavaCart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("himavaWishlist") || "[]");
let activeCategory = "All";

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const money = n => `Rs. ${Number(n).toLocaleString("en-IN")}`;

function artHTML(p){
  return `<div class="product-visual ${p.visual}"><div class="art-word">${p.art}</div><div class="art-sub">${p.sub}</div></div>`;
}

function renderCategories(){
  const cats = ["All","Frames","T-Shirts","Keychains","Marvel","DC","Football","Anime","Custom"];
  $("#categoryRow").innerHTML = cats.map(c =>
    `<button class="category-btn ${activeCategory===c?"active":""}" data-category="${c}">${c}</button>`
  ).join("");
  $$(".category-btn").forEach(btn=>btn.onclick=()=>{activeCategory=btn.dataset.category;renderCategories();renderProducts()});
}

function filteredProducts(){
  return products.filter(p => activeCategory==="All" || p.category===activeCategory || p.tags.includes(activeCategory));
}

function renderProducts(){
  const list=filteredProducts();
  $("#productGrid").innerHTML=list.length ? list.map(productCard).join("") : `<p style="color:#777">No products found.</p>`;
  bindProductButtons();
}

function productCard(p){
  const liked=wishlist.includes(p.id);
  return `<article class="product-card">
    <button class="heart ${liked?"liked":""}" data-wish="${p.id}">${liked?"♥":"♡"}</button>
    ${artHTML(p)}
    <div class="product-meta"><div><div class="product-name">${p.name}</div><div class="product-type">${p.category}</div></div><div class="price">${money(p.price)}</div></div>
    <div class="product-actions"><button class="view-btn" data-view="${p.id}">Quick view</button><button class="add-btn" data-add="${p.id}">Add to cart</button></div>
  </article>`;
}

function bindProductButtons(){
  $$("[data-add]").forEach(b=>b.onclick=()=>addToCart(+b.dataset.add));
  $$("[data-view]").forEach(b=>b.onclick=()=>openProduct(+b.dataset.view));
  $$("[data-wish]").forEach(b=>b.onclick=()=>toggleWishlist(+b.dataset.wish));
}

function save(){
  localStorage.setItem("himavaCart",JSON.stringify(cart));
  localStorage.setItem("himavaWishlist",JSON.stringify(wishlist));
}

function addToCart(id, qty=1){
  const p=products.find(x=>x.id===id); if(!p)return;
  const existing=cart.find(x=>x.id===id);
  if(existing) existing.qty+=qty; else cart.push({id,qty});
  save(); renderCart(); updateCounts(); toast(`${p.name} added to cart`);
}

function removeCart(id){cart=cart.filter(x=>x.id!==id);save();renderCart();updateCounts()}
function changeQty(id,delta){
  const item=cart.find(x=>x.id===id); if(!item)return;
  item.qty+=delta;if(item.qty<=0)removeCart(id);else{save();renderCart();updateCounts()}
}
function cartTotal(){return cart.reduce((sum,i)=>{const p=products.find(x=>x.id===i.id);return sum+(p?p.price*i.qty:0)},0)}

function renderCart(){
  if(!cart.length) $("#cartItems").innerHTML=`<div class="cart-empty">Your cart is waiting for something cool.<br><br>Browse the collection and add your first piece.</div>`;
  else $("#cartItems").innerHTML=cart.map(i=>{
    const p=products.find(x=>x.id===i.id);
    return `<div class="cart-row"><div class="mini-art ${p.visual}">${p.art}</div><div><h4>${p.name}</h4><p>${money(p.price)} each</p><div class="qty"><button data-minus="${p.id}">−</button><span>${i.qty}</span><button data-plus="${p.id}">+</button></div></div><button class="remove" data-remove="${p.id}">Remove</button></div>`;
  }).join("");
  $("#cartSubtotal").textContent=money(cartTotal());
  $$("[data-minus]").forEach(b=>b.onclick=()=>changeQty(+b.dataset.minus,-1));
  $$("[data-plus]").forEach(b=>b.onclick=()=>changeQty(+b.dataset.plus,1));
  $$("[data-remove]").forEach(b=>b.onclick=()=>removeCart(+b.dataset.remove));
}

function updateCounts(){
  $("#cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0);
  $("#wishCount").textContent=wishlist.length;
}
function toggleWishlist(id){
  wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];
  save();updateCounts();renderProducts();toast(wishlist.includes(id)?"Added to wishlist":"Removed from wishlist");
}
function openProduct(id){
  const p=products.find(x=>x.id===id);
  $("#modalVisual").className=`product-visual large ${p.visual}`;
  $("#modalVisual").innerHTML=`<div class="art-word">${p.art}</div><div class="art-sub">${p.sub}</div>`;
  $("#modalCategory").textContent=p.category.toUpperCase();
  $("#modalName").textContent=p.name;
  $("#modalDescription").textContent=p.desc;
  $("#modalPrice").textContent=money(p.price);
  $("#modalQty").value=1;
  $("#modalAdd").onclick=()=>{addToCart(p.id,+$("#modalQty").value||1);closeModals()};
  $("#productModal").classList.add("open");
}
function openDrawer(id){$("#overlay").classList.add("show");$(id).classList.add("open")}
function closeDrawers(){$(".drawer").classList.remove("open");$("#overlay").classList.remove("show")}
function closeModals(){$$(".modal-wrap").forEach(x=>x.classList.remove("open"))}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2200)}

$("#cartBtn").onclick=()=>{renderCart();openDrawer("#cartDrawer")};
$("#searchBtn").onclick=()=>openDrawer("#searchDrawer");
$("#wishlistBtn").onclick=()=>{
  const ids=new Set(wishlist);
  const list=products.filter(p=>ids.has(p.id));
  $("#searchResults").innerHTML=list.length?list.map(p=>`<div class="search-result"><b>${p.name}</b><span>${money(p.price)}</span></div>`).join(""):`<p style="color:#777;font-size:12px;padding:20px 0">Your wishlist is empty.</p>`;
  $("#searchInput").value="Wishlist";
  openDrawer("#searchDrawer");
};
$("#overlay").onclick=closeDrawers;
$$("[data-close]").forEach(b=>b.onclick=()=>{closeDrawers();closeModals()});
$("#viewAllBtn").onclick=()=>{activeCategory="All";renderCategories();renderProducts();location.hash="shop"};

$("#searchInput").addEventListener("input",e=>{
  const q=e.target.value.toLowerCase().trim();
  const list=products.filter(p=>`${p.name} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(q));
  $("#searchResults").innerHTML=list.length?list.map(p=>`<button class="search-result" data-searchview="${p.id}"><b>${p.name}</b><span>${money(p.price)}</span></button>`).join(""):`<p style="color:#777;font-size:12px;padding:20px 0">No matching products.</p>`;
  $$("[data-searchview]").forEach(b=>b.onclick=()=>{closeDrawers();openProduct(+b.dataset.searchview)});
});

$("#uploadZone").onclick=()=>$("#photoInput").click();
$("#photoInput").onchange=e=>{
  const file=e.target.files[0]; if(!file)return;
  const url=URL.createObjectURL(file);$("#uploadPreview").src=url;$("#uploadPreview").classList.add("show");toast("Photo preview ready");
};
function updateCustomTotal(){
  const total=+$("#customProduct").value + +$("#customSize").value;
  $("#customTotal").textContent=money(total);
}
$("#customProduct").onchange=updateCustomTotal;$("#customSize").onchange=updateCustomTotal;
$("#addCustomBtn").onclick=()=>{
  const price=+$("#customProduct").value + +$("#customSize").value;
  cart.push({id:999,qty:1,custom:true,price,name:"Custom Print"});
  save();renderCart();updateCounts();toast("Custom item added to cart");
};
function customCartTotal(){
  return cart.reduce((s,i)=>s+(i.custom?i.price:(products.find(p=>p.id===i.id)?.price||0))*i.qty,0);
}
const originalCartTotal=cartTotal;
cartTotal=customCartTotal;

$("#checkoutBtn").onclick=()=>{
  if(!cart.length){toast("Your cart is empty");return}
  closeDrawers();$("#checkoutTotal").textContent=money(cartTotal());$("#checkoutModal").classList.add("open");
};
$("#checkoutForm").onsubmit=e=>{
  e.preventDefault();
  const data=new FormData(e.target);
  closeModals();
  cart=[];save();renderCart();updateCounts();
  toast(`Order placed for ${data.get("name")} — demo only`);
  e.target.reset();
};

$("#menuBtn").onclick=()=>$("#nav").classList.toggle("open");

renderCategories();renderProducts();renderCart();updateCounts();updateCustomTotal();
