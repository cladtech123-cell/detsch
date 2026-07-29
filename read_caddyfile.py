import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    ssh.connect(HOST, username=USER, password=PASS, timeout=10)
    print("[SSH] Connected.")
    _, stdout, _ = ssh.exec_command("cat /home/ubuntu/tg-api-forwarder-bot/Caddyfile")
    print("[CADDYFILE CONTENT]:")
    print(stdout.read().decode())
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
