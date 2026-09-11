#!/usr/bin/env python3
"""
Subject Area 3: CLI Pipeline & Automation Interface.
Extracts clean fashion line-art and generates CAD technical flat blueprints directly from photo geometry.
"""

import os
import sys
import argparse
import json
from lineart_core import generate_lineart_figure
from cad_compositor import generate_cad_blueprint


def parse_args():
    parser = argparse.ArgumentParser(
        description="Andreart Fashion Line-Art & CAD Technical Blueprint Extractor"
    )
    parser.add_argument(
        "--input", "-i",
        required=True,
        help="Ruta de la fotografía de entrada de la prenda."
    )
    parser.add_argument(
        "--output-dir", "-o",
        default="./output_lineart",
        help="Directorio de destino para los archivos generados."
    )
    parser.add_argument(
        "--mode", "-m",
        choices=["lineart", "cad", "all"],
        default="all",
        help="Modo de generación: lineart (solo figurín), cad (solo plano técnico), o all (ambos)."
    )
    parser.add_argument(
        "--garment", "-g",
        default="HANBOK REINTERPRETADO DE AUTOR",
        help="Nombre de la prenda para el bloque de título CAD."
    )
    parser.add_argument(
        "--design-no", "-d",
        default="DESIGN NO. 043",
        help="Número de diseño / referencia técnica."
    )
    parser.add_argument(
        "--aspect-ratio",
        default="4:5",
        choices=["4:5", "9:16", "1:1"],
        help="Relación de aspecto para la salida."
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Retorna la salida estructurada en formato JSON."
    )
    return parser.parse_args()


def run_pipeline(
    input_path: str,
    output_dir: str,
    mode: str = "all",
    garment: str = "HANBOK REINTERPRETADO DE AUTOR",
    design_no: str = "DESIGN NO. 043",
    aspect_ratio: str = "4:5"
) -> dict:
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"No se encontró la imagen de entrada en: {input_path}")

    os.makedirs(output_dir, exist_ok=True)

    size_map = {
        "4:5": (1080, 1350),
        "9:16": (1080, 1920),
        "1:1": (1080, 1080)
    }
    canvas_size = size_map.get(aspect_ratio, (1080, 1350))

    results = {
        "success": True,
        "input_image": input_path,
        "output_dir": output_dir,
        "garment": garment,
        "design_no": design_no,
        "aspect_ratio": aspect_ratio,
        "generated_files": {}
    }

    if mode in ["lineart", "all"]:
        lineart_path = os.path.join(output_dir, "lineart_figure.png")
        lineart_img = generate_lineart_figure(
            input_path,
            canvas_size=canvas_size,
            bg_color="#F6F4EE",
            line_color="#1E1B24"
        )
        lineart_img.save(lineart_path, format="PNG")
        results["generated_files"]["lineart"] = lineart_path

    if mode in ["cad", "all"]:
        cad_path = os.path.join(output_dir, "cad_blueprint.png")
        cad_img = generate_cad_blueprint(
            input_path,
            garment_name=garment,
            design_no=design_no,
            output_size=canvas_size
        )
        cad_img.save(cad_path, format="PNG")
        results["generated_files"]["cad_blueprint"] = cad_path

    return results


def main():
    args = parse_args()
    try:
        res = run_pipeline(
            input_path=args.input,
            output_dir=args.output_dir,
            mode=args.mode,
            garment=args.garment,
            design_no=args.design_no,
            aspect_ratio=args.aspect_ratio
        )
        if args.json:
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print("\n" + "=" * 70)
            print("✨ PIPELINE DE EXTRACCIÓN LINE-ART & BLUEPRINT CAD (ANDREART)")
            print("=" * 70)
            print(f"📸 Imagen Entrada: {res['input_image']}")
            print(f"📁 Directorio:     {res['output_dir']}")
            for k, v in res["generated_files"].items():
                print(f"✅ {k.upper().ljust(14)} -> {v}")
            print("=" * 70 + "\n")
    except Exception as e:
        if args.json:
            print(json.dumps({"success": False, "error": str(e)}), file=sys.stderr)
        else:
            print(f"\n❌ ERROR EN EL PIPELINE: {e}\n", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
