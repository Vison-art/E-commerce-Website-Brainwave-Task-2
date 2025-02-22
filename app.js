document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS for animations
    AOS.init({
        duration: 1000,
        once: true
    });

    // Load products from API or local storage
    fetchProducts();

    // Attach event listeners
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProducts, 300));
    }
});

async function fetchProducts() {
    try {
        let products = JSON.parse(localStorage.getItem('products'));

        if (!products) {
            const response = await fetch('https://dummyjson.com/products?limit=1000');
            const data = await response.json();
            products = data.products;
            localStorage.setItem('products', JSON.stringify(products));
        }

        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = "col-lg-3 col-md-4 col-sm-6 mb-4";
        productCard.setAttribute('data-aos', 'fade-up');
        productCard.innerHTML = `
            <div class="card product-card">
                <img src="${product.thumbnail}" class="card-img-top" alt="${product.title}">
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">$${product.price}</p>
                    <div class="product-action">
                        <a href="product-details.html?id=${product.id}" class="btn btn-info">View Details</a>
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });

    attachAddToCartListeners();
}

// Filter products based on search input
function filterProducts(event) {
    const searchTerm = event.target.value.toLowerCase();
    const products = JSON.parse(localStorage.getItem('products')) || [];

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    );

    displayProducts(filteredProducts);
}

// Debounce function to limit search calls
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Attach event listeners to "Add to Cart" buttons
function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            addToCart(button.dataset.id);
        });
    });
}

// Add product to cart
function addToCart(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const product = products.find(p => p.id == productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id == productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}


