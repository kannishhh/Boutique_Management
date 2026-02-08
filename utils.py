from datetime import datetime

def is_valid_mobile(mobile):
    return mobile.isdigit() and len(mobile) == 10


def confirm(prompt):
    return input(f"{prompt} (yes/no): ").strip().lower() == "yes"


def is_valid_date(date_str):
    try:
        datetime.strptime(date_str, "%d-%m-%Y")
        return True
    except ValueError:
        return False