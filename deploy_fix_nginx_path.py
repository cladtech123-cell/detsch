import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"
RDIR = "/home/ubuntu/projects/lerndeutsch"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

print("[SSH] Connected.")

# Remove old files in remote frontend/dist directory
print("[CMD] Clearing remote frontend/dist/ directory...")
_, stdout, stderr = ssh.exec_command(f"rm -rf {RDIR}/frontend/dist/*")
print(stdout.read().decode())
print(stderr.read().decode())

# Copy the extracted dist directory to frontend/dist
print("[CMD] Copying fresh dist to frontend/dist...")
_, stdout, stderr = ssh.exec_command(f"cp -r {RDIR}/dist/* {RDIR}/frontend/dist/")
print(stdout.read().decode())
print(stderr.read().decode())

# Check files
print("[CMD] Checking files in frontend/dist/assets...")
_, stdout, stderr = ssh.exec_command(f"ls -lh {RDIR}/frontend/dist/assets/")
print(stdout.read().decode())

# Reload nginx
print("[CMD] Reloading Nginx...")
_, stdout, stderr = ssh.exec_command(f"echo '{PASS}' | sudo -S systemctl reload nginx")
print(stdout.read().decode())
print(stderr.read().decode())

ssh.close()
print("[DONE]")
