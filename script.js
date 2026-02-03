// ============================================
// NOTE2U - Valentine Card Viewer
// Envelope + Flip Card with Smooth Animations
// JSON-based content from URL or API
// Cross-browser compatible
// ============================================

// Card data state
let cardData = {
    to: 'My Love',
    from: 'Someone Special',
    frontMessage: 'Will You Be My Valentine?',
    message: 'Every moment with you is magical. You make my heart skip a beat.',
    signOff: 'Forever Yours,',
    theme: 'classic', // classic, blush, gold, purple, blue
    stickers: []
};

// App state
const state = {
    isEnvelopeOpen: false,
    isCardFlipped: false,
    heartsActive: false
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Prevent zoom on iOS
    preventIOSZoom();

    // Fix 100vh issue
    fixViewportHeight();

    // Initialize floating hearts
    initFloatingHearts();

    // Load card data from URL params or JSON
    await loadCardData();

    // Apply card data to UI
    applyCardData();

    // Initialize interactions
    initEnvelope();
    initFlipCard();
    initShareModal();

    // Auto-open envelope after brief delay (looks nicer)
    setTimeout(() => {
        const hint = document.getElementById('tapHint');
        if (hint) hint.style.opacity = '1';
    }, 500);

    console.log('💕 NOTE2U Card Viewer loaded!');
});

// ============================================
// VIEWPORT FIXES
// ============================================
function preventIOSZoom() {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    // Prevent pinch zoom
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
}

function fixViewportHeight() {
    // Fix for mobile browser address bar
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();

    // Only update on orientation change, not resize (prevents keyboard issues)
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        // Only trigger on width change (orientation) not height (keyboard)
        if (Math.abs(window.innerWidth - lastWidth) > 100) {
            setVH();
            lastWidth = window.innerWidth;
        }
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
    });
}

// ============================================
// LOAD CARD DATA
// ============================================
async function loadCardData() {
    const params = new URLSearchParams(window.location.search);

    // Method 1: JSON URL parameter
    const jsonUrl = params.get('json');
    if (jsonUrl) {
        try {
            const response = await fetch(jsonUrl);
            if (response.ok) {
                const data = await response.json();
                mergeCardData(data);
                return;
            }
        } catch (e) {
            console.log('Failed to load JSON from URL:', e);
        }
    }

    // Method 2: Encoded card data in URL
    const encodedCard = params.get('card');
    if (encodedCard) {
        try {
            const decoded = JSON.parse(decodeURIComponent(atob(encodedCard)));
            mergeCardData(decoded);
            return;
        } catch (e) {
            console.log('Failed to decode card data:', e);
        }
    }

    // Method 3: Individual URL parameters
    if (params.has('to') || params.has('from') || params.has('message')) {
        mergeCardData({
            to: params.get('to'),
            from: params.get('from'),
            frontMessage: params.get('front'),
            message: params.get('message'),
            signOff: params.get('signoff'),
            theme: params.get('theme')
        });
    }
}

function mergeCardData(data) {
    if (!data) return;

    if (data.to) cardData.to = data.to;
    if (data.from) cardData.from = data.from;
    if (data.frontMessage || data.front) cardData.frontMessage = data.frontMessage || data.front;
    if (data.message || data.msg) cardData.message = data.message || data.msg;
    if (data.signOff || data.sign) cardData.signOff = data.signOff || data.sign;
    if (data.theme) cardData.theme = data.theme;
    if (data.stickers) cardData.stickers = data.stickers;
}

function applyCardData() {
    // Apply theme
    document.body.className = `theme-${cardData.theme}`;

    // Update envelope
    const envelopeTo = document.getElementById('envelopeTo');
    if (envelopeTo) envelopeTo.textContent = cardData.to;

    // Update card front
    const frontMessage = document.getElementById('frontMessage');
    if (frontMessage) frontMessage.textContent = cardData.frontMessage;

    // Update card inside
    const recipientName = document.getElementById('recipientName');
    if (recipientName) recipientName.textContent = cardData.to;

    const mainMessage = document.getElementById('mainMessage');
    if (mainMessage) mainMessage.innerHTML = cardData.message.replace(/\n/g, '<br>');

    const signOff = document.getElementById('signOff');
    if (signOff) signOff.textContent = cardData.signOff;

    const senderName = document.getElementById('senderName');
    if (senderName) senderName.textContent = cardData.from;

    // Apply stickers if any
    if (cardData.stickers && cardData.stickers.length > 0) {
        applyStickers();
    }
}

