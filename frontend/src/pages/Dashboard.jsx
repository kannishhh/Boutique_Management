import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/dashboard/stats").then((data) => {
      console.log("Dashboard stats:", data);
      setData(data);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `₹${data.stats.revenue}`,
      change: `${data.stats.revenue_growth}% `,
      icon: DollarSign,
      color: "text-accent",
    },
    {
      title: "Total Orders",
      value: data.stats.total_orders,
      change: `${data.stats.weekly_growth}% this week`,
      icon: ShoppingBag,
      color: "text-primary",
    },
    {
      title: "Delivered",
      value: data.stats.delivered_orders,
      change: `${data.stats.delivery_rate}%`,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Pending",
      value: data.stats.pending_orders,
      change: `${data.stats.pending_rate}%`,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "In Stitching",
      value: data.stats.in_stitching,
      change: `${data.stats.stitching_rate}%`,
      icon: Sparkles,
      color: "text-blue-600",
    },
    {
      title: "Ready",
      value: data.stats.ready,
      change: `${data.stats.ready_rate}%`,
      icon: Package,
      color: "text-purple-600",
    },
  ];

  const statusColors = {
    PENDING: "bg-orange-100 text-orange-700 border-orange-200",
    CUTTING: "bg-indigo-100 text-indigo-700 border-indigo-200",
    STITCHING: "bg-blue-100 text-blue-700 border-blue-200",
    TRIAL: "bg-purple-100 text-purple-700 border-purple-200",
    READY: "bg-violet-100 text-violet-700 border-violet-200",
    DELIVERED: "bg-green-100 text-green-700 border-green-200",
  };

  const statusLabels = {
    PENDING: "Pending",
    STITCHING: "In Stitching",
    READY: "Ready",
    DELIVERED: "Delivered",
    CUTTING: "Cutting",
    TRIAL: "Trial",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your boutique performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="p-6 rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-serif">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl mb-1">Monthly Revenue</h3>
            <p className="text-sm text-muted-foreground">
              Revenue trend over last 6 months
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenue_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5D4C1" />
              <XAxis dataKey="month" stroke="#6B6B6B" />
              <YAxis stroke="#6B6B6B" />
              <Tooltip
                contentStyle={{
                  color: "#2a2a2a",
                  backgroundColor: "#faf7f0",
                  border: "1px solid #E5D4C1",
                  borderRadius: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#C9A961"
                strokeWidth={3}
                dot={{ fill: "#C9A961", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl mb-1">Orders Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly order count</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.orders_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5D4C1" />
              <XAxis dataKey="month" stroke="#6B6B6B" />
              <YAxis stroke="#6B6B6B" />
              <Tooltip
                contentStyle={{
                  color: "#2a2a2a",
                  backgroundColor: "#faf7f0",
                  border: "1px solid #E5D4C1",
                  borderRadius: "12px",
                }}
              />
              <Bar
                dataKey="orders"
                color="#d4183d"
                fill="#1a1a1a"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl mb-1">Recent Orders</h3>
            <p className="text-sm text-muted-foreground">
              Latest order activity
            </p>
          </div>

          <div className="space-y-4">
            {data.recent_orders.map((order, i) => {
              const statusKey = order.status?.toUpperCase().trim();
              return (
                <div
                  key={i}
                  className="flex justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">{order.customer}</p>

                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColors[statusKey]}`}
                      >
                        {statusLabels[statusKey]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.id} • {order.outfit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-accent">{order.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.delivery}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl mb-1">Upcoming Deliveries</h3>
            <p className="text-sm text-muted-foreground">Delivery schedule</p>
          </div>

          <div className="space-y-4">
            {data.upcoming_deliveries.map((delivery, i) => (
              <div
                key={i}
                className="p-4 bg-accent/10 border border-accent/20 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{delivery.date}</p>
                  <Badge className="bg-accent text-accent-foreground">
                    {delivery.count} orders
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {delivery.orders}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
