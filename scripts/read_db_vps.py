import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

cmds = [
    "crontab -l || true",
    "tail -n 25 /var/log/hukamnama_cron.log || true",
    "cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local -e \"import('./lib/hukamnama-service.js').then(async m => { console.log('Formatted today in IST:', m.formatDate(new Date())); process.exit(0); })\"",
    "curl -s https://www.sikhnet.com/hukam | grep -i -C 3 'hukam' | head -n 30 || true"
]

for cmd in cmds:
    print(f"\n==================== {cmd} ====================")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print("STDOUT:", out.strip())
    if err.strip():
        print("STDERR:", err.strip())

ssh.close()
