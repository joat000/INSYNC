// ============================================
// NOTE2U - Valentine Card Creator
// Optimized for iOS & Android
// Always-visible live preview
// ============================================

// State
const state = {
    template: 'romantic-red',
    font: "'Dancing Script', cursive",
    color: '#ffffff',
    effect: 'float',
    photoShape: 'heart',
    isFlipped: false,
    isEnvelopeOpen: false
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for shared card
    loadSharedCard();

    // Initialize all components
    initFloatingHearts();
    initViewToggle();
    initEnvelope();
    initCard();
    initTabs();
    initTextInputs();
    initQuickMessages();
    initTemplates();
    initFonts();
    initColors();
    initPhotoUpload();
    initStickers();
    initEffects();
    initShareModal();
    initResetButton();

    console.log('💕 NOTE2U loaded!');
});

// ============================================
// Floating Hearts Background
// ============================================
function initFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;

    const hearts = ['❤️', '💕', '💖', '💗', '💘', '💝'];

    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 12 + 's';
        heart.style.fontSize = (12 + Math.random() * 16) + 'px';
        container.appendChild(heart);
    }
}

// ============================================
// View Toggle (Envelope / Card)
// ============================================
function initViewToggle() {
    const btns = document.querySelectorAll('.view-btn-mini');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;

            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const envelopeWrapper = document.getElementById('envelopeWrapper');
            const cardWrapper = document.getElementById('cardWrapper');

            if (view === 'envelope') {
                envelopeWrapper.classList.remove('hidden');
                cardWrapper.classList.add('hidden');
            } else {
                envelopeWrapper.classList.add('hidden');
                cardWrapper.classList.remove('hidden');
            }
        });
    });
}

// ============================================
// Envelope
// ============================================
function initEnvelope() {
    const envelope = document.getElementById('envelope');
    if (!envelope) return;

    envelope.addEventListener('click', () => {
        if (state.isEnvelopeOpen) return;

        envelope.classList.add('open');
        state.isEnvelopeOpen = true;

        // Switch to card view after animation
        setTimeout(() => {
            document.querySelector('[data-view="card"]').click();
        }, 800);
    });
}

// ============================================
// Flip Card
// ============================================
function initCard() {
    const flipCard = document.getElementById('flipCard');
    if (!flipCard) return;

    // Apply default effect
    flipCard.classList.add('effect-' + state.effect);

    flipCard.addEventListener('click', () => {
        flipCard.classList.toggle('flipped');
        state.isFlipped = !state.isFlipped;
    });
}

// ============================================
// Editor Tabs
// ============================================
function initTabs() {
    const tabs = document.querySelectorAll('.editor-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(targetTab + 'Panel').classList.add('active');
        });
    });
}

// ============================================
// Text Inputs - Real-time Preview
// ============================================
function initTextInputs() {
    const inputs = {
        recipientName: ['displayRecipient', 'envelopeRecipient'],
        frontMessage: ['displayFrontMessage'],
        mainMessage: ['displayMessage'],
        signOff: ['displaySignOff'],
        senderName: ['displaySender']
    };

    Object.entries(inputs).forEach(([inputId, displayIds]) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', () => {
            const value = input.value;
            displayIds.forEach(displayId => {
                const el = document.getElementById(displayId);
                if (el) {
                    if (inputId === 'mainMessage') {
                        el.innerHTML = value.replace(/\n/g, '<br>');
                    } else {
                        el.textContent = value;
                    }
                }
            });
        });
    });
}

// ============================================
// Quick Messages
// ============================================
function initQuickMessages() {
    const btns = document.querySelectorAll('.quick-btn');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const front = btn.dataset.front;
            const msg = btn.dataset.msg;

            const frontInput = document.getElementById('frontMessage');
            const msgInput = document.getElementById('mainMessage');

            if (frontInput && front) {
                frontInput.value = front;
                frontInput.dispatchEvent(new Event('input'));
            }

            if (msgInput && msg) {
                msgInput.value = msg;
                msgInput.dispatchEvent(new Event('input'));
            }

            showToast('Message applied! 💕');
        });
    });
}

// ============================================
// Templates
// ============================================
function initTemplates() {
    const btns = document.querySelectorAll('.template-btn');
    const card = document.getElementById('card');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const template = btn.dataset.template;

            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            card.className = 'card ' + template;
            state.template = template;
        });
    });
}

// ============================================
// Fonts
// ============================================
function initFonts() {
    const btns = document.querySelectorAll('.font-btn');
    const frontContent = document.getElementById('cardFrontContent');
    const insideContent = document.getElementById('insideContent');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const font = btn.dataset.font;

            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (frontContent) frontContent.style.fontFamily = font;
            if (insideContent) insideContent.style.fontFamily = font;
            state.font = font;
        });
    });
}

// ============================================
// Colors
// ============================================
function initColors() {
    const btns = document.querySelectorAll('.color-btn');
    const frontContent = document.getElementById('cardFrontContent');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;

            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (frontContent) frontContent.style.color = color;
            state.color = color;
        });
    });
}

