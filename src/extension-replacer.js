chrome.storage.local.get({ replacements: [] }).then(({ replacements }) => {
	if (!replacements.length) return;

	const SKIP = "input, textarea, [contenteditable], script, style";
	const patterns = replacements.map(({ find, replace }) => {
		return [new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), replace];
	});

	// Recursively process nodes
	const processNode = (node) => {
		if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
			let text = node.textContent;
			for (const [regex, replace] of patterns) {
				text = text.replace(regex, replace);
			}
			if (text !== node.textContent) node.textContent = text;
		} else if (node.nodeType === Node.ELEMENT_NODE && !node.matches(SKIP)) {
			node.childNodes.forEach(processNode);
		}
	};

	processNode(document.body);

	// Observe DOM changes
	new MutationObserver((mutations) =>
		requestAnimationFrame(() => {
			mutations.forEach((m) => m.addedNodes.forEach(processNode));
		}),
	).observe(document.body, { childList: true, subtree: true });
});
