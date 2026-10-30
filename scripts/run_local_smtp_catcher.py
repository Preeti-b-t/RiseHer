#!/usr/bin/env python3
"""
RiseHer Local SMTP Test Server (Port 1025)
Zero-dependency SMTP server for receiving real email OTP deliveries locally.
Use this for offline testing or when external SMTP credentials are not yet configured.

To use:
1. In .env set:
   EMAIL_HOST=127.0.0.1
   EMAIL_PORT=1025
   EMAIL_USERNAME=test
   EMAIL_PASSWORD=test
   EMAIL_USE_TLS=False

2. Run this script in a terminal:
   python3 scripts/run_local_smtp_catcher.py

3. All OTP emails sent through RiseHer will be received here in real time!
"""

import sys
import json
import socket
import threading
from datetime import datetime
from email import message_from_bytes
from pathlib import Path

HOST = "127.0.0.1"
PORT = 1025
OUT_FILE = Path(__file__).resolve().parent.parent / "backend" / "latest_received_email.json"

def handle_client(conn, addr):
    try:
        conn.sendall(b"220 RiseHer-Local-SMTP-Server Python ESMTP Service Ready\r\n")
        data = b""
        in_data_mode = False
        mail_from = ""
        rcpt_to = []
        raw_email = b""

        while True:
            line = b""
            while not line.endswith(b"\r\n"):
                chunk = conn.recv(1024)
                if not chunk:
                    return
                line += chunk

            if in_data_mode:
                raw_email += line
                if line.strip() == b".":
                    in_data_mode = False
                    conn.sendall(b"250 2.0.0 OK message queued for delivery\r\n")

                    # Parse email message
                    parsed = message_from_bytes(raw_email)
                    subject = parsed.get("Subject", "(No Subject)")
                    from_addr = parsed.get("From", mail_from)
                    to_addr = parsed.get("To", ", ".join(rcpt_to))

                    body = ""
                    if parsed.is_multipart():
                        for part in parsed.walk():
                            if part.get_content_type() == "text/plain":
                                body = part.get_payload(decode=True).decode("utf-8", errors="ignore")
                                break
                    else:
                        body = parsed.get_payload(decode=True).decode("utf-8", errors="ignore")

                    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    print("\n" + "=" * 70)
                    print(f"📧 [REAL LOCAL SMTP RECEIVED EMAIL] at {timestamp}")
                    print(f"   From:    {from_addr}")
                    print(f"   To:      {to_addr}")
                    print(f"   Subject: {subject}")
                    print("-" * 70)
                    print(body.strip())
                    print("=" * 70 + "\n")

                    # Record to JSON file
                    OUT_FILE.write_text(json.dumps({
                        "timestamp": timestamp,
                        "from": from_addr,
                        "to": to_addr,
                        "subject": subject,
                        "body": body.strip()
                    }, indent=2), encoding="utf-8")
                continue

            cmd_upper = line.strip().upper()
            if cmd_upper.startswith(b"HELO") or cmd_upper.startswith(b"EHLO"):
                conn.sendall(b"250-RiseHer-Local-SMTP-Server\r\n250-SIZE 10485760\r\n250-8BITMIME\r\n250 HELP\r\n")
            elif cmd_upper.startswith(b"MAIL FROM:"):
                mail_from = line.decode("utf-8", errors="ignore").split(":", 1)[1].strip()
                conn.sendall(b"250 2.1.0 Sender OK\r\n")
            elif cmd_upper.startswith(b"RCPT TO:"):
                recipient = line.decode("utf-8", errors="ignore").split(":", 1)[1].strip()
                rcpt_to.append(recipient)
                conn.sendall(b"250 2.1.5 Recipient OK\r\n")
            elif cmd_upper == b"DATA":
                in_data_mode = True
                raw_email = b""
                conn.sendall(b"354 Start mail input; end with <CRLF>.<CRLF>\r\n")
            elif cmd_upper == b"RSET":
                mail_from = ""
                rcpt_to = []
                conn.sendall(b"250 2.0.0 Reset OK\r\n")
            elif cmd_upper == b"NOOP":
                conn.sendall(b"250 2.0.0 OK\r\n")
            elif cmd_upper == b"QUIT":
                conn.sendall(b"221 2.0.0 Service closing transmission channel\r\n")
                break
            else:
                conn.sendall(b"250 2.0.0 Command accepted\r\n")
    except Exception as e:
        pass
    finally:
        conn.close()

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server.bind((HOST, PORT))
    except Exception as e:
        print(f"Error binding to {HOST}:{PORT}: {e}")
        sys.exit(1)

    server.listen(5)
    print(f"🌟 RiseHer Local SMTP Mail Catcher listening on http://{HOST}:{PORT}")
    print(f"   Configure .env with EMAIL_HOST={HOST} and EMAIL_PORT={PORT}")
    print("   Waiting for real SMTP OTP emails...\n")

    try:
        while True:
            conn, addr = server.accept()
            t = threading.Thread(target=handle_client, args=(conn, addr), daemon=True)
            t.start()
    except KeyboardInterrupt:
        print("\nStopping SMTP server.")
    finally:
        server.close()

if __name__ == "__main__":
    main()
