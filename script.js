// NOTE2U - Clean Card Creator

// State
const state = {
    theme: 'red',
    emoji: '💕',
    font: 'cursive',
    stickers: [],
    isFlipped: false
};

// Themes
const themes = {
    red: { primary: '#ff1744', secondary: '#d50000' },
    pink: { primary: '#ff80ab', secondary: '#f48fb1' },
    gold: { primary: '#ffd700', secondary: '#ffa000' },
    purple: { primary: '#9c27b0', secondary: '#7b1fa2' },
    blue: { primary: '#2196f3', secondary: '#1565c0' },
    teal: { primary: '#00bcd4', secondary: '#00838f' },
    orange: { primary: '#ff9800', secondary: '#e65100' },
    green: { primary: '#4caf50', secondary: '#2e7d32' }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    initHearts();
    initCard();
    initSteps();
    initInputs();
    initQuickPicks();
    initThemes();
    initEmojis();
    initFonts();
    initStickers();
    initShare();
    loadSharedCard();
});

// Floating Hearts
function initHearts() {
    const container = document.getElementById('heartsBg');
    const hearts = ['❤️', '💕', '💖', '💗', '💘'];

    for (let i = 0; i < 12; i++) {
        const heart = document.createElement('div');
        heart.className = 'float-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDelay = Math.random() * 15 + 's';
        heart.style.fontSize = (14 + Math.random() * 14) + 'px';
        container.appendChild(heart);
    }
}

// Card Flip
function initCard() {
    const card = document.getElementById('card');
    const hint = document.getElementById('cardHint');

    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        state.isFlipped = !state.isFlipped;
        hint.textContent = state.isFlipped ? '👆 Tap to see front' : '👆 Tap card to flip';
    });
}

// Steps Navigation
function initSteps() {
    const steps = document.querySelectorAll('.step');
    const contents = document.querySelectorAll('.step-content');

    steps.forEach(step => {
        step.addEventListener('click', () => {
            const num = step.dataset.step;

            steps.forEach(s => s.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            step.classList.add('active');
            document.getElementById('step' + num).classList.add('active');
        });
    });
}

// Text Inputs
function initInputs() {
    // To
    document.getElementById('inputTo').addEventListener('input', (e) => {
        document.getElementById('cardTo').textContent = e.target.value || 'My Love';
    });

    // Title
    document.getElementById('inputTitle').addEventListener('input', (e) => {
        document.getElementById('cardTitle').textContent = e.target.value || 'Will You Be My Valentine?';
    });

    // Message
    document.getElementById('inputMessage').addEventListener('input', (e) => {
        document.getElementById('cardMessage').innerHTML = (e.target.value || 'Write something sweet...').replace(/\n/g, '<br>');
    });

    // Sign off
    document.getElementById('inputSign').addEventListener('input', (e) => {
        document.getElementById('cardSign').textContent = e.target.value || 'Forever Yours,';
    });

    // From
    document.getElementById('inputFrom').addEventListener('input', (e) => {
        document.getElementById('cardFrom').textContent = e.target.value || 'Your Name';
    });
}

// Quick Picks
function initQuickPicks() {
    document.querySelectorAll('.quick-btns button').forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.dataset.title;
            const msg = btn.dataset.msg;

            document.getElementById('inputTitle').value = title;
            document.getElementById('inputMessage').value = msg;
            document.getElementById('cardTitle').textContent = title;
            document.getElementById('cardMessage').textContent = msg;

            toast('Template applied! ✨');
        });
    });
}

// Themes
function initThemes() {
    document.querySelectorAll('.theme').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            state.theme = theme;

            document.querySelectorAll('.theme').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply theme
            const colors = themes[theme];
            document.documentElement.style.setProperty('--primary', colors.primary);
            document.documentElement.style.setProperty('--primary-dark', colors.secondary);

            toast('Theme changed! 🎨');
        });
    });
}

// Emojis
function initEmojis() {
    document.querySelectorAll('.emoji').forEach(btn => {
        btn.addEventListener('click', () => {
            state.emoji = btn.dataset.emoji;

            document.querySelectorAll('.emoji').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelector('.card-emoji').textContent = state.emoji;
        });
    });
}

// Fonts
function initFonts() {
    document.querySelectorAll('.font').forEach(btn => {
        btn.addEventListener('click', () => {
            state.font = btn.dataset.font;

            document.querySelectorAll('.font').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const isSans = state.font === 'sans';
            document.getElementById('cardTitle').classList.toggle('sans', isSans);
            document.getElementById('cardMessage').classList.toggle('sans', isSans);
            document.getElementById('cardSign').classList.toggle('sans', isSans);
        });
    });
}

// Stickers
function initStickers() {
    document.querySelectorAll('.stickers button').forEach(btn => {
        btn.addEventListener('click', () => {
            addSticker(btn.dataset.sticker);
        });
    });

    document.getElementById('clearStickers').addEventListener('click', () => {
        document.getElementById('stickersFront').innerHTML = '';
        document.getElementById('stickersBack').innerHTML = '';
        state.stickers = [];
        toast('Stickers cleared');
    });
}

function addSticker(emoji) {
    const layerId = state.isFlipped ? 'stickersBack' : 'stickersFront';
    const layer = document.getElementById(layerId);

    const sticker = document.createElement('div');
    sticker.className = 'sticker';
    sticker.textContent = emoji;

    const x = 10 + Math.random() * 70;
    const y = 10 + Math.random() * 70;
    sticker.style.left = x + '%';
    sticker.style.top = y + '%';

    // Store
    state.stickers.push({ emoji, x, y, side: state.isFlipped ? 'back' : 'front' });

    // Long press to remove
    let timer;
    const start = () => {
        timer = setTimeout(() => {
            sticker.remove();
            state.stickers = state.stickers.filter(s => !(s.emoji === emoji && s.x === x && s.y === y));
            toast('Sticker removed');
        }, 500);
    };
    const end = () => clearTimeout(timer);

    sticker.addEventListener('touchstart', start);
    sticker.addEventListener('mousedown', start);
    sticker.addEventListener('touchend', end);
    sticker.addEventListener('mouseup', end);
    sticker.addEventListener('mouseleave', end);

    layer.appendChild(sticker);
    toast('Sticker added! ✨');
}

