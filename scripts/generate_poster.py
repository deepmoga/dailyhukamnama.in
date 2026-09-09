"""
generate_poster.py  –  Daily Hukamnama Poster Generator (2-Page Publication Template)
Generates high-resolution social & archival posters on the user-provided bg.jpg template.
Uses HarfBuzz (via uharfbuzz & freetype-py, or PIL with Raqm) for 100% authentic Gurmukhi complex text shaping (properly placing sihari ਿ, subjoined consonants, etc.).
"""

import os
import sys
import json
import base64
import argparse
from PIL import Image, ImageDraw, ImageFont, ImageColor, features

if sys.platform.startswith("win"):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

try:
    import uharfbuzz as hb
    import freetype
    HAS_HARFBUZZ = True
except ImportError:
    HAS_HARFBUZZ = False

PIL_HAS_RAQM = features.check('raqm')

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

def resolve_font_path(family, bold=False):
    if family == "gurmukhi_serif":
        names = [
            "NotoSerifGurmukhi-Bold.ttf" if bold else "NotoSerifGurmukhi-Regular.ttf",
            "NotoSerifGurmukhi-Variable.ttf",
            "NotoSansGurmukhi-Bold.ttf" if bold else "NotoSansGurmukhi-Regular.ttf",
            "NotoSansGurmukhi.ttf"
        ]
        for name in names:
            p = os.path.join(FONTS_DIR, name)
            if os.path.exists(p):
                return p
    elif family == "serif":
        names = [
            "timesbd.ttf" if bold else "times.ttf",
            "georgiab.ttf" if bold else "georgia.ttf",
            "NotoSerif-Bold.ttf" if bold else "NotoSerif-Regular.ttf"
        ]
        for name in names:
            p_local = os.path.join(FONTS_DIR, name)
            if os.path.exists(p_local):
                return p_local
            p_win = os.path.join(WIN_FONTS, name)
            if os.path.exists(p_win):
                return p_win
            for linux_dir in ["/usr/share/fonts/truetype/msttcorefonts", "/usr/share/fonts/truetype/liberation", "/usr/share/fonts"]:
                p_linux = os.path.join(linux_dir, name)
                if os.path.exists(p_linux):
                    return p_linux
    return None


