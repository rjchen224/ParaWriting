好的，没问题！根据你的需求，我们来创建一个纯前端的 `ParaWriting` 项目。这个项目将包含 HTML、CSS 和 JavaScript 文件，直接调用 Deepseek API，并将 API 密钥存储在浏览器的 `localStorage` 中，非常适合部署到 GitHub Pages。

**项目结构:**

```
codelab/
├── VocabLevel/
│   └── ... (你的旧项目文件)
└── ParaWriting/
    ├── index.html
    ├── style.css
    └── script.js
```

**1. `index.html` (页面结构)**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ParaWriting - 英语写作润色助手</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>ParaWriting（英语写作润色助手）by Magic Pan Qiwei</h1>

    <div id="apiKeySection">
        <label for="apiKeyInput">Deepseek API Key:</label>
        <input type="password" id="apiKeyInput" placeholder="在此输入你的 API Key">
        <button id="saveApiKeyButton">保存 Key</button>
        <p class="api-key-status" id="apiKeyStatus">请先输入并保存你的 Deepseek API Key。</p>
    </div>

    <div class="container">
        <!-- Box 1: Input Text -->
        <div class="box">
            <h2>你的原文</h2>
            <textarea id="inputText" placeholder="在此粘贴你的英文写作文本..."></textarea>
            <button id="polishButton">开始润色</button>
            <p id="statusMessage" class="status-message"></p> <!-- 用于显示状态或错误 -->
        </div>

        <!-- Box 2: Grammar Fix Output -->
        <div class="box">
            <h2>语法修正版（带标记）</h2>
            <textarea id="grammarOutput" placeholder="修正语法错误，改动处将用 [] 标记..." readonly></textarea>
        </div>

        <!-- Box 3: IELTS 7 Output -->
        <div class="box">
            <h2>雅思 7 分水平润色</h2>
            <textarea id="ielts7Output" placeholder="润色至雅思 7 分水平..." readonly></textarea>
        </div>

        <!-- Box 4: IELTS 9 Output -->
        <div class="box">
            <h2>雅思 9 分水平润色</h2>
            <textarea id="ielts9Output" placeholder="润色至雅思 9 分水平..." readonly></textarea>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

**2. `style.css` (页面样式)**

```css
body {
    font-family: sans-serif;
    margin: 20px;
    background-color: #f4f4f4;
    line-height: 1.6;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
}

#apiKeySection {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 10px; /* Creates space between items */
    flex-wrap: wrap; /* Allows items to wrap on smaller screens */
}

#apiKeySection label {
    font-weight: bold;
}

#apiKeyInput {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex-grow: 1; /* Allows input to take available space */
    min-width: 200px; /* Minimum width for the input */
}

#saveApiKeyButton {
    padding: 8px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

#saveApiKeyButton:hover {
    background-color: #0056b3;
}

.api-key-status {
    font-size: 0.9em;
    color: #666;
    margin-left: 10px; /* Add some space from the button */
}

.container {
    display: flex;
    gap: 20px; /* Space between columns */
    align-items: flex-start; /* Align items to the top */
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.box {
    flex: 1; /* Each box tries to take equal space */
    min-width: 250px; /* Minimum width before wrapping */
    background-color: #fff;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column; /* Stack elements vertically */
}

.box h2 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #555;
    font-size: 1.1em;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}

textarea {
    width: 100%;
    height: 300px; /* Adjust as needed */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box; /* Include padding and border in width/height */
    margin-bottom: 15px;
    font-size: 0.95em;
    resize: vertical; /* Allow vertical resizing */
}

textarea[readonly] {
    background-color: #e9ecef; /* Slightly different background for output */
    color: #495057;
}

#polishButton {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
    align-self: flex-start; /* Align button to the start of the flex container */
}

#polishButton:hover {
    background-color: #218838;
}

#polishButton:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.status-message {
    margin-top: 10px;
    font-size: 0.9em;
    min-height: 1.2em; /* Reserve space */
}

.status-message.error {
    color: #dc3545; /* Red for errors */
    font-weight: bold;
}

.status-message.loading {
    color: #007bff; /* Blue for loading */
}
```

**3. `script.js` (核心逻辑)**

