import pathlib

# Extend this package's __path__ to include the backend core package directory.
# This allows imports such as `from core.ai_agent import ...` to resolve to
# `backend/core/ai_agent.py` without having to modify every import throughout the
# codebase.
_backend_core = pathlib.Path(__file__).parent.parent / "backend" / "core"
if _backend_core.is_dir():
    __path__.append(str(_backend_core))
