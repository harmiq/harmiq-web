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
