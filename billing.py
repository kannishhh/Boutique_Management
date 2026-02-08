from orders import orders


def generate_bill():
    if not orders:
        print("\nNo orders available.")
        return

    try:
        order_id = int(input("\nEnter Order ID for bill: "))
    except ValueError:
        print("Invalid Order ID.")
        return

    for o in orders:
        if o["order_id"] == order_id:
            print("\n========== BILL ==========")
            print(f"Order ID        : {o['order_id']}")
            print(f"Customer Name  : {o['customer_name']}")
            print(f"Mobile         : {o['mobile']}")
            print(f"Suit Type      : {o['suit_type']}")
            print(f"Cloth Provided : {'Yes' if o['cloth_provided'] else 'No'}")
            print("--------------------------")
            print(f"Total Price    : ₹{o['price']}")
            print(f"Advance Paid   : ₹{o['advance_paid']}")
            print(f"Balance Amount : ₹{o['balance']}")
            print("--------------------------")
            print(f"Delivery Date  : {o['delivery_date']}")
            print(f"Order Status   : {o['status']}")
            print("==========================")
            return

    print("Order ID not found.")
