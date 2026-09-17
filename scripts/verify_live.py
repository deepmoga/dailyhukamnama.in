import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

cmds = [
    "curl -s -o /dev/null -w 'Homepage HTTP: %{http_code}\n' http://127.0.0.1:3015/",
    "curl -s -o /dev/null -w 'Favicon API HTTP: %{http_code}\n' http://127.0.0.1:3015/api/public/favicon",
    "curl -s -o /dev/null -w 'Favicon.ico HTTP: %{http_code}\n' http://127.0.0.1:3015/favicon.ico",
    "curl -s 'http://127.0.0.1:3015/api/hukamnama' | python3 -c 'import sys, json; d = json.load(sys.stdin); print(\"Recent count:\", len(d.get(\"data\", {}).get(\"last5\", [])))'",
    "curl -s 'http://127.0.0.1:3015/api/admin/hukamnamas?page=1&limit=5' | python3 -c 'import sys, json; d = json.load(sys.stdin); print(\"Admin hukamnamas total:\", d.get(\"total\"), \"returned:\", len(d.get(\"hukamnamas\", [])))'",
]

for cmd in cmds:
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='ignore').strip())

ssh.close()