function applyStickers() {
    const frontLayer = document.getElementById('decorationsFront');
    const backLayer = document.getElementById('decorationsBack');

    cardData.stickers.forEach(sticker => {
        const el = document.createElement('div');
        el.className = 'placed-sticker';
        el.textContent = sticker.emoji;
        el.style.left = sticker.x + '%';
        el.style.top = sticker.y + '%';

        if (sticker.side === 'back' && backLayer) {
            backLayer.appendChild(el);
        } else if (frontLayer) {
            frontLayer.appendChild(el);
        }
    });
}

// ============================================
// FLOATING HEARTS
// ============================================
function initFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;

    const hearts = ['❤️', '💕', '💖', '💗', '💘', '💝', '💓', '💞'];
    const count = window.innerWidth < 768 ? 12 : 20;

    for (let i = 0; i < count; i++) {
        createHeart(container, hearts, i);
    }
}

function createHeart(container, hearts, index) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDelay = (Math.random() * 10) + 's';
    heart.style.animationDuration = (8 + Math.random() * 6) + 's';
    heart.style.fontSize = (14 + Math.random() * 18) + 'px';
    container.appendChild(heart);
}

function activateHearts() {
    if (state.heartsActive) return;
    state.heartsActive = true;
    document.body.classList.add('hearts-active');
}

// ============================================
// ENVELOPE INTERACTION
// ============================================
function initEnvelope() {
    const envelope = document.getElementById('envelope');
    const envelopeView = document.getElementById('envelopeView');
    const cardView = document.getElementById('cardView');

    if (!envelope) return;

    const openEnvelope = () => {
        if (state.isEnvelopeOpen) return;
        state.isEnvelopeOpen = true;

        // Add opening animation class
        envelope.classList.add('opening');

        // Hide tap hint
        const tapHint = document.getElementById('tapHint');
        if (tapHint) tapHint.style.opacity = '0';

        // Transition to card view after animation
        setTimeout(() => {
            envelopeView.classList.add('hidden');
            cardView.classList.remove('hidden');

            // Activate enhanced heart animation
            activateHearts();
        }, 1200);
    };

    // Touch and click support
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('touchend', (e) => {
        e.preventDefault();
        openEnvelope();
    });
}

// ============================================
// FLIP CARD INTERACTION
// ============================================
function initFlipCard() {
    const flipCard = document.getElementById('flipCard');
    if (!flipCard) return;

    const toggleFlip = () => {
        flipCard.classList.toggle('flipped');
        state.isCardFlipped = !state.isCardFlipped;

        // Update hint
        const flipHint = document.getElementById('flipHint');
        if (flipHint) {
            flipHint.textContent = state.isCardFlipped ? 'Tap to see front' : 'Tap card to flip';
        }
    };

    flipCard.addEventListener('click', toggleFlip);
    flipCard.addEventListener('touchend', (e) => {
        // Prevent double-trigger
        if (e.target.closest('.flip-card')) {
            e.preventDefault();
            toggleFlip();
        }
    });
}

// ============================================
// SHARE MODAL
// ============================================
function initShareModal() {
    const shareBtn = document.getElementById('shareBtn');
    const modal = document.getElementById('shareModal');
    const modalClose = document.getElementById('modalClose');
    const shareLink = document.getElementById('shareLink');

    // Generate share URL
    const shareUrl = generateShareUrl();
    if (shareLink) shareLink.value = shareUrl;

    // Open modal
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close on backdrop click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Share buttons
    initShareButtons(shareUrl);
}

