import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

mukhwak = """ਇਆਨੜੀਏ ਮਾਨੜਾ ਕਾਇ ਕਰੇਹਿ ॥ ਆਪਨੜੈ ਘਰਿ ਹਰਿ ਰੰਗੋ ਕੀ ਨ ਮਾਣੇਹਿ ॥ ਸਹੁ ਨੇੜੈ ਧਨ ਕੰਮਲੀਏ ਬਾਹਰੁ ਕਿਆ ਢੂਢੇਹਿ ॥ ਭੈ ਕੀਆ ਦੇਹਿ ਸਲਾਈਆ ਨੈਣੀ ਭਾਵ ਕਾ ਕਰਿ ਸੀਗਾਰੋ ॥ ਤਾ ਸੋਹਾਗਣਿ ਜਾਣੀਐ ਲਾਗੀ ਜਾ ਸਹੁ ਧਰੇ ਪਿਆਰੋ ॥੧॥ ਇਆਣੀ ਬਾਲੀ ਕਿਆ ਕਰੇ ਜਾ ਧਨ ਕੰਤ ਨ ਭਾਵੈ ॥ ਕਰਣ ਪਲਾਹ ਕਰੇ ਬਹੁਤੇਰੇ ਸਾ ਧਨ ਮਹਲੁ ਨ ਪਾਵੈ ॥ ਵਿਣੁ ਕਰਮਾ ਕਿਛੁ ਪਾਈਐ ਨਾਹੀ ਜੇ ਬਹੁਤੇਰਾ ਧਾਵੈ ॥ ਲਬ ਲੋਭ ਅਹੰਕਾਰ ਕੀ ਮਾਤੀ ਮਾਇਆ ਮਾਹਿ ਸਮਾਣੀ ॥ ਇਨੀ ਬਾਤੀ ਸਹੁ ਪਾਈਐ ਨਾਹੀ ਭਈ ਕਾਮਣਿ ਇਆਣੀ ॥੨॥ ਜਾਇ ਪੁਛਹੁ ਸੋਹਾਗਣੀ ਵਾਹੈ ਕਿਨੀ ਬਾਤੀ ਸਹੁ ਪਾਈਐ ॥ ਜੋ ਕਿਛੁ ਕਰੇ ਸੁ ਭਲਾ ਕਰਿ ਮਾਨੀਐ ਹਿਕਮਤਿ ਹੁਕਮੁ ਚੁਕਾਈਐ ॥ ਜਾ ਕੈ ਪ੍ਰੇਮਿ ਪਦਾਰਥੁ ਪਾਈਐ ਤਉ ਚਰਣੀ ਚਿਤੁ ਲਾਈਐ ॥ ਸਹੁ ਕਹੈ ਸੁ ਕੀਜੈ ਤਨੁ ਮਨੋ ਦੀਜੈ ਐਸਾ ਪਰਮਲੁ ਲਾਈਐ ॥ ਏਵ ਕਹਹਿ ਸੋਹਾਗਣੀ ਭੈਣੇ ਇਨੀ ਬਾਤੀ ਸਹੁ ਪਾਈਐ ॥੩॥ ਆਪੁ ਗਵਾਈਐ ਤਾ ਸਹੁ ਪਾਈਐ ਅਉਰੁ ਕੈਸੀ ਚਤੁਰਾਈ ॥ ਸਹੁ ਨਦਰਿ ਕਰਿ ਦੇਖੈ ਸੋ ਦਿਨੁ ਲੇਖੈ ਕਾਮਣਿ ਨਉ ਨਿਧਿ ਪਾਈ ॥ ਆਪਣੇ ਕੰਤ ਪਿਆਰੀ ਸਾ ਸੋਹਾਗਣਿ ਨਾਨਕ ਸਾ ਸਭਰਾਈ ॥ ਐਸੇ ਰੰਗਿ ਰਾਤੀ ਸਹਜ ਕੀ ਮਾਤੀ ਅਹਿਨਿਸਿ ਭਾਇ ਸਮਾਣੀ ॥ ਸੁੰਦਰਿ ਸਾਇ ਸਰੂਪ ਬਿਚਖਣਿ ਕਹੀਐ ਸਾ ਸਿਆਣੀ ॥੪॥੨॥੪॥"""

