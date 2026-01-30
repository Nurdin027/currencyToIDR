chrome.storage.sync.get(['exchangerate', 'exchangerateCount', 'timeout'], (res) => {
    if (res.exchangerate) document.getElementById('exchangerate').value = res.exchangerate;
    if (res.timeout) document.getElementById('popupTimeout').value = res.timeout;
    document.getElementById('exchangerateCount').textContent = res.exchangerateCount || 0;
    document.getElementById('popupTimeout').textContent = res.timeout || 10000;
});

document.getElementById('save').addEventListener('click', () => {
    const exchangerate = document.getElementById('exchangerate').value;
    const timeout = document.getElementById('popupTimeout').value;
    chrome.storage.sync.set({exchangerate: exchangerate, timeout: timeout}, () => {
        document.getElementById('alert').classList.add('show');
        setTimeout(() => {
            document.getElementById('alert').classList.remove('show');
        }, 1500)
    });
});

