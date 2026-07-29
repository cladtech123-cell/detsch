import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

# List sites-available
print("[SITES AVAILABLE]:")
_, stdout, _ = ssh.exec_command("ls -la /etc/nginx/sites-available/")
print(stdout.read().decode())

# Check default config if enabled
_, stdout, _ = ssh.exec_command("cat /etc/nginx/sites-available/default 2>/dev/null || echo 'No default'")
print("[DEFAULT CONFIG]:")
print(stdout.read().decode())

ssh.close()
