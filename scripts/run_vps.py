import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=30)

deploy_commands = [
    # Preserve background image
    "cp /home/demo.dailyhukamnama.in/app/public/assets/images/bg.jpg /tmp/user_bg.jpg || true",
    # Pull latest code
    "cd /home/demo.dailyhukamnama.in/app && git fetch origin main && git reset --hard origin/main",
    # Restore background image
    "cp /tmp/user_bg.jpg /home/demo.dailyhukamnama.in/app/public/assets/images/bg.jpg || true",
    # Add PYTHON_BIN to .env.local if not set
    "grep -q 'PYTHON_BIN' /home/demo.dailyhukamnama.in/app/.env.local || echo 'PYTHON_BIN=python3' >> /home/demo.dailyhukamnama.in/app/.env.local",
    # Install dependencies
    "cd /home/demo.dailyhukamnama.in/app && npm install --production=false",
    # Build
    "cd /home/demo.dailyhukamnama.in/app && npm run build",
    # Set timezone to IST
    "timedatectl set-timezone Asia/Kolkata || true",
    # Restart PM2
    "pm2 restart demo.dailyhukamnama.in",
    # Wait for restart
    "sleep 5",
    # Update crontab to use IST timezone - run at 05:30, 06:00, 06:30, 08:00 IST
    "(crontab -l 2>/dev/null | grep -v 'sync_cron.sh'; echo 'CRON_TZ=Asia/Kolkata'; echo '30 5 * * * /bin/bash /home/demo.dailyhukamnama.in/app/scripts/sync_cron.sh >> /var/log/hukamnama_cron.log 2>&1'; echo '0 6 * * * /bin/bash /home/demo.dailyhukamnama.in/app/scripts/sync_cron.sh >> /var/log/hukamnama_cron.log 2>&1'; echo '30 6 * * * /bin/bash /home/demo.dailyhukamnama.in/app/scripts/sync_cron.sh >> /var/log/hukamnama_cron.log 2>&1'; echo '0 8 * * * /bin/bash /home/demo.dailyhukamnama.in/app/scripts/sync_cron.sh >> /var/log/hukamnama_cron.log 2>&1') | crontab -",
    "crontab -l | grep sync_cron",
    # Force regenerate today's poster  
    "curl -s -X POST 'http://127.0.0.1:3015/api/hukamnama?force=true' | python3 -c \"import sys,json; d=json.load(sys.stdin); print('Status:', d.get('result',{}).get('status','?')); print('Header:', d.get('result',{}).get('hukamnama',{}).get('gurmukhi_header','?')[:60])\"",
    # Verify images now served
    "curl -s -o /dev/null -w 'HTTP status: %{http_code}' http://127.0.0.1:3015/uploads/2026/09/hukamnama-2026-09-15-1.jpg",
    "date",
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
