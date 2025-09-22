// content.js
(function(){
    let lastSelection = '';
    let debounceTimer = null;
    const DEBOUNCE_MS = 600; // tránh gọi API quá nhanh

    function createBubble(){
        const bubble = document.createElement('div');
        bubble.id = 'auto-trans-bubble';
        
        Object.assign(bubble.style, {
            position: 'absolute',
            zIndex: 2147483647,
            background: 'white',
            border: '1px solid #666',
            padding: '8px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            maxWidth: '480px',
            whiteSpace: 'pre-wrap',
            fontSize: '13px'
            });
        
        bubble.addEventListener('mousedown', (e)=> {e.stopPropagation(); });

        document.body.appendChild(bubble);

        return bubble;
    }

    function removeBubble() {
        const ex = document.getElementById('auto-translate-bubble');
        if (ex) ex.remove();
    }


    function showBubble(x,y,text) {
        let b = document.getElementById('auto-translate-bubble');

        if (!b) b = createBubble();
        
        b.textContent = text || '';
        b.style.left = x + 'px';
        b.style.top = y + 'px';

    }


    // Get the current selection text
    function getSelectionText() {
        const sel = window.getSelection();
        if (!sel) return '';
        return sel.toString().trim();
    }


    async function requestTranslate(text, clientRect) {
        try {
            const resp = await chrome.runtime.sendMessage({type:'translate', text});

            if (resp && resp.ok) {
                // show bubble near selection
                const x = clientRect ? (clientRect.left + window.scrollX) : (window.scrollX + 20);
                const y = clientRect ? (clientRect.bottom + window.scrollY + 8) : (window.scrollY + 20);

                showBubble(x, y, resp.result);

            } else {

                showBubble(clientRect.left + window.scrollX, clientRect.bottom + window.scrollY + 8, 'Translation error: ' + (resp && resp.error ? resp.error : 'unknown'));
            }
        } 
        catch (e) {
            console.error('translate error', e);
        }
    }


    // Listen for mouseup to detect selection
    document.addEventListener('mouseup', (ev) => {
        const text = getSelectionText();
        removeBubble();
        if (!text) return;
        // ignore very short selections (optionally)
        if (text.length < 2) return;


        // get bounding rect for placement
        const sel = window.getSelection();
        const range = sel.rangeCount ? sel.getRangeAt(0) : null;
        const rect = range ? range.getBoundingClientRect() : null;


        // debounce calls
        if (debounceTimer) clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
            requestTranslate(text, rect);
        }, DEBOUNCE_MS);
    });


        // Hide bubble when clicking elsewhere or when selection cleared
    document.addEventListener('mousedown', (ev) => {
        const sel = getSelectionText();
        if (!sel) removeBubble();
        console.log("[i] Selected Text: ", sel);
    });

})();