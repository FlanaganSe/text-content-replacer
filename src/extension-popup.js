const KEY = "replacements";
const form = document.getElementById("form");
const list = document.getElementById("list");

const getItems = async () => {
  const items = await chrome.storage.local.get(KEY).then((d) => d[KEY] || []);
  return items.sort((a, b) => Boolean(!!a.hide) - Boolean(!!b.hide));
};
const setItems = (items) => chrome.storage.local.set({ [KEY]: items }).catch(console.error);

// Render list
const render = async () => {
  const items = await getItems();
  const list = document.getElementById("list");

  list.replaceChildren(
    ...items.map((item, i) => {
      const div = document.createElement("div");
      div.className = item.hide ? "item hidden" : "item";

      // Find row
      const findRow = document.createElement("div");
      findRow.className = "item-row find-row";

      const findLabel = document.createElement("span");
      findLabel.className = "label";
      findLabel.textContent = "Find";

      const findText = document.createElement("span");
      findText.className = "text-content";
      findText.textContent = item.find;

      findRow.append(findLabel, findText);

      // Replace row
      const replaceRow = document.createElement("div");
      replaceRow.className = "item-row replace-row";

      const replaceLabel = document.createElement("span");
      replaceLabel.className = "label";
      replaceLabel.textContent = "Replace";

      const replaceText = document.createElement("span");
      replaceText.className = "text-content";
      replaceText.textContent = item.replace;

      replaceRow.append(replaceLabel, replaceText);

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete";
      deleteBtn.dataset.index = i;
      deleteBtn.title = `Click to delete replacement item`;
      deleteBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>';

      // Hide button
      const hideBtn = document.createElement("button");
      hideBtn.className = "hide";
      hideBtn.dataset.index = i;
      hideBtn.title = `Click to ${item.hide ? "enable" : "disable"} replacement`;
      hideBtn.innerHTML = item.hide
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye-off"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

      div.append(findRow, replaceRow, deleteBtn, hideBtn);
      return div;
    }),
  );
};

// On submit new item handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const find = data.get("find");
  const replace = data.get("replace") || "";

  const items = await getItems();
  if (!find.trim()) return; // Require find field
  if (items.some((it) => it.find === find)) return; // Prevent duplicate find

  await setItems([...items, { find, replace }]);
  form.reset();
  render();
});

// On delete item handler
list.addEventListener("click", async (e) => {
  const index = +e.target.dataset.index;
  if (e.target.matches(".delete")) {
    const items = await getItems();
    await setItems(items.filter((_, i) => i !== index));
    render();
  } else if (e.target.matches(".hide")) {
    const items = await getItems();
    const updatedItems = items.map((item, i) => (i === index ? { ...item, hide: !item.hide } : item));
    await setItems(updatedItems);
    render();
  }
});

render();
