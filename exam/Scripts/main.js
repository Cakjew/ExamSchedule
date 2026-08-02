document.addEventListener("DOMContentLoaded", () => {
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    // 跨浏览器全屏 API 兼容（EdgeHTML 需要 ms 前缀）
    function getFullscreenElement() {
        return document.fullscreenElement ||
               document.webkitFullscreenElement ||
               document.msFullscreenElement ||
               document.mozFullScreenElement ||
               null;
    }

    function requestFullscreen(el) {
        const methodNames = [
            'requestFullscreen',
            'webkitRequestFullscreen',
            'msRequestFullscreen',
            'mozRequestFullScreen'
        ];

        for (const methodName of methodNames) {
            if (el && typeof el[methodName] === 'function') {
                return el[methodName]();
            }
        }

        throw new Error('当前浏览器不支持全屏');
    }

    function exitFullscreen() {
        const methodNames = [
            'exitFullscreen',
            'webkitExitFullscreen',
            'msExitFullscreen',
            'mozCancelFullScreen'
        ];

        for (const methodName of methodNames) {
            if (document && typeof document[methodName] === 'function') {
                return document[methodName]();
            }
        }
    }

    fullscreenBtn.addEventListener("click", () => {
        try {
            if (!getFullscreenElement()) {
                requestFullscreen(document.documentElement);
            } else {
                exitFullscreen();
            }
        } catch (e) {
            errorSystem.show('全屏切换失败: ' + e.message);
        }
    });
});
