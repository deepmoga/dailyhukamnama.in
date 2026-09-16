import { query } from './db.js';

let tablesInitialized = false;

const DEFAULT_SETTINGS = {
  smtp_host: 'smtp.gmail.com',
  smtp_port: '465',
  smtp_secure: '1',
  smtp_user: 'rana33994@gmail.com',
  smtp_pass: 'rdfv ukzs nbdo mvir',
  smtp_from_name: 'Daily Hukamnama Seva',
  smtp_from_email: 'rana33994@gmail.com',
  notification_receiver_email: 'rana33994@gmail.com',
  recaptcha_site_key: '',
  recaptcha_secret_key: '',
  recaptcha_enabled: '0',
  site_logo: '/logo.png',
  footer_logo: '/logo.png',
  favicon: '/logo.png',
  site_title: 'Daily Hukamnama',
  site_meta_title: "Today's Daily Hukamnama | Sachkhand Sri Harmandir Sahib Amritsar",
  site_meta_desc: "Read today's Daily Hukamnama (Mukhwak) from Sachkhand Sri Harmandir Sahib (Golden Temple), Amritsar with Gurmukhi text, Punjabi Viakhya, English and Hindi translations.",
  site_meta_keywords: "daily hukamnama, hukamnama today, golden temple hukamnama, sri darbar sahib mukhwak, nanakshahi calendar, sikhism",
};

export async function ensureTablesExist() {
  if (tablesInitialized) return;

  try {
    // 1. site_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. contact_submissions table
    await query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        ip_address VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. volunteer_applications table
    await query(`
      CREATE TABLE IF NOT EXISTS volunteer_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100),
        city VARCHAR(255),
        seva_area VARCHAR(255),
        message TEXT,
        ip_address VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Pre-populate missing default settings
    for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
      await query(
        `INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_key = setting_key`,
        [key, val]
      );
    }

    tablesInitialized = true;
  } catch (err) {
    console.error('Error ensuring settings tables exist:', err);
  }
}

/**
 * Get all settings (for admin)
 */
export async function getAllSettings() {
  await ensureTablesExist();
  try {
    const rows = await query('SELECT setting_key, setting_value FROM site_settings');
    const settings = { ...DEFAULT_SETTINGS };
    for (const r of rows) {
      settings[r.setting_key] = r.setting_value !== null ? r.setting_value : '';
    }
    return settings;
  } catch (err) {
    console.error('Error getting settings:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Get public settings (safe for client, no passwords or secret keys)
 */
export async function getPublicSettings() {
  await ensureTablesExist();
  const all = await getAllSettings();
  return {
    recaptcha_site_key: all.recaptcha_site_key || '',
    recaptcha_enabled: all.recaptcha_site_key && all.recaptcha_secret_key ? '1' : '0',
    site_logo: all.site_logo || '/logo.png',
    footer_logo: all.footer_logo || '/logo.png',
    favicon: all.favicon || '/logo.png',
    site_title: all.site_title || 'Daily Hukamnama',
    site_meta_title: all.site_meta_title || "Today's Daily Hukamnama | Sachkhand Sri Harmandir Sahib Amritsar",
    site_meta_desc: all.site_meta_desc || "Read today's Daily Hukamnama (Mukhwak) from Sachkhand Sri Harmandir Sahib (Golden Temple), Amritsar with Gurmukhi text, Punjabi Viakhya, English and Hindi translations.",
    site_meta_keywords: all.site_meta_keywords || "daily hukamnama, hukamnama today, golden temple hukamnama, sri darbar sahib mukhwak, nanakshahi calendar, sikhism",
    notification_receiver_email: all.notification_receiver_email || 'rana33994@gmail.com',
  };
}

/**
 * Update multiple settings
 */
export async function updateSettings(settingsObj) {
  await ensureTablesExist();
  const allowedKeys = Object.keys(DEFAULT_SETTINGS);

  for (const [key, value] of Object.entries(settingsObj)) {
    if (allowedKeys.includes(key)) {
      const valStr = value !== undefined && value !== null ? String(value) : '';
      await query(
        `INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, valStr, valStr]
      );
    }
  }

  return getAllSettings();
}

/**
 * Store contact form submission
 */
export async function storeContactSubmission({ name, email, subject, message, ip }) {
  await ensureTablesExist();
  const res = await query(
    `INSERT INTO contact_submissions (name, email, subject, message, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, subject || null, message, ip || null]
  );
  return res.insertId;
}

/**
 * Store volunteer application
 */
export async function storeVolunteerApplication({ name, email, phone, city, sevaArea, message, ip }) {
  await ensureTablesExist();
  const res = await query(
    `INSERT INTO volunteer_applications (name, email, phone, city, seva_area, message, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone || null, city || null, sevaArea || null, message || null, ip || null]
  );
  return res.insertId;
}
