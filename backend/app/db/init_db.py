import logging
import sys
from urllib.parse import urlparse, urlunparse
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from app.core.config import settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db_init")


def get_postgres_default_url(db_url: str) -> str:
    """Modifies the database URL to point to the default 'postgres' database."""
    parsed = urlparse(db_url)
    # Replace path with '/postgres' or '/template1'
    new_path = "/postgres"
    return urlunparse(parsed._replace(path=new_path))


def check_and_create_db() -> bool:
    """Verifies connection and creates the database if it doesn't exist."""
    db_url = settings.DATABASE_URL
    parsed_url = urlparse(db_url)
    db_name = parsed_url.path.lstrip("/")

    logger.info(f"Connecting to database: {db_name}...")

    # Step 1: Try to connect to the target database
    try:
        engine = create_engine(db_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to the target database!")
            return True
    except OperationalError as e:
        # Check if the error is because the database does not exist
        error_msg = str(e)
        if "does not exist" in error_msg or "database" in error_msg.lower():
            logger.warning(f"Database '{db_name}' does not exist. Attempting to create it...")
            
            # Connect to default 'postgres' database
            default_url = get_postgres_default_url(db_url)
            try:
                default_engine = create_engine(default_url, isolation_level="AUTOCOMMIT")
                with default_engine.connect() as default_conn:
                    # In PostgreSQL, we cannot run CREATE DATABASE in a transaction block
                    default_conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                    logger.info(f"Database '{db_name}' created successfully!")
                
                # Try connecting to the newly created database again
                engine = create_engine(db_url)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                    logger.info("Successfully connected to the newly created database!")
                    return True
            except Exception as create_err:
                logger.error(f"Failed to create database: {create_err}")
                return False
        else:
            logger.error(f"Database connection failed with error: {e}")
            return False
    except Exception as e:
        logger.error(f"An unexpected error occurred while connecting: {e}")
        return False


if __name__ == "__main__":
    success = check_and_create_db()
    if success:
        logger.info("Database verification completed successfully.")
        sys.exit(0)
    else:
        logger.error("Database verification failed.")
        sys.exit(1)
