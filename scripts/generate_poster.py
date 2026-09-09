"""
generate_poster.py  –  Daily Hukamnama Poster Generator (2-Page Newspaper Template)
Generates high-resolution social & archival posters on the user-provided bg.jpg template.
Matches reference layout:
 - Page 1: Header (English title & date), Punjabi Raag, Gurbani Mukhwak, Gurmukhi Date & Ang, Punjabi Viakhya
 - Page 2: Punjabi Viakhya overflow, English Translation heading, English Raag, English Translation body, English Date & Page
"""

import os
import sys
import json
import base64
import argparse
from PIL import Image, ImageDraw, ImageFont

if sys.platform.startswith("win"):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS_DIR = os.path.join(BASE_DIR, "public", "assets", "fonts")
WIN_FONTS = os.path.join(os.environ.get("SystemRoot", "C:/Windows"), "Fonts")

def find_bg_image():
    candidates = [
        os.path.join(BASE_DIR, "assets", "images", "bg.jpg"),
        os.path.join(BASE_DIR, "public", "assets", "images", "bg.jpg"),
        os.path.join(BASE_DIR, "public", "assets", "bg.jpg"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def get_font(family, size, bold=False):
    """
    Font loader prioritized for self-contained bundled fonts in public/assets/fonts/
    with fallbacks for Windows and Linux.
    """
    if family == "gurmukhi_serif":
        names = ["NotoSerifGurmukhi-Bold.ttf" if bold else "NotoSerifGurmukhi-Regular.ttf",
                 "NotoSerifGurmukhi-Variable.ttf",
                 "NotoSansGurmukhi-Bold.ttf" if bold else "NotoSansGurmukhi-Regular.ttf",
                 "NotoSansGurmukhi.ttf"]
        for name in names:
            p = os.path.join(FONTS_DIR, name)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, int(round(size)))
                except Exception:
                    pass
    elif family == "serif":
        names = ["timesbd.ttf" if bold else "times.ttf",
                 "georgiab.ttf" if bold else "georgia.ttf",
                 "NotoSerif-Bold.ttf" if bold else "NotoSerif-Regular.ttf"]
        for name in names:
            p_local = os.path.join(FONTS_DIR, name)
            if os.path.exists(p_local):
                try:
                    return ImageFont.truetype(p_local, int(round(size)))
                except Exception:
                    pass
            p_win = os.path.join(WIN_FONTS, name)
            if os.path.exists(p_win):
                try:
                    return ImageFont.truetype(p_win, int(round(size)))
                except Exception:
                    pass
            for linux_dir in ["/usr/share/fonts/truetype/msttcorefonts", "/usr/share/fonts/truetype/liberation", "/usr/share/fonts"]:
                p_linux = os.path.join(linux_dir, name)
                if os.path.exists(p_linux):
                    try:
                        return ImageFont.truetype(p_linux, int(round(size)))
                    except Exception:
                        pass
    try:
        return ImageFont.load_default(size=int(round(size)))
    except Exception:
        return ImageFont.load_default()

def wrap_words(draw, text, font, max_width):
    if not text:
        return []
    cleaned = " ".join(text.split())
    words = cleaned.split(" ")
    lines = []
    current_line = []
    for word in words:
        test_line = " ".join(current_line + [word])
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if (bbox[2] - bbox[0]) <= max_width:
            current_line.append(word)
        else:
            if current_line:
                lines.append(current_line)
                current_line = [word]
            else:
                lines.append([word])
                current_line = []
    if current_line:
        lines.append(current_line)
    return lines

def draw_justified(draw, words, x, y, font, fill, target_w, is_last=False):
    if not words:
        return
    if is_last or len(words) == 1:
        draw.text((x, y), " ".join(words), fill=fill, font=font)
        return
    
    word_widths = [draw.textbbox((0, 0), w, font=font)[2] - draw.textbbox((0, 0), w, font=font)[0] for w in words]
    total_w = sum(word_widths)
    space_needed = target_w - total_w
    num_spaces = len(words) - 1
    
    space_bbox = draw.textbbox((0, 0), " ", font=font)
    normal_space_w = max(space_bbox[2] - space_bbox[0], 1)
    avg_space = space_needed / num_spaces if num_spaces > 0 else normal_space_w
    
    if avg_space > normal_space_w * 3.0:
        draw.text((x, y), " ".join(words), fill=fill, font=font)
        return

    curr_x = x
    for w, ww in zip(words, word_widths):
        draw.text((curr_x, y), w, fill=fill, font=font)
        curr_x += ww + avg_space

def generate_posters(payload):
    bg_file = find_bg_image()
    if not bg_file:
        raise FileNotFoundError("Background template bg.jpg not found in assets/images/bg.jpg or public/assets/images/bg.jpg")

    TARGET_W, TARGET_H = 724, 1024
    LEFT_X = 54
    RIGHT_X = 670
    CONTENT_W = RIGHT_X - LEFT_X  # 616px
    CENTER_X = TARGET_W / 2

    f_header_title = get_font("serif", 19, bold=True)
    f_header_date  = get_font("serif", 14, bold=True)
    f_raag         = get_font("gurmukhi_serif", 16, bold=True)
    f_mukhwak      = get_font("gurmukhi_serif", 13.5, bold=False)
    f_ang_date     = get_font("gurmukhi_serif", 13.5, bold=True)
    f_viakhya_head = get_font("gurmukhi_serif", 14, bold=True)
    f_viakhya_body = get_font("gurmukhi_serif", 13.8, bold=False)

    f_eng_head     = get_font("serif", 14.5, bold=True)
    f_eng_raag     = get_font("serif", 13.5, bold=True)
    f_eng_body     = get_font("serif", 12.8, bold=False)
    f_eng_date     = get_font("serif", 13.5, bold=True)

    # -------------------------------------------------------------
    # PAGE 1 RENDER
    # -------------------------------------------------------------
    bg1 = Image.open(bg_file).convert("RGB").resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    draw1 = ImageDraw.Draw(bg1)

    h_title = "Today's Hukamnama from Sri Darbar Sahib, Sri Amritsar."
    bbox = draw1.textbbox((0, 0), h_title, font=f_header_title)
    draw1.text((CENTER_X - (bbox[2] - bbox[0]) / 2, 58), h_title, fill="#9e1b1b", font=f_header_title)

    h_date = payload.get("date_str") or "Today's Daily Hukamnama"
    bbox = draw1.textbbox((0, 0), h_date, font=f_header_date)
    draw1.text((CENTER_X - (bbox[2] - bbox[0]) / 2, 84), h_date, fill="#742a1a", font=f_header_date)

    y = 122
    raag_punjabi = payload.get("raag_punjabi", "").strip()
    if raag_punjabi:
        bbox = draw1.textbbox((0, 0), raag_punjabi, font=f_raag)
        draw1.text((CENTER_X - (bbox[2] - bbox[0]) / 2, y), raag_punjabi, fill="#000000", font=f_raag)
        y += (bbox[3] - bbox[1]) + 14
    else:
        y += 10

    mukhwak = payload.get("mukhwak", "").strip()
    LINE_H_MUKHWAK = 25.5
    if mukhwak:
        mukhwak_lines = wrap_words(draw1, mukhwak, f_mukhwak, CONTENT_W)
        for idx, line_words in enumerate(mukhwak_lines):
            is_last = (idx == len(mukhwak_lines) - 1)
            draw_justified(draw1, line_words, LEFT_X, y, f_mukhwak, "#000000", CONTENT_W, is_last=is_last)
            y += LINE_H_MUKHWAK

    y += 18
    punjabi_date_str = payload.get("punjabi_date_str", "").strip()
    if punjabi_date_str:
        bbox = draw1.textbbox((0, 0), punjabi_date_str, font=f_ang_date)
        draw1.text((CENTER_X - (bbox[2] - bbox[0]) / 2, y), punjabi_date_str, fill="#000000", font=f_ang_date)
        y += (bbox[3] - bbox[1]) + 20

    viakhya = payload.get("viakhya", "").strip()
    overflow_viakhya = []
    LINE_H_VIAKHYA = 23.6
    MAX_PAGE1_Y = 890

    if viakhya:
        viakhya_head = "ਪੰਜਾਬੀ ਵਿਆਖਿਆ:"
        draw1.text((LEFT_X, y), viakhya_head, fill="#000000", font=f_viakhya_head)
        bbox = draw1.textbbox((LEFT_X, y), viakhya_head, font=f_viakhya_head)
        draw1.line([(LEFT_X, bbox[3] + 2), (bbox[2], bbox[3] + 2)], fill="#000000", width=1)
        y += 32

        viakhya_lines = wrap_words(draw1, viakhya, f_viakhya_body, CONTENT_W)
        for idx, line_words in enumerate(viakhya_lines):
            if y + LINE_H_VIAKHYA > MAX_PAGE1_Y:
                overflow_viakhya = viakhya_lines[idx:]
                break
            is_last = (idx == len(viakhya_lines) - 1)
            draw_justified(draw1, line_words, LEFT_X, y, f_viakhya_body, "#111111", CONTENT_W, is_last=is_last)
            y += LINE_H_VIAKHYA

    out_p1 = payload.get("output_p1") or os.path.join(BASE_DIR, "public", "uploads", "test_poster_p1.jpg")
    os.makedirs(os.path.dirname(os.path.abspath(out_p1)), exist_ok=True)
    bg1.save(out_p1, quality=95)
    print(f"Page 1 successfully saved: {out_p1}")

    # -------------------------------------------------------------
    # PAGE 2 RENDER (if English or Viakhya overflow exists)
    # -------------------------------------------------------------
    english = payload.get("english", "").strip()
    out_p2 = payload.get("output_p2")
    if not out_p2:
        base_part, ext = os.path.splitext(out_p1)
        if base_part.endswith("-1"):
            out_p2 = f"{base_part[:-2]}-2{ext}"
        else:
            out_p2 = f"{base_part}-2{ext}"

    if english or overflow_viakhya:
        bg2 = Image.open(bg_file).convert("RGB").resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
        draw2 = ImageDraw.Draw(bg2)
        y2 = 62

        if overflow_viakhya:
            for idx, line_words in enumerate(overflow_viakhya):
                is_last = (idx == len(overflow_viakhya) - 1)
                draw_justified(draw2, line_words, LEFT_X, y2, f_viakhya_body, "#111111", CONTENT_W, is_last=is_last)
                y2 += LINE_H_VIAKHYA
            y2 += 22

        eng_head = "English Translation:"
        draw2.text((LEFT_X, y2), eng_head, fill="#000000", font=f_eng_head)
        bbox = draw2.textbbox((LEFT_X, y2), eng_head, font=f_eng_head)
        draw2.line([(LEFT_X, bbox[3] + 2), (bbox[2], bbox[3] + 2)], fill="#000000", width=1)
        y2 += 30

        raag_english = payload.get("raag_english", "").strip()
        if raag_english:
            bbox = draw2.textbbox((0, 0), raag_english, font=f_eng_raag)
            draw2.text((CENTER_X - (bbox[2] - bbox[0]) / 2, y2), raag_english, fill="#000000", font=f_eng_raag)
            y2 += 28

        if english:
            eng_lines = wrap_words(draw2, english, f_eng_body, CONTENT_W)
            LINE_H_ENG = 20.0
            for idx, line_words in enumerate(eng_lines):
                is_last = (idx == len(eng_lines) - 1)
                draw_justified(draw2, line_words, LEFT_X, y2, f_eng_body, "#111111", CONTENT_W, is_last=is_last)
                y2 += LINE_H_ENG

        english_date_str = payload.get("english_date_str", "").strip()
        if english_date_str:
            y2 += 24
            bbox = draw2.textbbox((0, 0), english_date_str, font=f_eng_date)
            draw2.text((CENTER_X - (bbox[2] - bbox[0]) / 2, y2), english_date_str, fill="#000000", font=f_eng_date)

        os.makedirs(os.path.dirname(os.path.abspath(out_p2)), exist_ok=True)
        bg2.save(out_p2, quality=95)
        print(f"Page 2 successfully saved: {out_p2}")
        return out_p1, out_p2

    return out_p1, None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Daily Hukamnama Poster Generator")
    parser.add_argument("--json", dest="json_data", help="Base64 or raw JSON string payload")
    parser.add_argument("--json-file", dest="json_file", help="Path to JSON file containing payload")
    parser.add_argument("args", nargs="*", help="Positional args: date_str, output_p1, [mukhwak_b64], [viakhya_b64], [english_b64], [output_p2]")

    parsed, unknown = parser.parse_known_args()

    payload = {}
    if parsed.json_file and os.path.exists(parsed.json_file):
        with open(parsed.json_file, "r", encoding="utf-8") as f:
            payload = json.load(f)
    elif parsed.json_data:
        raw_json = parsed.json_data
        try:
            raw_json = base64.b64decode(raw_json).decode("utf-8")
        except Exception:
            pass
        payload = json.loads(raw_json)
    elif parsed.args:
        date_arg = parsed.args[0] if len(parsed.args) > 0 else ""
        out_p1   = parsed.args[1] if len(parsed.args) > 1 else "public/uploads/test_poster.jpg"
        
        def safe_b64_decode(val):
            if not val:
                return ""
            try:
                return base64.b64decode(val).decode("utf-8")
            except Exception:
                return val

        mukhwak_arg = safe_b64_decode(parsed.args[2]) if len(parsed.args) > 2 else ""
        viakhya_arg = safe_b64_decode(parsed.args[3]) if len(parsed.args) > 3 else ""
        english_arg = safe_b64_decode(parsed.args[4]) if len(parsed.args) > 4 else ""
        out_p2      = parsed.args[5] if len(parsed.args) > 5 else None

        payload = {
            "date_str": date_arg,
            "output_p1": out_p1,
            "mukhwak": mukhwak_arg,
            "viakhya": viakhya_arg,
            "english": english_arg,
            "output_p2": out_p2
        }

    generate_posters(payload)
