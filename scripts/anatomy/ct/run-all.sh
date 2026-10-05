#!/bin/bash
# Runs the CT pipeline (needs `uv`). The NasalSeg image + labels must be in .cache/ct/raw (see README in 01_orient.py header).
set -e
cd "$(dirname "$0")"
for s in "$@"; do echo "== $s"; uv run "$s".py; done
