import { useEffect, useState } from "react";
import { apiFetch } from "@/api/client";
import { toast } from "sonner";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function loadStats() {
      try {
        const data = await apiFetch("/dashboard/stats");
        setStats(data);
      } catch (err) {
        toast.error("Failed to load dashboard stats");
      }
    }

    loadStats();
  }, []);

  async function generateReminders() {
    try {
      const data = await apiFetch("/reminders/generate", {
        method: "POST",
      });
      setReminders(data);
      toast.success("Reminders generated successfully", {
        description: "Check the reminders section for details",
      });
    } catch (err) {
      toast.error("Failed to generate reminders", {
        description:
          err.message || "An error occurred while generating reminders",
      });
    }
  }

  if (!stats) return <p className="p-6">Loading dashboard stats...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Boutique Dashboard</h1>

      <button
        onClick={generateReminders}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Generate Delivery Reminders
      </button>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 ">Total Orders</p>
          <p className="text-3xl font-bold">{stats.total_orders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 ">Pending Orders</p>
          <p className="text-3xl font-bold text-orange-600">
            {stats.pending_orders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 ">Delivered Orders</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.delivered_orders}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500 ">Revenue</p>
          <p className="text-3xl font-bold text-blue-600">₹{stats.revenue}</p>
        </div>
      </div>

      {reminders.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Generated Reminders</h2>

          <div className="space-y-3">
            {reminders.map((r, index) => (
              <div key={index} className="border p-3 rounded-lg">
                <p className="font-semibold">{r.mobile}</p>
                <p className="text-gray-600">{r.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
