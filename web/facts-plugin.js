// Lightweight RAG: reads facts.json and shows a citations panel if keywords match.
const FactsPlugin = (() => {
  let DB = null;

  const normalize = (s = "") =>
    s
      .toLowerCase()
      // unify Arabic forms
      .replace(/[\u064B-\u0652]/g, "")             // strip diacritics
      .replace(/\u0640/g, "")                        // tatweel
      .replace(/[\u0622\u0623\u0625\u0671]/g, "\u0627") // alif variants -> alif
      .replace(/\u0629/g, "\u0647")                 // ta marbuta -> ha
      .replace(/\u0649/g, "\u064a")                 // alif maqsoora -> ya
      // punctuation to spaces (Latin + Arabic)
      .replace(/[.,;:!\u061f\u060c~'"(){}\[\]\-_/\\|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  async function loadDB(url = "./facts.json") {
    if (DB) return DB;
    const res = await fetch(url);
    DB = await res.json();
    return DB;
  }

  function matchItems(text) {
    const hay = normalize(text);
    if (!DB?.items?.length || !hay) return [];
    const hits = [];
    for (const item of DB.items) {
      const kw = [
        ...(item.names?.ar || []),
        ...(item.names?.en || [])
      ].map(normalize).filter(Boolean);
      const found = kw.some(term => hay.includes(term) && term.length > 2);
      if (found) hits.push(item);
    }
    return hits;
  }

  function renderPanel(items, container) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) { container.style.display = "none"; return; }
    container.style.display = "block";

    const wrap = document.createElement("div");
    wrap.style.border = "1px solid #0002";
    wrap.style.borderRadius = "10px";
    wrap.style.padding = "10px";
    wrap.style.background = "rgba(255,255,255,0.92)";
    wrap.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)";

    const h3 = document.createElement("h3");
    h3.textContent = "Facts & Sources — معلومات ومرجع";
    h3.style.margin = "0 0 8px";
    wrap.appendChild(h3);

    items.slice(0, 2).forEach(item => {
      const block = document.createElement("div");
      block.style.marginBottom = "10px";

      const title = document.createElement("strong");
      title.textContent = (item.names?.en?.[0]) || (item.names?.ar?.[0]) || "Site";
      block.appendChild(title);

      const ul = document.createElement("ul");
      ul.style.margin = "6px 0";
      ul.style.paddingInlineStart = "18px";
      (item.facts || []).slice(0, 3).forEach(f => {
        const li = document.createElement("li");
        li.textContent = f;
        ul.appendChild(li);
      });
      block.appendChild(ul);

      const src = document.createElement("div");
      src.style.fontSize = "12px";
      src.style.color = "#555";
      src.textContent = "Sources: ";
      (item.sources || []).slice(0, 2).forEach((s, i) => {
        const a = document.createElement("a");
        a.href = s.url; a.textContent = s.title || s.url; a.target = "_blank"; a.rel = "noopener noreferrer";
        src.appendChild(a);
        if (i < Math.min(1, (item.sources || []).length - 1)) src.appendChild(document.createTextNode(" • "));
      });
      block.appendChild(src);

      wrap.appendChild(block);
    });

    container.appendChild(wrap);
  }

  async function maybeShowFacts({ text, containerId = "factsPanel" } = {}) {
    await loadDB();
    const container = document.getElementById(containerId);
    if (!container) return;
    const items = matchItems(text || "");
    renderPanel(items, container);
  }

  return { maybeShowFacts };
})();