import re
import time
from collections import defaultdict, deque
from threading import Lock
from urllib.parse import urlparse

from fastapi import HTTPException, Request, status


INTERNAL_PATH = re.compile(r"(?:[A-Za-z]:\\|/(?:home|users?|var|etc|root)/)", re.I)
SECRET_SHAPE = re.compile(r"(?i)(?:api[_-]?key|password|access[_-]?token)\s*[:=]\s*\S+")


def sanitize_answer(text: str) -> str:
    text = INTERNAL_PATH.sub("[internal path removed]", text)
    return SECRET_SHAPE.sub("[sensitive value removed]", text).strip()


def safe_public_url(url: str | None, allowed_hosts: set[str] | None = None) -> bool:
    if not url:
        return False
    if url.startswith(("#", "mailto:")):
        return True
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.netloc:
        return False
    return not allowed_hosts or parsed.hostname in allowed_hosts


class InMemoryRateLimiter:
    def __init__(self, requests: int, window_seconds: int):
        self.requests = requests
        self.window = window_seconds
        self.events: dict[str, deque[float]] = defaultdict(deque)
        self.lock = Lock()
        self.last_cleanup = time.monotonic()

    def check(self, key: str) -> None:
        now = time.monotonic()
        with self.lock:
            if now - self.last_cleanup >= self.window:
                expired = [name for name, events in self.events.items() if not events or events[-1] <= now - self.window]
                for name in expired:
                    self.events.pop(name, None)
                self.last_cleanup = now
            bucket = self.events[key]
            while bucket and bucket[0] <= now - self.window:
                bucket.popleft()
            if len(bucket) >= self.requests:
                raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests. Please try again shortly.")
            bucket.append(now)


def client_key(request: Request, session_id: str) -> str:
    host = request.client.host if request.client else "unknown"
    return f"{host}:{session_id}"
