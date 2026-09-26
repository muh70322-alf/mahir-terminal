/* =========================================================
   1. KONFIGURASI & STATE
   ========================================================= */
const API_URL = 'https://dummyjson.com/products?limit=20';

// 💱 Kurs USD → IDR
const KURS_USD_TO_IDR = 15500;

// Format Rupiah
function formatRupiah(angkaUSD) {
  const angkaIDR = angkaUSD * KURS_USD_TO_IDR;
  const dibulatkan = Math.round(angkaIDR / 1000) * 1000;
  return 'Rp ' + dibulatkan.toLocaleString('id-ID');
}

// State
let allProducts = [];
let filteredProducts = [];

// Ambil semua elemen DOM
const searchInput    = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect     = document.getElementById('sortSelect');
const resetBtn       = document.getElementById('resetBtn');
const productCounter = document.getElementById('productCounter');
const productGrid    = document.getElementById('productGrid');

const modal        = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalBody    = document.getElementById('modalBody');

/* =========================================================
   2. FETCH DATA DARI API
   ========================================================= */
async function fetchProducts() {
  try {
    productCounter.textContent = 'Memuat produk...';

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Gagal mengambil data dari API');
    }

    const data = await response.json();

    allProducts = data.products;
    filteredProducts = [...allProducts];

    populateCategories(allProducts);
    renderProducts();

  } catch (error) {
    console.error('Error:', error);
    productCounter.textContent = 'Gagal memuat produk 😢';
    productGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Terjadi kesalahan saat memuat data.</p>`;
  }
}

/* =========================================================
   3. ISI DROPDOWN KATEGORI
   ========================================================= */
function populateCategories(products) {
  const categories = [...new Set(products.map(p => p.category))].sort();

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(option);
  });
}

/* =========================================================
   4. APPLY FILTER (SEARCH + CATEGORY + SORT)
   ========================================================= */
function applyFilters() {
  const keyword     = searchInput.value.toLowerCase().trim();
  const selectedCat = categorySelect.value;
  const sortValue   = sortSelect.value;

  let result = [...allProducts];

  // SEARCH
  if (keyword) {
    result = result.filter(p => p.title.toLowerCase().includes(keyword));
  }

  // FILTER CATEGORY
  if (selectedCat !== 'all') {
    result = result.filter(p => p.category === selectedCat);
  }

  // SORTING
  switch (sortValue) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'name-asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }

  filteredProducts = result;
  renderProducts();
}

/* =========================================================
   5. RENDER PRODUCT KE GRID
   ========================================================= */
function renderProducts() {
  productCounter.textContent =
    `${filteredProducts.length} dari ${allProducts.length} product ditampilkan.`;

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = `
      <p style="grid-column:1/-1;text-align:center;color:#888;">
        Tidak ada product yang cocok 😕
      </p>`;
    return;
  }

  productGrid.innerHTML = filteredProducts.map(product => `
    <div class="card">
      <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
      <div class="card-body">
        <span class="card-category">${product.category}</span>
        <h3 class="card-title">${product.title}</h3>
        <p class="card-price">${formatRupiah(product.price)}</p>
        <p class="card-rating">⭐ ${product.rating}</p>
        <button class="btn-detail" data-id="${product.id}">👁️ Lihat Detail</button>
      </div>
    </div>
  `).join('');

  // Pasang event ke tombol detail
  document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      showModal(id);
    });
  });
}

/* =========================================================
   6. MODAL DETAIL PRODUCT
   ========================================================= */
function showModal(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  modalBody.innerHTML = `
    <img src="${product.thumbnail}" alt="${product.title}" />
    <span class="detail-category">${product.category}</span>
    <h2>${product.title}</h2>
    <p>${product.description}</p>
    <p class="detail-price">💰 Harga: ${formatRupiah(product.price)}</p>
    <p class="detail-rating">⭐ Rating: ${product.rating}</p>
    <p>📦 Stock: ${product.stock}</p>
    <p>🏷️ Brand: ${product.brand || '-'}</p>
  `;

  modal.classList.remove('hidden');
  // Fokuskan tombol close agar bisa langsung tekan Enter
  modalClose.focus();
}

function closeModal() {
  modal.classList.add('hidden');
  modalBody.innerHTML = '';
}

/* =========================================================
   7. EVENT LISTENERS (SEMUA TOMBOL & KONTROL)
   ========================================================= */

// 1) SEARCH — jalan saat mengetik
searchInput.addEventListener('input', applyFilters);

// 2) FILTER CATEGORY — jalan saat pilih
categorySelect.addEventListener('change', applyFilters);

// 3) SORTING — jalan saat pilih
sortSelect.addEventListener('change', applyFilters);

// 4) RESET — reset semua ke default
resetBtn.addEventListener('click', () => {
  searchInput.value = '';
  categorySelect.value = 'all';
  sortSelect.value = 'default';
  applyFilters();
});

// 5) TOMBOL CLOSE MODAL (X)
modalClose.addEventListener('click', closeModal);

// 6) KLIK AREA LUAR MODAL (overlay)
modalOverlay.addEventListener('click', closeModal);

// 7) TEKAN ESCAPE
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

/* =========================================================
   8. INISIALISASI
   ========================================================= */
fetchProducts();