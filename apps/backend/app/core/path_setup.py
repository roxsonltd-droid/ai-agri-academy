"""Ensure ``apps/backend/rag`` is importable as flat modules (``tutor_router``, ``core``, …)."""

from __future__ import annotations

import sys
from pathlib import Path


def ensure_backend_paths() -> Path:
	# .../apps/backend/app/core/path_setup.py → parents[2] == apps/backend
	backend_root = Path(__file__).resolve().parents[2]
	rag_dir = backend_root / "rag"
	for p in (rag_dir, backend_root):
		s = str(p)
		if s not in sys.path:
			sys.path.insert(0, s)
	return backend_root