viakhya = """ਹੇ ਬਹੁਤ ਅੰਞਾਣ ਜਿੰਦੇ! ਇਤਨਾ ਕੇਹਾ ਮਾਣ ਤੂੰ ਕਿਉਂ ਕਰਦੀ ਹੈਂ? ਪਰਮਾਤਮਾ ਤੇਰੇ ਆਪਣੇ ਹੀ ਹਿਰਦੇ-ਘਰ ਵਿਚ ਹੈ, ਤੂੰ ਉਸ (ਦੇ ਮਿਲਾਪ) ਦਾ ਆਨੰਦ ਕਿਉਂ ਨਹੀਂ ਮਾਣਦੀ? ਹੇ ਭੋਲੀ ਜੀਵ-ਇਸਤ੍ਰੀਏ! ਪਤੀ-ਪ੍ਰਭੂ (ਤੇਰੇ ਅੰਦਰ ਹੀ ਤੇਰੇ) ਨੇੜੇ ਵੱਸ ਰਿਹਾ ਹੈ, ਤੂੰ (ਜੰਗਲ ਆਦਿਕ) ਬਾਹਰਲਾ ਸੰਸਾਰ ਕਿਉਂ ਭਾਲਦੀ ਫਿਰਦੀ ਹੈਂ? (ਜੇ ਤੂੰ ਉਸ ਦਾ ਦੀਦਾਰ ਕਰਨਾ ਹੈ, ਤਾਂ ਆਪਣੀਆਂ ਗਿਆਨ ਦੀਆਂ) ਅੱਖਾਂ ਵਿਚ (ਪ੍ਰਭੂ ਦੇ) ਡਰ-ਅਦਬ (ਦੇ ਸੁਰਮੇ) ਦੀਆਂ ਸਲਾਈਆਂ ਪਾ, ਪ੍ਰਭੂ ਦੇ ਪਿਆਰ ਦਾ ਹਾਰ-ਸਿੰਗਾਰ ਕਰ। ਜੀਵ-ਇਸਤ੍ਰੀ ਤਦੋਂ ਹੀ ਸੋਹਾਗ ਭਾਗ ਵਾਲੀ ਤੇ ਪ੍ਰਭੂ-ਚਰਨਾਂ ਵਿਚ ਜੁੜੀ ਹੋਈ ਸਮਝੀ ਜਾਂਦੀ ਹੈ, ਜਦੋਂ ਪ੍ਰਭੂ-ਪਤੀ ਉਸ ਨਾਲ ਪਿਆਰ ਕਰੇ ।੧।(ਪਰ) ਅੰਞਾਣ ਜੀਵ-ਇਸਤ੍ਰੀ ਭੀ ਕੀਹ ਕਰ ਸਕਦੀ ਹੈ ਜੇ ਉਹ ਜੀਵ-ਇਸਤ੍ਰੀ ਖਸਮ-ਪ੍ਰਭੂ ਨੂੰ ਚੰਗੀ ਹੀ ਨਾਹ ਲੱਗੇ? ਅਜੇਹੀ ਜੀਵ-ਇਸਤ੍ਰੀ ਭਾਵੇਂ ਕਿਤਨੇ ਹੀ ਤਰਲੇ ਪਈ ਕਰੇ, ਉਹ ਪਤੀ ਪ੍ਰਭੂ ਦਾ ਮਹਲ-ਘਰ ਲੱਭ ਹੀ ਨਹੀਂ ਸਕਦੀ। (ਅਸਲ ਗੱਲ ਇਹ ਹੈ ਕਿ) ਜੀਵ-ਇਸਤ੍ਰੀ ਭਾਵੇਂ ਕਿਤਨੀ ਹੀ ਦੌੜ-ਭੱਜ ਕਰੇ, ਪ੍ਰਭੂ ਦੀ ਮੇਹਰ ਦੀ ਨਜ਼ਰ ਤੋਂ ਬਿਨਾ ਕੁਝ ਭੀ ਹਾਸਲ ਨਹੀਂ ਹੁੰਦਾ। ਜੇ ਜੀਵ-ਇਸਤ੍ਰੀ ਜੀਭ ਦੇ ਚਸਕੇ ਲਾਲਚ ਤੇ ਅਹੰਕਾਰ (ਆਦਿਕ) ਵਿਚ ਹੀ ਮਸਤ ਰਹੇ, ਅਤੇ ਸਦਾ ਮਾਇਆ (ਦੇ ਮੋਹ) ਵਿਚ ਡੁੱਬੀ ਰਹੇ, ਤਾਂ ਇਹਨੀਂ ਗੱਲੀਂ ਖਸਮ ਪ੍ਰਭੂ ਨਹੀਂ ਮਿਲਦਾ। ਉਹ ਜੀਵ-ਇਸਤ੍ਰੀ ਅੰਞਾਣ ਹੀ ਰਹੀ (ਜੋ ਵਿਕਾਰਾਂ ਵਿਚ ਭੀ ਮਸਤ ਰਹੇ ਤੇ ਫਿਰ ਭੀ ਸਮਝੇ ਕਿ ਉਹ ਪਤੀ ਪ੍ਰਭੂ ਨੂੰ ਪ੍ਰਸੰਨ ਕਰ ਸਕਦੀ ਹੈ) ।੨।(ਜਿਨ੍ਹਾਂ ਨੂੰ ਪਤੀ-ਪ੍ਰਭੂ ਮਿਲ ਪਿਆ ਹੈ, ਬੇਸ਼ਕ) ਉਹਨਾਂ ਸੁਹਾਗ ਭਾਗ ਵਾਲੀਆਂ ਨੂੰ ਜਾ ਕੇ ਪੁੱਛ ਵੇਖੋ ਕਿ ਕਿਹਨੀਂ ਗੱਲੀਂ ਖਸਮ ਪ੍ਰਭੂ ਮਿਲਦਾ ਹੈ, (ਉਹ ਇਹੀ ਉੱਤਰ ਦੇਂਦੀਆਂ ਹਨ ਕਿ) ਚਲਾਕੀ ਤੇ ਧੱਕਾ ਛੱਡ ਦਿਉ, ਜੋ ਕੁਝ ਪ੍ਰਭੂ ਕਰਦਾ ਹੈ ਉਸ ਨੂੰ ਚੰਗਾ ਸਮਝ ਕੇ (ਸਿਰ ਮੱਥੇ ਤੇ) ਮੰਨੋ, ਜਿਸ ਪ੍ਰਭੂ ਦੇ ਪ੍ਰੇਮ ਦਾ ਸਦਕਾ ਨਾਮ-ਵਸਤ ਮਿਲਦੀ ਹੈ ਉਸ ਦੇ ਚਰਨਾਂ ਵਿਚ ਮਨ ਜੋੜੋ, ਖਸਮ-ਪ੍ਰਭੂ ਜੋ ਹੁਕਮ ਕਰਦਾ ਹੈ ਉਹ ਕਰੋ, ਆਪਣਾ ਸਰੀਰ ਤੇ ਮਨ ਉਸ ਦੇ ਹਵਾਲੇ ਕਰੋ, ਬੱਸ! ਇਹ ਸੁਗੰਧੀ (ਜਿੰਦ ਵਾਸਤੇ) ਵਰਤੋ। ਸੋਹਾਗ ਭਾਗ ਵਾਲੀਆਂ ਇਹੀ ਆਖਦੀਆਂ ਹਨ ਕਿ ਹੇ ਭੈਣ! ਇਹਨੀਂ ਗੱਲੀਂ ਹੀ ਖਸਮ-ਪ੍ਰਭੂ ਮਿਲਦਾ ਹੈ ।੩। ਖਸਮ-ਪ੍ਰਭੂ ਤਦੋਂ ਹੀ ਮਿਲਦਾ ਹੈ ਜਦੋਂ ਆਪਾ-ਭਾਵ ਦੂਰ ਕਰੀਏ। ਇਸ ਤੋਂ ਬਿਨਾ ਕੋਈ ਹੋਰ ਉੱਦਮ ਵਿਅਰਥ ਚਲਾਕੀ ਹੈ। (ਜ਼ਿੰਦਗੀ ਦਾ) ਉਹ ਦਿਨ ਸਫਲ ਜਾਣੋ ਜਦੋਂ ਪਤੀ-ਪ੍ਰਭੂ ਮੇਹਰ ਦੀ ਨਿਗਾਹ ਨਾਲ ਤੱਕੇ, (ਜਿਸ) ਜੀਵ-ਇਸਤ੍ਰੀ (ਵਲ ਮੇਹਰ ਦੀ) ਨਿਗਾਹ ਕਰਦਾ ਹੈ ਉਹ ਮਾਨੋ ਨੌਂ ਖ਼ਜ਼ਾਨੇ ਲੱਭ ਲੈਂਦੀ ਹੈ। ਹੇ ਨਾਨਕ! ਜੇਹੜੀ ਜੀਵ-ਇਸਤ੍ਰੀ ਆਪਣੇ ਖਸਮ-ਪ੍ਰਭੂ ਨੂੰ ਪਿਆਰੀ ਹੈ ਉਹ ਸੁਹਾਗ ਭਾਗ ਵਾਲੀ ਹੈ ਉਹ (ਜਗਤ-) ਪਰਵਾਰ ਵਿਚ ਆਦਰ ਮਾਣ ਪ੍ਰਾਪਤ ਕਰਦੀ ਹੈ। ਜੇਹੜੀ ਪ੍ਰਭੂ ਦੇ ਪਿਆਰ ਰੰਗ ਵਿਚ ਰੰਗੀ ਰਹਿੰਦੀ ਹੈ, ਜੇਹੜੀ ਅਡੋਲਤਾ ਵਿਚ ਮਸਤ ਰਹਿੰਦੀ ਹੈ, ਜੇਹੜੀ ਦਿਨ ਰਾਤ ਪ੍ਰਭੂ ਦੇ ਪ੍ਰੇਮ ਵਿਚ ਮਗਨ ਰਹਿੰਦੀ ਹੈ, ਉਹੀ ਸੋਹਣੀ ਹੈ ਸੋਹਣੇ ਰੂਪ ਵਾਲੀ ਹੈ ਅਕਲ ਵਾਲੀ ਹੈ ਤੇ ਸਿਆਣੀ ਕਹੀ ਜਾਂਦੀ ਹੈ ।੪।੨।੪।"""

