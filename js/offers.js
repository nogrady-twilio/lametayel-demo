/* ===================================
   DYNAMIC OFFERS SYSTEM
   Personalized travel offers and affiliate integrations
   =================================== */

class DynamicOffersManager {
    constructor() {
        this.offers = [];
        this.personalizedOffers = [];
        this.affiliatePartners = this.initializeAffiliatePartners();
        this.offerTemplates = this.initializeOfferTemplates();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadInitialOffers();
        this.startPersonalizationEngine();
    }
    
    initializeAffiliatePartners() {
        return {
            'booking.com': {
                name: 'Booking.com',
                type: 'accommodation',
                commission: 0.04, // 4%
                apiEndpoint: 'https://booking.com/affiliate/',
                trackingParams: {
                    aid: '1234567', // Affiliate ID
                    label: 'lametayel-demo'
                }
            },
            'expedia': {
                name: 'Expedia',
                type: 'flights',
                commission: 0.025, // 2.5%
                apiEndpoint: 'https://expedia.com/affiliate/',
                trackingParams: {
                    eapid: '7654321',
                    siteid: 'lametayel'
                }
            },
            'viator': {
                name: 'Viator',
                type: 'experiences',
                commission: 0.06, // 6%
                apiEndpoint: 'https://viator.com/affiliate/',
                trackingParams: {
                    pid: 'lametayel-affiliate'
                }
            },
            'world_nomads': {
                name: 'World Nomads',
                type: 'insurance',
                commission: 0.12, // 12%
                apiEndpoint: 'https://worldnomads.com/affiliate/',
                trackingParams: {
                    affiliate: 'lametayel',
                    subid: 'demo'
                }
            },
            'rentalcars': {
                name: 'RentalCars.com',
                type: 'car_rental',
                commission: 0.035, // 3.5%
                apiEndpoint: 'https://rentalcars.com/affiliate/',
                trackingParams: {
                    affiliateCode: 'lametayel-rc'
                }
            }
        };
    }
    
    initializeOfferTemplates() {
        return {
            hotel: {
                title: 'Exclusive Hotel Deals in {destination}',
                description: 'Save up to {discount}% on top-rated accommodations',
                cta: 'Find Hotels',
                icon: 'fas fa-bed',
                urgency: 'Limited time offer',
                benefits: ['Free cancellation', 'Best price guarantee', '24/7 support']
            },
            flight: {
                title: 'Cheap Flights to {destination}',
                description: 'Compare prices and save up to {discount}% on airfare',
                cta: 'Search Flights',
                icon: 'fas fa-plane',
                urgency: 'Prices may increase soon',
                benefits: ['Flexible dates', 'Multiple airlines', 'Secure booking']
            },
            experience: {
                title: '{destination} Tours & Activities',
                description: 'Book unique experiences with {discount}% off',
                cta: 'Book Experience',
                icon: 'fas fa-camera',
                urgency: 'Book now to secure your spot',
                benefits: ['Expert guides', 'Skip-the-line access', 'Small groups']
            },
            insurance: {
                title: 'Travel Insurance for Your Trip',
                description: 'Protect your adventure with comprehensive coverage',
                cta: 'Get Quote',
                icon: 'fas fa-shield-alt',
                urgency: 'Recommended for all travelers',
                benefits: ['Medical coverage', 'Trip cancellation', '24/7 assistance']
            },
            car_rental: {
                title: 'Car Rental in {destination}',
                description: 'Explore at your own pace with {discount}% off rentals',
                cta: 'Rent Now',
                icon: 'fas fa-car',
                urgency: 'Book early for best rates',
                benefits: ['Free cancellation', 'Fuel policy options', 'GPS available']
            }
        };
    }
    
