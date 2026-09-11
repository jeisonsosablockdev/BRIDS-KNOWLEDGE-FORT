#!/usr/bin/env python3
"""
Subject Area 2: Technical CAD Blueprint & Annotation Compositor (Clean Engine).
Builds dual-pane architectural CAD specification sheets with vector callouts and leader lines.
"""

from typing import Tuple, List, Dict, Any, Optional
import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from lineart_constants import (
    BRAND_PALETTE,
    DEFAULT_CANVAS_SIZE,
    SYSTEM_FONT_PATHS,
)
from lineart_core import hex_to_rgb, preprocess_image, extract_garment_edges


def resolve_system_font(size: int, is_bold: bool = False) -> ImageFont.ImageFont:
    """
    Safely resolves a clean system sans-serif font across macOS and Unix platforms.
    """
    for font_path in SYSTEM_FONT_PATHS:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def create_cad_canvas(
    size: Tuple[int, int] = DEFAULT_CANVAS_SIZE,
    bg_color: str = BRAND_PALETTE["PURE_WHITE"],
    border_color: str = BRAND_PALETTE["OBSIDIAN_CHARCOAL"],
    add_grid: bool = False,
) -> Image.Image:
    """
    F2.1: Initializes a dual-pane technical blueprint canvas with engineering frame lines.
    """
    canvas = Image.new("RGB", size, color=hex_to_rgb(bg_color))
    draw = ImageDraw.Draw(canvas)
    width, height = size
    border_rgb = hex_to_rgb(border_color)

    # Double technical border
    draw.rectangle([25, 25, width - 25, height - 25], outline=border_rgb, width=2)
    draw.rectangle([35, 35, width - 35, height - 35], outline=border_rgb, width=1)

    if add_grid:
        grid_rgb = hex_to_rgb(BRAND_PALETTE["CAD_GRID"])
        for x in range(50, width - 50, 40):
            draw.line([(x, 50), (x, height - 50)], fill=grid_rgb, width=1)
        for y in range(50, height - 50, 40):
            draw.line([(50, y), (width - 50, y)], fill=grid_rgb, width=1)

    return canvas


def draw_cad_annotations(
    canvas: Image.Image,
    garment_name: str = "HANBOK REINTERPRETADO DE AUTOR",
    design_no: str = "DESIGN NO. 043",
    callouts: Optional[List[Dict[str, Any]]] = None,
    line_color: str = BRAND_PALETTE["OBSIDIAN_CHARCOAL"],
) -> Image.Image:
    """
    F2.2: Renders leader lines, technical callout labels, title header, and bottom scale block.
    """
    annotated = canvas.copy()
    draw = ImageDraw.Draw(annotated)
    width, height = annotated.size
    line_rgb = hex_to_rgb(line_color)
    muted_rgb = hex_to_rgb(BRAND_PALETTE["MUTED_TEXT"])

    font_title = resolve_system_font(22, is_bold=True)
    font_sub = resolve_system_font(13)
    font_callout = resolve_system_font(12)
    font_bold = resolve_system_font(13, is_bold=True)

    # 1. Header Title Block
    draw.text((50, 50), garment_name.upper(), fill=line_rgb, font=font_title)
    draw.text(
        (50, 80),
        "ANDREART VESTUARIO • SPECIFICATION & PATTERN BLUEPRINT",
        fill=muted_rgb,
        font=font_sub,
    )
    draw.line([(50, 105), (width - 50, 105)], fill=line_rgb, width=1)

    # 2. Callouts & Elbow Leader Lines
    if callouts:
        for item in callouts:
            text = item.get("text", "")
            target_pt = item.get("start", (0, 0))
            anchor_pt = item.get("end", (0, 0))

            # Target connection node
            draw.ellipse(
                [target_pt[0] - 3, target_pt[1] - 3, target_pt[0] + 3, target_pt[1] + 3],
                fill=line_rgb,
            )

            # Elbow leader path (target -> mid-x -> anchor)
            mid_x = (target_pt[0] + anchor_pt[0]) // 2
            draw.line(
                [target_pt, (mid_x, target_pt[1]), (mid_x, anchor_pt[1]), anchor_pt],
                fill=line_rgb,
                width=1,
            )

            # Underlined label
            draw.text(
                (anchor_pt[0] + 5, anchor_pt[1] - 8),
                text.upper(),
                fill=line_rgb,
                font=font_callout,
            )
            text_width = len(text) * 7
            draw.line(
                [(anchor_pt[0] + 5, anchor_pt[1] + 8), (anchor_pt[0] + 5 + text_width, anchor_pt[1] + 8)],
                fill=line_rgb,
                width=1,
            )

    # 3. Footer Title & Scale Block
    footer_y = height - 85
    draw.line([(50, footer_y), (width - 50, footer_y)], fill=line_rgb, width=1)

    # Left footer details
    draw.text(
        (50, footer_y + 12),
        "SISTEMA DE MOLDERÍA ADAPTABLE (XS - XL) • CONFECCIÓN BOGOTÁ",
        fill=line_rgb,
        font=font_bold,
    )
    draw.text(
        (50, footer_y + 30),
        "PATRONAJE ORIGINAL DE AUTOR • SÉ TU PROPIO HÉROE",
        fill=muted_rgb,
        font=font_sub,
    )

    # Right footer: Scale Bar & Technical Reference
    scale_x = width - 240
    draw.text((scale_x, footer_y + 12), design_no.upper(), fill=line_rgb, font=font_bold)

    # Checkered scale bar
    bar_y = footer_y + 32
    draw.rectangle([scale_x, bar_y, scale_x + 180, bar_y + 8], outline=line_rgb, width=1)
    for i in range(4):
        if i % 2 == 0:
            draw.rectangle(
                [scale_x + i * 45, bar_y, scale_x + (i + 1) * 45, bar_y + 8],
                fill=line_rgb,
            )

    # 4. Draw Official Andreart Atelier Seal Stamp
    draw_andreart_stamp(draw, box=(50, height - 200, 200, height - 100), line_rgb=line_rgb)

    return annotated


