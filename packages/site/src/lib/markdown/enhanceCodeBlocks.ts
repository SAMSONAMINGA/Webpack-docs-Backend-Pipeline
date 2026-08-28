/**
 * Svelte action: walks the rendered markdown container and attaches a
 * "Copy" button + language tag to every <pre><code> block, without needing
 * to mount a Svelte component per block (which @html can't do directly).
 */
export function enhanceCodeBlocks(node: HTMLElement) {
  function decorate() {
    const blocks = node.querySelectorAll<HTMLPreElement>("pre:not([data-enhanced])");
    blocks.forEach((pre) => {
      pre.setAttribute("data-enhanced", "true");
      const codeEl = pre.querySelector("code");
      const lang = codeEl?.className.match(/language-(\w+)/)?.[1] ?? "text";

      const toolbar = document.createElement("div");
      toolbar.className = "md-code-toolbar";

      const langTag = document.createElement("span");
      langTag.className = "md-lang-tag";
      langTag.textContent = lang;

      const copyBtn = document.createElement("button");
      copyBtn.className = "md-copy-btn";
      copyBtn.type = "button";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", async () => {
        await navigator.clipboard.writeText(codeEl?.textContent ?? "");
        copyBtn.textContent = "✓ Copied";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });

      toolbar.append(langTag, copyBtn);
      pre.parentElement?.insertBefore(toolbar, pre);
      pre.classList.add("md-code-block");
    });
  }

  decorate();
  const observer = new MutationObserver(decorate);
  observer.observe(node, { childList: true, subtree: true });

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
