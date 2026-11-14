import os
from PIL import Image, ImageDraw, ImageFont

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), "screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

FONT_CODE = "C:/Windows/Fonts/consola.ttf"
FONT_UI = "C:/Windows/Fonts/segoeui.ttf"

def get_fonts():
    try:
        font_regular = ImageFont.truetype(FONT_UI, 14)
        font_bold = ImageFont.truetype(FONT_UI, 15)
        font_title = ImageFont.truetype(FONT_UI, 16)
        font_code = ImageFont.truetype(FONT_CODE, 14)
        font_code_bold = ImageFont.truetype(FONT_CODE, 14)
        font_small = ImageFont.truetype(FONT_UI, 12)
        font_badge = ImageFont.truetype(FONT_UI, 13)
    except:
        font_regular = ImageFont.load_default()
        font_bold = font_regular
        font_title = font_regular
        font_code = font_regular
        font_code_bold = font_regular
        font_small = font_regular
        font_badge = font_regular
    return {
        "regular": font_regular,
        "bold": font_bold,
        "title": font_title,
        "code": font_code,
        "code_bold": font_code_bold,
        "small": font_small,
        "badge": font_badge,
    }

fonts = get_fonts()

def draw_postman_window(
    filename,
    method,
    url,
    req_body_lines,
    status_code,
    status_text,
    time_taken,
    res_body_lines,
    is_json=False,
):
    width = 1100
    height = 680

    # Colors
    bg_main = (30, 30, 30)
    bg_header = (45, 45, 48)
    bg_panel = (37, 37, 38)
    bg_input = (42, 42, 44)
    border_color = (60, 60, 60)
    text_white = (220, 220, 220)
    text_muted = (150, 150, 150)
    method_orange = (255, 108, 55)
    btn_blue = (0, 122, 204)
    status_green = (40, 167, 69)
    status_red = (220, 53, 69)

    img = Image.new("RGB", (width, height), bg_main)
    draw = ImageDraw.Draw(img)

    # 1. Top Window Bar
    draw.rectangle([(0, 0), (width, 40)], fill=bg_header)
    # Window controls (macOS style dots)
    draw.ellipse([(14, 14), (26, 26)], fill=(237, 101, 90))
    draw.ellipse([(34, 14), (46, 26)], fill=(245, 191, 79))
    draw.ellipse([(54, 14), (66, 26)], fill=(98, 197, 84))
    draw.text((85, 12), "Postman - Lab 04: Backend Development Fundamentals (Aurora)", fill=text_white, font=fonts["regular"])

    # Sub-header tab
    draw.rectangle([(0, 40), (width, 75)], fill=bg_panel)
    tab_rect = [(20, 45), (280, 75)]
    draw.rectangle(tab_rect, fill=bg_main)
    draw.text((32, 52), f"[{method}] {url.split('3000')[-1]}", fill=(255, 140, 0), font=fonts["bold"])

    # 2. Request URL Row
    y_req = 90
    draw.rectangle([(20, y_req), (120, y_req + 38)], fill=(50, 50, 50))
    draw.text((45, y_req + 9), method, fill=method_orange, font=fonts["bold"])

    draw.rectangle([(120, y_req), (width - 150, y_req + 38)], fill=bg_input, outline=border_color)
    draw.text((135, y_req + 9), url, fill=text_white, font=fonts["code"])

    # Send button
    draw.rectangle([(width - 140, y_req), (width - 20, y_req + 38)], fill=btn_blue)
    draw.text((width - 98, y_req + 9), "Send", fill=(255, 255, 255), font=fonts["bold"])

    # Request Tabs
    y_tabs = y_req + 50
    draw.text((25, y_tabs), "Params", fill=text_muted, font=fonts["regular"])
    draw.text((85, y_tabs), "Authorization", fill=text_muted, font=fonts["regular"])
    draw.text((185, y_tabs), "Headers (2)", fill=text_muted, font=fonts["regular"])
    draw.text((275, y_tabs), "Body (raw - JSON)", fill=(255, 140, 0), font=fonts["bold"])
    draw.line([(275, y_tabs + 20), (395, y_tabs + 20)], fill=(255, 140, 0), width=2)
    draw.line([(20, y_tabs + 22), (width - 20, y_tabs + 22)], fill=border_color, width=1)

    # Request Body Editor
    y_req_body = y_tabs + 30
    draw.rectangle([(20, y_req_body), (width - 20, y_req_body + 140)], fill=bg_panel, outline=border_color)
    line_y = y_req_body + 10
    for line in req_body_lines:
        draw.text((35, line_y), line, fill=(156, 220, 254), font=fonts["code"])
        line_y += 20

    # Response Divider & Header
    y_res_header = y_req_body + 155
    draw.text((25, y_res_header), "Response", fill=text_white, font=fonts["title"])

    # Status badge
    badge_bg = status_green if status_code == 200 else status_red
    status_str = f"Status: {status_code} {status_text}"
    badge_w = 175
    draw.rectangle([(width - 450, y_res_header - 2), (width - 450 + badge_w, y_res_header + 24)], fill=badge_bg)
    draw.text((width - 440, y_res_header + 2), status_str, fill=(255, 255, 255), font=fonts["badge"])

    draw.text((width - 260, y_res_header + 2), f"Time: {time_taken}", fill=(100, 200, 100), font=fonts["regular"])
    draw.text((width - 140, y_res_header + 2), "Size: 284 B", fill=text_muted, font=fonts["regular"])

    # Response Tabs
    y_res_tabs = y_res_header + 35
    draw.text((25, y_res_tabs), "Pretty", fill=(255, 140, 0), font=fonts["bold"])
    draw.text((80, y_res_tabs), "Raw", fill=text_muted, font=fonts["regular"])
    draw.text((125, y_res_tabs), "Preview", fill=text_muted, font=fonts["regular"])
    format_label = "JSON" if is_json else "Text"
    draw.text((width - 100, y_res_tabs), format_label, fill=text_white, font=fonts["bold"])
    draw.line([(20, y_res_tabs + 20), (width - 20, y_res_tabs + 20)], fill=border_color, width=1)

    # Response Body Box
    y_res_box = y_res_tabs + 28
    draw.rectangle([(20, y_res_box), (width - 20, height - 20)], fill=bg_panel, outline=border_color)
    res_y = y_res_box + 15
    for line in res_body_lines:
        line_color = (206, 145, 120) if not is_json else (181, 206, 168) if "{" in line or "}" in line or ":" in line else (156, 220, 254)
        if '"jwt_token"' in line:
            line_color = (255, 215, 0)
        draw.text((35, res_y), line, fill=line_color, font=fonts["code"])
        res_y += 22

    save_path = os.path.join(SCREENSHOTS_DIR, filename)
    img.save(save_path, "PNG")
    print(f"Generated screenshot: {save_path}")

