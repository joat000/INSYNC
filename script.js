// ============================================
// NOTE2U - Valentine Card CREATOR
// Create cards and share them
// Mobile-first with live preview
// ============================================

// Card state
const cardState = {
    to: '',
    from: '',
    frontMessage: '',
    message: '',
    signOff: '',
    theme: 'classic',
    photo: null,
    stickers: []
};

// UI state
let isFlipped = false;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Prevent iOS zoom issues
    preventZoom();

    // Initialize floating hearts
    initFloatingHearts();

    // Initialize preview toggles
    initPreviewToggle();

    // Initialize flip card
    initFlipCard();

    // Initialize editor tabs
    initTabs();

    // Initialize text inputs with live preview
    initTextInputs();

    // Initialize quick messages
    initQuickMessages();

    // Initialize themes
    initThemes();

    // Initialize photo upload
    initPhotoUpload();

    // Initialize stickers
    initStickers();

    // Initialize share modal
    initShareModal();

    // Check if viewing shared card
    checkSharedCard();

    console.log('💕 NOTE2U Card Creator loaded!');
});

// ============================================
// PREVENT ZOOM (iOS)
// ============================================
function preventZoom() {
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
}

// ============================================
// FLOATING HEARTS
// ============================================
function initFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;

    const hearts = ['❤️', '💕', '💖', '💗', '💘', '💝'];
    const count = window.innerWidth < 600 ? 10 : 15;

    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 12 + 's';
        heart.style.animationDuration = (10 + Math.random() * 8) + 's';
        heart.style.fontSize = (12 + Math.random() * 16) + 'px';
        container.appendChild(heart);
    }
}

// ============================================
// PREVIEW TOGGLE (Envelope/Card)
// ============================================
function initPreviewToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const envelopePreview = document.getElementById('envelopePreview');
    const cardPreview = document.getElementById('cardPreview');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;

            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (view === 'envelope') {
                envelopePreview.classList.remove('hidden');
                cardPreview.classList.add('hidden');
            } else {
                envelopePreview.classList.add('hidden');
                cardPreview.classList.remove('hidden');
            }
        });
    });
}

// ============================================
// FLIP CARD
// ============================================
function initFlipCard() {
    const flipCard = document.getElementById('flipCard');
    if (!flipCard) return;

    flipCard.addEventListener('click', () => {
        flipCard.classList.toggle('flipped');
        isFlipped = !isFlipped;

        // Update hint
        const hint = document.querySelector('#cardPreview .preview-hint');
        if (hint) {
            hint.textContent = isFlipped ? 'Tap to see front' : 'Tap card to flip';
        }
    });
}

// ============================================
// EDITOR TABS
// ============================================
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
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
// TEXT INPUTS - Live Preview
// ============================================
function initTextInputs() {
    // To field
    const inputTo = document.getElementById('inputTo');
    if (inputTo) {
        inputTo.addEventListener('input', () => {
            cardState.to = inputTo.value;
            updatePreview('to', inputTo.value || 'My Love');
        });
    }

    // Front message
    const inputFront = document.getElementById('inputFront');
    if (inputFront) {
        inputFront.addEventListener('input', () => {
            cardState.frontMessage = inputFront.value;
            document.getElementById('frontMessage').textContent =
                inputFront.value || 'Will You Be My Valentine?';
        });
    }

    // Inside message
    const inputMessage = document.getElementById('inputMessage');
    if (inputMessage) {
        inputMessage.addEventListener('input', () => {
            cardState.message = inputMessage.value;
            document.getElementById('messageDisplay').innerHTML =
                (inputMessage.value || 'Your sweet message here...').replace(/\n/g, '<br>');
        });
    }

    // Sign off
    const inputSignOff = document.getElementById('inputSignOff');
    if (inputSignOff) {
        inputSignOff.addEventListener('input', () => {
            cardState.signOff = inputSignOff.value;
            document.getElementById('signOffDisplay').textContent =
                inputSignOff.value || 'Forever Yours,';
        });
    }

    // From field
    const inputFrom = document.getElementById('inputFrom');
    if (inputFrom) {
        inputFrom.addEventListener('input', () => {
            cardState.from = inputFrom.value;
            document.getElementById('senderDisplay').textContent =
                inputFrom.value || 'Your Name';
        });
    }
}

function updatePreview(field, value) {
    if (field === 'to') {
        document.getElementById('envelopeTo').textContent = value;
        document.getElementById('recipientDisplay').textContent = value;
    }
}