def draw_andreart_stamp(
    draw: ImageDraw.ImageDraw,
    box: Tuple[int, int, int, int],
    line_rgb: Tuple[int, int, int]
) -> None:
    """
    Renders the official Andreart framed atelier stamp with emblem and text.
    """
    x1, y1, x2, y2 = box
    draw.rectangle([x1, y1, x2, y2], outline=line_rgb, width=2)
    draw.rectangle([x1 + 3, y1 + 3, x2 - 3, y2 - 3], outline=line_rgb, width=1)

    cx = (x1 + x2) // 2
    # Draw geometric emblem (A inside diamond)
    diamond = [(cx, y1 + 12), (cx + 12, y1 + 24), (cx, y1 + 36), (cx - 12, y1 + 24)]
    draw.polygon(diamond, outline=line_rgb, width=1)
    
    # 'A' inside diamond
    draw.line([(cx, y1 + 16), (cx - 5, y1 + 30)], fill=line_rgb, width=1)
    draw.line([(cx, y1 + 16), (cx + 5, y1 + 30)], fill=line_rgb, width=1)
    draw.line([(cx - 3, y1 + 24), (cx + 3, y1 + 24)], fill=line_rgb, width=1)

    # Brand text below emblem
    try:
        font_stamp = resolve_system_font(14, is_bold=True)
    except Exception:
        font_stamp = ImageFont.load_default()

    draw.text((cx - 30, y1 + 42), "Andreart", fill=line_rgb, font=font_stamp)


