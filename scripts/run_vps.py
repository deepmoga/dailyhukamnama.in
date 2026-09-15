import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=30)

# Check PYTHON_BIN env, .env.local, and test the generate_poster.py directly
cmds = [
    "cat /home/demo.dailyhukamnama.in/app/.env.local | grep -i python || echo 'No PYTHON_BIN in .env.local'",
    "which python3",
    "which python",
    "pm2 env 13 | grep -i python || echo 'No PYTHON in pm2 env'",
    "cat /home/demo.dailyhukamnama.in/app/public/uploads/2026/09/hukamnama-2026-09-15-1.jpg | wc -c",
]

for cmd in cmds:
    print(f"\n==> {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='ignore'))
    err = stderr.read().decode('utf-8', errors='ignore')
    if err.strip():
        print("ERR:", err[:300])

# Now upload the SFTP-based test to check the actual poster generation path
print("\n==> Testing generate_poster.py directly on VPS...")
test_payload = '{"date_str": "September 15, 2026", "punjabi_date_str": "test", "english_date_str": "Monday Sep 15", "raag_punjabi": "test", "raag_english": "TEST", "mukhwak": "Test", "viakhya": "Test", "english": "Test", "output_p1": "/home/demo.dailyhukamnama.in/app/public/uploads/2026/09/test_gen_p1.jpg", "output_p2": "/home/demo.dailyhukamnama.in/app/public/uploads/2026/09/test_gen_p2.jpg"}'

import base64
encoded = base64.b64encode(test_payload.encode()).decode()
cmd = f'python3 /home/demo.dailyhukamnama.in/app/scripts/generate_poster.py --json "{encoded}" 2>&1'
stdin, stdout, stderr = ssh.exec_command(cmd, timeout=60)
print(stdout.read().decode('utf-8', errors='ignore')[:2000])
err = stderr.read().decode('utf-8', errors='ignore')
if err.strip():
    print("ERR:", err[:1000])

ssh.close()
