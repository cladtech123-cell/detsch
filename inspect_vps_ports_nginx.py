import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

# Check all listening ports
print("[PORT STATS]:")
_, stdout, _ = ssh.exec_command("sudo ss -tulpn")
print(stdout.read().decode())

# Check running nginx processes
print("[NGINX PROCESSES]:")
_, stdout, _ = ssh.exec_command("ps aux | grep nginx")
print(stdout.read().decode())

# Print nginx.conf content
print("[NGINX CONF]:")
_, stdout, _ = ssh.exec_command("cat /etc/nginx/nginx.conf")
print(stdout.read().decode())

ssh.close()