english = """O foolish and ignorant soul-bride, why are you so proud? Within the home of your own self, why do you not enjoy the Love of your Lord? Your Husband Lord is so very near, O foolish bride; why do you search for Him outside? Apply the Fear of God as the maascara to adorn your eyes, and make the Love of the Lord your ornament. Then, you shall be known as a devoted and committed soul-bride, when you enshrine love for your Husband Lord. || 1 || What can the silly young bride do, if she is not pleasing to her Husband Lord? She may plead and implore so many times, but still, such a bride shall not obtain the Mansion of the Lord's Presence. Without the karma of good deeds, nothing is obtained, although she may run around frantically. She is intoxicated with greed, pride and egotism, and engrossed in Maya. She cannot obtain her Husband Lord in these ways; the young bride is so foolish! || 2 || Go and ask the happy, pure soul-brides, how did they obtain their Husband Lord? Whatever the Lord does, accept that as good; do away with your own cleverness and self-will. By His Love, true wealth is obtained; link your consciousness to His lotus feet. As your Husband Lord directs, so you must act; surrender your body and mind to Him, and apply this perfume to yourself. So speaks the happy soul-bride, O sister; in this way, the Husband Lord is obtained. || 3 || Give up your selfhood, and so obtain your Husband Lord; what other clever tricks are of any use? When the Husband Lord looks upon the soul-bride with His Gracious Glance, that day is historic — the bride obtains the nine treasures. She who is loved by her Husband Lord, is the true soul-bride; O Nanak, she is the queen of all. Thus she is imbued with His Love, intoxicated with delight; day and night, she is absorbed in His Love. She is beautiful, glorious and brilliant; she is known as truly wise. || 4 || 2 || 4 ||"""

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('62.84.184.96', port=22, username='root', password='gDdsK5j9EGN8yyHlg1I12r1AD', timeout=30)