def _extract_tinted_figure_layer(
    image_slice: np.ndarray,
    avail_w: int,
    avail_h: int,
    line_rgb: Tuple[int, int, int]
) -> Tuple[Image.Image, int, int]:
    """Helper to extract antialiased tinted line-art layer from an image region."""
    if len(image_slice.shape) == 3:
        gray = cv2.cvtColor(image_slice, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_slice

    edges = extract_garment_edges(gray)
    inv_edges = cv2.bitwise_not(edges)
    pil_edge = Image.fromarray(inv_edges).convert("L").filter(ImageFilter.GaussianBlur(radius=0.4))

    orig_w, orig_h = pil_edge.size
    scale = min(avail_w / orig_w, avail_h / orig_h)
    new_w, new_h = max(1, int(orig_w * scale)), max(1, int(orig_h * scale))

    resized = pil_edge.resize((new_w, new_h), Image.Resampling.LANCZOS)
    arr = np.array(resized, dtype=np.float32) / 255.0
    alpha = Image.fromarray(((1.0 - arr) * 255.0).astype(np.uint8), mode="L")

    tinted = Image.new("RGBA", (new_w, new_h), color=(*line_rgb, 255))
    tinted.putalpha(alpha)
    return tinted, new_w, new_h


def generate_cad_blueprint(
    image_path: str,
    garment_name: str = "HANBOK REINTERPRETADO DE AUTOR",
    design_no: str = "DESIGN NO. 043",
    output_size: Tuple[int, int] = DEFAULT_CANVAS_SIZE,
) -> Image.Image:
    """
    F2.3: Composes a dual-pane CAD technical specification flat drawing faithfully derived from the input photograph.
    """
    canvas_w, canvas_h = output_size
    canvas = create_cad_canvas(size=output_size, bg_color=BRAND_PALETTE["PURE_WHITE"])
    line_rgb = hex_to_rgb(BRAND_PALETTE["OBSIDIAN_CHARCOAL"])

    # 1. Left Pane: Full Figurine wearing the ensemble
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        pil_tmp = Image.open(image_path).convert("RGB")
        img_bgr = cv2.cvtColor(np.array(pil_tmp), cv2.COLOR_RGB2BGR)

    left_avail_w = int(canvas_w * 0.44)
    left_avail_h = int(canvas_h * 0.82)
    tinted_left, new_fw, new_fh = _extract_tinted_figure_layer(
        img_bgr, left_avail_w, left_avail_h, line_rgb
    )

    pos_left_x = 60 + (left_avail_w - new_fw) // 2
    pos_left_y = 120 + (left_avail_h - new_fh) // 2
    canvas.paste(tinted_left, (pos_left_x, pos_left_y), mask=tinted_left)

    # 2. Right Pane: Deconstructed Garment Components
    orig_h, orig_w = img_bgr.shape[:2]

    # Upper component: Cropped Jeogori (top ~16% to ~46%)
    jeogori_top = int(orig_h * 0.16)
    jeogori_bottom = int(orig_h * 0.46)
    jeogori_crop = img_bgr[jeogori_top:jeogori_bottom, :]

    # Lower component: Pleated Mini Skirt (waist ~36% to hem ~77%)
    skirt_top = int(orig_h * 0.36)
    skirt_bottom = int(orig_h * 0.77)
    skirt_crop = img_bgr[skirt_top:skirt_bottom, :]

    right_avail_w = int(canvas_w * 0.44)
    right_half_h = int(canvas_h * 0.38)

    # Render Jeogori Flat (Right Top)
    tinted_j, njw, njh = _extract_tinted_figure_layer(
        jeogori_crop, right_avail_w, right_half_h, line_rgb
    )
    pos_j_x = 550 + (right_avail_w - njw) // 2
    pos_j_y = 140 + (right_half_h - njh) // 2
    canvas.paste(tinted_j, (pos_j_x, pos_j_y), mask=tinted_j)

    # Render Skirt Flat (Right Bottom)
    tinted_s, nsw, nsh = _extract_tinted_figure_layer(
        skirt_crop, right_avail_w, right_half_h, line_rgb
    )
    pos_s_x = 550 + (right_avail_w - nsw) // 2
    pos_s_y = 660 + (right_half_h - nsh) // 2
    canvas.paste(tinted_s, (pos_s_x, pos_s_y), mask=tinted_s)

    # 3. Dividing Architecture Axes
    draw = ImageDraw.Draw(canvas)
    divider_rgb = hex_to_rgb(BRAND_PALETTE["CAD_DIVIDER"])
    grid_rgb = hex_to_rgb(BRAND_PALETTE["CAD_GRID"])

    draw.line([(525, 115), (525, canvas_h - 95)], fill=divider_rgb, width=1)
    draw.line([(535, 640), (canvas_w - 50, 640)], fill=grid_rgb, width=1)

    # 4. Technical Annotations tailored to the specific garment geometry (constrained within margins)
    callouts = [
        {
            "text": "Crossover Collar Band",
            "start": (pos_j_x + int(njw * 0.48), pos_j_y + int(njh * 0.25)),
            "end": (pos_j_x - 15, pos_j_y + 20),
        },
        {
            "text": "Straight Tailored Sleeve",
            "start": (pos_j_x + int(njw * 0.15), pos_j_y + int(njh * 0.65)),
            "end": (pos_j_x - 15, pos_j_y + 110),
        },
        {
            "text": "Cropped Hemline",
            "start": (pos_j_x + int(njw * 0.5), pos_j_y + int(njh * 0.88)),
            "end": (pos_j_x + int(njw * 0.55), pos_j_y + int(njh * 0.88)),
        },
        {
            "text": "Fluid Otgoreum Bow Tie",
            "start": (pos_s_x + int(nsw * 0.58), pos_s_y + int(nsh * 0.22)),
            "end": (canvas_w - 220, pos_s_y + 40),
        },
        {
            "text": "High-Waist Fitted Band",
            "start": (pos_s_x + int(nsw * 0.45), pos_s_y + int(nsh * 0.12)),
            "end": (pos_s_x - 15, pos_s_y + 30),
        },
        {
            "text": "Structured Box Pleats",
            "start": (pos_s_x + int(nsw * 0.35), pos_s_y + int(nsh * 0.65)),
            "end": (pos_s_x - 15, pos_s_y + int(nsh * 0.65)),
        },
        {
            "text": "A-Line Flared Mini Hem",
            "start": (pos_s_x + int(nsw * 0.6), pos_s_y + int(nsh * 0.92)),
            "end": (canvas_w - 220, pos_s_y + int(nsh * 0.90)),
        },
    ]

    annotated = draw_cad_annotations(
        canvas,
        garment_name=garment_name,
        design_no=design_no,
        callouts=callouts,
    )

    return annotated
