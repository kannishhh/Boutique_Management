import { use, useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [measurements, setMeasurements] = useState("");

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await apiFetch("/customers");
      setCustomers(data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!mobile.trim()) newErrors.mobile = "Mobile is required";
    else if (mobile.length !== 10)
      newErrors.mobile = "Mobile must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function addCustomer(e) {
    e.preventDefault();

    if (!validateForm()) return;
    await apiFetch("/customers", {
      method: "POST",
      body: JSON.stringify({ name, mobile, address, measurements }),
    });

    setName("");
    setMobile("");
    setAddress("");
    setMeasurements("");
    toast.success("Customer added successfully!");
    loadCustomers();
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search),
  );
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Add Customer</h2>

        <form onSubmit={addCustomer} className="grid grid-cols-3 gap-4">
          <input
            className={`border p-3 rounded-lg ${errors.name ? "border-red-500" : ""}`}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className={`border p-3 rounded-lg ${errors.mobile ? "border-red-500" : ""}`}
            placeholder="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <input
            className="border p-3 rounded-lg"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            className="border p-3 rounded-lg"
            placeholder="Measurements"
            value={measurements}
            onChange={(e) => setMeasurements(e.target.value)}
          />

          <button className="col-span-3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Add Customer
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Customer List</h2>
        <input
          className="border p-3 rounded-lg mb-4 w-72"
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <Loader />
        ) : filteredCustomers.length === 0 ? (
          <p className="text-gray-500">
            {search ? "No matching customers found" : "No customers yet"}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-3">ID</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>Measurements</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.customer_id} className="border-b hover:bg-gray-200">
                  <td className="py-3">{c.customer_id}</td>
                  <td>{c.name}</td>
                  <td>{c.mobile}</td>
                  <td>{c.address}</td>
                  <td>{c.measurements || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
