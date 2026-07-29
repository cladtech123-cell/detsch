import paramiko
import zipfile
from pathlib import Path

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"
RDIR = "/home/ubuntu/projects/lerndeutsch"
SUDO = f"echo '{PASS}' | sudo -S"

DIST_DIR = Path(r"C:\Users\user\project\frontend\dist")
ZIP_PATH = Path(r"C:\Users\user\project\dist_sprint8.zip")

# 1. Zip local dist
print("[ZIP] Packaging dist...")
with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for f in DIST_DIR.rglob("*"):
        if f.is_file():
            arc = "dist/" + str(f.relative_to(DIST_DIR)).replace("\\", "/")
            zf.write(f, arc)
print(f"[ZIP] Packed to {ZIP_PATH}")

# 2. Connect SSH
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("[SSH] Connecting...")
ssh.connect(HOST, username=USER, password=PASS)
print("[SSH] Connected.")

# 3. Upload ZIP via SFTP
print("[SFTP] Uploading...")
sftp = ssh.open_sftp()
sftp.put(str(ZIP_PATH), "/home/ubuntu/dist_sprint8.zip")
sftp.close()
print("[SFTP] Uploaded successfully.")

# 4. Clean and Extract Nginx root
print("[CMD] Re-creating remote frontend/dist directory and extracting...")
# Clear parent target, extract zip directly into RDIR/frontend (which recreates RDIR/frontend/dist)
_, stdout, stderr = ssh.exec_command(
    f"rm -rf {RDIR}/frontend/dist && mkdir -p {RDIR}/frontend "
    f"&& cd {RDIR}/frontend && unzip -o /home/ubuntu/dist_sprint8.zip "
    f"&& rm -f /home/ubuntu/dist_sprint8.zip"
)
stdout.read()
stderr.read()

# 5. Reload Nginx
print("[CMD] Reloading Nginx...")
_, stdout, stderr = ssh.exec_command(f"{SUDO} systemctl reload nginx")
stdout.read()
stderr.read()

# 6. Restart backend
print("[CMD] Restarting backend...")
_, stdout, stderr = ssh.exec_command(f"{SUDO} systemctl restart lerndeutsch-backend")
stdout.read()
stderr.read()

# 7. Local verify
print("[CMD] Verifying...")
_, stdout, _ = ssh.exec_command("curl -s http://localhost:8070/")
html = stdout.read().decode()
if "DeutschMastery" in html:
    print("[VERIFIED] Success! App contains 'DeutschMastery'")
else:
    print("[WARNING] App does not contain 'DeutschMastery'. HTML snippet:")
    print(html[:500])

ssh.close()
print("[DONE]")
