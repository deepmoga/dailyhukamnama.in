import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=20)

cmd = """cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local -e '
const mysql = require("mysql2/promise");
async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const [rows] = await conn.query("SELECT id, title, slug FROM pages WHERE slug = ?", ["contact-us"]);
  if (rows.length === 0) {
    const [res] = await conn.query(
      "INSERT INTO pages (title, slug, content, meta_title, meta_desc, meta_keywords, page_type, show_in_menu, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        "Contact Us",
        "contact-us",
        "<h2>Get in Touch with Daily Hukamnama Seva</h2><p>We welcome your feedback, inquiries, and suggestions regarding our Daily Hukamnama updates, Nitnem paths, mobile applications, and Gurbani resources.</p><p>If you have any questions or would like to contribute towards our digital seva, please feel free to reach out to our seva team.</p><p><strong>Email:</strong> info@dailyhukamnama.in<br/><strong>Official Seva:</strong> Sachkhand Sri Harmandir Sahib (Golden Temple), Amritsar</p>",
        "Contact Us | Daily Hukamnama Seva",
        "Get in touch with the Daily Hukamnama Seva team. We welcome your feedback, suggestions, and inquiries.",
        "contact us, daily hukamnama contact, golden temple hukamnama seva, amritsar",
        "page",
        1,
        99
      ]
    );
    console.log("INSERTED contact-us with ID:", res.insertId);
  } else {
    console.log("contact-us already exists with ID:", rows[0].id);
  }
  const [std] = await conn.query("SELECT id, title, slug, page_type FROM pages WHERE page_type = ?", ["page"]);
  console.log("Standard pages on VPS:", JSON.stringify(std, null, 2));
  await conn.end();
}
run();
'"""

stdin, stdout, stderr = ssh.exec_command(cmd)
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
print("STDOUT:\n", out)
if err.strip():
    print("STDERR:\n", err)

ssh.close()
