import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

cmd = 'curl -s -X PUT http://localhost:3015/api/admin/template-bg -H "Content-Type: application/json" -d "{}"'
stdin, stdout, stderr = ssh.exec_command(cmd)
print('PUT Result:', stdout.read().decode('utf-8', errors='replace'))
print('PUT Err:', stderr.read().decode('utf-8', errors='replace'))

cmd2 = "curl -s -X POST 'http://localhost:3015/api/hukamnama?force=true'"
stdin, stdout, stderr = ssh.exec_command(cmd2)
print('POST Result:', stdout.read().decode('utf-8', errors='replace'))

ssh.close()
