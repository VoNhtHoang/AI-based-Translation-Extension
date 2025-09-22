const apiKeyInput = document.getElementById('apiKey');
const targetInput = document.getElementById('targetLang');
const msg = document.getElementById('msg');

document.getElementById('save').addEventListener('click', ()=>{
    const apiKey = apiKeyInput.value.trim();
    const target = targetInput.value.trim() || 'vi';

    chrome.storage.sync.set({openai_api_key: apiKey, target_lang: target}, ()=>{
        msg.textContent = 'Saved.';
        setTimeout( ()=> msg.textContent='', (1200));
        console.log("[i] message text Content Saved!");
    });
});


// Load existing
chrome.storage.sync.get(['openai_api_key','target_lang'], (items)=>{
    apiKeyInput.value = items.openai_api_key || '';
    targetInput.value = items.target_lang || 'vi';
});