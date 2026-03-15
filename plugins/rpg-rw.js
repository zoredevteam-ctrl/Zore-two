// utils/textRomance.js
import fs from 'fs/promises';

/**
 * Emoji reactions por defecto
 * Puedes modificar/eliminar elementos del array en tiempo de ejecución con addEmoji/removeEmoji si quieres.
 */
let emojiReactions = ['😊', '❤️', '😍', '😂', '😢'];

/**
 * Respuestas románticas por defecto (editable en tiempo de ejecución)
 */
let romanticResponses = [
  'You light up my world!',
  'You are my high point of every day!',
  'Together forever!',
  'You make my heart race!',
  'You are the missing piece of my puzzle!'
];

const safeString = (v) => (typeof v === 'string' ? v : String(v || ''));

/* -------------------- Helpers aleatorios -------------------- */
const randomIndex = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return -1;
  return Math.floor(Math.random() * arr.length);
};

const getRandomFrom = (arr) => {
  const i = randomIndex(arr);
  return i === -1 ? '' : arr[i];
};

/* -------------------- Emoji -------------------- */
const getRandomEmoji = (opts = {}) => {
  const { exclude = [] } = opts;
  const pool = emojiReactions.filter((e) => !exclude.includes(e));
  return getRandomFrom(pool.length ? pool : emojiReactions);
};

const addEmoji = (emoji) => {
  if (!emoji || typeof emoji !== 'string') return false;
  if (!emojiReactions.includes(emoji)) {
    emojiReactions.push(emoji);
    return true;
  }
  return false;
};

const removeEmoji = (emoji) => {
  const idx = emojiReactions.indexOf(emoji);
  if (idx === -1) return false;
  emojiReactions.splice(idx, 1);
  return true;
};

/* -------------------- Reescritura de texto -------------------- */
const toTitleCase = (s) =>
  s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const toSentenceCase = (s) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const leet = (s) =>
  s
    .replace(/a/gi, '4')
    .replace(/e/gi, '3')
    .replace(/i/gi, '1')
    .replace(/o/gi, '0')
    .replace(/s/gi, '5');

const rewriteText = (text = '', style = 'none') => {
  text = safeString(text).trim();
  if (!text) return '';

  switch (style) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'italic':
      return `*${text}*`; // markdown-like (usa * para tu bot si interpreta markdown)
    case 'bold':
      return `**${text}**`;
    case 'title':
      return toTitleCase(text);
    case 'capitalize': // solo primera letra de cada palabra
      return text
        .split(' ')
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''))
        .join(' ');
    case 'sentence':
    case 'sentencecase':
      return toSentenceCase(text);
    case 'reverse':
      return text.split('').reverse().join('');
    case 'leet':
      return leet(text);
    case 'none':
    default:
      return text;
  }
};

/* -------------------- Respuestas románticas -------------------- */
const getRandomRomanticResponse = () => getRandomFrom(romanticResponses);

const addRomanticResponse = (r) => {
  if (!r || typeof r !== 'string') return false;
  if (!romanticResponses.includes(r)) {
    romanticResponses.push(r);
    return true;
  }
  return false;
};

const removeRomanticResponse = (r) => {
  const idx = romanticResponses.indexOf(r);
  if (idx === -1) return false;
  romanticResponses.splice(idx, 1);
  return true;
};

const listRomanticResponses = () => [...romanticResponses];

/* -------------------- Combo mode (configurable) -------------------- */
/**
 * comboMode(text, options)
 * options = {
 *   style: 'uppercase'|'lowercase'|'italic'|...,
 *   emoji: true|false (incluir emoji),
 *   romantic: true|false (incluir frase romántica),
 *   separator: ' ' (separador entre partes),
 *   emojiExclude: [] (array de emojis a excluir)
 * }
 */
const comboMode = (text = '', options = {}) => {
  const {
    style = 'uppercase',
    emoji = true,
    romantic = true,
    separator = ' ',
    emojiExclude = []
  } = options || {};

  const rewritten = rewriteText(text, style);
  const parts = [rewritten];

  if (emoji) parts.push(getRandomEmoji({ exclude: emojiExclude }));
  if (romantic) parts.push(getRandomRomanticResponse());

  return parts.filter(Boolean).join(separator);
};

/* -------------------- Guardar / Cargar respuestas románticas (fs) -------------------- */
const saveRomanticResponsesToFile = async (filePath = './romanticResponses.json') => {
  const data = JSON.stringify(romanticResponses, null, 2);
  await fs.writeFile(filePath, data, 'utf8');
  return filePath;
};

const loadRomanticResponsesFromFile = async (filePath = './romanticResponses.json') => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      romanticResponses = parsed;
      return romanticResponses;
    } else {
      throw new Error('File does not contain an array.');
    }
  } catch (e) {
    throw e;
  }
};

/* -------------------- Exports -------------------- */
export {
  getRandomEmoji,
  addEmoji,
  removeEmoji,
  rewriteText,
  getRandomRomanticResponse,
  addRomanticResponse,
  removeRomanticResponse,
  listRomanticResponses,
  comboMode,
  saveRomanticResponsesToFile,
  loadRomanticResponsesFromFile
};

export default {
  getRandomEmoji,
  addEmoji,
  removeEmoji,
  rewriteText,
  getRandomRomanticResponse,
  addRomanticResponse,
  removeRomanticResponse,
  listRomanticResponses,
  comboMode,
  saveRomanticResponsesToFile,
  loadRomanticResponsesFromFile
};