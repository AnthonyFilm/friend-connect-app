const LOCAL_PROMPT_KEY = "friend-connect-party-prompts";
const CONFIG = window.FRIEND_PARTY_CONFIG;

function configurableText(key, fallback) {
  return CONFIG?.[key] || fallback;
}

function editableCategories() {
  return PARTY_CATEGORIES.filter((category) => category !== "All");
}

function isCloudConfigured() {
  return Boolean(CONFIG?.supabaseUrl && CONFIG?.supabaseAnonKey);
}

function normalizePrompt(prompt, source = "guest") {
  return {
    id: prompt.id || `${source}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    source,
    category: editableCategories().includes(prompt.category) ? prompt.category : "Deep conversation",
    text: String(prompt.text || "").trim().slice(0, 420)
  };
}

function readLocalPrompts() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_PROMPT_KEY) || "[]");
    return Array.isArray(stored) ? stored.map((prompt) => normalizePrompt(prompt)) : [];
  } catch {
    return [];
  }
}

function writeLocalPrompt(prompt) {
  const prompts = [normalizePrompt(prompt), ...readLocalPrompts()];
  localStorage.setItem(LOCAL_PROMPT_KEY, JSON.stringify(prompts));
  return prompts[0];
}

function supabaseHeaders() {
  return {
    apikey: CONFIG.supabaseAnonKey,
    Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
    "Content-Type": "application/json"
  };
}

function supabaseUrl(path) {
  return `${CONFIG.supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`;
}

async function saveGuestPrompt(prompt) {
  const clean = normalizePrompt(prompt);

  if (!isCloudConfigured()) {
    return writeLocalPrompt(clean);
  }

  const response = await fetch(supabaseUrl(CONFIG.tableName), {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      category: clean.category,
      text: clean.text
    })
  });

  if (!response.ok) {
    throw new Error("Could not save prompt");
  }

  const [saved] = await response.json();
  return normalizePrompt(saved);
}

async function loadGuestPrompts() {
  if (!isCloudConfigured()) {
    return readLocalPrompts();
  }

  const response = await fetch(
    supabaseUrl(`${CONFIG.tableName}?select=id,category,text,created_at&order=created_at.desc&limit=500`),
    { headers: supabaseHeaders() }
  );

  if (!response.ok) {
    throw new Error("Could not load prompts");
  }

  const prompts = await response.json();
  return prompts.map((prompt) => normalizePrompt(prompt));
}

function setSharedHeadings(pageKind) {
  const appName = document.querySelector("[data-app-name]");
  const greeting = document.querySelector("[data-page-greeting]");
  const subheading = document.querySelector("[data-page-subheading]");

  if (appName) appName.textContent = configurableText("appName", "Connect Friend");

  if (pageKind === "enter") {
    if (greeting) greeting.textContent = configurableText("enterGreeting", "Toss a prompt into the party bowl");
    if (subheading) subheading.textContent = configurableText("enterSubheading", "");
  }

  if (pageKind === "viewer") {
    if (greeting) greeting.textContent = configurableText("viewerGreeting", "Draw a little spark");
    if (subheading) subheading.textContent = configurableText("viewerSubheading", "");
  }
}

function fillCategorySelect(selectElement) {
  editableCategories().forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    selectElement.append(option);
  });
}
