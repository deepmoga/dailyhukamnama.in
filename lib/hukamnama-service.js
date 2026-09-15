import { query } from './db.js';
import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

/**
 * Scan filesystem for all generated poster pages for a given date
 * (e.g., hukamnama-YYYY-MM-DD-1.jpg, -2.jpg, -3.jpg)
 */
export function getPosterPagesForDate(dateStr, sourceImage = null) {
  const publicDir = path.join(process.cwd(), 'public');
  const uploadsDir = path.join(publicDir, 'uploads');
  const pages = [];

  if (dateStr) {
    let year = '';
    let month = '';
    if (/^\d{4}-\d{2}/.test(dateStr)) {
      const parts = dateStr.split('-');
      year = parts[0];
      month = parts[1];
    }

    // 1. Check dated directory (e.g. public/uploads/2026/09/)
    if (year && month) {
      const datedDir = path.join(uploadsDir, year, month);
      for (let p = 1; p <= 15; p++) {
        const pageFile = `hukamnama-${dateStr}-${p}.jpg`;
        if (fs.existsSync(path.join(datedDir, pageFile))) {
          pages.push(`/uploads/${year}/${month}/${pageFile}`);
        } else {
          break;
        }
      }
    }

    // 2. Fallback to legacy root uploads directory if not found in dated directory
    if (pages.length === 0) {
      for (let p = 1; p <= 15; p++) {
        const pageFile = `hukamnama-${dateStr}-${p}.jpg`;
        if (fs.existsSync(path.join(uploadsDir, pageFile))) {
          pages.push(`/uploads/${pageFile}`);
        } else {
          break;
        }
      }
    }
  }

  // 3. Fallback to sourceImage if no pages found
  if (pages.length === 0 && sourceImage) {
    const cleanImg = sourceImage.split('?')[0];
    const relPath = cleanImg.startsWith('/') ? cleanImg.slice(1) : cleanImg;
    const localPath = path.join(publicDir, relPath);
    if (fs.existsSync(localPath)) {
      pages.push(cleanImg.startsWith('/') ? cleanImg : `/${cleanImg}`);
    } else {
      const baseName = path.basename(cleanImg);
      if (fs.existsSync(path.join(uploadsDir, baseName))) {
        pages.push(`/uploads/${baseName}`);
      } else {
        pages.push(cleanImg);
      }
    }
  }

  return pages;
}

export const PUNJABI_WEEKDAYS = [
  'ਐਤਵਾਰ',    // Sunday (0)
  'ਸੋਮਵਾਰ',    // Monday (1)
  'ਮੰਗਲਵਾਰ',   // Tuesday (2)
  'ਬੁੱਧਵਾਰ',   // Wednesday (3)
  'ਵੀਰਵਾਰ',    // Thursday (4)
  'ਸ਼ੁੱਕਰਵਾਰ',  // Friday (5)
  'ਸ਼ਨੀਵਾਰ',    // Saturday (6)
];

const GURMUKHI_DIGITS = ['੦', '੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯'];

export function toGurmukhiDigits(numStr) {
  return String(numStr).replace(/[0-9]/g, (d) => GURMUKHI_DIGITS[parseInt(d, 10)] || d);
}

export function calculateNanakshahiHeader(istDateObj, yesterdayHeader = '') {
  const dayIndex = istDateObj.getDay();
  const punjabiDay = PUNJABI_WEEKDAYS[dayIndex];

  // 1. Try deriving from yesterday's header if available
  if (yesterdayHeader) {
    const cleanYesterday = anmolLipiToGurmukhi(yesterdayHeader);
    const match = cleanYesterday.match(/([੦-੯]+)\s+([^\s(]+)\s*\(([^)]+)\)/);
    if (match) {
      let num = 0;
      for (const ch of match[1]) {
        const idx = GURMUKHI_DIGITS.indexOf(ch);
        if (idx !== -1) num = num * 10 + idx;
      }
      if (num > 0) {
        const todayNum = num + 1;
        return `${punjabiDay}, ${toGurmukhiDigits(todayNum)} ${match[2]} (${match[3]})`;
      }
    }
  }

  // 2. Fallback using public/assets/js/nanakshahi.min.js
  try {
    const nanakshahiPath = path.join(process.cwd(), 'public', 'assets', 'js', 'nanakshahi.min.js');
    if (fs.existsSync(nanakshahiPath)) {
      const nanakshahiCode = fs.readFileSync(nanakshahiPath, 'utf8');
      const mod = { exports: {} };
      const fn = new Function('module', 'exports', nanakshahiCode);
      fn(mod, mod.exports);
      const ns = mod.exports.getNanakshahiDate ? mod.exports : (mod.exports.nanakshahi || {});
      if (typeof ns.getNanakshahiDate === 'function') {
        const nd = ns.getNanakshahiDate(istDateObj);
        if (nd && nd.punjabiDate) {
          return `${punjabiDay}, ${nd.punjabiDate.date} ${nd.punjabiDate.monthName} (ਸੰਮਤ ${nd.punjabiDate.year} ਨਾਨਕਸ਼ਾਹੀ)`;
        }
      }
    }
  } catch (err) {
    console.warn('Nanakshahi calendar fallback notice:', err.message);
  }

  return `${punjabiDay} (ਸੰਮਤ ੫੫੮ ਨਾਨਕਸ਼ਾਹੀ)`;
}

