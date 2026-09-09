import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

commands = [
    "cd /home/demo.dailyhukamnama.in/app && git pull origin main",
    "pip3 install --break-system-packages uharfbuzz freetype-py Pillow",
    "cd /home/demo.dailyhukamnama.in/app && npm run build",
    "pm2 restart demo.dailyhukamnama.in",
    "python3 -c \"import uharfbuzz, freetype, PIL; print('Python libraries ready!')\"",
    "cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local -e \"import('./lib/hukamnama-service.js').then(m => m.forceRegeneratePoster()).then(r => console.log('Regenerated:', r)).catch(e => console.error(e));\""
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
