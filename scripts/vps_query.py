import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

# 1. Run migration and backfill on VPS with .env.local
seo_backfill = """
import { query } from './lib/db.js';

async function run() {
  try {
    await query('ALTER TABLE hukamnamas ADD COLUMN meta_desc TEXT NULL AFTER source_image');
  } catch (e) {}
  try {
    await query('ALTER TABLE hukamnamas ADD COLUMN meta_keywords VARCHAR(500) NULL AFTER meta_desc');
  } catch (e) {}
  try {
    await query('ALTER TABLE hukamnamas ADD COLUMN image_alt VARCHAR(255) NULL AFTER meta_keywords');
  } catch (e) {}

  const rows = await query(`
    SELECT id, DATE_FORMAT(hukamnama_date, '%Y-%m-%d') as clean_date, title, ang, raag, author 
    FROM hukamnamas 
    WHERE meta_desc IS NULL OR image_alt IS NULL OR meta_keywords IS NULL 
       OR image_alt LIKE '%Invalid Date%' OR meta_desc LIKE '%Invalid Date%'
  `);
  console.log('VPS rows needing SEO update:', rows.length);
  for (const r of rows) {
    const cleanDate = r.clean_date;
    const [y, m, day] = cleanDate.split('-').map(Number);
    const d = new Date(y, m - 1, day, 12, 0, 0);
    const titleDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const cleanAng = r.ang ? String(r.ang).trim() : '';
    const cleanRaag = r.raag ? r.raag.replace(/\\s*\\([^)]*\\)/g, '').split('/')[0].trim() : '';
    
    const imageAlt = 'Daily Hukamnama Sri Darbar Sahib Amritsar - ' + titleDate + (cleanAng ? ' - Ang ' + cleanAng : '') + (cleanRaag ? ' ' + cleanRaag : '');
    const metaDesc = 'Daily Hukamnama Sri Darbar Sahib Amritsar today (' + titleDate + ').' + (cleanAng ? ' Ang ' + cleanAng + ',' : '') + (cleanRaag ? ' ' + cleanRaag + '.' : '') + ' Gurmukhi Mukhwak, Punjabi Viakhya, Hindi & English translation.';
    let metaKeywords = 'Daily Hukamnama, Golden Temple' + (cleanAng ? ', Ang ' + cleanAng : '') + (cleanRaag ? ', ' + cleanRaag : '');
    if (metaKeywords.length > 60) {
      metaKeywords = metaKeywords.slice(0, 60).replace(/,[^,]*$/, '');
    }
    
    await query('UPDATE hukamnamas SET meta_desc = ?, meta_keywords = ?, image_alt = ? WHERE id = ?', [metaDesc, metaKeywords, imageAlt, r.id]);
  }
  console.log('VPS SEO backfill complete!');
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
"""

sftp = ssh.open_sftp()
with sftp.file('/home/demo.dailyhukamnama.in/app/vps_query.mjs', 'w') as f:
    f.write(seo_backfill)
sftp.close()

stdin, stdout, stderr = ssh.exec_command("cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local vps_query.mjs")
print("Backfill Output:", stdout.read().decode('utf-8', errors='ignore'))
print("Backfill Err:", stderr.read().decode('utf-8', errors='ignore'))

# Check PM2 process
stdin, stdout, stderr = ssh.exec_command("pm2 jlist")
import json
try:
    proc_list = json.loads(stdout.read().decode('utf-8', errors='ignore'))
    for p in proc_list:
        if 'demo' in p.get('name', ''):
            print(f"PM2 Process: {p.get('name')} | Status: {p.get('pm2_env', {}).get('status')} | Restarts: {p.get('pm2_env', {}).get('restart_time')}")
except Exception as ex:
    print("PM2 parse error:", ex)

# Check PM2 logs
stdin, stdout, stderr = ssh.exec_command("pm2 logs demo.dailyhukamnama.in --lines 30 --nostream")
print("Recent PM2 logs:\n", stdout.read().decode('utf-8', errors='ignore'))

# Check live curl
stdin, stdout, stderr = ssh.exec_command("curl -s -i http://127.0.0.1:3015/ | head -n 15")
print("Curl output:\n", stdout.read().decode('utf-8', errors='ignore'))

ssh.close()