// ============================================
// Photo Upload
// ============================================
function initPhotoUpload() {
    const uploadBtn = document.getElementById('photoUploadBtn');
    const uploadInput = document.getElementById('photoUpload');
    const photoShapes = document.getElementById('photoShapes');
    const cardPhoto = document.getElementById('cardPhoto');

    if (!uploadBtn || !uploadInput) return;

    uploadBtn.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            cardPhoto.innerHTML = `<img src="${event.target.result}" alt="Photo">`;
            cardPhoto.classList.add('active', state.photoShape + '-shape');
            photoShapes.classList.remove('hidden');
            showToast('Photo added! 📷');
        };
        reader.readAsDataURL(file);
    });

    // Shape buttons
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const shape = btn.dataset.shape;

            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            cardPhoto.classList.remove('heart-shape', 'circle-shape', 'square-shape');
            cardPhoto.classList.add(shape + '-shape');
            state.photoShape = shape;
        });
    });
}

// ============================================
// Stickers
// ============================================
function initStickers() {
    const btns = document.querySelectorAll('.sticker-btn');
    const frontLayer = document.getElementById('decorationsLayerFront');
    const backLayer = document.getElementById('decorationsLayerBack');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const sticker = btn.dataset.sticker;
            const layer = state.isFlipped ? backLayer : frontLayer;

            if (!layer) return;

            const el = document.createElement('div');
            el.className = 'placed-sticker';
            el.textContent = sticker;
            el.style.left = (20 + Math.random() * 60) + '%';
            el.style.top = (20 + Math.random() * 60) + '%';

            // Long press to remove
            let pressTimer;
            el.addEventListener('touchstart', () => {
                pressTimer = setTimeout(() => {
                    el.remove();
                    showToast('Sticker removed');
                }, 500);
            });
            el.addEventListener('touchend', () => clearTimeout(pressTimer));
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                el.remove();
            });

            layer.appendChild(el);
            showToast('Sticker added! ✨');
        });
    });
}

// ============================================
// Effects
// ============================================
function initEffects() {
    const btns = document.querySelectorAll('.effect-btn');
    const flipCard = document.getElementById('flipCard');

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const effect = btn.dataset.effect;

            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            flipCard.classList.remove('effect-float', 'effect-pulse', 'effect-none');
            if (effect !== 'none') {
                flipCard.classList.add('effect-' + effect);
            }
            state.effect = effect;
        });
    });
}

// ============================================
// Share Modal & Functions
// ============================================
function initShareModal() {
    const shareBtn = document.getElementById('shareBtn');
    const modal = document.getElementById('shareModal');
    const closeBtn = document.getElementById('shareModalClose');

    if (shareBtn) {
        shareBtn.addEventListener('click', () => modal.classList.add('active'));
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // Share Link
    const shareLinkBtn = document.getElementById('shareLinkBtn');
    if (shareLinkBtn) {
        shareLinkBtn.addEventListener('click', shareCardLink);
    }

    // Share Image
    const shareImageBtn = document.getElementById('shareImageBtn');
    if (shareImageBtn) {
        shareImageBtn.addEventListener('click', shareAsImage);
    }

    // WhatsApp
    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', shareWhatsApp);
    }

    // Copy
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyCardText);
    }

    // Copy Link
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            const input = document.getElementById('generatedLink');
            copyToClipboard(input.value);
        });
    }
}

function generateShareURL() {
    const data = {
        t: state.template,
        f: state.font,
        c: state.color,
        rn: document.getElementById('recipientName')?.value || '',
        fm: document.getElementById('frontMessage')?.value || '',
        mm: document.getElementById('mainMessage')?.value || '',
        so: document.getElementById('signOff')?.value || '',
        sn: document.getElementById('senderName')?.value || ''
    };

    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    return window.location.origin + window.location.pathname + '?card=' + encoded;
}

function loadSharedCard() {
    const params = new URLSearchParams(window.location.search);
    const cardData = params.get('card');

    if (!cardData) return;

    try {
        const data = JSON.parse(decodeURIComponent(atob(cardData)));

        setTimeout(() => {
            // Restore template
            if (data.t) {
                state.template = data.t;
                document.getElementById('card').className = 'card ' + data.t;
            }

            // Restore font
            if (data.f) {
                state.font = data.f;
                const fc = document.getElementById('cardFrontContent');
                const ic = document.getElementById('insideContent');
                if (fc) fc.style.fontFamily = data.f;
                if (ic) ic.style.fontFamily = data.f;
            }

            // Restore color
            if (data.c) {
                state.color = data.c;
                const fc = document.getElementById('cardFrontContent');
                if (fc) fc.style.color = data.c;
            }

            // Restore text fields
            const fields = { recipientName: data.rn, frontMessage: data.fm, mainMessage: data.mm, signOff: data.so, senderName: data.sn };
            Object.entries(fields).forEach(([id, value]) => {
                if (value) {
                    const input = document.getElementById(id);
                    if (input) {
                        input.value = value;
                        input.dispatchEvent(new Event('input'));
                    }
                }
            });

            showToast('💌 Viewing shared card!');

            // Auto open envelope
            setTimeout(() => {
                const envelope = document.getElementById('envelope');
                if (envelope) envelope.click();
            }, 1000);

        }, 300);
    } catch (e) {
        console.log('Invalid card data');
    }
}

