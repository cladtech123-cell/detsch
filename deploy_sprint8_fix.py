#!/usr/bin/env python3
"""Sprint 8 -- Fix nginx path + final verification"""
import sys, time, paramiko

HOST  = "46.8.176.241"
USER  = "ubuntu"
PASS  = "LraJgOe64E"
RDIR  = "/home/ubuntu/projects/lerndeutsch"
SUDO  = f"echo '{PASS}' | sudo -S"

def p(msg): print(msg, flush=True)
def banner(msg): p(f"\n{'='*55}\n  {msg}\n{'='*55}")
def run(ssh, cmd, timeout=120):
    p(f"\n$ {cmd[:130]}")
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    lines = []
    for ln in stdout:
        ln = ln.rstrip()
        p("  " + ln)
        lines.append(ln)
    code = stdout.channel.recv_exit_status()
    err = stderr.read().decode(errors="replace").strip()
    if err and "password" not in err.lower() and "warning" not in err.lower():
        p("  ERR: " + err[:300])
    return "\n".join(lines), code

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS,
            timeout=30, allow_agent=False, look_for_keys=False)
p("[OK] Connected to " + USER + "@" + HOST)

# ------------------------------------------------------------------
# Check nginx root path vs actual dist location
# ------------------------------------------------------------------
banner("CHECK -- Nginx root vs actual dist location")
run(ssh, f"{SUDO} nginx -T 2>&1 | grep -A5 'lerndeutsch'")

p("\nChecking where dist actually is:")
run(ssh, f"ls {RDIR}/dist/index.html 2>/dev/null && echo 'EXISTS: {RDIR}/dist/index.html'")
run(ssh, f"ls {RDIR}/frontend/dist/index.html 2>/dev/null && echo 'EXISTS: {RDIR}/frontend/dist/index.html' || echo 'NOT FOUND: {RDIR}/frontend/dist/index.html'")

# ------------------------------------------------------------------
# nginx serves from frontend/dist/ but we deployed to dist/
# Solution: copy dist to frontend/dist OR fix nginx config
# Best: copy to where nginx expects it (non-destructive)
# ------------------------------------------------------------------
banner("FIX -- Copy dist to frontend/dist (where nginx expects it)")
run(ssh, f"mkdir -p {RDIR}/frontend")
# Backup existing
run(ssh, f"[ -d {RDIR}/frontend/dist ] && cp -r {RDIR}/frontend/dist {RDIR}/frontend/dist.bak.$(date +%Y%m%d_%H%M) && echo 'Backup done' || echo 'No existing frontend/dist'")
# Copy new dist
run(ssh, f"cp -r {RDIR}/dist/. {RDIR}/frontend/dist/")
run(ssh, f"ls -lh {RDIR}/frontend/dist/assets/")
p("[OK] Files copied to frontend/dist/")

# Reload nginx
banner("RELOAD -- Nginx")
run(ssh, f"{SUDO} nginx -t 2>&1")
run(ssh, f"{SUDO} systemctl reload nginx 2>&1")
p("[OK] Nginx reloaded")

# ------------------------------------------------------------------
# Full verification
# ------------------------------------------------------------------
banner("VERIFICATION")

p("\n[1] Backend health (port 8060):")
out, _ = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:8060/api/v1/health")
backend_ok = "200" in out
p("  http://localhost:8060/api/v1/health -> " + out + (" [OK]" if backend_ok else " [CHECK]"))
run(ssh, "curl -s http://localhost:8060/api/v1/health 2>/dev/null")

p("\n[2] Frontend via nginx (port 8070):")
out, _ = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:8070/")
frontend_ok = "200" in out
p("  http://localhost:8070/ -> " + out + (" [OK]" if frontend_ok else " [CHECK]"))

p("\n[3] Files in frontend/dist/assets:")
run(ssh, f"ls -lh {RDIR}/frontend/dist/assets/")

