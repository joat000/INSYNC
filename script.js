// ============================================
// Valentine's Day Card Creator - Ultimate Edition
// Safari/iOS Compatible + Mobile/Desktop Adaptive
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ============================================
// Device Detection & Configuration
// ============================================

const DeviceInfo = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    hasShareAPI: navigator.share !== undefined,
    hasTouchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,

    update() {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
    },

    isTablet() {
        return this.hasTouchScreen && this.screenWidth >= 768 && this.screenWidth <= 1024;
    },

    isDesktop() {
        return this.screenWidth >= 768;
    }
};

// ============================================
// Global State
// ============================================

const state = {
    currentTemplate: 'romantic-red',
    currentEnvelope: 'classic-red',
    currentFont: "'Dancing Script', cursive",
    currentColor: '#ffffff',
    soundEnabled: true,
    currentView: 'envelope',
    isEnvelopeOpen: false,
    isCardFlipped: false,
    photoMemories: [], // Multiple photos support
    photoShape: 'heart',
    photoEditing: {
        zoom: 100,
        posX: 0,
        posY: 0,
        rotation: 0
    },
    decorationsFront: [],
    decorationsBack: [],
    effects: {
        sparkle: true,
        heartBorder: true,
        glow: false,
        shadow: true,
        floatingHearts: true,
        confettiOnOpen: true
    },
    effect3D: 'float', // float, tilt, pulse, rotate, swing, none
    music: 'romantic',
    animationSpeed: 1,
    interactionCount: 0, // Gamification
    achievements: [],
    currentMobileTab: 'preview'
};

// ============================================
// Auto-Save System
// ============================================

const STORAGE_KEY = 'note2u_card_draft';

function saveToLocalStorage() {
    try {
        const dataToSave = {
            state: {
                currentTemplate: state.currentTemplate,
                currentEnvelope: state.currentEnvelope,
                currentFont: state.currentFont,
                currentColor: state.currentColor,
                photoShape: state.photoShape,
                photoEditing: state.photoEditing,
                effect3D: state.effect3D,
                effects: state.effects
            },
            content: {
                recipientName: document.getElementById('recipientName')?.value || '',
                frontMessage: document.getElementById('frontMessage')?.value || '',
                mainMessage: document.getElementById('mainMessage')?.value || '',
                signOff: document.getElementById('signOff')?.value || '',
                senderName: document.getElementById('senderName')?.value || ''
            },
            photoMemories: state.photoMemories,
            savedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
        console.log('Could not save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return false;

        const data = JSON.parse(saved);

        // Check if saved data is less than 24 hours old
        if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(STORAGE_KEY);
            return false;
        }

        // Restore state
        if (data.state) {
            Object.assign(state, data.state);
        }

        // Restore content after DOM is ready
        setTimeout(() => {
            if (data.content) {
                const fields = ['recipientName', 'frontMessage', 'mainMessage', 'signOff', 'senderName'];
                fields.forEach(field => {
                    const el = document.getElementById(field);
                    if (el && data.content[field]) {
                        el.value = data.content[field];
                        // Trigger input event to update preview
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
            }

            // Restore photos
            if (data.photoMemories && data.photoMemories.length > 0) {
                state.photoMemories = data.photoMemories;
                updateMemoriesGallery();
                if (state.photoMemories.length > 0) {
                    updateCardPhoto(state.photoMemories[0].data);
                }
            }

            // Apply restored state to UI
            applyRestoredState();

            showToast('Draft restored! 📝');
        }, 500);

        return true;
    } catch (e) {
        console.log('Could not load from localStorage:', e);
        return false;
    }
}

function applyRestoredState() {
    // Apply template
    const templateCards = document.querySelectorAll('.template-card');
    templateCards.forEach(card => {
        card.classList.toggle('active', card.dataset.template === state.currentTemplate);
    });
    const cardEl = document.getElementById('card');
    if (cardEl) {
        cardEl.className = 'card ' + state.currentTemplate;
    }

    // Apply envelope
    const envelopeCards = document.querySelectorAll('.envelope-card');
    envelopeCards.forEach(card => {
        card.classList.toggle('active', card.dataset.envelope === state.currentEnvelope);
    });

    // Apply font
    const fontBtns = document.querySelectorAll('.font-btn');
    fontBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.font === state.currentFont);
    });
    const cardFrontContent = document.getElementById('cardFrontContent');
    const insideContent = document.getElementById('insideContent');
    if (cardFrontContent) cardFrontContent.style.fontFamily = state.currentFont;
    if (insideContent) insideContent.style.fontFamily = state.currentFont;

    // Apply color
    if (cardFrontContent) cardFrontContent.style.color = state.currentColor;

    // Apply 3D effect
    apply3DEffect();
}

function clearSavedDraft() {
    localStorage.removeItem(STORAGE_KEY);
}

// Debounced auto-save
const autoSave = debounce(saveToLocalStorage, 1000);

// ============================================
// Audio Context for Sounds (iOS Compatible)
// ============================================

let audioContext = null;
let audioUnlocked = false;

function initAudioContext() {
    if (audioContext) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // iOS requires user interaction to unlock audio
        if (DeviceInfo.isIOS) {
            const unlock = () => {
                if (audioUnlocked) return;

                const buffer = audioContext.createBuffer(1, 1, 22050);
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start(0);

                audioUnlocked = true;
                document.removeEventListener('touchstart', unlock);
                document.removeEventListener('click', unlock);
            };

            document.addEventListener('touchstart', unlock, { once: true });
            document.addEventListener('click', unlock, { once: true });
        } else {
            audioUnlocked = true;
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ============================================
// Initialize Application
// ============================================

function initializeApp() {
    console.log('💕 NOTE2U - Valentine Card Creator');
    console.log(`Device: ${DeviceInfo.isMobile ? 'Mobile' : 'Desktop'}, iOS: ${DeviceInfo.isIOS}, Safari: ${DeviceInfo.isSafari}`);

    // Load saved draft if exists
    loadFromLocalStorage();

    initAudioContext();
    createFloatingHearts();
    createSparkles();

    // Mobile-specific initialization
    if (DeviceInfo.isMobile || DeviceInfo.hasTouchScreen) {
        initializeMobileTabs();
        initializeMobileMiniPreview();
    }

    initializeTabs();
    initializeTemplates();
    initializeEnvelopes();
    initializeTextInputs();
    initializeFontOptions();
    initializeColorOptions();
    initializeDecorationCategories();
    initializeDecorations();
    initializeEffects();
    initializePhotoMemories(); // Enhanced photo system
    initializePhotoEditor(); // Photo cropping/positioning
    initialize3DEffects(); // 3D card effects
    initializeQuickMessages();
    initializeViewToggle();
    initializeEnvelope();
    initializeFlipCard();
    initializeActionButtons();
    initializeModals();
    initializeKeyboardShortcuts();
    initializeGamification();

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        DeviceInfo.update();
        handleResponsiveLayout();
        if (state.effects.sparkle) createSparkles();
    }, 250));

    // Handle orientation change for mobile
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            DeviceInfo.update();
            handleResponsiveLayout();
        }, 100);
    });

    handleResponsiveLayout();
    showWelcomeAnimation();
}

