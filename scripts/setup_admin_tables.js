const mysql = require('mysql2/promise');

async function setup() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dailyhukamnama.in'
  });

  console.log('Connected to MySQL');

  // 1. pages table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      content LONGTEXT,
      meta_title VARCHAR(255),
      meta_desc TEXT,
      meta_keywords VARCHAR(500),
      page_type VARCHAR(50) DEFAULT 'page',
      author VARCHAR(255) NULL,
      punjabi_title VARCHAR(255) NULL,
      audio_url VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Table pages ready');

  // Ensure audio_url column exists
  try {
    await conn.query(`ALTER TABLE pages ADD COLUMN audio_url VARCHAR(500) NULL AFTER punjabi_title;`);
  } catch (e) {
    // column already exists
  }

  // Ensure related_buttons column exists
  try {
    await conn.query(`ALTER TABLE pages ADD COLUMN related_buttons TEXT NULL AFTER audio_url;`);
  } catch (e) {
    // column already exists
  }


  // 2. volunteers table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image VARCHAR(500),
      description TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Table volunteers ready');

  // 3. admin_users table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) DEFAULT 'Administrator',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('Table admin_users ready');

  // Insert default admin if not exists (username: admin, password: admin123)
  const [existingAdmin] = await conn.query('SELECT * FROM admin_users WHERE username = ?', ['admin']);
  if (existingAdmin.length === 0) {
    await conn.query('INSERT INTO admin_users (username, password_hash, name) VALUES (?, ?, ?)', [
      'admin',
      'admin123',
      'Site Administrator'
    ]);
    console.log('Default admin created (admin / admin123)');
  }

  // Insert seed volunteers if table is empty
  const [existingVolunteers] = await conn.query('SELECT COUNT(*) as count FROM volunteers');
  if (existingVolunteers[0].count === 0) {
    const seedVolunteers = [
      {
        name: 'S. Harvinder Singh Wadhwa',
        image: '/assets/images/volunteer-1.jpg',
        description: 'Dailyhukamnama update seva.',
        sort_order: 1
      },
      {
        name: 'Qikads',
        image: '/assets/images/volunteer-2.png',
        description: 'Website development seva',
        sort_order: 2
      },
      {
        name: 'Team Oxio',
        image: '/assets/images/volunteer-3.png',
        description: 'Android app development SevaFull',
        sort_order: 3
      },
      {
        name: 'Yogesh Wankhede',
        image: '/assets/images/volunteer-4.jpg',
        description: 'Full Stack Developer',
        sort_order: 4
      }
    ];

    for (const v of seedVolunteers) {
      await conn.query('INSERT INTO volunteers (name, image, description, sort_order) VALUES (?, ?, ?, ?)', [
        v.name, v.image, v.description, v.sort_order
      ]);
    }
    console.log('Seed volunteers inserted');
  }

  // Insert seed pages if table is empty
  const [existingPages] = await conn.query('SELECT COUNT(*) as count FROM pages');
  if (existingPages[0].count === 0) {
    const seedPages = [
      {
        title: 'About Daily Hukamnama',
        slug: 'about-hukam',
        content: `<h2>About Daily Hukamnama (Mukhwak)</h2><p>Hukamnama (or Mukhwak) refers to the divine hymn taken randomly from Sri Guru Granth Sahib Ji each morning at Sachkhand Sri Harmandir Sahib (Golden Temple), Amritsar. It is revered as the royal decree and direct spiritual guidance of the Almighty for the day.</p><p>Every Sikh begins the day by tuning into Guru Sahib's divine instruction to direct their thoughts, conduct, and meditations.</p>`,
        meta_title: 'About Daily Hukamnama | Sri Harmandir Sahib Amritsar',
        meta_desc: 'Understand the profound spiritual meaning, maryada, and history of taking the Daily Hukamnama at Sachkhand Sri Harmandir Sahib Amritsar.',
        meta_keywords: 'about hukamnama, mukhwak, harmandir sahib, golden temple hukamnama, sikhism',
        page_type: 'page'
      },
      {
        title: 'Sachkhand Sri Harmandir Sahib',
        slug: 'sri-harimandir-sahib',
        content: `<h2>Sachkhand Sri Harmandir Sahib (Golden Temple)</h2><p>Sri Harmandir Sahib, also known as Darbar Sahib or the Golden Temple, is the holiest Gurdwara and the spiritual center of Sikhism, located in the sacred city of Amritsar, Punjab, India.</p><p>The shrine was designed by Sri Guru Arjan Dev Ji with four doors opening in all four directions, symbolizing that people from all castes, creeds, religions, and backgrounds are equally welcome in the house of God.</p>`,
        meta_title: 'Sachkhand Sri Harmandir Sahib Amritsar | History & Spiritual Significance',
        meta_desc: 'Explore the history, four doors of welcome, and divine sanctity of Sachkhand Sri Harmandir Sahib (Golden Temple) in Amritsar.',
        meta_keywords: 'harmandir sahib, golden temple, amritsar, darbar sahib, sikh history',
        page_type: 'page'
      },
      {
        title: 'Sri Guru Granth Sahib Ji',
        slug: 'sri-guru-granth-sahib',
        content: `<h2>Sri Guru Granth Sahib Ji - The Eternal Living Guru</h2><p>Sri Guru Granth Sahib Ji is the sovereign and eternal spiritual guide of the Sikhs. It is not merely a book, but the living Word (Shabad Guru) containing 1,430 Angs (pages) of sublime poetry set to classical Indian musical Raags.</p><p>First compiled by Sri Guru Arjan Dev Ji as Adi Granth in 1604, and conferred eternal Guruship by Sri Guru Gobind Singh Ji in 1708 at Hazur Sahib, Nanded.</p>`,
        meta_title: 'Sri Guru Granth Sahib Ji | The Eternal Living Guru of the Sikhs',
        meta_desc: 'Learn about the compilation, universal message, 1,430 Angs, and eternal Guruship of Sri Guru Granth Sahib Ji.',
        meta_keywords: 'guru granth sahib, shabad guru, adi granth, sikh scripture, gurbani',
        page_type: 'page'
      },
      {
        title: 'Ten Sikh Gurus',
        slug: 'sikh-gurus',
        content: `<h2>The Ten Sikh Gurus (1469 - 1708)</h2><p>Sikhism was founded and nurtured by ten divine spiritual teachers who lived between 1469 and 1708, each embodying the same divine light (Jyot) of Sri Guru Nanak Dev Ji.</p><p>From Guru Nanak Dev Ji's universal message of oneness and equality to Guru Gobind Singh Ji's creation of the Khalsa Panth, the Gurus taught humanity to live truthful, fearless, and compassionate lives.</p>`,
        meta_title: 'Ten Sikh Gurus | History, Lives, Teachings and Sacrifice',
        meta_desc: 'Discover the divine lives, contributions, and timeless message of the Ten Sikh Gurus from Guru Nanak Dev Ji to Guru Gobind Singh Ji.',
        meta_keywords: 'ten sikh gurus, guru nanak, guru gobind singh, khalsa, sikh history',
        page_type: 'page'
      },
      {
        title: 'Japji Sahib in Punjabi Gurmukhi',
        slug: 'japji-sahib-in-punjabi-gurmukhi',
        content: `<h2>ਜਪੁਜੀ ਸਾਹਿਬ (Japji Sahib)</h2><p><strong>ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥</strong></p><p>॥ ਜਪੁ ॥ ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥ ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥</p><p>ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ ॥ ਚੁਪੈ ਚੁਪ ਨ ਹੋਵਈ ਜੇ ਲਾਇ ਰਹਾ ਲਿਵ ਤਾਰ ॥ ਭੁਖਿਆ ਭੁਖ ਨ ਉਤਰੀ ਜੇ ਬੰਨਾ ਪੁਰੀਆ ਭਾਰ ॥ ਸਹਸ ਸਿਆਣਪਾ ਲਖ ਹੋਹਿ ਤ ਇਕ ਨ ਚਲੈ ਨਾਲਿ ॥ ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ ਕਿਵ ਕੂੜੈ ਤੁਟੈ ਪਾਲਿ ॥ ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥੧॥</p>`,
        meta_title: 'Japji Sahib in Punjabi Gurmukhi with Full Meaning & Path',
        meta_desc: 'Read full Japji Sahib in authentic Gurmukhi script with Punjabi translation and explanation. Daily Nitnem morning prayer by Guru Nanak Dev Ji.',
        meta_keywords: 'japji sahib gurmukhi, japji sahib punjabi, nitnem path, mool mantar, gurbani',
        page_type: 'path',
        author: 'Guru Nanak Dev Ji',
        punjabi_title: 'ਜਪੁਜੀ ਸਾਹਿਬ'
      }
    ];

    for (const p of seedPages) {
      await conn.query(`
        INSERT INTO pages (title, slug, content, meta_title, meta_desc, meta_keywords, page_type, author, punjabi_title)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.title, p.slug, p.content, p.meta_title, p.meta_desc, p.meta_keywords, p.page_type, p.author || null, p.punjabi_title || null
      ]);
    }
    console.log('Seed pages inserted');
  }

  // Ensure Japji Sahib has recitation audio
  await conn.query(
    "UPDATE pages SET audio_url = ? WHERE slug = 'japji-sahib-in-punjabi-gurmukhi' AND (audio_url IS NULL OR audio_url = '')",
    ['https://archive.org/download/JapjiSahibPathBhaiManpreetSinghJi/Japji%20Sahib.mp3']
  );

  await conn.end();
  console.log('Database setup complete!');
}

setup().catch(console.error);
