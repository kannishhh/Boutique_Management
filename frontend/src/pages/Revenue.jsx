import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchRevenueStats } from "@/api/dashboard.api";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import RevenueReportsSkeleton from "@/components/skeletons/RevenueReportsSkeleton";

const COLORS = ["#C9A961", "#1a1a1a", "#D4AF37", "#B8A07E", "#6B6B6B"];

export default function Revenue() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await fetchRevenueStats();
      setStats(data);
    } catch {
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }

  function handleExportPDF() {
    try {
      const doc = new jsPDF();

      doc.setFillColor(201, 169, 97);
      doc.rect(0, 0, 210, 40, "F");

 
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("The Golden Needle", 105, 20, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Revenue & Reports", 105, 30, { align: "center" });


      doc.setTextColor(0, 0, 0);

      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 50);

  
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Statistics", 14, 65);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const summaryY = 75;
      doc.text(
        `Total Revenue: ₹${stats.totalRevenue.toLocaleString()}`,
        14,
        summaryY,
      );
      doc.text(
        `This Month: ₹${(monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0).toLocaleString()}`,
        14,
        summaryY + 7,
      );
      doc.text(
        `Average Order Value: ₹${Math.round(stats.averageOrderValue).toLocaleString()}`,
        14,
        summaryY + 14,
      );
      doc.text(
        `Pending Amount: ₹${stats.pending.toLocaleString()}`,
        14,
        summaryY + 21,
      );

      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Revenue Breakdown", 14, 110);

      autoTable(doc, {
        startY: 115,
        head: [["Month", "Revenue (₹)", "Orders", "Delivered"]],
        body: monthlyRevenue.map((item) => [
          item.month,
          `₹${item.revenue.toLocaleString()}`,
          item.orders,
          item.delivered,
        ]),
        theme: "striped",
        headStyles: {
          fillColor: [201, 169, 97],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14 },
      });

      
      const finalY = doc.lastAutoTable.finalY || 150;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Revenue by Outfit Type", 14, finalY + 15);

      autoTable(doc, {
        startY: finalY + 20,
        head: [["Outfit Type", "Revenue (₹)", "Orders"]],
        body: outfitRevenue.map((item) => [
          item.outfit,
          `₹${item.revenue.toLocaleString()}`,
          item.count,
        ]),
        theme: "striped",
        headStyles: {
          fillColor: [201, 169, 97],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14 },
      });

     
      const customersY = doc.lastAutoTable.finalY || 200;
      if (customersY > 240) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Top Customers", 14, 20);

        autoTable(doc, {
          startY: 25,
          head: [
            ["Rank", "Customer Name", "Revenue (₹)", "Orders", "Avg Order (₹)"],
          ],
          body: topCustomers.map((item, index) => [
            index + 1,
            item.name,
            `₹${item.revenue.toLocaleString()}`,
            item.orders,
            `₹${Math.round(item.revenue / item.orders).toLocaleString()}`,
          ]),
          theme: "striped",
          headStyles: {
            fillColor: [201, 169, 97],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 14 },
        });
      } else {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Top Customers", 14, customersY + 15);

        autoTable(doc, {
          startY: customersY + 20,
          head: [
            ["Rank", "Customer Name", "Revenue (₹)", "Orders", "Avg Order (₹)"],
          ],
          body: topCustomers.map((item, index) => [
            index + 1,
            item.name,
            `₹${item.revenue.toLocaleString()}`,
            item.orders,
            `₹${Math.round(item.revenue / item.orders).toLocaleString()}`,
          ]),
          theme: "striped",
          headStyles: {
            fillColor: [201, 169, 97],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          margin: { left: 14 },
        });
      }

      doc.save(`Revenue_Report_${new Date().toISOString().split("T")[0]}.pdf`);

      toast.success("PDF exported successfully!", {
        description: "Revenue report has been downloaded",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF", {
        description: "Please try again",
      });
    }
  }

  function handleExportExcel() {
    try {
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ["The Golden Needle - Revenue Report"],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [],
        ["Summary Statistics"],
        ["Total Revenue", `₹${stats.totalRevenue.toLocaleString()}`],
        [
          "This Month Revenue",
          `₹${(monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0).toLocaleString()}`,
        ],
        [
          "Average Order Value",
          `₹${Math.round(stats.averageOrderValue).toLocaleString()}`,
        ],
        ["Pending Amount", `₹${stats.pending.toLocaleString()}`],
      ];

      const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);

      summaryWS["!cols"] = [{ wch: 25 }, { wch: 20 }];

      XLSX.utils.book_append_sheet(wb, summaryWS, "Summary");

      
      const monthlyData = [
        ["Monthly Revenue Breakdown"],
        [],
        ["Month", "Revenue (₹)", "Orders", "Delivered"],
      ];

      monthlyRevenue.forEach((item) => {
        monthlyData.push([
          item.month,
          item.revenue,
          item.orders,
          item.delivered,
        ]);
      });

      const monthlyWS = XLSX.utils.aoa_to_sheet(monthlyData);
      monthlyWS["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 12 }];

      XLSX.utils.book_append_sheet(wb, monthlyWS, "Monthly Revenue");


      const outfitData = [
        ["Revenue by Outfit Type"],
        [],
        ["Outfit Type", "Revenue (₹)", "Orders"],
      ];

      outfitRevenue.forEach((item) => {
        outfitData.push([item.outfit, item.revenue, item.count]);
      });

      const outfitWS = XLSX.utils.aoa_to_sheet(outfitData);
      outfitWS["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }];

      XLSX.utils.book_append_sheet(wb, outfitWS, "Outfit Revenue");

      
      const customersData = [
        ["Top Customers"],
        [],
        ["Rank", "Customer Name", "Revenue (₹)", "Orders", "Average Order (₹)"],
      ];

      topCustomers.forEach((item, index) => {
        customersData.push([
          index + 1,
          item.name,
          item.revenue,
          item.orders,
          Math.round(item.revenue / item.orders),
        ]);
      });

      const customersWS = XLSX.utils.aoa_to_sheet(customersData);
      customersWS["!cols"] = [
        { wch: 8 },
        { wch: 25 },
        { wch: 15 },
        { wch: 10 },
        { wch: 18 },
      ];

      XLSX.utils.book_append_sheet(wb, customersWS, "Top Customers");

      XLSX.writeFile(
        wb,
        `Revenue_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      toast.success("Excel exported successfully!", {
        description: "Revenue report has been downloaded",
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export Excel", {
        description: "Please try again",
      });
    }
  }
  if (loading || !stats) {
    return <RevenueReportsSkeleton />;
  }

  const monthlyRevenue = stats?.monthlyRevenue || [];
  const outfitRevenue = stats?.outfitRevenue || [];
  const topCustomers = stats?.topCustomers || [];

  const maxRevenue = Math.max(...outfitRevenue.map((o) => o.revenue), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl mb-2">Revenue & Reports</h1>
          <p className="text-muted-foreground">
            Detailed analytics and financial insights
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent transition-all"
            onClick={handleExportPDF}
          >
            <FileText className="w-5 h-5" />
            Export PDF
          </Button>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 shadow-md hover:shadow-lg transition-all"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="w-5 h-5" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-accent/20 text-accent">
              <DollarSign className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-3xl font-serif mb-2"></p>
          <p
            className={`text-xs mt-12 ${stats.growthPercent >= 0 ? "text-green-600" : "text-red-600"} `}
          >
            {stats.growthPercent >= 0 ? "+" : ""}
            {stats.growthPercent}% from last month
          </p>
        </Card>
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">This Month</p>
          <p className="text-3xl font-serif mb-2">
            ₹
            {(
              monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0
            ).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.thisMonthRevenue
              ? `${monthlyRevenue[monthlyRevenue.length - 1]?.orders || 0} orders delivered`
              : "No orders this month"}
          </p>
        </Card>

        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <DollarSign className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Average Order</p>
          <p className="text-3xl font-serif mb-2">
            ₹{Math.round(stats.averageOrderValue).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            Based on {stats.totalOrders} delivered order
          </p>
        </Card>

        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Pending Amount</p>
          <p className="text-3xl font-serif mb-2">
            ₹{stats.pending.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.pending > 0
              ? "Outstanding balance remaining"
              : "All payment cleared"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-xl mb-1">Monthly Revenue & Orders</h3>
            <p className="text-sm text-muted-foreground">
              Revenue and order trends over the last 6 months
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5D4C1" />
              <XAxis dataKey="month" stroke="#6B6B6B" />
              <YAxis stroke="#6B6B6B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E5D4C1",
                  borderRadius: "12px",
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#C9A961"
                radius={[8, 8, 0, 0]}
                name="Revenue (₹)"
              />
              <Bar
                dataKey="orders"
                fill="#1a1a1a"
                radius={[8, 8, 0, 0]}
                name="orders"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 rounded-2xl shadow-sm border-border/50">
          <div className="mb-6">
            <h3 className="text-xl mb-1">Revenue by Outfit Type</h3>
            <p className="text-sm text-muted-foreground">
              Distribution across categories
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outfitRevenue}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.outfit}
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {outfitRevenue.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #E5D4C1",
                  borderRadius: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl mb-1">Outfit Revenue Breakdown</h3>
            <p className="text-sm text-muted-foreground">
              Revenue and count by category
            </p>
          </div>
          <div className="space-y-4">
            {outfitRevenue.map((item, index) => (
              <div key={item.outfit} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="font-medium">{item.outfit}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-accent">
                      ₹{item.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} orders
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl shadow-sm border-border/50">
        <div className="mb-6">
          <h3 className="text-xl mb-1">Top Customers</h3>
          <p className="text-sm text-muted-foreground">
            Highest revenue contributors
          </p>
        </div>
        <div className="space-y-4">
          {topCustomers.map((c, index) => (
            <div
              key={c.name}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-medium text-accent">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.orders} orders
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-accent font-medium text-lg">
                  ₹{c.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg: ₹{Math.round(c.revenue / c.orders).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <Card className="p-6 rounded-2xl shadow-sm border-border/50">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-accent/10 text-accent">{icon}</div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-serif">{value}</p>
    </Card>
  );
}
