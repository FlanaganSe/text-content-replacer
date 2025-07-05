(async () => {
  const { replacements = [] } = await chrome.storage.sync.get("replacements");
  if (!replacements.length) return;

  // Process an HTML DOM node
  const processNode = (node) => {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.closest("input, textarea, [contenteditable], script, style")
    )
      return;

    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      let text = node.textContent;
      for (const { find, replace } of replacements) {
        text = text.replaceAll(find, replace);
      }
      node.textContent = text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(processNode);
    }
  };

  processNode(document.body);

  // Watch for new DOM nodes
  new MutationObserver((mutations) => {
    if (document.activeElement?.matches("input, textarea, [contenteditable]"))
      return;
    mutations.forEach((mutation) => mutation.addedNodes.forEach(processNode));
  }).observe(document.body, { childList: true, subtree: true });
})();
