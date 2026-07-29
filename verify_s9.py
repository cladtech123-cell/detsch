import paramiko

HOST = '46.8.176.241'
USER = 'ubuntu'
PASS = 'LraJgOe64E'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS, timeout=20, allow_agent=False, look_for_keys=False)

def run(cmd, label=""):
    _, stdout, _ = ssh.exec_command(cmd, timeout=30)
    out = stdout.read().decode(errors='replace').strip()
    if label:
        print(f"\n--- {label} ---")
    print(f'$ {cmd[:80]}')
    print('  ' + out[:500])
    return out

# Backend health on port 8060
run('curl -s http://localhost:8060/api/v1/health', 'Backend health (port 8060)')

# New endpoints
run('curl -s http://localhost:8060/api/v1/progress/activity', '/progress/activity')
run('curl -s http://localhost:8060/api/v1/exams/history', '/exams/history')

# HTTPS check
run('curl -sk https://localhost/api/v1/health -o /dev/null -w "%{http_code}"', 'HTTPS health')
run('curl -sk https://localhost/api/v1/progress/activity', 'HTTPS /activity')

# DB tables
run("python3 -c \"import sqlite3; c=sqlite3.connect('/home/ubuntu/projects/lerndeutsch/backend/lerndeutsch.db'); print([r[0] for r in c.execute('SELECT name FROM sqlite_master WHERE type=\\'table\\'').fetchall()]); c.close()\"", 'DB tables')

ssh.close()
print("\nVerification complete!")
