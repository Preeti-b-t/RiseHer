#!/usr/bin/env python3
"""
RiseHer Complete Project Packaging Script
Creates a clean, portable RiseHer_Complete_Project.zip excluding
temporary files, virtual environments, node_modules, logs, and sensitive credentials.
"""

import os
import shutil
import zipfile
from pathlib import Path

def create_riseher_zip():
    base_dir = Path("/Users/preetitevaramani/Documents/sih_rainfall_postprocessor/weather_regime_rainfall_ai")
    output_zip = base_dir / "RiseHer_Complete_Project.zip"
    artifact_dir = Path("/Users/preetitevaramani/.gemini/antigravity/brain/b2625eea-ad74-422f-b364-622f32e04f77")
    artifact_zip = artifact_dir / "RiseHer_Complete_Project.zip"

    # Remove previous zip if present
    if output_zip.exists():
        output_zip.unlink()

    # Directories and files to include
    include_dirs = ["backend", "frontend", "docs", "scripts", "tests"]
    include_files = [
        "README.md",
        "requirements.txt",
        ".env.example",
        "run_riseher.sh"
    ]

    # Explicit exclusions
    exclude_dir_names = {
        "node_modules",
        ".venv",
        "venv",
        "env",
        "__pycache__",
        ".pytest_cache",
        ".git",
        ".idea",
        ".vscode",
        "dist",
        ".cache"
    }

    exclude_extensions = {
        ".pyc",
        ".pyo",
        ".DS_Store",
        ".db",
        ".sqlite",
        ".sqlite3",
        ".log",
        ".jsonl"
    }

    exclude_file_names = {
        ".env",
        ".env.local",
        ".env.production",
        "dev_mailbox.jsonl",
        "riseher.db"
    }

    total_files = 0
    total_bytes = 0

    print(f">> Packing RiseHer Project into: {output_zip.name} ...")

    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        # 1. Add root files
        for fname in include_files:
            fpath = base_dir / fname
            if fpath.is_file():
                arcname = f"RiseHer/{fname}"
                # Preserve executable permission for run_riseher.sh
                zinfo = zipfile.ZipInfo.from_file(fpath, arcname=arcname)
                if fname.endswith(".sh"):
                    zinfo.external_attr = 0o755 << 16
                with open(fpath, "rb") as f_in:
                    zf.writestr(zinfo, f_in.read())
                total_files += 1
                total_bytes += fpath.stat().st_size
                print(f"  + Added file: {arcname}")

        # 2. Add directories recursively
        for dname in include_dirs:
            dir_path = base_dir / dname
            if not dir_path.is_dir():
                print(f"  ! Warning: Directory not found: {dname}")
                continue

            for root, dirs, files in os.walk(dir_path):
                # Filter out excluded subdirectories in place
                dirs[:] = [
                    d for d in dirs
                    if d not in exclude_dir_names and not d.startswith(".")
                ]

                rel_root = Path(root).relative_to(base_dir)

                for f in files:
                    # Skip excluded files
                    if f in exclude_file_names:
                        continue
                    if any(f.endswith(ext) for ext in exclude_extensions):
                        continue
                    if f.startswith(".") and not f.endswith(".example") and not f.endswith(".gitignore"):
                        continue

                    full_path = Path(root) / f
                    arcname = f"RiseHer/{rel_root}/{f}"

                    zinfo = zipfile.ZipInfo.from_file(full_path, arcname=arcname)
                    if f.endswith(".sh"):
                        zinfo.external_attr = 0o755 << 16

                    with open(full_path, "rb") as f_in:
                        zf.writestr(zinfo, f_in.read())

                    total_files += 1
                    total_bytes += full_path.stat().st_size

    zip_size_mb = output_zip.stat().st_size / (1024 * 1024)
    raw_size_mb = total_bytes / (1024 * 1024)
    print(f"\n✓ Archive Created: {output_zip}")
    print(f"  - Total Files: {total_files}")
    print(f"  - Raw Size:    {raw_size_mb:.2f} MB")
    print(f"  - Compressed:  {zip_size_mb:.2f} MB")

    # Copy to the Antigravity conversation artifact directory
    if artifact_dir.exists():
        shutil.copyfile(output_zip, artifact_zip)
        print(f"✓ Copied artifact to: {artifact_zip}")

if __name__ == "__main__":
    create_riseher_zip()
