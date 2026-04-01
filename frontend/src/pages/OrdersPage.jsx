import OrderForm from "../features/orders/OrderForm";
import OrderTable from "../features/orders/OrderTable";
import { useEffect, useState } from "react";
import {
  createOrder as createOrderApi,
  deleteOrder,
  fetchDueOrders,
  fetchOrders,
  updateOrder,
  updateOrderStatus,
} from "../api/orders.api";
import { fetchCustomers } from "../api/customers.api";
import { fetchMeasurementTemplates } from "../api/measurements.api";
import { getPayments, addPayments } from "../api/payments.api";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Package, Plus, User, Wallet, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/confirmDialog";
import { LuxurySelect } from "@/components/LuxurySelect";
import OrdersSkeleton from "@/components/skeletons/OrdersPageSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddPaymentDialog, PaymentHistoryModal } from "@/features/payments/PaymentLedger";
import PaymentLedgerSection from "@/features/payments/PaymentLedgerSection";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [mobile, setMobile] = useState("");
  const [suitType, setSuitType] = useState("");
  const [gender, setGender] = useState("");
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

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [viewOrderDialog, setViewOrderDialog] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [measurementHistory, setMeasurementHistory] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);


  const [editOrderDialog, setEditOrderDialog] = useState(false);
  const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);


  const [paymentOrder, setPaymentOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const statusColors = {
    PENDING: "bg-orange-100 text-orange-700 border-orange-200",
    CUTTING: "bg-indigo-100 text-indigo-700 border-indigo-200",
    STITCHING: "bg-blue-100 text-blue-700 border-blue-200",
    TRIAL: "bg-purple-100 text-purple-700 border-purple-200",
    READY: "bg-violet-100 text-violet-700 border-violet-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
  };

  function getPaymentBadgeStyle(status) {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 border-green-200";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "PENDING":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  }

  const [editForm, setEditForm] = useState({
    customer_name: "",
    mobile: "",
    suit_type: "",
    price: "",
    advance_paid: "",
    delivery_date: "",
    cloth_provided: false,
    status: "PENDING",
  });

  async function loadData() {
    try {
      setLoading(true);
      const [ordersData, customersData, dueData] = await Promise.all([
        fetchOrders(),
        fetchCustomers(),
        fetchDueOrders(),
      ]);

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

    if (isCreatingOrder) {
      return;
    }

    try {
      setIsCreatingOrder(true);
      await createOrderApi({
        mobile,
        suit_type: suitType,
        gender,
        measurement_values: measurements,
        cloth_provided: clothProvided,
        price: Number(price),
        advance_paid: Number(advance),
        delivery_date: format(deliveryDate, "dd-MM-yyyy"),
      });

      toast.success("Order created successfully");
      setShowCreateDialog(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error("Failed to create order", {
        description: err.message,
      });
    } finally {
      setIsCreatingOrder(false);
    }
  }

  const normalizePayments = (payments = []) => {
    if (!Array.isArray(payments)) return [];

    return payments.map((payment) => ({
      ...payment,
      amount: Number(payment.amount) || 0,
      payment_method: payment.payment_method || payment.method || "CASH",
      payment_date: payment.payment_date || payment.date || "",
    }));
  };

  const getOrderCreatedDate = (value) => {
    if (!value) return "";

    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      return value;
    }

    try {
      const parsed = parseISO(String(value));
      if (isValid(parsed)) {
        return format(parsed, "dd-MM-yyyy");
      }
    } catch {
      // Fallback below for non-ISO values.
    }

    const fallback = new Date(String(value));
    if (Number.isNaN(fallback.getTime())) {
      return "";
    }

    return format(fallback, "dd-MM-yyyy");
  };

  const buildDisplayPayments = (order, payments = []) => {
    const normalized = normalizePayments(payments);
    const orderPaid = Number(order?.advance_paid) || 0;
    const ledgerPaid = normalized.reduce(
      (sum, payment) => sum + (Number(payment.amount) || 0),
      0,
    );

    const inferredInitialAmount = Math.max(orderPaid - ledgerPaid, 0);

    if (inferredInitialAmount <= 0) {
      return normalized;
    }

    return [
      ...normalized,
      {
        payment_id: `initial-${order?.order_id ?? "payment"}`,
        amount: inferredInitialAmount,
        payment_method: "ADVANCE",
        payment_date: getOrderCreatedDate(order?.created_at) || "Order Created",
      },
    ];
  };

  async function openPaymentHistory(order) {
    try {
      const res = await getPayments(order.order_id);
      setPaymentHistory(buildDisplayPayments(order, res.payments));
    } catch {
      setPaymentHistory(buildDisplayPayments(order, []));
      toast.error("Failed to load payments");
    }
  }

  async function addPayment(amount, method) {
    if (!selectedOrderId) {
      toast.error("Order not selected for payment");
      return;
    }

    try {
      await addPayments(selectedOrderId, {
        amount: Number(amount),
        method,
      });

      toast.success("Payment added");

      const activeOrder = paymentOrder?.order_id === selectedOrderId
        ? paymentOrder
        : selectedOrder?.order_id === selectedOrderId
          ? selectedOrder
          : null;

      const updatedOrder = activeOrder
        ? {
          ...activeOrder,
          advance_paid: (Number(activeOrder.advance_paid) || 0) + Number(amount),
        }
        : activeOrder;

      if (updatedOrder) {
        setPaymentOrder((prev) =>
          prev?.order_id === updatedOrder.order_id ? updatedOrder : prev,
        );
        setSelectedOrder((prev) =>
          prev?.order_id === updatedOrder.order_id ? updatedOrder : prev,
        );
      }

      await openPaymentHistory(updatedOrder || activeOrder || { order_id: selectedOrderId, advance_paid: 0 });

      setShowPaymentModal(false);
      loadData();
    } catch {
      toast.error("Failed to add payment");
    }
  }

  function resetForm() {
    setMobile("");
    setSuitType("");
    setPrice("");
    setAdvance("");
    setDeliveryDate(null);
    setClothProvided(false);
    setMeasurements({});
  }

  async function updateStatus(id, status) {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Order status changed to ${status}`);
      loadData();

      if (status === "READY" || status === "DELIVERED") {
        window.dispatchEvent(new Event("refreshNotifications"));
      }
    } catch (err) {
      toast.error("Failed to update status", {
        description: err.message,
      });
    }
  }

  async function saveEditedOrder(e) {
    e.preventDefault();

    try {
      const previousStatus = selectedOrder?.status;

      await updateOrder(selectedOrder.order_id, editForm);

      toast.success("Order updated successfully");
      setEditOrderDialog(false);
      loadData();

      const newStatus = editForm.status;
      if (
        (newStatus === "READY" || newStatus === "DELIVERED") &&
        previousStatus !== newStatus
      ) {
        window.dispatchEvent(new Event("refreshNotifications"));
      }
    } catch (err) {
      toast.error("Failed to update order", {
        description: err.message,
      });
    }
  }

  async function confirmDeleteOrder() {
    setIsDeleting(true);
    try {
      await deleteOrder(selectedOrder.order_id);
      toast.success("Order deleted successfully");
      setDeleteOrderDialog(false);
      loadData();
    } catch {
      toast.error("Failed to delete order");
    }
    setIsDeleting(false);
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewOrderDialog(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);

    setEditForm({
      customer_name: order.customer_name,
      mobile: order.mobile,
      suit_type: order.suit_type,
      price: order.price,
      advance_paid: order.advance_paid,
      delivery_date: order.delivery_date,
      cloth_provided: order.cloth_provided,
      status: order.status,
    });

    setEditOrderDialog(true);
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setDeleteOrderDialog(true);
  };

  const handlePayOrder = async (order) => {
    setPaymentOrder(order);
    setSelectedOrder(order);
    setSelectedOrderId(order.order_id);
    await openPaymentHistory(order);
  };

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await fetchMeasurementTemplates();
        setTemplates(data);
      } catch (err) {
        toast.error("Failed to load templates", {
          description: err.message,
        });
      }
    }
    loadTemplates();
    loadData();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.customer_name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <OrdersSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl mb-2">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all boutique orders
          </p>
        </div>

        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Order
        </Button>
      </div>

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="p-8 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif">Create New Order</h2>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <OrderForm
              createOrder={createOrder}
              isSubmitting={isCreatingOrder}
              customers={customers}
              templates={templates}
              mobile={mobile}
              setMobile={setMobile}
              suitType={suitType}
              gender={gender}
              setGender={setGender}
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
          </Card>
        </div>
      )}

      <OrderTable
        loading={loading}
        filteredOrders={filteredOrders}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        updateStatus={updateStatus}
        onViewOrder={handleViewOrder}
        onEditOrder={handleEditOrder}
        onDeleteOrder={handleDeleteOrder}
        onPayOrder={handlePayOrder}
        showPaymentModal={showPaymentModal}
      />

      <AddPaymentDialog
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onAddPayment={addPayment}
        currentPaid={paymentOrder?.advance_paid || 0}
        totalPrice={paymentOrder?.price || 0}
        remainingBalance={(paymentOrder?.price || 0) - (paymentOrder?.advance_paid || 0)}
      />

      {paymentOrder && (
        <Dialog
          open={true}
          onOpenChange={() => {
            setPaymentOrder(null);
            setPaymentHistory([]);
            setShowPaymentHistory(false);
          }}
        >
          <DialogContent className="max-w-lg max-h-[90vh] rounded-2xl overflow-hidden p-0 flex flex-col">
            <DialogHeader className="p-2">
            </DialogHeader>

            <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
              <PaymentLedgerSection
                totalPrice={paymentOrder.price}
                totalPaid={paymentOrder.advance_paid}
                payments={paymentHistory}
                maxVisiblePayments={1}
                onViewFullHistory={() => setShowPaymentHistory(true)}
                onAddPayment={() => {
                  setSelectedOrderId(paymentOrder.order_id);
                  setShowPaymentModal(true);
                }}
                showAddButton={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <PaymentHistoryModal
        open={showPaymentHistory}
        onClose={() => setShowPaymentHistory(false)}
        payments={paymentHistory}
        orderTotal={paymentOrder?.price || 0}
        orderPaid={paymentOrder?.advance_paid || 0}
        startingIndex={Math.min(1, paymentHistory.length)}
      />

      {viewOrderDialog && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif">Order Details</h2>
              <button
                onClick={() => setViewOrderDialog(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-accent/10 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                  <p className="text-xl font-medium">
                    ORD-{String(selectedOrder.order_id).padStart(3, "0")}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    statusColors[selectedOrder.status] || statusColors.PENDING
                  }
                >
                  {selectedOrder.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <User className="w-5 h-5" />
                  <h3 className="font-medium text-lg">Customer Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 ">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mobile</p>
                    <p className="font-medium">
                      {selectedOrder.mobile || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-accent">
                  <Package className="w-5 h-5" />
                  <h3 className="font-medium text-lg">Order Details</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Outfit Type
                    </p>
                    <p className="font-medium">{selectedOrder.suit_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Delivery Date
                    </p>
                    <p className="font-medium">{selectedOrder.delivery_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Cloth Provided
                    </p>
                    <p className="font-medium">
                      {selectedOrder.cloth_provided ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {/* <PaymentLedgerSection
                totalPrice={selectedOrder.price}
                totalPaid={selectedOrder.advance_paid}
                payments={paymentHistory}
                onAddPayment={() => {
                  setSelectedOrderId(selectedOrder.order_id);
                  setShowPaymentModal(true);
                }}
                showAddButton={true} /> */}

              {selectedOrder.measurement_values && (
                <div className="space-y-3">
                  <h3 className="font-medium text-lg text-accent">
                    Measurements
                  </h3>
                  <div className="p-4 bg-muted/30 rounded-xl">
                    <p className="text-sm text-muted-foreground">
                      {typeof selectedOrder.measurement_values === "string"
                        ? selectedOrder.measurement_values
                        : JSON.stringify(
                          selectedOrder.measurement_values,
                          null,
                          2,
                        )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setViewOrderDialog(false);
                    handleEditOrder(selectedOrder);
                  }}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                >
                  Edit Order
                </Button>
                <Button
                  onClick={() => setViewOrderDialog(false)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {editOrderDialog && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-serif">Edit Order</h2>
              <button
                onClick={() => setEditOrderDialog(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6" onSubmit={saveEditedOrder}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    value={editForm.customer_name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        customer_name: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outfit Type</Label>
                  <Input
                    value={editForm.suit_type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        suit_type: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Price (₹)</Label>
                  <Input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Advance Paid (₹)</Label>
                  <Input
                    value={editForm.advance_paid}
                    disabled
                    className="rounded-xl opacity-70 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Payment can only be modified via{" "}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-sm text-accent underline underline-offset-2 hover:text-accent/80"
                      onClick={async () => {
                        setEditOrderDialog(false);
                        await handlePayOrder(selectedOrder);
                      }}
                    >
                      <Wallet className="w-3 h-3" />
                      Payment Manager
                    </button>
                    .
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Date</Label>
                  <Input
                    value={editForm.delivery_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        delivery_date: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <LuxurySelect
                    value={editForm.status}
                    onChange={(newStatus) =>
                      setEditForm({
                        ...editForm,
                        status: newStatus,
                      })
                    }
                    options={[
                      { value: "PENDING", label: "Pending" },
                      { value: "CUTTING", label: "Cutting" },
                      { value: "STITCHING", label: "Stitching" },
                      { value: "TRIAL", label: "Trial" },
                      { value: "READY", label: "Ready" },
                      { value: "DELIVERED", label: "Delivered" },
                    ]}
                    placeholder="Select status"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  onClick={() => setEditOrderDialog(false)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteOrderDialog}
        onClose={() => setDeleteOrderDialog(false)}
        onConfirm={confirmDeleteOrder}
        title="Delete Order"
        description={`Are you sure you want to delete order ${selectedOrder ? `ORD-${String(selectedOrder.order_id).padStart(3, "0")}` : ""}? This action cannot be undone and will permanently remove all order data.`}
        confirmText="Delete Order"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}
