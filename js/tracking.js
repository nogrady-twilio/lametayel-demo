/* ===================================
   SEGMENT TRACKING IMPLEMENTATION
   Comprehensive event tracking for Lametayel
   =================================== */

class LametayelTracking {
    constructor() {
        this.isAnalyticsReady = false;
        this.queuedEvents = [];
        this.setupAnalytics();
        this.initializeTracking();
    }
    
    setupAnalytics() {
        // Wait for analytics to be ready
        if (window.analytics) {
            this.onAnalyticsReady();
        } else {
            // Poll for analytics availability
            const checkAnalytics = setInterval(() => {
                if (window.analytics) {
                    clearInterval(checkAnalytics);
                    this.onAnalyticsReady();
                }
            }, 100);
        }
    }
    
    onAnalyticsReady() {
        console.log('Segment Analytics ready');
        this.isAnalyticsReady = true;
        
        // Process queued events
        this.queuedEvents.forEach(event => {
            this.executeEvent(event.type, event.name, event.properties, event.options);
        });
        this.queuedEvents = [];
        
        // Track initial page view with UTM parameters
        this.trackPageView();
        
        // Set up automatic tracking
        this.setupAutomaticTracking();
    }
    
    executeEvent(type, name, properties = {}, options = {}) {
        if (!this.isAnalyticsReady) {
            this.queuedEvents.push({ type, name, properties, options });
            return;
        }
        
        try {
            switch (type) {
                case 'page':
                    analytics.page(name, properties, options);
                    break;
                case 'track':
                    analytics.track(name, properties, options);
                    break;
                case 'identify':
                    analytics.identify(name, properties, options);
                    break;
                default:
                    console.warn('Unknown event type:', type);
            }
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }
    
    trackPageView() {
        // UTM parameters are only included in the FIRST page view of a session
        // All subsequent page views and track events exclude UTM parameters
        const isFirstPageView = !sessionStorage.getItem('lametayel_first_page_tracked');
        
        let properties;
        if (isFirstPageView) {
            // First page view includes UTM parameters
            properties = {
                title: document.title,
                url: window.location.href,
                path: window.location.pathname,
                referrer: document.referrer,
                search: window.location.search,
                ...(window.eventProperties?.getFirstPageViewProperties() || {})
            };
            
            // Mark that we've tracked the first page view
            sessionStorage.setItem('lametayel_first_page_tracked', 'true');
            
            console.log('First page view tracked with UTM params:', properties);
        } else {
            // Subsequent page views exclude UTM parameters
            properties = {
                title: document.title,
                url: window.location.href,
                path: window.location.pathname,
                referrer: document.referrer,
                search: window.location.search,
                ...(window.eventProperties?.getBaseProperties() || {})
            };
            
            console.log('Page view tracked (no UTM params):', properties);
        }
        
        this.executeEvent('page', document.title, properties);
    }
    
    initializeTracking() {
        this.setupClickTracking();
        this.setupFormTracking();
        this.setupScrollTracking();
        this.setupEngagementTracking();
    }
    
    setupAutomaticTracking() {
        // Note: Page visibility and unload tracking removed per requirements
        // Focus on explicit user interactions only
    }
    
    setupClickTracking() {
        document.addEventListener('click', (event) => {
            const element = event.target.closest('[data-track]');
            if (!element) return;
            
            const trackingAction = element.getAttribute('data-track');
            this.handleClickEvent(trackingAction, element, event);
        });
    }
    
    handleClickEvent(action, element, event) {
        const baseProperties = {
            element_type: element.tagName.toLowerCase(),
            element_text: element.textContent?.trim().substring(0, 100),
            element_href: element.href || null,
            element_id: element.id || null,
            element_classes: element.className || null,
            click_position_x: event.clientX,
            click_position_y: event.clientY,
            page_position: this.getElementPosition(element)
        };
        
        switch (action) {
            case 'logo-click':
                this.trackEvent('Logo Clicked', baseProperties);
                break;
                
            case 'nav-destinations':
            case 'nav-experiences':
            case 'nav-guides':
            case 'nav-gear':
            case 'nav-blog':
                this.trackEvent('Navigation Clicked', {
                    ...baseProperties,
                    nav_section: action.replace('nav-', ''),
                    navigation_type: 'main_menu'
                });
                break;
                
            case 'search-click':
                this.trackSearchEvent('header');
                break;
                
            case 'hero-search':
                event.preventDefault();
                this.trackSearchEvent('hero');
                break;
                
            case 'destination-view':
                this.trackDestinationView(element);
                break;
                
            case 'experience-book':
                this.trackExperienceBooking(element);
                break;
                
            case 'add-to-cart':
                this.trackAddToCart(element);
                break;
                
            case 'cart-view':
                this.trackEvent('Cart Viewed', baseProperties);
                break;
                
            case 'article-view':
                this.trackArticleView(element);
                break;
                
            case 'login-click':
                this.trackEvent('Login Clicked', baseProperties);
                break;
                
            case 'signup-click':
                this.trackEvent('Signup Clicked', baseProperties);
                break;
                
            case 'gear-category':
                this.trackGearCategory(element);
                break;
                
            default:
                this.trackEvent('CTA Clicked', {
                    ...baseProperties,
                    cta_type: action
                });
        }
    }
    
    setupFormTracking() {
        // Track form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const formId = form.id;
            const trackElement = form.querySelector('[data-track]');
            const trackAction = trackElement?.getAttribute('data-track');
            
            if (trackAction) {
                this.handleFormSubmission(formId, trackAction, form, event);
            }
        });
        