remote_node = """
const mysql = require('/home/demo.dailyhukamnama.in/app/node_modules/mysql2/promise');
const fs = require('fs');

async function run() {
  const data = JSON.parse(fs.readFileSync('/tmp/hukamnama_payload.json', 'utf8'));
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Official@12345',
    database: 'demo_dailyhukamnama_in',
    charset: 'utf8mb4'
  });

  const sql = `UPDATE hukamnamas SET 
      source_image = ?,
      gurmukhi_header = ?,
      shabad_title = ?,
      ang = ?,
      raag = ?,
      gurmukhi_only = ?,
      punjabi_arth = ?,
      english_translation = ?
  WHERE id = 8 OR hukamnama_date = '2026-09-09'`;

  const [result] = await conn.execute(sql, [
    data.source_image,
    data.gurmukhi_header,
    data.shabad_title,
    data.ang,
    data.raag,
    data.gurmukhi_only,
    data.punjabi_arth,
    data.english_translation
  ]);
  console.log('Affected rows:', result.affectedRows);

  const [rows] = await conn.query('SELECT id, hukamnama_date, title, ang, raag, source_image, length(gurmukhi_only) as gl, length(punjabi_arth) as pl FROM hukamnamas WHERE id = 8');
  console.log('Updated record:', rows);
  await conn.end();
}

run().catch(console.error);
"""

import json
payload = {
    'source_image': '/uploads/hukamnama-2026-09-09-1.jpg',
    'gurmukhi_header': 'ਬੁੱਧਵਾਰ, ੨੪ ਭਾਦੋਂ (ਸੰਮਤ ੫੫੮ ਨਾਨਕਸ਼ਾਹੀ) (ਅੰਗ: ੭੨੨)',
    'shabad_title': 'ਤਿਲੰਗ ਮਃ ੧ ॥',
    'ang': '੭੨੨',
    'raag': 'ਤਿਲੰਗ ਮਃ ੧ ॥',
    'gurmukhi_only': mukhwak,
    'punjabi_arth': viakhya,
    'english_translation': english
}

sftp = ssh.open_sftp()
with sftp.file('/tmp/hukamnama_payload.json', 'w') as f:
    f.write(json.dumps(payload, ensure_ascii=False))

with sftp.file('/tmp/update_db.js', 'w') as f:
    f.write(remote_node)
sftp.close()

stdin, stdout, stderr = ssh.exec_command('node /tmp/update_db.js')
out = stdout.read().decode('utf-8')
err = stderr.read().decode('utf-8')
print('Remote output:', out)
if err: print('Remote error:', err)

ssh.close()

