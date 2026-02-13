import OrderForm from "../features/orders/OrderForm";
import OrderTable from "../features/orders/OrderTable";
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [mobile, setMobile] = useState("");
  const [suitType, setSuitType] = useState("");
  const [price, setPrice] = useState("");
  const [advance, setAdvance] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [clothProvided, setClothProvided] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [dueStats, setDueStats] = useState({ overdue: [], due_soon: [] });

  const [templates, setTemplates] = useState({});
  const [measurements, setMeasurements] = useState({});
  const [measurementHistory, setMeasurementHistory] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  async function loadData() {
    try {
      setLoading(true);
      const ordersData = await apiFetch("/orders");
      const customersData = await apiFetch("/customers");
      const dueData = await apiFetch("/orders/due");

      setOrders(ordersData);
      setCustomers(customersData);
      setDueStats(dueData);
    } catch (err) {
      toast.error("Failed to load orders or customers", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function createOrder(e) {
    e.preventDefault();

    if (!mobile || !suitType || !price || !advance || !deliveryDate) {
      toast.error("Please fill all fields");
      return;
    }

    if (Object.keys(measurements).length === 0) {
      toast.error("Please enter measurements.");
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
          measurement_values: measurements,
          cloth_provided: clothProvided,
          price: Number(price),
          advance_paid: Number(advance),
          delivery_date: format(deliveryDate, "dd-MM-yyyy"),
        }),
      });

      setMobile("");
      setSuitType("");
      setPrice("");
      setAdvance("");
      setDeliveryDate(null);
      setClothProvided(false);
      setMeasurements({});

      toast.success("Order created successfully");
      loadData();
    } catch (err) {
      toast.error("Failed to create order", {
        description: err.message,
      });
    }
  }

  async function updateStatus(id, status) {
    await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    toast.success(`Order status changed to ${status}`);
    loadData();
  }

  async function addPayment() {
    try {
      await apiFetch(`/orders/${selectedOrderId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(paymentAmount),
          method: paymentMethod,
        }),
      });

      toast.success("Payment added");
      setShowPaymentModal(false);
      setPaymentAmount("");
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function openPaymentHistory(orderId) {
    const data = await apiFetch(`/orders/${orderId}/payments`);
    setPaymentHistory(data);
    setShowPaymentHistory(true);
  }

  useEffect(() => {
    async function loadTemplates() {
      const data = await apiFetch("/api/templates");
      setTemplates(data);
    }
    loadTemplates();
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
      {(dueStats.overdue.length > 0 || dueStats.due_soon.length > 0) && (
        <div className="p-4 rounded-xl shadow bg-yellow-50 border border-yellow-200">
          {dueStats.overdue.length > 0 && (
            <p className="text-red-600 font-semibold">
              ⚠ {dueStats.overdue.length} order(s) overdue!
            </p>
          )}
          {dueStats.due_soon.length > 0 && (
            <p className="text-orange-600 font-semibold">
              ⏰ {dueStats.due_soon.length} order(s) due soon!
            </p>
          )}
        </div>
      )}

      <OrderForm
        createOrder={createOrder}
        customers={customers}
        templates={templates}
        mobile={mobile}
        setMobile={setMobile}
        suitType={suitType}
        setSuitType={setSuitType}
        measurements={measurements}
        setMeasurements={setMeasurements}
        measurementHistory={measurementHistory}
        setMeasurementHistory={setMeasurementHistory}
        setSelectedCustomerId={setSelectedCustomerId}
        price={price}
        setPrice={setPrice}
        advance={advance}
        setAdvance={setAdvance}
        deliveryDate={deliveryDate}
        setDeliveryDate={setDeliveryDate}
        clothProvided={clothProvided}
        setClothProvided={setClothProvided}
      />

      <OrderTable
        loading={loading}
        filteredOrders={filteredOrders}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        updateStatus={updateStatus}
        setSelectedOrderId={setSelectedOrderId}
        setShowPaymentModal={setShowPaymentModal}
        openPaymentHistory={openPaymentHistory}
        showPaymentModal={showPaymentModal}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        addPayment={addPayment}
        showPaymentHistory={showPaymentHistory}
        setShowPaymentHistory={setShowPaymentHistory}
        paymentHistory={paymentHistory}
      />
    </div>
  );
}
