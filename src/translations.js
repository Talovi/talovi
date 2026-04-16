/**
 * src/translations.js
 *
 * UI string translations for the Talovi widget and npm package.
 * Keys are BCP 47 language tags (lowercase, no region).
 *
 * Usage:
 *   import { getStrings, SUPPORTED_LANGS } from 'talovi/src/translations.js';
 *   const t = getStrings('es');
 *   console.log(t.greeting); // "¡Hola! ¿Cómo puedo ayudarte hoy?"
 */

export const SUPPORTED_LANGS = ['en', 'es', 'fr', 'pt', 'zh'];

export const TRANSLATIONS = {
  en: {
    header:      'AI Assistant',
    poweredBy:   'Powered by Talovi',
    placeholder: 'Type your message…',
    greeting:    'Hello! How can I help you today?',
    thisConvo:   'This conversation',
    totalSpent:  'Total spent',
    resetTotal:  'Reset total',
    sendLabel:   'Send',
    langLabel:   'Language',
  },
  es: {
    header:      'Asistente IA',
    poweredBy:   'Desarrollado por Talovi',
    placeholder: 'Escribe tu mensaje…',
    greeting:    '¡Hola! ¿Cómo puedo ayudarte hoy?',
    thisConvo:   'Esta conversación',
    totalSpent:  'Total gastado',
    resetTotal:  'Reiniciar total',
    sendLabel:   'Enviar',
    langLabel:   'Idioma',
  },
  fr: {
    header:      'Assistant IA',
    poweredBy:   'Propulsé par Talovi',
    placeholder: 'Tapez votre message…',
    greeting:    'Bonjour ! Comment puis-je vous aider aujourd'hui ?',
    thisConvo:   'Cette conversation',
    totalSpent:  'Total dépensé',
    resetTotal:  'Réinitialiser le total',
    sendLabel:   'Envoyer',
    langLabel:   'Langue',
  },
  pt: {
    header:      'Assistente IA',
    poweredBy:   'Desenvolvido por Talovi',
    placeholder: 'Digite sua mensagem…',
    greeting:    'Olá! Como posso ajudá-lo hoje?',
    thisConvo:   'Esta conversa',
    totalSpent:  'Total gasto',
    resetTotal:  'Redefinir total',
    sendLabel:   'Enviar',
    langLabel:   'Idioma',
  },
  zh: {
    header:      'AI 助手',
    poweredBy:   '由 Talovi 驱动',
    placeholder: '输入您的消息…',
    greeting:    '你好！今天我能帮您什么？',
    thisConvo:   '本次对话',
    totalSpent:  '总花费',
    resetTotal:  '重置总计',
    sendLabel:   '发送',
    langLabel:   '语言',
  },
};

/**
 * Resolve a lang code to a supported language, falling back to 'en'.
 * Accepts full BCP 47 tags like 'es-MX' and maps them to base codes.
 *
 * @param {string} [lang] - e.g. 'es', 'fr', 'zh-CN', 'pt-BR'
 * @returns {string} A key that exists in TRANSLATIONS
 */
export function resolveLang(lang) {
  if (!lang) return 'en';
  const base = lang.toLowerCase().split('-')[0];
  return SUPPORTED_LANGS.includes(base) ? base : 'en';
}

/**
 * Return the translation strings for a language.
 * Always returns a complete object — falls back to English for any missing key.
 *
 * @param {string} [lang]
 * @returns {typeof TRANSLATIONS['en']}
 */
export function getStrings(lang) {
  const key = resolveLang(lang);
  return { ...TRANSLATIONS.en, ...TRANSLATIONS[key] };
}