function shareCardLink() {
    const url = generateShareURL();
    const linkBox = document.getElementById('shareLinkBox');
    const linkInput = document.getElementById('generatedLink');

    linkInput.value = url;
    linkBox.classList.remove('hidden');

    if (navigator.share) {
        const sender = document.getElementById('senderName')?.value || 'Someone special';
        navigator.share({
            title: `Valentine's Card from ${sender}`,
            text: 'I made you a Valentine\'s card! 💕',
            url: url
        }).catch(() => {});
    }

    copyToClipboard(url);
}

function shareWhatsApp() {
    const msg = getCardText();
    const url = 'https://wa.me/?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
    document.getElementById('shareModal').classList.remove('active');
}

function copyCardText() {
    const text = getCardText();
    copyToClipboard(text);
    document.getElementById('shareModal').classList.remove('active');
}

function getCardText() {
    const to = document.getElementById('recipientName')?.value || 'My Love';
    const front = document.getElementById('frontMessage')?.value || 'Will You Be My Valentine?';
    const msg = document.getElementById('mainMessage')?.value || '';
    const sign = document.getElementById('signOff')?.value || 'Forever Yours';
    const from = document.getElementById('senderName')?.value || '';

    return `Dear ${to},\n\n"${front}"\n\n${msg}\n\n${sign}\n${from}\n\n💕 Created with NOTE2U`;
}

async function shareAsImage() {
    showLoading(true);

    const canvas = document.getElementById('cardCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 800;

    // Get colors
    const colors = {
        'romantic-red': ['#ff1744', '#d50000'],
        'soft-pink': ['#ff80ab', '#f8bbd0'],
        'elegant-gold': ['#ffd700', '#ff8f00'],
        'purple-dream': ['#9c27b0', '#7b1fa2'],
        'sunset-love': ['#ff5722', '#e91e63'],
        'midnight-romance': ['#1a237e', '#311b92'],
        'ocean-love': ['#0097a7', '#006064'],
        'neon-love': ['#e040fb', '#7c4dff']
    };

    const [c1, c2] = colors[state.template] || colors['romantic-red'];

    // Background
    const grad = ctx.createLinearGradient(0, 0, 600, 800);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 560, 760);

    // Hearts
    ctx.font = '30px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('💕', 40, 60);
    ctx.fillText('💕', 530, 60);

    // Content
    ctx.textAlign = 'center';
    ctx.fillStyle = state.color;

    const to = document.getElementById('recipientName')?.value || 'My Love';
    const front = document.getElementById('frontMessage')?.value || 'Will You Be My Valentine?';
    const msg = document.getElementById('mainMessage')?.value || '';
    const sign = document.getElementById('signOff')?.value || 'Forever Yours';
    const from = document.getElementById('senderName')?.value || '';

    ctx.font = '24px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('To:', 300, 100);

    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = state.color;
    ctx.fillText(to, 300, 150);

    ctx.font = 'bold 40px Arial';
    ctx.fillText(front, 300, 280);

    ctx.font = '60px Arial';
    ctx.fillText('❤️', 300, 380);

    ctx.font = '22px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    wrapText(ctx, msg, 300, 480, 500, 30);

    ctx.font = 'italic 28px Arial';
    ctx.fillStyle = state.color;
    ctx.fillText(sign, 300, 700);

    if (from) {
        ctx.font = 'bold 24px Arial';
        ctx.fillText(from, 300, 740);
    }

    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Created with 💕 NOTE2U', 300, 780);

    showLoading(false);

    // Convert to blob and share/download
    canvas.toBlob(async (blob) => {
        const file = new File([blob], 'valentine-card.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: 'Valentine Card' });
                document.getElementById('shareModal').classList.remove('active');
            } catch (e) {
                downloadCanvas(canvas);
            }
        } else {
            downloadCanvas(canvas);
        }
    }, 'image/png');
}

function downloadCanvas(canvas) {
    const link = document.createElement('a');
    link.download = 'valentine-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    document.getElementById('shareModal').classList.remove('active');
    showToast('Image saved! 📷');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';

    words.forEach(word => {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line) {
            ctx.fillText(line, x, y);
            line = word + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    });
    ctx.fillText(line, x, y);
}

// ============================================
// Reset
// ============================================
function initResetButton() {
    const btn = document.getElementById('resetBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (confirm('Start over?')) {
            location.href = location.pathname;
        }
    });
}

// ============================================
// Utilities
// ============================================
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.toggle('error', isError);
    toast.classList.add('active');

    setTimeout(() => toast.classList.remove('active'), 2500);
}

function showLoading(show) {
    const el = document.getElementById('loading');
    if (el) el.classList.toggle('active', show);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied! 📋');
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied! 📋');
    });
}
