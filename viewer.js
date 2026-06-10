setSharedHeadings("viewer");

const categorySelect = document.querySelector("#categorySelect");
const drawPromptButton = document.querySelector("#drawPrompt");
const refreshPromptsButton = document.querySelector("#refreshPrompts");
const resetSessionButton = document.querySelector("#resetSession");
const promptStage = document.querySelector("#promptStage");
const promptCategoryLabel = document.querySelector("#promptCategoryLabel");
const promptDisplay = document.querySelector("#promptDisplay");
const deckStatus = document.querySelector("#deckStatus");

let guestPrompts = [];
const drawnPromptIds = new Set();

function renderCategorySelect() {
  PARTY_CATEGORIES.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category === "All" ? "All categories" : category;
    categorySelect.append(option);
  });
}

function selectedDeckSource() {
  return document.querySelector("input[name='deckSource']:checked").value;
}

function selectedCategory() {
  return categorySelect.value || "All";
}

function filterByCategory(prompts) {
  const category = selectedCategory();
  if (category === "All") return prompts;
  return prompts.filter((prompt) => prompt.category === category);
}

function currentDeck() {
  const source = selectedDeckSource();
  const prefilled = PARTY_PREFILLED_PROMPTS;

  if (source === "prefilled") return filterByCategory(prefilled);
  if (source === "guest") return filterByCategory(guestPrompts);
  return filterByCategory([...prefilled, ...guestPrompts]);
}

function availableDeck() {
  return currentDeck().filter((prompt) => !drawnPromptIds.has(prompt.id));
}

async function refreshGuestPrompts() {
  deckStatus.textContent = "Refreshing the guest deck...";
  refreshPromptsButton.disabled = true;

  try {
    guestPrompts = await loadGuestPrompts();
    const label = isCloudConfigured() ? "shared guest" : "local guest";
    deckStatus.textContent = `${guestPrompts.length} ${label} prompt${guestPrompts.length === 1 ? "" : "s"} ready.`;
  } catch {
    deckStatus.textContent = "Could not load guest prompts. Check the Supabase settings.";
  } finally {
    refreshPromptsButton.disabled = false;
  }
}

function drawPrompt() {
  promptStage.classList.remove("session-complete");
  const deck = currentDeck();
  const available = availableDeck();

  if (!deck.length) {
    promptCategoryLabel.textContent = "No matches yet";
    promptDisplay.textContent = "Try All, Both, or refresh after guests add more prompts.";
    promptDisplay.classList.remove("is-empty");
    return;
  }

  if (!available.length) {
    promptCategoryLabel.textContent = "Session complete";
    promptDisplay.textContent = "You have drawn every matching prompt in this session. Change the deck to add cards or reset the session to start over.";
    promptDisplay.classList.remove("is-empty");
    promptStage.classList.add("session-complete");
    return;
  }

  const prompt = available[Math.floor(Math.random() * available.length)];
  drawnPromptIds.add(prompt.id);

  promptCategoryLabel.textContent = `${prompt.category} - ${prompt.source === "prefilled" ? "Prefilled" : "Guest"}`;
  promptDisplay.textContent = prompt.text;
  promptDisplay.classList.remove("is-empty");
  deckStatus.textContent = `${available.length - 1} matching prompt${available.length === 2 ? "" : "s"} left in this session.`;
}

function resetSession() {
  drawnPromptIds.clear();
  promptStage.classList.remove("session-complete");
  promptCategoryLabel.textContent = "Session reset";
  promptDisplay.textContent = "";
  promptDisplay.classList.add("is-empty");
  deckStatus.textContent = "All matching prompts are available again.";
}

renderCategorySelect();
refreshGuestPrompts();

drawPromptButton.addEventListener("click", drawPrompt);
refreshPromptsButton.addEventListener("click", refreshGuestPrompts);
resetSessionButton.addEventListener("click", resetSession);
