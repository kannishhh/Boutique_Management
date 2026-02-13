import os

import json
from database import get_connection
from datetime import datetime, timedelta


def is_postgres():
    return os.getenv("DATABASE_URL") is not None


