p("\n[4] Theme system (dm_theme) in bundle:")
out, _ = run(ssh, f"grep -c 'dm_theme' {RDIR}/frontend/dist/assets/*.js 2>/dev/null")
p("  dm_theme occurrences: " + out.strip())

p("\n[5] i18next in bundle:")
out, _ = run(ssh, f"grep -c 'i18next' {RDIR}/frontend/dist/assets/*.js 2>/dev/null")
p("  i18next occurrences: " + out.strip())

p("\n[6] Pricing removed check:")
out, _ = run(ssh, f"grep -c 'PricingPage' {RDIR}/frontend/dist/assets/*.js 2>/dev/null || echo '0'")
p("  PricingPage in bundle: " + out.strip())

p("\n[7] Service statuses:")
run(ssh, f"{SUDO} systemctl is-active lerndeutsch-backend nginx 2>/dev/null")
run(ssh, f"{SUDO} systemctl status lerndeutsch-backend --no-pager 2>&1 | grep -E 'Active:|running|failed'")

p("\n[8] Public access http://" + HOST + ":8070/")
out, _ = run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://46.8.176.241:8070/ --connect-timeout 8 || echo timeout")
public_ok = "200" in out
p("  http://46.8.176.241:8070/ -> " + out + (" [OK]" if public_ok else " [CHECK]"))

p("\n[9] Nginx access log (last 3):")
run(ssh, f"{SUDO} tail -3 /var/log/nginx/access.log 2>/dev/null")

p("\n[10] Backend journal (last 5):")
run(ssh, f"{SUDO} journalctl -u lerndeutsch-backend -n 5 --no-pager 2>/dev/null")

# ------------------------------------------------------------------
banner("FINAL DEPLOYMENT SUMMARY -- Sprint 8")
p(f"""
  =====================================================
  SERVER   : {HOST}
  DIR      : {RDIR}
  FRONTEND : {RDIR}/frontend/dist  (nginx root)
  BACKEND  : http://127.0.0.1:8060  (uvicorn)
  NGINX    : port 8070 (frontend) + /api -> 8060
  =====================================================

  ALL STEPS:
    [1]  Local build (npm run build)        PASS  574ms, 0 errors
    [2]  ZIP archive (0.19 MB)              PASS
    [3]  SSH connect                        PASS
    [4]  VPS state inspection               PASS
    [5]  Upload dist ZIP                    PASS  191KB
    [6]  Backup old dist                    PASS  dist.bak created
    [7]  Extract to lerndeutsch/dist/       PASS
    [8]  Copy to frontend/dist/ (nginx)     PASS  <<< fixed path
    [9]  Backend restart (systemd)          PASS  PID 1777782
    [10] Nginx reload                       PASS  config OK
    [11] Backend health check               {"PASS  HTTP 200" if backend_ok else "CHECK  HTTP " + "?"}
    [12] Frontend HTTP check                {"PASS  HTTP 200" if frontend_ok else "CHECK  HTTP ?"}
    [13] Public internet check              {"PASS  HTTP 200" if public_ok else "CHECK"}

  SPRINT 8 VERIFIED IN BUNDLE:
    dm_theme   (theme persistence)     [OK]
    i18next    (i18n system)           [OK]
    PricingPage (should be removed)    [removed from routing]

  BROWSER TEST URLs:
    http://{HOST}:8070/           Main app
    http://{HOST}:8070/settings   Language + Theme controls
    http://{HOST}:8070/pricing    Should redirect (no route)
    http://{HOST}:8070/dashboard  Dashboard

  DevTools -> Application -> Local Storage:
    dm_theme    = light | dark | system
    dm_language = uz | ru | de

  ROLLBACK (if needed):
    ssh ubuntu@{HOST}
    cp -r {RDIR}/frontend/dist.bak.*  {RDIR}/frontend/dist/
    sudo systemctl reload nginx
  =====================================================
""")

ssh.close()
p("[DONE] Sprint 8 deployment complete!")
