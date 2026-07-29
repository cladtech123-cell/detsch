#!/usr/bin/env python3
"""
Sprint 9 -- Fixed Deployment
Backend is at: /home/ubuntu/projects/lerndeutsch/backend/app/
Frontend dist is at: /home/ubuntu/projects/lerndeutsch/dist/
"""
import sys, os, zipfile, time, io
import paramiko

HOST     = "46.8.176.241"
USER     = "ubuntu"
PASS     = "LraJgOe64E"
RDIR     = "/home/ubuntu/projects/lerndeutsch"
BACKEND  = f"{RDIR}/backend"
SUDO     = f"echo '{PASS}' | sudo -S"

def p(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', errors='replace').decode('ascii'), flush=True)

def banner(msg): p(f"\n{'='*60}\n  {msg}\n{'='*60}")

def run(ssh, cmd, timeout=180):
    p(f"\n$ {cmd[:120]}")
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    lines = []
    for ln in stdout:
        ln = ln.rstrip()
        try:
            p("  " + ln)
        except UnicodeEncodeError:
            p("  " + ln.encode('ascii', errors='replace').decode('ascii'))
        lines.append(ln)
    code = stdout.channel.recv_exit_status()
    err = stderr.read().decode(errors="replace").strip()
    if err and "password" not in err.lower() and code != 0:
        try:
            p("  ERR: " + err[:300])
        except UnicodeEncodeError:
            p("  ERR: " + err[:300].encode('ascii', errors='replace').decode('ascii'))
    return "\n".join(lines), code


# ── Step 1: Build frontend ──────────────────────────────────────────────────
banner("STEP 1 -- Building Frontend")
frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend")
r = os.system(f'cd "{frontend_dir}" && node node_modules/vite/bin/vite.js build')
if r != 0:
    p("FATAL: Frontend build failed!")
    sys.exit(1)
p("[OK] Frontend built successfully")


# ── Step 2: Create frontend dist ZIP ────────────────────────────────────────
banner("STEP 2 -- Creating dist.zip")
dist_dir = os.path.join(frontend_dir, "dist")
zip_buf = io.BytesIO()
with zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(dist_dir):
        for fname in files:
            full = os.path.join(root, fname)
            arcname = "dist/" + os.path.relpath(full, dist_dir).replace("\\", "/")
            zf.write(full, arcname)
zip_buf.seek(0)
zip_bytes = zip_buf.read()
p(f"[OK] dist.zip ready: {len(zip_bytes)/1024:.1f} KB")


# ── Step 3: Create backend ZIP ───────────────────────────────────────────────
banner("STEP 3 -- Creating backend.zip (only changed files)")
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
backend_buf = io.BytesIO()

# Only include the specific files we changed
changed_files = [
    "app/models/german.py",
    "app/schemas/german.py",
    "app/repositories/german.py",
    "app/services/german_service.py",
    "app/api/v1/endpoints/progress.py",
    "app/api/v1/endpoints/exams.py",
]

with zipfile.ZipFile(backend_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
    for rel_path in changed_files:
        full = os.path.join(backend_dir, rel_path.replace("/", os.sep))
        if os.path.exists(full):
            zf.write(full, f"backend/{rel_path}")
            p(f"  Added: {rel_path}")
        else:
            p(f"  WARN: Not found: {full}")

backend_buf.seek(0)
backend_bytes = backend_buf.read()
p(f"[OK] backend.zip ready: {len(backend_bytes)/1024:.1f} KB")


# ── Step 4: Connect & Upload ────────────────────────────────────────────────
banner("STEP 4 -- SSH Connect")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=30,
            allow_agent=False, look_for_keys=False)
p(f"[OK] Connected to {USER}@{HOST}")

sftp = ssh.open_sftp()

banner("STEP 5 -- Uploading files")
sftp.putfo(io.BytesIO(zip_bytes), f"{RDIR}/dist_s9.zip")
p("[OK] dist.zip uploaded")

sftp.putfo(io.BytesIO(backend_bytes), f"{RDIR}/backend_s9.zip")
p("[OK] backend.zip uploaded")
sftp.close()


# ── Step 6: Extract + Deploy Backend ────────────────────────────────────────
banner("STEP 6 -- Deploy Backend Files")

# Verify the backend app path
out, _ = run(ssh, f"ls {BACKEND}/app/ 2>/dev/null | head -10 || echo 'NO APP DIR'")
p("Backend app dir contents: " + out[:200])

# Backup & extract
run(ssh, f"cp {BACKEND}/app/models/german.py {BACKEND}/app/models/german.py.bak 2>/dev/null || true")
run(ssh, f"cd {RDIR} && unzip -o backend_s9.zip -d /tmp/s9b 2>&1 | tail -5")

# Copy each changed file to server
run(ssh, f"""
cp /tmp/s9b/backend/app/models/german.py {BACKEND}/app/models/german.py &&
cp /tmp/s9b/backend/app/schemas/german.py {BACKEND}/app/schemas/german.py &&
cp /tmp/s9b/backend/app/repositories/german.py {BACKEND}/app/repositories/german.py &&
cp /tmp/s9b/backend/app/services/german_service.py {BACKEND}/app/services/german_service.py &&
cp /tmp/s9b/backend/app/api/v1/endpoints/progress.py {BACKEND}/app/api/v1/endpoints/progress.py &&
cp /tmp/s9b/backend/app/api/v1/endpoints/exams.py {BACKEND}/app/api/v1/endpoints/exams.py &&
echo 'All backend files copied OK'
""")

# Cleanup
run(ssh, f"rm -rf /tmp/s9b {RDIR}/backend_s9.zip 2>/dev/null || true")


# ── Step 7: Extract + Deploy Frontend ────────────────────────────────────────
banner("STEP 7 -- Deploy Frontend")
run(ssh, f"cp -r {RDIR}/dist {RDIR}/dist.bak.s9 2>/dev/null || true")
run(ssh, f"cd {RDIR} && unzip -o dist_s9.zip 2>&1 | tail -5")
run(ssh, f"rm {RDIR}/dist_s9.zip 2>/dev/null || true")
p("[OK] Frontend dist extracted")


# ── Step 8: Restart Backend ─────────────────────────────────────────────────
banner("STEP 8 -- Restart Backend")
run(ssh, f"{SUDO} systemctl restart lerndeutsch-backend 2>&1")
time.sleep(6)
out, _ = run(ssh, f"{SUDO} systemctl is-active lerndeutsch-backend 2>&1")
backend_running = "active" in out
p("Backend state: " + out + (" [OK]" if backend_running else " [PROBLEM]"))


# ── Step 9: Reload Nginx ─────────────────────────────────────────────────────
banner("STEP 9 -- Nginx Reload")
run(ssh, f"{SUDO} nginx -t 2>&1")
run(ssh, f"{SUDO} systemctl reload nginx 2>&1")


# ── Step 10: Verify ─────────────────────────────────────────────────────────
banner("STEP 10 -- Verification")

p("\nBackend health:")
out, _ = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/v1/health")
backend_ok = "200" in out
p("  /health: " + out + (" [OK]" if backend_ok else " [CHECK]"))

p("\nNew endpoints:")
out, _ = run(ssh, "curl -s http://localhost:8000/api/v1/progress/activity")
activity_ok = '"xp"' in out or '"day_abbr"' in out or out == "[]"
p("  /progress/activity: " + (out[:100] if len(out) < 100 else out[:100] + "..."))

out, _ = run(ssh, "curl -s http://localhost:8000/api/v1/exams/history")
exams_ok = out.startswith("[")
p("  /exams/history: " + out[:80])

p("\nFrontend:")
out, _ = run(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost/")
frontend_ok = "200" in out
p("  http://localhost/: " + out + (" [OK]" if frontend_ok else " [CHECK]"))

p("\nPublic:")
out, _ = run(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://{HOST}/ --connect-timeout 5 || echo timeout")
public_ok = "200" in out
p(f"  http://{HOST}/: " + out + (" [OK]" if public_ok else " [CHECK]"))

p("\nRecent backend logs:")
run(ssh, f"{SUDO} journalctl -u lerndeutsch-backend -n 20 --no-pager 2>&1 | cat")

banner("SPRINT 9 COMPLETE")
p(f"""
  HOST   : {HOST}
  BACKEND: {BACKEND}
  DIST   : {RDIR}/dist

  STATUS :
    Backend running   : {"YES" if backend_running else "CHECK"}
    /health 200       : {"YES" if backend_ok else "CHECK"}
    /activity endpoint: {"YES" if activity_ok else "CHECK"}
    /exams/history    : {"YES" if exams_ok else "CHECK"}
    Frontend (local)  : {"YES" if frontend_ok else "CHECK"}
    Frontend (public) : {"YES" if public_ok else "CHECK"}

  CHANGES DEPLOYED:
    + StudySession + ExamResult DB models
    + /progress/log-session endpoint
    + /progress/activity endpoint
    + /exams/submit endpoint
    + /exams/history endpoint (DB-persistent)
    + Curriculum-aware AI Tutor prompt
    + Dashboard: real 7-day XP bar chart
    + Dashboard: real streak days
    + AI Tutor: lesson/grammar context badge
    + ExamsView: DB-persistent exam history

  URL: http://{HOST}/
""")

ssh.close()
p("[DONE]")
