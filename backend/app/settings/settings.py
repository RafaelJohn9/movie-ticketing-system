"""Application settings module."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings using Pydantic BaseSettings."""

    # Core
    database_url: str
    jwt_secret_key: str

    # Environment
    environment: str = "development"
    base_url: str = "http://localhost:8000"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Email settings
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str
    smtp_password: str
    smtp_sender_email: str

    # M-Pesa settings
    mpesa_consumer_key: str
    mpesa_consumer_secret: str
    mpesa_shortcode: str
    mpesa_passkey: str
    mpesa_callback_url: str = (
        "http://localhost:8000/api/v1/payments"
    )
    mpesa_environment: str = "sandbox"  # or "production"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()


# --- Heroku Postgres Fix ---
if settings.database_url.startswith("postgres://"):
    settings.database_url = settings.database_url.replace(
        "postgres://",
        "postgresql://",
        1,
    )