// ============================================
// Welcome Animation
// ============================================

function showWelcomeAnimation() {
    const hearts = ['💕', '💖', '💗', '💘', '💝'];
    hearts.forEach((heart, i) => {
        setTimeout(() => {
            createBurstEffect(heart, window.innerWidth / 2, window.innerHeight / 2);
        }, i * 150);
    });
}

// ============================================
// Responsive Layout Handler
// ============================================

function handleResponsiveLayout() {
    const toolsPanel = document.getElementById('toolsPanel');
    const mobileTabBar = document.getElementById('mobileTabBar');

    if (DeviceInfo.isDesktop()) {
        // Desktop: show tools panel, hide mobile tab bar
        toolsPanel.classList.add('active');
        if (mobileTabBar) mobileTabBar.style.display = 'none';
        document.body.classList.add('desktop-mode');
        document.body.classList.remove('mobile-mode');
    } else {
        // Mobile: use tabs, show mobile tab bar
        if (mobileTabBar) mobileTabBar.style.display = 'flex';
        document.body.classList.add('mobile-mode');
        document.body.classList.remove('desktop-mode');
        switchMobileTab('preview');
    }
}

// ============================================
// Mobile Tab Navigation
// ============================================

function initializeMobileTabs() {
    const mobileTabs = document.querySelectorAll('.mobile-tab');

    mobileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            switchMobileTab(targetTab);
            playSound('click');

            // Haptic feedback on supported devices
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });
}

function switchMobileTab(tabName) {
    state.currentMobileTab = tabName;
    const mobileTabs = document.querySelectorAll('.mobile-tab');
    const toolsPanel = document.getElementById('toolsPanel');
    const previewArea = document.getElementById('previewArea');
    const tabContents = document.querySelectorAll('.tab-content');
    const miniPreview = document.getElementById('mobileMiniPreview');

    // Update mobile tab buttons
    mobileTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    if (tabName === 'preview') {
        toolsPanel.classList.remove('active');
        previewArea.style.display = 'flex';
        // Hide mini preview when on full preview
        if (miniPreview) miniPreview.classList.remove('active');
    } else {
        toolsPanel.classList.add('active');
        previewArea.style.display = 'none';
        // Show mini preview when editing
        if (miniPreview) {
            miniPreview.classList.add('active');
            updateMiniPreview();
        }

        // Show corresponding tab content
        tabContents.forEach(content => content.classList.remove('active'));

        const targetContent = document.getElementById(tabName + 'Tab');
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }
}

// ============================================
// Mobile Mini Preview
// ============================================

function initializeMobileMiniPreview() {
    const miniPreviewCard = document.getElementById('miniPreviewCard');

    // Tap mini preview to go to full preview
    if (miniPreviewCard) {
        miniPreviewCard.addEventListener('click', () => {
            switchMobileTab('preview');
            playSound('click');
        });
    }

    // Update mini preview when text changes
    const textInputs = ['recipientName', 'frontMessage', 'mainMessage'];
    textInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', debounce(updateMiniPreview, 100));
        }
    });

    // Initial update
    updateMiniPreview();
}

function updateMiniPreview() {
    const miniCard = document.getElementById('miniCardDisplay');
    const miniMessage = miniCard?.querySelector('.mini-message');
    const card = document.getElementById('card');
    const cardFront = document.querySelector('.card-front');

    if (!miniCard) return;

    // Update mini card background to match selected theme
    if (cardFront) {
        const cardStyles = window.getComputedStyle(cardFront);
        miniCard.style.background = cardStyles.background || cardStyles.backgroundColor;
    }

    // Update mini message
    if (miniMessage) {
        const frontMsg = document.getElementById('frontMessage')?.value || 'Your card preview';
        miniMessage.textContent = frontMsg.substring(0, 40) + (frontMsg.length > 40 ? '...' : '');
        miniMessage.style.color = state.currentColor || '#ffffff';
        miniMessage.style.fontFamily = state.currentFont || "'Dancing Script', cursive";
    }

    // Clone stickers to mini preview
    const frontDecoLayer = document.getElementById('frontDecorationLayer');
    let miniStickers = miniCard.querySelector('.mini-stickers');

    if (!miniStickers) {
        miniStickers = document.createElement('div');
        miniStickers.className = 'mini-stickers';
        miniCard.appendChild(miniStickers);
    }

    miniStickers.innerHTML = '';

    if (frontDecoLayer) {
        const stickers = frontDecoLayer.querySelectorAll('.placed-decoration');
        stickers.forEach(sticker => {
            const miniSticker = document.createElement('span');
            miniSticker.textContent = sticker.textContent;
            miniSticker.style.position = 'absolute';
            // Scale down position to mini card size (roughly 1/4 scale)
            miniSticker.style.left = (parseFloat(sticker.style.left) / 4) + 'px';
            miniSticker.style.top = (parseFloat(sticker.style.top) / 4) + 'px';
            miniSticker.style.fontSize = '0.5rem';
            miniStickers.appendChild(miniSticker);
        });
    }
}

// ============================================
// Floating Hearts Background
// ============================================

function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;

    const hearts = ['❤️', '💕', '💖', '💗', '💘', '💝', '🌹', '✨', '💫'];
    const numHearts = DeviceInfo.isMobile ? 15 : 25;

    container.innerHTML = '';

    for (let i = 0; i < numHearts; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 15 + 's';
        heart.style.animationDuration = (15 + Math.random() * 10) + 's';
        heart.style.fontSize = (15 + Math.random() * 20) + 'px';
        container.appendChild(heart);
    }
}

// ============================================
// Sparkles Effect
// ============================================

