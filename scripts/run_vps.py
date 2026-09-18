import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=30)

deploy_commands = [
    # Backup user bg.jpg if custom
    "cp /home/demo.dailyhukamnama.in/app/public/assets/images/bg.jpg /tmp/user_bg.jpg || true",
    # Pull latest code
    "cd /home/demo.dailyhukamnama.in/app && git fetch origin main && git reset --hard origin/main",
    # Restore bg.jpg if existed
    "cp /tmp/user_bg.jpg /home/demo.dailyhukamnama.in/app/public/assets/images/bg.jpg || true",
    # Run DB migration to ensure SEO columns exist
    "cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local scripts/setup_admin_tables.js",
    # Backfill SEO for any null rows
    """cd /home/demo.dailyhukamnama.in/app && node -e "const { query } = require('./lib/db.js'); async function run() { const rows = await query('SELECT id, hukamnama_date, title, ang, raag, author FROM hukamnamas WHERE meta_desc IS NULL OR image_alt IS NULL OR meta_keywords IS NULL'); for (const r of rows) { const cleanDate = String(r.hukamnama_date).split('T')[0]; const d = new Date(cleanDate + 'T12:00:00+05:30'); const titleDate = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); const cleanAng = r.ang ? String(r.ang).trim() : ''; const cleanRaag = r.raag ? r.raag.replace(/\\\\s*\\\\([^)]*\\\\)/g, '').split('/')[0].trim() : ''; const imageAlt = 'Daily Hukamnama Sri Darbar Sahib Amritsar - ' + titleDate + (cleanAng ? ' - Ang ' + cleanAng : '') + (cleanRaag ? ' ' + cleanRaag : ''); const metaDesc = 'Daily Hukamnama Sri Darbar Sahib Amritsar today (' + titleDate + ').' + (cleanAng ? ' Ang ' + cleanAng + ',' : '') + (cleanRaag ? ' ' + cleanRaag + '.' : '') + ' Gurmukhi Mukhwak, Punjabi Viakhya, Hindi & English translation.'; let metaKeywords = 'Daily Hukamnama, Golden Temple' + (cleanAng ? ', Ang ' + cleanAng : '') + (cleanRaag ? ', ' + cleanRaag : ''); if (metaKeywords.length > 60) metaKeywords = metaKeywords.slice(0, 60).replace(/,[^,]*$/, ''); await query('UPDATE hukamnamas SET meta_desc = ?, meta_keywords = ?, image_alt = ? WHERE id = ?', [metaDesc, metaKeywords, imageAlt, r.id]); } console.log('VPS SEO backfill updated rows:', rows.length); process.exit(0); } run();\"""",
    # Build
    "cd /home/demo.dailyhukamnama.in/app && npm run build",
    # Restart PM2
    "pm2 restart demo.dailyhukamnama.in",
    # Wait for service
    "sleep 5",
    # Verify homepage
    "curl -s -o /dev/null -w 'Homepage HTTP status: %{http_code}\n' http://127.0.0.1:3015/",
    # Verify today's hukamnama page
    "curl -s -o /dev/null -w 'Daily Hukamnama HTTP status: %{http_code}\n' http://127.0.0.1:3015/daily-hukamnama/2026-09-17",
    # Verify path hub page
    "curl -s -o /dev/null -w 'Path Hub HTTP status: %{http_code}\n' http://127.0.0.1:3015/path",
    # Verify sikh gurus hub page
    "curl -s -o /dev/null -w 'Sikh Gurus Hub HTTP status: %{http_code}\n' http://127.0.0.1:3015/sikh-gurus",
    # Verify contact us page
    "curl -s -o /dev/null -w 'Contact Us page HTTP status: %{http_code}\n' http://127.0.0.1:3015/contact-us",
]

for cmd in deploy_commands:
    print(f"\n==> {cmd[:80]}...")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=300)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore').strip()
    err = stderr.read().decode('utf-8', errors='ignore').strip()
    if out:
        print(out[:500])
    if err and exit_code != 0:
        print("ERR:", err[:400])
    print(f"Exit: {exit_code}")

ssh.close()
