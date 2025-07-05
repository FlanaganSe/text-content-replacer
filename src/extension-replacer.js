(async () => {
  const { replacements = [] } = await chrome.storage.sync.get("replacements");
  const validReplacements = replacements.filter((r) => r.find && r.replace);

  if (!validReplacements.length) return;

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      let text = node.textContent;
      for (const { find, replace } of validReplacements) {
        text = text.replaceAll(find, replace);
      }
      node.textContent = text;
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !node.matches("script, style, textarea, input")
    ) {
      for (const child of node.childNodes) {
        processNode(child);
      }
    }
  };

  processNode(document.body);

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        processNode(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