function createSparkles() {
    const container = document.getElementById('sparkleContainer');
    if (!container) return;

    const sparkleChars = ['✨', '⭐', '💫', '✦', '★', '🌟'];
    const numSparkles = DeviceInfo.isMobile ? 12 : 20;

    container.innerHTML = '';

    for (let i = 0; i < numSparkles; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        sparkle.style.animationDuration = (1.5 + Math.random() * 1) + 's';
        container.appendChild(sparkle);
    }
}

// ============================================
// Tab Navigation (Desktop)
// ============================================

function initializeTabs() {
    const tabs = document.querySelectorAll('.tool-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetContent = document.getElementById(targetTab + 'Tab');
            if (targetContent) {
                targetContent.classList.add('active');
            }

            playSound('click');
        });
    });
}

// ============================================
// Template Selection
// ============================================

function initializeTemplates() {
    const templatesGrid = document.getElementById('templatesGrid');
    const card = document.getElementById('card');

    if (!templatesGrid) return;

    templatesGrid.addEventListener('click', function(e) {
        const templateCard = e.target.closest('.template-card');
        if (!templateCard) return;

        templatesGrid.querySelectorAll('.template-card').forEach(t => t.classList.remove('active'));
        templateCard.classList.add('active');

        const templateName = templateCard.dataset.template;
        state.currentTemplate = templateName;

        card.className = 'card ' + templateName;

        // Add visual feedback
        templateCard.style.transform = 'scale(0.95)';
        setTimeout(() => templateCard.style.transform = '', 150);

        playSound('click');
        trackInteraction('template_change');
        autoSave();
        updateMiniPreview();
    });
}

// ============================================
// Envelope Selection
// ============================================

function initializeEnvelopes() {
    const envelopeOptions = document.getElementById('envelopeOptions');
    const envelope = document.getElementById('envelope');

    if (!envelopeOptions) return;

    envelopeOptions.addEventListener('click', function(e) {
        const envelopeBtn = e.target.closest('.envelope-btn');
        if (!envelopeBtn) return;

        envelopeOptions.querySelectorAll('.envelope-btn').forEach(b => b.classList.remove('active'));
        envelopeBtn.classList.add('active');

        const envelopeName = envelopeBtn.dataset.envelope;
        state.currentEnvelope = envelopeName;

        envelope.className = 'envelope ' + envelopeName;

        playSound('click');
        autoSave();
        updateMiniPreview();
    });
}

// ============================================
// Text Inputs with Real-time Preview
// ============================================

function initializeTextInputs() {
    const inputs = {
        recipientName: { display: 'displayRecipient', envelope: 'envelopeRecipient', default: 'My Dearest Love' },
        frontMessage: { display: 'displayFrontMessage', default: 'Will You Be My Valentine?' },
        mainMessage: { display: 'displayMessage', default: 'Every moment with you feels like a beautiful dream.<br>You are my heart, my soul, my everything.<br>Will you be my Valentine?', isHtml: true },
        signOff: { display: 'displaySignOff', default: 'Forever Yours ❤️' },
        senderName: { display: 'displaySender', default: '' }
    };

    Object.keys(inputs).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (!input) return;

        const config = inputs[inputId];


        input.addEventListener('input', function() {
            const value = this.value || config.default;
            const displayEl = document.getElementById(config.display);

            if (displayEl) {
                if (config.isHtml) {
                    displayEl.innerHTML = value.replace(/\n/g, '<br>');
                } else {
                    displayEl.textContent = value;
                }
            }

            if (config.envelope) {
                const envelopeEl = document.getElementById(config.envelope);
                if (envelopeEl) envelopeEl.textContent = value;
            }

            // Auto-save on input
            autoSave();
        });

        // Auto-resize textareas
        if (input.tagName === 'TEXTAREA') {
            input.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 200) + 'px';
            });
        }
    });
}

// ============================================
// Quick Messages
// ============================================

function initializeQuickMessages() {
    const quickMessages = document.getElementById('quickMessages');
    if (!quickMessages) return;

    quickMessages.addEventListener('click', function(e) {
        const btn = e.target.closest('.quick-msg-btn');
        if (!btn) return;

        const frontMessage = btn.dataset.front;
        const message = btn.dataset.msg;

        const frontInput = document.getElementById('frontMessage');
        const mainInput = document.getElementById('mainMessage');
        const displayFront = document.getElementById('displayFrontMessage');
        const displayMessage = document.getElementById('displayMessage');

        if (frontInput && frontMessage) {
            frontInput.value = frontMessage;
            if (displayFront) displayFront.textContent = frontMessage;
        }

        if (mainInput && message) {
            mainInput.value = message;
            if (displayMessage) displayMessage.innerHTML = message.replace(/\n/g, '<br>');
        }

        // Visual feedback
        btn.style.transform = 'scale(0.95)';
        btn.style.background = 'rgba(255, 64, 129, 0.3)';
        setTimeout(() => {
            btn.style.transform = '';
            btn.style.background = '';
        }, 200);

        playSound('pop');
        showToast('Message applied! 💕');
        trackInteraction('quick_message');
    });
}

// ============================================
// Font Options
// ============================================

function initializeFontOptions() {
    const fontOptions = document.getElementById('fontOptions');
    const cardFrontContent = document.getElementById('cardFrontContent');
    const insideContent = document.getElementById('insideContent');

    if (!fontOptions) return;

    fontOptions.addEventListener('click', function(e) {
        const fontBtn = e.target.closest('.font-btn');
        if (!fontBtn) return;

        fontOptions.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
        fontBtn.classList.add('active');

        const fontFamily = fontBtn.dataset.font;
        state.currentFont = fontFamily;

        if (cardFrontContent) cardFrontContent.style.fontFamily = fontFamily;
        if (insideContent) insideContent.style.fontFamily = fontFamily;

        playSound('click');
        autoSave();
        updateMiniPreview();
    });
}

// ============================================
// Color Options
// ============================================

function initializeColorOptions() {
    const colorOptions = document.getElementById('colorOptions');
    const cardFrontContent = document.getElementById('cardFrontContent');
    const customColor = document.getElementById('customColor');

    if (!colorOptions) return;

    colorOptions.addEventListener('click', function(e) {
        const colorBtn = e.target.closest('.color-btn');
        if (!colorBtn) return;

        colorOptions.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        colorBtn.classList.add('active');

        const color = colorBtn.dataset.color;
        state.currentColor = color;
        if (cardFrontContent) cardFrontContent.style.color = color;

        // Update custom color picker to match
        if (customColor) customColor.value = color;

        playSound('click');
        autoSave();
        updateMiniPreview();
    });

    // Custom color picker
    if (customColor) {
        customColor.addEventListener('input', function() {
            const color = this.value;
            state.currentColor = color;
            if (cardFrontContent) cardFrontContent.style.color = color;

            // Remove active from all preset buttons
            colorOptions.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            autoSave();
            updateMiniPreview();
        });
    }
}

