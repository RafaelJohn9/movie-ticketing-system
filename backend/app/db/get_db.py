"""Database session management using SQLAlchemy."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.settings import settings

DATABASE_URL = settings.database_url

# Create the SQLAlchemy engine.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {},
)

# Create a configured "Session" class.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency to get a database session.
def get_db() -> Generator[Session, None, None]:
    """Provide a database session to API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