function generateShareUrl() {
    const data = {
        to: cardData.to,
        from: cardData.from,
        front: cardData.frontMessage,
        message: cardData.message,
        sign: cardData.signOff,
        theme: cardData.theme
    };

    if (cardData.stickers && cardData.stickers.length > 0) {
        data.stickers = cardData.stickers;
    }

    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    return `${window.location.origin}${window.location.pathname}?card=${encoded}`;
}

function initShareButtons(shareUrl) {
    const shareText = `${cardData.from} sent you a Valentine's card! 💕`;
    const shareTitle = `Valentine's Card from ${cardData.from}`;

    // Native Share (Web Share API)
    const shareNative = document.getElementById('shareNative');
    if (shareNative) {
        if (navigator.share) {
            shareNative.classList.add('native-only');
            shareNative.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: shareTitle,
                        text: shareText,
                        url: shareUrl
                    });
                    closeModal();
                } catch (e) {
                    // User cancelled or error
                }
            });
        } else {
            shareNative.style.display = 'none';
        }
    }

    // WhatsApp
    const shareWhatsApp = document.getElementById('shareWhatsApp');
    if (shareWhatsApp) {
        shareWhatsApp.addEventListener('click', () => {
            const text = `${shareText}\n\n${shareUrl}`;
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
            closeModal();
        });
    }

    // SMS
    const shareSMS = document.getElementById('shareSMS');
    if (shareSMS) {
        shareSMS.addEventListener('click', () => {
            const text = `${shareText} ${shareUrl}`;
            // Use different formats for iOS and Android
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const smsUrl = isIOS
                ? `sms:&body=${encodeURIComponent(text)}`
                : `sms:?body=${encodeURIComponent(text)}`;
            window.location.href = smsUrl;
            closeModal();
        });
    }

    // Email
    const shareEmail = document.getElementById('shareEmail');
    if (shareEmail) {
        shareEmail.addEventListener('click', () => {
            const subject = shareTitle;
            const body = `${shareText}\n\nOpen your card here:\n${shareUrl}`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            closeModal();
        });
    }

    // Copy Link
    const copyLink = document.getElementById('copyLink');
    if (copyLink) {
        copyLink.addEventListener('click', () => {
            copyToClipboard(shareUrl);
        });
    }
}

function closeModal() {
    const modal = document.getElementById('shareModal');
    if (modal) modal.classList.remove('active');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Link copied! 📋');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
        document.execCommand('copy');
        showToast('Link copied! 📋');
    } catch (e) {
        showToast('Failed to copy', true);
    }

    document.body.removeChild(textarea);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.toggle('active', show);
    }
}

// ============================================
// JSON INTEGRATION EXAMPLE
// ============================================
/*
To use this card viewer with JSON:

Option 1: URL with encoded card data
-----------------------------------------
The card data is encoded in the URL:
https://yoursite.com/card/?card=BASE64_ENCODED_JSON

Example generating a link:
const cardData = {
    to: "Sarah",
    from: "Mike",
    front: "Be Mine!",
    message: "You're the best thing that ever happened to me.",
    sign: "All my love,",
    theme: "blush"
};
const encoded = btoa(encodeURIComponent(JSON.stringify(cardData)));
const url = `https://yoursite.com/card/?card=${encoded}`;


Option 2: Direct URL parameters
-----------------------------------------
https://yoursite.com/card/?to=Sarah&from=Mike&message=I+love+you&theme=gold


Option 3: External JSON file
-----------------------------------------
Host a JSON file and pass its URL:
https://yoursite.com/card/?json=https://api.example.com/card/12345.json

JSON file format:
{
    "to": "Sarah",
    "from": "Mike",
    "frontMessage": "Will You Be My Valentine?",
    "message": "Every moment with you is magical.",
    "signOff": "Forever Yours,",
    "theme": "classic",
    "stickers": [
        { "emoji": "❤️", "x": 10, "y": 15, "side": "front" },
        { "emoji": "💕", "x": 80, "y": 20, "side": "front" }
    ]
}

Available themes: classic, blush, gold, purple, blue
*/
