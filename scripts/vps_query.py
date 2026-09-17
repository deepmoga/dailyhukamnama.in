import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=15)

script = """
import('./lib/db.js').then(async m => {
  const r = await m.query("SELECT id, title, slug, content FROM pages WHERE page_type = 'sikh_guru'");
  for (const g of r) {
    let clean = (g.content || '')
      .replace(/<h3>\s*Life History &amp; Divine Mission\s*<\/h3>/gi, '')
      .replace(/<h3>\s*Life History & Divine Mission\s*<\/h3>/gi, '')
      .replace(/<h3>\s*Major Sacred Banis.*$/gis, '');

    await m.query("UPDATE pages SET content = ? WHERE id = ?", [clean.trim(), g.id]);
    console.log('Cleaned page ID:', g.id, g.title);
  }
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
