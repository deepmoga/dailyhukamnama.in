import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

cmds = [
    "cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local -e \"import('./lib/hukamnama-service.js').then(m => m.forceRegeneratePoster()).then(r => console.log('RegenResult:', r)).catch(e => console.error('RegenErr:', e));\""
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
