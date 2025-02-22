document.addEventListener('DOMContentLoaded', () => {
    // Initialize all core functionalities
    updateCartCount();
    loadCartItems();
    initializeAddToCartButtons();
    initializeCartModal();
    initializeCheckoutForm();
    displayOrderStatus();
});

// ================= CART FUNCTIONALITY =================
function initializeAddToCartButtons() {
    // Handle all add-to-cart buttons (product list + product detail)
    document.body.addEventListener('click', (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart, #addToCartBtn');
        if (!addToCartBtn) return;

        // Get product details from either session storage or button dataset
        const sessionProduct = JSON.parse(sessionStorage.getItem('currentProduct'));
        const product = sessionProduct || {
            id: addToCartBtn.dataset.id,
            name: addToCartBtn.dataset.name || 'Unknown Product',
            price: parseFloat(addToCartBtn.dataset.price) || 0,
            image: addToCartBtn.dataset.image || ''
        };

        addToCart({
            id: product.id,
            name: sessionProduct ? product.title : product.name,
            price: product.price,
            image: product.thumbnail || product.image
        });
    });
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(item => item.id === product.id);

    // Clean product name for display
    const cleanProductName = product.name?.trim() || 'Item';

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ 
            ...product,
            name: cleanProductName,
            quantity: 1 
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
    showPopup(`${cleanProductName} added to cart`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    document.querySelectorAll('#cartCount').forEach(element => {
        element.textContent = count;
    });
}

// ================= CART MODAL =================
function initializeCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('show.bs.modal', loadCartItems);
    }

    // Handle item removal
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            const productId = e.target.closest('.remove-item').dataset.id;
            const itemName = e.target.closest('li').querySelector('h6')?.textContent || 'Item';
            removeFromCart(productId);
            showPopup(`${itemName} removed from cart`);
        }
    });
}

function loadCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<li class='list-group-item'>Your cart is empty</li>";
        return;
    }

    cart.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <img src="${item.image}" alt="${item.name}" 
                     style="width: 50px; height: 50px; object-fit: cover;">
                <div>
                    <h6 class="mb-0">${item.name || 'Unnamed Product'}</h6>
                    <small>$${(item.price || 0).toFixed(2)} x ${item.quantity || 1}</small>
                </div>
            </div>
            <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}">
                <i class="bi bi-trash"></i>
            </button>
        `;
        cartItemsContainer.appendChild(li);
    });
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id.toString() !== productId.toString());
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
}

// ================= CHECKOUT FUNCTIONALITY =================
function initializeCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
        
        // Initialize payment method toggle
        document.getElementById('paymentMethod').addEventListener('change', function() {
            document.getElementById('cardDetails').classList.toggle('d-none', this.value !== 'credit_card');
        });
    }
}

function handleCheckout(e) {
    e.preventDefault();
    const orderId = generateOrderId();
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    if (cartItems.length === 0) {
        showPopup('Your cart is empty!', 'danger');
        return;
    }

    saveOrder({
        id: orderId,
        items: cartItems,
        status: 'Processing',
        date: new Date().toISOString(),
        total: cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
    });

    localStorage.removeItem('cart');
    updateCartCount();
    window.location.href = `order-confirmation.html?orderId=${orderId}`;
}

function generateOrderId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// ================= ORDER STATUS =================
function displayOrderStatus() {
    if (!document.getElementById('orderStatus')) return;

    const orderId = new URLSearchParams(window.location.search).get('orderId');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) return;

    const statusSteps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStep = statusSteps.indexOf(order.status);
    const statusContainer = document.getElementById('orderStatus');

    statusSteps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = `status-step ${index <= currentStep ? 'active' : ''}`;
        stepElement.textContent = step;
        statusContainer.appendChild(stepElement);
    });
}

// ================= NOTIFICATIONS =================
function showPopup(message, type = 'success') {
    const popup = document.createElement("div");
    popup.className = `cart-popup ${type}`;
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add("show"), 10);
    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 300);
    }, 2000);
}

// Add popup styles dynamically
const style = document.createElement("style");
style.innerHTML = `
    .cart-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        z-index: 9999;
    }
    .cart-popup.success {
        background: #28a745;
    }
    .cart-popup.danger {
        background: #dc3545;
    }
    .cart-popup.show {
        opacity: 1;
    }
`;
document.head.appendChild(style);