#!/usr/bin/env python3
"""Pack an .app bundle into a .ipa file.

An .ipa is just a ZIP archive with this layout:

    Payload/
      HelloIPA.app/
        ...

Usage:
    python scripts/make-ipa.py <path/to/App.app> [output.ipa]

Works on Windows, macOS and Linux. Note: this only *packages* the app, it
does not build or sign it. Building requires macOS + Xcode.
"""

from __future__ import annotations

import os
import sys
import zipfile
from pathlib import Path


def add_file(zf: zipfile.ZipFile, path: Path, arcname: str) -> None:
    info = zipfile.ZipInfo.from_file(path, arcname)
    info.compress_type = zipfile.ZIP_DEFLATED
    mode = 0o755 if os.access(path, os.X_OK) else 0o644
    info.external_attr = (0o100000 | mode) << 16
    zf.writestr(info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__.strip())
        return 2

    app = Path(sys.argv[1]).expanduser().resolve()
    if not app.is_dir() or app.suffix != ".app":
        print(f"error: expected an .app directory, got: {app}", file=sys.stderr)
        return 1

    out = Path(sys.argv[2]).expanduser().resolve() if len(sys.argv) > 2 else app.with_suffix(".ipa")
    out.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(app):
            dirs.sort()
            for name in sorted(files):
                full = Path(root) / name
                arcname = "Payload/" + full.relative_to(app.parent).as_posix()
                add_file(zf, full, arcname)

    size = out.stat().st_size
    print(f"created {out} ({size / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