/**
 * Format Date to YYYY-MM-DD in IST (Asia/Kolkata)
 */
export function formatDate(d = new Date()) {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim())) {
    return d.trim();
  }
  const dateObj = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(dateObj);
}

/**
 * Parse line-by-line verses matching old website format
 */
export function parseVerses(hukamnama) {
  if (!hukamnama) return [];

  // 1. If content_html exists, parse with cheerio
  if (hukamnama.content_html) {
    try {
      const $ = cheerio.load(hukamnama.content_html);
      const verses = [];
      $('.l0').each((i, el) => {
        const $el = $(el);
        const gurmukhi = $el.find('.l1').text().trim();
        const hindi = $el.find('.l2').text().trim();
        const englishTranslit = $el.find('.l3').text().trim();
        const punjabiArth = $el.find('.m1').text().trim();
        const hindiArth = $el.find('.m2').text().trim();
        const englishTrans = $el.find('.m3').text().trim();
        const citation = $el.find('.i1').text().trim();

        if (gurmukhi || punjabiArth || englishTrans || hindiArth) {
          verses.push({
            gurmukhi,
            hindi,
            englishTranslit,
            punjabiArth,
            hindiArth,
            englishTrans,
            citation,
          });
        }
      });
      if (verses.length > 0) return verses;
    } catch (e) {
      console.warn('Error parsing content_html verses:', e.message);
    }
  }

  // 2. Fallback: split from gurmukhi_only, punjabi_arth, english_translation, hindi_translation
  const gLines = (hukamnama.gurmukhi_only || '').split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const pLines = (hukamnama.punjabi_arth || '').split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const eLines = (hukamnama.english_translation || '').split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const hLines = (hukamnama.hindi_translation || '').split(/\n+/).map((l) => l.trim()).filter(Boolean);

  const maxLen = Math.max(gLines.length, pLines.length, eLines.length, hLines.length);
  const fallbackVerses = [];
  for (let i = 0; i < maxLen; i++) {
    fallbackVerses.push({
      gurmukhi: gLines[i] || '',
      hindi: '',
      englishTranslit: '',
      punjabiArth: pLines[i] || '',
      hindiArth: hLines[i] || '',
      englishTrans: eLines[i] || '',
      citation: '',
    });
  }
  return fallbackVerses;
}

/**
 * Convert legacy AnmolLipi / ASCII Gurmukhi date headers to standard Unicode Punjabi
 */
