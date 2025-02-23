document.addEventListener("DOMContentLoaded", async function () {
    const productDetailContainer = document.getElementById("productDetail");
    let currentProduct = null;

    // Get Product ID from URL
    function getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    }

    // Cart Notification Modal
    function showCartNotification(message) {
        const notificationModal = new bootstrap.Modal(document.getElementById('cartNotification'));
        document.getElementById('notificationMessage').textContent = message;
        notificationModal.show();
    }

    // Add to Cart Functionality
    function addToCart(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                quantity: 1,
                thumbnail: product.thumbnail
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showCartNotification(`${product.title} added to cart!`);
    }

    // Fetch and Display Product Details
    async function fetchProductDetails() {
        const productId = getProductIdFromURL();
        if (!productId) {
            productDetailContainer.innerHTML = "<h4>Product not found.</h4>";
            return;
        }

        try {
            const response = await fetch(`https://dummyjson.com/products/${productId}`);
            currentProduct = await response.json();

            // Display Product Details
            productDetailContainer.innerHTML = `
                <div class="product-detail-card card shadow-lg p-4 border-0">
                    <h2 class="text-center text-primary">${currentProduct.title}</h2>
                    
                    <div class="text-center">
                        <img src="${currentProduct.thumbnail}" alt="${currentProduct.title}" class="product-image img-fluid rounded shadow">
                    </div>

                    <div class="mt-3">
                        <p class="fs-5"><strong>Price:</strong> <span class="fw-bold text-danger">$${currentProduct.price}</span> 
                            <span class="badge bg-success">${currentProduct.discountPercentage}% OFF</span>
                        </p>
                        <p><strong>Brand:</strong> <span class="text-uppercase text-secondary">${currentProduct.brand}</span></p>
                        <p><strong>Category:</strong> <span class="badge bg-info">${currentProduct.category}</span></p>
                        <p><strong>Description:</strong> ${currentProduct.description}</p>
                        <p><strong>Stock:</strong> ${currentProduct.stock} 
                            <span class="badge bg-${currentProduct.stock > 0 ? 'success' : 'danger'}">
                                ${currentProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </p>
                        <p><strong>Rating:</strong> ⭐ <span class="text-warning">${currentProduct.rating}</span></p>
                    </div>

                    ${currentProduct.reviews && currentProduct.reviews.length > 0 ? `
                    <h3 class="mt-4 text-primary">✨ Customer Reviews ✨</h3>
                    <div id="reviews" class="mt-3">
                        ${currentProduct.reviews.map(review => `
                            <div class="card mb-3 border-0 shadow-sm p-3 review-card">
                                <div class="card-body">
                                    <div class="d-flex align-items-center">
                                        <div class="avatar me-3">
                                            <img src="https://i.pravatar.cc/50?u=${review.reviewerName}" class="rounded-circle border" alt="User">
                                        </div>
                                        <h5 class="card-title mb-0 text-dark">${review.reviewerName}</h5>
                                    </div>
                                    <p class="card-text mt-2 text-muted">"${review.comment}"</p>
                                    <div class="d-flex align-items-center">
                                        <p class="text-warning fs-5 mb-0">⭐ ${review.rating}</p>
                                        <span class="ms-2 badge bg-info">Verified Purchase</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    ` : '<p class="text-muted text-center mt-4">No reviews yet. Be the first to review! 📝</p>'}

                    <div class="product-detail-action mt-4 gap-3 d-flex justify-content-center">
                        <button id="addToCartBtn" class="btn btn-primary btn-lg shadow-lg px-4 py-2">
                            <i class="bi bi-cart-plus-fill"></i> Add to Cart
                        </button>
                        <button id="buyNowBtn" class="btn btn-success btn-lg shadow-lg px-4 py-2">
                            <i class="bi bi-bag-heart-fill"></i> Buy Now
                        </button>
                    </div>
                </div>
            `;

            // Event Listeners
            document.getElementById('addToCartBtn').addEventListener('click', () => addToCart(currentProduct));
            document.getElementById('buyNowBtn').addEventListener('click', () => {
                addToCart(currentProduct);
                window.location.href = 'checkout.html';
            });

        } catch (error) {
            console.error("Error fetching product details:", error);
            productDetailContainer.innerHTML = "<h4>Error loading product details.</h4>";
        }
    }

    // Initialize
    fetchProductDetails();
    updateCartCount();
});

// Shared Cart Functions
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}