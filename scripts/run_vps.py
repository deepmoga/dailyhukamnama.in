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
    # Build
    "cd /home/demo.dailyhukamnama.in/app && npm run build",
    # Restart PM2
    "pm2 restart demo.dailyhukamnama.in",
    # Wait for service
    "sleep 5",
    # Verify favicon routes
    "curl -s -o /dev/null -w 'Favicon API HTTP status: %{http_code}\n' http://127.0.0.1:3015/api/public/favicon",
    "curl -s -o /dev/null -w 'Favicon.ico HTTP status: %{http_code}\n' http://127.0.0.1:3015/favicon.ico",
    # Verify homepage
    "curl -s -o /dev/null -w 'Homepage HTTP status: %{http_code}\n' http://127.0.0.1:3015/",
    # Verify admin hukamnamas API
    "curl -s 'http://127.0.0.1:3015/api/admin/hukamnamas?page=1&limit=5' | head -c 200",
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
