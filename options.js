chrome.storage.sync.get(['exchangerate', 'exchangerateCount', 'currencyfreaks', 'currencyfreaksCount', 'timeout'], (res) => {
    if (res.exchangerate) document.getElementById('exchangerate').value = res.exchangerate;
    if (res.currencyfreaks) document.getElementById('currencyfreaks').value = res.currencyfreaks;
    if (res.timeout) document.getElementById('popupTimeout').value = res.timeout;
    document.getElementById('exchangerateCount').textContent = res.exchangerateCount || 0;
    document.getElementById('currencyfreaksCount').textContent = res.currencyfreaksCount || 0;
    document.getElementById('popupTimeout').textContent = res.timeout || 10000;
});

document.getElementById('save').addEventListener('click', () => {
    const exchangerate = document.getElementById('exchangerate').value;
    const currencyfreaks = document.getElementById('currencyfreaks').value;
    const timeout = document.getElementById('popupTimeout').value;
    chrome.storage.sync.set({exchangerate: exchangerate, currencyfreaks: currencyfreaks, timeout: timeout}, () => {
        document.getElementById('alert').classList.add('show');
        setTimeout(() => {
            document.getElementById('alert').classList.remove('show');
        }, 1500)
    });
});

