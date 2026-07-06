(function() {
    function isLegacyEdge() {
        var ua = navigator.userAgent || '';
        return /Edge\/\d+/i.test(ua) && !/Edg\//i.test(ua);
    }

    function createWarningOverlay() {
        var style = document.createElement('style');
        style.textContent = '\
            .edge-warning-overlay {\
                position: fixed;\
                top: 0;\
                right: 0;\
                bottom: 0;\
                left: 0;\
                z-index: 99999;\
                background: rgba(12, 15, 25, 0.96);\
                display: -ms-flexbox;\
                display: flex;\
                -ms-flex-pack: center;\
                justify-content: center;\
                -ms-flex-align: center;\
                align-items: center;\
                padding: 24px;\
                opacity: 0;\
                animation: edgeFadeIn 0.28s ease forwards;\
            }\
            .edge-warning-overlay.closing {\
                animation: edgeFadeOut 0.24s ease forwards;\
            }\
            .edge-warning-card {\
                width: 760px;\
                max-width: 100%;\
                background: #1f2937;\
                border-radius: 24px;\
                border: 1px solid rgba(148, 163, 184, 0.16);\
                box-shadow: 0 32px 80px rgba(15, 23, 42, 0.75);\
                padding: 32px;\
                color: #e2e8f0;\
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\
                text-align: left;\
                transform: translateY(16px) scale(0.98);\
                opacity: 0;\
                animation: cardPopIn 0.32s cubic-bezier(0.2, 0, 0, 1) forwards;\
            }\
            .edge-warning-overlay.closing .edge-warning-card {\
                animation: cardPopOut 0.24s ease forwards;\
            }\
            .edge-warning-card h1 {\
                margin: 0 0 16px;\
                font-size: 28px;\
                color: #60a5fa;\
                line-height: 1.2;\
            }\
            .edge-warning-card p {\
                margin: 0 0 16px;\
                line-height: 1.75;\
                color: #cbd5e1;\
                font-size: 16px;\
            }\
            .edge-warning-actions {\
                margin-top: 24px;\
                display: -ms-flexbox;\
                display: flex;\
                -ms-flex-wrap: wrap;\
                flex-wrap: wrap;\
                gap: 12px;\
                -ms-flex-pack: end;\
                justify-content: flex-end;\
            }\
            .edge-warning-button, .edge-warning-link {\
                border: none;\
                border-radius: 999px;\
                padding: 12px 22px;\
                font-size: 15px;\
                font-weight: 700;\
                cursor: pointer;\
                text-decoration: none;\
            }\
            .edge-warning-button {\
                background: #60a5fa;\
                color: #0f172a;\
            }\
            .edge-warning-button:hover {\
                background: #3b82f6;\
            }\
            .edge-warning-link {\
                background: rgba(255,255,255,0.08);\
                color: #e2e8f0;\
                display: -ms-inline-flexbox;\
                display: inline-flex;\
                -ms-flex-align: center;\
                align-items: center;\
            }\
            .edge-warning-link:hover {\
                background: rgba(255,255,255,0.16);\
            }\
            .edge-warning-note {\
                opacity: 0.9;\
                font-size: 13px;\
                margin-top: 12px;\
                color: #94a3b8;\
            }\
            @keyframes edgeFadeIn {\
                from { opacity: 0; }\
                to { opacity: 1; }\
            }\
            @keyframes edgeFadeOut {\
                from { opacity: 1; }\
                to { opacity: 0; }\
            }\
            @keyframes cardPopIn {\
                from { transform: translateY(16px) scale(0.96); opacity: 0; }\
                to { transform: translateY(0) scale(1); opacity: 1; }\
            }\
            @keyframes cardPopOut {\
                from { transform: translateY(0) scale(1); opacity: 1; }\
                to { transform: translateY(16px) scale(0.96); opacity: 0; }\
            }\
        ';
        document.head.appendChild(style);

        var overlay = document.createElement('div');
        overlay.className = 'edge-warning-overlay';
        overlay.innerHTML = '\
            <div class="edge-warning-card">\
                <h1>检测到旧版 Microsoft Edge</h1>\
                <p>您当前正在使用基于 EdgeHTML 的旧版本 Microsoft Edge。此页面在该浏览器中可能出现布局错乱，且不提供技术支持。</p>\
                <p>建议改用最新 Microsoft Edge (Chromium)、Google Chrome、Firefox 或 Safari 以获得更稳定的体验。</p>\
                <div class="edge-warning-actions">\
                    <button type="button" class="edge-warning-button" id="edge-warning-close">我知道了</button>\
                    <a class="edge-warning-link" href="https://www.microsoft.com/edge" target="_blank" rel="noopener noreferrer">下载最新 Edge</a>\
                </div>\
                <div class="edge-warning-note">如果您无法升级，请使用其他现代浏览器访问本站。</div>\
            </div>\
        ';

        document.body.appendChild(overlay);
        var closeButton = document.getElementById('edge-warning-close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                overlay.classList.add('closing');
                overlay.addEventListener('animationend', function handleClose() {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    overlay.removeEventListener('animationend', handleClose);
                });
            });
        }
    }

    function init() {
        if (isLegacyEdge()) {
            createWarningOverlay();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();