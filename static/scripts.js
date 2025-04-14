document.addEventListener('DOMContentLoaded', async function() {
    // 定义服务器的默认端口
    const SERVER_PORT = 8000;

    // 变量定义
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const historyList = document.getElementById('history-list');
    const newChatBtn = document.getElementById('new-chat-btn');
    const mainContent = document.getElementById('main-content');

    // 新增变量
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    const clearSettings = document.getElementById('clear-settings');
    const saveSettings = document.getElementById('save-settings');
    const apiUrlInput = document.getElementById('api-url');
    const apiKeyInput = document.getElementById('api-key');
    const apiModelInput = document.getElementById('model-name');

    // 在变量定义部分添加
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // 添加清除历史函数
    function clearCurrentConversation() {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            conversation.messages = conversation.messages.filter(m => m.sender === 'bot' && m.text.includes('你好！我是你的聊天搭子'));
            chatMessages.innerHTML = '';

            // 保留欢迎消息
            const welcomeMessage = "你好！我是你的聊天搭子。你可以跟我说说你的感受和想法，我会认真倾听并给予温暖的回应。今天有什么想分享的吗？";
            addMessage(welcomeMessage, 'bot');

            // 更新历史列表
            renderHistoryList();
        }
    }

    // 添加事件监听
    clearHistoryBtn.addEventListener('click', clearCurrentConversation);

    // 加载保存的设置
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('llmSettings')) || {};
        apiUrlInput.value = settings.apiUrl || '';
        apiKeyInput.value = settings.apiKey || '';
        apiModelInput.value = settings.modelName || '';
    }

    // 保存设置
    function saveSettingsToStorage() {
        const settings = {
            apiUrl: apiUrlInput.value.trim(),
            apiKey: apiKeyInput.value.trim(),
            modelName: apiModelInput.value.trim()
        };
        localStorage.setItem('llmSettings', JSON.stringify(settings));
    }

    // 清除设置
    function clearSettingsFromStorage() {
        localStorage.removeItem('llmSettings');
        apiUrlInput.value = '';
        apiKeyInput.value = '';
    }

    // 切换设置弹窗
    function toggleSettingsModal() {
        settingsModal.classList.toggle('active');
        if (settingsModal.classList.contains('active')) {
            loadSettings();
        }
    }

    // 事件监听
    settingsBtn.addEventListener('click', toggleSettingsModal);
    closeSettings.addEventListener('click', toggleSettingsModal);
    clearSettings.addEventListener('click', clearSettingsFromStorage);
    saveSettings.addEventListener('click', function() {
        saveSettingsToStorage();
        toggleSettingsModal();
        alert('设置已保存！');
    });

    // 点击弹窗外部关闭
    settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            toggleSettingsModal();
        }
    });

    // 对话历史数据
    let conversations = [];
    let currentConversationId = null;

    // 初始化 - 创建一个默认对话
    createNewConversation();

    // 自动调整输入框高度
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 切换侧边栏
    menuBtn.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
        mainContent.classList.toggle('sidebar-open');
    }

    // 创建新对话
    newChatBtn.addEventListener('click', function() {
        createNewConversation();
        toggleSidebar();
    });

    // 添加消息到聊天界面
    // function addMessage(text, sender) {
    //     const messageContainer = document.createElement('div');
    //     messageContainer.classList.add('message-container', sender);

    //     const avatar = document.createElement('div');
    //     avatar.classList.add('avatar', `${sender}-avatar`);
    //     avatar.textContent = sender === 'user' ? '你' : 'AI';
    //     messageContainer.appendChild(avatar);

    //     const messageDiv = document.createElement('div');
    //     messageDiv.classList.add('message', `${sender}-message`);

    //     const messageContent = document.createElement('div');
    //     messageContent.textContent = text;
    //     messageDiv.appendChild(messageContent);

    //     const timeDiv = document.createElement('div');
    //     timeDiv.classList.add('message-time');

    //     const now = new Date();
    //     timeDiv.textContent = formatTime(now);
    //     messageDiv.appendChild(timeDiv);

    //     messageContainer.appendChild(messageDiv);
    //     chatMessages.appendChild(messageContainer);
    // }
    // 添加消息到聊天界面
    function addMessage(text, sender) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', sender);

        const avatar = document.createElement('div');
        avatar.classList.add('avatar', `${sender}-avatar`);
        avatar.textContent = sender === 'user' ? '你' : 'AI';
        messageContainer.appendChild(avatar);

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        // 使用innerHTML来支持HTML换行标签
        const messageContent = document.createElement('div');
        messageContent.innerHTML = text.replace(/\n/g, '<br>');
        messageDiv.appendChild(messageContent);

        const timeDiv = document.createElement('div');
        timeDiv.classList.add('message-time');

        const now = new Date();
        timeDiv.textContent = formatTime(now);
        messageDiv.appendChild(timeDiv);

        messageContainer.appendChild(messageDiv);
        chatMessages.appendChild(messageContainer);
    }

    // 格式化时间
    function formatTime(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes}`;
    }

    // 创建新对话
    function createNewConversation() {
        const newConversation = {
            id: Date.now().toString(),
            title: '新对话 ' + (conversations.length + 1),
            messages: [],
            createdAt: new Date()
        };

        currentConversationId = newConversation.id;
        conversations.unshift(newConversation);

        // 清空聊天界面
        chatMessages.innerHTML = '';

        // 添加欢迎消息
        const welcomeMessage = "你好！我是你的聊天搭子。你可以跟我说说你的感受和想法，我会认真倾听并给予温暖的回应。今天有什么想分享的吗？";
        addMessage(welcomeMessage, 'bot');
        newConversation.messages.push({
            text: welcomeMessage,
            sender: 'bot',
            time: new Date()
        });

        // 更新历史列表
        renderHistoryList();

        // 设置第一个消息为标题
        setTimeout(() => {
            updateConversationTitle(newConversation.id, welcomeMessage);
        }, 100);
    }

    // 修改generateResponse函数为异步函数
    // async function generateResponse(userMessage) {
    //     // 获取当前对话历史
    //     const currentConversation = conversations.find(c => c.id === currentConversationId);
    //     if (!currentConversation) return "系统错误：找不到当前对话";

    //     try {
    //         // 发送POST请求到本地服务器
    //         // http://127.0.0.1:10305/generate
    //         const response = await fetch('http://36.139.135.170:11106/stream_generate', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 messages: currentConversation.messages,
    //                 newMessage: userMessage
    //             })
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const data = await response.json();
    //         console.log('solution:', data.solution);
    //         console.log('response:', data.response);
    //         // return data.response || "感谢你的分享，我理解你的感受。";
    //         return {
    //             solution: data.solution.replace(/\n/g, '<br>') || "抱歉，我还没想好该怎么回答你的问题。",
    //             response: data.response.replace(/\n/g, '<br>') || "感谢你的分享，我理解你的感受。"
    //         }

    //     } catch (error) {
    //         console.error('请求失败:', error);
    //         // 失败时使用默认回复
    //         const defaultResponses = [
    //             "请求失败，请稍后再试。",
    //             // "听起来这对你来说真的很重要。你希望得到什么样的支持呢？",
    //             // "感谢你分享这些。在这个过程中，你最大的感受是什么？"
    //         ];
    //         return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    //     }
    // }

    // // 修改sendMessage函数为异步函数
    // async function sendMessage() {
    //     const messageText = messageInput.value.trim();
    //     if (messageText === '') return;

    //     // 添加用户消息
    //     addMessage(messageText, 'user');
    //     messageInput.value = '';
    //     messageInput.style.height = 'auto';

    //     // 更新当前对话
    //     updateCurrentConversation(messageText, 'user');

    //     // 显示"正在输入"指示器
    //     typingIndicator.style.display = 'flex';
    //     chatMessages.scrollTop = chatMessages.scrollHeight;

    //     // 获取AI回复
    //     try {
    //         const botResponse = await generateResponse(messageText);
    //         typingIndicator.style.display = 'none';
    //         addMessage(botResponse.solution, 'reasoner');
    //         addMessage(botResponse.response, 'bot');
    //         updateCurrentConversation(botResponse.solution, 'reasoner');
    //         updateCurrentConversation(botResponse.response, 'bot');
    //     } catch (error) {
    //         console.error('获取回复失败:', error);
    //         typingIndicator.style.display = 'none';
    //         addMessage("抱歉，我现在无法回复你。请稍后再试。", 'bot');
    //     }

    //     chatMessages.scrollTop = chatMessages.scrollHeight;
    // }

    // 更新当前对话
    function updateCurrentConversation(text, sender) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation && (sender == 'user' || sender == 'bot')) {
            conversation.messages.push({
                text: text,
                sender: sender,
                time: new Date()
            });

            // 如果是用户的第一条消息，更新对话标题
            if (sender === 'user' && conversation.messages.filter(m => m.sender === 'user').length === 1) {
                updateConversationTitle(conversation.id, text);
            }
        }
    }

    async function generateResponse(userMessage) {
        const currentConversation = conversations.find(c => c.id === currentConversationId);
        if (!currentConversation) return "系统错误：找不到当前对话";

        try {
            const response = await fetch(`http://localhost:${SERVER_PORT}/stream_openai_generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: currentConversation.messages,
                    base_url: apiUrlInput.value,
                    api_key: apiKeyInput.value,
                    model: apiModelInput.value,
                    newMessage: userMessage,
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let solution = '';
            let responseText = '';
            let currentField = '';

            while (true) {
                const { done, value } = await reader.read();
                // console.log('value:', value);
                // console.log('done:', done);

                if (done) break;

                const chunk = decoder.decode(value);
                console.log('chunk:', chunk);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = JSON.parse(line.substring(5).trim());

                        if (data.reason != null && data.reason) {
                            solution += data.text;
                            currentField = 'solution';
                        } else {
                            responseText += data.text;
                            currentField = 'response';
                        }

                        // 实时更新消息
                        if (currentField === 'solution') {
                            updateStreamingMessage(solution, 'reasoner');
                        } else if (currentField === 'response') {
                            updateStreamingMessage(responseText, 'bot');
                        }
                    }
                }
            }

            return {
                solution: solution.replace(/\n/g, '<br>') || "抱歉，我还没想好该怎么回答你的问题。",
                response: responseText.replace(/\n/g, '<br>') || "感谢你的分享，我理解你的感受。"
            };

        } catch (error) {
            console.error('请求失败:', error);
            return {
                solution: "请求失败，请稍后再试。",
                response: "请求失败，请稍后再试。"
            };
        }
    }

    // 新增函数：更新流式消息
    function updateStreamingMessage(text, sender) {
        let messageContainer = document.querySelector(`.message-container.${sender}:last-child`);

        if (!messageContainer) {
            // 如果不存在则创建新消息容器
            messageContainer = document.createElement('div');
            messageContainer.classList.add('message-container', sender);

            const avatar = document.createElement('div');
            avatar.classList.add('avatar', `${sender}-avatar`);
            avatar.textContent = sender === 'user' ? '你' : 'AI';
            messageContainer.appendChild(avatar);

            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
            messageContainer.appendChild(messageDiv);

            chatMessages.appendChild(messageContainer);
        }

        const messageDiv = messageContainer.querySelector('.message');
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');

        // 自动滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 修改sendMessage函数
    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        // 添加用户消息
        addMessage(messageText, 'user');
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // 更新当前对话
        updateCurrentConversation(messageText, 'user');

        // 显示"正在输入"指示器
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 获取AI回复
        try {
            await generateResponse(messageText);
            typingIndicator.style.display = 'none';

            // 添加时间戳
            const now = new Date();
            const timeDiv = document.createElement('div');
            timeDiv.classList.add('message-time');
            timeDiv.textContent = formatTime(now);

            // 为最后两条消息添加时间戳
            const lastMessages = document.querySelectorAll('.message-container:not(.user)');
            if (lastMessages.length >= 2) {
                lastMessages[lastMessages.length - 2].querySelector('.message').appendChild(timeDiv.cloneNode());
                lastMessages[lastMessages.length - 1].querySelector('.message').appendChild(timeDiv.cloneNode());
            }

        } catch (error) {
            console.error('获取回复失败:', error);
            typingIndicator.style.display = 'none';
            addMessage("抱歉，我现在无法回复你。请稍后再试。", 'bot');
        }
    }

    // ... 原有代码保持不变 ...

    // 更新对话标题
    function updateConversationTitle(conversationId, text) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            // 截取前20个字符作为标题
            const newTitle = text.length > 20 ? text.substring(0, 20) + '...' : text;
            conversation.title = newTitle;
            renderHistoryList();
        }
    }

    // 渲染历史列表
    function renderHistoryList() {
        historyList.innerHTML = '';

        conversations.forEach(conversation => {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            const previewText = lastMessage ? lastMessage.text : '无消息';

            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            if (conversation.id === currentConversationId) {
                historyItem.classList.add('active');
            }

            historyItem.innerHTML = `
                <div class="history-item-title">${conversation.title}</div>
                <div class="history-item-preview">${previewText.length > 30 ? previewText.substring(0, 30) + '...' : previewText}</div>
            `;

            historyItem.addEventListener('click', () => {
                loadConversation(conversation.id);
                toggleSidebar();
            });

            historyList.appendChild(historyItem);
        });
    }

    // 加载对话
    function loadConversation(conversationId) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            currentConversationId = conversation.id;

            // 清空聊天界面
            chatMessages.innerHTML = '';

            // 加载所有消息
            conversation.messages.forEach(message => {
                addMessage(message.text, message.sender);
            });

            // 滚动到底部
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 50);

            // 更新历史列表中的活动状态
            renderHistoryList();
        }
    }

    // 点击发送按钮
    sendButton.addEventListener('click', sendMessage);

    // 按Enter键发送消息
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});
