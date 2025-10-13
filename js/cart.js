/* ===================================
   SHOPPING CART FUNCTIONALITY
   E-commerce cart management for travel gear
   =================================== */

class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }
    
    init() {
        this.loadCart();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart, .add-to-cart *')) {
                const button = e.target.closest('.add-to-cart');
                if (button) {
                    this.handleAddToCart(button);
                }
            }
        });
        
        // Cart modal interactions
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.addEventListener('click', (e) => this.handleCartInteraction(e));
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }
    }
    
    handleAddToCart(button) {
        const productCard = button.closest('.product-card');
        if (!productCard) return;
        
        const productId = button.getAttribute('data-product-id');
        const product = this.extractProductInfo(productCard, productId);
        
        if (product) {
            this.addItem(product);
            this.showAddToCartFeedback(product);
            
            // Track add to cart event
            if (window.lametayelTracking) {
                window.lametayelTracking.trackEvent('Product Added to Cart', {
                    product_id: product.id,
                    product_name: product.name,
                    product_category: product.category,
                    product_price: product.price,
                    currency: 'USD',
                    quantity: 1,
                    cart_source: 'product_grid',
                    cart_total_items: this.getTotalItems(),
                    cart_total_value: this.getTotalValue()
                });
            }
        }
    }
    
    extractProductInfo(productCard, productId) {
        const titleElement = productCard.querySelector('.product-title');
        const priceElement = productCard.querySelector('.current-price');
        const imageElement = productCard.querySelector('.product-image img');
        const categoryElement = productCard;
        
        if (!titleElement || !priceElement) {
            console.warn('Missing product information');
            return null;
        }
        
        const name = titleElement.textContent.trim();
        const priceText = priceElement.textContent.trim();
        const price = this.extractPrice(priceText);
        const image = imageElement?.src || '';
        const category = categoryElement.getAttribute('data-category') || 'unknown';
        
        return {
            id: productId,
            name: name,
            price: price,
            image: image,
            category: category
        };
    }
    
    extractPrice(priceString) {
        const match = priceString.match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(',', '')) : 0;
    }
    
    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                ...product,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.updateDisplay();
    }
    
    removeItem(productId) {
        const index = this.cart.findIndex(item => item.id === productId);
        if (index > -1) {
            const removedItem = this.cart[index];
            this.cart.splice(index, 1);
            
            // Track removal
            if (window.lametayelTracking) {
                window.lametayelTracking.trackEvent('Product Removed from Cart', {
                    product_id: removedItem.id,
                    product_name: removedItem.name,
                    product_price: removedItem.price,
                    quantity_removed: removedItem.quantity,
                    cart_total_items: this.getTotalItems(),
                    cart_total_value: this.getTotalValue()
                });
            }
            
            this.saveCart();
            this.updateDisplay();
        }
    }
    
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            const oldQuantity = item.quantity;
            
            if (newQuantity <= 0) {
                this.removeItem(productId);
                return;
            }
            
            item.quantity = newQuantity;
            
            // Track quantity change
            if (window.lametayelTracking) {
                window.lametayelTracking.trackEvent('Cart Quantity Updated', {
                    product_id: item.id,
                    product_name: item.name,
                    old_quantity: oldQuantity,
                    new_quantity: newQuantity,
                    quantity_change: newQuantity - oldQuantity,
                    cart_total_items: this.getTotalItems(),
                    cart_total_value: this.getTotalValue()
                });
            }
            
            this.saveCart();
            this.updateDisplay();
        }
    }
    
    clearCart() {
        const itemCount = this.getTotalItems();
        const totalValue = this.getTotalValue();
        
        this.cart = [];
        
        // Track cart clear
        if (window.lametayelTracking) {
            window.lametayelTracking.trackEvent('Cart Cleared', {
                items_removed: itemCount,
                value_removed: totalValue
            });
        }
        
        this.saveCart();
        this.updateDisplay();
    }
    
    handleCartInteraction(e) {
        const target = e.target;
        
        if (target.classList.contains('quantity-btn')) {
            const productId = target.getAttribute('data-product-id');
            const currentQuantity = parseInt(target.parentElement.querySelector('.quantity-input').value);
            
            if (target.classList.contains('plus')) {
                this.updateQuantity(productId, currentQuantity + 1);
            } else if (target.classList.contains('minus')) {
                this.updateQuantity(productId, currentQuantity - 1);
            }
        }
        
        if (target.classList.contains('quantity-input')) {
            const productId = target.getAttribute('data-product-id');
            const newQuantity = parseInt(target.value);
            if (newQuantity >= 0) {
                this.updateQuantity(productId, newQuantity);
            }
        }
        
        if (target.classList.contains('remove-item')) {
            const productId = target.getAttribute('data-product-id');
            this.removeItem(productId);
        }
    }
    
    updateDisplay() {
        this.updateCartCount();
        this.updateCartModal();
    }
    
    updateCartCount() {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            const totalItems = this.getTotalItems();
            cartCountElement.textContent = totalItems;
            cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    updateCartModal() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (!cartItemsContainer) return;
        
        // Clear existing items
        cartItemsContainer.innerHTML = '';
        
        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                    <p style="color: #6c757d; text-align: center;">Your cart is empty</p>
                    <p style="color: #6c757d; text-align: center; font-size: 0.9rem;">Add some travel gear to get started!</p>
                </div>
            `;
            
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            this.cart.forEach(item => {
                const itemElement = this.createCartItemElement(item);
                cartItemsContainer.appendChild(itemElement);
            });
            
            if (checkoutBtn) checkoutBtn.disabled = false;
        }
        
        // Update total
        if (cartTotalElement) {
            cartTotalElement.textContent = this.getTotalValue().toFixed(2);
        }
    }
    
    createCartItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.setAttribute('data-product-id', item.id);
        
        itemDiv.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image || 'images/placeholder-product.jpg'}" alt="${item.name}" loading="lazy">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-category">${item.category}</div>
            </div>
            <div class="cart-item-controls">
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-product-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
                    <button class="quantity-btn plus" data-product-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item" data-product-id="${item.id}" title="Remove from cart">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        
        return itemDiv;
    }
    
    handleCheckout() {
        if (this.cart.length === 0) return;
        
        const totalValue = this.getTotalValue();
        const totalItems = this.getTotalItems();
        
        // Track checkout initiation
        if (window.lametayelTracking) {
            window.lametayelTracking.trackEvent('Checkout Started', {
                cart_total_value: totalValue,
                cart_total_items: totalItems,
                currency: 'USD',
                products: this.cart.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    product_category: item.category,
                    quantity: item.quantity,
                    price: item.price
                }))
            });
        }
        
        // Simulate checkout process
        this.simulateCheckout();
    }
    
    simulateCheckout() {
        const checkoutBtn = document.getElementById('checkout-btn');
        const originalText = checkoutBtn?.textContent;
        
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Processing...';
            checkoutBtn.disabled = true;
        }
        
        // Simulate checkout steps
        setTimeout(() => {
            if (checkoutBtn) checkoutBtn.textContent = 'Finalizing order...';
            
            setTimeout(() => {
                this.completeCheckout();
            }, 2000);
        }, 1500);
    }
    
    completeCheckout() {
        const totalValue = this.getTotalValue();
        const totalItems = this.getTotalItems();
        const orderId = 'order_' + Date.now();
        
        // Track successful checkout
        if (window.lametayelTracking) {
            window.lametayelTracking.trackEvent('Order Completed', {
                order_id: orderId,
                order_total: totalValue,
                currency: 'USD',
                items_count: totalItems,
                payment_method: 'credit_card',
                shipping_method: 'standard',
                products: this.cart.map(item => ({
                    product_id: item.id,
                    product_name: item.name,
                    product_category: item.category,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                }))
            });
        }
        
        // Show success message
        this.showCheckoutSuccess(orderId, totalValue);
        
        // Clear cart
        this.clearCart();
        
        // Close cart modal
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.classList.remove('active');
        }
        
        // Reset checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Proceed to Checkout';
            checkoutBtn.disabled = false;
        }
    }
    
    showCheckoutSuccess(orderId, total) {
        const successModal = document.createElement('div');
        successModal.className = 'modal active';
        successModal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <div class="modal-header">
                    <h3 class="modal-title">Order Confirmed!</h3>
                </div>
                <div class="modal-body">
                    <div style="color: #66BB6A; font-size: 3rem; margin-bottom: 1rem;">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4>Thank you for your order!</h4>
                    <p>Order ID: <strong>${orderId}</strong></p>
                    <p>Total: <strong>$${total.toFixed(2)}</strong></p>
                    <p>You will receive an email confirmation shortly.</p>
                    <button class="btn-primary" onclick="this.closest('.modal').remove()" style="margin-top: 1rem;">
                        Continue Shopping
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(successModal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (successModal.parentNode) {
                successModal.remove();
            }
        }, 10000);
    }
    
    showAddToCartFeedback(product) {
        // Show brief notification
        if (window.lametayelApp) {
            window.lametayelApp.showNotification(`${product.name} added to cart`, 'success');
        }
        
        // Animate cart icon
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.classList.add('bounce');
            setTimeout(() => {
                cartBtn.classList.remove('bounce');
            }, 600);
        }
    }
    
    // Utility methods
    
    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    getTotalValue() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getCartSummary() {
        return {
            items: this.cart,
            totalItems: this.getTotalItems(),
            totalValue: this.getTotalValue(),
            isEmpty: this.cart.length === 0
        };
    }
    
    // Persistence methods
    
    saveCart() {
        try {
            localStorage.setItem('lametayel_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.warn('Could not save cart to localStorage:', error);
        }
    }
    
    loadCart() {
        try {
            const savedCart = localStorage.getItem('lametayel_cart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
            }
        } catch (error) {
            console.warn('Could not load cart from localStorage:', error);
            this.cart = [];
        }
    }
    
    // Public API methods
    
    getCart() {
        return [...this.cart]; // Return copy to prevent external modification
    }
    
    addProduct(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.updateDisplay();
        
        return this.getCartSummary();
    }
    
    hasItem(productId) {
        return this.cart.some(item => item.id === productId);
    }
    
    getItemQuantity(productId) {
        const item = this.cart.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }
    
    exportCart() {
        return {
            items: this.cart,
            exportDate: new Date().toISOString(),
            totalItems: this.getTotalItems(),
            totalValue: this.getTotalValue()
        };
    }
}

// Add cart animation CSS
const cartStyles = `
    .cart-btn.bounce {
        animation: cartBounce 0.6s ease;
    }
    
    @keyframes cartBounce {
        0%, 20%, 60%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        80% {
            transform: translateY(-5px);
        }
    }
    
    .empty-cart {
        padding: 3rem 1rem;
        text-align: center;
    }
    
    .cart-item {
        display: grid;
        grid-template-columns: 60px 1fr auto auto;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #eee;
        align-items: center;
    }
    
    .cart-item:last-child {
        border-bottom: none;
    }
    
    .cart-item-image {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
    }
    
    .cart-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .cart-item-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .cart-item-name {
        font-weight: 500;
        font-size: 0.95rem;
        line-height: 1.3;
    }
    
    .cart-item-price {
        color: var(--primary-blue);
        font-weight: 600;
    }
    
    .cart-item-category {
        font-size: 0.8rem;
        color: var(--text-secondary);
        text-transform: capitalize;
    }
    
    .cart-item-controls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
    }
    
    .cart-item-quantity {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .quantity-btn {
        width: 28px;
        height: 28px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        transition: all 0.2s;
    }
    
    .quantity-btn:hover {
        background: var(--bg-secondary);
        border-color: var(--primary-orange);
    }
    
    .quantity-input {
        width: 50px;
        text-align: center;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.25rem;
        font-size: 0.9rem;
    }
    
    .remove-item {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: color 0.2s;
    }
    
    .remove-item:hover {
        color: #dc3545;
    }
    
    .cart-item-total {
        font-weight: 600;
        color: var(--primary-blue);
        font-size: 0.95rem;
    }
    
    @media (max-width: 480px) {
        .cart-item {
            grid-template-columns: 1fr;
            gap: 0.75rem;
            text-align: center;
        }
        
        .cart-item-controls {
            flex-direction: row;
            justify-content: center;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = cartStyles;
document.head.appendChild(styleSheet);

// Initialize cart manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.cartManager = new CartManager();
    console.log('Cart manager initialized');
});