export function anmolLipiToGurmukhi(str) {
  if (!str) return '';

  const phraseMap = [
    [/Su`krvwr/g, 'ਸ਼ੁੱਕਰਵਾਰ'],
    [/vIrvwr/g, 'ਵੀਰਵਾਰ'],
    [/bu`Dvwr/g, 'ਬੁੱਧਵਾਰ'],
    [/mMglvwr/g, 'ਮੰਗਲਵਾਰ'],
    [/somvwr/g, 'ਸੋਮਵਾਰ'],
    [/AYqvwr/g, 'ਐਤਵਾਰ'],
    [/SnIvwr/g, 'ਸ਼ਨੀਵਾਰ'],

    [/cyq/g, 'ਚੇਤ'],
    [/vYswK/g, 'ਵਿਸਾਖ'],
    [/jyT/g, 'ਜੇਠ'],
    [/hwV/g, 'ਹਾੜ'],
    [/swvx/g, 'ਸਾਵਣ'],
    [/BwdoN/g, 'ਭਾਦੋਂ'],
    [/A`sU/g, 'ਅੱਸੂ'],
    [/AsU/g, 'ਅੱਸੂ'],
    [/k`qk/g, 'ਕੱਤਕ'],
    [/kqk/g, 'ਕੱਤਕ'],
    [/m`Gr/g, 'ਮੱਘਰ'],
    [/mGr/g, 'ਮੱਘਰ'],
    [/poh/g, 'ਪੋਹ'],
    [/mwG/g, 'ਮਾਘ'],
    [/P`gx/g, 'ਫੱਗਣ'],
    [/Pgx/g, 'ਫੱਗਣ'],

    [/sMmq/g, 'ਸੰਮਤ'],
    [/nwnkSwhI/g, 'ਨਾਨਕਸ਼ਾਹੀ'],
    [/drbwr swihb/g, 'ਦਰਬਾਰ ਸਾਹਿਬ'],
    [/hukmnwmw/g, 'ਹੁਕਮਨਾਮਾ'],
  ];

  let res = str;
  for (const [pattern, replacement] of phraseMap) {
    res = res.replace(pattern, replacement);
  }

  const numMap = {
    '0': '੦', '1': '੧', '2': '੨', '3': '੩', '4': '੪',
    '5': '੫', '6': '੬', '7': '੭', '8': '੮', '9': '੯'
  };
  
  res = res.replace(/\d/g, (d) => numMap[d] || d);
  return res;
}

/**
 * Fetch the latest Hukamnama from MySQL
 */
