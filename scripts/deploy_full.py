import paramiko
import sys
import io
import os
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

HOST = "62.84.184.96"
USER = "root"
PASS = "gDdsK5j9EGN8yyHlg1I12r1AD"
MYSQL_PASS = "Official@12345"
APP_DIR = "/home/demo.dailyhukamnama.in/app"
PORT = 3015

def get_ssh():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=22, username=USER, password=PASS, timeout=30)
    return ssh

def exec_cmd(ssh, cmd, timeout=300):
    print(f"\n[EXEC] {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    # Stream stdout
    for line in iter(stdout.readline, ""):
        print("  ", line, end="")
    err = stderr.read().decode("utf-8", errors="replace")
    if err:
        print("  [STDERR]", err.strip())
    exit_code = stdout.channel.recv_exit_status()
    print(f"[STATUS] Exit Code: {exit_code}")
    return exit_code

def main():
    ssh = get_ssh()
    sftp = ssh.open_sftp()

    print(">>> 1. Uploading database dump to server...")
    local_dump = "database_dump.sql"
    remote_dump = "/tmp/database_dump.sql"
    sftp.put(local_dump, remote_dump)
    print("Database dump uploaded successfully.")

    print(">>> 2. Setting up MySQL database and importing dump...")
    sql_init = f"""
    mysql -u root -p'{MYSQL_PASS}' -e "CREATE DATABASE IF NOT EXISTS \`demo_dailyhukamnama_in\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -u root -p'{MYSQL_PASS}' demo_dailyhukamnama_in < /tmp/database_dump.sql
    mysql -u root -p'{MYSQL_PASS}' -e "SHOW TABLES FROM \`demo_dailyhukamnama_in\`; SELECT COUNT(*) as total_hukamnamas FROM \`demo_dailyhukamnama_in\`.hukamnamas;"
    """
    exec_cmd(ssh, sql_init)

    print(">>> 3. Cloning / pulling repository...")
    git_cmds = f"""
    if [ ! -d "{APP_DIR}/.git" ]; then
        mkdir -p {APP_DIR}
        git clone https://github.com/deepmoga/dailyhukamnama.in.git {APP_DIR}
    else
        cd {APP_DIR}
        git fetch origin
        git reset --hard origin/main
    fi
    """
    exec_cmd(ssh, git_cmds)

    print(">>> 4. Writing .env.local on server...")
    env_content = f"""DB_HOST=localhost
DB_USER=root
DB_PASSWORD={MYSQL_PASS}
DB_NAME=demo_dailyhukamnama_in
PORT={PORT}
NODE_ENV=production
"""
    with sftp.open(f"{APP_DIR}/.env.local", "w") as f:
        f.write(env_content)
    print(".env.local written.")

    print(">>> 5. Installing npm packages and building Next.js app...")
    build_cmds = f"""
    cd {APP_DIR}
    npm install
    npm run build
    """
    exec_cmd(ssh, build_cmds, timeout=600)

    print(">>> 6. Starting / restarting PM2 process...")
    pm2_cmds = f"""
    cd {APP_DIR}
    pm2 delete demo.dailyhukamnama.in 2>/dev/null || true
    pm2 start npm --name "demo.dailyhukamnama.in" -- start -- -p {PORT}
    pm2 save
    """
    exec_cmd(ssh, pm2_cmds)

    print(">>> 7. Testing local HTTP response on port 3015...")
    time.sleep(3)
    exec_cmd(ssh, f"curl -I http://127.0.0.1:{PORT}/")

    print(">>> 8. Configuring Apache Reverse Proxy for demo.dailyhukamnama.in...")
    apache_script = f"""
    python3 -c '
conf_path = "/etc/apache2/sites-available/demo.dailyhukamnama.in.conf"
with open(conf_path, "r") as f:
    content = f.read()

# Check if ProxyPass already configured
if "127.0.0.1:{PORT}" not in content:
    # Add proxy directives into both VirtualHost *:80 and *:443
    proxy_block = \"\"\"
    ProxyPass /.well-known !
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:{PORT}/
    ProxyPassReverse / http://127.0.0.1:{PORT}/
\"\"\"
    # Replace existing ProxyPass /.well-known !
    new_content = content.replace("ProxyPass /.well-known !", proxy_block)
    with open(conf_path, "w") as f:
        f.write(new_content)
    print("Apache configuration updated successfully.")
else:
    print("ProxyPass already present in config.")
'
    apache2ctl configtest
    systemctl reload apache2
    """
    exec_cmd(ssh, apache_script)

    print(">>> 9. Verifying public URL response...")
    time.sleep(2)
    exec_cmd(ssh, "curl -I -k https://demo.dailyhukamnama.in/")

    sftp.close()
    ssh.close()
    print("\n Deployment pipeline finished successfully!")

if __name__ == "__main__":
    main()
