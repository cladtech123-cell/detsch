import paramiko
import time

HOST = "46.8.176.241"
USER = "ubuntu"
PASS = "LraJgOe64E"
RDIR = "/home/ubuntu/projects/lerndeutsch"
SUDO = f"echo '{PASS}' | sudo -S"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print("[SSH] Connecting with high timeout...")
try:
    ssh.connect(
        HOST, 
        username=USER, 
        password=PASS, 
        timeout=60, 
        banner_timeout=60, 
        auth_timeout=60, 
        allow_agent=False, 
        look_for_keys=False
    )
    print("[SSH] Connected successfully.")

    # 1. Clear frontend dist
    print("[CMD] Clearing old files in Nginx root...")
    _, stdout, stderr = ssh.exec_command(f"rm -rf {RDIR}/frontend/dist/*")
    print(stdout.read().decode())
    print(stderr.read().decode())

    # 2. Copy extracted dist folder
    print("[CMD] Copying new dist build...")
    _, stdout, stderr = ssh.exec_command(f"cp -r {RDIR}/dist/* {RDIR}/frontend/dist/")
    print(stdout.read().decode())
    print(stderr.read().decode())

    # 3. Reload Nginx
    print("[CMD] Reloading Nginx server...")
    _, stdout, stderr = ssh.exec_command(f"{SUDO} systemctl reload nginx")
    print(stdout.read().decode())
    print(stderr.read().decode())

    # 4. Restart Backend
    print("[CMD] Restarting LernDeutsch Backend...")
    _, stdout, stderr = ssh.exec_command(f"{SUDO} systemctl restart lerndeutsch-backend")
    print(stdout.read().decode())
    print(stderr.read().decode())

    # 5. Local verification check from inside the VPS
    print("[CMD] Verifying frontend response on port 8070...")
    _, stdout, _ = ssh.exec_command("curl -s http://localhost:8070/")
    resp = stdout.read().decode()
    if "DeutschMastery" in resp:
        print("[VERIFICATION PASSED] Served index contains 'DeutschMastery'.")
    else:
        print(f"[VERIFICATION WARNING] Response did not match. Length: {len(resp)}")

    ssh.close()
except Exception as e:
    print(f"Connection/execution error: {e}")
