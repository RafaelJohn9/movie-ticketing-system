"""Utility functions for generating One-Time Passwords (OTPs)."""

from collections.abc import Iterable
import secrets
import string


def generate_otp(
    length: int = 6,
    kind: str = "numeric",
    *,
    include_upper: bool = True,
    include_lower: bool = True,
    include_digits: bool = True,
    include_symbols: bool = False,
    custom_charset: Iterable[str] | None = None,
    exclude_ambiguous: bool = True,
) -> str:
    """Generate an OTP string using cryptographically secure randomness.

    Parameters:
      - length: number of characters in the OTP (>= 1).
      - kind: preset character set. One of:
          - "numeric": digits only (0-9)
          - "alpha": letters only (a-zA-Z)
          - "alphanumeric": letters + digits
          - "hex": hexadecimal digits (0-9, a-f)
          - "custom": use custom_charset and include_* flags
      - include_upper/include_lower/include_digits/include_symbols:
          Used when kind="custom" to build the character set.
      - custom_charset: additional iterable of characters to include
                        (kind="custom").
      - exclude_ambiguous: if True, exclude visually ambiguous characters:
          { '0', 'O', 'o', 'I', 'l', '1' }

    Returns:
      - OTP string of the requested length.

    Raises:
      - ValueError if parameters are invalid or the final charset is empty.
    """
    if not isinstance(length, int) or length < 1:
        raise ValueError("length must be a positive integer")

    kind = (kind or "").lower()
    ambiguous = set("0OoIl1")

    if kind == "numeric":
        charset = set(string.digits)
    elif kind == "alpha":
        charset = set(string.ascii_letters)
    elif kind == "alphanumeric":
        charset = set(string.ascii_letters + string.digits)
    elif kind == "hex":
        charset = set(
            string.hexdigits.lower()
        )  # contains a-f and digits, plus whitespace variants
        # Filter only 0-9 and a-f
        charset = {c for c in charset if c in "0123456789abcdef"}
    elif kind == "custom":
        charset = set()
        if include_lower:
            charset.update(string.ascii_lowercase)
        if include_upper:
            charset.update(string.ascii_uppercase)
        if include_digits:
            charset.update(string.digits)
        if include_symbols:
            # Common safe symbol set; adjust as needed
            charset.update("!@#$%^&*()-_=+[]{};:,.?/|~")
        if custom_charset:
            charset.update(
                {
                    c
                    for c in custom_charset
                    if isinstance(c, str) and len(c) == 1
                }
            )
    else:
        raise ValueError(
            "kind must be one of: numeric, alpha, alphanumeric, hex, custom"
        )

    if exclude_ambiguous:
        charset -= ambiguous

    # Ensure charset is valid and printable
    charset = {c for c in charset if c.isprintable() and not c.isspace()}
    if not charset:
        raise ValueError(
            "Character set is empty; adjust parameters to include characters"
        )

    # Generate using secrets for cryptographic safety
    return "".join(secrets.choice(tuple(charset)) for _ in range(length))
