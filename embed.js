/**
 * embed.js — Talovi browser widget
 *
 * Drop-in chat widget that supports 5 languages, a user-facing language
 * switcher, and cost display. Calls a configured relay endpoint or, for
 * OpenAI, can call the API directly from the browser.
 *
 * Usage:
 *   <script src="https://cdn.talovi.dev/embed.js"
 *     data-key="YOUR_API_KEY"
 *     data-domain="general"
 *     data-lang="es"
 *     data-endpoint="/api/chat">
 *   </script>
 *
 * Attributes:
 *   data-key        API key forwarded in the Authorization header (optional if
 *                   your endpoint handles auth server-side)
 *   data-domain     Agent domain: general | healthcare | legal | realestate | retail
 *   data-lang       Override language. Defaults to navigator.language → 'en'.
 *   data-endpoint   URL to POST chat requests to. Omit to call OpenAI directly
 *                   (requires data-key to be an OpenAI key).
 *   data-provider   'openai' | 'claude' | 'gemini' | 'grok'. Default: 'openai'
 *                   when no endpoint is set; unused when endpoint is set.
 *   data-position   'right' (default) | 'left'
 *   data-theme      'dark' (default) | 'light'
 */

(function () {
  'use strict';

  // ── Translations ──────────────────────────────────────────────────────────────

  const SUPPORTED_LANGS = ['en', 'es', 'fr', 'pt', 'zh'];

  const TRANSLATIONS = {
    en: {
      header:      'AI Assistant',
      poweredBy:   'Powered by Talovi',
      placeholder: 'Type your message\u2026',
      greeting:    'Hello! How can I help you today?',
      thisConvo:   'This conversation',
      totalSpent:  'Total spent',
      resetTotal:  'Reset total',
      sendLabel:   'Send',
      langLabel:   'Language',
      errorMsg:    'Something went wrong. Please try again.',
      thinking:    'Thinking\u2026',
    },
    es: {
      header:      'Asistente IA',
      poweredBy:   'Desarrollado por Talovi',
      placeholder: 'Escribe tu mensaje\u2026',
      greeting:    '\u00a1Hola! \u00bfC\u00f3mo puedo ayudarte hoy?',
      thisConvo:   'Esta conversaci\u00f3n',
      totalSpent:  'Total gastado',
      resetTotal:  'Reiniciar total',
      sendLabel:   'Enviar',
      langLabel:   'Idioma',
      errorMsg:    'Algo sali\u00f3 mal. Por favor, int\u00e9ntalo de nuevo.',
      thinking:    'Pensando\u2026',
    },
    fr: {
      header:      'Assistant IA',
      poweredBy:   'Propuls\u00e9 par Talovi',
      placeholder: 'Tapez votre message\u2026',
      greeting:    'Bonjour\u00a0! Comment puis-je vous aider aujourd\u2019hui\u00a0?',
      thisConvo:   'Cette conversation',
      totalSpent:  'Total d\u00e9pens\u00e9',
      resetTotal:  'R\u00e9initialiser le total',
      sendLabel:   'Envoyer',
      langLabel:   'Langue',
      errorMsg:    'Une erreur s\u2019est produite. Veuillez r\u00e9essayer.',
      thinking:    'R\u00e9flexion\u2026',
    },
    pt: {
      header:      'Assistente IA',
      poweredBy:   'Desenvolvido por Talovi',
      placeholder: 'Digite sua mensagem\u2026',
      greeting:    'Ol\u00e1! Como posso ajud\u00e1-lo hoje?',
      thisConvo:   'Esta conversa',
      totalSpent:  'Total gasto',
      resetTotal:  'Redefinir total',
      sendLabel:   'Enviar',
      langLabel:   'Idioma',
      errorMsg:    'Algo deu errado. Por favor, tente novamente.',
      thinking:    'Pensando\u2026',
    },
    zh: {
      header:      'AI \u52a9\u624b',
      poweredBy:   '\u7531 Talovi \u9a71\u52a8',
      placeholder: '\u8f93\u5165\u60a8\u7684\u6d88\u606f\u2026',
      greeting:    '\u4f60\u597d\uff01\u4eca\u5929\u6211\u80fd\u5e2e\u60a8\u4ec0\u4e48\uff1f',
      thisConvo:   '\u672c\u6b21\u5bf9\u8bdd',
      totalSpent:  '\u603b\u82b1\u8d39',
      resetTotal:  '\u91cd\u7f6e\u603b\u8ba1',
      sendLabel:   '\u53d1\u9001',
      langLabel:   '\u8bed\u8a00',
      errorMsg:    '\u51fa\u9519\u4e86\uff0c\u8bf7\u91cd\u8bd5\u3002',
      thinking:    '\u601d\u8003\u4e2d\u2026',
    },
  };

  function resolveLang(tag) {
    if (!tag) return 'en';
    const base = String(tag).toLowerCase().split('-')[0];
    return SUPPORTED_LANGS.includes(base) ? base : 'en';
  }

  function getStrings(lang) {
    return Object.assign({}, TRANSLATIONS.en, TRANSLATIONS[resolveLang(lang)]);
  }

  const LANG_NAMES = { en: 'English', es: 'Español', fr: 'Français', pt: 'Português', zh: '中文' };

  // ── Config ────────────────────────────────────────────────────────────────────

  const script = (function () {
    // Prefer document.currentScript; fall back to last script on the page.
    if (document.currentScript) return document.currentScript;
    const scripts = document.querySelectorAll('script[src*="embed"]');
    return scripts[scripts.length - 1] || null;
  })();

  const cfg = {
    apiKey:   script ? script.dataset.key      : '',
    domain:   script ? (script.dataset.domain  || 'general') : 'general',
    lang:     script ? script.dataset.lang     : null,
    endpoint: script ? script.dataset.endpoint : null,
    provider: script ? (script.dataset.provider || 'openai') : 'openai',
    position: script ? (script.dataset.position || 'right')  : 'right',
    theme:    script ? (script.dataset.theme   || 'dark')    : 'dark',
  };

  // Language resolution order: data-lang → navigator.language → 'en'
  if (!cfg.lang) {
    cfg.lang = resolveLang(
      (typeof navigator !== 'undefined' && navigator.language) || 'en'
    );
  } else {
    cfg.lang = resolveLang(cfg.lang);
  }

  // ── State ─────────────────────────────────────────────────────────────────────

  let t = getStrings(cfg.lang);
  let history = [];
  let convoCost  = 0;
  let totalCost  = 0;
  let isOpen     = false;

  // ── CSS ───────────────────────────────────────────────────────────────────────

  const COLORS = {
    dark: {
      bg:        '#0d1117',
      surface:   '#161b22',
      border:    '#30363d',
      text:      '#e6edf3',
      muted:     '#8b949e',
      accent:    '#534AB7',
      accentHov: '#6459c8',
      green:     '#5DCAA5',
      userBubble:'#534AB7',
      botBubble: '#161b22',
    },
    light: {
      bg:        '#ffffff',
      surface:   '#f6f8fa',
      border:    '#d0d7de',
      text:      '#1f2328',
      muted:     '#656d76',
      accent:    '#534AB7',
      accentHov: '#6459c8',
      green:     '#1a7f64',
      userBubble:'#534AB7',
      botBubble: '#f6f8fa',
    },
  };

  const c = COLORS[cfg.theme] || COLORS.dark;
  const side = cfg.position === 'left' ? 'left' : 'right';
  const opposite = side === 'left' ? 'right' : 'left';

  function injectCSS() {
    if (document.getElementById('talovi-widget-css')) return;
    const style = document.createElement('style');
    style.id = 'talovi-widget-css';
    style.textContent = `
      #talovi-fab {
        position: fixed;
        bottom: 24px;
        ${side}: 24px;
        z-index: 99999;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: ${c.accent};
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        transition: background 0.2s, transform 0.2s;
      }
      #talovi-fab:hover { background: ${c.accentHov}; transform: scale(1.06); }
      #talovi-fab svg { pointer-events: none; }

      #talovi-widget {
        position: fixed;
        bottom: 88px;
        ${side}: 24px;
        z-index: 99998;
        width: 360px;
        max-width: calc(100vw - 32px);
        max-height: calc(100vh - 110px);
        background: ${c.bg};
        border: 1px solid ${c.border};
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        box-shadow: 0 8px 40px rgba(0,0,0,0.5);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        color: ${c.text};
        overflow: hidden;
        transform: translateY(8px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s, transform 0.2s;
      }
      #talovi-widget.open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }

      /* Header */
      #talovi-header {
        background: ${c.surface};
        border-bottom: 1px solid ${c.border};
        padding: 12px 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      #talovi-header-title {
        flex: 1;
        font-weight: 600;
        font-size: 14px;
        color: ${c.text};
      }
      #talovi-lang-select {
        background: ${c.bg};
        color: ${c.muted};
        border: 1px solid ${c.border};
        border-radius: 6px;
        padding: 3px 6px;
        font-size: 12px;
        cursor: pointer;
        outline: none;
      }
      #talovi-lang-select:focus { border-color: ${c.accent}; }

      /* Messages */
      #talovi-messages {
        flex: 1;
        overflow-y: auto;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 200px;
      }
      .talovi-msg {
        max-width: 82%;
        padding: 9px 13px;
        border-radius: 12px;
        line-height: 1.5;
        word-wrap: break-word;
        white-space: pre-wrap;
      }
      .talovi-msg.user {
        align-self: flex-end;
        background: ${c.userBubble};
        color: #fff;
        border-bottom-right-radius: 3px;
      }
      .talovi-msg.bot {
        align-self: flex-start;
        background: ${c.botBubble};
        border: 1px solid ${c.border};
        color: ${c.text};
        border-bottom-left-radius: 3px;
      }
      .talovi-msg.thinking { color: ${c.muted}; font-style: italic; }

      /* Cost strip */
      #talovi-cost {
        background: ${c.surface};
        border-top: 1px solid ${c.border};
        padding: 6px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 11px;
        color: ${c.muted};
        flex-shrink: 0;
      }
      #talovi-cost span { color: ${c.green}; font-weight: 500; }
      #talovi-reset-btn {
        margin-left: auto;
        background: none;
        border: none;
        color: ${c.muted};
        font-size: 11px;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        transition: color 0.15s;
      }
      #talovi-reset-btn:hover { color: ${c.text}; }

      /* Input row */
      #talovi-input-row {
        display: flex;
        gap: 8px;
        padding: 10px 12px;
        border-top: 1px solid ${c.border};
        background: ${c.surface};
        flex-shrink: 0;
      }
      #talovi-input {
        flex: 1;
        background: ${c.bg};
        color: ${c.text};
        border: 1px solid ${c.border};
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 13px;
        font-family: inherit;
        resize: none;
        outline: none;
        line-height: 1.4;
        max-height: 100px;
        overflow-y: auto;
        transition: border-color 0.15s;
      }
      #talovi-input::placeholder { color: ${c.muted}; }
      #talovi-input:focus { border-color: ${c.accent}; }
      #talovi-send {
        background: ${c.accent};
        border: none;
        border-radius: 8px;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        align-self: flex-end;
        transition: background 0.15s;
      }
      #talovi-send:hover { background: ${c.accentHov}; }
      #talovi-send:disabled { opacity: 0.5; cursor: default; }

      /* Powered-by footer */
      #talovi-footer {
        padding: 5px 14px 8px;
        font-size: 10px;
        color: ${c.border};
        text-align: ${opposite};
        background: ${c.surface};
        border-top: 1px solid ${c.border};
      }
      #talovi-footer a { color: ${c.muted}; text-decoration: none; }
      #talovi-footer a:hover { color: ${c.text}; }
    `;
    document.head.appendChild(style);
  }

  // ── DOM build ─────────────────────────────────────────────────────────────────

  function buildWidget() {
    // FAB toggle button
    const fab = document.createElement('button');
    fab.id = 'talovi-fab';
    fab.setAttribute('aria-label', 'Open Talovi AI assistant');
    fab.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>`;
    fab.addEventListener('click', toggleWidget);
    document.body.appendChild(fab);

    // Widget panel
    const widget = document.createElement('div');
    widget.id = 'talovi-widget';
    widget.setAttribute('role', 'dialog');
    widget.setAttribute('aria-label', t.header);
    widget.innerHTML = buildWidgetHTML();
    document.body.appendChild(widget);

    // Wire up events
    widget.querySelector('#talovi-send').addEventListener('click', handleSend);
    widget.querySelector('#talovi-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    widget.querySelector('#talovi-lang-select').addEventListener('change', (e) => {
      cfg.lang = e.target.value;
      t = getStrings(cfg.lang);
      updateStrings();
    });
    widget.querySelector('#talovi-reset-btn').addEventListener('click', () => {
      totalCost = 0;
      updateCost();
    });

    // Greeting
    appendMessage('bot', t.greeting);
  }

  function buildWidgetHTML() {
    const langOptions = SUPPORTED_LANGS.map(l =>
      `<option value="${l}"${l === cfg.lang ? ' selected' : ''}>${LANG_NAMES[l]}</option>`
    ).join('');

    return `
      <div id="talovi-header">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="#534AB7"/>
          <rect x="10" y="10" width="12" height="2.5" rx="1.25" fill="#fff"/>
          <rect x="14.75" y="12.5" width="2.5" height="8" rx="1.25" fill="#fff"/>
        </svg>
        <span id="talovi-header-title">${esc(t.header)}</span>
        <select id="talovi-lang-select" aria-label="${esc(t.langLabel)}">${langOptions}</select>
      </div>

      <div id="talovi-messages" role="log" aria-live="polite"></div>

      <div id="talovi-cost">
        <span id="talovi-cost-convo-label">${esc(t.thisConvo)}:</span>
        <span id="talovi-cost-convo">$0.0000</span>
        &nbsp;|&nbsp;
        <span id="talovi-cost-total-label">${esc(t.totalSpent)}:</span>
        <span id="talovi-cost-total">$0.0000</span>
        <button id="talovi-reset-btn">${esc(t.resetTotal)}</button>
      </div>

      <div id="talovi-input-row">
        <textarea id="talovi-input" rows="1"
          placeholder="${esc(t.placeholder)}"
          aria-label="${esc(t.placeholder)}"></textarea>
        <button id="talovi-send" aria-label="${esc(t.sendLabel)}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff"
               stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <div id="talovi-footer">
        <a href="https://talovi.dev" target="_blank" rel="noopener">${esc(t.poweredBy)}</a>
      </div>
    `;
  }

  // ── String helpers ────────────────────────────────────────────────────────────

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** Re-apply translated strings to existing DOM without rebuilding */
  function updateStrings() {
    const w = document.getElementById('talovi-widget');
    if (!w) return;
    w.querySelector('#talovi-header-title').textContent  = t.header;
    w.querySelector('#talovi-cost-convo-label').textContent = t.thisConvo + ':';
    w.querySelector('#talovi-cost-total-label').textContent = t.totalSpent + ':';
    w.querySelector('#talovi-reset-btn').textContent     = t.resetTotal;
    w.querySelector('#talovi-footer a').textContent      = t.poweredBy;
    const inp = w.querySelector('#talovi-input');
    inp.placeholder = t.placeholder;
    inp.setAttribute('aria-label', t.placeholder);
    w.querySelector('#talovi-send').setAttribute('aria-label', t.sendLabel);
  }

  // ── Widget open/close ─────────────────────────────────────────────────────────

  function toggleWidget() {
    isOpen = !isOpen;
    const w = document.getElementById('talovi-widget');
    if (isOpen) {
      w.classList.add('open');
      w.querySelector('#talovi-input').focus();
    } else {
      w.classList.remove('open');
    }
  }

  // ── Message rendering ─────────────────────────────────────────────────────────

  function appendMessage(role, text, id) {
    const log = document.getElementById('talovi-messages');
    const div = document.createElement('div');
    div.className = `talovi-msg ${role}`;
    if (id) div.id = id;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  // ── Cost display ──────────────────────────────────────────────────────────────

  function fmtCost(n) {
    if (n === 0) return '$0.0000';
    const mag = Math.floor(Math.log10(n));
    return '$' + n.toFixed(Math.max(4, -mag + 1));
  }

  function updateCost() {
    const w = document.getElementById('talovi-widget');
    if (!w) return;
    w.querySelector('#talovi-cost-convo').textContent = fmtCost(convoCost);
    w.querySelector('#talovi-cost-total').textContent = fmtCost(totalCost);
  }

  // ── API call ──────────────────────────────────────────────────────────────────

  /**
   * Send a message.
   * Priority:
   *   1. cfg.endpoint — POST to relay (provider-agnostic)
   *   2. OpenAI direct — call api.openai.com from the browser
   */
  async function callAI(userMessage) {
    // Reset per-conversation cost on each call (accumulate within session)
    const messages = history.concat([{ role: 'user', content: userMessage }]);

    if (cfg.endpoint) {
      const res = await fetch(cfg.endpoint, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cfg.apiKey ? { 'Authorization': `Bearer ${cfg.apiKey}` } : {}),
        },
        body: JSON.stringify({ messages, domain: cfg.domain, lang: cfg.lang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Expected: { text: string, cost?: number }
      return { text: data.text || data.message || data.content || '', cost: data.cost || 0 };
    }

    // Direct OpenAI fallback (only works in browser for openai provider)
    if (!cfg.apiKey) throw new Error('No API key or endpoint configured.');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model:      'gpt-4o-mini',
        max_tokens: 1024,
        messages,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    // gpt-4o-mini: $0.00000015/in, $0.0000006/out — approximate
    const cost = (data.usage?.prompt_tokens     || 0) * 0.00000015 +
                 (data.usage?.completion_tokens  || 0) * 0.0000006;
    return { text, cost };
  }

  // ── Send handler ──────────────────────────────────────────────────────────────

  async function handleSend() {
    const input   = document.getElementById('talovi-input');
    const sendBtn = document.getElementById('talovi-send');
    const text    = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = '';
    sendBtn.disabled = true;

    appendMessage('user', text);

    const thinkingId = 'talovi-thinking-' + Date.now();
    appendMessage('bot thinking', t.thinking, thinkingId);

    try {
      const { text: reply, cost } = await callAI(text);

      history.push({ role: 'user',      content: text  });
      history.push({ role: 'assistant', content: reply });

      convoCost += cost;
      totalCost += cost;

      const el = document.getElementById(thinkingId);
      if (el) { el.className = 'talovi-msg bot'; el.textContent = reply; }
      else { appendMessage('bot', reply); }

      updateCost();
    } catch (err) {
      const el = document.getElementById(thinkingId);
      const msg = t.errorMsg + (err.message ? ' (' + err.message + ')' : '');
      if (el) { el.className = 'talovi-msg bot'; el.textContent = msg; }
      else { appendMessage('bot', msg); }
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────

  function init() {
    injectCSS();
    buildWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