// ============================================
// QUICK MESSAGES
// ============================================
function initQuickMessages() {
    const quickBtns = document.querySelectorAll('.quick-btn');

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const front = btn.dataset.front;
            const msg = btn.dataset.msg;

            const inputFront = document.getElementById('inputFront');
            const inputMessage = document.getElementById('inputMessage');

            if (inputFront && front) {
                inputFront.value = front;
                inputFront.dispatchEvent(new Event('input'));
            }

            if (inputMessage && msg) {
                inputMessage.value = msg;
                inputMessage.dispatchEvent(new Event('input'));
            }

            showToast('Message applied! 💕');
        });
    });
}

// ============================================
// THEMES
// ============================================
function initThemes() {
    const themeBtns = document.querySelectorAll('.theme-btn');

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;

            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply theme to body
            document.body.className = `theme-${theme}`;
            cardState.theme = theme;

            showToast('Theme applied! ✨');
        });
    });
}

// ============================================
// PHOTO UPLOAD
// ============================================
function initPhotoUpload() {
    const uploadBtn = document.getElementById('uploadBtn');
    const photoInput = document.getElementById('photoInput');
    const removeBtn = document.getElementById('removePhotoBtn');
    const cardPhoto = document.getElementById('cardPhoto');

    if (uploadBtn && photoInput) {
        uploadBtn.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file
            if (!file.type.startsWith('image/')) {
                showToast('Please select an image', true);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showToast('Image too large (max 5MB)', true);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                cardState.photo = event.target.result;

                // Update preview
                cardPhoto.innerHTML = `<img src="${event.target.result}" alt="Photo">`;
                cardPhoto.classList.add('has-image');

                // Show remove button
                removeBtn.classList.remove('hidden');

                showToast('Photo added! 📷');
            };
            reader.readAsDataURL(file);
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            cardState.photo = null;
            cardPhoto.innerHTML = '<span class="photo-placeholder">💕</span>';
            cardPhoto.classList.remove('has-image');
            removeBtn.classList.add('hidden');
            photoInput.value = '';
            showToast('Photo removed');
        });
    }
}

// ============================================
// STICKERS
// ============================================
function initStickers() {
    const stickerBtns = document.querySelectorAll('.sticker-btn');
    const clearBtn = document.getElementById('clearStickers');

    stickerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.dataset.sticker;
            addSticker(emoji);
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearAllStickers();
        });
    }
}

function addSticker(emoji) {
    // Add to current visible side
    const layerId = isFlipped ? 'stickersLayerBack' : 'stickersLayerFront';
    const layer = document.getElementById(layerId);

    if (!layer) return;

    const sticker = document.createElement('div');
    sticker.className = 'placed-sticker';
    sticker.textContent = emoji;

    // Random position
    const x = 10 + Math.random() * 70;
    const y = 10 + Math.random() * 70;
    sticker.style.left = x + '%';
    sticker.style.top = y + '%';

    // Store in state
    cardState.stickers.push({
        emoji,
        x,
        y,
        side: isFlipped ? 'back' : 'front'
    });

    // Long press to remove
    let pressTimer;
    const startPress = () => {
        pressTimer = setTimeout(() => {
            sticker.remove();
            // Remove from state
            const idx = cardState.stickers.findIndex(s =>
                s.emoji === emoji && s.x === x && s.y === y
            );
            if (idx > -1) cardState.stickers.splice(idx, 1);
            showToast('Sticker removed');
        }, 500);
    };

    sticker.addEventListener('touchstart', startPress);
    sticker.addEventListener('mousedown', startPress);
    sticker.addEventListener('touchend', () => clearTimeout(pressTimer));
    sticker.addEventListener('mouseup', () => clearTimeout(pressTimer));
    sticker.addEventListener('mouseleave', () => clearTimeout(pressTimer));

    layer.appendChild(sticker);
    showToast('Sticker added! ✨');
}

function clearAllStickers() {
    document.getElementById('stickersLayerFront').innerHTML = '';
    document.getElementById('stickersLayerBack').innerHTML = '';
    cardState.stickers = [];
    showToast('All stickers cleared');
}

// ============================================
// SHARE MODAL
// ============================================
function initShareModal() {
    const shareBtn = document.getElementById('shareBtn');
    const modal = document.getElementById('shareModal');
    const closeBtn = document.getElementById('modalClose');
    const shareLink = document.getElementById('shareLink');

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            // Generate share URL
            const url = generateShareURL();
            if (shareLink) shareLink.value = url;

            modal.classList.add('active');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // Share buttons
    initShareButtons();
}

