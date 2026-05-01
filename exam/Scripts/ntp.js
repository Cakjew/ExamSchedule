(function(){
    // 使用免费的 timeapi.io 服务获取准确的网络时间
    const TIME_API = 'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Shanghai';
    
    const NTP = {
        offset: 0,
        status: 'init',
        ready: null,
        lastSync: null,
        serverRaw: null,
        async init() {
            if (NTP.ready) return NTP.ready;
            console.debug('NTP: init() called');
            NTP.ready = (async () => {
                try {
                    const resp = await fetch(TIME_API, { cache: 'no-store' });
                    
                    if (!resp.ok) throw new Error('HTTP ' + resp.status);
                    const json = await resp.json();
                    let serverMs = null;

                    // 兼容多个可能的字段
                    if (typeof json.epochMilliseconds === 'number') {
                        serverMs = json.epochMilliseconds;
                    } else if (typeof json.epoch === 'number') {
                        serverMs = json.epoch;
                    } else if (typeof json.unixtime === 'number') {
                        serverMs = Math.floor(json.unixtime * 1000);
                    } else if (json.datetime) {
                        serverMs = Date.parse(json.datetime);
                    } else if (json.dateTime) {
                        serverMs = Date.parse(json.dateTime);
                    } else if (json.date_time) {
                        serverMs = Date.parse(json.date_time);
                    }

                    if (!serverMs || Number.isNaN(serverMs)) throw new Error('Invalid time response');
                    NTP.offset = serverMs - Date.now();
                    NTP.status = 'ok';
                    NTP.lastSync = Date.now();
                    NTP.serverRaw = json;
                } catch (e) {
                    console.warn('NTP init failed, falling back to system time:', e);
                    NTP.offset = 0;
                    NTP.status = 'error';
                    NTP.lastSync = Date.now();
                }
                // 尝试在页面上显示状态
                try {
                    const el = document.getElementById('ntp-status');
                    if (el) {
                        if (NTP.status === 'ok') {
                            const t = new Date(Date.now() + NTP.offset).toLocaleTimeString('zh-CN', { hour12: false });
                            el.textContent = `NTP: OK ${t}`;
                            el.style.color = '#5ba838';
                        } else {
                            el.textContent = `NTP: ERR`;
                            el.style.color = 'red';
                        }
                    }
                } catch (e) {}

                return NTP;
            })();
            return NTP.ready;
        },
        async sync() {
            // 强制重新同步
            NTP.ready = null;
            return NTP.init();
        },
        now() { return new Date(Date.now() + NTP.offset); },
        nowMs() { return Date.now() + NTP.offset; },
        getStatus() { return { status: NTP.status, lastSync: NTP.lastSync, serverRaw: NTP.serverRaw } }
    };

    // 暴露并自动初始化
    window.NTP = NTP;
    NTP.init().catch(err => console.warn('NTP.init() rejected:', err));
})();