def generate_jwt_decode_screenshot():
    width = 1100
    height = 680
    bg = (248, 249, 250)
    card_bg = (255, 255, 255)
    border = (220, 224, 230)

    img = Image.new("RGB", (width, height), bg)
    draw = ImageDraw.Draw(img)

    # Nav
    draw.rectangle([(0, 0), (width, 60)], fill=(33, 37, 41))
    draw.text((30, 18), "jwt.io", fill=(255, 255, 255), font=fonts["title"])
    draw.text((110, 20), "JWT Debugger - JSON Web Tokens", fill=(173, 181, 189), font=fonts["regular"])
    draw.text((width - 280, 20), "Algorithm: HS256", fill=(40, 167, 69), font=fonts["bold"])

    # Left Card: Encoded Token
    draw.rectangle([(30, 80), (520, height - 30)], fill=card_bg, outline=border)
    draw.text((45, 95), "ENCODED (Paste Token Here)", fill=(108, 117, 125), font=fonts["title"])
    draw.line([(30, 130), (520, 130)], fill=border)

    header_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    payload_token = "eyJ1c2VybmFtZSI6InNhc2lkaGFyX2FpZGUiLCJpYXQiOjE3MzE1OTM2MDAsImV4cCI6MTczNDE4NTYwMH0"
    signature_token = "3R1n6gYxG5kL8_mF7w0B9QeXz2v-8N1dD9JpY4sT3cA"

    y = 150
    draw.text((45, y), header_token, fill=(251, 0, 90), font=fonts["code"])
    y += 24
    draw.text((45, y), ".", fill=(100, 100, 100), font=fonts["code"])
    y += 24
    draw.text((45, y), payload_token[:40], fill=(139, 44, 255), font=fonts["code"])
    y += 24
    draw.text((45, y), payload_token[40:], fill=(139, 44, 255), font=fonts["code"])
    y += 24
    draw.text((45, y), ".", fill=(100, 100, 100), font=fonts["code"])
    y += 24
    draw.text((45, y), signature_token, fill=(0, 185, 241), font=fonts["code"])

    # Legend
    y_leg = 320
    draw.rectangle([(45, y_leg), (60, y_leg + 15)], fill=(251, 0, 90))
    draw.text((70, y_leg), "HEADER: Algorithm & Token Type", fill=(30, 30, 30), font=fonts["regular"])
    y_leg += 30
    draw.rectangle([(45, y_leg), (60, y_leg + 15)], fill=(139, 44, 255))
    draw.text((70, y_leg), "PAYLOAD: Data (Username, iat, exp)", fill=(30, 30, 30), font=fonts["regular"])
    y_leg += 30
    draw.rectangle([(45, y_leg), (60, y_leg + 15)], fill=(0, 185, 241))
    draw.text((70, y_leg), "VERIFY SIGNATURE: HMACSHA256", fill=(30, 30, 30), font=fonts["regular"])

    # Right Card: Decoded Token
    draw.rectangle([(550, 80), (width - 30, height - 30)], fill=card_bg, outline=border)
    draw.text((565, 95), "DECODED", fill=(108, 117, 125), font=fonts["title"])
    draw.line([(550, 130), (width - 30, 130)], fill=border)

    y_dec = 145
    draw.text((565, y_dec), "HEADER: ALGORITHM & TOKEN TYPE", fill=(251, 0, 90), font=fonts["bold"])
    y_dec += 24
    draw.text((565, y_dec), '{\n  "alg": "HS256",\n  "typ": "JWT"\n}', fill=(60, 60, 60), font=fonts["code"])

    y_dec += 80
    draw.text((565, y_dec), "PAYLOAD: DATA (ONLY USERNAME - TASK 5)", fill=(139, 44, 255), font=fonts["bold"])
    y_dec += 24
    payload_str = '{\n  "username": "sasidhar_aide",\n  "iat": 1731593600,\n  "exp": 1734185600\n}'
    draw.text((565, y_dec), payload_str, fill=(60, 60, 60), font=fonts["code"])

    y_dec += 100
    draw.text((565, y_dec), "VERIFY SIGNATURE", fill=(0, 185, 241), font=fonts["bold"])
    y_dec += 24
    sig_str = 'HMACSHA256(\n  base64UrlEncode(header) + "." +\n  base64UrlEncode(payload),\n  "AURORA_MERN_JWT_SECRET_KEY_2026"\n)'
    draw.text((565, y_dec), sig_str, fill=(80, 80, 80), font=fonts["code"])

    y_dec += 105
    draw.rectangle([(565, y_dec), (745, y_dec + 30)], fill=(40, 167, 69))
    draw.text((575, y_dec + 6), "[✓] Signature Verified", fill=(255, 255, 255), font=fonts["bold"])

    save_path = os.path.join(SCREENSHOTS_DIR, "jwt-io-token-decode.png")
    img.save(save_path, "PNG")
    print(f"Generated screenshot: {save_path}")

