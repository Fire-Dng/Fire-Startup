import { cloneElement, isValidElement } from 'react';
import { useLanguage } from '../controllers/LanguageProvider.jsx';

function localizeText(node, translate) {
  const leading = node.match(/^\s*/)?.[0] || '';
  const trailing = node.match(/\s*$/)?.[0] || '';
  const end = trailing ? node.length - trailing.length : node.length;
  const text = node.slice(leading.length, end);
  return text ? leading + translate(text) + trailing : node;
}

function localizeNode(node, translate) {
  if (typeof node === 'string') return localizeText(node, translate);
  if (Array.isArray(node)) return node.map((child) => localizeNode(child, translate));
  if (!isValidElement(node)) return node;

  const props = {};
  for (const [name, value] of Object.entries(node.props)) {
    if (name === 'children') continue;
    props[name] = typeof value === 'string' ? translate(value) : value;
  }

  const children = localizeNode(node.props.children, translate);
  return cloneElement(node, props, children);
}

export default function LocalizedContent({ children }) {
  const { t } = useLanguage();
  return localizeNode(children, t);
}
