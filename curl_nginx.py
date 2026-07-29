import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

# Fetch localhost:8070
print("[CMD] Curl http://localhost:8070/ ...")
_, stdout, _ = ssh.exec_command("curl -s http://localhost:8070/")
print(stdout.read().decode())

# Fetch localhost:80 (Caddy)
print("[CMD] Curl http://localhost/ ...")
_, stdout, _ = ssh.exec_command("curl -s -L http://localhost/")
print(stdout.read().decode()[:500])

ssh.close()