// ============================================
// Decoration Categories
// ============================================

function initializeDecorationCategories() {
    const categoryBtns = document.querySelectorAll('.deco-cat-btn');
    const decorationsGrid = document.getElementById('decorationsGrid');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.category;

            decorationsGrid.classList.remove('show-couples', 'show-flowers', 'show-animals', 'show-symbols', 'show-food');

            if (category !== 'hearts') {
                decorationsGrid.classList.add('show-' + category);
            }

            playSound('click');
        });
    });
}

// ============================================
// Decorations (Touch-Friendly Drag & Drop)
// ============================================

let draggedDecoration = null;
let offsetX, offsetY;
let longPressTimer = null;

function initializeDecorations() {
    const decorationsGrid = document.getElementById('decorationsGrid');
    const decorationsLayerFront = document.getElementById('decorationsLayerFront');
    const decorationsLayerBack = document.getElementById('decorationsLayerBack');

    if (!decorationsGrid) return;

    decorationsGrid.addEventListener('click', function(e) {
        const decorationBtn = e.target.closest('.decoration-btn');
        if (!decorationBtn) return;

        const decoration = decorationBtn.dataset.decoration;
        const layer = state.isCardFlipped ? decorationsLayerBack : decorationsLayerFront;
        addDecoration(decoration, layer);

        // Visual feedback
        decorationBtn.style.transform = 'scale(1.3)';
        setTimeout(() => decorationBtn.style.transform = '', 200);

        playSound('pop');
        trackInteraction('decoration_add');
    });

    // Setup drag and drop for both layers
    [decorationsLayerFront, decorationsLayerBack].forEach(layer => {
        if (!layer) return;

        // Mouse events
        layer.addEventListener('mousedown', handleDragStart);

        // Touch events
        layer.addEventListener('touchstart', handleTouchStart, { passive: false });

        // Long press to remove (mobile-friendly)
        layer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const decoration = e.target.closest('.placed-decoration');
            if (decoration) removeDecoration(decoration);
        });
    });

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
}

function addDecoration(emoji, layer) {
    if (!layer) return;

    const decoration = document.createElement('div');
    decoration.className = 'placed-decoration';
    decoration.textContent = emoji;

    const rect = layer.getBoundingClientRect();
    const maxX = rect.width - 40;
    const maxY = rect.height - 40;

    decoration.style.left = (20 + Math.random() * (maxX - 40)) + 'px';
    decoration.style.top = (20 + Math.random() * (maxY - 40)) + 'px';
    decoration.style.animation = 'bounceIn 0.5s ease-out';
    decoration.style.fontSize = (1.2 + Math.random() * 0.6) + 'rem';

    layer.appendChild(decoration);

    // Remove animation after it completes
    setTimeout(() => {
        decoration.style.animation = '';
        updateMiniPreview();
    }, 500);
}

function removeDecoration(decoration) {
    decoration.style.animation = 'pop 0.3s ease-out';
    setTimeout(() => {
        decoration.remove();
        updateMiniPreview();
    }, 300);
    playSound('pop');
}

function handleDragStart(e) {
    const decoration = e.target.closest('.placed-decoration');
    if (!decoration) return;

    draggedDecoration = decoration;
    draggedDecoration.classList.add('dragging');

    const rect = decoration.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
}

function handleDragMove(e) {
    if (!draggedDecoration) return;

    const layer = draggedDecoration.parentElement;
    const layerRect = layer.getBoundingClientRect();

    let newX = e.clientX - layerRect.left - offsetX;
    let newY = e.clientY - layerRect.top - offsetY;

    newX = Math.max(0, Math.min(newX, layerRect.width - 40));
    newY = Math.max(0, Math.min(newY, layerRect.height - 40));

    draggedDecoration.style.left = newX + 'px';
    draggedDecoration.style.top = newY + 'px';
}

function handleDragEnd() {
    if (draggedDecoration) {
        draggedDecoration.classList.remove('dragging');
        draggedDecoration = null;
        updateMiniPreview();
    }
    clearTimeout(longPressTimer);
}

function handleTouchStart(e) {
    const touch = e.touches[0];
    const decoration = e.target.closest('.placed-decoration');
    if (!decoration) return;

    e.preventDefault();
    draggedDecoration = decoration;
    draggedDecoration.classList.add('dragging');

    const rect = decoration.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;

    // Long press to remove
    longPressTimer = setTimeout(() => {
        if (draggedDecoration) {
            removeDecoration(draggedDecoration);
            draggedDecoration = null;
        }
    }, 600);
}

function handleTouchMove(e) {
    if (!draggedDecoration) return;
    e.preventDefault();

    clearTimeout(longPressTimer); // Cancel long press if moving

    const touch = e.touches[0];
    const layer = draggedDecoration.parentElement;
    const layerRect = layer.getBoundingClientRect();

    let newX = touch.clientX - layerRect.left - offsetX;
    let newY = touch.clientY - layerRect.top - offsetY;

    newX = Math.max(0, Math.min(newX, layerRect.width - 40));
    newY = Math.max(0, Math.min(newY, layerRect.height - 40));

    draggedDecoration.style.left = newX + 'px';
    draggedDecoration.style.top = newY + 'px';
}

function handleTouchEnd() {
    clearTimeout(longPressTimer);
    if (draggedDecoration) {
        draggedDecoration.classList.remove('dragging');
        draggedDecoration = null;
        updateMiniPreview();
    }
}

// ============================================
// Special Effects
// ============================================

function initializeEffects() {
    const sparkleEffect = document.getElementById('sparkleEffect');
    const heartBorder = document.getElementById('heartBorder');
    const confettiOnOpen = document.getElementById('confettiOnOpen');

    const sparkleContainer = document.getElementById('sparkleContainer');
    const heartBorderOverlay = document.getElementById('heartBorderOverlay');

    if (sparkleEffect) {
        sparkleEffect.addEventListener('change', function() {
            state.effects.sparkle = this.checked;
            if (sparkleContainer) {
                sparkleContainer.style.display = this.checked ? 'block' : 'none';
            }
            if (this.checked) createSparkles();
        });
    }

    if (heartBorder) {
        heartBorder.addEventListener('change', function() {
            state.effects.heartBorder = this.checked;
            if (heartBorderOverlay) {
                heartBorderOverlay.classList.toggle('hidden', !this.checked);
            }
        });
    }

    if (confettiOnOpen) {
        confettiOnOpen.addEventListener('change', function() {
            state.effects.confettiOnOpen = this.checked;
        });
    }
}

