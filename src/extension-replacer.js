(async () => {
  // Load replacements
  const { replacements = [] } = await chrome.storage.local.get("replacements");
  if (!Array.isArray(replacements) || !replacements.length) return;

  // Skip input fields, scripts, etc.
  const SKIP = "input, textarea, [contenteditable], script, style";

  // Compile regex patterns and sanitize replacements
  const compiled = replacements.map(({ find, replace }) => ({
    regex: new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    replace: String(replace).replace(/[<>]/g, ""),
  }));

  // Process a single text node
  const processTextNode = (node) => {
    if (!node.textContent?.trim()) return;
    let text = node.textContent;
    for (const { regex, replace } of compiled) {
      text = text.replace(regex, replace);
    }
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

  // Observe DOM changes with debounced processing
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
