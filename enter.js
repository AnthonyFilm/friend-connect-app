setSharedHeadings("enter");

const promptForm = document.querySelector("#promptForm");
const promptText = document.querySelector("#promptText");
const promptCategory = document.querySelector("#promptCategory");
const saveStatus = document.querySelector("#saveStatus");
const sessionPanel = document.querySelector("#sessionPanel");
const sessionList = document.querySelector("#sessionList");
const sessionPrompts = [];

fillCategorySelect(promptCategory);

function renderSessionPrompts() {
  sessionList.innerHTML = "";
  sessionPrompts.forEach((prompt) => {
    const card = document.createElement("article");
    card.className = "mini-slip";
    card.innerHTML = `<strong>${prompt.category}</strong><p></p>`;
    card.querySelector("p").textContent = prompt.text;
    sessionList.append(card);
  });
}

promptForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = promptText.value.trim();
  if (!text) return;

  saveStatus.textContent = "Adding it to the bowl...";
  promptForm.querySelector("button").disabled = true;

  try {
    const saved = await saveGuestPrompt({
      text,
      category: promptCategory.value
    });

    sessionPrompts.unshift(saved);
    promptForm.reset();
    promptCategory.selectedIndex = 0;
    sessionPanel.classList.remove("is-hidden");
    renderSessionPrompts();
    saveStatus.textContent = "Added. The bowl has one more spark in it.";
  } catch {
    saveStatus.textContent = "That did not save. Check the Supabase settings or try again.";
  } finally {
    promptForm.querySelector("button").disabled = false;
  }
});
