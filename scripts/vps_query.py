import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

script = """
import('./lib/db.js').then(async m => {
  const s = await m.query('SELECT * FROM site_settings');
  console.log('SITE_SETTINGS:', JSON.stringify(s, null, 2));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
"""

sftp = ssh.open_sftp()
with sftp.file('/home/demo.dailyhukamnama.in/app/vps_query.mjs', 'w') as f:
    f.write(script)
sftp.close()

stdin, stdout, stderr = ssh.exec_command("cd /home/demo.dailyhukamnama.in/app && node --env-file=.env.local vps_query.mjs")
print(stdout.read().decode('utf-8', errors='ignore'))

stdin, stdout, stderr = ssh.exec_command("ls -la /home/demo.dailyhukamnama.in/app/public/uploads/2026/09/")
print("UPLOADS:\n", stdout.read().decode('utf-8', errors='ignore'))
ssh.close()