// Share
function initShare() {
    const modal = document.getElementById('modal');
    const linkInput = document.getElementById('linkInput');

    // Open modal
    document.getElementById('shareBtn').addEventListener('click', () => {
        linkInput.value = generateURL();
        modal.classList.add('active');
    });

    // Close modal
    document.getElementById('modalClose').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Native share
    const shareNative = document.getElementById('shareNative');
    if (navigator.share) {
        shareNative.addEventListener('click', async () => {
            try {
                await navigator.share({
                    title: 'Valentine Card',
                    text: getShareText(),
                    url: linkInput.value
                });
                modal.classList.remove('active');
            } catch (e) {}
        });
    } else {
        shareNative.classList.add('hidden');
    }

    // WhatsApp
    document.getElementById('shareWhatsApp').addEventListener('click', () => {
        const text = getShareText() + '\n\n' + linkInput.value;
        window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
        modal.classList.remove('active');
    });

    // SMS
    document.getElementById('shareSMS').addEventListener('click', () => {
        const text = getShareText() + ' ' + linkInput.value;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        window.location.href = isIOS
            ? 'sms:&body=' + encodeURIComponent(text)
            : 'sms:?body=' + encodeURIComponent(text);
        modal.classList.remove('active');
    });

    // Email
    document.getElementById('shareEmail').addEventListener('click', () => {
        const subject = 'Valentine Card for You! 💕';
        const body = getShareText() + '\n\nOpen your card: ' + linkInput.value;
        window.location.href = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        modal.classList.remove('active');
    });

    // Copy link
    document.getElementById('copyLink').addEventListener('click', () => {
        copyText(linkInput.value);
    });
}

function getShareText() {
    const from = document.getElementById('inputFrom').value || 'Someone special';
    return `${from} sent you a Valentine's card! 💕`;
}

function generateURL() {
    const data = {
        to: document.getElementById('inputTo').value,
        title: document.getElementById('inputTitle').value,
        msg: document.getElementById('inputMessage').value,
        sign: document.getElementById('inputSign').value,
        from: document.getElementById('inputFrom').value,
        theme: state.theme,
        emoji: state.emoji,
        font: state.font,
        stickers: state.stickers
    };

    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    return window.location.origin + window.location.pathname + '?card=' + encoded;
}

// Load Shared Card
function loadSharedCard() {
    const params = new URLSearchParams(window.location.search);
    const cardData = params.get('card');

    if (!cardData) return;

    try {
        const data = JSON.parse(decodeURIComponent(atob(cardData)));

        // Text
        if (data.to) {
            document.getElementById('inputTo').value = data.to;
            document.getElementById('cardTo').textContent = data.to;
        }
        if (data.title) {
            document.getElementById('inputTitle').value = data.title;
            document.getElementById('cardTitle').textContent = data.title;
        }
        if (data.msg) {
            document.getElementById('inputMessage').value = data.msg;
            document.getElementById('cardMessage').innerHTML = data.msg.replace(/\n/g, '<br>');
        }
        if (data.sign) {
            document.getElementById('inputSign').value = data.sign;
            document.getElementById('cardSign').textContent = data.sign;
        }
        if (data.from) {
            document.getElementById('inputFrom').value = data.from;
            document.getElementById('cardFrom').textContent = data.from;
        }

        // Theme
        if (data.theme && themes[data.theme]) {
            state.theme = data.theme;
            const colors = themes[data.theme];
            document.documentElement.style.setProperty('--primary', colors.primary);
            document.documentElement.style.setProperty('--primary-dark', colors.secondary);
            document.querySelectorAll('.theme').forEach(b => {
                b.classList.toggle('active', b.dataset.theme === data.theme);
            });
        }

        // Emoji
        if (data.emoji) {
            state.emoji = data.emoji;
            document.querySelector('.card-emoji').textContent = data.emoji;
            document.querySelectorAll('.emoji').forEach(b => {
                b.classList.toggle('active', b.dataset.emoji === data.emoji);
            });
        }

        // Font
        if (data.font) {
            state.font = data.font;
            const isSans = data.font === 'sans';
            document.getElementById('cardTitle').classList.toggle('sans', isSans);
            document.getElementById('cardMessage').classList.toggle('sans', isSans);
            document.getElementById('cardSign').classList.toggle('sans', isSans);
            document.querySelectorAll('.font').forEach(b => {
                b.classList.toggle('active', b.dataset.font === data.font);
            });
        }

        // Stickers
        if (data.stickers && data.stickers.length > 0) {
            data.stickers.forEach(s => {
                const layerId = s.side === 'back' ? 'stickersBack' : 'stickersFront';
                const layer = document.getElementById(layerId);
                const sticker = document.createElement('div');
                sticker.className = 'sticker';
                sticker.textContent = s.emoji;
                sticker.style.left = s.x + '%';
                sticker.style.top = s.y + '%';
                layer.appendChild(sticker);
            });
            state.stickers = data.stickers;
        }

        toast('💌 Viewing shared card!');

    } catch (e) {
        console.log('Invalid card data');
    }
}

// Utilities
function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => toast('Link copied! 📋'));
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast('Link copied! 📋');
    }
}

function toast(msg, isError = false) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.toggle('error', isError);
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
}
