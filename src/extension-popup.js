const KEY = "replacements";
const form = document.getElementById("form");
const list = document.getElementById("list");

const getItems = () => chrome.storage.sync.get(KEY).then((d) => d[KEY] || []);
const setItems = (items) => chrome.storage.sync.set({ [KEY]: items });

// Render list
const render = async () => {
  const items = await getItems();
  const htmlItems = items.map((item, i) => {
    return `<div class="item">${item.find} → ${item.replace}<button class="delete" data-index="${i}">Delete</button></div>`;
  });
  list.innerHTML = htmlItems.join("");
};

// Handle submit (add new item)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const find = form.find.value.trim();
  const replace = form.replace.value.trim();

  const items = await getItems();
  await setItems([...items, { find, replace }]);
  form.reset();
  render();
});

// Handle delete item
list.addEventListener("click", async (e) => {
  const items = await getItems();
  items.splice(Number(e.target.dataset.index), 1);
  await setItems(items);
  render();
});

render();
