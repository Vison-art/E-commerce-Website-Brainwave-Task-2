document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ duration: 1000, once: true });
    fetchProducts();
    initializeCartFunctionality();
    initializeSearch();
    initializeCheckoutForm();
    displayOrderStatus();
    initializeCategoryFilter();
});

// ================= PRODUCT FUNCTIONALITY =================
async function fetchProducts(category = 'all') {
    try {
        const response = await fetch('https://dummyjson.com/products?limit=1000');
        const data = await response.json();
        let products = data.products;
        
        if(category !== 'all') {
            products = products.filter(product => 
                product.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="col-lg-4 col-md-6 col-sm-6 mb-4 custom-col" data-aos="fade-up">
            <div class="card product-card h-100">
                <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: contain;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">$${product.price}</p>
                    <div class="product-action mt-auto ">
                        <a href="product-details.html?id=${product.id}" class="btn btn-info">View Details</a>
                        <button class="btn btn-primary add-to-cart mt-2"
                                data-id="${product.id}"
                                data-title="${product.title}"
                                data-price="${product.price}"
                                data-thumbnail="${product.thumbnail}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ================= CART FUNCTIONALITY =================
function initializeCartFunctionality() {
    updateCartCount();
    document.body.addEventListener('click', handleCartActions);
    initializeCartModal();
}

function handleCartActions(e) {
    const addToCartBtn = e.target.closest('.add-to-cart');
    if (addToCartBtn) {
        const product = {
            id: addToCartBtn.dataset.id,
            title: addToCartBtn.dataset.title,
            price: parseFloat(addToCartBtn.dataset.price),
            thumbnail: addToCartBtn.dataset.thumbnail
        };
        addToCart(product);
    }
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ 
            ...product,
            quantity: 1 
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    showPopup(`${product.title} added to cart`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}

// ================= CART MODAL =================
function initializeCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('show.bs.modal', loadCartItems);
    }
}

function loadCartItems() {
    const container = document.getElementById("cartItems");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    container.innerHTML = cart.length ? cart.map(item => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <img src="${item.thumbnail}" alt="${item.title}" 
                     style="width: 60px; height: 60px; object-fit: cover">
                <div>
                    <h6 class="mb-1">${item.title}</h6>
                    <small>$${item.price.toFixed(2)} x ${item.quantity}</small>
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}">
                <i class="bi bi-trash"></i>
            </button>
        </li>
    `).join('') : '<li class="list-group-item">Your cart is empty</li>';

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(btn.dataset.id);
            showPopup(`${btn.closest('li').querySelector('h6').textContent} removed`);
        });
    });
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id != productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartItems();
    updateCartCount();
}

// ================= SEARCH FUNCTIONALITY =================
function initializeSearch() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProducts, 300));
    }
}

function filterProducts(e) {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        card.closest('.col-lg-4').style.display = title.includes(term) ? 'block' : 'none';
    });
}

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// ================= CATEGORY FILTERING =================
function initializeCategoryFilter() {
    document.querySelectorAll('.category-filter').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            history.replaceState({}, '', `?category=${category}`);
            fetchProducts(category);
        });
    });

    // Load initial category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'all';
    fetchProducts(initialCategory);
}

// ================= CHECKOUT & ORDER STATUS =================
function initializeCheckoutForm() {
    const form = document.getElementById('checkoutForm');
    if (form) {
        form.addEventListener('submit', handleCheckout);
        document.getElementById('paymentMethod').addEventListener('change', e => {
            document.getElementById('cardDetails').classList.toggle('d-none', e.target.value !== 'credit_card');
        });
    }
}

function handleCheckout(e) {
    e.preventDefault();
    const order = {
        id: Date.now().toString(36),
        items: JSON.parse(localStorage.getItem("cart")) || [],
        date: new Date().toISOString(),
        total: calculateCartTotal()
    };
    
    if (!order.items.length) {
        showPopup('Your cart is empty!', 'danger');
        return;
    }

    saveOrder(order);
    localStorage.removeItem("cart");
    updateCartCount();
    window.location.href = `order-confirmation.html?orderId=${order.id}`;
}

function calculateCartTotal() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
}

function displayOrderStatus() {
    const container = document.getElementById('orderStatus');
    if (!container) return;

    const orderId = new URLSearchParams(location.search).get('orderId');
    const order = (JSON.parse(localStorage.getItem("orders")) || [])
        .find(o => o.id === orderId);

    if (order) {
        container.innerHTML = ['Processing', 'Shipped', 'Delivered'].map((status, i) => `
            <div class="status-step ${i <= order.statusIndex ? 'active' : ''}">${status}</div>
        `).join('');
    }
}

// ================= NOTIFICATIONS =================
function showPopup(message, type = 'success') {
    const popup = document.createElement('div');
    popup.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    popup.role = "alert";
    popup.innerHTML = `
        <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>
        ${message}
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}