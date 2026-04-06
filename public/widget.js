(function() {
    // Config retrieval
    const config = window.OmniChatConfig || {};
    const apiKey = config.apiKey || "";
    const primaryColor = encodeURIComponent(config.primaryColor || "#3b82f6");
    const position = config.position || "bottom-right";

    // Create container
    const container = document.createElement('div');
    container.id = 'omnichat-root';
    container.style.position = 'fixed';
    container.style.zIndex = '999999';
    container.style.bottom = '24px';
    container.style[position.includes('right') ? 'right' : 'left'] = '24px';
    container.style.width = '380px';
    container.style.height = '520px';
    container.style.display = 'none';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://universal-chatbot-psi.vercel.app/embed?apiKey=${apiKey}&primaryColor=${primaryColor}`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '24px';
    iframe.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
    iframe.allowTransparency = 'true';

    container.appendChild(iframe);
    document.body.appendChild(container);

    // Create launcher button
    const launcher = document.createElement('button');
    launcher.style.position = 'fixed';
    launcher.style.bottom = '24px';
    launcher.style[position.includes('right') ? 'right' : 'left'] = '24px';
    launcher.style.width = '64px';
    launcher.style.height = '64px';
    launcher.style.borderRadius = '50%';
    launcher.style.backgroundColor = config.primaryColor || '#3b82f6';
    launcher.style.border = 'none';
    launcher.style.cursor = 'pointer';
    launcher.style.zIndex = '999998';
    launcher.style.display = 'flex';
    launcher.style.alignItems = 'center';
    launcher.style.justifyContent = 'center';
    launcher.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
    launcher.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`;

    launcher.onclick = function() {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            launcher.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
        } else {
            container.style.display = 'none';
            launcher.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`;
        }
    };

    document.body.appendChild(launcher);
})();
