(async () => {
	// Load replacements from local storage
	const { replacements } = await chrome.storage.local.get("replacements");
	if (!Array.isArray(replacements)) return;
	const filteredReplacements = replacements.filter((it) => !it.hide);
	if (!filteredReplacements?.length) return;

	// Skip input fields, scripts, etc.
	const SKIP = "input, textarea, [contenteditable], script, style";

	// Process a single text node
	const processTextNode = (node) => {
		if (!node.textContent?.trim()) return;
		let text = node.textContent;
		for (const { find, replace } of filteredReplacements) {
			text = text.replace(
				new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
				replace,
			);
		}
		// Do not set text content if no changes. May cause unnecessary DOM rerenders
		if (text !== node.textContent) node.textContent = text;
	};

	// Recursively process nodes
	const processNode = (node) => {
		if (node.nodeType === Node.TEXT_NODE) return processTextNode(node);
		if (node.nodeType === Node.ELEMENT_NODE && !node.closest(SKIP)) {
			node.childNodes.forEach(processNode);
		}
	};

	// Initial processing
	processNode(document.body);

	// Observe DOM changes
	let queued = false;
	new MutationObserver((mutations) => {
		if (queued) return;
		queued = true;
		requestAnimationFrame(() => {
			mutations.forEach((m) => m.addedNodes.forEach(processNode));
			queued = false;
		});
	}).observe(document.body, { childList: true, subtree: true });
})();
