import { useEffect, useState } from "react";
import {
  createMeasurement,
  deleteMeasurement,
  fetchMeasurements,
  fetchMeasurementTemplates,
  updateMeasurement,
} from "@/api/measurements.api";
import { fetchCustomers } from "@/api/customers.api";
import { toast } from "sonner";
import ConfirmDialog from "@/components/confirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Edit, Trash2, Plus, User, X, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { getPlaceholder } from "@/utils";
import { LuxurySelect } from "@/components/LuxurySelect";
import MeasurementsSkeleton from "@/components/skeletons/MeasurementSkeleton";

export default function Measurements() {
  const [measurements, setMeasurements] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedGender, setSelectedGender] = useState("Female");
  const [measurementValues, setMeasurementValues] = useState({});
  const [errors, setErrors] = useState({});

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMeasurement, setEditMeasurement] = useState(null);
  const [editValues, setEditValues] = useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [measurementsData, customersData, templatesData] =
        await Promise.all([
          fetchMeasurements(),
          fetchCustomers(),
          fetchMeasurementTemplates(),
        ]);

      setMeasurements(measurementsData);
      setCustomers(customersData);
      setTemplates(templatesData);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMeasurement(e) {
    e.preventDefault();

    const newErrors = {};

    if (!selectedCustomer || !selectedTemplate) {
      if (!selectedCustomer) {
        newErrors.selectedCustomer = "Please select a customer";
      }
      if (!selectedTemplate) {
        newErrors.selectedTemplate = "Please select a measurement template";
      }
    }

    const hasEmptyFields = Object.values(measurementValues).some(
      (value) => value.trim() === "",
    );

    if (hasEmptyFields) {
      newErrors.measurementValues = "Please fill all measurement fields";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await createMeasurement({
        customer_id: Number(selectedCustomer),
        template_name: selectedTemplate,
        gender: selectedGender,
        measurements: measurementValues,
      });

      toast.success("Measurement added successfully!");
      setIsAddDialogOpen(false);
      resetAddForm();
      loadData();
    } catch {
      toast.error("Failed to save measurement");
    }
  }

  function resetAddForm() {
    setSelectedCustomer("");
    setSelectedTemplate("");
    setSelectedGender("Female");
    setMeasurementValues({});
    setErrors({});
  }

  function handleTemplateChange(templateId) {
    setSelectedTemplate(templateId);
    setErrors((prev) => ({ ...prev, selectedTemplate: "", measurementValues: "" }));
    const template = templates.find((t) => t.id === templateId);

    if (template) {
      const initial = {};
      template.fields.forEach((field) => {
        initial[field] = "";
      });
      setMeasurementValues(initial);
    }
  }

  function handleViewMeasurement(measurement) {
    setSelectedMeasurement(measurement);
    setViewDialogOpen(true);
  }

  function handleEditMeasurement(measurement) {
    setEditMeasurement(measurement);
    setEditValues({ ...measurement.measurements });
    setEditDialogOpen(true);
  }

  async function saveEditMeasurement(e) {
    e.preventDefault();

    try {
      await updateMeasurement(editMeasurement.measurement_id, {
        measurements: editValues,
      });
      toast.success("Measurement updated successfully!");
      setEditDialogOpen(false);
      loadData();
    } catch {
      toast.error("Failed to update measurement");
    }
  }

  function handleDeleteMeasurement(measurement) {
    setMeasurementToDelete(measurement);
    setDeleteDialogOpen(true);
  }

  async function confirmDeleteMeasurement() {
    setIsDeleting(true);
    try {
      await deleteMeasurement(measurementToDelete.measurement_id);

      toast.success("Measurement deleted successfully!");
      setDeleteDialogOpen(false);
      setMeasurementToDelete(null);
      loadData();
    } catch {
      console.log(
        "Deleted measurement with ID:",
        measurementToDelete.measurement_id,
      );
      toast.error("Failed to delete measurement");
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredTemplates = templates.filter(
    (t) => t.gender === selectedGender,
  );

  function formatDate(dateString) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN");
  }

  if (loading) {
    return <MeasurementsSkeleton />;
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl mb-2">Measurements</h1>
          <p className="text-muted-foreground">
            Manage customer measurements and templates
          </p>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 rounded-xl shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Measurement
        </Button>
      </div>

      <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
        <h3 className="text-xl mb-6">Customer Measurements </h3>

        {measurements.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              No measurements yet. Add your first measurement!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Customer Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Template
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Gender
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Measurements
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((measurement) => (
                  <tr
                    key={measurement.measurement_id}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium">
                          {measurement.customer_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted/50 text-sm">
                        {measurement.template_name}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                          measurement.gender === "Male"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-pink-50 text-pink-700"
                        }`}
                      >
                        {measurement.gender}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted-foreground">
                        {Object.keys(measurement.measurements || {}).length}{" "}
                        fields
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {formatDate(measurement.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 rounded-lg hover:bg-blue-50 text-muted-foreground hover:text-blue-600 transition-all"
                          title="View Measurement"
                          onClick={() => handleViewMeasurement(measurement)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-600 transition-all"
                          title="Edit Measurement"
                          onClick={() => handleEditMeasurement(measurement)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-all"
                          title="Delete Measurement"
                          onClick={() => handleDeleteMeasurement(measurement)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-150 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              Add New Measurement
            </DialogTitle>
            <DialogDescription>
              Save customer measurements for future reference
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMeasurement} className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <LuxurySelect
                  value={selectedCustomer}
                  onChange={(value) => {
                    setSelectedCustomer(value);
                    setErrors((prev) => ({ ...prev, selectedCustomer: "" }));
                  }}
                  options={[
                    { value: "", label: "Select Customer" },
                    ...customers.map((customer) => ({
                      value: customer.customer_id.toString(),
                      label: customer.name,
                    })),
                  ]}
                  placeholder="Select Customer"
                />
                {errors.selectedCustomer && (
                  <p className="text-red-500 text-xs mt-1">{errors.selectedCustomer}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <LuxurySelect
                  value={selectedGender}
                  onChange={setSelectedGender}
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  placeholder="Select Gender"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Measurement Template *</Label>
              <LuxurySelect
                value={selectedTemplate}
                onChange={handleTemplateChange}
                options={[
                  { value: "", label: "Select Template" },
                  ...templates.map((template) => ({
                    value: template.id,
                    label: template.name,
                  })),
                ]}
                placeholder="Select Template"
              />
              {errors.selectedTemplate && (
                <p className="text-red-500 text-xs mt-1">{errors.selectedTemplate}</p>
              )}
            </div>

            {selectedTemplate && (
              <div className="space-y-3">
                <Label>Measurement Values *</Label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(measurementValues).map((field) => (
                    <div key={field} className="space-y-1">
                      <Label htmlFor={field} className="text-xs capitalize">
                        {field}
                      </Label>
                      <Input
                        id={field}
                        type="text"
                        placeholder={getPlaceholder(field)}
                        value={measurementValues[field]}
                        onChange={(e) => {
                          setErrors((prev) => ({ ...prev, measurementValues: "" }));
                          setMeasurementValues({
                            ...measurementValues,
                            [field]: e.target.value,
                          });
                        }}
                        className="rounded-xl"
                      />
                    </div>
                  ))}
                </div>
                {errors.measurementValues && (
                  <p className="text-red-500 text-xs mt-1">{errors.measurementValues}</p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Measurement
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  resetAddForm();
                }}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-125 rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              Measurement Details
            </DialogTitle>
            <DialogDescription>
              {selectedMeasurement?.customer_name} -{" "}
              {selectedMeasurement?.template_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Customer</p>
                <p className="font-medium">
                  {selectedMeasurement?.customer_name}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Gender</p>
                <p className="font-medium">{selectedMeasurement?.gender}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Template</p>
                <p className="font-medium">
                  {selectedMeasurement?.template_name}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Date Added</p>
                <p className="font-medium">
                  {formatDate(selectedMeasurement?.created_at)}
                </p>
              </div>
            </div>

            <div className="border-t border-border/50 pt-4">
              <h4 className="font-medium mb-3">Measurements</h4>
              <div className="grid grid-cols-2 gap-3">
                {selectedMeasurement &&
                  Object.entries(selectedMeasurement.measurements || {}).map(
                    ([field, value]) => (
                      <div key={field} className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1 capitalize">
                          {field}
                        </p>
                        <p className="font-medium">{value || "—"}</p>
                      </div>
                    ),
                  )}
              </div>
            </div>

            <Button
              onClick={() => setViewDialogOpen(false)}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-150 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              Edit Measurement
            </DialogTitle>
            <DialogDescription>
              {editMeasurement?.customer_name} -{" "}
              {editMeasurement?.template_name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={saveEditMeasurement} className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              {editMeasurement &&
                Object.entries(editValues).map(([field, value]) => (
                  <div key={field} className="space-y-1">
                    <Label
                      htmlFor={`edit-${field}`}
                      className="text-xs capitalize"
                    >
                      {field}
                    </Label>
                    <Input
                      id={`edit-${field}`}
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          [field]: e.target.value,
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteMeasurement}
        title="Delete Measurement"
        description={`Are you sure you want to delete the measurement for ${measurementToDelete?.customer_name}? This action cannot be undone.`}
        confirmText="Delete Measurement"
        cancelText="Cancel"
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  );
}
