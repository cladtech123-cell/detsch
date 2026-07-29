import paramiko

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"
RDIR = "/home/ubuntu/projects/lerndeutsch"
SUDO = f"echo '{PASS}' | sudo -S"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("[SSH] Connecting...")
ssh.connect(HOST, username=USER, password=PASS)
print("[SSH] Connected.")

# 1. Clear Nginx root
print("[CMD] Clearing remote Nginx root...")
_, stdout, stderr = ssh.exec_command(f"rm -rf {RDIR}/frontend/dist/*")
stdout.read()
stderr.read()

# 2. Copy build
print("[CMD] Copying files...")
_, stdout, stderr = ssh.exec_command(f"cp -r {RDIR}/dist/* {RDIR}/frontend/dist/")
stdout.read()
stderr.read()

# 3. Reload Nginx
print("[CMD] Reloading Nginx...")
_, stdout, stderr = ssh.exec_command(f"{SUDO} systemctl reload nginx")
stdout.read()
stderr.read()

# 4. Restart Backend
print("[CMD] Restarting backend...")
_, stdout, stderr = ssh.exec_command(f"{SUDO} systemctl restart lerndeutsch-backend")
stdout.read()
stderr.read()

# 5. Local verify
print("[CMD] Verifying...")
_, stdout, _ = ssh.exec_command("curl -s http://localhost:8070/")
html = stdout.read().decode()
if "DeutschMastery" in html:
    print("[VERIFIED] Success! App contains 'DeutschMastery'")
else:
    print("[WARNING] App does not contain 'DeutschMastery'")

ssh.close()
print("[DONE]")
