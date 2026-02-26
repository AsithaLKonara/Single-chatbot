export const getSystemContext = () => {
    if (typeof window === "undefined") return null;
    return {
        url: window.location.href,
        title: document.title,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        lang: navigator.language,
    };
};
