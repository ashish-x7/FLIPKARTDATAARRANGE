# Gunicorn configuration to prevent 502 timeouts
timeout = 300
keepalive = 5
workers = 2
threads = 4
worker_class = 'gthread'
max_requests = 1000
max_requests_jitter = 50