        // Track form field interactions
        document.addEventListener('focus', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
                this.trackEvent('Form Field Focused', {
                    field_name: event.target.name || event.target.id,
                    field_type: event.target.type,
                    form_id: event.target.form?.id
                });
            }
        });
    }
    
    handleFormSubmission(formId, trackAction, form, event) {
        const formData = new FormData(form);
        const formProperties = {
            form_id: formId,
            form_action: trackAction,
            field_count: formData.size
        };
        
        switch (trackAction) {
            case 'newsletter-signup':
                event.preventDefault();
                this.trackNewsletterSignup(formData, formProperties);
                break;
                
            case 'login-submit':
                // Let auth.js handle login - don't prevent default
                console.log('🔄 LOGIN FORM SUBMITTED - Letting auth.js handle identification');
                // Just track the event, don't intercept the form
                this.trackEvent('Login Form Submitted', formProperties);
                break;
                
            case 'signup-submit':
                // Let auth.js handle signup - don't prevent default
                console.log('🔄 SIGNUP FORM SUBMITTED - Letting auth.js handle identification');
                // Just track the event, don't intercept the form
                this.trackEvent('Signup Form Submitted', formProperties);
                break;
                
            case 'search-submit':
                event.preventDefault();
                this.trackSearch(formData, formProperties);
                break;
        }
    }
    
    setupScrollTracking() {
        // Scroll tracking is handled by ScrollTracker class
        // This method can add additional scroll-based events
        let scrollTimer = null;
        
        window.addEventListener('scroll', () => {
            if (scrollTimer) clearTimeout(scrollTimer);
            
            scrollTimer = setTimeout(() => {
                // Track scroll engagement every 30 seconds of scrolling
                this.trackEvent('Scroll Engagement', {
                    ...window.scrollTracker?.getScrollEngagement(),
                    current_scroll: Math.round(window.scrollY),
                    viewport_height: window.innerHeight
                });
            }, 30000);
        });
    }
    
    setupEngagementTracking() {
        // Track time-based engagement
        let engagementTimer = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.trackEvent('Page Engagement', {
                    time_on_page: this.getTimeOnPage(),
                    engagement_type: 'time_milestone',
                    milestone_seconds: 30
                });
            }
        }, 30000);
        
        // Clear timer on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(engagementTimer);
        });
    }
    
    // Specific tracking methods for different use cases
    
    trackSearchEvent(searchLocation) {
        const searchInput = document.querySelector(`#${searchLocation === 'hero' ? 'destination-search' : 'search-input'}`);
        const searchQuery = searchInput?.value?.trim();
        
        if (!searchQuery) return;
        
        this.trackEvent('Search Executed', {
            search_query: searchQuery,
            search_location: searchLocation,
            search_type: 'destination',
            query_length: searchQuery.length,
            has_results: true // Would be determined by actual search implementation
        });
        
        // Update user traits
        if (window.userTraits && searchQuery.length > 2) {
            window.userTraits.addDestinationInterest(searchQuery);
            
            // Infer travel type from search query
            const query = searchQuery.toLowerCase();
            if (query.includes('budget') || query.includes('cheap')) {
                window.userTraits.addTravelType('budget');
            } else if (query.includes('luxury') || query.includes('resort')) {
                window.userTraits.addTravelType('luxury');
            } else if (query.includes('adventure') || query.includes('hiking')) {
                window.userTraits.addTravelType('adventure');
            }
        }
    }
    
    trackDestinationView(element) {
        const destination = element.getAttribute('data-destination');
        
        this.trackEvent('Destination Viewed', {
            destination_name: destination,
            destination_category: 'country',
            view_source: 'destination_grid',
            element_position: this.getElementPosition(element)
        });
        
        // Update user traits
        if (window.userTraits) {
            window.userTraits.addDestinationInterest(destination);
        }
        
        // Show dynamic offers for this destination
        this.showDestinationOffers(destination);
    }
    
    trackExperienceBooking(element) {
        const experienceId = element.getAttribute('data-experience');
        const experienceCard = element.closest('.experience-card');
        const experienceTitle = experienceCard?.querySelector('.experience-title')?.textContent;
        const experiencePrice = experienceCard?.querySelector('.experience-price')?.textContent;
        
        this.trackEvent('Experience Book Clicked', {
            experience_id: experienceId,
            experience_name: experienceTitle,
            experience_price: experiencePrice,
            booking_source: 'experience_grid'
        });
        
        // Simulate booking flow
        setTimeout(() => {
            this.trackEvent('Booking Modal Opened', {
                experience_id: experienceId,
                experience_name: experienceTitle,
                modal_type: 'booking_form'
            });
        }, 500);
        
        // Simulate booking completion (randomly)
        if (Math.random() > 0.7) {
            setTimeout(() => {
                this.trackBookingCompleted(experienceId, experienceTitle, experiencePrice);
            }, 3000);
        }
    }
    
    trackAddToCart(element) {
        const productId = element.getAttribute('data-product-id');
        const productCard = element.closest('.product-card');
        const productTitle = productCard?.querySelector('.product-title')?.textContent;
        const productPrice = productCard?.querySelector('.current-price')?.textContent;
        const productCategory = productCard?.getAttribute('data-category');
        
        this.trackEvent('Product Added to Cart', {
            product_id: productId,
            product_name: productTitle,
            product_category: productCategory,
            product_price: this.extractPrice(productPrice),
            currency: 'USD',
            quantity: 1,
            cart_source: 'product_grid'
        });
        
        // Update cart count in UI
        this.updateCartCount();
        
        // Show cart briefly
        this.showCartPreview(productTitle);
    }
    
    trackArticleView(element) {
        const articleId = element.getAttribute('data-article-id');
        const articleCard = element.closest('.blog-card');
        const articleTitle = articleCard?.querySelector('.blog-title')?.textContent;
        const articleCategory = articleCard?.querySelector('.blog-category')?.textContent;
        
        this.trackEvent('Article Viewed', {
            article_id: articleId,
            article_title: articleTitle,
            article_category: articleCategory,
            view_source: 'blog_grid',
            reading_time_estimate: this.estimateReadingTime(articleTitle)
        });
        
        // Update user interests
        if (window.userTraits) {
            if (articleTitle?.toLowerCase().includes('italy')) {
                window.userTraits.addDestinationInterest('italy');
            }
            if (articleCategory?.toLowerCase().includes('budget')) {
                window.userTraits.addTravelType('budget');
            }
        }
    }
    
    trackNewsletterSignup(formData, formProperties) {
        const email = formData.get('newsletter-email') || formData.get('email');
        
        this.trackEvent('Newsletter Signup', {
            ...formProperties,
            signup_source: 'homepage_newsletter',
            email_domain: email ? email.split('@')[1] : null
        });
        
        // Update user traits
        if (window.userTraits) {
            window.userTraits.setSubscriberStatus('pending');
            window.userTraits.updateConsent('marketing_emails', true);
        }
        
        // Show success message
        this.showNotification('Thank you for subscribing!', 'success');
    }
    
    trackLogin(formData, formProperties) {
        const email = formData.get('login-email') || formData.get('email');
        
        // Use email as user ID for known users
        const userId = email;
        
        this.trackEvent('User Logged In', {
            ...formProperties,
            login_method: 'email',
            email_domain: email ? email.split('@')[1] : null
        });
        
        // Identify user in Segment
        this.executeEvent('identify', userId, {
            email: email,
            login_timestamp: new Date().toISOString()
        });
        
        // Update UI
        this.updateAuthUI(userId, email);
        this.closeModal('login-modal');
        this.showNotification('Welcome back!', 'success');
    }
    
    trackSignup(formData, formProperties) {
        const email = formData.get('signup-email') || formData.get('email');
        const firstName = formData.get('signup-firstname') || formData.get('firstName');
        const lastName = formData.get('signup-lastname') || formData.get('lastName');
        const marketingConsent = formData.get('marketing-consent') === 'on';
        
        // Use email as user ID for known users
        const userId = email;
        
        this.trackEvent('Account Created', {
            ...formProperties,
            signup_method: 'email',
            email_domain: email ? email.split('@')[1] : null,
            marketing_consent: marketingConsent
        });
        
        // Identify user in Segment
        this.executeEvent('identify', userId, {
            email: email,
            firstName: firstName,
            lastName: lastName,
            created_at: new Date().toISOString(),
            marketing_consent: marketingConsent
        });
        
        // Update user traits
        if (window.userTraits) {
            window.userTraits.setSubscriberStatus(marketingConsent ? 'active' : 'inactive');
            window.userTraits.updateConsent('marketing_emails', marketingConsent);
        }
        
        // Update UI
        this.updateAuthUI(userId, email, firstName);
        this.closeModal('signup-modal');
        this.showNotification('Account created successfully!', 'success');
    }
    
    trackBookingCompleted(experienceId, experienceName, experiencePrice) {
        const bookingId = 'booking_' + Date.now();
        
        this.trackEvent('Booking Completed', {
            booking_id: bookingId,
            experience_id: experienceId,
            experience_name: experienceName,
            booking_value: this.extractPrice(experiencePrice),
            currency: 'USD',
            booking_date: new Date().toISOString(),
            payment_method: 'credit_card'
        });
        
        this.showNotification('Booking confirmed!', 'success');
    }
    
    trackGearCategory(element) {
        const category = element.getAttribute('data-category');
        
        this.trackEvent('Product Category Viewed', {
            category_name: category,
            category_source: 'gear_store',
            filter_type: 'category_button'
        });
    }
    
    // Dynamic offers functionality
    showDestinationOffers(destination) {
        const offers = this.generateDestinationOffers(destination);
        const offersContainer = document.getElementById('offers-grid');
        
        if (offersContainer && offers.length > 0) {
            offersContainer.innerHTML = '';
            
            offers.forEach(offer => {
                this.trackEvent('Offer Shown', {
                    offer_id: offer.id,
                    offer_type: offer.type,
                    offer_destination: destination,
                    offer_value: offer.discount,
                    personalization_reason: offer.reason
                });
                
                const offerElement = this.createOfferElement(offer);
                offersContainer.appendChild(offerElement);
            });
            
            // Scroll to offers
            document.getElementById('dynamic-offers').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    generateDestinationOffers(destination) {
        const offers = [];
        const userTraits = window.userTraits?.getTraits() || {};
        
        // Hotel offer from Booking.com
        offers.push({
            id: 'hotel_' + destination + '_' + Date.now(),
            type: 'hotel',
            title: `Best Hotels in ${destination.charAt(0).toUpperCase() + destination.slice(1)}`,
            description: 'Exclusive deals on top-rated accommodations',
            discount: 25,
            partner: 'booking.com',
            reason: 'destination_interest',
            cta: 'View Hotels',
            image: `images/offers/${destination}-hotels.jpg`
        });
        
        // Flight offer from Expedia
        offers.push({
            id: 'flight_' + destination + '_' + Date.now(),
            type: 'flight',
            title: `Flights to ${destination.charAt(0).toUpperCase() + destination.slice(1)}`,
            description: 'Compare prices from multiple airlines',
            discount: 15,
            partner: 'expedia',
            reason: 'destination_interest',
            cta: 'Book Flight',
            image: `images/offers/${destination}-flights.jpg`
        });
        
        // Travel insurance offer
        if (userTraits.travel_types?.includes('adventure') || userTraits.destinations_of_interest?.length > 2) {
            offers.push({
                id: 'insurance_' + Date.now(),
                type: 'insurance',
                title: 'Travel Insurance for Your Trip',
                description: 'Protect your adventure with comprehensive coverage',
                discount: 20,
                partner: 'world_nomads',
                reason: 'frequent_traveler',
                cta: 'Get Quote',
                image: 'images/offers/travel-insurance.jpg'
            });
        }
        
        return offers;
    }
    
    createOfferElement(offer) {
        const offerDiv = document.createElement('div');
        offerDiv.className = 'offer-card';
        offerDiv.innerHTML = `
            <div class="offer-image">
                <img src="${offer.image}" alt="${offer.title}" loading="lazy">
                <div class="offer-badge">${offer.discount}% OFF</div>
            </div>
            <div class="offer-content">
                <h3 class="offer-title">${offer.title}</h3>
                <p class="offer-description">${offer.description}</p>
                <div class="offer-partner">via ${offer.partner}</div>
                <button class="btn-primary offer-cta" data-offer-id="${offer.id}" data-offer-type="${offer.type}">
                    ${offer.cta}
                </button>
            </div>
        `;
        
        // Add click tracking for offer
        offerDiv.querySelector('.offer-cta').addEventListener('click', () => {
            this.trackEvent('Offer Clicked', {
                offer_id: offer.id,
                offer_type: offer.type,
                offer_partner: offer.partner,
                offer_discount: offer.discount,
                click_source: 'dynamic_offers'
            });
            
            // Track affiliate click
            if (window.userTraits) {
                window.userTraits.setLastAffiliateClick(offer.partner, offer.type);
            }
            
            // Simulate redirect to partner
            this.showNotification(`Redirecting to ${offer.partner}...`, 'info');
        });
        
        return offerDiv;
    }
    
    // Utility methods
    
    trackEvent(eventName, properties = {}) {
        const enrichedProperties = {
            ...properties,
            ...(window.eventProperties?.getBaseProperties() || {})
        };
        
        this.executeEvent('track', eventName, enrichedProperties);
        console.log('Event tracked:', eventName, enrichedProperties);
    }
    
    getTimeOnPage() {
        const sessionStart = sessionStorage.getItem('lametayel_page_load_time') || Date.now();
        return Math.round((Date.now() - parseInt(sessionStart)) / 1000);
    }
    
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            viewport_percentage_x: Math.round((rect.left / window.innerWidth) * 100),
            viewport_percentage_y: Math.round((rect.top / window.innerHeight) * 100)
        };
    }
    
    extractPrice(priceString) {
        if (!priceString) return 0;
        const match = priceString.match(/[\d,]+\.?\d*/);
        return match ? parseFloat(match[0].replace(',', '')) : 0;
    }
    
    estimateReadingTime(title) {
        // Rough estimate: 200 words per minute
        const estimatedWords = 500; // Average article length
        return Math.ceil(estimatedWords / 200);
    }
    
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const currentCount = parseInt(cartCount.textContent) || 0;
            cartCount.textContent = currentCount + 1;
        }
    }
    
    updateAuthUI(userId, email, firstName) {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        
        // Store user info for session
        sessionStorage.setItem('lametayel_user', JSON.stringify({
            id: userId,
            email: email,
            firstName: firstName
        }));
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
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
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showCartPreview(productName) {
        this.showNotification(`${productName} added to cart`, 'success');
    }
    
    // Logout functionality
    logout() {
        this.trackEvent('User Logged Out', {
            logout_method: 'manual',
            session_duration: this.getTimeOnPage()
        });
        
        // Reset analytics
        if (window.analytics) {
            analytics.reset();
        }
        
        // Clear session data
        sessionStorage.removeItem('lametayel_user');
        localStorage.removeItem('lametayel_user_traits');
        
        // Update UI
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.getElementById('user-menu');
        
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        
        this.showNotification('You have been logged out', 'info');
    }
}

// Initialize tracking when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Store page load time
    sessionStorage.setItem('lametayel_page_load_time', Date.now().toString());
    
    // Initialize tracking
    window.lametayelTracking = new LametayelTracking();
    
    console.log('Lametayel tracking initialized');
});