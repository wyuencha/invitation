# Dinner Invitation Site

A cute static dinner invitation page with one allowed response: yes. After she fills in her contact number and dinner preferences, the form can submit to a Google Sheet through Google Apps Script.

## Connect Google Sheets

1. Create a new Google Sheet.
2. Open **Extensions > Apps Script**.
3. Paste the contents of `google-apps-script.gs` into the Apps Script editor.
4. Click **Deploy > New deployment**.
5. Choose **Web app**.
6. Set **Execute as** to **Me**.
7. Set access to **Anyone** or **Anyone with the link**.
8. Deploy and copy the web app URL ending in `/exec`.
9. In `script.js`, replace `PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE` with that URL.

After that, each submit creates a row in the `Dinner Invitations` sheet tab.

## Local Preview

Open `index.html` in a browser. The form will show a connection warning until the Apps Script URL is added.

## Files

- `index.html`: invitation, mascot scene, and form markup
- `styles.css`: responsive cute theme, floating hearts, and button states
- `script.js`: yes flow, playful interactions, and Google Sheets submit
- `google-apps-script.gs`: Google Sheets receiver
- `assets/cute-invite-theme.png`: generated cute theme image used by the page
