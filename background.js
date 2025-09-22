// background.js (service worker)
let apiKey = null;
let targetLang = 'vi'; // default target language


// Load stored settings on startup
chrome.storage.sync.get(['openai_api_key','target_lang'], (items) => {
    apiKey = items.openai_api_key || null;
    targetLang = items.target_lang || 'vi';
});


chrome.storage.onChanged.addListener((changes) => {
    if (changes.openai_api_key) apiKey = changes.openai_api_key.newValue;
    if (changes.target_lang) targetLang = changes.target_lang.newValue;
});


// Message handler from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'translate') {
        const text = msg.text;
        translateText(text).then(result => sendResponse({ok:true, result})).catch(err => sendResponse({ok:false, error: err.message}));
        // Required for async response
        return true;
    }
});


async function translateText(text) {
    if (!apiKey) throw new Error('No API key set in extension options.');
    
    // Construct prompt for translation. You can adjust to your preferred model/payload.
    
    const system = `You are a helpful translator. Translate the user text into ${targetLang}. Keep translation concise. Output only the translated text, without extra commentary.`;


    const payload = {
        model: 'gpt-3.5-turbo',
        messages: [
        {role: 'system', content: system},
        {role: 'user', content: text}
        ],
        max_tokens: 512,
        temperature: 0.1
    };


    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)   
    });


    if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`API error ${resp.status}: ${body}`);
    }


    const data = await resp.json();
    // Extract assistant text
    const translated = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return translated ? translated.trim() : '';
}