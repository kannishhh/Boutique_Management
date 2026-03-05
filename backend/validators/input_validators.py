from datetime import datetime


def is_valid_mobile(mobile):
    """Validate mobile number (10 digits)."""
    return mobile.isdigit() and len(mobile) == 10


def is_valid_date(date_str):
    """Validate date string in DD-MM-YYYY format."""
    try:
        datetime.strptime(date_str, "%d-%m-%Y")
        return True
    except ValueError:
        return False


def is_valid_amount(amount):
    """Validate that amount is positive number."""
    try:
        return float(amount) > 0
    except (ValueError, TypeError):
        return False
