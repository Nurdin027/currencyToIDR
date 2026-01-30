# Currency To IDR

This is the initial release of the Currency to IDR extension. This tool allows users to easily convert currency values (
for now only USD) to Indonesian Rupiah (IDR) directly from the current web page.

* **Context Menu Conversion**
    * Simply select any text containing numbers, right-click, and choose "Dollar to IDR".
    * The conversion result appears instantly without needing to switch tabs.

### Installation & Initial Configuration

1. Install the extension in your browser.
2. Click the extension icon, then select **Settings** (or right-click the icon > Options).
3. Enter a valid **Exchangerate Key**.
4. (Optional) Adjust the **Popup Timeout** to your preference.
5. Click **Save**.

### How to Use

- **Highlight/Select** any text containing a number on a webpage (e.g., "$150").
- **Right-click** on the selection.
- Click **Dollar to IDR** from the context menu.
- A blue popup displaying the converted IDR value will appear in the bottom-right corner.

### System Requirements

* Chromium-based browser (Google Chrome, Edge, Brave, etc.).
* Internet connection to fetch the latest exchange rates.
* API Key from [exchangerate-api.com](https://www.exchangerate-api.com/).

### Technical Notes

* Permissions used: `scripting`, `activeTab`, `storage`, `contextMenus`.
* Host permissions: `v6.exchangerate-api.com`.
