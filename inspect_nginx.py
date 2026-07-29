import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

# Get all config files in /etc/nginx/sites-enabled/
_, stdout, stderr = ssh.exec_command("ls -la /etc/nginx/sites-enabled/")
print("[SITES ENABLED]:")
print(stdout.read().decode())

# Read content of lerndeutsch config
_, stdout, _ = ssh.exec_command("cat /etc/nginx/sites-enabled/lerndeutsch 2>/dev/null || echo 'Not found'")
print("[LERNDEUTSCH CONFIG]:")
print(stdout.read().decode())

# Read all enabled configurations
_, stdout, _ = ssh.exec_command("tail -n +1 /etc/nginx/sites-enabled/*")
print("[ALL ENABLED CONFIGS]:")
print(stdout.read().decode())

ssh.close()
