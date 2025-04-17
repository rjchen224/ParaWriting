document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyButton = document.getElementById('saveApiKeyButton');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    const inputText = document.getElementById('inputText');
    const polishButton = document.getElementById('polishButton');
    const grammarOutput = document.getElementById('grammarOutput');
    const ielts7Output = document.getElementById('ielts7Output');
    const ielts9Output = document.getElementById('ielts9Output');
    const statusMessage = document.getElementById('statusMessage');

    const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
    const API_KEY_STORAGE_KEY = 'deepseek_api_key';

    // --- API Key Management ---
    function loadApiKey() {
        const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (storedKey) {
            apiKeyInput.value = storedKey;
            apiKeyStatus.textContent = 'API Key 已加载。';
            apiKeyStatus.style.color = 'green';
        } else {
            apiKeyStatus.textContent = '请先输入并保存你的 Deepseek API Key。';
            apiKeyStatus.style.color = '#666';
        }
    }

    function saveApiKey() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
            apiKeyStatus.textContent = 'API Key 已保存！';
            apiKeyStatus.style.color = 'green';
            console.log('API Key saved.');
        } else {
            apiKeyStatus.textContent = 'API Key 不能为空！';
            apiKeyStatus.style.color = 'red';
        }
    }

    saveApiKeyButton.addEventListener('click', saveApiKey);

    // Load API key on page load
    loadApiKey();

    // --- Core API Call Function ---
    async function callDeepseekAPI(prompt, apiKey) {
        if (!apiKey) {
            throw new Error("API Key is missing. Please save your API Key first.");
        }

        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { "role": "system", "content": "You are a helpful assistant that polishes English text." },
                        { "role": "user", "content": prompt }
                    ],
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Response:", errorData);
                throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                 return data.choices[0].message.content.trim();
            } else {
                console.error("Unexpected API response format:", data);
                throw new Error("Failed to get a valid response from the API.");
            }

        } catch (error) {
            console.error('Error calling Deepseek API:', error);
            throw error;
        }
    }

    // --- Polishing Logic ---
    polishButton.addEventListener('click', async () => {
        const originalText = inputText.value.trim();
        const apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);

        if (!apiKey) {
            statusMessage.textContent = '错误：请先输入并保存 API Key。';
            statusMessage.className = 'status-message error';
            apiKeyInput.focus();
            return;
        }

        if (!originalText) {
            statusMessage.textContent = '错误：请输入需要润色的文本。';
            statusMessage.className = 'status-message error';
            inputText.focus();
            return;
        }

        // --- UI Update: Start Loading ---
        statusMessage.textContent = '正在处理，请稍候...';
        statusMessage.className = 'status-message loading';
        polishButton.disabled = true;
        grammarOutput.value = '处理中...';
        ielts7Output.value = '处理中...';
        ielts9Output.value = '处理中...';

        // --- Prepare Prompts ---
        const grammarPrompt = `Please correct the grammar and spelling errors in the following text. Mark all changes you make using square brackets [] around the corrected or added parts. Only output the corrected text with markers, nothing else.

Original text:
"${originalText}"`;

        const ielts7Prompt = `Please rewrite the following text to achieve the level of an IELTS Band 7 score. Focus on improving vocabulary choice, sentence structure variety, coherence, and cohesion, while maintaining the original meaning. Do not use any special markers like brackets. Only output the rewritten text, nothing else.

Original text:
"${originalText}"`;

        const ielts9Prompt = `Please rewrite the following text to achieve the level of an IELTS Band 9 score. Focus on using sophisticated and precise vocabulary, complex and varied sentence structures, natural idiomatic expressions, and flawless coherence and cohesion, while preserving the original meaning. Do not use any special markers like brackets. Only output the rewritten text, nothing else.

Original text:
"${originalText}"`;

        // --- Make API Calls ---
        try {
            // 1. Grammar Fix
            statusMessage.textContent = '正在修正语法...';
            const grammarResult = await callDeepseekAPI(grammarPrompt, apiKey);
            grammarOutput.value = grammarResult;

            // 2. IELTS 7 Polish
            statusMessage.textContent = '正在生成雅思 7 分版本...';
            const ielts7Result = await callDeepseekAPI(ielts7Prompt, apiKey);
            ielts7Output.value = ielts7Result;

            // 3. IELTS 9 Polish
            statusMessage.textContent = '正在生成雅思 9 分版本...';
            const ielts9Result = await callDeepseekAPI(ielts9Prompt, apiKey);
            ielts9Output.value = ielts9Result;

            // --- UI Update: Success ---
            statusMessage.textContent = '润色完成！';
            statusMessage.className = 'status-message success';

        } catch (error) {
            // --- UI Update: Error ---
            console.error("Processing failed:", error);
            statusMessage.textContent = `错误：${error.message}`;
            statusMessage.className = 'status-message error';
            if (!grammarOutput.value.includes('处理中')) grammarOutput.value += '\n\n-- 处理失败 --';
            if (!ielts7Output.value.includes('处理中')) ielts7Output.value += '\n\n-- 处理失败 --';
            if (!ielts9Output.value.includes('处理中')) ielts9Output.value += '\n\n-- 处理失败 --';

        } finally {
            polishButton.disabled = false;
        }
    });
});
