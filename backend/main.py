"""Application entry point for the FastAPI application."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect
from sqlalchemy.exc import SQLAlchemyError

from app.api.exception_handlers import app_exception_handler
from app.api.v1.tickets import ticket_router
from app.api.v1.admin import router as admin_router
from app.core.exceptions import AppException
from app.core.logging import get_logger
from app.db import engine, get_db
from app.models.base import Base
from app.settings import settings
from app.security import hash_password

logger = get_logger(__name__)


async def create_admin_user(db):
    """Create an admin user if it doesn't exist."""
    from app.repositories.user_repository import UserRepository

    existing_admin = await UserRepository.get_by_fields(db, email=settings.admin_email)

    if existing_admin:
        logger.info("Admin user already exists.")
        return

    admin_data = {
        "email": settings.admin_email,
        "password": hash_password(settings.admin_password),
        "phone_number": settings.admin_phone_number,
        "full_name": settings.admin_full_name,
        "role": "admin",
    }

    await UserRepository.create(db, admin_data)



@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown lifecycle.

    Responsibilities:
    - Verify database connectivity
    - Optionally create tables in development
    - Log startup/shutdown events
    """
    logger.info("Application startup initiated.")

    try:
        # with engine.connect() as connection:
        #     logger.info("Database connection established.")

        #     inspector = inspect(connection)

        #     if not inspector.get_table_names():
        #         Base.metadata.create_all(bind=engine)
        #         logger.info("Database tables created.")
        #     else:
        #         logger.info("Database tables already exist.")

        db = next(get_db())
        await create_admin_user(db)

    except SQLAlchemyError as exc:
        logger.critical("Database initialization failed.", exc_info=exc)
        raise

    yield

    logger.info("Application shutdown complete.")


def create_application() -> FastAPI:
    """Application factory.

    Returns:
        FastAPI: Configured FastAPI application instance.
    """
    application = FastAPI(
        title=settings.project_name,
        version=settings.version,
        lifespan=lifespan,
    )

    # Middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handlers
    application.add_exception_handler(
        AppException,
        app_exception_handler,
    )

    # Health check
    @application.get("/health", tags=["Health"])
    async def health_check() -> dict[str, str]:
        """Health check endpoint.

        Returns:
            dict[str, str]: Service health status.
        """
        return {"status": "healthy"}

    # Include routers
    routers = [ticket_router, admin_router]
    for router in routers:
        application.include_router(router)

    return application


app: FastAPI = create_application()
