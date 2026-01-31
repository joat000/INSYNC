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
    console.log('💕 Valentine Card Creator - Ultimate Edition');
    console.log(`Device: ${DeviceInfo.isMobile ? 'Mobile' : 'Desktop'}, iOS: ${DeviceInfo.isIOS}, Safari: ${DeviceInfo.isSafari}`);

    initAudioContext();
    createFloatingHearts();
    createSparkles();

    // Mobile-specific initialization
    if (DeviceInfo.isMobile || DeviceInfo.hasTouchScreen) {
        initializeMobileTabs();
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
    initializeShareFunctionality();
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

    // Update mobile tab buttons
    mobileTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    if (tabName === 'preview') {
        toolsPanel.classList.remove('active');
        previewArea.style.display = 'flex';
    } else {
        toolsPanel.classList.add('active');
        previewArea.style.display = 'none';

        // Show corresponding tab content
        tabContents.forEach(content => content.classList.remove('active'));

        const targetContent = document.getElementById(tabName + 'Tab');
        if (targetContent) {
            targetContent.classList.add('active');
        }
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
    });

    // Custom color picker
    if (customColor) {
        customColor.addEventListener('input', function() {
            const color = this.value;
            state.currentColor = color;
            if (cardFrontContent) cardFrontContent.style.color = color;

            // Remove active from all preset buttons
            colorOptions.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
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
    setTimeout(() => decoration.style.animation = '', 500);
}

function removeDecoration(decoration) {
    decoration.style.animation = 'pop 0.3s ease-out';
    setTimeout(() => decoration.remove(), 300);
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
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            document.getElementById('downloadModal').classList.add('active');
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (DeviceInfo.hasShareAPI && DeviceInfo.isMobile) {
                // Try native share first on mobile
                performNativeShare();
            } else {
                document.getElementById('shareModal').classList.add('active');
            }
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

// ============================================
// Modals
// ============================================

function initializeModals() {
    // Download modal
    const downloadModal = document.getElementById('downloadModal');
    const downloadModalClose = document.getElementById('downloadModalClose');
    const downloadPNG = document.getElementById('downloadPNG');
    const downloadJPG = document.getElementById('downloadJPG');
    const downloadHTML = document.getElementById('downloadHTML');

    if (downloadModalClose) {
        downloadModalClose.addEventListener('click', () => downloadModal.classList.remove('active'));
    }

    if (downloadModal) {
        downloadModal.addEventListener('click', (e) => {
            if (e.target === downloadModal) downloadModal.classList.remove('active');
        });
    }

    if (downloadPNG) downloadPNG.addEventListener('click', () => downloadCard('png'));
    if (downloadJPG) downloadJPG.addEventListener('click', () => downloadCard('jpeg'));
    if (downloadHTML) downloadHTML.addEventListener('click', downloadInteractiveHTML);

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
// Share Functionality
// ============================================

function initializeShareFunctionality() {
    const nativeShareBtn = document.getElementById('nativeShareBtn');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const shareOptions = document.querySelectorAll('.share-option');

    // Update share link input
    const shareLinkInput = document.getElementById('shareLinkInput');
    if (shareLinkInput) {
        shareLinkInput.value = window.location.href;
    }

    if (nativeShareBtn) {
        nativeShareBtn.addEventListener('click', performNativeShare);

        // Hide if not supported
        if (!DeviceInfo.hasShareAPI) {
            nativeShareBtn.style.display = 'none';
        }
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            copyToClipboard(window.location.href);
            showToast('Link copied! 📋');
        });
    }

    shareOptions.forEach(option => {
        option.addEventListener('click', function() {
            const shareType = this.dataset.share;
            handleShare(shareType);
        });
    });
}

async function performNativeShare() {
    if (!navigator.share) {
        document.getElementById('shareModal').classList.add('active');
        return;
    }

    try {
        // First try to share with image
        const card = document.getElementById('card');
        const canvas = await html2canvas(card, {
            scale: 2,
            backgroundColor: null,
            useCORS: true,
            allowTaint: true
        });

        canvas.toBlob(async (blob) => {
            if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'valentine-card.png', { type: 'image/png' })] })) {
                try {
                    await navigator.share({
                        title: '💕 A Valentine\'s Card For You',
                        text: 'I made you a special Valentine\'s card!',
                        files: [new File([blob], 'valentine-card.png', { type: 'image/png' })]
                    });
                    showToast('Shared successfully! 💕');
                    return;
                } catch (e) {
                    console.log('File share failed, trying text share');
                }
            }

            // Fallback to text share
            try {
                await navigator.share({
                    title: '💕 A Valentine\'s Card For You',
                    text: 'I made you a special Valentine\'s card! 💕',
                    url: window.location.href
                });
                showToast('Shared successfully! 💕');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    document.getElementById('shareModal').classList.add('active');
                }
            }
        }, 'image/png');
    } catch (error) {
        document.getElementById('shareModal').classList.add('active');
    }
}

