(function () {
  const cfg = window.TaloviConfig || {};
  if (!cfg.agentId) return;

  // ── i18n ─────────────────────────────────────────────────────────────────────

  const TRANSLATIONS = {
    en: { greeting: 'Hello! How can I help you today?', placeholder: 'Type a message\u2026', sendLabel: 'Send' },
    es: { greeting: '\u00a1Hola! \u00bfC\u00f3mo puedo ayudarte hoy?',  placeholder: 'Escribe tu mensaje\u2026',  sendLabel: 'Enviar' },
    fr: { greeting: 'Bonjour\u00a0! Comment puis-je vous aider\u00a0?',  placeholder: 'Tapez votre message\u2026', sendLabel: 'Envoyer' },
    pt: { greeting: 'Ol\u00e1! Como posso ajud\u00e1-lo hoje?',          placeholder: 'Digite sua mensagem\u2026', sendLabel: 'Enviar' },
    zh: { greeting: '\u4f60\u597d\uff01\u4eca\u5929\u6211\u80fd\u5e2e\u60a8\u4ec0\u4e48\uff1f', placeholder: '\u8f93\u5165\u60a8\u7684\u6d88\u606f\u2026', sendLabel: '\u53d1\u9001' },
  };

  const SUPPORTED_NAMES = [
    { code: 'en', label: 'English'   },
    { code: 'es', label: 'Espa\u00f1ol'  },
    { code: 'fr', label: 'Fran\u00e7ais' },
    { code: 'pt', label: 'Portugu\u00eas'},
    { code: 'zh', label: '\u4e2d\u6587'  },
  ];

  const SUPPORTED = SUPPORTED_NAMES.map(l => l.code);

  function getStrings(lang) {
    const key = SUPPORTED.includes(lang) ? lang : 'en';
    return Object.assign({}, TRANSLATIONS.en, TRANSLATIONS[key]);
  }

  let activeLang = SUPPORTED.includes((navigator.language || '').split('-')[0])
    ? navigator.language.split('-')[0]
    : 'en';
  let t = getStrings(activeLang);

  // ── Config ────────────────────────────────────────────────────────────────────

  const color = cfg.accentColor || '#6C63FF';
  const position = cfg.position || 'bottom-right';
  const title = cfg.title || 'How can we help?';
  const API_BASE = (function () {
    const s = document.currentScript;
    return s ? s.src.replace('/widget.js', '') : '';
  })();

  const style = document.createElement('style');
  style.textContent = `
    #talovi-bubble{position:fixed;${position==='bottom-left'?'left':'right'}:20px;bottom:20px;width:52px;height:52px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.4);z-index:9999;transition:transform .2s}
    #talovi-bubble:hover{transform:scale(1.1)}
    #talovi-bubble svg{width:26px;height:26px;fill:#fff}
    #talovi-panel{position:fixed;${position==='bottom-left'?'left':'right'}:20px;bottom:82px;width:300px;background:#1a1e2a;border-radius:14px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.5);z-index:9998;display:none;flex-direction:column;font-family:system-ui,sans-serif}
    #talovi-panel.open{display:flex}
    #talovi-header{padding:12px 14px;font-weight:600;font-size:.9rem;color:#fff;background:${color}}
    #talovi-messages{padding:10px 14px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px}
    #talovi-resize{position:absolute;top:0;left:0;width:18px;height:18px;cursor:nwse-resize;z-index:10;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.45);font-size:11px;line-height:1;user-select:none}
    #talovi-resize:hover{color:rgba(255,255,255,.9)}
    .talovi-msg{padding:7px 10px;border-radius:8px;font-size:.85rem;line-height:1.4;max-width:85%}
    .talovi-msg.user{background:${color};color:#fff;align-self:flex-end}
    .talovi-msg.bot{background:rgba(255,255,255,.1);color:#e6edf3;align-self:flex-start}
    #talovi-input-row{display:flex;gap:8px;padding:10px 14px;border-top:1px solid rgba(255,255,255,.08)}
    #talovi-input{flex:1;padding:7px 10px;background:rgba(255,255,255,.08);border:none;border-radius:6px;color:#fff;font-size:.85rem;outline:none}
    #talovi-send{padding:7px 14px;background:${color};border:none;border-radius:6px;color:#fff;font-size:.85rem;font-weight:600;cursor:pointer}
  `;
  document.head.appendChild(style);

  const bubble = document.createElement('div');
  bubble.id = 'talovi-bubble';
  bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';

  const panel = document.createElement('div');
  panel.id = 'talovi-panel';
  const langOptions = SUPPORTED_NAMES.map(({ code, label }) =>
    `<option value="${code}"${code === activeLang ? ' selected' : ''}>${label}</option>`
  ).join('');

  panel.innerHTML = `
    <div id="talovi-resize" title="Drag to resize">⠿</div>
    <div id="talovi-header" style="display:flex;align-items:center;justify-content:space-between">
      <span>${title}</span>
      <select id="talovi-lang" style="background:transparent;border:1px solid rgba(255,255,255,.3);color:#fff;font-size:.75rem;border-radius:4px;padding:2px 4px;cursor:pointer">${langOptions}</select>
    </div>
    <div id="talovi-messages"><div class="talovi-msg bot">${t.greeting}</div></div>
    <div id="talovi-input-row">
      <input id="talovi-input" type="text" placeholder="${t.placeholder}">
      <button id="talovi-send">${t.sendLabel}</button>
    </div>`;

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  // Apply saved panel size, or use defaults
  const RESIZE_KEY = 'talovi_panel_size';
  const savedSize = JSON.parse(localStorage.getItem(RESIZE_KEY) || 'null');
  panel.style.width  = (savedSize ? savedSize.w : 300) + 'px';
  panel.style.height = (savedSize ? savedSize.h : 400) + 'px';

  // Resize-handle drag logic
  const handle = document.getElementById('talovi-resize');
  const MIN_W = 280, MAX_W = 600, MIN_H = 350;
  let dragging = false, dragStartX, dragStartY, dragStartW, dragStartH;

  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartW = panel.offsetWidth;
    dragStartH = panel.offsetHeight;
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    // Right-anchored: dragging left (negative dx) grows the panel; left-anchored: opposite
    const newW = position === 'bottom-left'
      ? Math.min(MAX_W, Math.max(MIN_W, dragStartW + dx))
      : Math.min(MAX_W, Math.max(MIN_W, dragStartW - dx));
    // Bottom-anchored: dragging up (negative dy) grows the panel
    const maxH = Math.round(window.innerHeight * 0.8);
    const newH = Math.min(maxH, Math.max(MIN_H, dragStartH - dy));
    panel.style.width  = newW + 'px';
    panel.style.height = newH + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    localStorage.setItem(RESIZE_KEY, JSON.stringify({ w: panel.offsetWidth, h: panel.offsetHeight }));
  });

  let conversationId = null;

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function mdToHtml(text) {
    const escaped = escHtml(text);
    const lines = escaped.split('\n');
    const out = [];
    let inUl = false, inOl = false;

    for (const raw of lines) {
      const line = raw.trimEnd();

      // Headings
      if (line.startsWith('### ')) {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
        out.push('<h4>' + inline(line.slice(4)) + '</h4>');
        continue;
      }
      if (line.startsWith('## ')) {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (inOl) { out.push('</ol>'); inOl = false; }
        out.push('<h3 style="color:' + color + ';margin:4px 0">' + inline(line.slice(3)) + '</h3>');
        continue;
      }

      // Unordered list
      if (/^[-*] /.test(line)) {
        if (inOl) { out.push('</ol>'); inOl = false; }
        if (!inUl) { out.push('<ul>'); inUl = true; }
        out.push('<li>' + inline(line.slice(2)) + '</li>');
        continue;
      }

      // Ordered list
      if (/^\d+\. /.test(line)) {
        if (inUl) { out.push('</ul>'); inUl = false; }
        if (!inOl) { out.push('<ol>'); inOl = true; }
        out.push('<li>' + inline(line.replace(/^\d+\. /, '')) + '</li>');
        continue;
      }

      // Close open lists before a normal line
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }

      // Blank line → paragraph break, non-blank → text with line break
      out.push(line === '' ? '<br>' : inline(line) + '<br>');
    }

    if (inUl) out.push('</ul>');
    if (inOl) out.push('</ol>');

    return out.join('');
  }

  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>');
  }

  bubble.addEventListener('click', () => panel.classList.toggle('open'));

  document.getElementById('talovi-lang').addEventListener('change', e => {
    activeLang = e.target.value;
    t = getStrings(activeLang);
    document.getElementById('talovi-input').placeholder = t.placeholder;
    document.getElementById('talovi-send').textContent  = t.sendLabel;
  });

  async function sendMessage() {
    const input = document.getElementById('talovi-input');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    const msgs = document.getElementById('talovi-messages');
    const userBubble = document.createElement('div');
    userBubble.className = 'talovi-msg user';
    userBubble.textContent = msg;
    msgs.appendChild(userBubble);
    msgs.scrollTop = msgs.scrollHeight;

    const thinking = document.createElement('div');
    thinking.className = 'talovi-msg bot';
    thinking.textContent = '…';
    msgs.appendChild(thinking);
    msgs.scrollTop = msgs.scrollHeight;

    const payload = { agent_id: cfg.agentId, message: msg, conversation_id: conversationId };
    console.log('[Talovi] sending chat:', payload);

    try {
      const res = await fetch(`${API_BASE}/api/proxy/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('[Talovi] response:', res.status, data);
      if (!res.ok) {
        thinking.textContent = data.error || 'Error getting response.';
      } else {
        conversationId = data.conversation_id;
        thinking.innerHTML = mdToHtml(data.message || 'Error getting response.');
      }
    } catch (err) {
      console.error('[Talovi] fetch error:', err);
      thinking.textContent = 'Connection error. Please try again.';
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  document.getElementById('talovi-send').addEventListener('click', sendMessage);
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement.id === 'talovi-input') sendMessage();
  });
})();
