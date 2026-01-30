chrome.storage.sync.get(['exchangerate', 'exchangerateCount', 'currencyfreaks', 'currencyfreaksCount'], (res) => {
    if (!res.exchangerate || !res.exchangerate) {
        chrome.runtime.openOptionsPage();
    }

    document.getElementById('exchangerateCount').textContent = res.exchangerateCount || 0;
    document.getElementById('currencyfreaksCount').textContent = res.currencyfreaksCount || 0;
});

document.getElementById('openOptions').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});