function handleShare(type) {
    const message = encodeURIComponent('I made you a special Valentine\'s card! 💕');
    const url = encodeURIComponent(window.location.href);

    const shareUrls = {
        whatsapp: `https://wa.me/?text=${message}%20${url}`,
        telegram: `https://t.me/share/url?url=${url}&text=${message}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?text=${message}&url=${url}`,
        email: `mailto:?subject=${encodeURIComponent("A Valentine's Card For You 💕")}&body=${message}%0A%0A${url}`,
        sms: DeviceInfo.isIOS ? `sms:&body=${message}%20${url}` : `sms:?body=${message}%20${url}`
    };

    const shareUrl = shareUrls[type];
    if (shareUrl) {
        window.open(shareUrl, '_blank');
        document.getElementById('shareModal').classList.remove('active');
        trackInteraction('share_' + type);
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// ============================================
// Download Card (PNG/JPG) - iOS/Safari Compatible
// ============================================

async function downloadCard(format) {
    const card = document.getElementById('card');
    const downloadModal = document.getElementById('downloadModal');

    showLoading(true, 'Creating your image...');

    try {
        const canvas = await html2canvas(card, {
            scale: 2,
            backgroundColor: null,
            useCORS: true,
            allowTaint: true,
            logging: false,
            imageTimeout: 0
        });

        const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.92 : 1.0);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `valentine-card-${timestamp}.${format === 'jpeg' ? 'jpg' : 'png'}`;

        if (DeviceInfo.isIOS || DeviceInfo.isSafari) {
            // iOS/Safari: Open in new window for user to save
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Save Your Valentine Card</title>
                        <style>
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                                background: linear-gradient(135deg, #1a1a2e, #16213e);
                                min-height: 100vh;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                padding: 20px;
                                margin: 0;
                                color: white;
                            }
                            h2 { color: #ff4081; margin-bottom: 10px; }
                            p { color: #ffb6c1; margin-bottom: 20px; text-align: center; }
                            img {
                                max-width: 90%;
                                max-height: 60vh;
                                border-radius: 15px;
                                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                            }
                            .instructions {
                                margin-top: 20px;
                                padding: 15px;
                                background: rgba(255,255,255,0.1);
                                border-radius: 10px;
                                text-align: center;
                            }
                        </style>
                    </head>
                    <body>
                        <h2>💕 Your Valentine Card</h2>
                        <p>Long press on the image and tap "Save Image" or "Add to Photos"</p>
                        <img src="${dataUrl}" alt="Valentine Card">
                        <div class="instructions">
                            <p>📱 On iPhone/iPad: Long press → Save Image</p>
                            <p>🖥️ On Mac: Right click → Save Image As</p>
                        </div>
                    </body>
                    </html>
                `);
                newWindow.document.close();
                showToast('Image opened in new tab - save from there! 📷');
            } else {
                // Popup blocked - use data URL download
                downloadViaDataUrl(dataUrl, filename);
            }
        } else {
            // Android/Desktop: Direct download
            downloadViaDataUrl(dataUrl, filename);
        }

        if (downloadModal) downloadModal.classList.remove('active');
        createConfetti();
        trackInteraction('download_image');

    } catch (error) {
        console.error('Download failed:', error);
        showToast('Download failed. Please try again.', true);
    } finally {
        showLoading(false);
    }
}

function downloadViaDataUrl(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;

    // For Safari compatibility
    if (DeviceInfo.isSafari) {
        link.target = '_blank';
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Image downloaded! 📷');
}

// ============================================
// Interactive HTML Download - Safari/iOS Compatible
// ============================================

function downloadInteractiveHTML() {
    showLoading(true, 'Creating interactive card...');

    setTimeout(() => {
        try {
            const cardData = {
                template: state.currentTemplate,
                envelope: state.currentEnvelope,
                font: state.currentFont,
                color: state.currentColor,
                recipientName: document.getElementById('recipientName')?.value || 'My Love',
                frontMessage: document.getElementById('frontMessage')?.value || 'Will You Be My Valentine?',
                mainMessage: document.getElementById('mainMessage')?.value || 'Every moment with you feels like a beautiful dream.\nYou are my heart, my soul, my everything.\nWill you be my Valentine?',
                signOff: document.getElementById('signOff')?.value || 'Forever Yours ❤️',
                senderName: document.getElementById('senderName')?.value || '',
                photos: state.photoMemories,
                photoShape: state.photoShape,
                photoEditing: state.photoEditing,
                effects: state.effects,
                effect3D: state.effect3D,
                decorationsFront: getDecorations('decorationsLayerFront'),
                decorationsBack: getDecorations('decorationsLayerBack')
            };

            const htmlContent = generateSafariCompatibleHTML(cardData);
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const filename = `valentine-card-${Date.now()}.html`;

            if (DeviceInfo.isIOS) {
                // iOS: Create a data URL and open in new tab with instructions
                const reader = new FileReader();
                reader.onload = function() {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                        newWindow.document.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Save Your Interactive Card</title>
                                <style>
                                    body {
                                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                                        background: linear-gradient(135deg, #1a1a2e, #16213e);
                                        min-height: 100vh;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        justify-content: center;
                                        padding: 20px;
                                        margin: 0;
                                        color: white;
                                        text-align: center;
                                    }
                                    h2 { color: #ff4081; }
                                    .btn {
                                        display: inline-block;
                                        padding: 15px 30px;
                                        background: linear-gradient(135deg, #ff1744, #ff4081);
                                        color: white;
                                        text-decoration: none;
                                        border-radius: 25px;
                                        font-weight: bold;
                                        margin: 10px;
                                    }
                                    .instructions {
                                        background: rgba(255,255,255,0.1);
                                        padding: 20px;
                                        border-radius: 15px;
                                        margin: 20px 0;
                                    }
                                    .instructions p { margin: 10px 0; color: #ffb6c1; }
                                </style>
                            </head>
                            <body>
                                <h2>💕 Interactive Card Created!</h2>
                                <div class="instructions">
                                    <p>📱 <strong>To save on iPhone/iPad:</strong></p>
                                    <p>1. Tap the button below to view the card</p>
                                    <p>2. Tap the share icon (📤) at the bottom</p>
                                    <p>3. Scroll down and tap "Save to Files"</p>
                                    <p>4. Share the file with your loved one!</p>
                                </div>
                                <a class="btn" href="data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}" download="${filename}">
                                    📥 Download Card
                                </a>
                                <a class="btn" href="data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}" target="_blank">
                                    👁️ Preview Card
                                </a>
                            </body>
                            </html>
                        `);
                        newWindow.document.close();
                    }
                };
                reader.readAsDataURL(blob);
            } else if (DeviceInfo.isSafari && !DeviceInfo.isMobile) {
                // Desktop Safari
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 100);
            } else {
                // Chrome, Firefox, Edge, Android
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
            }

            document.getElementById('downloadModal')?.classList.remove('active');
            showToast('Interactive card ready! 💕');
            createConfetti();
            trackInteraction('download_html');

        } catch (error) {
            console.error('HTML download failed:', error);
            showToast('Download failed. Please try again.', true);
        } finally {
            showLoading(false);
        }
    }, 100);
}