class ShapedFont:
    def __init__(self, font_path, size, bold=False, fallback_path=None):
        self.font_path = font_path
        self.fallback_path = fallback_path
        self.size = size
        self.bold = bold
        self.pil_font = None
        self.ft_face = None
        self.hb_font = None
        self.fallback_ft_face = None
        self.fallback_hb_font = None

        if HAS_HARFBUZZ and font_path and os.path.exists(font_path):
            try:
                self.ft_face = freetype.Face(font_path)
                self.ft_face.set_char_size(int(round(size * 64)))
                with open(font_path, "rb") as f:
                    blob = hb.Blob(f.read())
                hb_face = hb.Face(blob)
                self.hb_font = hb.Font(hb_face)
                self.hb_font.scale = (int(round(size * 64)), int(round(size * 64)))
            except Exception as e:
                self.ft_face = None
                self.hb_font = None

        if HAS_HARFBUZZ and fallback_path and os.path.exists(fallback_path):
            try:
                self.fallback_ft_face = freetype.Face(fallback_path)
                self.fallback_ft_face.set_char_size(int(round(size * 64)))
                with open(fallback_path, "rb") as f:
                    f_blob = hb.Blob(f.read())
                f_hb_face = hb.Face(f_blob)
                self.fallback_hb_font = hb.Font(f_hb_face)
                self.fallback_hb_font.scale = (int(round(size * 64)), int(round(size * 64)))
            except Exception:
                self.fallback_ft_face = None
                self.fallback_hb_font = None

        if font_path and os.path.exists(font_path):
            try:
                if PIL_HAS_RAQM:
                    self.pil_font = ImageFont.truetype(font_path, int(round(size)), layout_engine=ImageFont.Layout.RAQM)
                else:
                    self.pil_font = ImageFont.truetype(font_path, int(round(size)))
            except Exception:
                try:
                    self.pil_font = ImageFont.truetype(font_path, int(round(size)))
                except Exception:
                    self.pil_font = ImageFont.load_default()
        else:
            self.pil_font = ImageFont.load_default()

    def split_runs(self, text):
        if not self.fallback_hb_font or not text:
            return [(text, True)]
        runs = []
        curr = []
        is_gur = None
        for ch in text:
            g = (0x0A00 <= ord(ch) <= 0x0A7F) or ch in '।॥ '
            if is_gur is None:
                is_gur = g
                curr.append(ch)
            elif is_gur == g:
                curr.append(ch)
            else:
                runs.append((''.join(curr), is_gur))
                curr = [ch]
                is_gur = g
        if curr:
            runs.append((''.join(curr), is_gur))
        return runs

    def get_width(self, text):
        if not text:
            return 0.0
        if self.hb_font:
            total_w = 0.0
            for chunk, is_gur in self.split_runs(text):
                f = self.hb_font if is_gur else (self.fallback_hb_font or self.hb_font)
                buf = hb.Buffer()
                buf.add_str(chunk)
                buf.guess_segment_properties()
                hb.shape(f, buf)
                total_w += sum(pos.x_advance for pos in buf.glyph_positions) / 64.0
            return total_w
        else:
            if PIL_HAS_RAQM and self.pil_font:
                try:
                    bbox = self.pil_font.getbbox(text, direction="ltr")
                    return float(bbox[2] - bbox[0])
                except Exception:
                    pass
            bbox = self.pil_font.getbbox(text)
            return float(bbox[2] - bbox[0])

    def get_bbox(self, xy, text):
        x, y = xy
        if not text:
            return (x, y, x, y)
        if self.hb_font and self.ft_face:
            ascender = self.ft_face.size.ascender / 64.0
            descender = self.ft_face.size.descender / 64.0
            w = self.get_width(text)
            h = ascender - descender
            return (x, y, x + w, y + h)
        else:
            if PIL_HAS_RAQM and self.pil_font:
                try:
                    b = self.pil_font.getbbox(text, direction="ltr")
                    return (x + b[0], y + b[1], x + b[2], y + b[3])
                except Exception:
                    pass
            b = self.pil_font.getbbox(text)
            return (x + b[0], y + b[1], x + b[2], y + b[3])

    def draw_text(self, img, xy, text, fill="#000000"):
        if not text:
            return
        x, y = xy

        if self.hb_font and self.ft_face:
            if isinstance(fill, str):
                rgb = ImageColor.getrgb(fill)
            else:
                rgb = fill[:3]
            fill_rgba = (rgb[0], rgb[1], rgb[2], 255)

            curr_x = float(x)
            for chunk, is_gur in self.split_runs(text):
                face = self.ft_face if is_gur else (self.fallback_ft_face or self.ft_face)
                f = self.hb_font if is_gur else (self.fallback_hb_font or self.hb_font)

                buf = hb.Buffer()
                buf.add_str(chunk)
                buf.guess_segment_properties()
                hb.shape(f, buf)

                ascender = face.size.ascender / 64.0
                curr_y = float(y + ascender)

                for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
                    gid = info.codepoint
                    face.load_glyph(gid, freetype.FT_LOAD_RENDER | freetype.FT_LOAD_TARGET_NORMAL)
                    glyph = face.glyph
                    bmp = glyph.bitmap
                    bx = int(round(curr_x + pos.x_offset / 64.0 + glyph.bitmap_left))
                    by = int(round(curr_y - pos.y_offset / 64.0 - glyph.bitmap_top))

                    if bmp.width > 0 and bmp.rows > 0:
                        mask = Image.frombytes('L', (bmp.width, bmp.rows), bytes(bmp.buffer))
                        colored = Image.new('RGBA', (bmp.width, bmp.rows), fill_rgba)
                        img.paste(colored, (bx, by), mask)

                    curr_x += pos.x_advance / 64.0
                    curr_y += pos.y_advance / 64.0
        else:
            draw = ImageDraw.Draw(img)
            kwargs = {}
            if PIL_HAS_RAQM:
                kwargs['layout_engine'] = ImageFont.Layout.RAQM
                kwargs['direction'] = 'ltr'
            draw.text((x, y), text, fill=fill, font=self.pil_font, **kwargs)

    def wrap_words(self, text, max_width):
        if not text:
            return []
        cleaned = " ".join(text.split())
        words = cleaned.split(" ")
        lines = []
        current_line = []
        for word in words:
            test_line = " ".join(current_line + [word])
            line_w = self.get_width(test_line)
            if line_w <= max_width:
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

    def draw_justified(self, img, words, x, y, fill, target_w, is_last=False):
        if not words:
            return
        if is_last or len(words) == 1:
            self.draw_text(img, (x, y), " ".join(words), fill=fill)
            return

        word_widths = [self.get_width(w) for w in words]
        total_w = sum(word_widths)
        space_needed = target_w - total_w
        num_spaces = len(words) - 1
        space_w = self.get_width(" ")
        normal_space_w = max(space_w, 1.0)
        avg_space = space_needed / num_spaces if num_spaces > 0 else normal_space_w

        if avg_space > normal_space_w * 3.0:
            self.draw_text(img, (x, y), " ".join(words), fill=fill)
            return

        curr_x = float(x)
        for w, ww in zip(words, word_widths):
            self.draw_text(img, (curr_x, y), w, fill=fill)
            curr_x += ww + avg_space


