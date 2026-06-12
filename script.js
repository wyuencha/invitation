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
    title: "你确定吗？晚餐车上有小零食哦。",
    lead: "再考虑一小下嘛，说不定还有甜点。",
    bubble: "嗯？",
    noLabel: "再想想",
    imageClass: "is-shocked",
  },
  {
    title: "如果我选一个很可爱的地方呢？",
    lead: "温柔的灯光、好吃的食物，而且我保证会特别有魅力。",
    bubble: "拜托嘛？",
    noLabel: "还是不要",
    imageClass: "is-thinking",
  },
  {
    title: "“可以”按钮快寂寞了。",
    lead: "你看它，粉粉嫩嫩，满怀希望，已经准备好了。",
    bubble: "选可以",
    noLabel: "不要啦",
    imageClass: "is-pouting",
  },
  {
    title: "那晚餐后再加甜点怎么样？",
    lead: "蛋糕、冰淇淋、巧克力，或者任何你喜欢的。",
    bubble: "甜点？",
    noLabel: "太犯规了",
    imageClass: "is-shocked",
  },
  {
    title: "最后机会啦，不然可爱晚餐车要开始演了。",
    lead: "一个小小的晚餐计划正在很礼貌地等你。",
    bubble: "伤心车车",
    noLabel: "好吧...",
    imageClass: "is-sad",
  },
];

let noClickCount = 0;
let noEscapeMode = false;
let noOffsetX = 0;
let noOffsetY = 0;
let lastEscapeAt = 0;

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

  if (noEscapeMode) {
    escapeNoButtonFrom(event.clientX, event.clientY);
    return;
  }

  handleNoChoice(event.clientX, event.clientY);
});

noButton.addEventListener("pointerenter", (event) => {
  if (noEscapeMode) {
    escapeNoButtonFrom(event.clientX, event.clientY);
  }
});

document.addEventListener("pointermove", (event) => {
  if (!noEscapeMode || questionPanel.hidden) {
    return;
  }

  const noRect = noButton.getBoundingClientRect();
  const noCenterX = noRect.left + noRect.width / 2;
  const noCenterY = noRect.top + noRect.height / 2;
  const distance = Math.hypot(event.clientX - noCenterX, event.clientY - noCenterY);

  if (distance < 150) {
    escapeNoButtonFrom(event.clientX, event.clientY);
  }
});

noButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    const rect = noButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (noEscapeMode) {
      escapeNoButtonFrom(centerX, centerY);
      return;
    }

    handleNoChoice(centerX, centerY);
  }
});

invitationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = invitationForm.querySelector("button[type='submit']");
  const payload = createPayload(new FormData(invitationForm));

  if (!isGoogleScriptUrlConfigured()) {
    showStatus("Google Sheet 还没有连接。", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "送出中...";
  showStatus("正在送出你的回答...", "");

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
    invitationForm.querySelector(".form-heading h2").textContent = "晚餐券已保存";
    submitButton.hidden = true;
    showStatus("完成啦，你的“可以”已经保存。", "success");
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "送出我的晚餐券";
    showStatus("现在暂时送不出去，请再试一次。", "error");
  }
});

function createPayload(formData) {
  return {
    response: "可以",
    contactNumber: clean(formData.get("contactNumber")),
    preferredDay: clean(formData.get("preferredDay")),
    preferredTime: clean(formData.get("preferredTime")),
    cuisine: clean(formData.get("cuisine")),
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
  noOffsetX = horizontalNudge;
  noOffsetY = verticalNudge;
  noButton.style.setProperty("--no-x", `${noOffsetX}px`);
  noButton.style.setProperty("--no-y", `${noOffsetY}px`);
  noButton.style.setProperty("--no-rotate", `${randomBetween(-7, 7).toFixed(1)}deg`);

  if (noClickCount >= noStates.length) {
    noEscapeMode = true;
    moodBubble.textContent = "逃跑的不要";
    noButton.textContent = "抓到我呀";
    noButton.classList.add("is-runaway");
  }

  burstHearts(pointerX, pointerY, 4);
}

function escapeNoButtonFrom(pointerX, pointerY) {
  const now = Date.now();

  if (now - lastEscapeAt < 90) {
    return;
  }

  lastEscapeAt = now;

  const cardRect = proposalCard.getBoundingClientRect();
  const noRect = noButton.getBoundingClientRect();
  const noCenterX = noRect.left + noRect.width / 2;
  const noCenterY = noRect.top + noRect.height / 2;
  const directionX = noCenterX - pointerX || randomBetween(-1, 1);
  const directionY = noCenterY - pointerY || randomBetween(-1, 1);
  const distance = Math.hypot(directionX, directionY) || 1;
  const speed = randomBetween(96, 146);
  const rawMoveX = (directionX / distance) * speed + randomBetween(-30, 30);
  const rawMoveY = (directionY / distance) * speed + randomBetween(-22, 22);
  const safeInset = 18;
  const minMoveX = cardRect.left + safeInset - noRect.left;
  const maxMoveX = cardRect.right - safeInset - noRect.right;
  const minMoveY = cardRect.top + safeInset - noRect.top;
  const maxMoveY = cardRect.bottom - safeInset - noRect.bottom;
  const moveX = clamp(rawMoveX, minMoveX, maxMoveX);
  const moveY = clamp(rawMoveY, minMoveY, maxMoveY);

  noOffsetX += moveX;
  noOffsetY += moveY;

  noButton.classList.add("is-escaping");
  noButton.style.setProperty("--no-x", `${Math.round(noOffsetX)}px`);
  noButton.style.setProperty("--no-y", `${Math.round(noOffsetY)}px`);
  noButton.style.setProperty("--no-rotate", `${randomBetween(-13, 13).toFixed(1)}deg`);

  window.setTimeout(() => {
    noButton.classList.remove("is-escaping");
  }, 160);
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