function getDecorations(layerId) {
    const layer = document.getElementById(layerId);
    const decorations = [];

    if (layer) {
        layer.querySelectorAll('.placed-decoration').forEach(dec => {
            decorations.push({
                emoji: dec.textContent,
                left: dec.style.left,
                top: dec.style.top,
                fontSize: dec.style.fontSize || '1.5rem'
            });
        });
    }

    return decorations;
}

// ============================================
// Generate Safari/iOS Compatible HTML
// ============================================

function generateSafariCompatibleHTML(data) {
    // No photo on card - photos only shown in memories section

    const decorationsFrontHtml = data.decorationsFront.map(d =>
        `<div class="placed-decoration" style="left: ${d.left}; top: ${d.top}; font-size: ${d.fontSize};">${d.emoji}</div>`
    ).join('');

    const decorationsBackHtml = data.decorationsBack.map(d =>
        `<div class="placed-decoration" style="left: ${d.left}; top: ${d.top}; font-size: ${d.fontSize};">${d.emoji}</div>`
    ).join('');

    // Memories section - show all photos with captions (appears after flipping card)
    const memoriesHtml = data.photos.length > 0 ? `
        <div class="memories-section" id="memoriesSection">
            <h3>Our Memories 💕</h3>
            <div class="memories-grid">
                ${data.photos.map((p, i) => `
                    <div class="memory-card">
                        <div class="memory-photo">
                            <img src="${p.data}" alt="Memory ${i + 1}">
                        </div>
                        ${p.caption ? `<p class="memory-caption">${escapeHtml(p.caption)}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    // 3D effect class
    const effect3DClass = data.effect3D && data.effect3D !== 'none' ? `card-3d effect-${data.effect3D}` : '';
    const glowClass = data.effects.glow ? 'glow-effect' : '';
    const shadowClass = data.effects.shadow ? 'shadow-effect' : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#ff1744">
    <meta name="mobile-web-app-capable" content="yes">
    <title>💕 A Valentine's Card For You</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Quicksand:wght@400;600&family=Sacramento&family=Satisfy&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

        html, body {
            width: 100%;
            min-height: 100%;
            min-height: -webkit-fill-available;
            overflow-x: hidden;
        }

        body {
            font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            min-height: -webkit-fill-available;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            padding: max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
            color: white;
            -webkit-font-smoothing: antialiased;
        }

        .floating-hearts {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        }

        .floating-heart {
            position: absolute;
            animation: floatUp 15s linear infinite;
            opacity: 0.3;
        }

        @keyframes floatUp {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.3; }
            90% { opacity: 0.3; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }

        .container {
            text-align: center;
            z-index: 1;
            position: relative;
            width: 100%;
            max-width: 600px;
        }

        h1 {
            font-family: 'Great Vibes', cursive;
            font-size: clamp(2rem, 8vw, 3.5rem);
            color: #ff4081;
            margin-bottom: 30px;
            text-shadow: 0 0 20px rgba(255, 64, 129, 0.5);
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }

        .envelope-container {
            -webkit-perspective: 1500px;
            perspective: 1500px;
            margin-bottom: 20px;
        }

        .envelope {
            width: 100%;
            max-width: 500px;
            height: clamp(250px, 50vw, 350px);
            position: relative;
            cursor: pointer;
            -webkit-transform-style: preserve-3d;
            transform-style: preserve-3d;
            margin: 0 auto;
        }

        .envelope::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: ${getEnvelopeGradient(data.envelope)};
            border-radius: 10px;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
        }

        .envelope-flap {
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 55%;
            background: ${getEnvelopeFlapGradient(data.envelope)};
            -webkit-clip-path: polygon(0 0, 50% 100%, 100% 0);
            clip-path: polygon(0 0, 50% 100%, 100% 0);
            -webkit-transform-origin: top center;
            transform-origin: top center;
            -webkit-transition: -webkit-transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 10;
        }

        .envelope.open .envelope-flap {
            -webkit-transform: rotateX(-180deg);
            transform: rotateX(-180deg);
        }

        .wax-seal {
            position: absolute;
            bottom: -25px;
            left: 50%;
            -webkit-transform: translateX(-50%);
            transform: translateX(-50%);
            width: clamp(50px, 12vw, 70px);
            height: clamp(50px, 12vw, 70px);
            background: radial-gradient(circle at 30% 30%, #ff6b6b, #c41e3a, #8b0000);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: clamp(1.2rem, 4vw, 1.8rem);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
            z-index: 11;
        }

        .envelope.open .wax-seal {
            -webkit-animation: sealBreak 0.5s ease-out forwards;
            animation: sealBreak 0.5s ease-out forwards;
        }

        @keyframes sealBreak {
            0% { -webkit-transform: translateX(-50%) scale(1); transform: translateX(-50%) scale(1); opacity: 1; }
            100% { -webkit-transform: translateX(-50%) scale(0) rotate(360deg); transform: translateX(-50%) scale(0) rotate(360deg); opacity: 0; }
        }

        .envelope-front {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 5;
            padding: clamp(15px, 4vw, 30px);
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .envelope-address {
            background: rgba(255, 255, 255, 0.95);
            padding: clamp(15px, 3vw, 25px);
            border-radius: 5px;
            margin-top: clamp(40px, 10vw, 70px);
        }

        .to-label {
            font-family: 'Dancing Script', cursive;
            font-size: clamp(1rem, 3vw, 1.3rem);
            color: #666;
        }

        .recipient-address {
            font-family: 'Great Vibes', cursive;
            font-size: clamp(1.5rem, 5vw, 2.2rem);
            color: #c41e3a;
            display: block;
            margin-top: 5px;
        }

        .envelope-stamp {
            position: absolute;
            top: clamp(50px, 15vw, 80px);
            right: clamp(15px, 4vw, 30px);
            font-size: clamp(2rem, 6vw, 3rem);
            background: white;
            padding: clamp(6px, 2vw, 12px);
            border-radius: 5px;
            -webkit-transform: rotate(5deg);
            transform: rotate(5deg);
        }

        .hint {
            color: #ffb6c1;
            font-size: clamp(0.9rem, 3vw, 1.1rem);
            -webkit-animation: pulse 2s ease-in-out infinite;
            animation: pulse 2s ease-in-out infinite;
            margin-top: 15px;
        }

        .card-container {
            -webkit-perspective: 1500px;
            perspective: 1500px;
            display: none;
        }

        .card-container.active {
            display: block;
        }

        .flip-card {
            width: 100%;
            max-width: 550px;
            height: clamp(300px, 60vw, 420px);
            position: relative;
            -webkit-transform-style: preserve-3d;
            transform-style: preserve-3d;
            -webkit-transition: -webkit-transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            margin: 0 auto;
            touch-action: manipulation;
            -webkit-user-select: none;
            user-select: none;
        }

        .flip-card.flipped {
            -webkit-transform: rotateY(180deg);
            transform: rotateY(180deg);
        }

        /* Pause 3D animation when flipped to avoid conflicts */
        .flip-card.flipped.card-3d {
            -webkit-animation: none;
            animation: none;
        }

        .flip-card-front,
        .flip-card-back {
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 100%;
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            border-radius: 20px;
            overflow: hidden;
            pointer-events: none;
        }

        .flip-card-back {
            -webkit-transform: rotateY(180deg);
            transform: rotateY(180deg);
        }

        .card {
            width: 100%;
            height: 100%;
            background: ${getCardGradient(data.template)};
            border-radius: 20px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(255, 23, 68, 0.3), 0 0 30px rgba(255, 64, 129, 0.5);
            pointer-events: none;
        }

        .card-inside {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #fff5f5 0%, #ffe4e9 100%);
            border-radius: 20px;
            position: relative;
            pointer-events: none;
        }

        .heart-border {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 5;
            ${data.effects.heartBorder ? '' : 'display: none;'}
        }

        .corner-heart {
            position: absolute;
            font-size: clamp(1.3rem, 4vw, 2rem);
            -webkit-animation: cornerPulse 2s ease-in-out infinite;
            animation: cornerPulse 2s ease-in-out infinite;
        }

        .top-left { top: 12px; left: 12px; }
        .top-right { top: 12px; right: 12px; }
        .bottom-left { bottom: 12px; left: 12px; }
        .bottom-right { bottom: 12px; right: 12px; }

        @keyframes cornerPulse {
            0%, 100% { -webkit-transform: scale(1) rotate(-15deg); transform: scale(1) rotate(-15deg); }
            50% { -webkit-transform: scale(1.2) rotate(15deg); transform: scale(1.2) rotate(15deg); }
        }

        .sparkle-container {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            pointer-events: none;
            z-index: 3;
            ${data.effects.sparkle ? '' : 'display: none;'}
        }

        .sparkle {
            position: absolute;
            font-size: 1rem;
            -webkit-animation: sparkle 2s ease-in-out infinite;
            animation: sparkle 2s ease-in-out infinite;
            opacity: 0;
        }

        @keyframes sparkle {
            0%, 100% { opacity: 0; -webkit-transform: scale(0.5) rotate(0deg); transform: scale(0.5) rotate(0deg); }
            50% { opacity: 1; -webkit-transform: scale(1) rotate(180deg); transform: scale(1) rotate(180deg); }
        }

        .card-front-content {
            position: absolute;
            top: 50%;
            left: 50%;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            width: 85%;
            text-align: center;
            z-index: 4;
            color: ${data.color};
            font-family: ${data.font};
            ${data.effects.glow ? '-webkit-filter: drop-shadow(0 0 10px rgba(255,255,255,0.8)); filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));' : ''}
        }

        .front-message {
            font-size: clamp(1.5rem, 6vw, 2.8rem);
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            line-height: 1.3;
        }

        .inside-content {
            position: absolute;
            top: 50%;
            left: 50%;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            width: 85%;
            text-align: center;
            color: #c41e3a;
            font-family: ${data.font};
        }

        .recipient-name {
            font-size: clamp(1.5rem, 5vw, 2.2rem);
            font-weight: 700;
            margin-bottom: clamp(15px, 4vw, 25px);
            color: #ff4081;
        }

        .main-message {
            font-size: clamp(1rem, 3.5vw, 1.4rem);
            line-height: 1.7;
            margin-bottom: clamp(15px, 4vw, 30px);
            color: #444;
        }

        .sign-off {
            font-size: clamp(1.2rem, 4vw, 1.6rem);
            font-style: italic;
            color: #c41e3a;
        }

        .sender-name {
            font-size: clamp(1rem, 3vw, 1.3rem);
            margin-top: 10px;
            color: #ff4081;
        }

        .decorations-layer {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 6;
            pointer-events: none;
        }

        .placed-decoration {
            position: absolute;
        }

        .memories-hint {
            color: #ff9ff3;
            margin-top: 10px;
            animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        /* Memories Section */
        .memories-section {
            margin-top: 40px;
            padding: 25px;
            background: linear-gradient(135deg, rgba(255, 64, 129, 0.15) 0%, rgba(156, 39, 176, 0.15) 100%);
            border-radius: 25px;
            border: 2px solid rgba(255, 64, 129, 0.3);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .memories-section h3 {
            font-family: 'Great Vibes', cursive;
            color: #ff4081;
            margin-bottom: 20px;
            font-size: clamp(1.8rem, 6vw, 2.5rem);
            text-align: center;
            text-shadow: 0 0 20px rgba(255, 64, 129, 0.5);
        }

        .memories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 20px;
        }

        .memory-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 15px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .memory-card:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 15px 40px rgba(255, 64, 129, 0.3);
        }

        .memory-photo {
            width: 100%;
            aspect-ratio: 1;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            margin-bottom: 12px;
        }

        .memory-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .memory-card:hover .memory-photo img {
            transform: scale(1.05);
        }

        .memory-caption {
            font-size: clamp(0.85rem, 3vw, 1rem);
            color: #fff;
            font-style: italic;
            line-height: 1.5;
            padding: 8px;
            background: rgba(255, 64, 129, 0.2);
            border-radius: 10px;
            margin-top: 8px;
        }

        .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            -webkit-animation: confettiFall 3s ease-out forwards;
            animation: confettiFall 3s ease-out forwards;
            z-index: 9999;
            pointer-events: none;
        }

        @keyframes confettiFall {
            0% { opacity: 1; -webkit-transform: translateY(0) rotate(0deg); transform: translateY(0) rotate(0deg); }
            100% { opacity: 0; -webkit-transform: translateY(100vh) rotate(720deg); transform: translateY(100vh) rotate(720deg); }
        }

        .footer {
            margin-top: 30px;
            color: #ffb6c1;
            font-size: clamp(0.8rem, 2.5vw, 1rem);
        }

        /* 3D Card Effects */
        .card-3d {
            -webkit-transform-style: preserve-3d;
            transform-style: preserve-3d;
        }

        .card-3d.effect-float {
            -webkit-animation: cardFloat 4s ease-in-out infinite;
            animation: cardFloat 4s ease-in-out infinite;
        }

        @keyframes cardFloat {
            0%, 100% { -webkit-transform: translateY(0) rotateX(5deg); transform: translateY(0) rotateX(5deg); }
            50% { -webkit-transform: translateY(-15px) rotateX(0deg); transform: translateY(-15px) rotateX(0deg); }
        }

        .card-3d.effect-tilt {
            -webkit-animation: cardTilt 3s ease-in-out infinite;
            animation: cardTilt 3s ease-in-out infinite;
        }

        @keyframes cardTilt {
            0%, 100% { -webkit-transform: rotateY(-5deg) rotateX(5deg); transform: rotateY(-5deg) rotateX(5deg); }
            50% { -webkit-transform: rotateY(5deg) rotateX(-5deg); transform: rotateY(5deg) rotateX(-5deg); }
        }

        .card-3d.effect-pulse {
            -webkit-animation: cardPulse 2s ease-in-out infinite;
            animation: cardPulse 2s ease-in-out infinite;
        }

        @keyframes cardPulse {
            0%, 100% { -webkit-transform: scale(1); transform: scale(1); }
            50% { -webkit-transform: scale(1.05); transform: scale(1.05); }
        }

        .card-3d.effect-rotate {
            -webkit-animation: cardRotate 8s linear infinite;
            animation: cardRotate 8s linear infinite;
        }

        @keyframes cardRotate {
            0% { -webkit-transform: rotateY(0deg); transform: rotateY(0deg); }
            100% { -webkit-transform: rotateY(360deg); transform: rotateY(360deg); }
        }

        .card-3d.effect-swing {
            -webkit-animation: cardSwing 3s ease-in-out infinite;
            animation: cardSwing 3s ease-in-out infinite;
            -webkit-transform-origin: top center;
            transform-origin: top center;
        }

        @keyframes cardSwing {
            0%, 100% { -webkit-transform: rotate(-3deg); transform: rotate(-3deg); }
            50% { -webkit-transform: rotate(3deg); transform: rotate(3deg); }
        }

        .glow-effect {
            box-shadow: 0 0 30px rgba(255, 64, 129, 0.6), 0 0 60px rgba(255, 64, 129, 0.4);
        }

        .shadow-effect {
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }

        .glow-effect.shadow-effect {
            box-shadow: 0 0 30px rgba(255, 64, 129, 0.6), 0 0 60px rgba(255, 64, 129, 0.4), 0 25px 50px rgba(0, 0, 0, 0.4);
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                -webkit-animation-duration: 0.01ms !important;
                animation-duration: 0.01ms !important;
                -webkit-transition-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
        }
    </style>
</head>
<body>
    <div class="floating-hearts" id="floatingHearts"></div>

    <div class="container">
        <h1>💕 A Special Card For You 💕</h1>

        <div class="envelope-container" id="envelopeContainer">
            <div class="envelope" id="envelope" role="button" aria-label="Click to open envelope" tabindex="0">
                <div class="envelope-flap">
                    <div class="wax-seal">💕</div>
                </div>
                <div class="envelope-front">
                    <div class="envelope-address">
                        <span class="to-label">To:</span>
                        <span class="recipient-address">${escapeHtml(data.recipientName)}</span>
                    </div>
                    <div class="envelope-stamp">💌</div>
                </div>
            </div>
            <p class="hint">✨ Tap the envelope to open it! ✨</p>
        </div>

        <div class="card-container" id="cardContainer">
            <div class="flip-card ${effect3DClass} ${glowClass} ${shadowClass}" id="flipCard" role="button" aria-label="Click to flip card" tabindex="0">
                <div class="flip-card-front">
                    <div class="card">
                        <div class="heart-border">
                            <div class="corner-heart top-left">💕</div>
                            <div class="corner-heart top-right">💕</div>
                            <div class="corner-heart bottom-left">💕</div>
                            <div class="corner-heart bottom-right">💕</div>
                        </div>
                        <div class="sparkle-container" id="sparkleContainer"></div>
                        <div class="card-front-content">
                            <div class="front-message">${escapeHtml(data.frontMessage)}</div>
                        </div>
                        <div class="decorations-layer">${decorationsFrontHtml}</div>
                    </div>
                </div>
                <div class="flip-card-back">
                    <div class="card-inside">
                        <div class="inside-content">
                            <div class="recipient-name">${escapeHtml(data.recipientName)}</div>
                            <div class="main-message">${escapeHtml(data.mainMessage).replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}</div>
                            <div class="sign-off">${escapeHtml(data.signOff)}</div>
                            ${data.senderName ? `<div class="sender-name">${escapeHtml(data.senderName)}</div>` : ''}
                        </div>
                        <div class="decorations-layer">${decorationsBackHtml}</div>
                    </div>
                </div>
            </div>
            <p class="hint">✨ Tap the card to flip it! ✨</p>
            ${data.photos.length > 0 ? '<p class="hint memories-hint">📸 Scroll down for memories!</p>' : ''}
        </div>

        ${memoriesHtml}

        <div class="footer">
            <p>Made with 💕</p>
        </div>
    </div>

    <script>
        (function() {
            'use strict';

            // Create floating hearts
            var heartsContainer = document.getElementById('floatingHearts');
            var hearts = ['❤️', '💕', '💖', '💗', '💘', '💝', '🌹', '✨'];
            var numHearts = window.innerWidth < 768 ? 15 : 20;

            for (var i = 0; i < numHearts; i++) {
                var heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.left = Math.random() * 100 + '%';
                heart.style.animationDelay = Math.random() * 15 + 's';
                heart.style.animationDuration = (15 + Math.random() * 10) + 's';
                heart.style.fontSize = (15 + Math.random() * 20) + 'px';
                heartsContainer.appendChild(heart);
            }

            // Create sparkles
            var sparkleContainer = document.getElementById('sparkleContainer');
            if (sparkleContainer) {
                var sparkles = ['✨', '⭐', '💫', '✦'];
                for (var j = 0; j < 15; j++) {
                    var sparkle = document.createElement('div');
                    sparkle.className = 'sparkle';
                    sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
                    sparkle.style.left = Math.random() * 100 + '%';
                    sparkle.style.top = Math.random() * 100 + '%';
                    sparkle.style.animationDelay = Math.random() * 2 + 's';
                    sparkleContainer.appendChild(sparkle);
                }
            }

            // Confetti function
            function createConfetti() {
                var colors = ['#ff1744', '#ff4081', '#ffd700', '#ff6b6b', '#e91e63', '#9b59b6'];
                for (var k = 0; k < 50; k++) {
                    (function(index) {
                        setTimeout(function() {
                            var confetti = document.createElement('div');
                            confetti.className = 'confetti';
                            confetti.style.left = Math.random() * 100 + 'vw';
                            confetti.style.top = '-10px';
                            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                            confetti.style.width = (5 + Math.random() * 10) + 'px';
                            confetti.style.height = (5 + Math.random() * 10) + 'px';
                            document.body.appendChild(confetti);
                            setTimeout(function() { confetti.remove(); }, 3000);
                        }, index * 30);
                    })(k);
                }
            }

            // Envelope interaction
            var envelope = document.getElementById('envelope');
            var envelopeContainer = document.getElementById('envelopeContainer');
            var cardContainer = document.getElementById('cardContainer');
            var isEnvelopeOpen = false;

            function openEnvelope() {
                if (!isEnvelopeOpen) {
                    envelope.classList.add('open');
                    isEnvelopeOpen = true;
                    ${data.effects.confettiOnOpen ? 'setTimeout(createConfetti, 500);' : ''}
                    setTimeout(function() {
                        envelopeContainer.style.display = 'none';
                        cardContainer.classList.add('active');
                    }, 1200);
                }
            }

            envelope.addEventListener('click', openEnvelope);
            envelope.addEventListener('touchend', function(e) {
                e.preventDefault();
                openEnvelope();
            });
            envelope.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') openEnvelope();
            });

            // Card flip - improved touch handling
            var flipCard = document.getElementById('flipCard');
            var touchStartY = 0;
            var touchStartTime = 0;

            function flipCardFn(e) {
                if (e) e.stopPropagation();
                flipCard.classList.toggle('flipped');
            }

            // Click for desktop
            flipCard.addEventListener('click', function(e) {
                e.preventDefault();
                flipCardFn(e);
            });

            // Touch for mobile - use touchstart with short delay check
            flipCard.addEventListener('touchstart', function(e) {
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }, { passive: true });

            flipCard.addEventListener('touchend', function(e) {
                var touchEndY = e.changedTouches[0].clientY;
                var touchDuration = Date.now() - touchStartTime;
                var touchDistance = Math.abs(touchEndY - touchStartY);

                // Only flip if it was a tap (short duration, minimal movement)
                if (touchDuration < 300 && touchDistance < 20) {
                    e.preventDefault();
                    flipCardFn(e);
                }
            });

            flipCard.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') flipCardFn(e);
            });
        })();
    <\/script>
</body>
</html>`;
}

function getCardGradient(template) {
    const gradients = {
        'romantic-red': 'linear-gradient(135deg, #ff1744 0%, #ff4081 50%, #ff6b6b 100%)',
        'soft-pink': 'linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 50%, #ffe4e9 100%)',
        'elegant-gold': 'linear-gradient(135deg, #ffd700 0%, #ffec8b 50%, #fff8dc 100%)',
        'purple-dream': 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 50%, #6c5ce7 100%)',
        'sunset-love': 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
        'midnight-romance': 'linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #9b59b6 100%)'
    };
    return gradients[template] || gradients['romantic-red'];
}

function getEnvelopeGradient(envelope) {
    const gradients = {
        'classic-red': 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
        'pink-hearts': 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
        'golden-luxury': 'linear-gradient(135deg, #ffd700 0%, #daa520 100%)',
        'vintage-love': 'linear-gradient(135deg, #deb887 0%, #d2691e 100%)'
    };
    return gradients[envelope] || gradients['classic-red'];
}

function getEnvelopeFlapGradient(envelope) {
    const gradients = {
        'classic-red': 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
        'pink-hearts': 'linear-gradient(135deg, #ff85c1 0%, #ff5599 100%)',
        'golden-luxury': 'linear-gradient(135deg, #ffe066 0%, #ffc107 100%)',
        'vintage-love': 'linear-gradient(135deg, #e6c9a8 0%, #c8a97e 100%)'
    };
    return gradients[envelope] || gradients['classic-red'];
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
