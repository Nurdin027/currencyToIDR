document.getElementById("btnRead").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => window.getSelection().toString(),
    }, (results) => {
        if (results && results[0]?.result) {
            document.getElementById("output").innerText = results[0].result;
        }
    });
});