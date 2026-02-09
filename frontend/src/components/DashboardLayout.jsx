export default function DashboardLayout({ children, onLogout, setPage }) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <div className="w-64 bg-white shadow-md p-6">
        <h1 className="text-2xl font-bold mb-8">Boutique</h1>

        <nav className="space-y-3">
          <button
            onClick={() => setPage("customers")}
            className="block w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            Customers
          </button>

          <button
            onClick={() => setPage("orders")}
            className="block w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            Orders
          </button>

          <button
            onClick={() => setPage("reports")}
            className="block w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            Reports
          </button>
        </nav>
      </div>

      <div className="flex-1">
        <div className="bg-white shadow px-8 py-4 flex justify-between">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <button
            onClick={onLogout}
            className="text-l text-red-500 font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
