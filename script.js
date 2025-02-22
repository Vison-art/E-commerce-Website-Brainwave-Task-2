document.addEventListener('DOMContentLoaded', () => {
    displayOrderStatus();
});


// Checkout Functionality
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckout);
}

function handleCheckout(e) {
    e.preventDefault();
    const orderId = generateOrderId();
    const order = {
        id: orderId,
        items: cart,
        status: 'Processing',
        date: new Date().toISOString()
    };

    saveOrder(order);
    localStorage.removeItem('cart');
    window.location.href = `order-confirmation.html?orderId=${orderId}`;
}

function generateOrderId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Order Tracking Functionality
function displayOrderStatus() {
    if (!window.location.pathname.includes('order-tracking.html')) return;

    const orderId = new URLSearchParams(window.location.search).get('orderId');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) return;

    const statusSteps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStep = statusSteps.indexOf(order.status);
    const statusContainer = document.getElementById('orderStatus');

    if (statusContainer) {
        statusContainer.innerHTML = '';
        statusSteps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = `status-step ${index <= currentStep ? 'active' : ''}`;
            stepElement.textContent = step;
            statusContainer.appendChild(stepElement);
        });
    }
}


document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    loadCartItems();
    initializeAddToCartButtons();
});

// Initialize Add to Cart buttons
function initializeAddToCartButtons() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.dataset.id;
            const productName = button.dataset.name;
            const productPrice = parseFloat(button.dataset.price);
            const productImage = button.dataset.image;
            addToCart(productId, productName, productPrice, productImage);
        });
    });
}

// Add to Cart function
function addToCart(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
    showPopup(`${name} added to cart`);
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cartCount").textContent = count;
}

// Load cart items in the cart modal
function loadCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<li class='list-group-item'>Cart is empty</li>";
        return;
    }

    cart.forEach(item => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <img src="${item.image}" alt="${item.name}" width="50" class="me-2">
            ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}
            <button class="btn btn-danger btn-sm remove-item" data-id="${item.id}">Remove</button>
        `;
        cartItemsContainer.appendChild(li);
    });

    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", () => {
            removeFromCart(button.dataset.id);
            showPopup(`Product removed from cart`);
        });
    });
}

// Remove from cart
function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
}

// Show popup notification
function showPopup(message) {
    const popup = document.createElement("div");
    popup.className = "cart-popup";
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("show");
    }, 10);

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
        background: #28a745;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }
    .cart-popup.show {
        opacity: 1;
    }
`;
document.head.appendChild(style);