export async function getLatestHukamnama() {
  try {
    const rows = await query(
      `SELECT id, DATE_FORMAT(hukamnama_date, '%Y-%m-%d') as hukamnama_date, title, gurmukhi_header, shabad_title, ang, raag, author, content_html, gurmukhi_only, punjabi_arth, english_translation, hindi_translation, source_pdf, source_image, views, created_at 
       FROM hukamnamas 
       ORDER BY hukamnama_date DESC, id DESC LIMIT 1`
    );
    if (rows && rows.length > 0) {
      const h = rows[0];
      h.gurmukhi_header = anmolLipiToGurmukhi(h.gurmukhi_header);
      h.verses = parseVerses(h);
      h.poster_pages = getPosterPagesForDate(h.hukamnama_date, h.source_image);
      return h;
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest hukamnama:', error);
    return null;
  }
}

/**
 * Fetch Hukamnama by a specific date (YYYY-MM-DD)
 */
export async function getHukamnamaByDate(dateStr) {
  try {
    const rows = await query(
      `SELECT id, DATE_FORMAT(hukamnama_date, '%Y-%m-%d') as hukamnama_date, title, gurmukhi_header, shabad_title, ang, raag, author, content_html, gurmukhi_only, punjabi_arth, english_translation, hindi_translation, source_pdf, source_image, views, created_at 
       FROM hukamnamas WHERE hukamnama_date = ? LIMIT 1`,
      [dateStr]
    );
    if (rows && rows.length > 0) {
      const h = rows[0];
      h.gurmukhi_header = anmolLipiToGurmukhi(h.gurmukhi_header);
      h.verses = parseVerses(h);
      h.poster_pages = getPosterPagesForDate(h.hukamnama_date, h.source_image);
      return h;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching hukamnama for date ${dateStr}:`, error);
    return null;
  }
}

/**
 * Fetch the last 5 Hukamnamas for the sidebar list
 */
export async function getLast5Hukamnamas() {
  try {
    const rows = await query(
      `SELECT id, DATE_FORMAT(hukamnama_date, '%Y-%m-%d') as hukamnama_date, title, shabad_title, ang, raag, author, source_image 
       FROM hukamnamas 
       ORDER BY hukamnama_date DESC, id DESC 
       LIMIT 5`
    );
    return rows || [];
  } catch (error) {
    console.error('Error fetching last 5 hukamnamas:', error);
    return [];
  }
}

/**
 * Fetch all dates in a specific year and month that have Hukamnamas (for calendar)
 */
export async function getMonthHukamnamaDates(year, month) {
  try {
    const formattedMonth = String(month).padStart(2, '0');
    const startDate = `${year}-${formattedMonth}-01`;
    const endDate = `${year}-${formattedMonth}-31`;

    const rows = await query(
      `SELECT DATE_FORMAT(hukamnama_date, '%Y-%m-%d') as hukamnama_date FROM hukamnamas 
       WHERE hukamnama_date BETWEEN ? AND ? 
       ORDER BY hukamnama_date ASC`,
      [startDate, endDate]
    );

    return (rows || []).map((r) => String(r.hukamnama_date));
  } catch (error) {
    console.error('Error fetching month hukamnama dates:', error);
    return [];
  }
}

/**
 * Helper to generate poster using python script if needed
 */
async function generatePosterImage(options, fallbackFormattedDate = '', fallbackGurmukhiText = '') {
  const { exec } = await import('child_process');
  const path = await import('path');
  const fs = await import('fs');

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Handle both object payload and legacy positional arguments
  const isObject = typeof options === 'object' && options !== null;
  const dateStr = isObject ? options.dateStr : options;

  let year = '';
  let month = '';
  if (dateStr && /^\d{4}-\d{2}/.test(dateStr)) {
    const parts = dateStr.split('-');
    year = parts[0];
    month = parts[1];
  } else {
    const now = new Date();
    year = String(now.getFullYear());
    month = String(now.getMonth() + 1).padStart(2, '0');
  }

  const datedUploadsDir = path.join(uploadsDir, year, month);
  if (!fs.existsSync(datedUploadsDir)) {
    fs.mkdirSync(datedUploadsDir, { recursive: true });
  }

  const filename = `hukamnama-${dateStr}-1.jpg`;
  const relativePath = `/uploads/${year}/${month}/${filename}`;
  const outP1 = path.join(datedUploadsDir, filename);
  const outP2 = path.join(datedUploadsDir, `hukamnama-${dateStr}-2.jpg`);
  const datedLegacyPath = path.join(datedUploadsDir, `hukamnama-${dateStr}.jpg`);
  const rootLegacyPath = path.join(uploadsDir, `hukamnama-${dateStr}.jpg`);
  const rootP1 = path.join(uploadsDir, filename);

  const payload = isObject ? {
    date_str: options.dateStrEn || '',
    punjabi_date_str: options.punjabiDateStr || '',
    english_date_str: options.englishDateStr || '',
    raag_punjabi: options.raagPunjabi || '',
    raag_english: options.raagEnglish || '',
    mukhwak: options.mukhwak || '',
    viakhya: options.viakhya || '',
    english: options.english || '',
    output_p1: outP1,
    output_p2: outP2,
  } : {
    date_str: fallbackFormattedDate || '',
    mukhwak: fallbackGurmukhiText || '',
    output_p1: outP1,
    output_p2: outP2,
  };

  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_poster.py');
    const jsonB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
    const pythonBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
    const cmd = `${pythonBin} "${scriptPath}" --json "${jsonB64}"`;

    exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        console.warn('Poster generation error:', stderr || err.message);
        resolve(null);
      } else {
        console.log('Posters generated successfully:', stdout.trim());
        try {
          if (fs.existsSync(outP1)) {
            fs.copyFileSync(outP1, datedLegacyPath);
            fs.copyFileSync(outP1, rootLegacyPath);
            fs.copyFileSync(outP1, rootP1);
          }
        } catch (copyErr) {
          // ignore copy error
        }
        resolve(relativePath);
      }
    });
  });
}

/**
 * Extractor Service: Scrapes today's Hukamnama from source (similar to daily-hukamnama-poster.php)
 * and stores it into MySQL if not already existing.
 * Guarantees syncing and persisting in the database.
 */
export async function extractAndStoreHukamnama(targetDate = new Date(), force = false) {
  const path = await import('path');
  const fs = await import('fs');
  const dateStr = formatDate(targetDate);

  // 1. Check yesterday's record to prevent storing yesterday's Hukamnama on a new day
  const targetDateObj = new Date(`${dateStr}T12:00:00+05:30`);
  const yesterdayObj = new Date(targetDateObj);
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = formatDate(yesterdayObj);
  const yesterdayRecord = await getHukamnamaByDate(yesterdayStr);

  const existing = await getHukamnamaByDate(dateStr);
  let year = '';
  let month = '';
  if (/^\d{4}-\d{2}/.test(dateStr)) {
    const parts = dateStr.split('-');
    year = parts[0];
    month = parts[1];
  }
  const p1Dated = (year && month) ? path.join(process.cwd(), 'public', 'uploads', year, month, `hukamnama-${dateStr}-1.jpg`) : null;
  const p1Legacy = path.join(process.cwd(), 'public', 'uploads', `hukamnama-${dateStr}-1.jpg`);
  const imageExistsOnDisk = (p1Dated && fs.existsSync(p1Dated)) || fs.existsSync(p1Legacy);

  // Determine expected Punjabi weekday in IST
  const expectedPunjabiDay = PUNJABI_WEEKDAYS[targetDateObj.getDay()];
  const hasWrongWeekdayInHeader = existing?.gurmukhi_header && !anmolLipiToGurmukhi(existing.gurmukhi_header).startsWith(expectedPunjabiDay);

  // Check if existing record was prematurely saved with yesterday's content
  const isExistingStaleYesterday = existing && yesterdayRecord && (
    (existing.ang && yesterdayRecord.ang && String(existing.ang).trim() === String(yesterdayRecord.ang).trim()) ||
    (existing.gurmukhi_only && yesterdayRecord.gurmukhi_only && existing.gurmukhi_only.slice(0, 40).trim() === yesterdayRecord.gurmukhi_only.slice(0, 40).trim())
  );

  if (!force && existing && imageExistsOnDisk && existing.punjabi_arth && !isExistingStaleYesterday && !hasWrongWeekdayInHeader) {
    return { status: 'already_exists', hukamnama: existing, message: 'Already synced and stored in database.' };
  }

  try {
    const titleDate = targetDateObj.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const dateLineWithDay = targetDateObj.toLocaleDateString('en-US', {
      timeZone: 'Asia/Kolkata',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      weekday: 'long',
    });

    // 2. Fetch Gurmukhi header (SikhNet)
    let gurmukhiHeader = '';
    if (existing?.gurmukhi_header && anmolLipiToGurmukhi(existing.gurmukhi_header).startsWith(expectedPunjabiDay)) {
      gurmukhiHeader = anmolLipiToGurmukhi(existing.gurmukhi_header);
    }

    if (!gurmukhiHeader || force || hasWrongWeekdayInHeader) {
      try {
        const sikhnetRes = await axios.get('https://www.sikhnet.com/hukam', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 10000,
        });
        const $sikhnet = cheerio.load(sikhnetRes.data);
        const headerNode = $sikhnet('p.excerpt.gurmukhi-text').first();
        if (headerNode.length) {
          const scraped = anmolLipiToGurmukhi(headerNode.text().trim());
          if (scraped.startsWith(expectedPunjabiDay)) {
            gurmukhiHeader = scraped;
          } else {
            console.warn(`[Auto-sync] SikhNet has stale Gurmukhi header (${scraped.split(',')[0]} vs expected ${expectedPunjabiDay}).`);
          }
        }
      } catch (e) {
        console.warn('Could not fetch Gurmukhi header from SikhNet:', e.message);
      }
    }

    // Fallback if SikhNet was stale or unreachable
    if (!gurmukhiHeader || !gurmukhiHeader.startsWith(expectedPunjabiDay)) {
      gurmukhiHeader = calculateNanakshahiHeader(targetDateObj, yesterdayRecord?.gurmukhi_header);
    }
    gurmukhiHeader = anmolLipiToGurmukhi(gurmukhiHeader);

    // 3. Fetch full content from Dekho-Ji
    let contentHtml = existing?.content_html || '';
    let gurmukhiOnly = existing?.gurmukhi_only || '';
    let punjabiArth = existing?.punjabi_arth || '';
    let englishTranslation = existing?.english_translation || '';
    let hindiTranslation = existing?.hindi_translation || '';
    let ang = existing?.ang || '';
    let raag = existing?.raag || '';
    let author = existing?.author || '';
    let shabadTitle = existing?.shabad_title || '';

    if (force || !gurmukhiOnly || !punjabiArth) {
      try {
        const dekhojiRes = await axios.get('https://www.dekho-ji.com/hukamnama?t=today', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        });

        const $ = cheerio.load(dekhojiRes.data);
        const section = $('#bani1txt');

        if (section.length) {
          contentHtml = section.html() || contentHtml;

          const gurmukhiNodes = section.find('.l1, .gurmukhi, .gurbani, .bani-gurmukhi');
          if (gurmukhiNodes.length) {
            const rawG = gurmukhiNodes.map((i, el) => $(el).text().trim()).get().filter(Boolean).join('\n\n');
            if (rawG) gurmukhiOnly = rawG;
          }

          const punjabiNodes = section.find('.m1, .punjabi, .arth, .viakhya');
          if (punjabiNodes.length) {
            const rawP = punjabiNodes.map((i, el) => $(el).text().trim()).get().filter(Boolean).join('\n\n');
            if (rawP) punjabiArth = rawP;
          }

          const englishNodes = section.find('.m3, .english, .translation');
          if (englishNodes.length) {
            const rawE = englishNodes.map((i, el) => $(el).text().trim()).get().filter(Boolean).join('\n\n');
            if (rawE) englishTranslation = rawE;
          }

          const hindiNodes = section.find('.m2, .hindi');
          if (hindiNodes.length) {
            const rawH = hindiNodes.map((i, el) => $(el).text().trim()).get().filter(Boolean).join('\n\n');
            if (rawH) hindiTranslation = rawH;
          }

          const fullText = section.text();
          const angMatch = fullText.match(/ਅੰਗ\s*[:\-]?\s*([0-9]+)|Ang\s*[:\-]?\s*([0-9]+)/i);
          if (angMatch) ang = angMatch[1] || angMatch[2];

          const raagMatch = fullText.match(/(ਰਾਗ[^\n,]+|Raag[^\n,]+)/i);
          if (raagMatch) raag = raagMatch[1].trim();

          const titleNode = section.find('h1, h2, h3').first();
          if (titleNode.length) {
            shabadTitle = titleNode.text().trim();
          }
        }
      } catch (e) {
        console.warn('Could not scrape Dekho-Ji:', e.message);
      }
    }

    // Safety check: Don't store yesterday's Hukamnama if source (Dekho-Ji) hasn't updated yet for today
    if (!force && yesterdayRecord && (gurmukhiOnly || ang)) {
      const isScrapedMatchingYesterday = (
        (ang && yesterdayRecord.ang && String(ang).trim() === String(yesterdayRecord.ang).trim()) ||
        (gurmukhiOnly && yesterdayRecord.gurmukhi_only && gurmukhiOnly.slice(0, 40).trim() === yesterdayRecord.gurmukhi_only.slice(0, 40).trim())
      );

      if (isScrapedMatchingYesterday) {
        console.log(`[Auto-sync] Source still has yesterday's Hukamnama (${yesterdayStr}, Ang ${ang}). Waiting for today's Sri Darbar Sahib release.`);
        return {
          status: 'source_not_ready',
          message: `Source has not yet published today's Hukamnama (matches yesterday's Hukamnama, Ang ${ang}). Will auto-retry on next cron run.`,
          hukamnama: existing || null,
        };
      }
    }

    // Safety check: Never overwrite non-empty data with empty scraped data
    gurmukhiOnly = gurmukhiOnly || existing?.gurmukhi_only || '';
    punjabiArth = punjabiArth || existing?.punjabi_arth || '';
    englishTranslation = englishTranslation || existing?.english_translation || '';
    hindiTranslation = hindiTranslation || existing?.hindi_translation || '';

    // Extract clean Punjabi Raag heading:
    let cleanRaagPunjabi = '';
    if (gurmukhiOnly) {
      const firstLine = gurmukhiOnly.split('\n')[0].trim();
      if (firstLine.includes('॥') && firstLine.length < 60) {
        cleanRaagPunjabi = firstLine;
      }
    }
    if (!cleanRaagPunjabi) {
      cleanRaagPunjabi = (raag && !raag.includes('(#')) ? raag : 'ਤਿਲੰਗ ਮਃ ੧ ॥';
    }

    let cleanRaagEnglish = '';
    if (englishTranslation) {
      const firstEng = englishTranslation.split('\n')[0].trim();
      if (firstEng.includes(':') && firstEng.length < 50) {
        cleanRaagEnglish = firstEng.replace(':', '').toUpperCase();
      }
    }
    if (!cleanRaagEnglish) {
      cleanRaagEnglish = raag ? raag.replace(/\s*\([^)]*\)/g, '').split('/')[0].trim().toUpperCase() : 'RAAG TILANG';
    }

    // 4. Generate 2-page posters with full payload
    const dateLineEn = `${titleDate} – ${dateLineWithDay.split(',')[0]} – 05:00 AM. IST`;
    const cleanAng = ang ? anmolLipiToGurmukhi(String(ang)) : '';
    let punjabiDateStr = gurmukhiHeader ? anmolLipiToGurmukhi(gurmukhiHeader) : '';
    if (cleanAng && !punjabiDateStr.includes(cleanAng)) {
      punjabiDateStr = punjabiDateStr ? `${punjabiDateStr} (ਅੰਗ: ${cleanAng})` : `(ਅੰਗ: ${cleanAng})`;
    }
    const englishDateStr = ang ? `${dateLineWithDay.split(',')[0]}, ${titleDate} (Page: ${ang})` : `${dateLineWithDay.split(',')[0]}, ${titleDate}`;

    let sourceImagePath = existing?.source_image || null;
    try {
      sourceImagePath = await generatePosterImage({
        dateStr,
        dateStrEn: dateLineEn,
        punjabiDateStr,
        englishDateStr,
        raagPunjabi: cleanRaagPunjabi,
        raagEnglish: cleanRaagEnglish,
        mukhwak: gurmukhiOnly || gurmukhiHeader || '',
        viakhya: punjabiArth || '',
        english: englishTranslation || '',
      });
    } catch (err) {
      console.warn('Could not generate poster:', err.message);
    }

    // If record exists in DB, update it
    if (existing) {
      await query(
        `UPDATE hukamnamas 
         SET source_image = ?, gurmukhi_header = ?, gurmukhi_only = ?, punjabi_arth = ?, english_translation = ?, hindi_translation = ?, ang = COALESCE(?, ang), raag = COALESCE(?, raag)
         WHERE id = ?`,
        [
          sourceImagePath || existing.source_image,
          gurmukhiHeader || existing.gurmukhi_header,
          gurmukhiOnly || existing.gurmukhi_only,
          punjabiArth || existing.punjabi_arth,
          englishTranslation || existing.english_translation,
          hindiTranslation || existing.hindi_translation,
          ang || null,
          raag || null,
          existing.id,
        ]
      );
      const updated = await getHukamnamaByDate(dateStr);
      return { status: 'updated_image', hukamnama: updated };
    }

    const title = `Daily Hukamnama Sri Darbar Sahib – ${titleDate}`;

    // 5. Save to Database
    const insertSql = `
      INSERT INTO hukamnamas 
      (hukamnama_date, title, gurmukhi_header, shabad_title, ang, raag, author, content_html, gurmukhi_only, punjabi_arth, english_translation, hindi_translation, source_pdf, source_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(insertSql, [
      dateStr,
      title,
      gurmukhiHeader || null,
      shabadTitle || null,
      ang || null,
      raag || null,
      author || null,
      contentHtml || null,
      gurmukhiOnly || null,
      punjabiArth || null,
      englishTranslation || null,
      hindiTranslation || null,
      'https://hs.sgpc.net/hukamnamapdf.php',
      sourceImagePath || null,
    ]);

    const newHukamnama = await getHukamnamaByDate(dateStr);
    return { status: 'success', hukamnama: newHukamnama };
  } catch (err) {
    console.error('Extractor error:', err);
    return { status: 'error', message: err.message };
  }
}

/**
 * Force regenerate posters for a specific date (or today/latest) using database content
 */
export async function forceRegeneratePoster(targetDateStr = null) {
  let hukamnama = null;
  if (targetDateStr) {
    hukamnama = await getHukamnamaByDate(targetDateStr);
  }
  if (!hukamnama) {
    hukamnama = await getLatestHukamnama();
  }
  // If record is missing or content is incomplete, attempt re-extraction
  if (!hukamnama || !hukamnama.gurmukhi_only || !hukamnama.punjabi_arth) {
    try {
      const targetDate = targetDateStr ? new Date(targetDateStr) : (hukamnama?.hukamnama_date ? new Date(hukamnama.hukamnama_date) : new Date());
      await extractAndStoreHukamnama(targetDate, true);
      hukamnama = targetDateStr ? await getHukamnamaByDate(targetDateStr) : await getLatestHukamnama();
    } catch (e) {
      console.warn('Could not auto-extract missing hukamnama content:', e.message);
    }
  }

  if (!hukamnama) {
    throw new Error('No Hukamnama record found in database to regenerate poster');
  }

  const actualDateStr = hukamnama.hukamnama_date;
  const d = new Date(`${actualDateStr}T12:00:00+05:30`);
  const dateLineWithDay = d.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const titleDate = d.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const dayIndex = d.getDay();
  const expectedPunjabiDay = PUNJABI_WEEKDAYS[dayIndex];

  let rawHeader = hukamnama.gurmukhi_header
    ? anmolLipiToGurmukhi(hukamnama.gurmukhi_header.split('\n')[0].trim())
    : '';

  // If header is missing or has wrong weekday (e.g. Sunday on a Monday):
  if (!rawHeader || !rawHeader.startsWith(expectedPunjabiDay)) {
    try {
      const sikhnetRes = await axios.get('https://www.sikhnet.com/hukam', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 10000,
      });
      const $sikhnet = cheerio.load(sikhnetRes.data);
      const headerNode = $sikhnet('p.excerpt.gurmukhi-text').first();
      if (headerNode.length) {
        const scraped = anmolLipiToGurmukhi(headerNode.text().trim());
        if (scraped.startsWith(expectedPunjabiDay)) {
          rawHeader = scraped;
        }
      }
    } catch (e) {}

    if (!rawHeader || !rawHeader.startsWith(expectedPunjabiDay)) {
      rawHeader = calculateNanakshahiHeader(d, '');
    }

    try {
      await query(`UPDATE hukamnamas SET gurmukhi_header = ? WHERE id = ?`, [rawHeader, hukamnama.id]);
      hukamnama.gurmukhi_header = rawHeader;
    } catch (dbErr) {
      console.warn('Could not update corrected gurmukhi_header:', dbErr.message);
    }
  }

  const cleanAng = hukamnama.ang ? anmolLipiToGurmukhi(String(hukamnama.ang)) : '';
  let punjabiDateLine = rawHeader || dateLineWithDay;
  if (cleanAng && !punjabiDateLine.includes(cleanAng)) {
    punjabiDateLine = punjabiDateLine ? `${punjabiDateLine} (ਅੰਗ: ${cleanAng})` : `(ਅੰਗ: ${cleanAng})`;
  }

  const englishDateStr = hukamnama.ang
    ? `${dateLineWithDay.split(',')[0]}, ${titleDate} (Page: ${hukamnama.ang})`
    : `${dateLineWithDay.split(',')[0]}, ${titleDate}`;

  let cleanRaagPunjabi = '';
  if (hukamnama.gurmukhi_only) {
    const firstLine = hukamnama.gurmukhi_only.split('\n')[0].trim();
    if (firstLine.includes('॥') && firstLine.length < 60) {
      cleanRaagPunjabi = firstLine;
    }
  }
  if (!cleanRaagPunjabi) {
    cleanRaagPunjabi = (hukamnama.raag && !hukamnama.raag.includes('(#')) ? hukamnama.raag : 'ਤਿਲੰਗ ਮਃ ੧ ॥';
  }

  let cleanRaagEnglish = '';
  if (hukamnama.english_translation) {
    const firstEng = hukamnama.english_translation.split('\n')[0].trim();
    if (firstEng.includes(':') && firstEng.length < 50) {
      cleanRaagEnglish = firstEng.replace(':', '').toUpperCase();
    }
  }
  if (!cleanRaagEnglish) {
    cleanRaagEnglish = hukamnama.raag ? hukamnama.raag.replace(/\s*\([^)]*\)/g, '').split('/')[0].trim().toUpperCase() : 'RAAG TILANG';
  }

  const sourceImagePath = await generatePosterImage({
    dateStr: actualDateStr,
    dateStrEn: dateLineWithDay,
    punjabiDateStr: punjabiDateLine,
    englishDateStr: englishDateStr,
    raagPunjabi: cleanRaagPunjabi,
    raagEnglish: cleanRaagEnglish,
    mukhwak: hukamnama.gurmukhi_only || hukamnama.gurmukhi_header || '',
    viakhya: hukamnama.punjabi_arth || '',
    english: hukamnama.english_translation || '',
  });

  if (!sourceImagePath) {
    throw new Error('Poster generation script failed. Please check python environment.');
  }

  try {
    await query(`UPDATE hukamnamas SET source_image = ? WHERE id = ?`, [sourceImagePath, hukamnama.id]);
  } catch (dbErr) {
    console.warn('Could not update source_image in DB:', dbErr.message);
  }

  const posterPages = getPosterPagesForDate(actualDateStr, sourceImagePath);
  return {
    success: true,
    hukamnama_date: actualDateStr,
    source_image: sourceImagePath,
    pages: posterPages.map((p) => `${p}?t=${Date.now()}`),
    page1: posterPages[0] ? `${posterPages[0]}?t=${Date.now()}` : null,
    page2: posterPages[1] ? `${posterPages[1]}?t=${Date.now()}` : null,
  };
}

