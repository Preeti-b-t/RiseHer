import os
import shutil
import zipfile

def make_riseher_zip():
    base_dir = "/Users/preetitevaramani/Documents/sih_rainfall_postprocessor/weather_regime_rainfall_ai"
    output_zip = os.path.join(base_dir, "RiseHer_Complete_Project.zip")
    artifact_dir = "/Users/preetitevaramani/.gemini/antigravity/brain/b2625eea-ad74-422f-b364-622f32e04f77"
    artifact_zip = os.path.join(artifact_dir, "RiseHer_Complete_Project.zip")

    if os.path.exists(output_zip):
        os.remove(output_zip)

    include_dirs = ["backend", "frontend", "tests", "scripts"]
    include_files = ["README.md", ".env.example", ".env", "run_riseher.sh", "requirements.txt"]
    
    exclude_dirs = {"node_modules", ".venv", "__pycache__", ".pytest_cache", "dist", ".git", ".idea", ".vscode"}
    exclude_extensions = {".pyc", ".pyo", ".DS_Store"}

    total_files = 0
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add root individual files
        for fname in include_files:
            fpath = os.path.join(base_dir, fname)
            if os.path.exists(fpath):
                arcname = os.path.join("RiseHer", fname)
                zf.write(fpath, arcname)
                total_files += 1
                print(f"Added root file: {arcname}")

        # Add directories recursively
        for dname in include_dirs:
            dir_path = os.path.join(base_dir, dname)
            if not os.path.exists(dir_path):
                continue
            for root, dirs, files in os.walk(dir_path):
                # Filter out excluded directories in-place
                dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith(".")]
                for f in files:
                    if any(f.endswith(ext) for ext in exclude_extensions) or (f.startswith(".") and not f.endswith(".example")):
                        continue
                    file_full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(file_full_path, base_dir)
                    arcname = os.path.join("RiseHer", rel_path)
                    zf.write(file_full_path, arcname)
                    total_files += 1

    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"\nCreated: {output_zip} ({zip_size_mb:.2f} MB, {total_files} files)")

    # Copy to artifact directory
    if os.path.exists(artifact_dir):
        shutil.copyfile(output_zip, artifact_zip)
        print(f"Copied to artifact dir: {artifact_zip}")

if __name__ == "__main__":
    make_riseher_zip()
