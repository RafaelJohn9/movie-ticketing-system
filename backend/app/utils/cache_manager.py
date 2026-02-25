"""CacheManager module manages cached data using Redis as the backend.

Classes:
    CacheManager: Manages cache data storage and retrieval using Redis.

Usage example:
    cache_manager = CacheManager(cache_backend="redis://localhost:6379/0")
    cache_key = cache_manager.create_key()
    cache_manager.set(
        "namespace",
        cache_key,
        {"key": "value"},
        expire_seconds=60
    )
    data = cache_manager.get("namespace", cache_key)
"""

import base64
import json
import logging
import os

import redis

from app.settings import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CacheManager:
    """A class to manage cache using a Redis backend."""

    def __init__(self, cache_backend: str):
        """Initialize the CacheManager with the given Redis backend URL."""
        self.redis = redis.from_url(cache_backend)

    def create_key(self) -> str:
        """Generate a new cache key."""
        key = os.urandom(16)
        key = base64.b64encode(key, b"__").decode("utf-8")
        return key

    def set(
        self,
        namespace: str,
        key: str,
        data: str | int | dict,
        json_load: bool = True,
        expire_seconds: int | None = None,
    ):
        """Set a value in the Redis store with optional expiration time.

        Args:
            namespace: Prefix for the key.
            key: The specific key.
            data: Data to store.
            json_load: If True, JSON-encode the data.
            expire_seconds: Optional time-to-live in seconds.
        """
        try:
            full_key = f"{namespace}:{key}"
            value = json.dumps(data) if json_load else data
            # Use SET with EX for expiration if provided
            if expire_seconds is not None:
                return self.redis.set(full_key, value, ex=expire_seconds)
            return self.redis.set(full_key, value)
        except Exception:
            logger.exception("Failed to set cache value")
            raise

    def get(self, namespace: str, key: str, json_load: bool = True):
        """Retrieve a value from the Redis store."""
        try:
            full_key = f"{namespace}:{key}"
            raw = self.redis.get(full_key)
            if raw is None:
                return None
            if json_load:
                logger.info(f"Getting data from Redis (JSON): {full_key}")
                return json.loads(raw)
            logger.info(f"Getting data from Redis: {full_key}")
            return raw.decode()
        except Exception:
            return None

    def exists(self, namespace: str, key: str) -> bool:
        """Check if a key exists."""
        try:
            return bool(self.redis.exists(f"{namespace}:{key}"))
        except Exception:
            return False

    def lrange(self, namespace: str, key: str):
        """Retrieve a list of values from the Redis store."""
        try:
            return self.redis.lrange(f"{namespace}:{key}", 0, -1)
        except Exception:
            return None

    def rpush(self, namespace: str, key: str, values: list):
        """Append values to a list in the Redis store."""
        try:
            return self.redis.rpush(f"{namespace}:{key}", *values)
        except Exception:
            logger.exception("Failed to rpush values")
            raise

    def delete(self, namespace: str, key: str):
        """Delete a value from the Redis store."""
        try:
            self.redis.delete(f"{namespace}:{key}")
        except Exception:
            logger.exception("Failed to delete cache key")
            raise

    def get_data(self, key: str, namespace: str):
        """Retrieve cached data and ensure it exists."""
        if not self.exists(namespace=namespace, key=key):
            raise Exception("Invalid or Expired Cache Key")
        return self.get(namespace=namespace, key=key)

    def keys(self, namespace: str) -> list[str]:
        """Returns all keys in a given namespace"""
        try:
            pattern = f"{namespace}:*"
            keys = []
            for key in self.redis.scan_iter(match=pattern):
                # Remove namespace prefix
                keys.append(key.decode("utf-8").split(":", 1)[1])
            return keys
        except Exception:
            logger.exception("Failed to scan keys in namespace")
            return []

# Initialize cache manager with Redis backend
cache_manager = CacheManager(cache_backend=settings.redis_url)
