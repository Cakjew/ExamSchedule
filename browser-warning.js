(function() {
    function getBrowserInfo() {
        var ua = navigator.userAgent || '';
        var browser = {
            name: 'Unknown',
            version: 0
        };

        var edgeMatch = ua.match(/Edg(?:A|iOS)?\/(\d+)/i);
        if (edgeMatch) {
            browser.name = 'Edge';
            browser.version = parseInt(edgeMatch[1], 10) || 0;
            return browser;
        }

        var chromeMatch = ua.match(/(?:Chrome|CriOS)\/(\d+)/i);
        if (chromeMatch) {
            browser.name = 'Chrome';
            browser.version = parseInt(chromeMatch[1], 10) || 0;
            return browser;
        }

        var firefoxMatch = ua.match(/(?:Firefox|FxiOS)\/(\d+)/i);
        if (firefoxMatch) {
            browser.name = 'Firefox';
            browser.version = parseInt(firefoxMatch[1], 10) || 0;
            return browser;
        }

        var operaMatch = ua.match(/(?:OPR|Opera)\/(\d+)/i);
        if (operaMatch) {
            browser.name = 'Opera';
            browser.version = parseInt(operaMatch[1], 10) || 0;
            return browser;
        }

        var safariMatch = ua.match(/Version\/(\d+)/i);
        if (safariMatch) {
            browser.name = 'Safari';
            browser.version = parseInt(safariMatch[1], 10) || 0;
            return browser;
        }

        return browser;
    }

    function isLegacyBrowser() {
        var ua = navigator.userAgent || '';
        var oldEdgePattern = /Edge\/\d+/i.test(ua) && !/Edg\//i.test(ua);
        var oldIEPattern = /MSIE|Trident/i.test(ua);
        var oldKernelPattern = /Presto|Konqueror|MIDP|Mosaic|Netscape/i.test(ua);
        var browser = getBrowserInfo();

        if (oldIEPattern || oldEdgePattern || oldKernelPattern) {
            return true;
        }

        if (browser.name === 'Chrome' && browser.version < 80) {
            return true;
        }

        if (browser.name === 'Edge' && browser.version < 79) {
            return true;
        }

        if (browser.name === 'Firefox' && browser.version < 60) {
            return true;
        }

        if (browser.name === 'Opera' && browser.version < 60) {
            return true;
        }

        if (browser.name === 'Safari' && browser.version < 14) {
            return true;
        }

        return false;
    }

    function addListener(target, eventName, callback) {
        if (target.addEventListener) {
            target.addEventListener(eventName, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventName, callback);
        }
    }

    function removeOverlay(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }

    function createWarningOverlay() {
        var style = document.createElement('style');
        // 依据脚本自身位置推导站点资源根目录，兼容子目录页面（exam/、time/、about/）
        // 注：IE11 不支持 document.currentScript，需回退到最后一个同步脚本
        var currentScript = document.currentScript ||
                            document.scripts[document.scripts.length - 1];
        var fontBase = (currentScript && currentScript.src)
            ? currentScript.src.replace(/[^/]*$/, '')
            : '';
        // 仅在"启用测试字体"开关开启时注入自包含 @font-face（开关关闭时页面不加载自定义字体）
        var testFontEnabled = false;
        try { testFontEnabled = localStorage.getItem('enableTestFont') === 'true'; } catch (e) {}
        var fontFace = testFontEnabled
            ? "@font-face{font-family:'HarmonyOS Sans SC';" +
              "src:url('" + fontBase + "assets/fonts/HarmonyOS_Sans_SC_Regular.woff2') format('woff2');" +
              "font-weight:400;font-style:normal;font-display:swap;}"
            : '';
        var warnFontFamily = testFontEnabled
            ? '"HarmonyOS Sans SC", sans-serif'
            : '"Segoe UI", "Google Sans", "Roboto", sans-serif';
        style.textContent = fontFace + '\
            .browser-warning-overlay {\
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
            .browser-warning-overlay.closing {\
                animation: edgeFadeOut 0.24s ease forwards;\
            }\
            .browser-warning-card {\
                width: 760px;\
                max-width: 100%;\
                background: #1f2937;\
                border-radius: 24px;\
                border: 1px solid rgba(148, 163, 184, 0.16);\
                box-shadow: 0 32px 80px rgba(15, 23, 42, 0.75);\
                padding: 32px;\
                color: #e2e8f0;\
                font-family: ' + warnFontFamily + ';\
                text-align: left;\
                transform: translateY(16px) scale(0.98);\
                opacity: 0;\
                animation: cardPopIn 0.32s cubic-bezier(0.2, 0, 0, 1) forwards;\
            }\
            .browser-warning-overlay.closing .browser-warning-card {\
                animation: cardPopOut 0.24s ease forwards;\
            }\
            .browser-warning-card h1 {\
                display: block !important;\
                margin: 0 0 16px;\
                font-size: 28px;\
                color: #60a5fa;\
                line-height: 1.2;\
            }\
            .browser-warning-card p {\
                margin: 0 0 16px;\
                line-height: 1.75;\
                color: #cbd5e1;\
                font-size: 16px;\
            }\
            .browser-warning-actions {\
                margin-top: 24px;\
                display: -ms-flexbox;\
                display: flex;\
                -ms-flex-wrap: wrap;\
                flex-wrap: wrap;\
                gap: 12px;\
                -ms-flex-pack: justify;\
                justify-content: space-between;\
                -ms-flex-align: center;\
                align-items: center;\
            }\
            .browser-warning-download-list {\
                display: -ms-flexbox;\
                display: flex;\
                -ms-flex-wrap: wrap;\
                flex-wrap: wrap;\
                gap: 12px;\
                -ms-flex-pack: start;\
                justify-content: flex-start;\
                -ms-flex: 1 1 auto;\
                flex: 1 1 auto;\
            }\
            .browser-warning-button, .browser-warning-link {\
                border: none;\
                border-radius: 999px;\
                padding: 12px 22px;\
                font-size: 15px;\
                font-weight: 700;\
                cursor: pointer;\
                text-decoration: none;\
            }\
            .browser-warning-button {\
                background: #60a5fa;\
                color: #0f172a;\
            }\
            .browser-warning-button:hover {\
                background: #3b82f6;\
            }\
            .browser-warning-link {\
                background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));\
                color: #e2e8f0;\
                display: -ms-inline-flexbox;\
                display: inline-flex;\
                -ms-flex-align: center;\
                align-items: center;\
                border: 1px solid rgba(148, 163, 184, 0.24);\
                box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28);\
                transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;\
            }\
            .browser-warning-link:hover {\
                background: linear-gradient(135deg, rgba(96, 165, 250, 0.24), rgba(255,255,255,0.1));\
                border-color: rgba(96, 165, 250, 0.55);\
                transform: translateY(-1px);\
            }\
            .browser-warning-note {\
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
        overlay.className = 'browser-warning-overlay';
        overlay.innerHTML = '\
            <div class="browser-warning-card">\
                <h1>您的浏览器版本过低</h1>\
                <p>您当前使用的浏览器内核较旧，可能无法完整支持本站所需的现代 Web 标准。</p>\
                <p>本页面依赖现代 Web 标准，在旧内核浏览器中可能出现空白、布局错乱或无法正常运行。</p>\
                <div class="browser-warning-actions">\
                    <div class="browser-warning-download-list">\
                        <a class="browser-warning-link" href="https://www.google.cn/chrome/" target="_blank" rel="noopener noreferrer">Chrome</a>\
                        <a class="browser-warning-link" href="https://www.microsoft.com/zh-cn/edge/download" target="_blank" rel="noopener noreferrer">Edge</a>\
                        <a class="browser-warning-link" href="https://www.firefox.com/zh-CN/download/all/desktop-release/" target="_blank" rel="noopener noreferrer">Firefox</a>\
                    </div>\
                    <button type="button" class="browser-warning-button" id="browser-warning-close">我知道了</button>\
                </div>\
                <div class="browser-warning-note">建议改用 Microsoft Edge、Google Chrome、Firefox 或 Safari。</div>\
            </div>\
        ';

        document.body.appendChild(overlay);

        var closeButton = document.getElementById('browser-warning-close');
        if (closeButton) {
            addListener(closeButton, 'click', function() {
                overlay.className = overlay.className + ' closing';
                var finishClose = function() {
                    removeOverlay(overlay);
                };

                if (typeof overlay.addEventListener === 'function') {
                    addListener(overlay, 'animationend', function handleClose() {
                        removeOverlay(overlay);
                        overlay.removeEventListener('animationend', handleClose);
                    });
                }

                setTimeout(finishClose, 260);
            });
        }
    }

    function init() {
        if (isLegacyBrowser()) {
            createWarningOverlay();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();