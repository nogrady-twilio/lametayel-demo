/* ===================================
   MAIN APPLICATION LOGIC
   Core functionality for Lametayel website
   =================================== */

class LametayelApp {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.loadUserSession();
        this.setupHeroSlider();
        this.setupScrollReveal();
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
            });
        }
        
        // Modal controls
        this.setupModalControls();
        
        // Search functionality
        this.setupSearchFunctionality();
        
        // Auth switching
        this.setupAuthSwitching();
        
        // User menu dropdown
        this.setupUserMenu();
        
        // Gear store filtering
        this.setupGearFiltering();
        
        // Smooth scrolling for navigation
        this.setupSmoothScrolling();
        
        // Header scroll effect
        this.setupHeaderScrollEffect();
    }
    
    setupModalControls() {
        // Modal open buttons
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const cartBtn = document.getElementById('cart-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.openModal('login-modal'));
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.openModal('signup-modal'));
        }
        
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openModal('cart-modal'));
        }
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Escape key closes modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal.id);
                }
            }
        });
    }
    
    setupSearchFunctionality() {
        const searchForms = document.querySelectorAll('.search-form, #hero-search-form');
        const searchInputs = document.querySelectorAll('#search-input, #destination-search');
        
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('input[type="text"]');
                if (input?.value.trim()) {
                    this.performSearch(input.value.trim());
                }
            });
        });
        
        // Search suggestions (mockup)
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length > 2) {
                    this.showSearchSuggestions(query, e.target);
                } else {
                    this.hideSearchSuggestions(e.target);
                }
            });
        });
    }
    
    setupAuthSwitching() {
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToLogin = document.getElementById('switch-to-login');
        
        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('login-modal');
                this.openModal('signup-modal');
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('signup-modal');
                this.openModal('login-modal');
            });
        }
        
        // Logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
    
    setupUserMenu() {
        const userAvatar = document.getElementById('user-avatar');
        const dropdownMenu = document.getElementById('dropdown-menu');
        
        if (userAvatar && dropdownMenu) {
            userAvatar.addEventListener('click', () => {
                dropdownMenu.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userAvatar.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('active');
                }
            });
        }
    }
    
    setupGearFiltering() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        const productCards = document.querySelectorAll('.product-card');
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                
                // Update active button
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter products
                productCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (category === 'all' || cardCategory === category) {
                        card.style.display = 'block';
                        card.classList.add('fade-in-up');
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    setupHeaderScrollEffect() {
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Hide header on scroll down, show on scroll up
            if (scrollY > lastScrollY && scrollY > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollY = scrollY;
        });
    }
    
    initializeComponents() {
        this.loadCartFromStorage();
        this.updateCartDisplay();
    }
    
    loadUserSession() {
        const userData = sessionStorage.getItem('lametayel_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateAuthUI();
        }
    }
    
    setupHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const prevBtn = document.getElementById('hero-prev');
        const nextBtn = document.getElementById('hero-next');
        let currentSlide = 0;
        
        if (slides.length === 0) return;
        
        // Set background images
        const backgroundImages = [
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2035&q=80'
        ];
        
        slides.forEach((slide, index) => {
            slide.style.backgroundImage = `url(${backgroundImages[index] || backgroundImages[0]})`;
        });
        
        const showSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            currentSlide = index;
        };
        
        const nextSlide = () => {
            const next = (currentSlide + 1) % slides.length;
            showSlide(next);
        };
        
        const prevSlide = () => {
            const prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
        };
        
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        // Auto-advance slides
        setInterval(nextSlide, 7000);
    }
    
    setupScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.destination-card, .experience-card, .product-card, .blog-card').forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }
    
    // Modal methods
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus first input if it exists
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Search functionality
    performSearch(query) {
        console.log('Searching for:', query);
        
        // Mock search results
        const destinations = ['italy', 'japan', 'iceland', 'bali', 'france', 'spain', 'thailand', 'norway'];
        const matches = destinations.filter(dest => 
            dest.toLowerCase().includes(query.toLowerCase())
        );
        
        if (matches.length > 0) {
            // Scroll to destinations section
            const destinationsSection = document.getElementById('destinations');
            if (destinationsSection) {
                destinationsSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Highlight matching destinations
            this.highlightDestinations(matches);
        } else {
            this.showNotification('No destinations found for your search', 'info');
        }
    }
    
    showSearchSuggestions(query, input) {
        // Remove existing suggestions
        this.hideSearchSuggestions(input);
        
        const suggestions = [
            'Italy Travel Guide',
            'Japan Cherry Blossom',
            'Iceland Northern Lights',
            'Bali Beach Resorts',
            'Paris City Break',
            'Barcelona Food Tour'
        ].filter(suggestion => 
            suggestion.toLowerCase().includes(query.toLowerCase())
        );
        
        if (suggestions.length === 0) return;
        
        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'search-suggestions';
        suggestionsList.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: background-color 0.2s;
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
            
            item.addEventListener('click', () => {
                input.value = suggestion;
                this.hideSearchSuggestions(input);
                this.performSearch(suggestion);
            });
            
            suggestionsList.appendChild(item);
        });
        
        const container = input.parentElement;
        container.style.position = 'relative';
        container.appendChild(suggestionsList);
    }
    
    hideSearchSuggestions(input) {
        const container = input.parentElement;
        const existing = container.querySelector('.search-suggestions');
        if (existing) {
            existing.remove();
        }
    }
    
    highlightDestinations(matches) {
        const destinationCards = document.querySelectorAll('.destination-card');
        
        destinationCards.forEach(card => {
            const destination = card.getAttribute('data-destination');
            if (matches.includes(destination)) {
                card.style.border = '3px solid var(--primary-orange)';
                card.style.transform = 'scale(1.05)';
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    card.style.border = '';
                    card.style.transform = '';
                }, 3000);
            }
        });
    }
    
    // Cart functionality
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('lametayel_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }
    
    saveCartToStorage() {
        localStorage.setItem('lametayel_cart', JSON.stringify(this.cart));
    }
    
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (cartCount) {
            cartCount.textContent = itemCount;
            cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
        }
        
        if (cartItems) {
            cartItems.innerHTML = '';
            
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 2rem;">Your cart is empty</p>';
            } else {
                this.cart.forEach((item, index) => {
                    const cartItem = this.createCartItemElement(item, index);
                    cartItems.appendChild(cartItem);
                });
            }
        }
        
        if (cartTotal) {
            cartTotal.textContent = total.toFixed(2);
        }
    }
    
    createCartItemElement(item, index) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image || 'images/placeholder-product.jpg'}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                <button class="quantity-btn plus" data-index="${index}">+</button>
            </div>
        `;
        
        // Add event listeners
        const minusBtn = itemDiv.querySelector('.minus');
        const plusBtn = itemDiv.querySelector('.plus');
        const quantityInput = itemDiv.querySelector('.quantity-input');
        
        minusBtn.addEventListener('click', () => this.updateQuantity(index, -1));
        plusBtn.addEventListener('click', () => this.updateQuantity(index, 1));
        quantityInput.addEventListener('change', (e) => {
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0) {
                this.setQuantity(index, newQuantity);
            }
        });
        
        return itemDiv;
    }
    
    updateQuantity(index, change) {
        if (this.cart[index]) {
            this.cart[index].quantity += change;
            
            if (this.cart[index].quantity <= 0) {
                this.removeFromCart(index);
            } else {
                this.saveCartToStorage();
                this.updateCartDisplay();
            }
        }
    }
    
    setQuantity(index, quantity) {
        if (this.cart[index] && quantity > 0) {
            this.cart[index].quantity = quantity;
            this.saveCartToStorage();
            this.updateCartDisplay();
        }
    }
    
    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCartToStorage();
        this.updateCartDisplay();
    }
    
    // Auth methods
    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (this.currentUser) {
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
        } else {
            if (authButtons) authButtons.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    }
    
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('lametayel_user');
        this.updateAuthUI();
        
        // Trigger logout tracking
        if (window.lametayelTracking) {
            window.lametayelTracking.logout();
        }
    }
    
    // Utility methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#66BB6A' : type === 'error' ? '#D90429' : '#FF7700'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            animation: slideInFromRight 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutToRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.lametayelApp = new LametayelApp();
    console.log('Lametayel app initialized');
});