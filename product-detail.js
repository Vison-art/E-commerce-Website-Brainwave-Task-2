document.addEventListener("DOMContentLoaded", async function () {
    const productDetailContainer = document.getElementById("productDetail");

    // Get Product ID from URL
    function getProductIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get("id");
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
            const product = await response.json();

            // Display Product Details
            productDetailContainer.innerHTML = `
                <div class="product-detail-card card shadow-lg p-4 border-0">
    <h2 class="text-center text-primary">${product.title}</h2>
    
    <div class="text-center">
        <img src="${product.thumbnail}" alt="${product.title}" class="product-image img-fluid rounded shadow">
    </div>

    <div class="mt-3">
        <p class="fs-5"><strong>Price:</strong> <span class="fw-bold text-danger">$${product.price}</span> 
            <span class="badge bg-success">${product.discountPercentage}% OFF</span>
        </p>
        <p><strong>Brand:</strong> <span class="text-uppercase text-secondary">${product.brand}</span></p>
        <p><strong>Category:</strong> <span class="badge bg-info">${product.category}</span></p>
        <p><strong>Description:</strong> ${product.description}</p>
        <p><strong>Stock:</strong> ${product.stock} 
            <span class="badge bg-${product.availabilityStatus === 'In Stock' ? 'success' : 'danger'}">
                ${product.availabilityStatus}
            </span>
        </p>
        <p><strong>Rating:</strong> ⭐ <span class="text-warning">${product.rating}</span></p>
    </div>

    <h3 class="mt-4 text-primary">✨ Customer Reviews ✨</h3>
    <div id="reviews" class="mt-3">
        ${product.reviews.length > 0 ? product.reviews.map(review => `
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
        `).join('') : '<p class="text-muted text-center">No reviews yet. Be the first to review! 📝</p>'}
    </div>

    <div class="product-detail-action mt-4  gap-3 ">
        <button id="addToCartBtn" class="btn btn-primary btn-lg shadow-lg px-4 py-2">
            <i class="bi bi-cart-plus-fill"></i> Add to Cart
        </button>
        <button class="btn btn-success btn-lg shadow-lg px-4 py-2">
            <i class="bi bi-bag-heart-fill"></i> Buy Now
        </button>
    </div>
</div>

            `;
        } catch (error) {
            console.error("Error fetching product details:", error);
            productDetailContainer.innerHTML = "<h4>Error loading product details.</h4>";
        }
    }

    fetchProductDetails();
});


document.addEventListener("DOMContentLoaded", async function () {
    // ... existing code ...

    // Add to Cart functionality
    document.body.addEventListener('click', async function(e) {
        if (e.target && e.target.id === 'addToCartBtn') {
            const productId = getProductIdFromURL();
            try {
                const response = await fetch(`https://dummyjson.com/products/${productId}`);
                const product = await response.json();
                
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
                alert('Item added to cart!');
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        }
    });
});

// Add this function to update cart count globally
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}