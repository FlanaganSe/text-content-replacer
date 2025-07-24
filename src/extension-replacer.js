chrome.storage.local.get({ replacements: [] }).then(({ replacements }) => {
  if (!replacements.length) return;

  const SKIP = "input, textarea, [contenteditable], script, style";
  const processedNodes = new WeakSet();

  const patterns = replacements.map(({ find, replace }) => {
    return [new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), replace];
  });

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      if (processedNodes.has(node)) return;

      const text = patterns.reduce((text, [regex, replace]) => text.replace(regex, replace), node.textContent);

      if (text !== node.textContent) {
        processedNodes.add(node);
        node.textContent = text;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && !node.matches(SKIP)) {
      node.childNodes.forEach(processNode);
    }
  };

  processNode(document.body);

  new MutationObserver((mutations) =>
    requestAnimationFrame(() => mutations.flatMap((m) => [...m.addedNodes]).forEach(processNode)),
  ).observe(document.body, { childList: true, subtree: true });
});