def get_font(family, size, bold=False):
    p = resolve_font_path(family, bold=bold)
    fallback_p = resolve_font_path("serif", bold=bold) if family == "gurmukhi_serif" else None
    return ShapedFont(p, size, bold=bold, fallback_path=fallback_p)


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
    bg1 = Image.open(bg_file).convert("RGBA").resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
    draw1 = ImageDraw.Draw(bg1)

    h_title = "Today's Hukamnama from Sri Darbar Sahib, Sri Amritsar."
    bbox = f_header_title.get_bbox((0, 0), h_title)
    f_header_title.draw_text(bg1, (CENTER_X - (bbox[2] - bbox[0]) / 2, 58), h_title, fill="#9e1b1b")

    h_date = payload.get("date_str") or "Today's Daily Hukamnama"
    bbox = f_header_date.get_bbox((0, 0), h_date)
    f_header_date.draw_text(bg1, (CENTER_X - (bbox[2] - bbox[0]) / 2, 84), h_date, fill="#742a1a")

    y = 122
    raag_punjabi = payload.get("raag_punjabi", "").strip()
    if raag_punjabi:
        bbox = f_raag.get_bbox((0, 0), raag_punjabi)
        f_raag.draw_text(bg1, (CENTER_X - (bbox[2] - bbox[0]) / 2, y), raag_punjabi, fill="#000000")
        y += (bbox[3] - bbox[1]) + 14
    else:
        y += 10

    mukhwak = payload.get("mukhwak", "").strip()
    LINE_H_MUKHWAK = 25.5
    if mukhwak:
        mukhwak_lines = f_mukhwak.wrap_words(mukhwak, CONTENT_W)
        for idx, line_words in enumerate(mukhwak_lines):
            is_last = (idx == len(mukhwak_lines) - 1)
            f_mukhwak.draw_justified(bg1, line_words, LEFT_X, y, "#000000", CONTENT_W, is_last=is_last)
            y += LINE_H_MUKHWAK

    y += 18
    punjabi_date_str = payload.get("punjabi_date_str", "").strip()
    if punjabi_date_str:
        bbox = f_ang_date.get_bbox((0, 0), punjabi_date_str)
        f_ang_date.draw_text(bg1, (CENTER_X - (bbox[2] - bbox[0]) / 2, y), punjabi_date_str, fill="#000000")
        y += (bbox[3] - bbox[1]) + 20

    viakhya = payload.get("viakhya", "").strip()
    overflow_viakhya = []
    LINE_H_VIAKHYA = 23.6
    MAX_PAGE1_Y = 890

    if viakhya:
        viakhya_head = "ਪੰਜਾਬੀ ਵਿਆਖਿਆ:"
        f_viakhya_head.draw_text(bg1, (LEFT_X, y), viakhya_head, fill="#000000")
        bbox = f_viakhya_head.get_bbox((LEFT_X, y), viakhya_head)
        draw1.line([(LEFT_X, bbox[3] + 2), (bbox[2], bbox[3] + 2)], fill="#000000", width=1)
        y += 32

        viakhya_lines = f_viakhya_body.wrap_words(viakhya, CONTENT_W)
        for idx, line_words in enumerate(viakhya_lines):
            if y + LINE_H_VIAKHYA > MAX_PAGE1_Y:
                overflow_viakhya = viakhya_lines[idx:]
                break
            is_last = (idx == len(viakhya_lines) - 1)
            f_viakhya_body.draw_justified(bg1, line_words, LEFT_X, y, "#111111", CONTENT_W, is_last=is_last)
            y += LINE_H_VIAKHYA

    out_p1 = payload.get("output_p1") or os.path.join(BASE_DIR, "public", "uploads", "test_poster_p1.jpg")
    os.makedirs(os.path.dirname(os.path.abspath(out_p1)), exist_ok=True)
    bg1.convert("RGB").save(out_p1, quality=95)
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
        bg2 = Image.open(bg_file).convert("RGBA").resize((TARGET_W, TARGET_H), Image.Resampling.LANCZOS)
        draw2 = ImageDraw.Draw(bg2)
        y2 = 62

        if overflow_viakhya:
            for idx, line_words in enumerate(overflow_viakhya):
                is_last = (idx == len(overflow_viakhya) - 1)
                f_viakhya_body.draw_justified(bg2, line_words, LEFT_X, y2, "#111111", CONTENT_W, is_last=is_last)
                y2 += LINE_H_VIAKHYA
            y2 += 22

        eng_head = "English Translation:"
        f_eng_head.draw_text(bg2, (LEFT_X, y2), eng_head, fill="#000000")
        bbox = f_eng_head.get_bbox((LEFT_X, y2), eng_head)
        draw2.line([(LEFT_X, bbox[3] + 2), (bbox[2], bbox[3] + 2)], fill="#000000", width=1)
        y2 += 30

        raag_english = payload.get("raag_english", "").strip()
        if raag_english:
            bbox = f_eng_raag.get_bbox((0, 0), raag_english)
            f_eng_raag.draw_text(bg2, (CENTER_X - (bbox[2] - bbox[0]) / 2, y2), raag_english, fill="#000000")
            y2 += 28

        if english:
            eng_lines = f_eng_body.wrap_words(english, CONTENT_W)
            LINE_H_ENG = 20.0
            for idx, line_words in enumerate(eng_lines):
                is_last = (idx == len(eng_lines) - 1)
                f_eng_body.draw_justified(bg2, line_words, LEFT_X, y2, "#111111", CONTENT_W, is_last=is_last)
                y2 += LINE_H_ENG

        english_date_str = payload.get("english_date_str", "").strip()
        if english_date_str:
            y2 += 24
            bbox = f_eng_date.get_bbox((0, 0), english_date_str)
            f_eng_date.draw_text(bg2, (CENTER_X - (bbox[2] - bbox[0]) / 2, y2), english_date_str, fill="#000000")

        os.makedirs(os.path.dirname(os.path.abspath(out_p2)), exist_ok=True)
        bg2.convert("RGB").save(out_p2, quality=95)
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
