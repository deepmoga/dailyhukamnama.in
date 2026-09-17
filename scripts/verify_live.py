import paramiko
import sys
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

# 1. Check admin API for Hukamnama SEO fields
stdin, stdout, stderr = ssh.exec_command("curl -s http://127.0.0.1:3015/api/admin/hukamnamas/4")
import json
try:
    h = json.loads(stdout.read().decode('utf-8', errors='ignore')).get('hukamnama', {})
    print("Admin API Hukamnama #4 SEO:")
    print(" - Title:", h.get('title'))
    print(" - Image Alt:", h.get('image_alt'))
    print(" - Meta Keywords:", h.get('meta_keywords'))
    print(" - Meta Desc:", h.get('meta_desc'))
except Exception as e:
    print("Err parsing admin API:", e)

# 2. Check HTML for meta tags and image alt tag on daily hukamnama page
stdin, stdout, stderr = ssh.exec_command("curl -s http://127.0.0.1:3015/daily-hukamnama/2026-09-17")
html = stdout.read().decode('utf-8', errors='ignore')

print("\nLive Page Checks:")
print(" - Has description meta:", 'name="description"' in html)
print(" - Has keywords meta:", 'name="keywords"' in html)
print(" - Has og:image:alt:", 'og:image:alt' in html)
print(" - Has Share button:", 'Share' in html)
print(" - Has WhatsApp share:", 'whatsapp' in html.lower())
print(" - Has Facebook share:", 'facebook' in html.lower())
print(" - Has Instagram share:", 'instagram' in html.lower())
print(" - Has TikTok share:", 'tiktok' in html.lower())
print(" - Has Threads share:", 'threads' in html.lower())

ssh.close()

