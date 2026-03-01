"""Application settings module."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings using Pydantic BaseSettings."""

    # Project metadata.
    project_name: str = "Movie Ticketing System"
    version: str = "0.1.0"

    # Core
    database_url: str
    jwt_secret_key: str="supersecretkey"

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
        "http://localhost:8000/payments"
    )
    mpesa_environment: str = "sandbox"  # or "production"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

    # CORS settings
    cors_origins: list[str] = [
        "http://localhost:5173",
        "https://rafaeljohn9.github.io",
        "https://rafaeljohn9.github.io/movie-ticketing-system",
        "https://tickets.mutcu.org",
    ]

    # Access Token settings
    access_token_expires_in: int = 21600  # 6 hours in seconds

    # Admin credentials
    admin_email: str
    admin_password: str
    admin_phone_number: str
    admin_full_name: str = "Admin User"


settings = Settings()


# --- Heroku Postgres Fix ---
if settings.database_url.startswith("postgres://"):
    settings.database_url = settings.database_url.replace(
        "postgres://",
        "postgresql://",
        1,
    )
