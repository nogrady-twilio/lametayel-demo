/* ===================================
   TRACKING UTILITIES
   UTM Parameters and Segment Helpers
   =================================== */

// UTM Parameter Generation and Management
class UTMManager {
    constructor() {
        this.campaigns = [
            { source: 'google', medium: 'cpc', campaign: 'travel_search', content: 'destinations' },
            { source: 'facebook', medium: 'social', campaign: 'summer_travel', content: 'video_ad' },
            { source: 'instagram', medium: 'social', campaign: 'influencer_partnership', content: 'story' },
            { source: 'booking_com', medium: 'affiliate', campaign: 'hotel_deals', content: 'banner' },
            { source: 'expedia', medium: 'affiliate', campaign: 'flight_offers', content: 'search_widget' },
            { source: 'email', medium: 'newsletter', campaign: 'weekly_digest', content: 'article_link' },
            { source: 'google', medium: 'organic', campaign: 'seo', content: 'blog_post' },
            { source: 'direct', medium: 'none', campaign: 'direct_traffic', content: 'homepage' },
            { source: 'pinterest', medium: 'social', campaign: 'travel_inspiration', content: 'pin' },
            { source: 'youtube', medium: 'video', campaign: 'travel_vlogs', content: 'description_link' }
        ];
        
        this.sessionUTM = null;
        this.initializeUTM();
    }
    
    initializeUTM() {
        // Check if UTM parameters already exist in session storage
        const existingUTM = sessionStorage.getItem('lametayel_utm');
        if (existingUTM) {
            this.sessionUTM = JSON.parse(existingUTM);
            return;
        }
        
        // Check URL for existing UTM parameters
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        
        if (utmSource) {
            // Use actual UTM parameters from URL
            this.sessionUTM = {
                utm_source: utmSource,
                utm_medium: urlParams.get('utm_medium') || 'unknown',
                utm_campaign: urlParams.get('utm_campaign') || 'unknown',
                utm_content: urlParams.get('utm_content') || 'unknown',
                utm_term: urlParams.get('utm_term') || 'unknown'
            };
        } else {
            // Generate random UTM parameters for demo
            const randomCampaign = this.campaigns[Math.floor(Math.random() * this.campaigns.length)];
            this.sessionUTM = {
                utm_source: randomCampaign.source,
                utm_medium: randomCampaign.medium,
                utm_campaign: randomCampaign.campaign,
                utm_content: randomCampaign.content,
                utm_term: this.generateRandomTerm()
            };
        }
        
        // Store in session storage for consistency across the session
        sessionStorage.setItem('lametayel_utm', JSON.stringify(this.sessionUTM));
        
        console.log('UTM Parameters initialized:', this.sessionUTM);
    }
    
    generateRandomTerm() {
        const terms = [
            'italy travel guide',
            'best destinations 2024',
            'budget travel tips',
            'luxury hotels',
            'adventure tours',
            'family vacation',
            'solo travel',
            'honeymoon destinations',
            'ski resorts',
            'beach vacation'
        ];
        return terms[Math.floor(Math.random() * terms.length)];
    }
    
    getUTMParams() {
        return this.sessionUTM || {};
    }
    
    // Update UTM parameters if user comes from a new campaign
    updateUTM(newParams) {
        this.sessionUTM = { ...this.sessionUTM, ...newParams };
        sessionStorage.setItem('lametayel_utm', JSON.stringify(this.sessionUTM));
    }
}

// User Traits Management
class UserTraitsManager {
    constructor() {
        this.traits = this.loadTraits();
        this.destinationsOfInterest = new Set(this.traits.destinations_of_interest || []);
        this.travelTypes = new Set(this.traits.travel_types || []);
        this.lastAffiliateClick = this.traits.last_affiliate_click || null;
        this.subscriberStatus = this.traits.subscriber_status || 'unknown';
        this.consentFlags = this.traits.consent_flags || {};
    }
    
    loadTraits() {
        const stored = localStorage.getItem('lametayel_user_traits');
        return stored ? JSON.parse(stored) : {};
    }
    
    saveTraits() {
        const traits = {
            destinations_of_interest: Array.from(this.destinationsOfInterest),
            travel_types: Array.from(this.travelTypes),
            last_affiliate_click: this.lastAffiliateClick,
            subscriber_status: this.subscriberStatus,
            consent_flags: this.consentFlags,
            last_updated: new Date().toISOString()
        };
        
        localStorage.setItem('lametayel_user_traits', JSON.stringify(traits));
        this.traits = traits;
        return traits;
    }
    
    addDestinationInterest(destination) {
        this.destinationsOfInterest.add(destination.toLowerCase());
        this.saveTraits();
    }
    
    addTravelType(travelType) {
        this.travelTypes.add(travelType.toLowerCase());
        this.saveTraits();
    }
    
    setLastAffiliateClick(affiliate, offer) {
        this.lastAffiliateClick = {
            affiliate: affiliate,
            offer: offer,
            timestamp: new Date().toISOString()
        };
        this.saveTraits();
    }
    
    setSubscriberStatus(status) {
        this.subscriberStatus = status;
        this.saveTraits();
    }
    
    updateConsent(type, granted) {
        this.consentFlags[type] = {
            granted: granted,
            timestamp: new Date().toISOString()
        };
        this.saveTraits();
    }
    
    getTraits() {
        return this.saveTraits();
    }
    
    // Infer travel intent based on user behavior
    inferTravelIntent() {
        const intent = {
            primary_destination: this.getMostViewedDestination(),
            travel_style: this.getDominantTravelStyle(),
            booking_likelihood: this.calculateBookingLikelihood(),
            price_sensitivity: this.inferPriceSensitivity()
        };
        
        return intent;
    }
    
