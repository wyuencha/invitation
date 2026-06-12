const SHEET_NAME = "Dinner Invitations";
const HEADERS = [
  "Received At",
  "Response",
  "Contact Number",
  "Preferred Day",
  "Preferred Time",
  "Cuisine",
  "Submitted At",
];

function doGet() {
  return jsonResponse_({
    ok: true,
    message: "Dinner invitation receiver is running.",
  });
}

function doPost(event) {
  try {
    const payload = parsePayload_(event);

    if (!payload.contactNumber) {
      throw new Error("Contact number is required.");
    }

    const sheet = getOrCreateSheet_();
    ensureHeaderRow_(sheet);
    sheet.appendRow([
      new Date(),
      payload.response || "Yes",
      payload.contactNumber || "",
      payload.preferredDay || "",
      payload.preferredTime || "",
      payload.cuisine || "",
      payload.submittedAt || "",
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error.message,
    });
  }
}

function parsePayload_(event) {
  const rawBody = event && event.postData && event.postData.contents;

  if (!rawBody) {
    return {};
  }

  return JSON.parse(rawBody);
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaderRow_(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  const existingHeaders = headerRange.getValues()[0];
  const hasHeaders = existingHeaders.some(Boolean);

  if (!hasHeaders) {
    headerRange.setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
