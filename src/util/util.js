export function isMobile() {
    return window.innerWidth <= 768;
}

export const openWhatsApp = (whatsapp) => {
    const url = "https://wa.me/55"+ whatsapp;
    window.open(url, "_blank"); // Abre o link em uma nova aba
};

export const openInstagram = (instagram) => {
    const url = "https://instagram.com/"+ instagram;
    window.open(url, "_blank"); // Abre o link em uma nova aba
};