// ============================================
// Photo Memories (Multiple Photos Support)
// ============================================

function initializePhotoMemories() {
    const photoUploadBtn = document.getElementById('photoUploadBtn');
    const photoUpload = document.getElementById('photoUpload');
    const photoPreview = document.getElementById('photoPreview');
    const uploadedPhoto = document.getElementById('uploadedPhoto');
    const removePhoto = document.getElementById('removePhoto');
    const photoShapeOptions = document.getElementById('photoShapeOptions');
    const cardPhoto = document.getElementById('cardPhoto');

    if (!photoUploadBtn) return;

    photoUploadBtn.addEventListener('click', () => {
        photoUpload.click();
    });

    photoUpload.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const photoData = event.target.result;
                const photoId = Date.now() + index;

                // Store in memories with empty caption
                state.photoMemories.push({
                    id: photoId,
                    data: photoData,
                    shape: state.photoShape,
                    caption: ''
                });

                // Show first photo on card
                if (state.photoMemories.length === 1) {
                    updateCardPhoto(photoData);

                    if (uploadedPhoto) uploadedPhoto.src = photoData;
                    if (photoPreview) photoPreview.classList.add('active');
                    if (photoShapeOptions) photoShapeOptions.classList.add('active');
                }

                // Update memories gallery UI
                updateMemoriesGallery();

                playSound('pop');
                showToast(`Photo ${state.photoMemories.length} added! 📷`);
                trackInteraction('photo_upload');
                autoSave();
                updateMiniPreview();
            };
            reader.readAsDataURL(file);
        });
    });

    if (removePhoto) {
        removePhoto.addEventListener('click', function() {
            state.photoMemories = [];
            if (uploadedPhoto) uploadedPhoto.src = '';
            if (photoPreview) photoPreview.classList.remove('active');
            if (photoShapeOptions) photoShapeOptions.classList.remove('active');
            if (cardPhoto) {
                cardPhoto.innerHTML = '<div class="photo-placeholder">📷</div>';
                cardPhoto.classList.remove('active', 'heart-shape', 'circle-shape', 'square-shape');
            }
            if (photoUpload) photoUpload.value = '';
        });
    }

    // Shape buttons
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const shape = this.dataset.shape;
            state.photoShape = shape;

            if (cardPhoto) {
                cardPhoto.classList.remove('heart-shape', 'circle-shape', 'square-shape', 'diamond-shape', 'hexagon-shape');
                cardPhoto.classList.add(shape + '-shape');
            }

            playSound('click');
        });
    });

    // Show photo editor when photo is uploaded
    const editPhotoBtn = document.getElementById('editPhotoBtn');
    if (editPhotoBtn) {
        editPhotoBtn.addEventListener('click', function() {
            const photoEditor = document.getElementById('photoEditor');
            if (photoEditor && state.photoMemories.length > 0) {
                photoEditor.classList.add('active');
                updatePhotoEditorPreview();
            } else {
                showToast('Upload a photo first! 📷');
            }
        });
    }
}

function updateCardPhoto(photoData) {
    const cardPhoto = document.getElementById('cardPhoto');
    if (!cardPhoto) return;

    cardPhoto.innerHTML = `<img src="${photoData}" alt="Your photo" id="cardPhotoImg">`;
    cardPhoto.classList.add('active', state.photoShape + '-shape');

    // Apply current photo editing transforms
    applyPhotoTransforms();
}

function updateMemoriesGallery() {
    const memoriesGallery = document.getElementById('memoriesGallery');
    if (!memoriesGallery) return;

    memoriesGallery.innerHTML = '';

    state.photoMemories.forEach((memory, index) => {
        const memoryItem = document.createElement('div');
        memoryItem.className = 'memory-item';
        memoryItem.innerHTML = `
            <div class="memory-thumb">
                <img src="${memory.data}" alt="Memory ${index + 1}">
                <button class="remove-memory-btn" data-id="${memory.id}">×</button>
            </div>
            <input type="text" class="memory-caption" placeholder="Describe this memory..."
                   value="${memory.caption || ''}" data-id="${memory.id}">
        `;
        memoriesGallery.appendChild(memoryItem);
    });

    // Add event listeners for captions
    memoriesGallery.querySelectorAll('.memory-caption').forEach(input => {
        input.addEventListener('input', function() {
            const memoryId = parseInt(this.dataset.id);
            const memory = state.photoMemories.find(m => m.id === memoryId);
            if (memory) {
                memory.caption = this.value;
                autoSave();
            }
        });
    });

    // Add event listeners for remove buttons
    memoriesGallery.querySelectorAll('.remove-memory-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memoryId = parseInt(this.dataset.id);
            state.photoMemories = state.photoMemories.filter(m => m.id !== memoryId);
            updateMemoriesGallery();

            // Update card photo if we removed the first one
            if (state.photoMemories.length > 0) {
                updateCardPhoto(state.photoMemories[0].data);
            } else {
                const cardPhoto = document.getElementById('cardPhoto');
                const photoPreview = document.getElementById('photoPreview');
                const photoShapeOptions = document.getElementById('photoShapeOptions');
                if (cardPhoto) {
                    cardPhoto.innerHTML = '<div class="photo-placeholder">📷</div>';
                    cardPhoto.classList.remove('active', 'heart-shape', 'circle-shape', 'square-shape', 'diamond-shape', 'hexagon-shape');
                }
                if (photoPreview) photoPreview.classList.remove('active');
                if (photoShapeOptions) photoShapeOptions.classList.remove('active');
            }
            playSound('click');
            autoSave();
        });
    });

    // Show gallery if there are memories
    if (state.photoMemories.length > 0) {
        memoriesGallery.classList.add('active');
    } else {
        memoriesGallery.classList.remove('active');
    }
}

// ============================================
// Photo Editor (Position, Zoom, Rotation)
// ============================================

