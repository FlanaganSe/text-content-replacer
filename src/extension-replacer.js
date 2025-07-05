(async () => {
  const { replacements = [] } = await chrome.storage.sync.get("replacements");
  if (!replacements.length) return;

  const processNode = (node) => {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.closest("input, textarea, [contenteditable], script, style")
    )
      return;

    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      let text = node.textContent;
      for (const { find, replace } of replacements) {
        text = text.replaceAll(find, replace); // Consider case-insensitive option
      }
      node.textContent = text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(processNode);
    }
  };

  processNode(document.body);

  let debounceTimer;
  new MutationObserver((mutations) => {
    if (document.activeElement?.matches("input, textarea, [contenteditable]"))
      return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach(processNode));
    }, 100);
  }).observe(document.body, { childList: true, subtree: true });
})();
