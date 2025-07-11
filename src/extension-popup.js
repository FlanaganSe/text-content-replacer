const KEY = "replacements";
const form = document.getElementById("form");
const list = document.getElementById("list");

const getItems = () => chrome.storage.local.get(KEY).then((d) => d[KEY] || []);
const setItems = (items) => chrome.storage.local.set({ [KEY]: items }).catch(console.error);

// Create item div element
const createItem = ({ find, replace }, index) => {
	const div = document.createElement("div");
	div.className = "item";
	div.innerHTML = `
    <div class="item-row find-row"><span class="label">Find</span><span class="text-content">${find}</span></div>
    <div class="item-row replace-row"><span class="label">Replace</span><span class="text-content">${replace}</span></div>
    <button class="delete" data-index="${index}">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  `;
	return div;
};

// Render list of items
const render = async () => {
	const items = await getItems();
	list.replaceChildren(...items.map(createItem));
};

// Add item
form.addEventListener("submit", async (e) => {
	e.preventDefault();
	const { find = "", replace = "" } = Object.fromEntries(new FormData(e.target));
	const items = await getItems();
	if (!find.trim() || items.some((item) => item.find === find)) return;

	await setItems([...items, { find, replace }]);
	e.target.reset();
	render();
});

// Delete item
list.addEventListener("click", async ({ target }) => {
	if (!target.closest(".delete")) return;
	const items = await getItems();
	await setItems(items.filter((_, i) => i !== +target.dataset.index));
	render();
});

render();
