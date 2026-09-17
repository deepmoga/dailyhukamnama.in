import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

script = """
import('./lib/db.js').then(async m => {
  const r = await m.query("SELECT id, title, slug, punjabi_title, page_type, show_in_menu, sort_order FROM pages WHERE page_type='path' ORDER BY sort_order ASC, id ASC");
  console.log('PATHS_COUNT:', r.length);
  console.log('PATHS_IN_DB:', JSON.stringify(r, null, 2));
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
ssh.close()
