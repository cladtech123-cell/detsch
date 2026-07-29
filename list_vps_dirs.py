import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

_, stdout, _ = ssh.exec_command("ls -la /home/ubuntu")
print(stdout.read().decode())

_, stdout, _ = ssh.exec_command("find /home/ubuntu -maxdepth 2 -type d")
print("[SUBDIRS]:")
print(stdout.read().decode())

ssh.close()
