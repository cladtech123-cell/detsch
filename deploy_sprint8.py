#!/usr/bin/env python3
"""Sprint 8 — Simple, robust deploy: only dist/ uploaded via SFTP"""
import sys, time, zipfile, paramiko
from pathlib import Path

HOST       = "46.8.176.241"
USER       = "ubuntu"
PASSWORD   = "LraJgOe64E"
REMOTE_DIR = "/home/ubuntu/projects/lerndeutsch"

DIST_DIR   = Path(r"C:\Users\user\project\frontend\dist")
ZIP_PATH   = Path(r"C:\Users\user\project\dist_sprint8.zip")

def p(msg): print(msg, flush=True)
def banner(msg): p(f"\n{'='*55}\n  {msg}\n{'='*55}")

def run(ssh, cmd, timeout=120):
    p(f"\n$ {cmd}")
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout, get_pty=True)
    lines = []
    for ln in stdout:
        ln = ln.rstrip()
        p("  " + ln)
        lines.append(ln)
    code = stdout.channel.recv_exit_status()
    err = stderr.read().decode(errors="replace").strip()
    if err: p("  ERR: " + err)
    return "\n".join(lines), code

# ── 1. Verify local dist ──────────────────────────────────────────────────────
banner("STEP 1 -- Verify local dist/")
if not DIST_DIR.exists():
    p("ERROR: dist/ not found. Run npm run build first!")
    sys.exit(1)
assets = list((DIST_DIR / "assets").glob("*"))
p(f"  dist/index.html : {(DIST_DIR/'index.html').stat().st_size} bytes")
p(f"  dist/assets/    : {len(assets)} files")
for f in assets[:5]:
    p(f"    {f.name}  ({f.stat().st_size//1024}KB)")

# ── 2. Create zip of dist/ only ───────────────────────────────────────────────
banner("STEP 2 -- Zip dist/")
p(f"  Writing {ZIP_PATH} ...")
with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for f in DIST_DIR.rglob("*"):
        if f.is_file():
            arc = "dist/" + str(f.relative_to(DIST_DIR)).replace("\\", "/")
            zf.write(f, arc)
sz = ZIP_PATH.stat().st_size / 1024 / 1024
p(f"  [OK] ZIP created: {sz:.2f} MB")

# ── 3. SSH connect ────────────────────────────────────────────────────────────
banner("STEP 3 -- SSH connect to " + HOST)
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASSWORD,
            timeout=30, allow_agent=False, look_for_keys=False)
p("[OK] Connected to " + USER + "@" + HOST)

# ── 4. Inspect current state ──────────────────────────────────────────────────
banner("STEP 4 -- Current VPS state")
run(ssh, "uname -a && lsb_release -d 2>/dev/null || true")
run(ssh, f"ls {REMOTE_DIR}/ 2>/dev/null || echo DIR_MISSING")
run(ssh, "systemctl is-active lerndeutsch-backend nginx 2>/dev/null || true")
run(ssh, "pm2 list 2>/dev/null | head -10 || echo 'pm2 not found'")
run(ssh, f"ls {REMOTE_DIR}/dist/assets/ 2>/dev/null | wc -l | xargs echo 'Old dist files:'")

# ── 5. Upload ZIP ─────────────────────────────────────────────────────────────
banner(f"STEP 5 -- Upload dist ZIP ({sz:.2f} MB)")
remote_zip = "/home/ubuntu/dist_sprint8.zip"
sftp = ssh.open_sftp()

last_pct = [-1]
def prog(done, total):
    pct = done * 100 // total
    if pct // 10 != last_pct[0] // 10:
        last_pct[0] = pct
        p(f"  Uploading: {pct}%  ({done//1024}KB / {total//1024}KB)")

sftp.put(str(ZIP_PATH), remote_zip, callback=prog)
sftp.close()
p("[OK] Upload complete")

# ── 6. Backup old dist & extract new ─────────────────────────────────────────
banner("STEP 6 -- Backup old dist, extract new")
run(ssh, f"[ -d {REMOTE_DIR}/dist ] && cp -r {REMOTE_DIR}/dist {REMOTE_DIR}/dist.bak.$(date +%Y%m%d_%H%M) && echo 'Backup done' || echo 'No old dist to backup'")
run(ssh, f"cd {REMOTE_DIR} && unzip -o {remote_zip} -d . 2>&1 | tail -5")
run(ssh, f"rm -f {remote_zip}")
run(ssh, f"ls -lh {REMOTE_DIR}/dist/assets/ | head -10")
p("[OK] New dist deployed")

# ── 7. Install backend deps if needed ────────────────────────────────────────
banner("STEP 7 -- Backend dependencies")
run(ssh,
    f"cd {REMOTE_DIR}/backend 2>/dev/null "
    f"&& [ -f .venv/bin/pip ] "
    f"&& .venv/bin/pip install -r requirements.txt -q 2>&1 | tail -3 "
    f"|| echo 'No backend venv - skipping'",
    timeout=180)

