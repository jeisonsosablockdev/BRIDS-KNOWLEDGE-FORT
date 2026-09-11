#!/usr/bin/env python3
"""
Subject Area 1: Edge, Contour & Silhouette Extraction (Clean Core Engine).
Extracts faithful fashion line-art contours directly from photograph geometry.
"""

from typing import Tuple, Union
import cv2
import numpy as np
from PIL import Image, ImageFilter
from lineart_constants import (
    BRAND_PALETTE,
    DEFAULT_CANVAS_SIZE,
    DEFAULT_TARGET_WIDTH,
    DEFAULT_LINEART_PADDING,
)


def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    """
    Converts a hexadecimal color string into an RGB integer tuple.

    Args:
        hex_str: Hex code string (e.g. '#3E2356' or '3E2356').

    Returns:
        Tuple of (Red, Green, Blue) values (0-255).
    """
    hex_clean = hex_str.lstrip("#")
    if len(hex_clean) == 3:
        hex_clean = "".join([c * 2 for c in hex_clean])
    return tuple(int(hex_clean[i : i + 2], 16) for i in (0, 2, 4))


def preprocess_image(
    image_path: str,
    target_width: int = DEFAULT_TARGET_WIDTH
) -> np.ndarray:
    """
    F1.1: Normalizes image contrast and applies bilateral filtering to isolate seams.

    Args:
        image_path: Absolute or relative path to the source photograph.
        target_width: Target scaled pixel width for normalized processing.

    Returns:
        Grayscale normalized NumPy array with smoothed flat regions and sharp edges.
    """
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        pil_fallback = Image.open(image_path).convert("RGB")
        img_bgr = cv2.cvtColor(np.array(pil_fallback), cv2.COLOR_RGB2BGR)

    height, width = img_bgr.shape[:2]
    aspect_ratio = height / width
    target_height = int(target_width * aspect_ratio)

    resized_bgr = cv2.resize(
        img_bgr, (target_width, target_height), interpolation=cv2.INTER_AREA
    )
    gray = cv2.cvtColor(resized_bgr, cv2.COLOR_BGR2GRAY)

    # Enhance local contrast for fabric weaves and seams
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # Bilateral smoothing: preserves hard seam/pleat transitions while denoising flat fields
    filtered = cv2.bilateralFilter(enhanced, d=9, sigmaColor=75, sigmaSpace=75)
    return filtered


def extract_garment_edges(gray_image: np.ndarray) -> np.ndarray:
    """
    F1.2: Multi-scale edge extraction combining Canny, morphological gradient and adaptive thresholding.

    Args:
        gray_image: Normalized 2D single-channel NumPy array.

    Returns:
        Binary edge mask (255 for edge pixels, 0 for background).
    """
    # 1. Dual-threshold Canny detection
    edges_fine = cv2.Canny(gray_image, threshold1=30, threshold2=90)
    edges_coarse = cv2.Canny(gray_image, threshold1=70, threshold2=160)

    # 2. Morphological gradient for thick structural boundaries (cuffs, hem, collar)
    struct_elem = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    gradient_map = cv2.morphologyEx(gray_image, cv2.MORPH_GRADIENT, struct_elem)
    _, grad_thresholded = cv2.threshold(gradient_map, 18, 255, cv2.THRESH_BINARY)

    # 3. Adaptive thresholding for subtle garment folds and pleats
    adaptive_folds = cv2.adaptiveThreshold(
        gray_image,
        maxValue=255,
        adaptiveMethod=cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        thresholdType=cv2.THRESH_BINARY_INV,
        blockSize=11,
        C=4,
    )

    # 4. Logical composition of feature layers
    combined = cv2.bitwise_or(edges_fine, edges_coarse)
    combined = cv2.bitwise_or(combined, grad_thresholded)
    combined = cv2.bitwise_or(combined, cv2.bitwise_and(adaptive_folds, grad_thresholded))

    # 5. Morphological opening to suppress salt-and-pepper noise dots
    cleaned_edges = cv2.morphologyEx(combined, cv2.MORPH_OPEN, struct_elem)
    return cleaned_edges


def generate_lineart_figure(
    image_path: str,
    canvas_size: Tuple[int, int] = DEFAULT_CANVAS_SIZE,
    bg_color: str = BRAND_PALETTE["ATELIER_IVORY"],
    line_color: str = BRAND_PALETTE["OBSIDIAN_CHARCOAL"],
    crop_padding_ratio: float = DEFAULT_LINEART_PADDING,
) -> Image.Image:
    """
    F1.3: Renders an ultra-clean, elegant fashion line-art illustration directly from the input photograph.

    Args:
        image_path: Source photo path.
        canvas_size: Output (width, height) tuple in pixels.
        bg_color: Hex color string for canvas background.
        line_color: Hex color string for vector ink strokes.
        crop_padding_ratio: Proportion of canvas margin to reserve.

    Returns:
        PIL Image instance with smooth, antialiased linework.
    """
    gray = preprocess_image(image_path, target_width=DEFAULT_TARGET_WIDTH)
    edges = extract_garment_edges(gray)

    # Invert binary edges (lines become black on white)
    inverted_edges = cv2.bitwise_not(edges)
    line_pil = Image.fromarray(inverted_edges).convert("L")

    # Anti-aliasing pass
    line_pil = line_pil.filter(ImageFilter.GaussianBlur(radius=0.5))

    # Color palette mapping
    bg_rgb = hex_to_rgb(bg_color)
    line_rgb = hex_to_rgb(line_color)
    canvas = Image.new("RGB", canvas_size, color=bg_rgb)

    # Scale figure to respect layout safe margins
    avail_w = int(canvas_size[0] * (1.0 - 2 * crop_padding_ratio))
    avail_h = int(canvas_size[1] * (1.0 - 2 * crop_padding_ratio))

    fig_w, fig_h = line_pil.size
    scale_factor = min(avail_w / fig_w, avail_h / fig_h)
    new_w = int(fig_w * scale_factor)
    new_h = int(fig_h * scale_factor)

    line_resized = line_pil.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # Tinted alpha blending
    line_normalized = np.array(line_resized, dtype=np.float32) / 255.0
    alpha_mask = Image.fromarray(((1.0 - line_normalized) * 255.0).astype(np.uint8), mode="L")

    tinted_figure = Image.new("RGBA", (new_w, new_h), color=(*line_rgb, 255))
    tinted_figure.putalpha(alpha_mask)

    # Paste centered
    center_x = (canvas_size[0] - new_w) // 2
    center_y = (canvas_size[1] - new_h) // 2
    canvas.paste(tinted_figure, (center_x, center_y), mask=tinted_figure)

    return canvas
