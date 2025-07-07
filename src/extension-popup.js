const KEY = "replacements";
const form = document.getElementById("form");
const list = document.getElementById("list");

const getItems = () => chrome.storage.local.get(KEY).then((d) => d[KEY] || []);
const setItems = (items) =>
  chrome.storage.local.set({ [KEY]: items }).catch(console.error);

// Render list
    const render = async () => {
      const items = await getItems();
      const list = document.getElementById('list');
      
      list.replaceChildren(
        ...items.map((item, i) => {
          const div = document.createElement("div");
          div.className = "item";

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
          deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>';

          div.append(findRow, replaceRow, deleteBtn);
          return div;
        })
      );
    };

// On submit new item handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const find = data.get("find");
  const replace = data.get("replace") || '';

  const items = await getItems();
  if (!find.trim()) return; // Require find field
  if (items.some((it) => it.find === find)) return; // Prevent duplicate find

  await setItems([...items, { find, replace }]);
  form.reset();
  render();
});

// On delete item handler
list.addEventListener("click", async (e) => {
  if (!e.target.matches(".delete")) return;
  const items = await getItems();
  await setItems(items.filter((_, i) => i !== +e.target.dataset.index));
  render();
});

render();
