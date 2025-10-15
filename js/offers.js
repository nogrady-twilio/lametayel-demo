/**
 * Dynamic Offers System for Lametayel
 * Personalized travel offers based on user behavior and interests
 */

class DynamicOffers {
    constructor() {
        this.offers = [];
        this.userProfile = this.getUserProfile();
        this.offerConfig = {
            maxOffers: 6,
            refreshInterval: 30000, // 30 seconds for demo purposes
            personalizedWeight: 0.7,
            randomWeight: 0.3
        };
        this.init();
    }

    /**
     * Initialize the offers system
     */
    init() {
        this.loadOfferTemplates();
        this.renderOffers();
        
        // Refresh offers periodically for demo
        setInterval(() => {
            this.refreshOffers();
        }, this.offerConfig.refreshInterval);
    }

    /**
     * Load offer templates (in real implementation, this would come from an API)
     */
    loadOfferTemplates() {
        this.offerTemplates = {
            hotels: [
                {
                    id: 'hotel_tuscany_1',
                    type: 'hotel',
                    title: 'Luxury Villa in Tuscany',
                    description: 'Experience authentic Italian charm in this stunning countryside villa with vineyard views.',
                    destination: 'italy',
                    category: 'accommodation',
                    partner: 'booking.com',
                    price: 450,
                    originalPrice: 680,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop',
                    badge: 'Limited Time',
                    cta: 'Book Now',
                    interests: ['italy', 'luxury', 'wine'],
                    seasons: ['spring', 'summer', 'fall']
                },
                {
                    id: 'hotel_santorini_1',
                    type: 'hotel',
                    title: 'Cliffside Resort in Santorini',
                    description: 'Wake up to breathtaking caldera views in this exclusive Greek island paradise.',
                    destination: 'greece',
                    category: 'accommodation',
                    partner: 'expedia',
                    price: 380,
                    originalPrice: 520,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=250&fit=crop',
                    badge: 'Best Seller',
                    cta: 'View Deals',
                    interests: ['greece', 'luxury', 'romantic'],
                    seasons: ['spring', 'summer', 'fall']
                },
                {
                    id: 'hotel_kyoto_1',
                    type: 'hotel',
                    title: 'Traditional Ryokan in Kyoto',
                    description: 'Immerse yourself in Japanese culture with tatami rooms, kaiseki dining, and zen gardens.',
                    destination: 'japan',
                    category: 'accommodation',
                    partner: 'booking.com',
                    price: 280,
                    originalPrice: 350,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=250&fit=crop',
                    badge: 'Cultural Experience',
                    cta: 'Explore',
                    interests: ['japan', 'culture', 'authentic'],
                    seasons: ['spring', 'fall']
                }
            ],
            insurance: [
                {
                    id: 'insurance_comprehensive_1',
                    type: 'insurance',
                    title: 'Comprehensive Travel Protection',
                    description: 'Complete coverage for medical emergencies, trip cancellation, and baggage protection.',
                    destination: 'global',
                    category: 'insurance',
                    partner: 'world_nomads',
                    price: 89,
                    originalPrice: 120,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop',
                    badge: 'Peace of Mind',
                    cta: 'Get Quote',
                    interests: ['safety', 'international', 'comprehensive'],
                    seasons: ['all']
                },
                {
                    id: 'insurance_adventure_1',
                    type: 'insurance',
                    title: 'Adventure Sports Coverage',
                    description: 'Specialized protection for skiing, diving, hiking, and extreme sports activities.',
                    destination: 'global',
                    category: 'insurance',
                    partner: 'adventure_insurance',
                    price: 125,
                    originalPrice: 180,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=250&fit=crop',
                    badge: 'Adventure Ready',
                    cta: 'Protect Your Trip',
                    interests: ['adventure', 'sports', 'skiing', 'diving'],
                    seasons: ['winter', 'summer']
                }
            ],
            gear: [
                {
                    id: 'gear_backpack_1',
                    type: 'gear',
                    title: 'Professional Travel Backpack 45L',
                    description: 'Durable, lightweight backpack perfect for extended travels with multiple compartments.',
                    destination: 'global',
                    category: 'travel_gear',
                    partner: 'lametayel_store',
                    price: 149,
                    originalPrice: 199,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=250&fit=crop',
                    badge: 'Staff Pick',
                    cta: 'Shop Now',
                    interests: ['backpacking', 'adventure', 'practical'],
                    seasons: ['all']
                },
                {
                    id: 'gear_camera_1',
                    type: 'gear',
                    title: 'Waterproof Action Camera Kit',
                    description: 'Capture your adventures with 4K recording, underwater housing, and stabilization.',
                    destination: 'global',
                    category: 'travel_gear',
                    partner: 'lametayel_store',
                    price: 299,
                    originalPrice: 399,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=250&fit=crop',
                    badge: '25% Off',
                    cta: 'Get Yours',
                    interests: ['photography', 'adventure', 'underwater'],
                    seasons: ['summer', 'winter']
                }
            ],
            tours: [
                {
                    id: 'tour_italy_wine_1',
                    type: 'tour',
                    title: 'Tuscany Wine & Cooking Tour',
                    description: 'Small group culinary adventure through vineyards, cooking classes, and local markets.',
                    destination: 'italy',
                    category: 'tours',
                    partner: 'local_tours_italy',
                    price: 325,
                    originalPrice: 420,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
                    badge: 'Small Group',
                    cta: 'Join Tour',
                    interests: ['italy', 'wine', 'cooking', 'culture'],
                    seasons: ['spring', 'summer', 'fall']
                },
                {
                    id: 'tour_japan_cultural_1',
                    type: 'tour',
                    title: 'Traditional Japan Cultural Experience',
                    description: 'Tea ceremonies, temple visits, and authentic cultural immersion in historic Kyoto.',
                    destination: 'japan',
                    category: 'tours',
                    partner: 'japan_cultural_tours',
                    price: 280,
                    originalPrice: 350,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=250&fit=crop',
                    badge: 'Authentic',
                    cta: 'Experience',
                    interests: ['japan', 'culture', 'traditional', 'temples'],
                    seasons: ['spring', 'fall']
                }
            ],
            flights: [
                {
                    id: 'flight_europe_1',
                    type: 'flight',
                    title: 'Round-trip to Europe from $399',
                    description: 'Limited time deals on flights to major European destinations. Book by month end.',
                    destination: 'europe',
                    category: 'flights',
                    partner: 'skyscanner',
                    price: 399,
                    originalPrice: 650,
                    currency: 'USD',
                    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop',
                    badge: 'Flash Sale',
                    cta: 'Search Flights',
                    interests: ['europe', 'budget', 'international'],
                    seasons: ['all']
                }
            ]
        };
    }

