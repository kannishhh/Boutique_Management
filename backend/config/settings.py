import os


class Config:

    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-key-change-in-production"
    DEBUG = os.environ.get("FLASK_DEBUG", "True") == "True"

    DATABASE_URL = os.environ.get("DATABASE_URL")
    SQLITE_DB_PATH = os.environ.get("SQLITE_DB_PATH", "boutique.db")

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
    CORS_SUPPORTS_CREDENTIALS = (
        os.environ.get("CORS_SUPPORTS_CREDENTIALS", "True") == "True"
    )
    CORS_ALLOW_HEADERS = ["Content-Type", "Authorization"]
    CORS_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

    TOKEN_EXPIRY_MINUTES = int(os.environ.get("TOKEN_EXPIRY_MINUTES", "60"))

    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = int(
        os.environ.get("MAX_CONTENT_LENGTH", str(16 * 1024 * 1024))
    )
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

    DEFAULT_PAGE_SIZE = int(os.environ.get("DEFAULT_PAGE_SIZE", "50"))
    MAX_PAGE_SIZE = int(os.environ.get("MAX_PAGE_SIZE", "100"))

    CURRENCY_SYMBOL = os.environ.get("CURRENCY_SYMBOL", "₹")
    DATE_FORMAT = os.environ.get("DATE_FORMAT", "%Y-%m-%d")
    DATETIME_FORMAT = os.environ.get("DATETIME_FORMAT", "%Y-%m-%d %H:%M:%S")

    REMINDER_DAYS_BEFORE = int(os.environ.get("REMINDER_DAYS_BEFORE", "3"))

    @staticmethod
    def init_app(app):
        """Initialize application with this config."""
        pass


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""

    DEBUG = True
    TESTING = True
    SQLITE_DB_PATH = ":memory:"


config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}


current_config = config[os.environ.get("FLASK_ENV", "default")]
