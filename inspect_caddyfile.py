import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

# Find Caddyfile on system
print("[CADDYFILE FIND]:")
_, stdout, _ = ssh.exec_command("find /home/ubuntu -name '*Caddyfile*' 2>/dev/null")
print(stdout.read().decode())

# Read docker compose files in home folder
print("[DOCKER COMPOSE FILES]:")
_, stdout, _ = ssh.exec_command("find /home/ubuntu -name '*docker-compose*' 2>/dev/null")
print(stdout.read().decode())

ssh.close()
