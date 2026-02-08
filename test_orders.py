import requests

BASE = "http://127.0.0.1:5000"

order = {
    "mobile": "8054157448",
    "suit_type": "Kurta",
    "price": 1000,
    "advance_paid": 500,
    "delivery_date": "10-02-2026",
    "cloth_provided": True,
}

res = requests.post(f"{BASE}/orders", json=order)
print("CREATE:", res.json())

res = requests.get(f"{BASE}/orders")
print("ALL ORDERS:", res.json())

res = requests.patch(f"{BASE}/orders/1/status", json={"status": "DELIVERED"})
print("UPDATE: ", res.json())
