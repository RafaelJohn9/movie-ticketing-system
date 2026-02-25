"""Password hashing and verification utilities using bcrypt."""

import bcrypt


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt.

    :param password: The plaintext password to hash.
    :return: The hashed password as a string.
    """
    # Generate a salt and hash the password
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plaintext_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hashed password.

    :param plaintext_password: The plaintext password to verify.
    :param hashed_password: The hashed password to compare against.
    :return: True if the password matches, False otherwise.
    """
    return bcrypt.checkpw(
        plaintext_password.encode("utf-8"), hashed_password.encode("utf-8")
    )
