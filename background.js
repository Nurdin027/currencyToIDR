let key = {
    exchangerate: "",
    exchangerateCount: 0,
    timeout: "",
    dollarToIdr: "",
    lastUpdate: "",
    nextUpdate: "",
    convertToIdr: {},
}

chrome.storage.sync.get(['exchangerate', 'exchangerateCount', 'timeout', 'dollarToIdr', 'lastUpdate', 'nextUpdate'], (res) => {
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

async function convertToIDR(plain, source = "USD") {
    let hasil
    let tgl = new Date(key['lastUpdate'] * 1000)
    let nextUpdate = new Date(key['nextUpdate'] * 1000)
    if ([undefined, ""].includes(key['convertToIdr']) || nextUpdate < new Date()) {
        try {
            const url = `https://v6.exchangerate-api.com/v6/e31cb57afd9257036c5ff200/latest/IDR`
            const response = await fetch(url, {headers: {"Content-Type": "application/json"}})
            let data = await response.json()
            tgl = new Date(data['time_last_update_unix'] * 1000)
            key['lastUpdate'] = data['time_last_update_unix']
            key['nextUpdate'] = data['time_next_update_unix']
            key['convertToIdr'] = data['conversion_rates']

            chrome.storage.sync.get(['exchangerateCount'], (res) => {
                let count = (res.exchangerateCount || 0) + 1;
                chrome.storage.sync.set({
                    exchangerateCount: count,
                    convertToIdr: data['conversion_rates'],
                    lastUpdate: key['lastUpdate'],
                    nextUpdate: key['nextUpdate'],
                });
            });
        } catch (err) {
            console.warn("Error: " + err);
        }
    }
    hasil = (1 / key['convertToIdr'][source]) * plain
    return [hasil, tgl]
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
        title: "Convert to IDR: %s",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "from-dollar",
        parentId: "read-text",
        title: "USD to IDR: %s",
        contexts: ["selection"],
    });
    chrome.contextMenus.create({
        id: "from-euro",
        parentId: "read-text",
        title: "EUR to IDR: %s",
        contexts: ["selection"],
    });
    chrome.contextMenus.create({
        id: "from-pound",
        parentId: "read-text",
        title: "GBP to IDR: %s",
        contexts: ["selection"],
    });
    chrome.contextMenus.create({
        id: "from-yen",
        parentId: "read-text",
        title: "JPY to IDR: %s",
        contexts: ["selection"],
    });
    chrome.contextMenus.create({
        id: "from-yuan",
        parentId: "read-text",
        title: "CNY to IDR: %s",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "") {
        let source
        switch (info.menuItemId) {
            case "from-dollar":
                source = "USD"
                break;
            case "from-euro":
                source = "EUR"
                break;
            case "from-pound":
                source = "GBP"
                break;
            case "from-yen":
                source = "JPY"
                break;
            case "from-yuan":
                source = "CNY"
                break;
            default:
                source = "USD"
        }
        let raw = info.selectionText;
        let plain = raw.replace(/[^\d.]/g, "");
        const res = await convertToIDR(plain, source)
        let idr = res[0],
            updated = res[1]
        let hasil = `
            <div>
                <strong>Rp.${parseInt(idr).toLocaleString('id-ID')}<strong>
                <br>
                Updated: ${updated.toLocaleString('id-ID')}
            </div>
        `;

        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            func: displayResultOnPage,
            args: [hasil, key['timeout']]
        });
    }
});
