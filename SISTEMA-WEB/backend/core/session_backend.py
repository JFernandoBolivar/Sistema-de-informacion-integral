import time
from django.contrib.sessions.backends.db import SessionStore as DBStore
from django.db import OperationalError

class SessionStore(DBStore):
    def __init__(self, session_key=None):
        super().__init__(session_key)
        self.max_retries = 3
        self.retry_delay = 0.1  # seconds

    def _get_session_from_db(self):
        for attempt in range(self.max_retries):
            try:
                return super()._get_session_from_db()
            except OperationalError as e:
                if "database is locked" in str(e) and attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                    continue
                raise

    def save(self, must_create=False):
        for attempt in range(self.max_retries):
            try:
                return super().save(must_create)
            except OperationalError as e:
                if "database is locked" in str(e) and attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                    continue
                raise

    def delete(self, session_key=None):
        for attempt in range(self.max_retries):
            try:
                return super().delete(session_key)
            except OperationalError as e:
                if "database is locked" in str(e) and attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay * (attempt + 1))
                    continue
                raise

