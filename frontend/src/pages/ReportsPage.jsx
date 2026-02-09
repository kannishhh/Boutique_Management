import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadReport() {
    try {
      setLoading(true);
      const data = await apiFetch("/reports/earnings");
      setReport(data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Business Reports</h2>

      {loading ? (
        <Loader />
      ) : report === null ? (
        <p className="text-gray-500">No report data available!</p>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          <Card title="Total Orders" value={report.total_orders} />
          <Card title="Total Revenue" value={`₹ ${report.total_price}`} />
          <Card
            title="Advance Collected"
            value={`₹ ${report.total_advance_collected}`}
          />
          <Card
            title="Pending Balance"
            value={`₹ ${report.total_pending_balance}`}
          />
        </div>
      )}
      <button
        onClick={() => {
          const token = localStorage.getItem("token");
          window.open(
            `${import.meta.env.VITE_API_URL}/reports/export/orders?token=${token}`,
            "_blank",
          );
        }}
        className="bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        Download Orders CSV
      </button>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}
