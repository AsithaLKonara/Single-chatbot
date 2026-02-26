(function () {
    class UniversalChatbot extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
            const projectId = this.getAttribute('project-id') || '';
            const primaryColor = this.getAttribute('primary-color') || '#3b82f6';

            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.bottom = '0';
            container.style.right = '0';
            container.style.zIndex = '2147483647';

            const iframe = document.createElement('iframe');
            // Replace with your production URL
            iframe.src = `${window.location.origin}/embed?projectId=${projectId}&primaryColor=${encodeURIComponent(primaryColor)}`;
            iframe.style.width = '450px';
            iframe.style.height = '650px';
            iframe.style.border = 'none';
            iframe.style.background = 'transparent';
            iframe.allowTransparency = 'true';

            container.appendChild(iframe);
            this.shadowRoot.appendChild(container);
        }
    }

    if (!customElements.get('universal-chatbot')) {
        customElements.define('universal-chatbot', UniversalChatbot);
    }
})();
