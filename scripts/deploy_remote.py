import paramiko
import sys
import io

# Set UTF-8 encoding for stdout/stderr
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

def get_ssh():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect("62.84.184.96", port=22, username="root", password="gDdsK5j9EGN8yyHlg1I12r1AD", timeout=30)
    return ssh

def run(cmd):
    ssh = get_ssh()
    print(f"\n>>> Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    if out:
        print(out)
    if err:
        print("STDERR:", err)
    ssh.close()
    return out, err

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run(" ".join(sys.argv[1:]))
    else:
        run("ss -tulpn | grep LISTEN")
