import re
from datetime import datetime, timedelta, date
import hashlib
import uuid


class DateHelper:

    @staticmethod
    def parse_date(date_string, format_string="%d-%m-%Y"):
        try:
            return datetime.strptime(date_string, format_string)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def format_date(date_obj, format_string="%d-%m-%Y"):
        if not date_obj:
            return None
        if isinstance(date_obj, str):
            return date_obj
        try:
            return date_obj.strftime(format_string)
        except (AttributeError, ValueError):
            return None

    @staticmethod
    def get_current_date(format_string="%d-%m-%Y"):
        return datetime.now().strftime(format_string)

    @staticmethod
    def get_current_datetime(format_string="%d-%m-%Y %H:%M:%S"):
        return datetime.now().strftime(format_string)

    @staticmethod
    def is_date_past(date_string, format_string="%d-%m-%Y"):
        try:
            date_obj = DateHelper.parse_date(date_string, format_string)
            return date_obj.date() < date.today()
        except (ValueError, AttributeError):
            return False

    @staticmethod
    def is_date_today(date_string, format_string="%d-%m-%Y"):
        try:
            date_obj = DateHelper.parse_date(date_string, format_string)
            return date_obj.date() == date.today()
        except (ValueError, AttributeError):
            return False

    @staticmethod
    def is_date_future(date_string, format_string="%d-%m-%Y"):
        try:
            date_obj = DateHelper.parse_date(date_string, format_string)
            return date_obj.date() > date.today()
        except (ValueError, AttributeError):
            return False

    @staticmethod
    def get_days_difference(date1_string, date2_string, format_string="%d-%m-%Y"):
        try:
            date1 = DateHelper.parse_date(date1_string, format_string)
            date2 = DateHelper.parse_date(date2_string, format_string)
            if date1 and date2:
                return abs((date2 - date1).days)
            return 0
        except (ValueError, AttributeError):
            return 0

    @staticmethod
    def add_days(date_string, days, format_string="%d-%m-%Y"):
        try:
            date_obj = DateHelper.parse_date(date_string, format_string)
            new_date = date_obj + timedelta(days=days)
            return DateHelper.format_date(new_date, format_string)
        except (ValueError, AttributeError):
            return None


class StringHelper:

    @staticmethod
    def sanitize(text):
        if not text:
            return ""
        text = str(text).strip()
        text = re.sub(r"\s+", " ", text)
        return text

    @staticmethod
    def capitalize_words(text):
        if not text:
            return ""
        return " ".join(word.capitalize() for word in text.split())

    @staticmethod
    def slugify(text):
        if not text:
            return ""
        text = str(text).lower().strip()
        text = re.sub(r"[^\w\s-]", "", text)
        text = re.sub(r"[-\s]+", "-", text)
        return text.strip("-")

    @staticmethod
    def truncate(text, length=50):
        if not text:
            return ""
        text = str(text).strip()
        if len(text) <= length:
            return text
        return text[:length] + "..."

    @staticmethod
    def generate_id(prefix=""):
        unique_id = str(uuid.uuid4()).replace("-", "")[:8]
        return f"{prefix}{unique_id}".upper() if prefix else unique_id.upper()

    @staticmethod
    def hash_string(text):
        if not text:
            return None
        return hashlib.sha256(str(text).encode()).hexdigest()


class CurrencyHelper:

    @staticmethod
    def format_currency(amount, currency_symbol="₹", decimals=2):
        if amount is None:
            amount = 0
        try:
            formatted = f"{currency_symbol}{float(amount):,.{decimals}f}"
            return formatted
        except (ValueError, TypeError):
            return f"{currency_symbol}0.00"

    @staticmethod
    def parse_currency(currency_string):
        if not currency_string:
            return 0.0
        try:
            currency_string = (
                str(currency_string).replace("₹", "").replace(",", "").strip()
            )
            return float(currency_string)
        except (ValueError, AttributeError):
            return 0.0

    @staticmethod
    def round_currency(amount, decimals=2):
        try:
            return round(float(amount), decimals)
        except (ValueError, TypeError):
            return 0.0

    @staticmethod
    def calculate_percentage(value, total):
        try:
            if total == 0:
                return 0.0
            return round((float(value) / float(total)) * 100, 2)
        except (ValueError, TypeError, ZeroDivisionError):
            return 0.0

    @staticmethod
    def calculate_discount(original_price, discount_percent):
        try:
            discount_amount = (float(original_price) * float(discount_percent)) / 100
            return round(float(original_price) - discount_amount, 2)
        except (ValueError, TypeError):
            return 0.0

    @staticmethod
    def format_phone(phone_number):
        if not phone_number:
            return ""
        phone = str(phone_number).strip()
        if len(phone) == 10:
            return f"+91-{phone[:5]}-{phone[5:]}"
        return phone


class ValidationHelper:

    @staticmethod
    def is_valid_email(email):
        if not email:
            return False
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, str(email)))

    @staticmethod
    def is_valid_phone(phone):
        if not phone:
            return False
        phone = str(phone).strip()
        return bool(re.match(r"^\d{10}$", phone))

    @staticmethod
    def is_valid_url(url):
        if not url:
            return False
        pattern = r"^https?://[^\s/$.?#].[^\s]*$"
        return bool(re.match(pattern, str(url), re.IGNORECASE))

    @staticmethod
    def is_strong_password(password):
        if not password or len(password) < 8:
            return False
        has_letter = any(c.isalpha() for c in password)
        has_digit = any(c.isdigit() for c in password)
        return has_letter and has_digit

    @staticmethod
    def is_valid_amount(amount):
        try:
            return float(amount) > 0
        except (ValueError, TypeError):
            return False


class ListHelper:

    @staticmethod
    def unique(items, key=None):
        if not items:
            return []
        if key is None:
            return list(set(items))
        seen = {}
        unique_items = []
        for item in items:
            item_key = item[key] if isinstance(item, dict) else getattr(item, key)
            if item_key not in seen:
                seen[item_key] = True
                unique_items.append(item)
        return unique_items

    @staticmethod
    def chunk(items, chunk_size):
        if not items or chunk_size <= 0:
            return []
        return [items[i : i + chunk_size] for i in range(0, len(items), chunk_size)]

    @staticmethod
    def flatten(nested_list):
        if not nested_list:
            return []
        result = []
        for item in nested_list:
            if isinstance(item, (list, tuple)):
                result.extend(ListHelper.flatten(item))
            else:
                result.append(item)
        return result

    @staticmethod
    def group_by(items, key):
        if not items:
            return {}
        grouped = {}
        for item in items:
            item_key = item[key] if isinstance(item, dict) else getattr(item, key)
            if item_key not in grouped:
                grouped[item_key] = []
            grouped[item_key].append(item)
        return grouped

    @staticmethod
    def sort_by(items, key, reverse=False):
        if not items:
            return []
        try:
            return sorted(
                items,
                key=lambda x: x[key] if isinstance(x, dict) else getattr(x, key),
                reverse=reverse,
            )
        except (KeyError, AttributeError):
            return items

    @staticmethod
    def find_index(items, key, value):
        if not items:
            return -1
        for idx, item in enumerate(items):
            item_value = (
                item[key] if isinstance(item, dict) else getattr(item, key, None)
            )
            if item_value == value:
                return idx
        return -1
