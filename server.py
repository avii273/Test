#!/usr/bin/env python3
"""
Simple HTTP Server for serving the website
This resolves CORS issues when opening HTML files directly in browser
"""

import http.server
import socketserver
import webbrowser
import os
import sys

# Configuration
PORT = 8000
DIRECTORY = "."

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server():
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"✅ Server started successfully!")
            print(f"🌐 Open your browser and go to: http://localhost:{PORT}")
            print(f"📁 Serving files from: {os.path.abspath(DIRECTORY)}")
            print(f"🔗 Direct link to your website: http://localhost:{PORT}/index.html")
            print(f"🛑 Press Ctrl+C to stop the server")
            print("-" * 60)
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}/index.html')
                print("🚀 Opening website in your default browser...")
            except:
                print("ℹ️  Could not auto-open browser. Please open the link manually.")
            
            print("-" * 60)
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Port {PORT} is already in use!")
            print(f"💡 Try a different port by editing this script, or stop the other server.")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    print("🚀 Starting HTTP Server for your website...")
    print("=" * 60)
    start_server()