import { use, useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const SUIT_TYPES = [
  "Kurta Pajama",
  "Pant Shirt",
  "3 Piece Suit",
  "Blazer",
  "Sherwani",
  "Lehenga Blouse",
  "Salwar Suit",
  "Alteration",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [mobile, setMobile] = useState("");
  const [suitType, setSuitType] = useState("");
  const [price, setPrice] = useState("");
  const [advance, setAdvance] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [clothProvided, setClothProvided] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function loadData() {
    try {
      setLoading(true);
      const ordersData = await apiFetch("/orders");
      const customersData = await apiFetch("/customers");
      setOrders(ordersData);
      setCustomers(customersData);
    } catch {
      toast.error("Failed to load orders or customers");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  }

  async function createOrder(e) {
    e.preventDefault();

    if (!mobile || !suitType || !price || !advance || !deliveryDate) {
      toast.error("Please fill all fields");
      return;
    }

    if (Number(advance) > Number(price)) {
      toast.error("Advance cannot exceed price");
      return;
    }

    try {
      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          mobile,
          suit_type: suitType,
          cloth_provided: clothProvided,
          price: Number(price),
          advance_paid: Number(advance),
          delivery_date: formatDate(deliveryDate),
        }),
      });

      setMobile("");
      setSuitType("");
      setPrice("");
      setAdvance("");
      setDeliveryDate("");
      setClothProvided(false);

      toast.success("Order created successfully");
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function updateStatus(id, status) {
    const ok = confirm("Mark this order as delivered?");
    if (!ok) return;

    await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    toast.success("Order delivered!");
    loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.customer_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Create Order</h2>

        <form onSubmit={createOrder} className="grid grid-cols-3 gap-4">
          <select
            className="border p-3 rounded-lg"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          >
            <option>Select Customer</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.mobile}>
                {c.name} ({c.mobile})
              </option>
            ))}
          </select>

          <select
            className="border p-3 rounded-lg"
            value={suitType}
            onChange={(e) => setSuitType(e.target.value)}
          >
            <option value="">Select Suit Type</option>
            {SUIT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            className="border p-3 rounded-lg"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="number"
            min="0"
            max={price || 0}
            className="border p-3 rounded-lg"
            placeholder="Advance Paid"
            value={advance}
            onChange={(e) => setAdvance(e.target.value)}
          />

          <input
            className="border p-3 rounded-lg"
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={clothProvided}
              onChange={(e) => setClothProvided(e.target.checked)}
            />
            Customer provided cloth
          </label>

          <button className="col-span-3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Create Order
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Orders</h2>

        <div className="flex gap-4 mb-4">
          <input
            className="border p-3 rounded-lg w-72"
            placeholder="Search by customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-3 rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
        {loading ? (
          <Loader />
        ) : filteredOrders.length === 0 ? (
          <p className="text-gray-500 mb-4">No Matching orders found</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Order ID</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Suit Type</th>
                <th>Cloth Provided</th>
                <th>Price</th>
                <th>Advance</th>
                <th>Balance</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.order_id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{o.order_id}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.mobile}</td>
                  <td>{o.suit_type}</td>
                  <td>{o.cloth_provided ? "Customer Cloth" : "Shop Cloth"}</td>
                  <td>₹{o.price}</td>
                  <td>₹{o.advance_paid}</td>
                  <td>₹{o.balance}</td>
                  <td>{o.delivery_date}</td>
                  <td>
                    <span
                      className={
                        o.status === "DELIVERED"
                          ? "text-green-600 font-semibold"
                          : "text-orange-600 font-semibold"
                      }
                    >
                      {o.status}
                    </span>
                  </td>
                  <td>
                    {o.status !== "DELIVERED" && (
                      <button
                        onClick={() => updateStatus(o.order_id, "DELIVERED")}
                        className="text-green-600 font-semibold cursor-pointer hover:underline"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
