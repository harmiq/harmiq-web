/**
 * Harmiq - Configuración Global Centralizada
 * Versión: 5.5 - Final Production Ready
 */

const CONFIG = {
    // --- SERVIDORES Y APIS ---
    HF_BASE: "https://hamiq-harmiq-backend1.hf.space",
    AMAZON_ID: "harmiqapp-20",

    // --- CANALES DE YOUTUBE (Karaokes de Amigos y Propios) ---
    YOUTUBE_CHANNELS: {
        KARAOKE_CATALA: "https://www.youtube.com/embed/videoseries?list=UU0viIBU7vG0E8heNIrM2hGA",
        KARAOKE_GIRONA: "https://www.youtube.com/embed/videoseries?list=UUEJUHMchUCCld9apTGm_FFQ",
        KARAOKAT: "https://www.youtube.com/embed/KIl2FPuEmpY",
        DEFAULT_PLAYLIST: "https://www.youtube.com/embed/videoseries?list=PLyI_j4w6L_8i87v5tH8u8fO0lVlZf3_3x"
    },

    THEME: {
        PRIMARY: "#7C4DFF",
        ACCENT: "#FF4FA3",
        GOLD: "#FFD700",
        DARK_BG: "#050410",
        CARD_BG: "#110D26"
    },

    ROUTES: {
        HOME: "index.html",
        PRIVACY: "politica-privacidad.html",
        EVENTS: "karaoke-eventos.html"
    },

    SOCIAL: {
        INSTAGRAM: "https://instagram.com/harmiq_app",
        TIKTOK: "https://tiktok.com/@harmiq",
        YOUTUBE_OFFICIAL: "https://youtube.com/@harmiq",
        EMAIL_SUPPORT: "info@harmiq.app"
    },

    SETTINGS: {
        APP_NAME: "Harmiq",
        VERSION: "5.5",
        LEGAL_STANDARD: "Global Privacy Standard v2.1 (GDPR/CCPA Compliant)",
        LANG: "ca"
    }
};

Object.freeze(CONFIG);

if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}

/*
 * Harmiq — Música en català visual layer
 * Deliberately lives here so it can enhance the existing Catalan module
 * without touching its data/rendering logic.
 */
(function () {
    if (!/\/modul-catala(?:\.html)?\/?$/i.test(window.location.pathname)) return;

    const wikiLanguages = ['ca', 'es', 'en'];
    const imageCache = new Map();

    const clean = value => (value || '').replace(/\s+/g, ' ').trim();

    function setMeta(name, content) {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.name = name;
            document.head.appendChild(el);
        }
        el.content = content;
    }

    function polishNaming() {
        document.title = 'Música en català — Artistes, cançons i cultura | Harmiq';
        setMeta('description', 'Descobreix la música en català amb Harmiq: artistes, cançons, història, cultura i noves veus de Catalunya, el País Valencià i les Illes Balears.');
        setMeta('keywords', 'música en català, música catalana, artistes catalans, cançons en català, grups catalans, escena musical catalana, Oques Grasses, The Tyets, Julieta');
        const nav = document.querySelector('.nav-right');
        if (nav) nav.textContent = '🎵 Música en català';
        const kicker = document.querySelector('.v5-kicker');
        if (kicker) kicker.textContent = 'Harmiq · Música en català';
    }

    function addStyles() {
        if (document.getElementById('harmiq-catala-image-style')) return;
        const style = document.createElement('style');
        style.id = 'harmiq-catala-image-style';
        style.textContent = `
            .art-card .art-av-wrap{position:relative!important;overflow:hidden!important;background:linear-gradient(135deg,#10283a,#0a1119)!important}
            .art-card .art-photo{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;display:block!important;object-fit:cover!important;object-position:center!important;z-index:1!important;opacity:0;transition:opacity .35s ease,transform .5s ease,filter .35s ease!important}
            .art-card .art-photo.loaded{opacity:1}
            .art-card:hover .art-photo.loaded{transform:scale(1.045);filter:saturate(1.08)}
            .art-card .art-av{z-index:0!important;transition:opacity .25s ease!important}
            .art-card .art-av.hidden{opacity:0}
            .v5-province{transition:transform .35s ease,filter .35s ease}
            .v5-province:hover{filter:saturate(1.08);transform:translateY(-3px) skewX(-4deg)}
            .v5-province.has-photo{background-size:cover!important;background-position:center!important}
            .v5-province.has-photo:before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,8,14,.10),rgba(2,8,14,.78));z-index:1}
            @media(max-width:900px){.v5-province:hover{transform:translateY(-3px)}}
        `;
        document.head.appendChild(style);
    }

    async function wikipediaImage(name) {
        name = clean(name);
        const key = name.toLowerCase();
        if (!key) return null;
        if (imageCache.has(key)) return imageCache.get(key);

        const promise = (async () => {
            for (const language of wikiLanguages) {
                try {
                    const response = await fetch(
                        `https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
                        { cache: 'force-cache' }
                    );
                    if (!response.ok) continue;
                    const data = await response.json();
                    if (data && data.thumbnail && data.thumbnail.source) return data.thumbnail.source;
                    if (data && data.originalimage && data.originalimage.source) return data.originalimage.source;
                } catch (_) {}
            }
            return null;
        })();

        imageCache.set(key, promise);
        return promise;
    }

    function loadArtistCard(card) {
        if (card.dataset.harmiqImageStarted) return;
        const name = clean(card.querySelector('h3,h4,strong')?.textContent);
        const wrapper = card.querySelector('.art-av-wrap');
        const fallback = card.querySelector('.art-av');
        if (!name || !wrapper || !fallback) return;

        card.dataset.harmiqImageStarted = '1';
        wikipediaImage(name).then(url => {
            if (!url) return;
            const image = document.createElement('img');
            image.className = 'art-photo';
            image.alt = name;
            image.loading = 'lazy';
            image.decoding = 'async';
            image.src = url;
            image.addEventListener('load', () => {
                image.classList.add('loaded');
                fallback.classList.add('hidden');
            }, { once: true });
            image.addEventListener('error', () => image.remove(), { once: true });
            wrapper.insertBefore(image, wrapper.firstChild);
        });
    }

    function loadProvince(element) {
        if (element.dataset.harmiqImageStarted) return;
        const name = clean(element.dataset.artist);
        if (!name) return;
        element.dataset.harmiqImageStarted = '1';
        wikipediaImage(name).then(url => {
            if (!url) return;
            const safeUrl = url.replace(/"/g, '\\"');
            element.style.backgroundImage = `linear-gradient(180deg,rgba(2,8,14,.10),rgba(2,8,14,.78)),url("${safeUrl}")`;
            element.classList.add('has-photo');
        });
    }

    function scan() {
        document.querySelectorAll('#ag .art-card, #eg .art-card').forEach(card => {
            if (card.dataset.harmiqObserved) return;
            card.dataset.harmiqObserved = '1';
            if (window.IntersectionObserver) {
                imageObserver.observe(card);
            } else {
                loadArtistCard(card);
            }
        });
        document.querySelectorAll('.v5-province[data-artist]').forEach(loadProvince);
    }

    const imageObserver = window.IntersectionObserver ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            loadArtistCard(entry.target);
            imageObserver.unobserve(entry.target);
        });
    }, { rootMargin: '700px 0px' }) : null;

    function start() {
        polishNaming();
        addStyles();
        scan();
        const mutationObserver = new MutationObserver(scan);
        mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