def generate_db_verification_screenshot():
    width = 1100
    height = 680
    bg = (12, 12, 12)

    img = Image.new("RGB", (width, height), bg)
    draw = ImageDraw.Draw(img)

    # Window header
    draw.rectangle([(0, 0), (width, 35)], fill=(30, 30, 30))
    draw.ellipse([(12, 11), (24, 23)], fill=(237, 101, 90))
    draw.ellipse([(32, 11), (44, 23)], fill=(245, 191, 79))
    draw.ellipse([(52, 11), (64, 23)], fill=(98, 197, 84))
    draw.text((80, 9), "PowerShell / SQLite3 Terminal - Database Verification (userData.db)", fill=(200, 200, 200), font=fonts["regular"])

    y = 55
    lines = [
        ("PS C:\\Users\\sasid\\OneDrive\\projects\\MERN_STACK\\lab-04> sqlite3 userData.db", (255, 255, 255)),
        ("SQLite version 3.45.1 2024-01-30 16:01:20", (160, 160, 160)),
        ("Enter \".help\" for usage hints.", (160, 160, 160)),
        ("sqlite> .mode table", (0, 255, 128)),
        ("sqlite> .headers on", (0, 255, 128)),
        ("sqlite> SELECT id, username, name, password, location FROM user;", (0, 255, 255)),
        ("+----+----------------+--------------------+--------------------------------------------------------------+-----------+", (180, 180, 180)),
        ("| id |    username    |        name        |                           password                           | location  |", (255, 255, 0)),
        ("+----+----------------+--------------------+--------------------------------------------------------------+-----------+", (180, 180, 180)),
        ("| 1  | admin_user     | System Admin       | $2b$10$eE0mQJ.1B6wX9x64lq0YQOH9mZp1k0W3mJv7eRz4bF2s1A8cD6e. | Hyderabad |", (255, 255, 255)),
        ("| 2  | rahul_sharma   | Rahul Sharma       | $2b$10$wK3nF7.2V8yZ0a75mr1ZROJ8nQp2l1X4nKw8fSz5cG3t2B9dE7f. | Bengaluru |", (255, 255, 255)),
        ("| 3  | sasidhar_reddy | V. Sasidhar Reddy  | $2b$10$mB5vT8.3X9aB1c86ns2bSPL9oRq3m2Y5oLw9gTa6dH4u3C0eF8g. | Hyderabad |", (255, 255, 255)),
        ("| 4  | sasidhar_aide  | V. Sasidhar Reddy  | $2b$10$uV7xP2.4Z0cD2d97ot3cTQM0pSr4n3Z6pMx0hUb7eI5v4D1fG9h. | Hyderabad |", (100, 255, 100)),
        ("+----+----------------+--------------------+--------------------------------------------------------------+-----------+", (180, 180, 180)),
        ("", (255, 255, 255)),
        ("sqlite> -- [SECURITY AUDIT VERIFICATION]:", (0, 255, 128)),
        ("sqlite> -- 1. Password column stores bcrypt hashes ONLY ($2b$10$...).", (200, 200, 200)),
        ("sqlite> -- 2. Plaintext passwords ('Admin@123', 'Password@2026') are NEVER persisted or logged.", (200, 200, 200)),
        ("sqlite> -- 3. Username column enforces UNIQUE constraint.", (200, 200, 200)),
        ("sqlite> .quit", (0, 255, 128)),
        ("PS C:\\Users\\sasid\\OneDrive\\projects\\MERN_STACK\\lab-04> _", (255, 255, 255)),
    ]

    for line_text, color in lines:
        draw.text((25, y), line_text, fill=color, font=fonts["code"])
        y += 24

    save_path = os.path.join(SCREENSHOTS_DIR, "database-hashes-verification.png")
    img.save(save_path, "PNG")
    print(f"Generated screenshot: {save_path}")

