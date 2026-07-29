import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

# Check all listening ports with sudo -S
print("[LISTEN PORTS]:")
_, stdout, stderr = ssh.exec_command(f"echo '{PASS}' | sudo -S ss -tulpn")
print(stdout.read().decode())
print(stderr.read().decode())

ssh.close()
