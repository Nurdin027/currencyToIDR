import {EXCHANGERATE_API_URL, CURRENCYFREAKS_API_URL} from './config.js';

async function convertToIDR(plain) {
    const url = `https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_URL}/pair/USD/IDR/${plain}`
    try {
        const response = await fetch(url, {headers: {"Content-Type": "application/json"}})
        let data = await response.json(),
            tgl = new Date(data['time_last_update_unix'] * 1000)
        return [data['conversion_result'], tgl]
    } catch (err) {
        console.log("Error: " + err);
        return await convertToIDR2(plain);
    }

}

async function convertToIDR2(plain) {
    const url = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${CURRENCYFREAKS_API_URL}`
    try {
        const response = await fetch(url, {headers: {"Content-Type": "application/json"}})
        let data = await response.json(),
            idr = data['rates']['IDR'],
            tgl = new Date(data['date'])
        idr = parseInt(idr) * parseInt(plain)
        return [idr, tgl]
    } catch (err) {
        return "Error: " + err
    }
}

function displayResultOnPage(resultText) {
    const existing = document.getElementById("bubblena");
    if (existing) existing.remove();

    const bubble = document.createElement("div");
    bubble.id = "bubblena";
    bubble.innerHTML = resultText;

    Object.assign(bubble.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        zIndex: '999999',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px'
    });
    document.body.appendChild(bubble);
    bubble.addEventListener("click", () => bubble.remove());
    setTimeout(() => bubble.remove(), 10000);
}

chrome.runtime.onInstalled.addListener((e) => {
    chrome.contextMenus.create({
        id: "read-text",
        title: "Convert to IDR: %s",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "read-text") {
        let plain = info.selectionText
        plain = plain.replace(/\D/g, '');
        const res = await convertToIDR(plain)
        let idr = res[0],
            updated = res[1]

        let hasil = `
            <strong>Rp.${parseInt(idr).toLocaleString('id-ID')}<strong>
            <br>
            Updated: ${updated.toLocaleString('id-ID')}
        `;

        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: displayResultOnPage,
            args: [hasil]
        });
    }
});
