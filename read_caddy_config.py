import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

# Find any files in tg-api-forwarder-bot/infra
print("[INFRA FILES]:")
_, stdout, _ = ssh.exec_command("find /home/ubuntu/tg-api-forwarder-bot/infra/ -maxdepth 2")
print(stdout.read().decode())

# Check for Caddyfile in tg-api-forwarder-bot/
print("[SEARCHING CADDYFILE]:")
_, stdout, _ = ssh.exec_command("find /home/ubuntu/tg-api-forwarder-bot -name '*Caddyfile*'")
print(stdout.read().decode())

# Print Caddyfile contents if found
_, stdout, _ = ssh.exec_command("cat /home/ubuntu/tg-api-forwarder-bot/infra/caddy/Caddyfile 2>/dev/null || cat /home/ubuntu/tg-api-forwarder-bot/Caddyfile 2>/dev/null || echo 'Not found'")
print("[CADDYFILE CONTENT]:")
print(stdout.read().decode())

ssh.close()
