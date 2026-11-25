/**
 * Centralized Multi-language (vi / en) Message Catalog for Backend API
 * Complies with Zero-Hardcoding Governance
 */
const vi = require('./vi');
const en = require('./en');

const MESSAGES = { vi, en };

const resolveLang = (reqOrLang = 'vi') => {
  if (!reqOrLang) return 'vi';
  if (typeof reqOrLang === 'string') {
    return reqOrLang.toLowerCase().startsWith('en') ? 'en' : 'vi';
  }
  const queryLang = reqOrLang.query?.lang;
  if (queryLang && String(queryLang).toLowerCase().startsWith('en')) return 'en';
  const headerLang = reqOrLang.headers?.['accept-language'];
  if (headerLang && String(headerLang).toLowerCase().startsWith('en')) return 'en';
  return 'vi';
};

const getMessage = (key, params = {}, reqOrLang = 'vi') => {
  const lang = resolveLang(reqOrLang);
  const dict = MESSAGES[lang] || MESSAGES.vi;
  let template = dict[key] || MESSAGES.vi[key] || key;

  if (params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params)) {
      template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return template;
};

module.exports = {
  MESSAGES,
  resolveLang,
  getMessage,
};
