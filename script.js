const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8c_P3yVUYC9-al4sASZpOnVJZGPOnkKEJlaIIfRiW9XY3ZDxoRaS4Ogd7ie7LakscfQ/exec";

const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
const choiceZone = document.querySelector("#choice-zone");
const questionPanel = document.querySelector("#question-panel");
const invitationForm = document.querySelector("#invitation-form");
const statusMessage = document.querySelector("#status-message");

let escapeX = 0;
let escapeY = 0;

yesButton.addEventListener("click", () => {
  questionPanel.hidden = true;
  invitationForm.hidden = false;
  invitationForm.querySelector("[name='contactNumber']").focus();
});

document.addEventListener("pointermove", (event) => {
  if (questionPanel.hidden) {
    return;
  }

  const buttonRect = noButton.getBoundingClientRect();
  const buttonCenterX = buttonRect.left + buttonRect.width / 2;
  const buttonCenterY = buttonRect.top + buttonRect.height / 2;
  const distance = Math.hypot(event.clientX - buttonCenterX, event.clientY - buttonCenterY);

  if (distance < 150) {
    moveNoButtonAwayFrom(event.clientX, event.clientY);
  }
});

noButton.addEventListener("pointerenter", (event) => {
  moveNoButtonAwayFrom(event.clientX, event.clientY);
});

noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveNoButtonAwayFrom(event.clientX, event.clientY);
});

noButton.addEventListener("focus", () => {
  const rect = noButton.getBoundingClientRect();
  moveNoButtonAwayFrom(rect.left + rect.width / 2, rect.top + rect.height / 2);
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

function moveNoButtonAwayFrom(pointerX, pointerY) {
  const zoneRect = choiceZone.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const currentLeft = buttonRect.left - zoneRect.left;
  const currentTop = buttonRect.top - zoneRect.top;
  const maxX = Math.max(0, zoneRect.width - buttonRect.width);
  const maxY = Math.max(0, zoneRect.height - buttonRect.height);
  const pointerInZoneX = pointerX - zoneRect.left;
  const pointerInZoneY = pointerY - zoneRect.top;

  const targetLeft = pointerInZoneX < zoneRect.width / 2
    ? clamp(randomBetween(zoneRect.width * 0.58, maxX), 0, maxX)
    : clamp(randomBetween(0, zoneRect.width * 0.2), 0, maxX);
  const targetTop = pointerInZoneY < zoneRect.height / 2
    ? clamp(randomBetween(zoneRect.height * 0.48, maxY), 0, maxY)
    : clamp(randomBetween(0, zoneRect.height * 0.12), 0, maxY);

  escapeX += clamp(targetLeft - currentLeft, -260, 260);
  escapeY += clamp(targetTop - currentTop, -110, 110);

  noButton.classList.add("is-escaping");
  noButton.style.setProperty("--escape-x", `${Math.round(escapeX)}px`);
  noButton.style.setProperty("--escape-y", `${Math.round(escapeY)}px`);

  window.setTimeout(() => {
    noButton.classList.remove("is-escaping");
  }, 140);
}

function randomBetween(min, max) {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  return safeMin + Math.random() * (safeMax - safeMin);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
