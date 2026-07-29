import sys, os, zipfile, io, time
import paramiko

HOST = '46.8.176.241'
USER = 'ubuntu'
PASS = 'LraJgOe64E'
RDIR = '/home/ubuntu/projects/lerndeutsch'
SUDO = f"echo '{PASS}' | sudo -S"

def p(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', errors='replace').decode('ascii'), flush=True)

def run(ssh, cmd, timeout=60):
    _, stdout, _ = ssh.exec_command(cmd, timeout=timeout)
    lines = [ln.rstrip() for ln in stdout]
    code = stdout.channel.recv_exit_status()
    for ln in lines:
        try:
            p("  " + ln)
        except Exception:
            pass
    return "\n".join(lines), code

# Create dist zip
p("Creating dist.zip...")
dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist")
buf = io.BytesIO()
with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, _, files in os.walk(dist_dir):
        for fname in files:
            full = os.path.join(root, fname)
            arcname = "dist/" + os.path.relpath(full, dist_dir).replace("\\", "/")
            zf.write(full, arcname)
buf.seek(0)
data = buf.read()
p(f"Dist zip: {len(data)/1024:.1f} KB")

# Connect
p("Connecting...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=30, allow_agent=False, look_for_keys=False)
p("Connected!")

# Upload
sftp = ssh.open_sftp()
sftp.putfo(io.BytesIO(data), f"{RDIR}/dist_final.zip")
sftp.close()
p("Uploaded!")

# Extract
run(ssh, f"cd {RDIR} && unzip -o dist_final.zip 2>&1 | tail -5")
run(ssh, f"rm {RDIR}/dist_final.zip 2>/dev/null || true")

# Nginx reload
run(ssh, f"{SUDO} systemctl reload nginx 2>&1")

# Verify
time.sleep(2)
out, _ = run(ssh, f"curl -sk https://localhost/ -o /dev/null -w '%{{http_code}}'")
p("HTTPS: " + out)

out, _ = run(ssh, f"curl -sk https://localhost/api/v1/progress/activity")
p("/activity: " + out[:200])

p("\nFrontend-only push DONE")
ssh.close()
