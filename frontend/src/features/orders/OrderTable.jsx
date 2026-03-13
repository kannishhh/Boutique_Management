import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Edit2, Eye, Search, Trash2, TriangleAlert } from "lucide-react";
import { Badge } from "../../components/ui/badge";

export default function OrderTable({
  filteredOrders,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onViewOrder,
  onEditOrder,
  onDeleteOrder,
  onPayOrder,
}) {
  const statusColors = {
    PENDING: "bg-orange-100 text-orange-700 border-orange-200",
    CUTTING: "bg-indigo-100 text-indigo-700 border-indigo-200",
    STITCHING: "bg-blue-100 text-blue-700 border-blue-200",
    TRIAL: "bg-purple-100 text-purple-700 border-purple-200",
    READY: "bg-violet-100 text-violet-700 border-violet-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10 rounded-xl"
              placeholder="Search by customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "ALL"
                  ? "text-accent bg-accent-50 underline"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              All Orders
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "PENDING"
                  ? "text-orange-700 bg-orange-50 underline"
                  : "text-muted-foreground hover:text-orange-600"
                }`}
            >
              Pending
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={() => setStatusFilter("STITCHING")}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "STITCHING"
                  ? "text-blue-700 bg-blue-50 underline"
                  : "text-muted-foreground hover:text-blue-600"
                }`}
            >
              Stitching
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={() => setStatusFilter("READY")}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "READY"
                  ? "text-violet-700 bg-violet-50 underline"
                  : "text-muted-foreground hover:text-violet-600"
                }`}
            >
              Ready
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={() => setStatusFilter("DELIVERED")}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "DELIVERED"
                  ? "text-green-700 bg-green-50 underline"
                  : "text-muted-foreground hover:text-green-600"
                }`}
            >
              Delivered
            </button>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="font-medium">Customer</th>
                  <th className="font-medium">Outfit</th>
                  <th className="font-medium">Delivery</th>
                  <th className="font-medium">Status</th>
                  <th className="font-medium">Payment</th>
                  <th className="font-medium">Price</th>
                  <th className="text-center pr-6 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((o) => {

                  return (
                    <tr
                      key={o.order_id}
                      className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 font-medium">
                        ORD-{String(o.order_id).padStart(3, "0")}
                      </td>

                      <td>{o.customer_name}</td>

                      <td className="text-muted-foreground">{o.suit_type}</td>

                      <td className="text-muted-foreground text-sm">
                        {o.delivery_date}
                      </td>

                      <td>
                        <Badge
                          variant="outline"
                          className={
                            statusColors[o.status] || statusColors.PENDING
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>

                      <td>
                        <Badge
                          variant="outline"
                          className={`rounded-xl px-3 py-1 text-xs font-medium flex items-center gap-1${o.payment_status === "PAID"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : o.payment_status === "PARTIAL"
                                ? o.status === "DELIVERED"
                                  ? "border-destructive/50 bg-destructive/90 text-white"
                                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-muted text-muted-foreground border-muted"
                            } 
                            `}
                        >
                          {o.payment_status === "PARTIAL" &&
                            o.status === "DELIVERED" && (
                              <TriangleAlert className="w-3 h-3" />
                            )}

                          {o.payment_status === "PARTIAL" &&
                            o.status === "DELIVERED"
                            ? "DUE"
                            : o.payment_status}
                        </Badge>
                      </td>

                      <td className="text-accent font-medium">₹{o.price}</td>

                      <td className="pr-6">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewOrder(o)}
                            className="p-2 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditOrder(o)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-all"
                            title="Edit Order"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onPayOrder(o)}
                            className="p-2 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-all"
                            title="Manage Payment"
                          >
                            ₹
                          </button>

                          <button
                            onClick={() => onDeleteOrder(o)}
                            className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-all"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="h-6 w-px bg-border mx-1"></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
