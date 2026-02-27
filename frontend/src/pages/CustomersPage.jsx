import { use, useEffect, useState } from "react";
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from "../api/customers.api";

import { toast } from "sonner";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { Search, UserPlus, Edit, Trash2, Phone, MapPin } from "lucide-react";
import ConfirmDialog from "@/components/confirmDialog";
import CustomersSkeleton from "@/components/skeletons/CustomersSkeleton";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editErrors, setEditErrors] = useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [customerFilter, setCustomerFilter] = useState("ALL");

  async function loadCustomers() {
    try {
      setLoading(true);
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      toast.error("Failed to load customers", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function addCustomer(e) {
    if (!name || !mobile) {
      toast.error("Name and mobile required");
      return;
    }

    try {
      await createCustomer({
        name,
        mobile,
        address,
        notes,
      });

      toast.success("Customer added");
      setIsAddDialogOpen(false);
      setName("");
      setMobile("");
      setAddress("");
      setNotes("");
      loadCustomers();
    } catch {
      toast.error("Failed to add customer");
    }
  }

  function handleEditCustomer(customer) {
    setSelectedCustomer(customer);
    setEditName(customer.name);
    setEditMobile(customer.mobile);
    setEditAddress(customer.address || "");
    setEditNotes(customer.notes || "");
    setIsEditDialogOpen(true);
  }

  async function saveEditCustomer(e) {
    e.preventDefault();

    if (!editName || !editMobile) {
      toast.error("Name and mobile required");
      return;
    }
    try {
      await updateCustomer(selectedCustomer.customer_id, {
        name: editName,
        mobile: editMobile,
        address: editAddress,
        notes: editNotes,
      });

      toast.success("Customer updated successfully");
      setIsEditDialogOpen(false);

      setSelectedCustomer(null);
      setEditName("");
      setEditMobile("");
      setEditAddress("");
      setEditNotes("");

      loadCustomers();
    } catch (err) {
      toast.error("Failed to update customer", {
        description: err.message,
      });
    }
  }

  function handleDeleteCustomer(customer) {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteCustomer() {
    setIsDeleting(true);

    try {
      await deleteCustomer(customerToDelete.customer_id);
      toast.success("Customer deleted successfully");
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (err) {
      toast.error("Failed to delete customer", {
        description: err.message,
      });
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.includes(search),
    )
    .filter((c) => {
      if (customerFilter === "ACTIVE") {
        return c.pendingOrders > 0;
      }
      return true;
    });

    if(loading){
      return <CustomersSkeleton />
    }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl mb-2">Customers</h1>
          <p className="text-muted-foreground">
            Manage your boutique customers
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              <UserPlus className="w-5 h-5" />
              Add Customer
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-125 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif">
                Add New Customer
              </DialogTitle>
              <DialogDescription>
                Enter customer details to create a new profile
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`rounded-xl ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  placeholder="+91 XXXXX XXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`rounded-xl ${errors.mobile ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {errors.mobile && (
                  <p className="text-xs text-red-500">{errors.mobile}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  placeholder="City, State"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl min-h-25"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={addCustomer}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground "
                  disabled={!name || !mobile}
                >
                  Save Customer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setErrors({});
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={customerFilter === "ALL" ? "default" : "outline"}
              className="rounded-xl"
              onClick={()=>setCustomerFilter("ALL")}
            >
              All Customers
            </Button>
            <Button
              variant={customerFilter === "ACTIVE" ? "default" : "outline"}
              className="rounded-xl"
              onClick={()=>setCustomerFilter("ACTIVE")}
            >
              Active
            </Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {search ? "No matching customers found" : "No customers yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 [&>th]:text-foreground">
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Total Orders</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCustomers.map((c) => (
                  <TableRow key={c.customer_id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      {c.display_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-medium">
                          {c.name.charAt(0)}
                        </div>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {c.mobile}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {c.address}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-muted/50">
                        {c.totalOrders}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {c.pendingOrders > 0 ? (
                        <Badge className="bg-accent text-accent-foreground">
                          {c.pendingOrders}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.lastOrder}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCustomer(c)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCustomer(c)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">Total Customers</p>
          <p className="text-3xl font-serif">{customers.length}</p>
        </Card>
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">
            Active This Month
          </p>
          <p className="text-3xl font-serif">
            {customers.filter((c) => c.pendingOrders > 0).length}
          </p>
        </Card>
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">Total Orders</p>
          <p className="text-3xl font-serif">
            {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
          </p>
        </Card>
        <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">Pending Orders</p>
          <p className="text-3xl font-serif">
            {customers.reduce((sum, c) => sum + c.pendingOrders, 0)}
          </p>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-125 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              Edit Customer
            </DialogTitle>
            <DialogDescription>Update customer details</DialogDescription>
          </DialogHeader>

          <form onSubmit={saveEditCustomer} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Customer Name *</Label>
              <Input
                id="editName"
                placeholder="Enter full name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`rounded-xl ${editErrors.editName ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {editErrors.editName && (
                <p className="text-xs text-red-500">{editErrors.editName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editMobile">Mobile Number *</Label>
              <Input
                id="editMobile"
                placeholder="10-digit mobile number"
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value)}
                className={`rounded-xl ${editErrors.editMobile ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {editErrors.editMobile && (
                <p className="text-xs text-red-500">{editErrors.editMobile}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAddress">Address (Optional)</Label>
              <Input
                id="editAddress"
                placeholder="City, State"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">Notes (Optional)</Label>
              <Textarea
                id="editNotes"
                placeholder="Any special requirements or notes..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="rounded-xl min-h-20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                disabled={!editName || !editMobile}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditErrors({});
                }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteCustomer}
        title="Delete Customer"
        description={`Are you sure you want to delete ${customerToDelete ? customerToDelete.name : "this customer"}? This action cannot be undone and will permanently remove all customer data.`}
        confirmText="Delete Customer"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}