```javascript
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
            apiKeyInput.value = storedKey; // Optionally pre-fill for user convenience
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
        // Check for API Key again before calling
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
                    model: "deepseek-chat", // Or choose another suitable model
                    messages: [
                        { "role": "system", "content": "You are a helpful assistant that polishes English text." },
                        { "role": "user", "content": prompt }
                    ],
                    // Optional parameters:
                    // max_tokens: 1024,
                    // temperature: 0.7,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error Response:", errorData);
                throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                 // Sometimes the response might have leading/trailing whitespace or quotes
                 return data.choices[0].message.content.trim();
            } else {
                console.error("Unexpected API response format:", data);
                throw new Error("Failed to get a valid response from the API.");
            }

        } catch (error) {
            console.error('Error calling Deepseek API:', error);
            // Re-throw the error so the calling function can handle it
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

        // --- Make API Calls (Sequentially for Simplicity) ---
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
            statusMessage.className = 'status-message success'; // Optional: Add a success class in CSS

        } catch (error) {
            // --- UI Update: Error ---
            console.error("Processing failed:", error);
            statusMessage.textContent = `错误：${error.message}`;
            statusMessage.className = 'status-message error';
            // Optionally clear or indicate error in specific output boxes if possible
            if (!grammarOutput.value.includes('处理中')) grammarOutput.value += '\n\n-- 处理失败 --';
            if (!ielts7Output.value.includes('处理中')) ielts7Output.value += '\n\n-- 处理失败 --';
            if (!ielts9Output.value.includes('处理中')) ielts9Output.value += '\n\n-- 处理失败 --';

        } finally {
            // --- UI Update: End Loading ---
            polishButton.disabled = false;
             // Keep the status message as success or error, don't clear it immediately
            // If you want to clear it after a delay:
            // setTimeout(() => { statusMessage.textContent = ''; statusMessage.className = 'status-message'; }, 5000);
        }
    });
});
```

**说明:**

1.  **HTML (`index.html`):**
    *   设置了页面标题和主标题。
    *   添加了一个 `apiKeySection` 用于输入和保存 Deepseek API Key。
    *   创建了 `container` div，使用 Flexbox 布局四个 `box` div。
    *   每个 `box` 包含一个标题 (`h2`) 和一个 `textarea`。
    *   第一个 `box` 有 "开始润色" 按钮 (`polishButton`) 和一个状态消息区域 (`statusMessage`)。
    *   输出的 `textarea` 设置了 `readonly` 属性。

2.  **CSS (`style.css`):**
    *   提供了基本的页面和元素样式。
    *   使用 `display: flex` 和 `gap` 来创建垂直列布局。
    *   `flex: 1` 让每个 box 平分可用宽度。
    *   为按钮、输入框、文本域等添加了样式。
    *   添加了简单的加载和错误状态样式 (`.loading`, `.error`)。
    *   设置 `textarea` 为 `resize: vertical;` 允许用户调整高度。
    *   为 API Key 部分添加了样式，使其更清晰。

3.  **JavaScript (`script.js`):**
    *   **API Key:** 使用 `localStorage` 来存储和读取 API Key，避免每次都输入。提供了保存按钮和状态反馈。
    *   **`callDeepseekAPI` 函数:** 封装了调用 Deepseek API 的 `fetch` 请求逻辑，包括设置请求头、请求体和基本的错误处理。
    *   **事件监听:**
        *   监听 "保存 Key" 按钮点击，调用 `saveApiKey`。
        *   页面加载时 (`DOMContentLoaded`) 调用 `loadApiKey` 尝试加载已存的 Key。
        *   监听 "开始润色" 按钮点击。
    *   **润色流程:**
        *   获取用户输入和 API Key。
        *   进行输入验证（API Key 和文本是否为空）。
        *   更新 UI 显示加载状态，禁用按钮。
        *   构建三个不同的 `prompt`，分别用于语法修正（带标记）、雅思 7 分润色、雅思 9 分润色。特别指示模型不要输出额外文字（如 "Here is the corrected text:"），并且在语法修正时使用 `[]`。
        *   **依次**调用 `callDeepseekAPI` 函数三次（注意：并行调用 `Promise.all` 可能更快，但如果 API 对并发有限制或为了简单起见，顺序调用更稳妥）。
        *   将 API 返回的结果填充到对应的 `textarea` 中。
        *   处理可能发生的错误，并在 `statusMessage` 中显示错误信息。
        *   无论成功或失败，最后都更新 UI（启用按钮，显示最终状态）。

**部署到 GitHub Pages:**

1.  将 `ParaWriting` 文件夹（包含 `index.html`, `style.css`, `script.js`）推送到你的 GitHub 仓库。
2.  在仓库的 "Settings" -> "Pages" 部分，选择部署源（通常是 `main` 或 `master` 分支的 `/` 根目录或 `/docs` 目录）。
3.  GitHub Pages 会为你生成一个 `*.github.io` 的 URL，你的 ParaWriting 应用就可以在线访问了。

用户首次访问时需要输入他们的 Deepseek API Key 并点击保存，之后 Key 会存储在他们自己的浏览器中，后续访问无需再次输入（除非清除浏览器数据）。