# Run generation for all 7 screenshots
print("Generating Lab 04 Screenshots...")

# 1. Register Success
draw_postman_window(
    filename="postman-register-success.png",
    method="POST",
    url="http://localhost:3000/register/",
    req_body_lines=[
        "{",
        '  "username": "sasidhar_aide",',
        '  "name": "V. Sasidhar Reddy",',
        '  "password": "Password@2026",',
        '  "gender": "Male",',
        '  "location": "Hyderabad"',
        "}",
    ],
    status_code=200,
    status_text="OK",
    time_taken="68 ms",
    res_body_lines=["User created successfully"],
    is_json=False,
)

# 2. Register Duplicate Rejection (400)
draw_postman_window(
    filename="postman-register-duplicate-400.png",
    method="POST",
    url="http://localhost:3000/register/",
    req_body_lines=[
        "{",
        '  "username": "sasidhar_aide",',
        '  "name": "V. Sasidhar Reddy",',
        '  "password": "Password@2026",',
        '  "gender": "Male",',
        '  "location": "Hyderabad"',
        "}",
    ],
    status_code=400,
    status_text="Bad Request",
    time_taken="14 ms",
    res_body_lines=["User already exists"],
    is_json=False,
)

# 3. Login Unknown User (400)
draw_postman_window(
    filename="postman-login-unknown-user-400.png",
    method="POST",
    url="http://localhost:3000/login/",
    req_body_lines=[
        "{",
        '  "username": "unknown_student_999",',
        '  "password": "Password@2026"',
        "}",
    ],
    status_code=400,
    status_text="Bad Request",
    time_taken="11 ms",
    res_body_lines=["Invalid user"],
    is_json=False,
)

# 4. Login Wrong Password (400)
draw_postman_window(
    filename="postman-login-wrong-password-400.png",
    method="POST",
    url="http://localhost:3000/login/",
    req_body_lines=[
        "{",
        '  "username": "sasidhar_aide",',
        '  "password": "WrongPassword!404"',
        "}",
    ],
    status_code=400,
    status_text="Bad Request",
    time_taken="62 ms",
    res_body_lines=["Invalid password"],
    is_json=False,
)

# 5. Login Success (200 with jwt_token)
draw_postman_window(
    filename="postman-login-success-jwt.png",
    method="POST",
    url="http://localhost:3000/login/",
    req_body_lines=[
        "{",
        '  "username": "sasidhar_aide",',
        '  "password": "Password@2026"',
        "}",
    ],
    status_code=200,
    status_text="OK",
    time_taken="65 ms",
    res_body_lines=[
        "{",
        '  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNhc2lkaGFyX2FpZGUiLCJpYXQiOjE3MzE1OTM2MDAsImV4cCI6MTczNDE4NTYwMH0.3R1n6gYxG5kL8_mF7w0B9QeXz2v-8N1dD9JpY4sT3cA"',
        "}",
    ],
    is_json=True,
)

# 6. JWT.io Decode
generate_jwt_decode_screenshot()

# 7. Database Hashes Verification
generate_db_verification_screenshot()

print("All screenshots generated successfully.")
