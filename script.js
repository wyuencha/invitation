const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8c_P3yVUYC9-al4sASZpOnVJZGPOnkKEJlaIIfRiW9XY3ZDxoRaS4Ogd7ie7LakscfQ/exec";

const yesButton = document.querySelector("#yes-button");
const questionPanel = document.querySelector("#question-panel");
const invitationForm = document.querySelector("#invitation-form");
const statusMessage = document.querySelector("#status-message");

yesButton.addEventListener("click", () => {
  questionPanel.hidden = true;
  invitationForm.hidden = false;
  invitationForm.querySelector("[name='contactNumber']").focus();
});

invitationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = invitationForm.querySelector("button[type='submit']");
  const payload = createPayload(new FormData(invitationForm));

  if (!isGoogleScriptUrlConfigured()) {
    showStatus("Google Sheet is not connected yet.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";
  showStatus("Sending your answer...", "");

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    invitationForm.reset();
    invitationForm.querySelector(".field-grid").hidden = true;
    invitationForm.querySelector(".full-field").hidden = true;
    invitationForm.querySelector(".form-heading h2").textContent = "Dinner details saved";
    submitButton.hidden = true;
    showStatus("Done. Your yes has been saved.", "success");
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Submit my yes";
    showStatus("Could not submit right now. Please try again.", "error");
  }
});

function createPayload(formData) {
  return {
    response: "Yes",
    contactNumber: clean(formData.get("contactNumber")),
    preferredDay: clean(formData.get("preferredDay")),
    preferredTime: clean(formData.get("preferredTime")),
    cuisine: clean(formData.get("cuisine")),
    vibe: clean(formData.get("vibe")),
    dessert: clean(formData.get("dessert")),
    dietaryPreference: clean(formData.get("dietaryPreference")),
    meetingPreference: clean(formData.get("meetingPreference")),
    note: clean(formData.get("note")),
    submittedAt: new Date().toISOString(),
  };
}

function clean(value) {
  return String(value || "").trim();
}

function isGoogleScriptUrlConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(GOOGLE_SCRIPT_URL);
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("is-error", type === "error");
  statusMessage.classList.toggle("is-success", type === "success");
}
