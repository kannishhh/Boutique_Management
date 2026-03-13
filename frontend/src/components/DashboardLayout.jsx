import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { buildUploadUrl } from "@/api/baseUrl";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications.api";
import { fetchOrders } from "../api/orders.api";
import { fetchCustomers } from "../api/customers.api";
import { fetchMeasurements } from "../api/measurements.api";
import { fetchSettings } from "../api/settings.api";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Ruler,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Search,
  Sparkles,
  Menu,
  ArrowRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useUser } from "@/context/UserContext";
import { TIMERS } from "@/constants/app.constants";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ShoppingBag, label: "Orders", path: "/dashboard/orders" },
  { icon: Users, label: "Customers", path: "/dashboard/customers" },
  { icon: Ruler, label: "Measurements", path: "/dashboard/measurements" },
  { icon: TrendingUp, label: "Revenue", path: "/dashboard/revenue" },
  { icon: Calendar, label: "Calendar", path: "/dashboard/calendar" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function DashboardLayout({ onLogout }) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    orders: [],
    customers: [],
    measurements: [],
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [boutiqueName, setBoutiqueName] = useState("Golden Needle");
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

  useEffect(() => {
    loadBoutiqueName();

    const handleRefreshBoutiqueName = () => {
      loadBoutiqueName();
    };

    window.addEventListener("refreshBoutiqueName", handleRefreshBoutiqueName);

    return () => {
      window.removeEventListener(
        "refreshBoutiqueName",
        handleRefreshBoutiqueName,
      );
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }

      if (e.key === "Escape") {
        setSearchOpen(false);
      }

      if (e.key === "Enter" && searchOpen) {
        performSearch(searchQuery);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen, searchQuery]);

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, TIMERS.NOTIFICATION_REFRESH_INTERVAL);

    const handleRefreshNotifications = () => {
      loadNotifications();
    };
    window.addEventListener("refreshNotifications", handleRefreshNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "refreshNotifications",
        handleRefreshNotifications,
      );
    };
  }, []);

  async function loadNotifications() {
    try {
      const data = await fetchNotifications();
      setNotifications(data);

      const recentNotifications = data.slice(0, 4);
      setDisplayedNotifications(recentNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error.message);
    }
  }

  async function loadBoutiqueName() {
    try {
      const data = await fetchSettings();
      if (data?.boutique_name) {
        setBoutiqueName(data.boutique_name);
      }
    } catch {
      // Keep fallback name if settings request fails.
    }
  }

  async function loadNotificationsWithDelay() {
    await loadNotifications();
  }
  const unreadCount = displayedNotifications.filter((n) => !n.is_read).length;

  async function performSearch(query) {
    setSearchLoading(true);

    try {
      const [ordersRes, customersRes, measurementsRes] = await Promise.all([
        fetchOrders({ limit: 50 }),
        fetchCustomers(),
        fetchMeasurements(),
      ]);

      const orders = ordersRes.data || ordersRes || [];
      const customers = customersRes || [];
      const measurements = measurementsRes || [];

      const lowerQuery = query.toLowerCase();

      const filteredOrders = orders
        .filter((o) =>
          `${o.customer_name} ${o.suit_type} ${o.status} ORD-${String(
            o.order_id,
          ).padStart(3, "0")}`
            .toLowerCase()
            .includes(lowerQuery),
        )
        .slice(0, 5);

      const filteredCustomers = customers
        .filter((c) =>
          `${c.name}  ${c.mobile}`.toLowerCase().includes(lowerQuery),
        )
        .slice(0, 5);

      const filteredMeasurements = measurements
        .filter((m) =>
          `${m.customer_name} ${m.garment_type} ${m.gender}`
            .toLowerCase()
            .includes(lowerQuery),
        )
        .slice(0, 5);

      setSearchResults({
        orders: filteredOrders,
        customers: filteredCustomers,
        measurements: filteredMeasurements,
      });
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearchLoading(false);
    }
  }

  const handleResultClick = (type) => {
    setSearchOpen(false);
    setSearchQuery("");

    if (type === "orders") {
      navigate("/dashboard/orders");
    } else if (type === "customers") {
      navigate("/dashboard/customers");
    } else if (type === "measurements") {
      navigate("/dashboard/measurements");
    }
  };

  const totalResults =
    searchResults.orders.length +
    searchResults.customers.length +
    searchResults.measurements.length;

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "text-orange-600",
      CUTTING: "text-indigo-600",
      STITCHING: "text-blue-600",
      TRIAL: "text-purple-600",
      READY: "text-violet-600",
      DELIVERED: "text-green-600",
      CANCELLED: "text-red-600",
    };

    return colors[status] || "text-gray-600";
  };

  const userPhoto = user?.profile_image
    ? buildUploadUrl(`/uploads/profile/${user.profile_image}`)
    : null;

  const userInitials = user?.username?.slice(0, 2).toUpperCase() || "AU";

  async function handleNotificationClick(id) {
    await markNotificationRead(id);
    loadNotifications();
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    loadNotifications();
  }

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Sparkles
                className="w-8 h-8 text-sidebar-primary"
                strokeWidth={1.5}
              />
              <div>
                <h1 className="text-lg font-serif leading-tight">
                  {boutiqueName}
                </h1>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex-1 max-w-md ">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground " />
                <Input
                  placeholder="Search orders, customers..."
                  className="pl-10 bg-muted border-0 rounded-xl h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchOpen(true);
                      performSearch(searchQuery);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">Welcome back,</p>
              <p className="text-sm text-muted-foreground">
                {user?.profile_name || user?.username || "User"}
              </p>
            </div>

            <Popover
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            >
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 rounded-xl shadow-lg"
                align="end"
              >
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>
                <div className="max-h-100 overflow-y-auto p-2">
                  {displayedNotifications.length > 0 ? (
                    <div className="divide-y- divide-border">
                      {displayedNotifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() =>
                            handleNotificationClick(notification.id)
                          }
                          className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                            !notification.is_read ? "bg-accent/5" : ""
                          }`}
                        >
                          <p
                            className={`text-sm ${!notification.is_read ? "font-medium" : "text-muted-foreground"}`}
                          >
                            {notification.message}
                          </p>
                          {!notification.is_read && (
                            <span className="inline-block w-2 h-2 bg-accent rounded-full mt-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
                {displayedNotifications.length > 0 && unreadCount > 0 && (
                  <div className="p-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllRead}
                      className="w-full text-accent hover:text-accent hover:bg-accent/10"
                    >
                      Mark all as read
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Avatar className="border-2 border-accent">
              {userPhoto ? (
                <AvatarImage src={userPhoto} alt="User Photo" />
              ) : (
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {userInitials}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-150 rounded-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              Search Results
            </DialogTitle>
            <DialogDescription>
              {totalResults > 0
                ? `Found ${totalResults} result${totalResults !== 1 ? "s" : ""} for "${searchQuery}"`
                : searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "Enter a search query to find orders, customers, or measurements"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers, measurements..."
                className="pl-10 rounded-xl"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  performSearch(value);
                }}
                autoFocus
              />
            </div>
          </div>

          {searchLoading && (
            <div className="text-center py-6 text-muted-foreground">
              Searching...
            </div>
          )}
          <div className="overflow-y-auto max-h-100 space-y-4">
            {searchResults.orders.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders ({searchResults.orders.length})</span>
                </div>
                <div className="space-y-1">
                  {searchResults.orders.map((order) => (
                    <button
                      key={order.order_id}
                      onClick={() =>
                        handleResultClick("orders", order.order_id)
                      }
                      className="w-full text-left p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-accent transition-colors">
                            ORD-{String(order.order_id).padStart(3, "0")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_name} • {order.suit_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-medium ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchResults.customers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                  <Users className="w-4 h-4" />
                  <span>Customers ({searchResults.customers.length})</span>
                </div>
                <div className="space-y-1">
                  {searchResults.customers.map((customer) => (
                    <button
                      key={customer.customer_id}
                      onClick={() =>
                        handleResultClick("customers", customer.customer_id)
                      }
                      className="w-full text-left p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-accent transition-colors">
                            {customer.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.mobile}
                            {customer.email && ` • ${customer.email}`}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchResults.measurements.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-1">
                  <Ruler className="w-4 h-4" />
                  <span>
                    Measurements ({searchResults.measurements.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {searchResults.measurements.map((measurement) => (
                    <button
                      key={measurement.measurement_id}
                      onClick={() =>
                        handleResultClick(
                          "measurements",
                          measurement.measurement_id,
                        )
                      }
                      className="w-full text-left p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium group-hover:text-accent transition-colors">
                            {measurement.customer_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {measurement.garment_name} • {measurement.gender}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && searchQuery && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-2">No results found</p>
                <p className="text-sm text-muted-foreground/70">
                  Try searching with different keywords
                </p>
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-2">
                  Start typing to search
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Search for orders, customers, or measurements
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
