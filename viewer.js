setSharedHeadings("viewer");

const categoryChoices = document.querySelector("#categoryChoices");
const drawPromptButton = document.querySelector("#drawPrompt");
const refreshPromptsButton = document.querySelector("#refreshPrompts");
const promptCategoryLabel = document.querySelector("#promptCategoryLabel");
const promptDisplay = document.querySelector("#promptDisplay");
const deckStatus = document.querySelector("#deckStatus");

let guestPrompts = [];
let lastPromptId = "";

function renderCategoryChoices() {
  PARTY_CATEGORIES.forEach((category, index) => {
    const id = `category-${category.toLowerCase().replaceAll(" ", "-")}`;
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "category";
    input.id = id;
    input.value = category;
    input.checked = index === 0;

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = category;

    categoryChoices.append(input, label);
  });
}

function selectedDeckSource() {
  return document.querySelector("input[name='deckSource']:checked").value;
}

function selectedCategory() {
  return document.querySelector("input[name='category']:checked").value;
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
  const deck = currentDeck();

  if (!deck.length) {
    promptCategoryLabel.textContent = "No matches yet";
    promptDisplay.textContent = "Try All, Both, or refresh after guests add more prompts.";
    promptDisplay.classList.remove("is-empty");
    return;
  }

  const available = deck.length > 1 ? deck.filter((prompt) => prompt.id !== lastPromptId) : deck;
  const prompt = available[Math.floor(Math.random() * available.length)];
  lastPromptId = prompt.id;

  promptCategoryLabel.textContent = `${prompt.category} - ${prompt.source === "prefilled" ? "Prefilled" : "Guest"}`;
  promptDisplay.textContent = prompt.text;
  promptDisplay.classList.remove("is-empty");
}

renderCategoryChoices();
refreshGuestPrompts();

drawPromptButton.addEventListener("click", drawPrompt);
refreshPromptsButton.addEventListener("click", refreshGuestPrompts);
