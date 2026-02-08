from customers import add_customer, view_customers, delete_customer, edit_customer
from orders import (
    create_order,
    view_orders,
    update_order_status,
    view_pending_deliveries,
)
from billing import generate_bill


def show_menu():
    print("\n=============================")
    print(" BOUTIQUE MANAGEMENT APP")
    print("=============================")
    print("1. Add New Customer")
    print("2. View Customers")
    print("3. Edit Customers")
    print("4. Delete Customers")
    print("5. Create New Order")
    print("6. View Orders")
    print("7. Update Order Status")
    print("8. Generate Bill")
    print("9. View Pending Deliveries")
    print("10. Exit")
    print("-----------------------------")


def main():
    while True:
        show_menu()
        choice = input("Enter your choice: ").strip()

        if choice == "1":
            add_customer()

        elif choice == "2":
            view_customers()

        elif choice == "3":
            edit_customer()

        elif choice == "4":
            delete_customer()

        elif choice == "5":
            create_order()

        elif choice == "6":
            view_orders()

        elif choice == "7":
            update_order_status()

        elif choice == "8":
            generate_bill()

        elif choice == "9":
            view_pending_deliveries()

        elif choice == "10":
            print("Exiting the application. Goodbye!")
            break

        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()
