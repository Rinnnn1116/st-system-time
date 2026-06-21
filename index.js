(async function () {
    const extensionName = "st-system-time";

    function getCurrentTimeString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekday = weekdays[now.getDay()];

        return `${year}年${month}月${day}日 ${weekday} ${hour}:${minute}:${second}`;
    }

    // 注册自定义宏
    function registerMacros() {
        const context = SillyTavern.getContext();

        if (context.registerMacro) {
            context.registerMacro('systemTime', () => getCurrentTimeString());

            context.registerMacro('systemDate', () => {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const d = String(now.getDate()).padStart(2, '0');
                return `${y}年${m}月${d}日`;
            });

            context.registerMacro('systemWeekday', () => {
                const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                return weekdays[new Date().getDay()];
            });

            context.registerMacro('systemHour', () => {
                return String(new Date().getHours()).padStart(2, '0');
            });

            context.registerMacro('systemMinute', () => {
                return String(new Date().getMinutes()).padStart(2, '0');
            });

            console.log(`[${extensionName}] 宏注册成功`);
        } else {
            console.warn(`[${extensionName}] registerMacro 不可用，ST版本可能过旧`);
        }
    }

    // 自动注入到 system prompt
    function setupAutoInjection() {
        const context = SillyTavern.getContext();

        // 监听生成事件，在 prompt 组装前注入时间
        context.eventSource.on(
            context.eventTypes.GENERATE_BEFORE_COMBINE_PROMPTS,
            () => {
                // 这个事件在 prompt 组合前触发
                console.log(`[${extensionName}] 当前时间: ${getCurrentTimeString()}`);
            }
        );

        // Chat Completion 模式下注入
        context.eventSource.on(
            context.eventTypes.CHAT_COMPLETION_PROMPT_READY,
            (eventData) => {
                if (eventData && eventData.messages && Array.isArray(eventData.messages)) {
                    const timeMessage = {
                        role: 'system',
                        content: `[当前系统时间: ${getCurrentTimeString()}]`
                    };
                    // 插入到 messages 数组开头（system prompt 之后）
                    eventData.messages.splice(1, 0, timeMessage);
                    console.log(`[${extensionName}] 时间已注入到 prompt`);
                }
            }
        );
    }

    // 初始化
    try {
        registerMacros();
        setupAutoInjection();
        console.log(`[${extensionName}] 插件加载完成 ✓`);
    } catch (err) {
        console.error(`[${extensionName}] 加载失败:`, err);
    }
})();
