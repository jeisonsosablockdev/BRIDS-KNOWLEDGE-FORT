#!/usr/bin/env python3
"""
Test Suite for Photo-to-LineArt and CAD Blueprint Pipeline (TDD).
Validates edge extraction, line-art stylization, CAD layout composition, and CLI execution.
"""

import os
import sys
import unittest
import numpy as np
from PIL import Image

# Add scripts directory to path
SCRIPTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'scripts'))
sys.path.insert(0, SCRIPTS_DIR)

TEST_SAMPLE_IMAGE = "/Users/jaymusicmachine/.gemini/antigravity/brain/4780d722-b175-47ed-b397-7da906cc1986/.user_uploaded/media_1786308223855.jpg"
TEST_OUTPUT_DIR = "/tmp/test_lineart_pipeline"


class TestPhotoLineArtPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.makedirs(TEST_OUTPUT_DIR, exist_ok=True)
        # Create a synthetic fallback test image if specific test image is not present
        if not os.path.exists(TEST_SAMPLE_IMAGE):
            cls.test_image_path = os.path.join(TEST_OUTPUT_DIR, "synthetic_test.jpg")
            img = Image.new("RGB", (576, 1024), color=(220, 200, 180))
            img.save(cls.test_image_path)
        else:
            cls.test_image_path = TEST_SAMPLE_IMAGE

    def test_feature_1_1_preprocess_image(self):
        """F1.1: Test loading, normalizing and bilateral filtering of image."""
        from lineart_core import preprocess_image
        processed = preprocess_image(self.test_image_path, target_width=800)
        self.assertIsInstance(processed, np.ndarray)
        self.assertEqual(len(processed.shape), 2)  # Grayscale
        self.assertEqual(processed.shape[1], 800)

    def test_feature_1_2_extract_garment_edges(self):
        """F1.2: Test multi-scale edge and contour extraction."""
        from lineart_core import preprocess_image, extract_garment_edges
        gray = preprocess_image(self.test_image_path, target_width=800)
        edges = extract_garment_edges(gray)
        self.assertIsInstance(edges, np.ndarray)
        self.assertEqual(edges.dtype, np.uint8)
        # Verify edges contain binary line information (0 and 255)
        unique_vals = np.unique(edges)
        self.assertTrue(255 in unique_vals or 1 in unique_vals)

    def test_feature_1_3_generate_lineart_figure(self):
        """F1.3: Test stylized line-art figure generation on ivory/white canvas."""
        from lineart_core import generate_lineart_figure
        lineart = generate_lineart_figure(self.test_image_path, canvas_size=(1080, 1350))
        self.assertIsInstance(lineart, Image.Image)
        self.assertEqual(lineart.size, (1080, 1350))
        self.assertEqual(lineart.mode, "RGB")
        # Verify non-trivial drawing (not solid white/black)
        extrema = lineart.convert("L").getextrema()
        self.assertTrue(extrema[0] < 50 and extrema[1] > 200)

    def test_feature_2_1_create_cad_canvas(self):
        """F2.1: Test dual-pane technical CAD canvas initialization."""
        from cad_compositor import create_cad_canvas
        canvas = create_cad_canvas(size=(1080, 1350), bg_color="#FFFFFF")
        self.assertIsInstance(canvas, Image.Image)
        self.assertEqual(canvas.size, (1080, 1350))

    def test_feature_2_2_add_cad_annotations(self):
        """F2.2: Test parametric technical callouts and leader lines."""
        from cad_compositor import create_cad_canvas, draw_cad_annotations
        canvas = create_cad_canvas(size=(1080, 1350))
        annotated = draw_cad_annotations(
            canvas,
            garment_name="HANBOK REINTERPRETADO",
            design_no="DESIGN NO. 043",
            callouts=[
                {"text": "CROPPED JEOGORI", "start": (350, 300), "end": (450, 260)},
                {"text": "FLUID SASH BOW", "start": (380, 480), "end": (500, 480)},
                {"text": "PLEATED MINI SKIRT", "start": (350, 650), "end": (480, 650)},
            ]
        )
        self.assertIsInstance(annotated, Image.Image)

    def test_feature_2_3_full_cad_blueprint(self):
        """F2.3: Test complete CAD technical flat specification sheet composition."""
        from cad_compositor import generate_cad_blueprint
        blueprint = generate_cad_blueprint(
            image_path=self.test_image_path,
            garment_name="HANBOK REINTERPRETADO DE AUTOR",
            design_no="DESIGN NO. 043",
            output_size=(1080, 1350)
        )
        self.assertIsInstance(blueprint, Image.Image)
        self.assertEqual(blueprint.size, (1080, 1350))
        out_file = os.path.join(TEST_OUTPUT_DIR, "test_blueprint_out.png")
        blueprint.save(out_file)
        self.assertTrue(os.path.exists(out_file))

    def test_feature_3_1_cli_execution(self):
        """F3.1: Test standalone CLI utility execution."""
        import subprocess
        cli_script = os.path.join(SCRIPTS_DIR, "extract_photo_lineart.py")
        cmd = [
            "/Users/jaymusicmachine/.local/bin/uv", "run",
            "--with", "opencv-python-headless",
            "--with", "pillow",
            "--with", "numpy",
            "python", cli_script,
            "--input", self.test_image_path,
            "--output-dir", TEST_OUTPUT_DIR,
            "--mode", "all",
            "--garment", "Hanbok Reinterpretado",
            "--design-no", "DESIGN NO. 043",
            "--json"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"CLI Error: {res.stderr}")
        self.assertTrue(os.path.exists(os.path.join(TEST_OUTPUT_DIR, "lineart_figure.png")))
        self.assertTrue(os.path.exists(os.path.join(TEST_OUTPUT_DIR, "cad_blueprint.png")))


if __name__ == "__main__":
    unittest.main()