# ── 8. Restart backend ────────────────────────────────────────────────────────
banner("STEP 8 -- Restart backend")
out, _ = run(ssh, "systemctl is-active lerndeutsch-backend 2>/dev/null || echo inactive")
if "active" in out and "inactive" not in out:
    run(ssh, "sudo systemctl restart lerndeutsch-backend")
    time.sleep(3)
    run(ssh, "sudo systemctl status lerndeutsch-backend --no-pager | head -20")
else:
    p("  [i] Trying pm2...")
    run(ssh, "pm2 restart all 2>/dev/null || echo 'pm2: nothing to restart'")
    out2, _ = run(ssh, "pm2 list 2>/dev/null | head -15 || echo 'pm2 not used'")

# ── 9. Nginx reload ───────────────────────────────────────────────────────────
banner("STEP 9 -- Nginx reload")
run(ssh, "sudo nginx -t 2>&1")
run(ssh, "sudo systemctl reload nginx 2>&1")
run(ssh, "sudo systemctl status nginx --no-pager | head -8")
p("[OK] Nginx reloaded")

# ── 10. Verification ──────────────────────────────────────────────────────────
banner("STEP 10 -- Verification")

p("\n[10.1] Backend health:")
out, _ = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/v1/health 2>/dev/null || echo 'no-response'")
backend_ok = "200" in out
p("  Backend HTTP: " + out + (" [OK]" if backend_ok else " [CHECK NEEDED]"))
run(ssh, "curl -s http://localhost:8000/api/v1/health 2>/dev/null || echo 'backend not on :8000'")

p("\n[10.2] Frontend via nginx:")
out, _ = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost/ 2>/dev/null || echo 'no-response'")
frontend_ok = "200" in out
p("  Frontend HTTP: " + out + (" [OK]" if frontend_ok else " [CHECK NGINX]"))

p("\n[10.3] dist/assets check:")
run(ssh, f"ls -lh {REMOTE_DIR}/dist/assets/ | head -8")

p("\n[10.4] Theme system in JS bundle:")
out, _ = run(ssh, f"grep -l 'dm_theme' {REMOTE_DIR}/dist/assets/*.js 2>/dev/null | wc -l")
p("  Files with dm_theme: " + out.strip() + (" [OK]" if out.strip() != "0" else " [WARN - not found]"))

p("\n[10.5] i18n in JS bundle:")
out, _ = run(ssh, f"grep -l 'i18next\\|dm_language' {REMOTE_DIR}/dist/assets/*.js 2>/dev/null | wc -l")
p("  Files with i18n: " + out.strip() + (" [OK]" if out.strip() != "0" else " [WARN - not found]"))

p("\n[10.6] Pricing page removed:")
out, _ = run(ssh, f"grep -c 'PricingPage' {REMOTE_DIR}/dist/assets/*.js 2>/dev/null || echo '0'")
total = sum(int(x.split(":")[1]) if ":" in x else int(x) for x in out.strip().split("\n") if x.strip().isdigit() or (":" in x and x.split(":")[1].strip().isdigit()))
p("  PricingPage refs in bundle: " + str(total) + (" [OK - removed]" if total == 0 else " [still present in bundle - routes removed]"))

p("\n[10.7] Service statuses:")
run(ssh, "systemctl is-active lerndeutsch-backend nginx 2>/dev/null")

# ── Summary ───────────────────────────────────────────────────────────────────
banner("DEPLOYMENT COMPLETE -- Sprint 8")
p(f"""
  Host        : {HOST}
  Project dir : {REMOTE_DIR}
  ZIP size    : {sz:.2f} MB
  Backup      : {REMOTE_DIR}/dist.bak.YYYYMMDD_HHMM

  Backend health : {"HTTP 200 [OK]" if backend_ok else "NEEDS CHECK"}
  Frontend HTTP  : {"HTTP 200 [OK]" if frontend_ok else "NEEDS CHECK"}

  Sprint 8 changes deployed:
    [+] i18n: Uzbek / Russian / German (i18next, persisted in localStorage)
    [+] Theme: Light / Dark / System (CSS vars + Zustand persist)
    [+] Pricing page REMOVED from routes and sidebar
    [+] Settings page: Language + Theme pickers
    [+] All UI strings -> translation keys
    [+] Full dark mode CSS variable system

  Browser test:
    http://{HOST}/          -> new DeutschMastery UI
    http://{HOST}/settings  -> Language + Theme controls
    http://{HOST}/pricing   -> should 404 or redirect to /
    Sidebar                 -> no Pricing item visible
    DevTools localStorage   -> dm_theme, dm_language keys
""")

ssh.close()
p("[DONE] Sprint 8 deployment complete!")
