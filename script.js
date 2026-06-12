const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8c_P3yVUYC9-al4sASZpOnVJZGPOnkKEJlaIIfRiW9XY3ZDxoRaS4Ogd7ie7LakscfQ/exec";

const yesButton = document.querySelector("#yes-button");
const noButton = document.querySelector("#no-button");
const questionPanel = document.querySelector("#question-panel");
const invitationForm = document.querySelector("#invitation-form");
const statusMessage = document.querySelector("#status-message");
const mascotCard = document.querySelector("#mascot-card");
const mainImage = document.querySelector("#main-image");
const inviteTitle = document.querySelector("#invite-title");
const leadText = document.querySelector("#lead-text");
const moodBubble = document.querySelector("#mood-bubble");
const proposalCard = document.querySelector("#proposal-card");
const sparkleLayer = document.querySelector("#sparkle-layer");

const noStates = [
  {
    title: "Are you sure? The dinner bus has snacks.",
    lead: "Maybe think one more tiny second. There might be dessert.",
    bubble: "hmm?",
    noLabel: "Think again",
    imageClass: "is-shocked",
  },
  {
    title: "What if I choose somewhere really cute?",
    lead: "Cozy lights, nice food, and I promise to be extra charming.",
    bubble: "please?",
    noLabel: "Still no",
    imageClass: "is-thinking",
  },
  {
    title: "The Yes button is getting lonely.",
    lead: "Look at it. So pink. So hopeful. So ready.",
    bubble: "pick yes",
    noLabel: "Nooo",
    imageClass: "is-pouting",
  },
  {
    title: "Okay but what about dessert after dinner?",
    lead: "Cake, gelato, chocolate, or anything you like.",
    bubble: "dessert?",
    noLabel: "Not fair",
    imageClass: "is-shocked",
  },
  {
    title: "Last chance before the cute bus gets dramatic.",
    lead: "A tiny dinner plan is waiting very politely.",
    bubble: "sad bus",
    noLabel: "Fine...",
    imageClass: "is-sad",
  },
];

let noClickCount = 0;

yesButton.addEventListener("click", (event) => {
  burstHearts(event.clientX, event.clientY, 12);
  proposalCard.classList.add("is-form-mode");
  questionPanel.hidden = true;
  invitationForm.hidden = false;
  invitationForm.querySelector("[name='contactNumber']").focus();
});

mascotCard.addEventListener("click", (event) => {
  burstHearts(event.clientX, event.clientY, 8);
});

noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  handleNoChoice(event.clientX, event.clientY);
});

noButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const rect = noButton.getBoundingClientRect();
    handleNoChoice(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
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
    invitationForm.querySelector(".form-heading h2").textContent = "Dinner ticket saved";
    submitButton.hidden = true;
    showStatus("Done. Your yes has been saved.", "success");
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Send my dinner ticket";
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

function handleNoChoice(pointerX, pointerY) {
  noClickCount += 1;

  const state = noStates[Math.min(noClickCount - 1, noStates.length - 1)];
  const yesScale = Math.min(1 + noClickCount * 0.32, 2.35);
  const horizontalNudge = Math.min(noClickCount * 22, 120);
  const verticalNudge = noClickCount % 2 === 0 ? 8 : -5;

  inviteTitle.textContent = state.title;
  leadText.textContent = state.lead;
  moodBubble.textContent = state.bubble;
  noButton.textContent = state.noLabel;

  mainImage.className = `mascot-image ${state.imageClass}`;
  yesButton.style.setProperty("--yes-scale", yesScale);
  yesButton.style.transform = `scale(${yesScale})`;
  noButton.style.setProperty("--no-x", `${horizontalNudge}px`);
  noButton.style.setProperty("--no-y", `${verticalNudge}px`);
  noButton.style.setProperty("--no-rotate", `${randomBetween(-7, 7).toFixed(1)}deg`);

  burstHearts(pointerX, pointerY, 4);
}

function burstHearts(originX, originY, count) {
  const x = originX || window.innerWidth / 2;
  const y = originY || window.innerHeight / 2;

  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count;
    const distance = randomBetween(54, 132);

    heart.className = "pop-heart";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--pop-x", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--pop-y", `${Math.sin(angle) * distance - 35}px`);

    sparkleLayer.append(heart);
    window.setTimeout(() => heart.remove(), 950);
  }
}

function randomBetween(min, max) {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  return safeMin + Math.random() * (safeMax - safeMin);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