function initializePhotoEditor() {
    const photoZoom = document.getElementById('photoZoom');
    const photoPosX = document.getElementById('photoPosX');
    const photoPosY = document.getElementById('photoPosY');
    const photoRotation = document.getElementById('photoRotation');
    const photoEditor = document.getElementById('photoEditor');
    const applyPhotoBtn = document.getElementById('applyPhotoEdit');
    const resetPhotoBtn = document.getElementById('resetPhotoEdit');

    // Photo zoom control
    if (photoZoom) {
        photoZoom.addEventListener('input', function() {
            state.photoEditing.zoom = parseInt(this.value);
            applyPhotoTransforms();
            updatePhotoEditorPreview();
        });
    }

    // Photo position X control
    if (photoPosX) {
        photoPosX.addEventListener('input', function() {
            state.photoEditing.posX = parseInt(this.value);
            applyPhotoTransforms();
            updatePhotoEditorPreview();
        });
    }

    // Photo position Y control
    if (photoPosY) {
        photoPosY.addEventListener('input', function() {
            state.photoEditing.posY = parseInt(this.value);
            applyPhotoTransforms();
            updatePhotoEditorPreview();
        });
    }

    // Photo rotation control
    if (photoRotation) {
        photoRotation.addEventListener('input', function() {
            state.photoEditing.rotation = parseInt(this.value);
            applyPhotoTransforms();
            updatePhotoEditorPreview();
        });
    }

    // Apply button
    if (applyPhotoBtn) {
        applyPhotoBtn.addEventListener('click', function() {
            if (photoEditor) photoEditor.classList.remove('active');
            playSound('pop');
            showToast('Photo adjustments applied! 📸');
        });
    }

    // Reset button
    if (resetPhotoBtn) {
        resetPhotoBtn.addEventListener('click', function() {
            state.photoEditing = { zoom: 100, posX: 0, posY: 0, rotation: 0 };

            if (photoZoom) photoZoom.value = 100;
            if (photoPosX) photoPosX.value = 0;
            if (photoPosY) photoPosY.value = 0;
            if (photoRotation) photoRotation.value = 0;

            applyPhotoTransforms();
            updatePhotoEditorPreview();
            playSound('click');
        });
    }
}

function applyPhotoTransforms() {
    const cardPhotoImg = document.getElementById('cardPhotoImg');
    const editorPhoto = document.getElementById('uploadedPhoto');

    const transform = `
        scale(${state.photoEditing.zoom / 100})
        translateX(${state.photoEditing.posX}%)
        translateY(${state.photoEditing.posY}%)
        rotate(${state.photoEditing.rotation}deg)
    `;

    if (cardPhotoImg) {
        cardPhotoImg.style.transform = transform;
        cardPhotoImg.style.transformOrigin = 'center center';
    }

    if (editorPhoto) {
        editorPhoto.style.transform = transform;
        editorPhoto.style.transformOrigin = 'center center';
    }
}

function updatePhotoEditorPreview() {
    const editorPhoto = document.getElementById('uploadedPhoto');
    if (editorPhoto && state.photoMemories.length > 0) {
        editorPhoto.src = state.photoMemories[0].data;
    }
}

// ============================================
// 3D Effects System
// ============================================

function initialize3DEffects() {
    const effectButtons = document.querySelectorAll('.effect-3d-btn');
    const glowToggle = document.getElementById('glowEffect');
    const shadowToggle = document.getElementById('shadowEffect');
    const flipCard = document.getElementById('flipCard');

    // 3D Effect buttons
    effectButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            effectButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const effect = this.dataset.effect;
            state.effect3D = effect;

            apply3DEffect();
            playSound('click');
            trackInteraction('3d_effect_change');
        });
    });

    // Glow toggle
    if (glowToggle) {
        glowToggle.addEventListener('change', function() {
            state.effects.glow = this.checked;
            if (flipCard) {
                flipCard.classList.toggle('glow-effect', this.checked);
            }
            playSound('click');
        });
    }

    // Shadow toggle
    if (shadowToggle) {
        shadowToggle.addEventListener('change', function() {
            state.effects.shadow = this.checked;
            if (flipCard) {
                flipCard.classList.toggle('shadow-effect', this.checked);
            }
            playSound('click');
        });
    }

    // Initialize with default effect
    apply3DEffect();
}

function apply3DEffect() {
    const flipCard = document.getElementById('flipCard');
    if (!flipCard) return;

    // Remove all 3D effect classes
    flipCard.classList.remove(
        'card-3d',
        'effect-float',
        'effect-tilt',
        'effect-pulse',
        'effect-rotate',
        'effect-swing',
        'effect-none'
    );

    // Add 3D container class
    flipCard.classList.add('card-3d');

    // Add selected effect
    if (state.effect3D !== 'none') {
        flipCard.classList.add('effect-' + state.effect3D);
    } else {
        flipCard.classList.add('effect-none');
    }
}

// ============================================
// View Toggle
// ============================================

function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const envelopeContainer = document.getElementById('envelopeContainer');
    const cardContainer = document.getElementById('cardContainer');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const view = this.dataset.view;
            state.currentView = view;

            if (view === 'envelope') {
                envelopeContainer.classList.remove('hidden');
                cardContainer.classList.remove('active');
            } else {
                envelopeContainer.classList.add('hidden');
                cardContainer.classList.add('active');
            }

            playSound('click');
        });
    });
}

// ============================================
// Envelope Interaction
// ============================================

function initializeEnvelope() {
    const envelope = document.getElementById('envelope');
    const envelopeContainer = document.getElementById('envelopeContainer');
    const cardContainer = document.getElementById('cardContainer');

    if (!envelope) return;

    envelope.addEventListener('click', function() {
        if (!state.isEnvelopeOpen) {
            this.classList.add('open');
            state.isEnvelopeOpen = true;

            playSound('envelope');

            if (state.effects.confettiOnOpen) {
                setTimeout(createConfetti, 500);
            }

            // Transition to card
            setTimeout(() => {
                if (envelopeContainer) envelopeContainer.classList.add('hidden');
                if (cardContainer) cardContainer.classList.add('active');

                document.querySelectorAll('.view-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.view === 'card');
                });
                state.currentView = 'card';
            }, 1200);

            trackInteraction('envelope_open');
        }
    });
}

// ============================================
// Flip Card Interaction
// ============================================

function initializeFlipCard() {
    const flipCard = document.getElementById('flipCard');

    if (!flipCard) return;

    flipCard.addEventListener('click', function() {
        this.classList.toggle('flipped');
        state.isCardFlipped = !state.isCardFlipped;
        playSound('flip');
        trackInteraction('card_flip');
    });
}

// ============================================
// Action Buttons
// ============================================

function initializeActionButtons() {
    const shareBtn = document.getElementById('shareBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            openShareModal();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to start over? All changes will be lost.')) {
                resetCard();
            }
        });
    }
}