    /**
     * Get user profile with interests and behavior data
     */
    getUserProfile() {
        // In real implementation, this would come from Segment user traits
        const defaultProfile = {
            interests: ['italy', 'culture', 'photography'],
            previousDestinations: ['france', 'spain'],
            travelStyle: 'cultural',
            budgetRange: 'mid',
            seasonPreference: this.getCurrentSeason(),
            recentSearches: [],
            clickedOffers: [],
            bookingHistory: []
        };

        // Try to get stored profile or use default
        const storedProfile = localStorage.getItem('lametayel_user_profile');
        return storedProfile ? JSON.parse(storedProfile) : defaultProfile;
    }

    /**
     * Update user profile based on interactions
     */
    updateUserProfile(updates) {
        this.userProfile = { ...this.userProfile, ...updates };
        localStorage.setItem('lametayel_user_profile', JSON.stringify(this.userProfile));
    }

    /**
     * Get current season for seasonal offers
     */
    getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'fall';
        return 'winter';
    }

    /**
     * Calculate offer relevance score based on user profile
     */
    calculateRelevanceScore(offer) {
        let score = 0;
        const maxScore = 100;

        // Interest matching (40% of score)
        const interestMatches = offer.interests.filter(interest => 
            this.userProfile.interests.includes(interest)
        ).length;
        score += (interestMatches / offer.interests.length) * 40;

        // Destination interest (20% of score)
        if (this.userProfile.interests.includes(offer.destination)) {
            score += 20;
        }

        // Season relevance (15% of score)
        if (offer.seasons.includes('all') || offer.seasons.includes(this.userProfile.seasonPreference)) {
            score += 15;
        }

        // Recent search relevance (15% of score)
        const searchMatches = this.userProfile.recentSearches.filter(search =>
            offer.title.toLowerCase().includes(search.toLowerCase()) ||
            offer.destination.toLowerCase().includes(search.toLowerCase())
        ).length;
        if (searchMatches > 0) score += 15;

        // Avoid recently clicked offers (10% penalty)
        if (this.userProfile.clickedOffers.includes(offer.id)) {
            score -= 10;
        }

        // Budget matching (10% of score)
        if (this.userProfile.budgetRange === 'budget' && offer.price < 200) score += 10;
        if (this.userProfile.budgetRange === 'mid' && offer.price >= 200 && offer.price <= 500) score += 10;
        if (this.userProfile.budgetRange === 'luxury' && offer.price > 500) score += 10;

        return Math.max(0, Math.min(maxScore, score));
    }

    /**
     * Get personalized offers
     */
    getPersonalizedOffers() {
        const allOffers = [
            ...this.offerTemplates.hotels,
            ...this.offerTemplates.insurance,
            ...this.offerTemplates.gear,
            ...this.offerTemplates.tours,
            ...this.offerTemplates.flights
        ];

        // Calculate relevance scores
        const scoredOffers = allOffers.map(offer => ({
            ...offer,
            relevanceScore: this.calculateRelevanceScore(offer),
            discountPercent: Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
        }));

        // Sort by relevance score (descending)
        scoredOffers.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Mix personalized with some random offers for diversity
        const personalizedCount = Math.ceil(this.offerConfig.maxOffers * this.offerConfig.personalizedWeight);
        const randomCount = this.offerConfig.maxOffers - personalizedCount;

        const personalized = scoredOffers.slice(0, personalizedCount);
        const random = scoredOffers
            .slice(personalizedCount)
            .sort(() => Math.random() - 0.5)
            .slice(0, randomCount);

        return [...personalized, ...random].slice(0, this.offerConfig.maxOffers);
    }

    /**
     * Render offers in the DOM
     */
    renderOffers() {
        const offersGrid = document.getElementById('offersGrid');
        if (!offersGrid) return;

        const personalizedOffers = this.getPersonalizedOffers();
        
        // Note: Offer Shown events are now only fired when user clicks on offers
        // This improves data quality by tracking actual engagement rather than impressions

        offersGrid.innerHTML = personalizedOffers.map(offer => `
            <div class="offer-card" data-offer-id="${offer.id}" data-offer-type="${offer.type}">
                <img src="${offer.image}" alt="${offer.title}" class="offer-image" loading="lazy">
                <div class="offer-content">
                    <div class="offer-badge">${offer.badge}</div>
                    <h3 class="offer-title">${offer.title}</h3>
                    <p class="offer-description">${offer.description}</p>
                    <div class="offer-price">
                        <span class="offer-price-current">$${offer.price}</span>
                        <span class="offer-price-original">$${offer.originalPrice}</span>
                    </div>
                    <button class="offer-btn" data-offer-id="${offer.id}" data-track="offer-click">
                        ${offer.cta}
                    </button>
                </div>
            </div>
        `).join('');

        // Add click event listeners
        this.attachOfferListeners();
        
        console.log('🎯 Rendered personalized offers:', personalizedOffers.length, '(Tracking only on clicks)');
    }

    /**
     * Attach click event listeners to offers
     */
    attachOfferListeners() {
        document.querySelectorAll('[data-offer-id]').forEach(button => {
            button.addEventListener('click', (e) => {
                const offerId = e.target.dataset.offerId || e.currentTarget.dataset.offerId;
                const offerCard = e.target.closest('.offer-card');
                const offerType = offerCard?.dataset.offerType;
                
                this.handleOfferClick(offerId, offerType, e.target);
            });
        });
    }

    /**
     * Handle offer clicks
     */
    handleOfferClick(offerId, offerType, element) {
        // Find the offer data
        const allOffers = [
            ...this.offerTemplates.hotels,
            ...this.offerTemplates.insurance,
            ...this.offerTemplates.gear,
            ...this.offerTemplates.tours,
            ...this.offerTemplates.flights
        ];
        
        const offer = allOffers.find(o => o.id === offerId);
        if (!offer) return;

        // Track the offer click with comprehensive properties
        SegmentUtils.trackOfferClicked(offerId, {
            type: offer.type,
            category: offer.category,
            destination: offer.destination,
            country: this.getCountryFromDestination(offer.destination),
            price: offer.price,
            currency: offer.currency,
            discountPercent: offer.discountPercent || 0,
            partner: offer.partner,
            placement: 'homepage',
            offer_title: offer.title,
            offer_description: offer.description
        });

        // Update user profile with interaction
        const updatedClickedOffers = [...(this.userProfile.clickedOffers || []), offerId];
        const updatedInterests = [...new Set([...this.userProfile.interests, ...offer.interests])];
        
        this.updateUserProfile({
            clickedOffers: updatedClickedOffers.slice(-20), // Keep last 20 clicks
            interests: updatedInterests.slice(0, 15), // Max 15 interests
            lastOfferClick: new Date().toISOString()
        });

        // Simulate different actions based on offer type
        this.simulateOfferAction(offer);

        // Show user feedback
        this.showOfferFeedback(element, offer);
    }

    /**
     * Simulate offer-specific actions
     */
    simulateOfferAction(offer) {
        switch (offer.type) {
            case 'hotel':
                // Simulate booking.com redirect
                console.log('🏨 Redirecting to booking platform:', offer.partner);
                setTimeout(() => {
                    // Simulate booking completion (20% chance)
                    if (Math.random() < 0.2) {
                        SegmentUtils.trackBookingCompleted({
                            bookingId: 'booking_' + Date.now(),
                            type: 'hotel',
                            destination: offer.destination,
                            partner: offer.partner,
                            amount: offer.price,
                            currency: offer.currency,
                            commission: offer.price * 0.1
                        });
                    }
                }, 5000);
                break;
                
            case 'insurance':
                console.log('🛡️ Opening insurance quote form');
                break;
                
            case 'gear':
                // Track product view and potential cart addition
                SegmentUtils.trackProductViewed({
                    id: offer.id,
                    name: offer.title,
                    category: offer.category,
                    price: offer.price,
                    currency: offer.currency,
                    brand: 'Lametayel'
                });
                
                // 30% chance of adding to cart
                setTimeout(() => {
                    if (Math.random() < 0.3) {
                        SegmentUtils.trackItemAddedToCart({
                            id: offer.id,
                            name: offer.title,
                            category: offer.category,
                            price: offer.price,
                            currency: offer.currency,
                            quantity: 1
                        });
                    }
                }, 2000);
                break;
                
            case 'tour':
                console.log('🗺️ Opening tour booking page');
                break;
                
            case 'flight':
                console.log('✈️ Searching flights on partner site');
                break;
        }
    }

    /**
     * Show user feedback after offer click
     */
    showOfferFeedback(element, offer) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.className = 'offer-feedback';
        feedback.textContent = 'Opening...';
        feedback.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--success-color);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;

        // Add animation keyframes to document if not exists
        if (!document.getElementById('offerFeedbackStyles')) {
            const style = document.createElement('style');
            style.id = 'offerFeedbackStyles';
            style.textContent = `
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.appendChild(feedback);

        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }

    /**
     * Get country from destination
     */
    getCountryFromDestination(destination) {
        const destinationCountryMap = {
            'italy': 'Italy',
            'japan': 'Japan',
            'greece': 'Greece',
            'thailand': 'Thailand',
            'france': 'France',
            'europe': 'Various',
            'global': 'Global'
        };
        return destinationCountryMap[destination] || destination;
    }

    /**
     * Refresh offers (for demo purposes)
     */
    refreshOffers() {
        console.log('🔄 Refreshing offers...');
        this.renderOffers();
    }

    /**
     * Add interest based on user interaction
     */
    addUserInterest(interest) {
        const currentInterests = this.userProfile.interests || [];
        if (!currentInterests.includes(interest)) {
            const updatedInterests = [...currentInterests, interest].slice(0, 15);
            this.updateUserProfile({ interests: updatedInterests });
            
            // Refresh offers with new interest
            setTimeout(() => this.renderOffers(), 1000);
        }
    }

    /**
     * Track user search for offer personalization
     */
    trackUserSearch(query) {
        const recentSearches = this.userProfile.recentSearches || [];
        const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
        
        this.updateUserProfile({ 
            recentSearches: updatedSearches,
            lastSearchDate: new Date().toISOString()
        });

        // Refresh offers based on search
        setTimeout(() => this.renderOffers(), 500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.dynamicOffers = new DynamicOffers();
    console.log('🎯 Dynamic Offers System initialized');
});

// Export for use in other scripts
window.DynamicOffers = DynamicOffers;