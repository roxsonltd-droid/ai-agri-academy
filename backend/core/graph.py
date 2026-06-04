import os
from neo4j import GraphDatabase
from typing import Optional

class Neo4jDriver:
    """Singleton wrapper around Neo4j driver.
    Reads connection settings from environment variables:
        NEO4J_URL (bolt://...)
        NEO4J_USER
        NEO4J_PASSWORD
    """
    _instance: Optional["Neo4jDriver"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._driver = None
        return cls._instance

    def connect(self):
        if self._driver is None:
            url = os.getenv("NEO4J_URL", "bolt://localhost:7687")
            user = os.getenv("NEO4J_USER", "neo4j")
            password = os.getenv("NEO4J_PASSWORD", "test")
            self._driver = GraphDatabase.driver(url, auth=(user, password))
        return self._driver

    def close(self):
        if self._driver:
            self._driver.close()
            self._driver = None

    def session(self, **kwargs):
        if self._driver is None:
            self.connect()
        return self._driver.session(**kwargs)

    def run(self, query: str, parameters: dict = None):
        with self.session() as session:
            return session.run(query, parameters or {})
