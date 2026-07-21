(function(){
    const TIME_API = 'https://uapis.cn/api/v1/misc/worldtime?city=Asia/Shanghai';
    
    const TimeAPI = {
        offset: 0,
        status: 'init',
        ready: null,
        lastSync: null,
        serverRaw: null,
        async init() {
            if (TimeAPI.ready) return TimeAPI.ready;
            console.log('Connecting to TimeAPI', TIME_API);
            TimeAPI.ready = (async () => {
                try {
                    const resp = await fetch(TIME_API, { cache: 'no-store' });
                    
                    if (!resp.ok) throw new Error('HTTP ' + resp.status);
                    const json = await resp.json();
                    let serverMs = null;

                    // 兼容多个可能的字段
                    if (typeof json.timestamp_unix === 'number') {
                        serverMs = json.timestamp_unix * 1000;
                    } else if (typeof json.timestamp === 'number') {
                        serverMs = json.timestamp * 1000;
                    } else if (typeof json.epochMilliseconds === 'number') {
                        serverMs = json.epochMilliseconds;
                    } else if (typeof json.epoch === 'number') {
                        serverMs = json.epoch;
                    } else if (typeof json.unixtime === 'number') {
                        serverMs = Math.floor(json.unixtime * 1000);
                    } else if (json.datetime) {
                        const raw = String(json.datetime).trim();
                        const normalized = raw.includes(' ') ? raw.replace(' ', 'T') : raw;
                        serverMs = Date.parse(normalized);
                    } else if (json.dateTime) {
                        serverMs = Date.parse(json.dateTime);
                    } else if (json.date_time) {
                        serverMs = Date.parse(json.date_time);
                    }

                    if (!serverMs || Number.isNaN(serverMs)) throw new Error('Invalid time response');
                    TimeAPI.offset = serverMs - Date.now();
                    TimeAPI.status = 'ok';
                    TimeAPI.lastSync = Date.now();
                    TimeAPI.serverRaw = json;
                    console.log('TimeAPI is connected',TimeAPI.serverRaw);
                } catch (e) {
                    console.error('TimeAPI connect failed, falling back to system time:', e);
                    TimeAPI.offset = 0;
                    TimeAPI.status = 'error';
                    TimeAPI.lastSync = Date.now();
                }
                // 尝试在页面上显示状态
                try {
                    const el = document.getElementById('TimeAPI-status');
                    if (el) {
                        if (TimeAPI.status === 'ok') {
                            const t = new Date(Date.now() + TimeAPI.offset).toLocaleTimeString('zh-CN', { hour12: false });
                            el.textContent = `TimeAPI: Asia/Shanghai | ${t}`;
                            el.style.color = '#5ba838';
                        } else {
                            el.textContent = `TimeAPI: Error`;
                            el.style.color = 'red';
                        }
                    }
                } catch (e) {}

                return TimeAPI;
            })();
            return TimeAPI.ready;
        },
        async sync() {
            // 强制重新同步
            TimeAPI.ready = null;
            return TimeAPI.init();
        },
        now() { return new Date(Date.now() + TimeAPI.offset); },
        nowMs() { return Date.now() + TimeAPI.offset; },
        getStatus() { return { status: TimeAPI.status, lastSync: TimeAPI.lastSync, serverRaw: TimeAPI.serverRaw } }
    };

    // 暴露并自动初始化
    window.TimeAPI = TimeAPI;
    TimeAPI.init().catch(err => console.warn('TimeAPI.init() rejected:', err));
})();
