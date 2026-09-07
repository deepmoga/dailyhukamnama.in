"""
generate_poster.py  –  Daily Hukamnama Poster Generator (Pillow only, no PyMuPDF/PDF)
Usage:
  python generate_poster.py <date_str> <output_path> [gurmukhi_text]
"""

import sys
import os
import textwrap
import datetime
from PIL import Image, ImageDraw, ImageFont

# Asset paths (relative to project root)
FRAME_PATH = os.path.join("public", "assets", "frame.png")
LOGO_PATH  = os.path.join("public", "assets", "Logo.png")

# Windows font directory
FONT_DIR = os.path.join(os.environ.get("SystemRoot", "C:/Windows"), "Fonts")

# Bundled Gurmukhi font (downloaded from Google Fonts)
GURMUKHI_FONT_PATH = os.path.join("public", "assets", "fonts", "NotoSansGurmukhi.ttf")

# Canvas size (portrait social-media format)
CANVAS_W = 1080
CANVAS_H = 1350

# Brand colors
COLOR_GOLD   = "#b8962e"
COLOR_DARK   = "#1a0a00"
COLOR_ACCENT = "#dd9933"


def load_font(name, size):
    """Load a font from Windows Fonts dir; fall back to PIL default."""
    path = os.path.join(FONT_DIR, name)
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    # Try fallback fonts
    for fallback in ["arial.ttf", "calibri.ttf", "segoeui.ttf"]:
        p2 = os.path.join(FONT_DIR, fallback)
        if os.path.exists(p2):
            try:
                return ImageFont.truetype(p2, size)
            except Exception:
                pass
    try:
        return ImageFont.load_default(size=size)
    except Exception:
        return ImageFont.load_default()


def draw_centered(draw, text, y, font, fill, max_w=None):
    """Draw centered text. Returns y after text block."""
    if not text:
        return y
    max_w = max_w or CANVAS_W
    try:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
    except Exception:
        tw = len(text) * 14
        th = 20
    x = (CANVAS_W - min(tw, max_w)) / 2
    draw.text((x, y), text, fill=fill, font=font)
    return y + th + 10


