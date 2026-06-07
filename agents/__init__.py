import pathlib

# Forward the top-level `agents` package to the actual location under `backend/agents`.
_backend_agents = pathlib.Path(__file__).parent.parent / "backend" / "agents"
if _backend_agents.is_dir():
    __path__.append(str(_backend_agents))
