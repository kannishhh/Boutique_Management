from datetime import datetime, date
import json


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if hasattr(obj, "__dict__"):
            return obj.__dict__
        return super().default(obj)


class ResponseFormatter:
    @staticmethod
    def success(data=None, message="Success", status_code=200):

        return (
            {
                "status": "success",
                "message": message,
                "data": data,
            },
            status_code,
        )

    @staticmethod
    def error(message="An error occurred", status_code=400, details=None):
        response = {
            "status": "error",
            "message": message,
        }
        if details:
            response["details"] = details
        return response, status_code

    @staticmethod
    def paginated(items, total, page, page_size, message="Success"):
        total_pages = (total + page_size - 1) // page_size
        return (
            {
                "status": "success",
                "message": message,
                "data": items,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": total_pages,
                },
            },
            200,
        )

    @staticmethod
    def created(data, message="Resource created successfully"):
        return ResponseFormatter.success(data, message, 201)

    @staticmethod
    def no_content(message="No content"):
        return {"message": message}, 204

    @staticmethod
    def unauthorized(message="Unauthorized access"):
        return ResponseFormatter.error(message, 401)

    @staticmethod
    def forbidden(message="Access forbidden"):
        return ResponseFormatter.error(message, 403)

    @staticmethod
    def not_found(message="Resource not found"):
        return ResponseFormatter.error(message, 404)

    @staticmethod
    def conflict(message="Resource already exists"):
        return ResponseFormatter.error(message, 409)


class DataFormatter:

    @staticmethod
    def user_to_dict(user):
        if not user:
            return None
        return {
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "phone": user[3],
            "boutique_name": user[4],
            "profile_image": user[5],
        }

    @staticmethod
    def customer_to_dict(customer):
        if not customer:
            return None
        return {
            "id": customer[0],
            "name": customer[1],
            "email": customer[2],
            "phone": customer[3],
            "address": customer[4],
            "city": customer[5],
            "state": customer[6],
            "pincode": customer[7],
            "created_at": DataFormatter.format_date(customer[8]),
        }

    @staticmethod
    def order_to_dict(order):
        if not order:
            return None
        return {
            "id": order[0],
            "customer_id": order[1],
            "order_date": DataFormatter.format_date(order[2]),
            "delivery_date": DataFormatter.format_date(order[3]),
            "status": order[4],
            "amount": float(order[5]),
            "notes": order[6],
        }

    @staticmethod
    def payment_to_dict(payment):
        if not payment:
            return None
        return {
            "id": payment[0],
            "order_id": payment[1],
            "amount": float(payment[2]),
            "payment_date": DataFormatter.format_date(payment[3]),
            "payment_method": payment[4],
            "status": payment[5],
        }

    @staticmethod
    def format_date(date_obj, format_string="%d-%m-%Y"):
        if not date_obj:
            return None
        if isinstance(date_obj, str):
            return date_obj
        if isinstance(date_obj, (datetime, date)):
            return date_obj.strftime(format_string)
        return str(date_obj)

    @staticmethod
    def format_currency(amount, currency_symbol="₹"):
        if amount is None:
            return f"{currency_symbol}0.00"
        try:
            return f"{currency_symbol}{float(amount):,.2f}"
        except (ValueError, TypeError):
            return f"{currency_symbol}0.00"

    @staticmethod
    def format_phone(phone):
        if not phone:
            return ""
        phone = str(phone).strip()
        if len(phone) == 10:
            return f"+91-{phone[:5]}-{phone[5:]}"
        return phone

    @staticmethod
    def truncate_string(text, length=50):
        if not text:
            return ""
        text = str(text).strip()
        if len(text) <= length:
            return text
        return text[:length] + "..."


class QueryFormatter:

    @staticmethod
    def build_search_query(search_term, searchable_fields):
        if not search_term:
            return "", []

        search_term = f"%{search_term}%"
        conditions = [f"{field} LIKE ?" for field in searchable_fields]

        return " OR ".join(conditions), [search_term] * len(searchable_fields)

    @staticmethod
    def build_filter_query(filters):
        conditions = []
        values = []

        for field, value in filters.items():
            if value is not None:
                conditions.append(f"{field} = ?")
                values.append(value)

        if conditions:
            return " AND ".join(conditions), values
        return "", []

    @staticmethod
    def build_sort_query(sort_field, sort_order="ASC"):
        allowed_orders = ["ASC", "DESC"]
        sort_order = sort_order.upper()

        if sort_order not in allowed_orders:
            sort_order = "ASC"

        return f"ORDER BY {sort_field} {sort_order}"

    @staticmethod
    def build_pagination_query(page, page_size):
        if page < 1:
            page = 1
        if page_size < 1:
            page_size = 10

        offset = (page - 1) * page_size
        return f"LIMIT {page_size} OFFSET {offset}", page, page_size


class ValidationMessage:

    REQUIRED_FIELD = "{field} is required"
    INVALID_EMAIL = "Invalid email format"
    INVALID_PHONE = "Phone number must be 10 digits"
    INVALID_DATE = "Invalid date format (use DD-MM-YYYY)"
    INVALID_AMOUNT = "Amount must be a positive number"
    PASSWORD_TOO_SHORT = "Password must be at least 8 characters"
    PASSWORD_WEAK = "Password must contain letters and numbers"
    DUPLICATE_EMAIL = "Email already registered"
    DUPLICATE_USERNAME = "Username already taken"
    USER_NOT_FOUND = "User not found"
    INVALID_CREDENTIALS = "Invalid username or password"
    PERMISSION_DENIED = "You don't have permission to perform this action"
    RESOURCE_NOT_FOUND = "Resource not found"
    INVALID_REQUEST = "Invalid request data"

    @staticmethod
    def get_required_field_message(field_name):
        return ValidationMessage.REQUIRED_FIELD.format(field=field_name)
