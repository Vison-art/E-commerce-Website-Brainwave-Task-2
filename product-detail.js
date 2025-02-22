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
                <div class="product-card">
                    <h2>${product.title}</h2>
                    <img src="${product.thumbnail}" alt="${product.title}" class="product-image">
                    <p><strong>Price:</strong> $${product.price} <span class="discount">(${product.discountPercentage}% OFF)</span></p>
                    <p><strong>Brand:</strong> ${product.brand}</p>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>Description:</strong> ${product.description}</p>
                    <p><strong>Stock:</strong> ${product.stock} (${product.availabilityStatus})</p>
                    <p><strong>Rating:</strong> ⭐ ${product.rating}</p>

                    <h3>Reviews:</h3>
                    <div id="reviews">
                        ${product.reviews.length > 0 ? product.reviews.map(review => `
                            <div class="review">
                                <p><strong>${review.reviewerName}:</strong> ${review.comment}</p>
                                <p>⭐ ${review.rating}</p>
                            </div>
                        `).join('') : "<p>No reviews yet.</p>"}
                    </div>

                    <button id="addToCartBtn" class="btn btn-primary">Add to Cart</button>
                    <button " class="btn btn-success">Buy Now</button>
                </div>
            `;
        } catch (error) {
            console.error("Error fetching product details:", error);
            productDetailContainer.innerHTML = "<h4>Error loading product details.</h4>";
        }
    }

    fetchProductDetails();
});


// Add to Cart Functionality
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1; // Increase quantity
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Update cart count in UI

    alert(`${product.title} added to cart!`); // Confirmation alert
}

// Update Cart Count in Header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');

    if (cartCountElement) cartCountElement.textContent = count;
}

// Attach event listener to "Add to Cart" button
document.addEventListener("DOMContentLoaded", () => {
    const addToCartBtn = document.getElementById("addToCartBtn");
    if (addToCartBtn) {
        addToCartBtn.addEventListener("click", () => {
            const productId = new URLSearchParams(window.location.search).get("id");
            fetch(`https://dummyjson.com/products/${productId}`)
                .then(response => response.json())
                .then(product => addToCart(product));
        });
    }
});