function generateShareURL() {
    const data = {
        to: cardState.to || 'My Love',
        from: cardState.from || 'Someone Special',
        front: cardState.frontMessage || 'Will You Be My Valentine?',
        msg: cardState.message || 'Every moment with you is magical.',
        sign: cardState.signOff || 'Forever Yours,',
        theme: cardState.theme
    };

    // Add stickers if any
    if (cardState.stickers.length > 0) {
        data.stickers = cardState.stickers;
    }

    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    return `${window.location.origin}${window.location.pathname}?card=${encoded}`;
}

function initShareButtons() {
    const shareUrl = () => document.getElementById('shareLink').value;
    const shareText = () => `${cardState.from || 'Someone special'} sent you a Valentine's card! 💕`;

    // Native Share (Web Share API)
    const shareNative = document.getElementById('shareNative');
    if (shareNative) {
        if (navigator.share) {
            shareNative.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: `Valentine's Card from ${cardState.from || 'Someone Special'}`,
                        text: shareText(),
                        url: shareUrl()
                    });
                    closeShareModal();
                } catch (e) {
                    // User cancelled
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
            const text = `${shareText()}\n\n${shareUrl()}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            closeShareModal();
        });
    }

    // SMS
    const shareSMS = document.getElementById('shareSMS');
    if (shareSMS) {
        shareSMS.addEventListener('click', () => {
            const text = `${shareText()} ${shareUrl()}`;
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const smsUrl = isIOS
                ? `sms:&body=${encodeURIComponent(text)}`
                : `sms:?body=${encodeURIComponent(text)}`;
            window.location.href = smsUrl;
            closeShareModal();
        });
    }

    // Email
    const shareEmail = document.getElementById('shareEmail');
    if (shareEmail) {
        shareEmail.addEventListener('click', () => {
            const subject = `Valentine's Card from ${cardState.from || 'Someone Special'}`;
            const body = `${shareText()}\n\nOpen your card here:\n${shareUrl()}`;
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            closeShareModal();
        });
    }

    // Copy Link
    const copyLink = document.getElementById('copyLink');
    if (copyLink) {
        copyLink.addEventListener('click', () => {
            copyToClipboard(shareUrl());
        });
    }
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
}

// ============================================
// CHECK FOR SHARED CARD (Viewer Mode)
// ============================================
function checkSharedCard() {
    const params = new URLSearchParams(window.location.search);
    const cardData = params.get('card');

    if (!cardData) return;

    try {
        const data = JSON.parse(decodeURIComponent(atob(cardData)));

        // Fill in the fields
        if (data.to) {
            document.getElementById('inputTo').value = data.to;
            updatePreview('to', data.to);
            cardState.to = data.to;
        }

        if (data.from) {
            document.getElementById('inputFrom').value = data.from;
            document.getElementById('senderDisplay').textContent = data.from;
            cardState.from = data.from;
        }

        if (data.front) {
            document.getElementById('inputFront').value = data.front;
            document.getElementById('frontMessage').textContent = data.front;
            cardState.frontMessage = data.front;
        }

        if (data.msg) {
            document.getElementById('inputMessage').value = data.msg;
            document.getElementById('messageDisplay').innerHTML = data.msg.replace(/\n/g, '<br>');
            cardState.message = data.msg;
        }

        if (data.sign) {
            document.getElementById('inputSignOff').value = data.sign;
            document.getElementById('signOffDisplay').textContent = data.sign;
            cardState.signOff = data.sign;
        }

        if (data.theme) {
            document.body.className = `theme-${data.theme}`;
            cardState.theme = data.theme;
            // Update theme buttons
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === data.theme);
            });
        }

        // Restore stickers
        if (data.stickers && data.stickers.length > 0) {
            data.stickers.forEach(s => {
                const layerId = s.side === 'back' ? 'stickersLayerBack' : 'stickersLayerFront';
                const layer = document.getElementById(layerId);
                if (layer) {
                    const sticker = document.createElement('div');
                    sticker.className = 'placed-sticker';
                    sticker.textContent = s.emoji;
                    sticker.style.left = s.x + '%';
                    sticker.style.top = s.y + '%';
                    layer.appendChild(sticker);
                }
            });
            cardState.stickers = data.stickers;
        }

        // Switch to card view
        document.querySelector('[data-view="card"]').click();

        showToast('💌 Viewing shared card!');

    } catch (e) {
        console.log('Invalid card data');
    }
}

// ============================================
// UTILITIES
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
    document.body.appendChild(textarea);
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
    }, 2500);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.toggle('active', show);
    }
}