function openShareModal() {
    const senderName = document.getElementById('senderName')?.value || 'Someone special';
    const recipientName = document.getElementById('recipientName')?.value || 'Your Love';

    // Update modal with details
    const shareFromName = document.getElementById('shareFromName');
    const shareToName = document.getElementById('shareToName');
    if (shareFromName) shareFromName.textContent = senderName;
    if (shareToName) shareToName.textContent = recipientName;

    // Show/hide native share button based on support
    const nativeShareBtn = document.getElementById('nativeShareBtn');
    if (nativeShareBtn) {
        nativeShareBtn.style.display = navigator.share ? 'flex' : 'none';
    }

    document.getElementById('shareModal').classList.add('active');
}

// ============================================
// Modals
// ============================================

function initializeModals() {
    // Share modal
    const shareModal = document.getElementById('shareModal');
    const shareModalClose = document.getElementById('shareModalClose');

    if (shareModalClose) {
        shareModalClose.addEventListener('click', () => shareModal.classList.remove('active'));
    }

    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) shareModal.classList.remove('active');
        });
    }

    // Share option buttons
    const nativeShareBtn = document.getElementById('nativeShareBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const smsBtn = document.getElementById('smsBtn');
    const emailBtn = document.getElementById('emailBtn');

    if (nativeShareBtn) {
        nativeShareBtn.addEventListener('click', shareNative);
    }
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyCardMessage);
    }
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', shareWhatsApp);
    }
    if (smsBtn) {
        smsBtn.addEventListener('click', shareSMS);
    }
    if (emailBtn) {
        emailBtn.addEventListener('click', shareEmail);
    }

    // Success modal
    const successModal = document.getElementById('successModal');
    const successCloseBtn = document.getElementById('successCloseBtn');

    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', () => {
            successModal.classList.remove('active');
            resetCard();
        });
    }

    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) successModal.classList.remove('active');
        });
    }

    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

// ============================================
// Universal Share System
// Works on Android, iOS, and Desktop
// ============================================

function getCardMessage() {
    const senderName = document.getElementById('senderName')?.value || 'Someone special';
    const recipientName = document.getElementById('recipientName')?.value || 'My Love';
    const frontMessage = document.getElementById('frontMessage')?.value || 'Will You Be My Valentine?';
    const mainMessage = document.getElementById('mainMessage')?.value || '';
    const signOff = document.getElementById('signOff')?.value || 'Forever Yours';

    return `Dear ${recipientName},

${senderName} has sent you a Valentine's card!

"${frontMessage}"

${mainMessage}

${signOff},
${senderName}

Created with love on NOTE2U`;
}

// Native Share API (Android & iOS)
async function shareNative() {
    const message = getCardMessage();
    const senderName = document.getElementById('senderName')?.value || 'Someone special';

    try {
        await navigator.share({
            title: `Valentine's Card from ${senderName}`,
            text: message
        });

        document.getElementById('shareModal').classList.remove('active');
        showToast('Shared successfully! 💕');
        createConfetti();
        trackInteraction('share_native');
    } catch (err) {
        if (err.name !== 'AbortError') {
            console.log('Share failed:', err);
            showToast('Share cancelled', true);
        }
    }
}

// Copy message to clipboard
async function copyCardMessage() {
    const message = getCardMessage();

    try {
        await navigator.clipboard.writeText(message);
        document.getElementById('shareModal').classList.remove('active');
        showToast('Message copied! Paste it anywhere 💕');
        trackInteraction('share_copy');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = message;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.getElementById('shareModal').classList.remove('active');
            showToast('Message copied! Paste it anywhere 💕');
            trackInteraction('share_copy');
        } catch (e) {
            showToast('Could not copy. Please try again.', true);
        }
        document.body.removeChild(textArea);
    }
}

// Share via WhatsApp
function shareWhatsApp() {
    const message = getCardMessage();
    const encodedMessage = encodeURIComponent(message);

    // Use WhatsApp API URL (works on both mobile and desktop)
    const whatsappUrl = DeviceInfo.isMobile
        ? `whatsapp://send?text=${encodedMessage}`
        : `https://web.whatsapp.com/send?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    document.getElementById('shareModal').classList.remove('active');
    showToast('Opening WhatsApp... 💬');
    trackInteraction('share_whatsapp');
}

// Share via SMS
function shareSMS() {
    const message = getCardMessage();
    const encodedMessage = encodeURIComponent(message);

    // SMS URL format differs between iOS and Android
    const smsUrl = DeviceInfo.isIOS
        ? `sms:&body=${encodedMessage}`
        : `sms:?body=${encodedMessage}`;

    window.location.href = smsUrl;

    document.getElementById('shareModal').classList.remove('active');
    showToast('Opening Messages... 💬');
    trackInteraction('share_sms');
}

// Share via Email
function shareEmail() {
    const senderName = document.getElementById('senderName')?.value || 'Someone special';
    const message = getCardMessage();

    const subject = encodeURIComponent(`A Valentine's Card from ${senderName}`);
    const body = encodeURIComponent(message);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;

    document.getElementById('shareModal').classList.remove('active');
    showToast('Opening Email... 📧');
    trackInteraction('share_email');
}

// ============================================
// Reset Card
// ============================================

