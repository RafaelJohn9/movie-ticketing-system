"""Application entry point for the FastAPI application."""

from fastapi import FastAPI

from app.api.exception_handlers import app_exception_handler
from app.core.exceptions import AppException
from app.core.logging import get_logger
from app.db import engine
from app.models.base import Base
from app.api.v1.tickets import ticket_router
from fastapi.middleware.cors import CORSMiddleware

# Get configured logger
logger = get_logger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://rafaeljohn9.github.io",
                   "https://rafaeljohn9.github.io/movie-ticketing-system",
                   ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the global exception handler
app.add_exception_handler(AppException, app_exception_handler)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint.

    This endpoint is used to check the health status of the edge application.

    Returns:
        dict: A dictionary containing the health status of the edge application.
    """
    return {"status": "edge healthy"}


# Create all tables if they do not exist
# Base.metadata.create_all(bind=engine, checkfirst=True)  # type: ignore


@app.on_event("startup")
def startup() -> None:
    """Startup event handler."""
    logger.info("Starting up the application.")

    # Check the database connection
    try:
        with engine.connect() as connection:
            logger.info(
                "Database connection established successfully."
                + str(connection)
            )
    except Exception as ex:
        logger.error(f"Database connection failed: {ex}")
        raise


routers = [
    ticket_router
]

for router in routers:
    app.include_router(router)
