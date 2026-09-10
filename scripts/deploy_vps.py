import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

commands = [
    "cp /home/demo.dailyhukamnama.in/app/public/assets/images/bg.jpg /tmp/user_bg.jpg || true",
    "cd /home/demo.dailyhukamnama.in/app && git checkout -- assets/images/bg.jpg public/assets/images/bg.jpg public/uploads/ scripts/sync_cron.sh || git stash",
    "cd /home/demo.dailyhukamnama.in/app && git pull origin main",
    "cp /tmp/user_bg.jpg /home/demo.dailyhukamnama.in/app/public/assets/images/bg.jpg && cp /tmp/user_bg.jpg /home/demo.dailyhukamnama.in/app/assets/images/bg.jpg || true",
    "pip3 install --break-system-packages uharfbuzz freetype-py Pillow",
    "cd /home/demo.dailyhukamnama.in/app && npm install",
    "cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local -e \"import('./lib/settings-service.js').then(m => m.ensureTablesExist()).then(() => { console.log('VPS DB Settings Tables Initialized!'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); })\"",
    "cd /home/demo.dailyhukamnama.in/app && npm run build",
    "pm2 restart demo.dailyhukamnama.in",
    "python3 -c \"import uharfbuzz, freetype, PIL; print('Python libraries ready!')\"",
    "cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local -e \"import('./lib/hukamnama-service.js').then(m => m.forceRegeneratePoster()).then(r => { console.log('Regenerated:', r); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });\""
]

for cmd in commands:
    print(f"==> Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    exit_status = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out.strip():
        print(out)
    if err.strip():
        print("ERR:", err)
    print(f"Exit code: {exit_status}\n")

ssh.close()
