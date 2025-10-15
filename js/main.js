/**
 * Main JavaScript for Lametayel Travel Website
 * Handles all interactive features, forms, and user interactions
 */

class LametayelApp {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.searchHistory = [];
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.checkUserSession();
        this.initializeScrollEffects();
        this.initializeNavigation();
        this.setupFormValidation();
        
        console.log('🚀 Lametayel App initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        document.getElementById('navToggle')?.addEventListener('click', this.toggleMobileNav.bind(this));
        
        // Navigation links - track page views
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavLinkClick.bind(this));
        });
        
        // Search functionality
        document.getElementById('searchForm')?.addEventListener('submit', this.handleSearch.bind(this));
        document.getElementById('searchInput')?.addEventListener('input', this.handleSearchInput.bind(this));
        
        // Popular destination tags
        document.querySelectorAll('.destination-tag').forEach(tag => {
            tag.addEventListener('click', this.handleDestinationTag.bind(this));
        });

        // Article cards
        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', this.handleArticleClick.bind(this));
        });

        // Destination cards
        document.querySelectorAll('.destination-card').forEach(card => {
            card.addEventListener('click', this.handleDestinationClick.bind(this));
        });

        // Service buttons
        document.querySelectorAll('.service-btn').forEach(btn => {
            btn.addEventListener('click', this.handleServiceClick.bind(this));
        });

        // Login/Auth
        document.getElementById('loginBtn')?.addEventListener('click', this.showLoginModal.bind(this));
        document.getElementById('modalClose')?.addEventListener('click', this.hideLoginModal.bind(this));
        document.getElementById('loginForm')?.addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('existingUserBtn')?.addEventListener('click', this.handleExistingUser.bind(this));

        // Newsletter
        document.getElementById('newsletterForm')?.addEventListener('submit', this.handleNewsletterSignup.bind(this));

        // Generic tracked elements
        document.addEventListener('click', this.handleTrackedClick.bind(this));

        // Window events
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Check if user is already logged in
     */
    checkUserSession() {
        const userData = localStorage.getItem('lametayel_user_data');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isLoggedIn = true;
            this.updateLoginButton();
            
            // Re-identify the user in Segment on page load
            if (this.currentUser.email) {
                SegmentUtils.identifyUser(this.currentUser.email, this.currentUser);
            }
        }
    }

    /**
     * Handle mobile navigation toggle
     */
    toggleMobileNav() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        if (navMenu && navToggle) {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            SegmentUtils.trackCTAClick('mobile-nav-toggle', {
                type: 'navigation',
                location: 'header',
                action: navMenu.classList.contains('active') ? 'open' : 'close'
            });
        }
    }

    /**
     * Handle search form submission
     */
    handleSearch(e) {
        e.preventDefault();
        
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value.trim();
        
        if (!query) return;

        // Simulate search results
        const mockResults = this.generateSearchResults(query);
        
        // Track search
        SegmentUtils.trackSearch(query, mockResults, 'destination');
        
        // Update offers system with search
        if (window.dynamicOffers) {
            window.dynamicOffers.trackUserSearch(query);
        }

        // Store search in history
        this.searchHistory.unshift(query);
        this.searchHistory = this.searchHistory.slice(0, 10); // Keep last 10 searches
        
        // Show search results (simulate)
        this.displaySearchResults(query, mockResults);
        
        console.log('🔍 Search executed:', query, mockResults);
    }

    /**
     * Handle navigation link clicks
     */
    handleNavLinkClick(e) {
        e.preventDefault();
        
        const linkText = e.target.textContent.trim();
        const href = e.target.getAttribute('href');
        
        // Track page viewed for navigation
        SegmentUtils.trackPageView(`${linkText} Page`, {
            navigation_source: 'main_nav',
            page_section: linkText.toLowerCase().replace(/\s+/g, '_'),
            referrer_page: document.title
        });
        
        console.log(`📄 Navigation to: ${linkText}`);
        
        // Scroll to section if it's a hash link
        if (href && href.startsWith('#')) {
            const targetSection = document.querySelector(href);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    /**
     * Handle search input changes (real-time suggestions)
     */
    handleSearchInput(e) {
        const query = e.target.value.trim();
        
        // Fire Search Executed event when user enters query
        if (query.length >= 2) {
            // Debounce the search event to avoid too many events
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                SegmentUtils.trackSearch(query, [], 'live_search');
                console.log('🔍 Live search executed:', query);
            }, 1000);
            
            // Show autocomplete suggestions
            this.showSearchSuggestions(query);
        } else {
            this.hideSearchSuggestions();
        }
    }

    /**
     * Generate mock search results
     */
    generateSearchResults(query) {
        const destinations = [
            { id: 'italy', name: 'Italy', type: 'destination', articles: 156 },
            { id: 'japan', name: 'Japan', type: 'destination', articles: 89 },
            { id: 'greece', name: 'Greece', type: 'destination', articles: 73 },
            { id: 'thailand', name: 'Thailand', type: 'destination', articles: 92 },
            { id: 'france', name: 'France', type: 'destination', articles: 112 }
        ];

        const articles = [
            { id: 'tuscany-guide', title: 'Complete Guide to Tuscany', type: 'article' },
            { id: 'japan-cherry', title: 'Japan\'s Cherry Blossom Season', type: 'article' },
            { id: 'greece-islands', title: 'Greek Islands Hopping', type: 'article' }
        ];

        const results = [];
        const lowerQuery = query.toLowerCase();

        // Filter destinations
        destinations.forEach(dest => {
            if (dest.name.toLowerCase().includes(lowerQuery)) {
                results.push(dest);
            }
        });

        // Filter articles
        articles.forEach(article => {
            if (article.title.toLowerCase().includes(lowerQuery)) {
                results.push(article);
            }
        });

        return results;
    }

    /**
     * Display search results
     */
    displaySearchResults(query, results) {
        // Create or update search results overlay
        let overlay = document.getElementById('searchResultsOverlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'searchResultsOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            `;
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div style="background: white; max-width: 600px; width: 100%; border-radius: 12px; padding: 2rem; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Search Results for "${query}"</h3>
                    <button id="closeSearchResults" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div>
                    ${results.length > 0 ? results.map(result => `
                        <div style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; border-radius: 8px; margin-bottom: 8px;" 
                             class="search-result-item" 
                             data-result-type="${result.type}" 
                             data-result-id="${result.id}">
                            <strong>${result.name || result.title}</strong>
                            <div style="font-size: 14px; color: #666; margin-top: 4px;">
                                ${result.type === 'destination' ? `${result.articles} articles` : 'Travel Guide'}
                            </div>
                        </div>
                    `).join('') : '<p style="text-align: center; color: #666;">No results found. Try a different search term.</p>'}
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('closeSearchResults')?.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.resultType;
                const id = item.dataset.resultId;
                
                SegmentUtils.trackCTAClick('search-result', {
                    type: 'search_result',
                    location: 'search_overlay',
                    result_type: type,
                    result_id: id,
                    search_query: query
                });

                // Add interest based on click
                if (window.dynamicOffers && type === 'destination') {
                    window.dynamicOffers.addUserInterest(id);
                }

                document.body.removeChild(overlay);
            });
        });

        // Close on background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }

    /**
     * Show search suggestions
     */
    showSearchSuggestions(query) {
        // This would typically show a dropdown with suggestions
        console.log('💡 Search suggestions for:', query);
    }

    /**
     * Hide search suggestions
     */
    hideSearchSuggestions() {
        // Remove suggestions dropdown
    }

    /**
     * Handle destination tag clicks
     */
    handleDestinationTag(e) {
        const destination = e.target.dataset.destination;
        
        SegmentUtils.trackCTAClick('destination-tag', {
            type: 'destination_filter',
            location: 'hero',
            destination: destination
        });

        // Add interest and refresh offers
        if (window.dynamicOffers) {
            window.dynamicOffers.addUserInterest(destination);
        }

        // Simulate filtering or navigation
        this.filterByDestination(destination);
    }

    /**
     * Filter content by destination
     */
    filterByDestination(destination) {
        console.log('🎯 Filtering by destination:', destination);
        
        // Simulate smooth scroll to articles section
        const articlesSection = document.getElementById('articles');
        if (articlesSection) {
            articlesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Handle article card clicks
     */
    handleArticleClick(e) {
        e.preventDefault();
        
        const articleCard = e.currentTarget;
        const articleId = articleCard.dataset.articleId;
        
        // Extract article data
        const articleData = {
            title: articleCard.querySelector('.article-title')?.textContent,
            category: articleCard.querySelector('.article-category')?.textContent,
            readingTime: this.extractReadingTime(articleCard.querySelector('.read-time')?.textContent),
            destination: this.extractDestinationFromId(articleId)
        };

        // Track article view
        SegmentUtils.trackArticleView(articleId, articleData);

        // Add destination interest
        if (window.dynamicOffers && articleData.destination) {
            window.dynamicOffers.addUserInterest(articleData.destination);
        }

        // Simulate article opening
        this.openArticle(articleId, articleData);
    }

    /**
     * Extract reading time from text
     */
    extractReadingTime(text) {
        if (!text) return 0;
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Extract destination from article ID
     */
    extractDestinationFromId(articleId) {
        if (articleId.includes('italy')) return 'italy';
        if (articleId.includes('japan')) return 'japan';
        if (articleId.includes('greece')) return 'greece';
        if (articleId.includes('thailand')) return 'thailand';
        if (articleId.includes('france')) return 'france';
        return '';
    }

    /**
     * Simulate opening an article
     */
    openArticle(articleId, articleData) {
        console.log('📖 Opening article:', articleId, articleData);
        
        // Show article preview modal
        this.showArticlePreview(articleData);
    }

    /**
     * Show article preview modal
     */
    showArticlePreview(articleData) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); z-index: 2000; 
            display: flex; align-items: center; justify-content: center; padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; max-width: 800px; width: 100%; border-radius: 12px; padding: 2rem; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2>${articleData.title}</h2>
                    <button id="closeArticle" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div style="margin-bottom: 1rem;">
                    <span style="background: var(--primary-color); color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px;">
                        ${articleData.category}
                    </span>
                </div>
                <p style="line-height: 1.6; color: #666; margin-bottom: 2rem;">
                    This is a preview of the travel guide. In a full implementation, this would display the complete article content 
                    with rich media, interactive maps, and personalized recommendations based on your travel preferences.
                </p>
                <div style="border-top: 1px solid #eee; padding-top: 1rem;">
                    <p style="text-align: center; color: #888; font-size: 14px;">
                        🎯 Personalized offers and recommendations would appear here based on your reading behavior
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('closeArticle')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Track engagement
        setTimeout(() => {
            SegmentUtils.trackFeatureEngaged('article_preview', {
                type: 'view',
                duration: 5,
                article_title: articleData.title
            });
        }, 5000);
    }

    /**
     * Handle destination card clicks
     */
    handleDestinationClick(e) {
        const destinationCard = e.currentTarget;
        const destination = destinationCard.dataset.destination;
        
        SegmentUtils.trackCTAClick('destination-card', {
            type: 'destination_explore',
            location: 'destinations_section',
            destination: destination
        });

        // Add interest
        if (window.dynamicOffers) {
            window.dynamicOffers.addUserInterest(destination);
        }

        console.log('🌍 Exploring destination:', destination);
    }

    /**
     * Handle service button clicks
     */
    handleServiceClick(e) {
        const service = e.target.dataset.service;
        
        SegmentUtils.trackCTAClick('service-button', {
            type: 'service_access',
            location: 'services_section',
            service: service
        });

        // Simulate service-specific actions
        this.openServiceFlow(service);
    }

    /**
     * Open service-specific flows
     */
    openServiceFlow(service) {
        const serviceActions = {
            flights: () => {
                console.log('✈️ Opening flight search');
                // Track booking offer click
                SegmentUtils.trackBookingOfferClicked({
                    bookingType: 'flight',
                    partner: 'skyscanner',
                    destination: 'multiple'
                });
            },
            hotels: () => {
                console.log('🏨 Opening hotel search');
                SegmentUtils.trackBookingOfferClicked({
                    bookingType: 'hotel',
                    partner: 'booking.com',
                    destination: 'multiple'
                });
            },
            insurance: () => {
                console.log('🛡️ Opening insurance quotes');
                this.showInsuranceQuote();
            },
            gear: () => {
                console.log('🎒 Opening gear store');
                this.showGearStore();
            }
        };

        const action = serviceActions[service];
        if (action) action();
    }

    /**
     * Show insurance quote form
     */
    showInsuranceQuote() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); z-index: 2000; 
            display: flex; align-items: center; justify-content: center; padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; max-width: 500px; width: 100%; border-radius: 12px; padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Get Travel Insurance Quote</h3>
                    <button id="closeInsurance" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <form id="insuranceForm">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Destination</label>
                        <select style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;" required>
                            <option value="">Select destination</option>
                            <option value="europe">Europe</option>
                            <option value="asia">Asia</option>
                            <option value="americas">Americas</option>
                            <option value="worldwide">Worldwide</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Travel dates</label>
                        <input type="date" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;" required>
                    </div>
                    <button type="submit" style="width: 100%; padding: 12px; background: var(--primary-color); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Get Quote
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('closeInsurance')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('insuranceForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            SegmentUtils.trackFormSubmission('insurance_quote', {
                form_location: 'insurance_modal',
                destination: e.target[0].value,
                travel_date: e.target[1].value
            });

            alert('Thank you! Insurance quote request submitted.');
            document.body.removeChild(modal);
        });
    }

    /**
     * Show gear store
     */
    showGearStore() {
        const products = [
            { id: 'backpack', name: 'Travel Backpack 45L', price: 149, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=150&fit=crop' },
            { id: 'camera', name: 'Action Camera Kit', price: 299, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=150&fit=crop' },
            { id: 'luggage', name: 'Smart Luggage', price: 199, image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=200&h=150&fit=crop' }
        ];

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); z-index: 2000; 
            display: flex; align-items: center; justify-content: center; padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: white; max-width: 700px; width: 100%; border-radius: 12px; padding: 2rem; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Lametayel Travel Gear Store</h3>
                    <button id="closeGear" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    ${products.map(product => `
                        <div style="border: 1px solid #eee; border-radius: 8px; padding: 1rem; text-align: center;">
                            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                            <h4 style="margin-bottom: 0.5rem; font-size: 1rem;">${product.name}</h4>
                            <div style="margin-bottom: 1rem; font-weight: 600; color: var(--primary-color);">$${product.price}</div>
                            <button class="gear-btn" data-product-id="${product.id}" style="width: 100%; padding: 8px; background: var(--primary-color); color: white; border: none; border-radius: 6px; cursor: pointer;">
                                View Product
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('closeGear')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.querySelectorAll('.gear-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    SegmentUtils.trackProductViewed({
                        id: product.id,
                        name: product.name,
                        category: 'travel_gear',
                        price: product.price,
                        currency: 'USD',
                        brand: 'Lametayel'
                    });

                    // Show purchase confirmation
                    const confirmed = confirm(`Purchase ${product.name} for $${product.price}?`);
                    
                    if (confirmed) {
                        // Track Order Completed event for travel gear
                        this.trackOrderCompleted({
                            orderId: 'order_' + Date.now(),
                            product: product,
                            total: product.price,
                            currency: 'USD'
                        });
                        
                        alert('Order completed successfully!');
                    } else {
                        // Just add to cart if not purchasing immediately
                        setTimeout(() => {
                            SegmentUtils.trackItemAddedToCart({
                                id: product.id,
                                name: product.name,
                                category: 'travel_gear',
                                price: product.price,
                                currency: 'USD',
                                quantity: 1
                            });
                            
                            alert('Item added to cart!');
                        }, 500);
                    }
                }
            });
        });
    }

    /**
     * Show login modal
     */
    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            
            SegmentUtils.trackCTAClick('login-button', {
                type: 'authentication',
                location: 'header',
                action: 'show_modal'
            });
        }
    }

    /**
     * Hide login modal
     */
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Handle login form submission (Account Creation)
     */
    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            createdAt: new Date().toISOString()
        };

        // Validate email
        if (!this.isValidEmail(userData.email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Track account creation
        SegmentUtils.trackUserSignup({
            method: 'email',
            userType: 'traveler'
        });

        // IMPORTANT: Only now do we identify the user in Segment (using email as user_id)
        SegmentUtils.identifyUser(userData.email, userData);

        // Update app state and store user data
        this.isLoggedIn = true;
        this.currentUser = userData;
        localStorage.setItem('lametayel_user_data', JSON.stringify(userData));
        this.updateLoginButton();
        this.hideLoginModal();

        // Show success message
        this.showSuccessMessage(`Welcome, ${userData.firstName}! Your account has been created.`);

        console.log('👤 User account created and identified:', userData);
    }

    /**
     * Handle existing user login
     */
    handleExistingUser() {
        // Simulate existing user login
        const userData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            returning: true
        };

        SegmentUtils.trackUserLogin({
            method: 'email'
        });

        // Identify existing user in Segment (using email as user_id)
        SegmentUtils.identifyUser(userData.email, userData);

        this.isLoggedIn = true;
        this.currentUser = userData;
        localStorage.setItem('lametayel_user_data', JSON.stringify(userData));
        this.updateLoginButton();
        this.hideLoginModal();

        this.showSuccessMessage(`Welcome back, ${userData.firstName}!`);
        
        console.log('👤 Existing user logged in:', userData);
    }

    /**
     * Update login button state
     */
    updateLoginButton() {
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn && this.isLoggedIn) {
            loginBtn.textContent = `Hi, ${this.currentUser.firstName}`;
            loginBtn.onclick = () => this.showUserMenu();
        }
    }

    /**
     * Show user menu
     */
    showUserMenu() {
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: absolute; top: 100%; right: 0; background: white; 
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            padding: 1rem; min-width: 200px; z-index: 1000;
        `;
        
        menu.innerHTML = `
            <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #eee;">
                <div style="font-weight: 600;">${this.currentUser.firstName} ${this.currentUser.lastName}</div>
                <div style="font-size: 14px; color: #666;">${this.currentUser.email}</div>
            </div>
            <button id="logoutBtn" style="width: 100%; padding: 8px; background: #f56565; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Logout
            </button>
        `;

        const loginBtn = document.getElementById('loginBtn');
        loginBtn.style.position = 'relative';
        loginBtn.appendChild(menu);

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
            loginBtn.removeChild(menu);
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!loginBtn.contains(e.target)) {
                    if (menu.parentNode) {
                        menu.parentNode.removeChild(menu);
                    }
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    /**
     * Logout user
     */
    logout() {
        SegmentUtils.resetUser();
        
        this.isLoggedIn = false;
        this.currentUser = null;
        
        // Clear stored user data
        localStorage.removeItem('lametayel_user_data');
        
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.textContent = 'Sign In';
            loginBtn.onclick = () => this.showLoginModal();
        }

        this.showSuccessMessage('You have been logged out successfully.');
        
        console.log('👋 User logged out and session reset');
    }

    /**
     * Handle newsletter signup
     */
    handleNewsletterSignup(e) {
        e.preventDefault();
        
        const email = document.getElementById('newsletterEmail')?.value;
        
        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }

        SegmentUtils.trackNewsletterSignup(email, {
            source: 'homepage',
            preferences: ['travel_tips', 'deals', 'destination_guides']
        });

        SegmentUtils.trackFormSubmission('newsletter', {
            form_location: 'homepage',
            email: email
        });

        // Note: We don't identify users from newsletter signup alone
        // Only when they create a full account

        document.getElementById('newsletterEmail').value = '';
        this.showSuccessMessage('Thank you for subscribing to our newsletter!');

        console.log('📧 Newsletter signup (anonymous):', email);
    }

    /**
     * Handle generic tracked clicks
     */
    handleTrackedClick(e) {
        const trackAttribute = e.target.dataset.track || e.target.closest('[data-track]')?.dataset.track;
        
        if (trackAttribute) {
            SegmentUtils.trackCTAClick(trackAttribute, {
                type: 'generic_click',
                location: this.getElementLocation(e.target),
                element_text: e.target.textContent?.trim() || '',
                element_type: e.target.tagName.toLowerCase()
            });
        }
    }

    /**
     * Get element location for tracking
     */
    getElementLocation(element) {
        // Find parent section or container
        const section = element.closest('section, nav, footer');
        if (section) {
            return section.className || section.tagName.toLowerCase();
        }
        return 'unknown';
    }

    /**
     * Initialize scroll effects
     */
    initializeScrollEffects() {
        // Navbar scroll effect
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const navbar = document.querySelector('.navbar');
            
            if (navbar) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    navbar.style.transform = 'translateY(0)';
                }
                
                if (scrollTop > 50) {
                    navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                    navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                } else {
                    navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    navbar.style.boxShadow = 'none';
                }
            }
            
            lastScrollTop = scrollTop;
        });
    }

    /**
     * Initialize navigation
     */
    initializeNavigation() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Setup form validation
     */
    setupFormValidation() {
        // Add real-time validation to email inputs
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', (e) => {
                const email = e.target.value;
                if (email && !this.isValidEmail(email)) {
                    e.target.style.borderColor = '#f56565';
                } else {
                    e.target.style.borderColor = '#e2e8f0';
                }
            });
        });
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: var(--success-color); 
            color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 3000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.3s ease;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);

        // Add animation keyframes if not exists
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        // Additional scroll handling if needed
    }

    /**
     * Track Order Completed for travel gear purchases
     */
    trackOrderCompleted(orderData) {
        const properties = {
            order_id: orderData.orderId,
            total: orderData.total,
            revenue: orderData.total, // Revenue for Segment e-commerce tracking
            currency: orderData.currency,
            products: [{
                product_id: orderData.product.id,
                sku: orderData.product.id,
                name: orderData.product.name,
                category: 'travel_gear',
                price: orderData.product.price,
                quantity: 1
            }],
            // Additional travel gear specific properties
            gear_type: this.getGearType(orderData.product.name),
            purchase_channel: 'website',
            customer_type: this.isLoggedIn ? 'registered' : 'guest',
            ...SegmentUtils.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Order Completed', properties);
        }
        
        console.log('🛍️ Order Completed:', properties);

        // Update user traits for purchase behavior (only if user is logged in)
        if (this.isLoggedIn) {
            SegmentUtils.updateUserTraits({
                total_gear_purchases: (SegmentUtils.getUserTrait('total_gear_purchases') || 0) + 1,
                total_gear_spent: (SegmentUtils.getUserTrait('total_gear_spent') || 0) + orderData.total,
                last_gear_purchase: new Date().toISOString(),
                preferred_gear_category: this.getGearType(orderData.product.name)
            });
        }
    }

    /**
     * Get gear type from product name
     */
    getGearType(productName) {
        if (productName.toLowerCase().includes('backpack')) return 'backpacks';
        if (productName.toLowerCase().includes('camera')) return 'photography';
        if (productName.toLowerCase().includes('luggage')) return 'luggage';
        return 'accessories';
    }

    /**
     * Handle resize events
     */
    handleResize() {
        // Close mobile menu on resize
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        if (window.innerWidth > 991 && navMenu?.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle?.classList.remove('active');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.lametayelApp = new LametayelApp();
    console.log('🌟 Lametayel App fully loaded');
});

// Handle page visibility changes for accurate time tracking
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('📱 Page hidden - pausing tracking');
    } else {
        console.log('👀 Page visible - resuming tracking');
        // Track page view on return
        if (window.SegmentUtils) {
            SegmentUtils.trackPageView(null, { return_visit: true });
        }
    }
});

// Export for global access
window.LametayelApp = LametayelApp;