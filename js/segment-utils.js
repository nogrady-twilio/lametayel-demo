/**
 * Segment Analytics Utilities for Lametayel Travel Website
 * Comprehensive tracking for travel behavior and user interactions
 */

// Utility functions for Segment tracking
const SegmentUtils = {
    
    /**
     * Get URL parameters for campaign tracking
     */
    getUTMParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            utm_source: params.get('utm_source') || null,
            utm_medium: params.get('utm_medium') || null,
            utm_campaign: params.get('utm_campaign') || null,
            utm_term: params.get('utm_term') || null,
            utm_content: params.get('utm_content') || null,
            gclid: params.get('gclid') || null,
            fbclid: params.get('fbclid') || null
        };
    },

    /**
     * Get user's geographic info (simplified - in real implementation use IP geolocation)
     */
    getUserGeoInfo() {
        return {
            country: 'Israel', // Default for Lametayel's primary market
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language || 'en',
            user_agent: navigator.userAgent
        };
    },

    /**
     * Get device and browser information
     */
    getDeviceInfo() {
        return {
            screen_width: window.screen.width,
            screen_height: window.screen.height,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            device_type: this.getDeviceType(),
            is_mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        };
    },

    /**
     * Detect device type
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    },

    /**
     * Get page performance metrics
     */
    getPerformanceMetrics() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            return {
                page_load_time: timing.loadEventEnd - timing.navigationStart,
                dom_ready_time: timing.domContentLoadedEventEnd - timing.navigationStart,
                first_paint_time: timing.responseStart - timing.navigationStart
            };
        }
        return {};
    },

    /**
     * Track page views with comprehensive data
     */
    trackPageView(pageName = null, additionalProperties = {}) {
        const pageTitle = pageName || document.title;
        const properties = {
            title: pageTitle,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer,
            search: window.location.search,
            ...this.getUTMParams(),
            ...this.getUserGeoInfo(),
            ...this.getDeviceInfo(),
            ...this.getPerformanceMetrics(),
            timestamp: new Date().toISOString(),
            ...additionalProperties
        };

        if (window.analytics) {
            analytics.page(pageTitle, properties);
        }
        
        console.log('📊 Page View:', pageTitle, properties);
    },

    /**
     * Track article views with travel-specific context
     */
    trackArticleView(articleId, articleData = {}) {
        const properties = {
            article_id: articleId,
            article_title: articleData.title || '',
            article_category: articleData.category || '',
            destination: articleData.destination || '',
            article_type: articleData.type || 'travel_guide',
            reading_time_estimate: articleData.readingTime || 0,
            author: articleData.author || '',
            publish_date: articleData.publishDate || '',
            tags: articleData.tags || [],
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Article Viewed', properties);
        }
        
        console.log('📖 Article View:', properties);
        
        // Set user traits for destination interest
        if (articleData.destination) {
            this.updateUserTraits({
                [`interested_in_${articleData.destination.toLowerCase()}`]: true,
                [`last_${articleData.destination.toLowerCase()}_article_view`]: new Date().toISOString()
            });
        }
    },

    /**
     * Track search behavior
     */
    trackSearch(query, results = [], searchType = 'general') {
        const properties = {
            query: query,
            search_type: searchType,
            results_count: results.length,
            results: results.slice(0, 5), // First 5 results
            has_results: results.length > 0,
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Search Executed', properties);
        }
        
        console.log('🔍 Search:', properties);
        
        // Update user traits with search interests
        this.updateUserTraits({
            last_search_query: query,
            search_count: (this.getUserTrait('search_count') || 0) + 1
        });
    },

    /**
     * Track offer interactions (only when clicked)
     */

    trackOfferClicked(offerId, offerData = {}) {
        const properties = {
            offer_id: offerId,
            offer_type: offerData.type || '',
            offer_category: offerData.category || '',
            destination: offerData.destination || '',
            country: offerData.country || '',
            price: offerData.price || 0,
            currency: offerData.currency || 'USD',
            discount_percent: offerData.discountPercent || 0,
            partner: offerData.partner || '',
            placement: offerData.placement || 'homepage',
            offer_title: offerData.offer_title || '',
            offer_description: offerData.offer_description || '',
            click_position: offerData.position || 0,
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Offer Clicked', properties);
        }
        
        console.log('🖱️ Offer Clicked:', properties);
        
        // Update user traits
        this.updateUserTraits({
            [`clicked_${offerData.type}_offer`]: true,
            last_offer_click: new Date().toISOString(),
            offer_engagement_score: (this.getUserTrait('offer_engagement_score') || 0) + 1
        });
    },

    /**
     * Track booking-related events
     */
    trackBookingOfferClicked(offerData = {}) {
        const properties = {
            booking_type: offerData.bookingType || 'hotel',
            destination: offerData.destination || '',
            partner: offerData.partner || '',
            price_range: offerData.priceRange || '',
            dates: offerData.dates || {},
            guests: offerData.guests || 0,
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Clicked Booking Offer', properties);
        }
        
        console.log('🏨 Booking Offer Clicked:', properties);
    },

    trackBookingCompleted(bookingData = {}) {
        const properties = {
            booking_id: bookingData.bookingId || '',
            booking_type: bookingData.type || '',
            destination: bookingData.destination || '',
            partner: bookingData.partner || '',
            total_amount: bookingData.amount || 0,
            currency: bookingData.currency || 'USD',
            commission_earned: bookingData.commission || 0,
            booking_dates: bookingData.dates || {},
            guests: bookingData.guests || 0,
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Booking Completed', properties);
        }
        
        console.log('✅ Booking Completed:', properties);
        
        // Update user traits for successful conversion
        this.updateUserTraits({
            total_bookings: (this.getUserTrait('total_bookings') || 0) + 1,
            total_booking_value: (this.getUserTrait('total_booking_value') || 0) + (bookingData.amount || 0),
            last_booking_date: new Date().toISOString(),
            preferred_booking_type: bookingData.type || ''
        });
    },

    /**
     * Track user authentication events
     */
    trackUserSignup(userData = {}) {
        const properties = {
            signup_method: userData.method || 'email',
            user_type: userData.userType || 'traveler',
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Account Created', properties);
        }
        
        console.log('👤 User Signup:', properties);
    },

    trackUserLogin(userData = {}) {
        const properties = {
            login_method: userData.method || 'email',
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('User Logged In', properties);
        }
        
        console.log('🔐 User Login:', properties);
    },

    /**
     * Track form submissions
     */
    trackFormSubmission(formType, formData = {}) {
        const properties = {
            form_type: formType,
            form_data: formData,
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Form Submitted', properties);
        }
        
        console.log('📝 Form Submitted:', properties);
    },

    /**
     * Track newsletter subscriptions
     */
    trackNewsletterSignup(email, preferences = {}) {
        const properties = {
            email: email,
            subscription_preferences: preferences,
            subscription_source: 'website',
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Newsletter Subscribed', properties);
        }
        
        console.log('📧 Newsletter Signup:', properties);
    },

    /**
     * Track CTA clicks
     */
    trackCTAClick(ctaName, ctaData = {}) {
        const properties = {
            cta_name: ctaName,
            cta_type: ctaData.type || 'button',
            cta_location: ctaData.location || '',
            cta_text: ctaData.text || '',
            destination_page: ctaData.destinationPage || '',
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('CTA Clicked', properties);
        }
        
        console.log('🔗 CTA Clicked:', properties);
    },

    /**
     * Track feature engagement
     */
    trackFeatureEngaged(featureName, engagementData = {}) {
        const properties = {
            feature_name: featureName,
            engagement_type: engagementData.type || 'use',
            engagement_duration: engagementData.duration || 0,
            feature_value: engagementData.value || '',
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Feature Engaged', properties);
        }
        
        console.log('⚙️ Feature Engaged:', properties);
    },

    /**
     * Track ecommerce events
     */
    trackProductViewed(productData = {}) {
        const properties = {
            product_id: productData.id || '',
            product_name: productData.name || '',
            category: productData.category || 'travel_gear',
            price: productData.price || 0,
            currency: productData.currency || 'USD',
            brand: productData.brand || '',
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Product Viewed', properties);
        }
        
        console.log('🛍️ Product Viewed:', properties);
    },

    trackItemAddedToCart(productData = {}) {
        const properties = {
            product_id: productData.id || '',
            product_name: productData.name || '',
            category: productData.category || 'travel_gear',
            price: productData.price || 0,
            currency: productData.currency || 'USD',
            quantity: productData.quantity || 1,
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Item Added to Cart', properties);
        }
        
        console.log('🛒 Item Added to Cart:', properties);
    },

    trackCartViewed(cartData = {}) {
        const properties = {
            cart_id: cartData.id || '',
            total_items: cartData.items ? cartData.items.length : 0,
            total_value: cartData.totalValue || 0,
            currency: cartData.currency || 'USD',
            items: cartData.items || [],
            ...this.getDeviceInfo(),
            timestamp: new Date().toISOString()
        };

        if (window.analytics) {
            analytics.track('Cart Viewed', properties);
        }
        
        console.log('🛒 Cart Viewed:', properties);
    },

    /**
     * Identify user with comprehensive traits
     */
    identifyUser(userId, userTraits = {}) {
        const traits = {
            email: userTraits.email || '',
            firstName: userTraits.firstName || '',
            lastName: userTraits.lastName || '',
            name: `${userTraits.firstName || ''} ${userTraits.lastName || ''}`.trim(),
            created_at: new Date().toISOString(),
            ...this.getUserGeoInfo(),
            ...userTraits
        };

        if (window.analytics) {
            analytics.identify(userId, traits);
        }
        
        console.log('👤 User Identified:', userId, traits);
        
        // Store user ID in localStorage for session tracking
        localStorage.setItem('lametayel_user_id', userId);
    },

    /**
     * Update user traits
     */
    updateUserTraits(traits = {}) {
        const userId = localStorage.getItem('lametayel_user_id');
        if (userId && window.analytics) {
            analytics.identify(userId, traits);
        }
        
        console.log('📝 User Traits Updated:', traits);
    },

    /**
     * Get user trait value
     */
    getUserTrait(traitName) {
        // In a real implementation, this would fetch from Segment's user profile
        // For now, we'll use localStorage as a simple fallback
        const userTraits = JSON.parse(localStorage.getItem('lametayel_user_traits') || '{}');
        return userTraits[traitName];
    },

    /**
     * Reset user session (logout)
     */
    resetUser() {
        if (window.analytics) {
            analytics.reset();
        }
        localStorage.removeItem('lametayel_user_id');
        localStorage.removeItem('lametayel_user_traits');
        
        console.log('🔄 User Session Reset');
    },

    /**
     * Track scroll depth for engagement measurement
     */
    initScrollTracking() {
        let maxScroll = 0;
        let scrollTracked = {25: false, 50: false, 75: false, 90: false};
        
        const trackScroll = () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Track milestone scroll depths
                Object.keys(scrollTracked).forEach(milestone => {
                    if (scrollPercent >= parseInt(milestone) && !scrollTracked[milestone]) {
                        scrollTracked[milestone] = true;
                        
                        if (window.analytics) {
                            analytics.track('Page Scroll Depth', {
                                scroll_depth: parseInt(milestone),
                                page_url: window.location.href,
                                page_title: document.title,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                });
            }
        };
        
        window.addEventListener('scroll', trackScroll, { passive: true });
    },

    /**
     * Track time on page
     */
    initTimeTracking() {
        const startTime = new Date();
        
        const trackTimeOnPage = () => {
            const timeSpent = Math.round((new Date() - startTime) / 1000); // seconds
            
            if (window.analytics) {
                analytics.track('Time on Page', {
                    time_spent_seconds: timeSpent,
                    page_url: window.location.href,
                    page_title: document.title,
                    timestamp: new Date().toISOString()
                });
            }
        };
        
        // Track time on page before user leaves
        window.addEventListener('beforeunload', trackTimeOnPage);
        
        // Also track at regular intervals for long sessions
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                const timeSpent = Math.round((new Date() - startTime) / 1000);
                if (timeSpent % 60 === 0 && timeSpent > 0) { // Every minute
                    trackTimeOnPage();
                }
            }
        }, 1000);
    }
};

// Initialize tracking when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Track initial page view
    SegmentUtils.trackPageView();
    
    // Initialize engagement tracking
    SegmentUtils.initScrollTracking();
    SegmentUtils.initTimeTracking();
    
    console.log('🚀 Segment Analytics initialized for Lametayel');
});

// Export for use in other scripts
window.SegmentUtils = SegmentUtils;