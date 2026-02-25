"""Application settings module."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings using Pydantic BaseSettings."""

    database_url: str = "sqlite:///./dev.db"
    redis_url: str = "redis://localhost:6379/0"
    base_url: str = "http://localhost:8000"
    jwt_secret_key: str = "your_jwt_secret_key"

    # Email settings
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = "your-app@gmail.com"
    smtp_password: str = "your-app-password"
    smtp_sender_email: str = "your-app@gmail.com"

    # M-Pesa settings
    mpesa_consumer_key: str = "your_mpesa_consumer_key"
    mpesa_consumer_secret: str = "your_mpesa_consumer_secret"
    mpesa_shortcode: str = "your_mpesa_shortcode"
    mpesa_passkey: str = "your_mpesa_passkey"
    mpesa_callback_url: str = "http://yourdomain.com/api/v1/payments"
    mpesa_environment: str = "sandbox"  # or "production"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