    getMostViewedDestination() {
        if (this.destinationsOfInterest.size === 0) return 'unknown';
        return Array.from(this.destinationsOfInterest)[0]; // Most recent is first
    }
    
    getDominantTravelStyle() {
        if (this.travelTypes.size === 0) return 'unknown';
        return Array.from(this.travelTypes)[0]; // Most recent is first
    }
    
    calculateBookingLikelihood() {
        let score = 0;
        
        // More destination views = higher likelihood
        score += Math.min(this.destinationsOfInterest.size * 10, 50);
        
        // Recent affiliate clicks = higher likelihood
        if (this.lastAffiliateClick) {
            const daysSinceClick = (Date.now() - new Date(this.lastAffiliateClick.timestamp)) / (1000 * 60 * 60 * 24);
            if (daysSinceClick < 7) score += 30;
            else if (daysSinceClick < 30) score += 15;
        }
        
        // Newsletter subscriber = higher likelihood
        if (this.subscriberStatus === 'active') score += 20;
        
        return Math.min(score, 100);
    }
    
    inferPriceSensitivity() {
        // This could be enhanced based on actual behavior
        if (this.travelTypes.has('budget') || this.travelTypes.has('backpacking')) return 'high';
        if (this.travelTypes.has('luxury') || this.travelTypes.has('premium')) return 'low';
        return 'medium';
    }
}

// Enhanced Event Properties Generator
class EventPropertiesGenerator {
    constructor() {
        this.deviceInfo = this.getDeviceInfo();
        this.sessionInfo = this.getSessionInfo();
    }
    
    getDeviceInfo() {
        return {
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            device_type: this.getDeviceType(),
            browser: this.getBrowserInfo(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
        };
    }
    
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
    
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
    
    getSessionInfo() {
        return {
            session_id: this.getOrCreateSessionId(),
            session_start: this.getSessionStart(),
            page_views: this.getPageViewCount(),
            time_on_site: this.getTimeOnSite()
        };
    }
    
    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('lametayel_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('lametayel_session_id', sessionId);
        }
        return sessionId;
    }
    
    getSessionStart() {
        let sessionStart = sessionStorage.getItem('lametayel_session_start');
        if (!sessionStart) {
            sessionStart = new Date().toISOString();
            sessionStorage.setItem('lametayel_session_start', sessionStart);
        }
        return sessionStart;
    }
    
    getPageViewCount() {
        let count = parseInt(sessionStorage.getItem('lametayel_page_views') || '0');
        count++;
        sessionStorage.setItem('lametayel_page_views', count.toString());
        return count;
    }
    
    getTimeOnSite() {
        const sessionStart = new Date(this.getSessionStart());
        return Math.round((Date.now() - sessionStart.getTime()) / 1000); // seconds
    }
    
    // Generate base properties for all events (excludes UTM parameters)
    getBaseProperties() {
        return {
            // Page context
            page_title: document.title,
            page_url: window.location.href,
            page_path: window.location.pathname,
            page_referrer: document.referrer,
            page_search: window.location.search,
            
            // Device and browser
            ...this.deviceInfo,
            
            // Session info
            ...this.sessionInfo,
            
            // Note: UTM parameters only included in first page view
            // Note: User traits excluded from event properties per requirements
            
            // Timestamp
            timestamp: new Date().toISOString(),
            
            // Additional context
            is_returning_visitor: this.isReturningVisitor(),
            time_of_day: this.getTimeOfDay(),
            day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        };
    }
    
    // Generate properties for first page view (includes UTM parameters)
    getFirstPageViewProperties() {
        const utm = window.utmManager?.getUTMParams() || {};
        
        return {
            ...this.getBaseProperties(),
            // UTM parameters only for first page view
            ...utm
        };
    }
    
    isReturningVisitor() {
        const hasVisited = localStorage.getItem('lametayel_has_visited');
        if (!hasVisited) {
            localStorage.setItem('lametayel_has_visited', 'true');
            return false;
        }
        return true;
    }
    
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }
}

// Scroll tracking for engagement
class ScrollTracker {
    constructor() {
        this.milestones = [25, 50, 75, 100];
        this.reached = new Set();
        this.lastScrollTime = Date.now();
        this.setupScrollTracking();
    }
    
    setupScrollTracking() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.trackScroll();
            }, 150);
        });
    }
    
    trackScroll() {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        this.milestones.forEach(milestone => {
            if (scrollPercent >= milestone && !this.reached.has(milestone)) {
                this.reached.add(milestone);
                
                if (window.analytics) {
                    analytics.track('Page Scrolled', {
                        scroll_percentage: milestone,
                        ...window.eventProperties?.getBaseProperties()
                    });
                }
            }
        });
        
        this.lastScrollTime = Date.now();
    }
    
    getScrollEngagement() {
        const maxScroll = Math.max(...Array.from(this.reached), 0);
        return {
            max_scroll_percentage: maxScroll,
            scroll_milestones_reached: Array.from(this.reached).length,
            time_to_scroll: this.lastScrollTime - (new Date(window.eventProperties?.getSessionStart() || Date.now())).getTime()
        };
    }
}

// Initialize utilities when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tracking utilities
    window.utmManager = new UTMManager();
    window.userTraits = new UserTraitsManager();
    window.eventProperties = new EventPropertiesGenerator();
    window.scrollTracker = new ScrollTracker();
    
    console.log('Tracking utilities initialized');
    console.log('UTM Parameters:', window.utmManager.getUTMParams());
    console.log('User Traits:', window.userTraits.getTraits());
});