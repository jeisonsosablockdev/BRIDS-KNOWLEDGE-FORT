#!/usr/bin/env python3
"""
Brand Constants and Configuration Tokens for Andreart Line-Art & CAD Engines.
Maintains single source of truth for color palette, canvas dimensions, and layout metrics.
"""

from typing import Dict, Tuple

# Official Andreart Brand Color Palette
BRAND_PALETTE: Dict[str, str] = {
    "DEEP_VIOLET": "#3E2356",       # Primary brand background & mística
    "SOFT_LILAC": "#CBBAD9",        # Accent & fine guide lines
    "ATELIER_IVORY": "#F6F4EE",     # Crafting canvas & paper tone
    "OBSIDIAN_CHARCOAL": "#1E1B24", # Technical lines & vector strokes
    "PURE_WHITE": "#FFFFFF",        # CAD blueprint pure background
    "CAD_GRID": "#EFEFEF",          # Subtle engineering grid lines
    "CAD_DIVIDER": "#D0D0D0",       # Pane separators
    "MUTED_TEXT": "#646464"         # Secondary technical annotations
}

# Standard Social Aspect Ratios & Canvas Dimensions
ASPECT_RATIOS: Dict[str, Tuple[int, int]] = {
    "4:5": (1080, 1350),   # Instagram Vertical Carousel (Standard)
    "9:16": (1080, 1920),  # Stories & Reels
    "1:1": (1080, 1080)    # Square Feed
}

# Layout & Composition Metrics
DEFAULT_CANVAS_SIZE: Tuple[int, int] = ASPECT_RATIOS["4:5"]
DEFAULT_TARGET_WIDTH: int = 900
DEFAULT_LINEART_PADDING: float = 0.08

# System Font Candidate Paths (macOS & Unix fallbacks)
SYSTEM_FONT_PATHS: Tuple[str, ...] = (
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/SFNS.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
)