def generate_poster(date_str=None, output_path="public/uploads/test_poster.jpg", gurmukhi_text=""):
    # Ensure output dir exists
    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    if not date_str:
        date_str = datetime.datetime.now().strftime("%B %d, %Y - %A")

    # 1. Gradient background (warm cream → white)
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (255, 255, 255, 255))
    draw   = ImageDraw.Draw(canvas)
    for y in range(CANVAS_H):
        t = y / CANVAS_H
        r = int(255)
        g = int(248 * (1 - t) + 255 * t)
        b = int(225 * (1 - t) + 255 * t)
        draw.line([(0, y), (CANVAS_W, y)], fill=(r, g, b, 255))

    # 2. Gold border
    b = 22
    draw.rectangle([b, b, CANVAS_W - b, CANVAS_H - b], outline=COLOR_ACCENT, width=5)
    draw.rectangle([b + 9, b + 9, CANVAS_W - b - 9, CANVAS_H - b - 9], outline="#f0c060", width=1)

    # 3. Frame overlay
    if os.path.exists(FRAME_PATH):
        try:
            frame = Image.open(FRAME_PATH).convert("RGBA")
            frame = frame.resize((CANVAS_W, CANVAS_H), Image.Resampling.LANCZOS)
            canvas.alpha_composite(frame)
        except Exception as e:
            print(f"Warning: frame load failed: {e}")

    draw = ImageDraw.Draw(canvas)

    # 4. Load fonts
    f_date     = load_font("arial.ttf",    46)
    f_title_en = load_font("timesbd.ttf",  42)
    f_footer   = load_font("arialbd.ttf",  44)
    f_web      = load_font("arial.ttf",    36)

    # Use bundled Noto Sans Gurmukhi for Gurmukhi text
    def load_gurmukhi_font(size):
        if os.path.exists(GURMUKHI_FONT_PATH):
            try:
                return ImageFont.truetype(GURMUKHI_FONT_PATH, size)
            except Exception as e:
                print(f"Warning: Could not load Gurmukhi font: {e}")
        return load_font("arial.ttf", size)

    f_title_gu = load_gurmukhi_font(60)
    f_text     = load_gurmukhi_font(48)
    f_footer_gu = load_gurmukhi_font(36)

    # 5. Logo (top-right)
    logo_size = 148
    if os.path.exists(LOGO_PATH):
        try:
            logo = Image.open(LOGO_PATH).convert("RGBA")
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            canvas.alpha_composite(logo, (CANVAS_W - logo_size - 52, 52))
            draw = ImageDraw.Draw(canvas)
        except Exception as e:
            print(f"Warning: logo load failed: {e}")

    # 6. Header
    y = 70
    # Ik Onkar
    ik = "ੴ"
    try:
        bbox = draw.textbbox((0, 0), ik, font=f_title_gu)
        iw = bbox[2] - bbox[0]
        draw.text(((CANVAS_W - iw) / 2, y), ik, fill=COLOR_ACCENT, font=f_title_gu)
        y += (bbox[3] - bbox[1]) + 14
    except Exception:
        y += 70

    # Divider
    draw.line([(70, y), (CANVAS_W - 70, y)], fill=COLOR_ACCENT, width=2)
    y += 16

    # Date
    y = draw_centered(draw, date_str, y, f_date, COLOR_DARK)
    y += 6

    # Punjabi title
    y = draw_centered(draw, "ਰੋਜ਼ਾਨਾ ਹੁਕਮਨਾਮਾ", y, f_title_gu, COLOR_ACCENT)

    # English subtitle
    y = draw_centered(draw, "Sri Harmandir Sahib, Sri Amritsar", y, f_title_en, COLOR_DARK)
    y += 6

    # Divider
    draw.line([(70, y), (CANVAS_W - 70, y)], fill=COLOR_ACCENT, width=2)
    y += 26

    # 7. Gurmukhi text
    text_to_show = gurmukhi_text.strip() if gurmukhi_text else "ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ"
    lines = text_to_show.split("\n")
    max_y = CANVAS_H - 230

    for line in lines:
        line = line.strip()
        if not line:
            y += 16
            continue
        if y >= max_y:
            try:
                dots_bbox = draw.textbbox((0, 0), "...", font=f_text)
                draw.text(((CANVAS_W - (dots_bbox[2] - dots_bbox[0])) / 2, y), "...", fill=COLOR_DARK, font=f_text)
            except Exception:
                pass
            break

        # Estimate chars per line (approximate)
        try:
            sample_bbox = draw.textbbox((0, 0), "ੴ", font=f_text)
            char_w = max(sample_bbox[2] - sample_bbox[0], 1)
        except Exception:
            char_w = 30
        max_chars = max(int((CANVAS_W - 140) / char_w), 6)

        # Wrap
        wrapped_lines = textwrap.wrap(line, width=max_chars) or [line]
        for wl in wrapped_lines:
            if y >= max_y:
                break
            try:
                bbox = draw.textbbox((0, 0), wl, font=f_text)
                tw = bbox[2] - bbox[0]
                th = bbox[3] - bbox[1]
                draw.text(((CANVAS_W - tw) / 2, y), wl, fill=COLOR_DARK, font=f_text)
                y += th + 12
            except Exception:
                y += 52
        y += 6

    # 8. Footer
    fy = CANVAS_H - 175
    draw.line([(70, fy), (CANVAS_W - 70, fy)], fill=COLOR_ACCENT, width=2)
    fy += 18

    fy = draw_centered(draw, "www.dailyhukamnama.in", fy, f_footer, COLOR_ACCENT)
    fy = draw_centered(draw, "ਰੋਜ਼ਾਨਾ ਹੁਕਮਨਾਮਾ, ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ", fy, f_footer_gu, COLOR_DARK)

    # 9. Save
    rgb = canvas.convert("RGB")
    rgb.save(output_path, "JPEG", quality=92, optimize=True)
    print(f"Poster successfully generated at {output_path}")
    return output_path


if __name__ == "__main__":
    import base64
    date_arg     = sys.argv[1] if len(sys.argv) > 1 else None
    out_arg      = sys.argv[2] if len(sys.argv) > 2 else "public/uploads/test_poster.jpg"
    gurmukhi_b64 = sys.argv[3] if len(sys.argv) > 3 else ""
    # Decode base64-encoded gurmukhi text (passed from Node.js to avoid shell quoting issues)
    if gurmukhi_b64:
        try:
            gurmukhi_arg = base64.b64decode(gurmukhi_b64).decode("utf-8")
        except Exception:
            gurmukhi_arg = gurmukhi_b64
    else:
        gurmukhi_arg = ""
    generate_poster(date_str=date_arg, output_path=out_arg, gurmukhi_text=gurmukhi_arg)