function resetCard() {
    // Reset all inputs
    const inputs = ['recipientName', 'frontMessage', 'mainMessage', 'signOff', 'senderName'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Reset displays
    const defaults = {
        displayRecipient: 'My Dearest Love',
        displayFrontMessage: 'Will You Be My Valentine?',
        displayMessage: 'Every moment with you feels like a beautiful dream.<br>You are my heart, my soul, my everything.<br>Will you be my Valentine?',
        displaySignOff: 'Forever Yours ❤️',
        displaySender: '',
        envelopeRecipient: 'My Love'
    };

    Object.keys(defaults).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'displayMessage') {
                el.innerHTML = defaults[id];
            } else {
                el.textContent = defaults[id];
            }
        }
    });

    // Reset template
    document.querySelectorAll('.template-card').forEach((t, i) => t.classList.toggle('active', i === 0));
    const card = document.getElementById('card');
    if (card) card.className = 'card romantic-red';
    state.currentTemplate = 'romantic-red';

    // Reset envelope
    document.querySelectorAll('.envelope-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    const envelope = document.getElementById('envelope');
    if (envelope) {
        envelope.className = 'envelope classic-red';
        envelope.classList.remove('open');
    }
    state.currentEnvelope = 'classic-red';
    state.isEnvelopeOpen = false;

    // Reset photos
    state.photoMemories = [];
    state.photoEditing = { zoom: 100, posX: 0, posY: 0, rotation: 0 };
    const photoPreview = document.getElementById('photoPreview');
    const photoShapeOptions = document.getElementById('photoShapeOptions');
    const cardPhoto = document.getElementById('cardPhoto');
    const photoUpload = document.getElementById('photoUpload');
    const photoEditor = document.getElementById('photoEditor');

    if (photoPreview) photoPreview.classList.remove('active');
    if (photoShapeOptions) photoShapeOptions.classList.remove('active');
    if (photoEditor) photoEditor.classList.remove('active');
    if (cardPhoto) {
        cardPhoto.innerHTML = '<div class="photo-placeholder">📷</div>';
        cardPhoto.classList.remove('active', 'heart-shape', 'circle-shape', 'square-shape', 'diamond-shape', 'hexagon-shape');
    }
    if (photoUpload) photoUpload.value = '';

    // Reset photo editor sliders
    const photoZoom = document.getElementById('photoZoom');
    const photoPosX = document.getElementById('photoPosX');
    const photoPosY = document.getElementById('photoPosY');
    const photoRotation = document.getElementById('photoRotation');
    if (photoZoom) photoZoom.value = 100;
    if (photoPosX) photoPosX.value = 0;
    if (photoPosY) photoPosY.value = 0;
    if (photoRotation) photoRotation.value = 0;

    // Reset 3D effects
    state.effect3D = 'float';
    apply3DEffect();

    // Clear decorations
    const decorationsLayerFront = document.getElementById('decorationsLayerFront');
    const decorationsLayerBack = document.getElementById('decorationsLayerBack');
    if (decorationsLayerFront) decorationsLayerFront.innerHTML = '';
    if (decorationsLayerBack) decorationsLayerBack.innerHTML = '';

    // Reset card flip
    const flipCard = document.getElementById('flipCard');
    if (flipCard) flipCard.classList.remove('flipped');
    state.isCardFlipped = false;

    // Reset view
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === 'envelope');
    });

    const envelopeContainer = document.getElementById('envelopeContainer');
    const cardContainer = document.getElementById('cardContainer');
    if (envelopeContainer) envelopeContainer.classList.remove('hidden');
    if (cardContainer) cardContainer.classList.remove('active');
    state.currentView = 'envelope';

    createSparkles();
    playSound('pop');
    showToast('Card reset! Start fresh 💕');
}

// ============================================
// Confetti Effect
// ============================================

function createConfetti() {
    const colors = ['#ff1744', '#ff4081', '#ffd700', '#ff6b6b', '#e91e63', '#9b59b6', '#00cec9'];
    const shapes = ['circle', 'square', 'heart'];
    const numConfetti = DeviceInfo.isMobile ? 40 : 60;

    for (let i = 0; i < numConfetti; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];

            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            if (shape === 'circle') {
                confetti.style.borderRadius = '50%';
            } else if (shape === 'heart') {
                confetti.innerHTML = '❤️';
                confetti.style.background = 'transparent';
                confetti.style.fontSize = '15px';
            }

            confetti.style.width = (5 + Math.random() * 10) + 'px';
            confetti.style.height = (5 + Math.random() * 10) + 'px';

            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// ============================================
// Burst Effect
// ============================================

function createBurstEffect(emoji, x, y) {
    const numParticles = 8;

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.textContent = emoji;
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-size: 1.5rem;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.6s ease-out;
        `;

        document.body.appendChild(particle);

        const angle = (i / numParticles) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;

        requestAnimationFrame(() => {
            particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
            particle.style.opacity = '0';
        });

        setTimeout(() => particle.remove(), 600);
    }
}

// ============================================
// Sound Effects (iOS/Safari Compatible)
// ============================================

function playSound(type) {
    if (!state.soundEnabled || !audioUnlocked || !audioContext) return;

    try {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const sounds = {
            click: { freq: 800, duration: 0.08, type: 'sine' },
            pop: { freq: 600, duration: 0.12, type: 'sine' },
            envelope: { freq: 400, duration: 0.25, type: 'triangle' },
            flip: { freq: 500, duration: 0.15, type: 'sine' }
        };

        const sound = sounds[type] || sounds.click;

        oscillator.frequency.value = sound.freq;
        oscillator.type = sound.type;

        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration);

        oscillator.start(now);
        oscillator.stop(now + sound.duration);
    } catch (e) {
        // Silent fail for audio issues
    }
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'toast active' + (isError ? ' error' : '');

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ============================================
// Loading Overlay
// ============================================

function showLoading(show, message = 'Creating your card...') {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;

    const textEl = overlay.querySelector('p');
    if (textEl) textEl.textContent = message;

    overlay.classList.toggle('active', show);
}

// ============================================
// Keyboard Shortcuts
// ============================================

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }

        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            document.getElementById('downloadBtn')?.click();
        }
    });
}

// ============================================
// Gamification & Tracking
// ============================================

function initializeGamification() {
    // Track first interactions
    const achievements = [
        { id: 'first_template', name: 'Style Master', condition: () => state.interactionCount > 0 },
        { id: 'photo_uploaded', name: 'Memory Keeper', condition: () => state.photoMemories.length > 0 },
        { id: 'card_flipped', name: 'Curious One', condition: () => state.isCardFlipped }
    ];

    state.achievements = achievements;
}

function trackInteraction(action) {
    state.interactionCount++;

    // Check for achievements
    state.achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.condition()) {
            achievement.unlocked = true;
            createBurstEffect('⭐', window.innerWidth / 2, window.innerHeight / 2);
        }
    });
}

// ============================================
// Utility Functions
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Add Dynamic Styles
// ============================================

const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes bounceIn {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); opacity: 1; }
    }

    @keyframes pop {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
        100% { transform: scale(0); opacity: 0; }
    }

    .placed-decoration.dragging {
        transform: scale(1.2);
        z-index: 100;
        opacity: 0.8;
    }

    .success-notification {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #00c853, #69f0ae);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 4000;
        animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(50px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }

    .mobile-mode .preview-area {
        padding-bottom: 100px;
    }

    .desktop-mode .mobile-tab-bar {
        display: none !important;
    }
`;
document.head.appendChild(dynamicStyles);

console.log('💕 Valentine Card Creator loaded successfully!');
console.log('Made with ❤️ for lovers everywhere');
