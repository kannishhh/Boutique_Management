import Loader from "../../components/Loader";

export default function OrderTable({
  loading,
  filteredOrders,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  updateStatus,
  setSelectedOrderId,

  openPaymentHistory,
  showPaymentModal,
  setShowPaymentModal,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  addPayment,
  showPaymentHistory,
  setShowPaymentHistory,
  paymentHistory,
}) {
  return (
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
                <td>
                  {(() => {
                    const today = new Date();
                    const [day, month, year] = o.delivery_date.split("-");
                    const delivery = new Date(`${year}-${month}-${day}`);

                    const diffDays = Math.ceil(
                      (delivery - today) / (1000 * 60 * 60 * 24),
                    );

                    if (diffDays < 0) {
                      return (
                        <span className="text-red-600 font-semibold">
                          {o.delivery_date} (Overdue)
                        </span>
                      );
                    }

                    if (diffDays < 2) {
                      return (
                        <span className="text-orange-600 font-semibold">
                          {o.delivery_date} (Due Soon)
                        </span>
                      );
                    }
                    return <span>{o.delivery_date}</span>;
                  })()}
                </td>
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
                  <button
                    className="bg-blue-600 text-sm mr-2 underline"
                    onClick={() => {
                      setSelectedOrderId(o.order_id);
                      setShowPaymentModal(true);
                    }}
                  >
                    Add Payment
                  </button>

                  <button
                    className="text-green-600 text-sm mr-2 underline"
                    onClick={() => openPaymentHistory(o.order_id)}
                  >
                    View Payments
                  </button>

                  <select
                    className="border p-1 rounded"
                    value={o.status}
                    onChange={(e) => updateStatus(o.order_id, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CUTTING">Cutting</option>
                    <option value="STITCHING">Stitching</option>
                    <option value="TRIAL">Trial</option>
                    <option value="READY">Ready</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h3 className="text-lg font-semibold">Add Payment</h3>

            <input
              type="number"
              placeholder="Amount"
              className="w-full border p-3 rounded-lg"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />

            <select
              className="border p-3 rounded-lg w-full"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
            </select>

            <div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={addPayment}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
      {showPaymentHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h3 className="text-lg font-semibold">Payment History</h3>

            {paymentHistory.length === 0 ? (
              <p>No payments recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {paymentHistory.map((p) => (
                  <div
                    key={p.payment_id}
                    className="border p-3 rounded-lg flex justify-between"
                  >
                    <div>
                      <p className="font-semibold">₹ {p.amount}</p>
                      <p className="text-sm text-gray-500">
                        {p.payment_method}
                      </p>
                    </div>
                    <p className="text-sm">{p.payment_date}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowPaymentHistory(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
