const KEY = "replacements";
const form = document.getElementById("form");
const list = document.getElementById("list");

const getItems = () => chrome.storage.local.get(KEY).then((d) => d[KEY] || []);
const setItems = (items) =>
  chrome.storage.local.set({ [KEY]: items }).catch(console.error);

// Render list
const render = async () => {
  const items = await getItems();
  list.replaceChildren(
    ...items.map((item, i) => {
      const div = document.createElement("div");
      div.className = "item";

      // Find span
      const findSpan = document.createElement("span");
      findSpan.className = "find";
      findSpan.textContent = item.find;
      // Replace span
      const replaceSpan = document.createElement("span");
      replaceSpan.className = "replace";
      replaceSpan.textContent = item.replace;
      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete";
      deleteBtn.dataset.index = i;

      // Append the HTML items to a div in the list
      div.append(findSpan, " → ", replaceSpan, deleteBtn);
      return div;
    })
  );
};

// On submit new item handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const find = data.get("find")?.trim();
  const replace = data.get("replace")?.trim();

  const items = await getItems();
  if (!find || !replace) return; // Require find and replace fields
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
