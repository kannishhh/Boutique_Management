import { useEffect, useState } from "react";
import { fetchCalendarOrders } from "@/api/calendar.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import CalendarSkeleton from "@/components/skeletons/CalendarSkeleton";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await fetchCalendarOrders();
      setOrders(data || []);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const formatDateString = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
  };

  const getDeliveriesForDate = (day) => {
    const dateStr = formatDateString(day);
    return orders.filter((order) => order.delivery_date === dateStr);
  };

  const today = new Date();

  const overdueOrders = orders.filter((order) => {
    if (!order.delivery_date || order.status === "DELIVERED") return false;
    const [d, m, y] = order.delivery_date.split("-");
    const delivery = new Date(y, m - 1, d);
    return delivery < today;
  });

  const upcomingDeliveries = (() => {
    const grouped = {};

    orders
      .filter((order) => order.status !== "DELIVERED")
      .forEach((order) => {
        if (!order.delivery_date) return;
        if (!grouped[order.delivery_date]) {
          grouped[order.delivery_date] = [];
        }
        grouped[order.delivery_date].push(order);
      });

    return Object.entries(grouped)
      .sort(([a], [b]) => {
        const [d1, m1, y1] = a.split("-");
        const [d2, m2, y2] = b.split("-");
        return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
      })
      .slice(0, 7)
      .map(([date, orders]) => ({
        date,
        orders,
      }));
  })();

  function handlePrevMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  }

  function handleNextMonth() {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  }

  const formatDeliveryDate = (dateStr) => {
    if (!dateStr) return "";
    const [d, m, y] = dateStr.split("-");
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  if (loading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl mb-2">Delivery Calendar</h1>
        <p className="text-muted-foreground">
          Upcoming deliveried and workload planner
        </p>
      </div>

      {overdueOrders.length > 0 && (
        <Card className="p-6 rounded-2xl border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-4">
                {overdueOrders.length} Overdue Order
                {overdueOrders.length > 1 ? "s" : ""}
              </h3>

              <div className="space-y-3">
                {overdueOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="flex justify-between items-center bg-destructive rounded-xl px-4 py-3 shadow-sm"
                  >
                    <div className="text-sm">
                      <span className="font-medium">
                        ORD-{String(order.order_id).padStart(3, "0")}
                      </span>{" "}
                      • {order.customer_name} • {order.suit_type}
                    </div>

                    <div className="text-sm text-destructive-foreground">
                      Due: {formatDeliveryDate(order.delivery_date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-lg"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-lg"
              onClick={handleNextMonth}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={index} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const deliveries = getDeliveriesForDate(day);
              const isToday =
                today.getDate() === day &&
                today.getMonth() === currentDate.getMonth() &&
                today.getFullYear() === currentDate.getFullYear();

              const hasDeliveries = deliveries.length > 0;

              return (
                <div
                  key={day}
                  className={`aspect-square p-2 rounded-xl border-2 transition-all ${
                    isToday
                      ? "border-accent bg-accent/10"
                      : hasDeliveries
                        ? "border-accent/30 bg-accent/5 hover:bg-accent/10"
                        : "border-border hover:border-accent/30"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`text-sm mb-1 ${
                        isToday
                          ? "font-bold text-accent"
                          : "text-muted-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    {deliveries.length > 0 && (
                      <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                        {deliveries.slice(0, 2).map((order) => (
                          <div
                            key={order.order_id}
                            className="text-[10px] px-1 py-0.5 rounded truncate bg-muted text-muted-foreground"
                            title={`${order.customer_name || "Unknown"} - ${order.suit_type || "Unknown"}`}
                          >
                            {order.customer_name
                              ? order.customer_name.split(" ")[0]
                              : "Orders"}
                          </div>
                        ))}
                        {deliveries.length > 2 && (
                          <div
                            className="text-[10px]
                                         text-accent font-medium"
                          >
                            +{deliveries.length - 2}more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="w-5 h-5 text-accent" />
            <h3 className="text-xl">Next 7 Days</h3>
          </div>
          <div className="space-y-4">
            {upcomingDeliveries.map((schedule) => (
              <div
                key={schedule.date}
                className="p-4 bg-muted/30 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {formatDeliveryDate(schedule.date)}
                  </p>
                  <Badge className="bg-accent text-accent-foreground">
                    {schedule.orders.length} order
                    {schedule.orders.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {schedule.orders.map((order) => (
                    <div
                      key={order.order_id}
                      className="text-sm flex items-center justify-between"
                    >
                      <span className="text-muted-foreground">
                        ORD-{String(order.order_id).padStart(3, "0")} •{" "}
                        {order.customer_name}
                      </span>
                      <span className="font-medium">{order.suit_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <h3 className="text-xl mb-6">Daily Workload Distribution</h3>
          <div className="space-y-4">
            {upcomingDeliveries.map((schedule) => {
              const dayName = formatDeliveryDate(schedule.date);
              const maxOrders = 4;
              const percentage = (schedule.orders.length / maxOrders) * 100;

              return (
                <div key={schedule.date} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{dayName}</span>
                    <span className="text-sm text-muted-foreground">
                      {schedule.orders.length} deliveries
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentage > 75
                          ? "bg-accent"
                          : percentage > 50
                            ? "bg-accent/70"
                            : "bg-accent/40"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