    setupEventListeners() {
        // Listen for destination interest events
        document.addEventListener('destinationViewed', (e) => {
            this.handleDestinationInterest(e.detail);
        });
        
        // Listen for search events
        document.addEventListener('searchExecuted', (e) => {
            this.handleSearchEvent(e.detail);
        });
        
        // Handle offer clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.offer-card')) {
                this.handleOfferClick(e.target.closest('.offer-card'));
            }
        });
    }
    
    loadInitialOffers() {
        // Load some generic offers on page load
        const generalOffers = [
            {
                id: 'welcome_hotel',
                type: 'hotel',
                partner: 'booking.com',
                title: 'Welcome Offer: 25% Off Hotels',
                description: 'Save on your first booking with our exclusive welcome offer',
                discount: 25,
                destination: 'worldwide',
                personalizedReason: 'new_visitor',
                validUntil: this.getOfferExpiry(7), // 7 days
                priority: 1
            },
            {
                id: 'flash_flights',
                type: 'flight',
                partner: 'expedia',
                title: 'Flash Sale: Cheap Flights',
                description: 'Limited time offer on international flights',
                discount: 20,
                destination: 'international',
                personalizedReason: 'flash_sale',
                validUntil: this.getOfferExpiry(2), // 2 days
                priority: 2
            }
        ];
        
        this.offers = generalOffers;
        this.renderOffers();
    }
    
    startPersonalizationEngine() {
        // Check for personalization opportunities every 30 seconds
        setInterval(() => {
            this.generatePersonalizedOffers();
        }, 30000);
        
        // Initial personalization after 5 seconds
        setTimeout(() => {
            this.generatePersonalizedOffers();
        }, 5000);
    }
    
    generatePersonalizedOffers() {
        const userTraits = window.userTraits?.getTraits() || {};
        const currentOffers = [];
        
        // Generate destination-specific offers
        if (userTraits.destinations_of_interest?.length > 0) {
            userTraits.destinations_of_interest.forEach(destination => {
                currentOffers.push(...this.createDestinationOffers(destination, userTraits));
            });
        }
        
        // Generate behavior-based offers
        const behaviorOffers = this.createBehaviorBasedOffers(userTraits);
        currentOffers.push(...behaviorOffers);
        
        // Generate time-sensitive offers
        const timeSensitiveOffers = this.createTimeSensitiveOffers();
        currentOffers.push(...timeSensitiveOffers);
        
        // Merge with existing offers and remove duplicates
        this.personalizedOffers = this.deduplicateOffers([
            ...this.offers,
            ...currentOffers
        ]);
        
        // Sort by priority and recency
        this.personalizedOffers.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        
        // Limit to top 6 offers
        this.personalizedOffers = this.personalizedOffers.slice(0, 6);
        
        this.renderOffers();
    }
    
    createDestinationOffers(destination, userTraits) {
        const offers = [];
        const destinationCapitalized = destination.charAt(0).toUpperCase() + destination.slice(1);
        
        // Hotel offers
        offers.push({
            id: `hotel_${destination}_${Date.now()}`,
            type: 'hotel',
            partner: 'booking.com',
            title: `Best Hotels in ${destinationCapitalized}`,
            description: `Exclusive deals on ${destinationCapitalized} accommodations`,
            discount: this.getRandomDiscount(15, 35),
            destination: destination,
            personalizedReason: 'destination_interest',
            validUntil: this.getOfferExpiry(5),
            priority: 1,
            createdAt: new Date().toISOString()
        });
        
        // Flight offers
        offers.push({
            id: `flight_${destination}_${Date.now()}`,
            type: 'flight',
            partner: 'expedia',
            title: `Flights to ${destinationCapitalized}`,
            description: `Save on airfare to ${destinationCapitalized}`,
            discount: this.getRandomDiscount(10, 25),
            destination: destination,
            personalizedReason: 'destination_interest',
            validUntil: this.getOfferExpiry(3),
            priority: 2,
            createdAt: new Date().toISOString()
        });
        
        // Experience offers for popular destinations
        if (['italy', 'japan', 'iceland', 'bali'].includes(destination.toLowerCase())) {
            offers.push({
                id: `experience_${destination}_${Date.now()}`,
                type: 'experience',
                partner: 'viator',
                title: `${destinationCapitalized} Tours & Activities`,
                description: `Discover the best of ${destinationCapitalized}`,
                discount: this.getRandomDiscount(20, 40),
                destination: destination,
                personalizedReason: 'popular_destination',
                validUntil: this.getOfferExpiry(7),
                priority: 2,
                createdAt: new Date().toISOString()
            });
        }
        
        return offers;
    }
    
    createBehaviorBasedOffers(userTraits) {
        const offers = [];
        
        // Travel insurance for frequent travelers
        if (userTraits.destinations_of_interest?.length >= 3) {
            offers.push({
                id: `insurance_frequent_${Date.now()}`,
                type: 'insurance',
                partner: 'world_nomads',
                title: 'Annual Travel Insurance',
                description: 'Perfect for frequent travelers like you',
                discount: 15,
                destination: 'worldwide',
                personalizedReason: 'frequent_traveler',
                validUntil: this.getOfferExpiry(14),
                priority: 3,
                createdAt: new Date().toISOString()
            });
        }
        
        // Car rental for adventure travelers
        if (userTraits.travel_types?.includes('adventure') || userTraits.travel_types?.includes('road_trip')) {
            offers.push({
                id: `car_rental_adventure_${Date.now()}`,
                type: 'car_rental',
                partner: 'rentalcars',
                title: 'Adventure Car Rentals',
                description: 'Explore off the beaten path with our vehicles',
                discount: this.getRandomDiscount(20, 30),
                destination: 'worldwide',
                personalizedReason: 'adventure_traveler',
                validUntil: this.getOfferExpiry(10),
                priority: 4,
                createdAt: new Date().toISOString()
            });
        }
        
        // Luxury experiences for premium travelers
        if (userTraits.travel_types?.includes('luxury')) {
            offers.push({
                id: `luxury_experience_${Date.now()}`,
                type: 'experience',
                partner: 'viator',
                title: 'Luxury Travel Experiences',
                description: 'Exclusive access to premium tours and activities',
                discount: 10, // Smaller discount for luxury
                destination: 'select_destinations',
                personalizedReason: 'luxury_traveler',
                validUntil: this.getOfferExpiry(30),
                priority: 2,
                createdAt: new Date().toISOString()
            });
        }
        
        return offers;
    }
    
    createTimeSensitiveOffers() {
        const offers = [];
        const hour = new Date().getHours();
        const dayOfWeek = new Date().getDay();
        
        // Weekend flash sales
        if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
            offers.push({
                id: `weekend_flash_${Date.now()}`,
                type: 'hotel',
                partner: 'booking.com',
                title: 'Weekend Flash Sale',
                description: 'Limited weekend offer on hotel bookings',
                discount: 30,
                destination: 'popular_cities',
                personalizedReason: 'weekend_special',
                validUntil: this.getOfferExpiry(2),
                priority: 1,
                createdAt: new Date().toISOString(),
                isFlash: true
            });
        }
        
        // Late night booking discounts
        if (hour >= 22 || hour <= 6) {
            offers.push({
                id: `night_owl_${Date.now()}`,
                type: 'flight',
                partner: 'expedia',
                title: 'Night Owl Special',
                description: 'Extra savings for late night bookings',
                discount: 18,
                destination: 'worldwide',
                personalizedReason: 'night_booking',
                validUntil: this.getOfferExpiry(1),
                priority: 2,
                createdAt: new Date().toISOString()
            });
        }
        
        return offers;
    }
    
    handleDestinationInterest(data) {
        const { destination } = data;
        
        // Generate immediate offers for this destination
        const immediateOffers = this.createDestinationOffers(destination, 
            window.userTraits?.getTraits() || {}
        );
        
        // Add to current offers with high priority
        immediateOffers.forEach(offer => {
            offer.priority = 0; // Highest priority
            offer.isImmediate = true;
        });
        
        this.personalizedOffers = [
            ...immediateOffers,
            ...this.personalizedOffers.filter(offer => !offer.isImmediate)
        ].slice(0, 6);
        
        this.renderOffers();
        
        // Track offer display
        immediateOffers.forEach(offer => {
            this.trackOfferShown(offer, 'destination_interest');
        });
    }
    
    handleSearchEvent(data) {
        const { query, results } = data;
        
        // Generate search-based offers
        if (results && results.length > 0) {
            const searchOffers = results.slice(0, 2).map(result => ({
                id: `search_${result.destination}_${Date.now()}`,
                type: 'hotel',
                partner: 'booking.com',
                title: `Hotels in ${result.destination}`,
                description: `Based on your search for "${query}"`,
                discount: this.getRandomDiscount(20, 35),
                destination: result.destination,
                personalizedReason: 'search_result',
                validUntil: this.getOfferExpiry(1),
                priority: 0,
                createdAt: new Date().toISOString(),
                isSearchBased: true
            }));
            
            this.personalizedOffers = [
                ...searchOffers,
                ...this.personalizedOffers.filter(offer => !offer.isSearchBased)
            ].slice(0, 6);
            
            this.renderOffers();
        }
    }
    
    handleOfferClick(offerElement) {
        const offerId = offerElement.getAttribute('data-offer-id');
        const offer = this.personalizedOffers.find(o => o.id === offerId);
        
        if (!offer) return;
        
        // Track offer click
        this.trackOfferClicked(offer);
        
        // Update user traits
        if (window.userTraits && offer.destination && offer.destination !== 'worldwide') {
            window.userTraits.addDestinationInterest(offer.destination);
            window.userTraits.setLastAffiliateClick(offer.partner, offer.type);
        }
        
        // Generate affiliate URL and redirect
        const affiliateUrl = this.generateAffiliateUrl(offer);
        this.simulateRedirect(affiliateUrl, offer);
    }
    
    generateAffiliateUrl(offer) {
        const partner = this.affiliatePartners[offer.partner];
        if (!partner) return '#';
        
        const baseUrl = partner.apiEndpoint;
        const params = new URLSearchParams();
        
        // Add partner-specific tracking parameters
        Object.entries(partner.trackingParams).forEach(([key, value]) => {
            params.append(key, value);
        });
        
        // Add offer-specific parameters
        params.append('offer_id', offer.id);
        params.append('destination', offer.destination);
        params.append('discount', offer.discount.toString());
        params.append('source', 'lametayel');
        params.append('utm_campaign', 'dynamic_offers');
        params.append('utm_medium', 'affiliate');
        params.append('utm_source', 'lametayel');
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    simulateRedirect(url, offer) {
        // In a real implementation, this would open the affiliate URL
        // For demo purposes, we'll show a notification
        const partnerName = this.affiliatePartners[offer.partner]?.name || offer.partner;
        
        if (window.lametayelApp) {
            window.lametayelApp.showNotification(
                `Redirecting to ${partnerName}...`, 
                'info'
            );
        }
        
        // Log the affiliate URL for demo purposes
        console.log('Affiliate URL:', url);
        
        // Simulate booking completion for some offers
        if (Math.random() > 0.6) {
            setTimeout(() => {
                this.simulateBookingCompletion(offer);
            }, 3000);
        }
    }
    
    simulateBookingCompletion(offer) {
        const bookingId = 'booking_' + Date.now();
        const commission = this.calculateCommission(offer);
        
        // Track booking completion
        if (window.lametayelTracking) {
            window.lametayelTracking.trackEvent('Booking Completed', {
                booking_id: bookingId,
                offer_id: offer.id,
                partner: offer.partner,
                booking_type: offer.type,
                destination: offer.destination,
                booking_value: this.estimateBookingValue(offer),
                commission_earned: commission,
                currency: 'USD'
            });
        }
        
        if (window.lametayelApp) {
            window.lametayelApp.showNotification(
                `Booking confirmed! (Demo simulation)`, 
                'success'
            );
        }
    }
    
    renderOffers() {
        const offersContainer = document.getElementById('offers-grid');
        if (!offersContainer) return;
        
        // Clear existing offers
        offersContainer.innerHTML = '';
        
        if (this.personalizedOffers.length === 0) {
            offersContainer.innerHTML = `
                <div class="no-offers" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-compass" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
                    <p style="color: #6c757d;">Exploring personalized offers for you...</p>
                </div>
            `;
            return;
        }
        
        this.personalizedOffers.forEach(offer => {
            const offerElement = this.createOfferElement(offer);
            offersContainer.appendChild(offerElement);
        });
        
        // Animate offers in
        setTimeout(() => {
            offersContainer.querySelectorAll('.offer-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in-up');
                }, index * 100);
            });
        }, 100);
    }
    
    createOfferElement(offer) {
        const template = this.offerTemplates[offer.type];
        const partner = this.affiliatePartners[offer.partner];
        
        const offerDiv = document.createElement('div');
        offerDiv.className = 'offer-card';
        offerDiv.setAttribute('data-offer-id', offer.id);
        offerDiv.setAttribute('data-offer-type', offer.type);
        
        const title = template ? 
            template.title.replace('{destination}', offer.destination.charAt(0).toUpperCase() + offer.destination.slice(1)) :
            offer.title;
            
        const description = template ?
            template.description.replace('{discount}', offer.discount) :
            offer.description;
            
        const cta = template?.cta || 'Learn More';
        const icon = template?.icon || 'fas fa-external-link-alt';
        
        offerDiv.innerHTML = `
            <div class="offer-header">
                ${offer.isFlash ? '<div class="offer-flash">FLASH SALE</div>' : ''}
                <div class="offer-partner">via ${partner?.name || offer.partner}</div>
            </div>
            <div class="offer-content">
                <div class="offer-icon">
                    <i class="${icon}"></i>
                </div>
                <h3 class="offer-title">${title}</h3>
                <p class="offer-description">${description}</p>
                <div class="offer-discount">
                    <span class="discount-amount">${offer.discount}% OFF</span>
                    <span class="offer-urgency">${template?.urgency || 'Limited time'}</span>
                </div>
                ${template?.benefits ? `
                <ul class="offer-benefits">
                    ${template.benefits.map(benefit => `<li><i class="fas fa-check"></i> ${benefit}</li>`).join('')}
                </ul>
                ` : ''}
                <div class="offer-footer">
                    <button class="btn-primary offer-cta">
                        ${cta}
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <div class="offer-expires">
                        Expires: ${this.formatDate(offer.validUntil)}
                    </div>
                </div>
            </div>
        `;
        
        return offerDiv;
    }
    
    // Tracking methods
    
    trackOfferShown(offer, trigger) {
        if (window.lametayelTracking) {
            window.lametayelTracking.trackEvent('Offer Shown', {
                offer_id: offer.id,
                offer_type: offer.type,
                partner: offer.partner,
                destination: offer.destination,
                discount_percentage: offer.discount,
                personalization_reason: offer.personalizedReason,
                trigger: trigger,
                position: this.personalizedOffers.indexOf(offer) + 1
            });
        }
    }
    
    trackOfferClicked(offer) {
        if (window.lametayelTracking) {
            window.lametayelTracking.trackEvent('Offer Clicked', {
                offer_id: offer.id,
                offer_type: offer.type,
                partner: offer.partner,
                destination: offer.destination,
                discount_percentage: offer.discount,
                personalization_reason: offer.personalizedReason,
                click_source: 'dynamic_offers',
                estimated_commission: this.calculateCommission(offer)
            });
        }
    }
    
    // Utility methods
    
    deduplicateOffers(offers) {
        const seen = new Set();
        return offers.filter(offer => {
            const key = `${offer.type}_${offer.destination}_${offer.partner}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    
    getRandomDiscount(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    getOfferExpiry(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString();
    }
    
    formatDate(isoString) {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    calculateCommission(offer) {
        const partner = this.affiliatePartners[offer.partner];
        const estimatedBookingValue = this.estimateBookingValue(offer);
        return partner ? estimatedBookingValue * partner.commission : 0;
    }
    
    estimateBookingValue(offer) {
        // Rough estimates based on offer type
        const estimates = {
            hotel: 150,
            flight: 400,
            experience: 80,
            insurance: 100,
            car_rental: 200
        };
        return estimates[offer.type] || 100;
    }
}

// Add offers-specific CSS
const offersStyles = `
    .offer-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        border: 2px solid transparent;
    }
    
    .offer-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        border-color: var(--primary-orange);
    }
    
    .offer-header {
        position: relative;
        background: linear-gradient(135deg, var(--primary-orange), var(--primary-light));
        color: white;
        padding: 0.75rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .offer-flash {
        background: var(--accent-orange);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: bold;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    .offer-partner {
        font-size: 0.8rem;
        opacity: 0.9;
    }
    
    .offer-content {
        padding: 1.25rem;
        color: var(--text-primary) !important;
    }
    
    .offer-content h3, .offer-content p, .offer-content span {
        color: inherit !important;
    }
    
    .offer-icon {
        text-align: center;
        margin-bottom: 1rem;
    }
    
    .offer-icon i {
        font-size: 2.5rem;
        color: var(--primary-blue);
    }
    
    .offer-title {
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        line-height: 1.3;
        color: var(--text-primary) !important;
    }
    
    .offer-description {
        color: var(--text-secondary) !important;
        font-size: 0.9rem;
        margin-bottom: 1rem;
        line-height: 1.4;
    }
    
    .offer-discount {
        background: var(--bg-accent);
        border-radius: 8px;
        padding: 0.75rem;
        margin-bottom: 1rem;
        text-align: center;
    }
    
    .discount-amount {
        display: block;
        font-size: 1.3rem;
        font-weight: bold;
        color: var(--primary-orange) !important;
    }
    
    .offer-urgency {
        font-size: 0.8rem;
        color: var(--text-secondary) !important;
        font-style: italic;
    }
    
    .offer-benefits {
        list-style: none;
        margin-bottom: 1.25rem;
    }
    
    .offer-benefits li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        margin-bottom: 0.25rem;
        color: var(--text-secondary);
    }
    
    .offer-benefits i {
        color: var(--accent-green);
        font-size: 0.8rem;
    }
    
    .offer-footer {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .offer-cta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
    }
    
    .offer-expires {
        text-align: center;
        font-size: 0.8rem;
        color: var(--text-light);
    }
    
    .no-offers {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
    }
`;

// Inject styles
const offersStyleSheet = document.createElement('style');
offersStyleSheet.textContent = offersStyles;
document.head.appendChild(offersStyleSheet);

// Initialize offers manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.dynamicOffersManager = new DynamicOffersManager();
    console.log('Dynamic offers manager initialized');
});