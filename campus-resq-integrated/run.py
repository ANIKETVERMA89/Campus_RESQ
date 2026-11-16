#!/usr/bin/env python3
"""Serve the frontend and proxy /api/* to the C++ service on localhost:8080."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent / "frontend"
API_PORT = int(os.environ.get("API_PORT", "8080"))
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        if self.path.startswith("/api/"):
            try:
                req = Request(f"http://127.0.0.1:{API_PORT}" + self.path, headers={"Accept":"application/json"})
                with urlopen(req, timeout=5) as upstream:
                    body = upstream.read()
                    self.send_response(upstream.status)
                    self.send_header("Content-Type", upstream.headers.get("Content-Type", "application/json"))
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers(); self.wfile.write(body)
            except (URLError, HTTPError, TimeoutError) as exc:
                body = (('{"error":"C++ API unavailable: ' + str(exc).replace('"', "'") + '"}').encode())
                self.send_response(502); self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)
            return
        if self.path == "/": self.path = "/index.html"
        return super().do_GET()
    def log_message(self, fmt, *args):
        print("[web] " + fmt % args)

if __name__ == "__main__":
    port = int(os.environ.get("FRONTEND_PORT", "8000"))
    print(f"Campus RESQ frontend: http://localhost:{port}")
    print(f"API proxy: /api/* -> http://127.0.0.1:{API_PORT}")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
