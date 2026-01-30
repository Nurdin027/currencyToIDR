let key = {
    exchangerate: "",
    currencyfreaks: "",
    exchangerateCount: 0,
    currencyfreaksCount: 0,
    timeout: "",
    dollarToIdr: "",
    lastUpdate: "",
    nextUpdate: "",
}

chrome.storage.sync.get(['exchangerate', 'currencyfreaks', 'exchangerateCount', 'currencyfreaksCount', 'timeout', 'dollarToIdr', 'lastUpdate', 'nextUpdate'], (res) => {
    key = res;
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        for (let [name, {newValue}] of Object.entries(changes)) {
            if (key.hasOwnProperty(name)) {
                key[name] = newValue;
            }
        }
    }
});

async function convertToIDR(plain) {
    let hasil
    let tgl = new Date(key['lastUpdate'] * 1000)
    let nextUpdate = new Date(key['nextUpdate'] * 1000)
    if (key['dollarToIdr'] === "" || nextUpdate < new Date()) {
        try {
            const url = `https://v6.exchangerate-api.com/v6/${key['exchangerate']}/pair/USD/IDR/${plain}`
            const response = await fetch(url, {headers: {"Content-Type": "application/json"}})
            let data = await response.json()
            tgl = new Date(data['time_last_update_unix'] * 1000)
            key['lastUpdate'] = data['time_last_update_unix']
            key['nextUpdate'] = data['time_next_update_unix']
            key['dollarToIdr'] = data['conversion_rate']
            hasil = data['conversion_result']
            chrome.storage.sync.get(['exchangerateCount'], (res) => {
                let count = (res.exchangerateCount || 0) + 1;
                chrome.storage.sync.set({
                    exchangerateCount: count,
                    dollarToIdr: data['conversion_rate'],
                    lastUpdate: key['lastUpdate'],
                    nextUpdate: key['nextUpdate'],
                });
            });
        } catch (err) {
            console.warn("Error: " + err);
            return await convertToIDR2(plain);
        }
    } else {
        hasil = key['dollarToIdr'] * plain
    }
    return [hasil, tgl]
}

async function convertToIDR2(plain) {
    const url = `https://api.currencyfreaks.com/v2.0/rates/latest?apikey=${key['currencyfreaks']}`
    try {
        const response = await fetch(url, {headers: {"Content-Type": "application/json"}})
        let data = await response.json(),
            idr = data['rates']['IDR'],
            tgl = new Date(data['date'])
        idr = parseInt(idr) * parseInt(plain)
        chrome.storage.sync.get(['currencyfreaksCount'], (res) => {
            let count = (res.currencyfreaksCount || 0) + 1;
            chrome.storage.sync.set({currencyfreaksCount: count});
        });
        return [idr, tgl]
    } catch (err) {
        return "Error: " + err
    }
}

function displayResultOnPage(resultText, timeout) {
    const existing = document.getElementById("bubblena");
    if (existing) existing.remove();

    const bubble = document.createElement("div");
    bubble.id = "bubblena";
    bubble.innerHTML = resultText;
    console.log(timeout)
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
    setTimeout(() => bubble.remove(), timeout);
}

chrome.runtime.onInstalled.addListener((e) => {
    chrome.contextMenus.create({
        id: "read-text",
        title: "Dollar to IDR: %s",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "read-text") {
        let raw = info.selectionText;
        let plain = raw.replace(/\D/g, '');
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
            args: [hasil, key['timeout']]
        });
    }
});
