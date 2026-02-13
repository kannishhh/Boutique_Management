import { toast } from "sonner";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch } from "../../api/client";

export default function OrderForm({
  createOrder,
  customers,
  templates,
  mobile,
  setMobile,
  suitType,
  setSuitType,
  measurements,
  setMeasurements,
  measurementHistory,
  setMeasurementHistory,
  setSelectedCustomerId,
  price,
  setPrice,
  advance,
  setAdvance,
  deliveryDate,
  setDeliveryDate,
  clothProvided,
  setClothProvided,
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create Order</h2>

      <form onSubmit={createOrder} className="grid grid-cols-3 gap-4">
        <select
          className="border p-3 rounded-lg"
          value={mobile}
          onChange={async (e) => {
            const selectedMobile = e.target.value;
            setMobile(selectedMobile);

            const customer = customers.find((c) => c.mobile === selectedMobile);
            if (!customer) return;

            setSelectedCustomerId(customer.customer_id);

            try {
              const history = await apiFetch(
                `/customers/${customer.customer_id}/measurements`,
              );
              setMeasurementHistory(history);
            } catch (err) {
              toast.error("Failed to load measurement history", {
                description: "You can still create order without measurements.",
              });
            }
          }}
        >
          <option>Select Customer</option>
          {customers.map((c) => (
            <option key={c.customer_id} value={c.mobile}>
              {c.name} ({c.mobile})
            </option>
          ))}
        </select>

        <select
          className="border p-3 rounded-lg"
          value={suitType}
          onChange={(e) => {
            setSuitType(e.target.value);
            setMeasurements({});
          }}
        >
          <option value="">Select Suit Type</option>
          {Object.keys(templates).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {suitType && templates[suitType] && (
          <div className="col-span-3 mt-2">
            <p className="font-semibold mb-2">Measurements</p>

            <div className="grid grid-cols-3 gap-4">
              {templates[suitType].map((field) => (
                <input
                  key={field}
                  type="number"
                  placeholder={`${field} (cm)`}
                  className="border p-3 rounded-lg"
                  value={measurements[field] || ""}
                  onChange={(e) =>
                    setMeasurements({
                      ...measurements,
                      [field]: e.target.value,
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}

        {measurementHistory.length > 0 && (
          <button
            type="button"
            className="mb-3 text-sm text-blue-600 underline"
            onClick={() => {
              const last = measurementHistory[0];
              const values = JSON.parse(last.measurement_values);
              setMeasurements(values);
              toast.success("Last measurements loaded.");
            }}
          >
            Use last measurements
          </button>
        )}

        <input
          type="number"
          min="0"
          className="border p-3 rounded-lg"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          min="0"
          max={price || 0}
          className="border p-3 rounded-lg"
          placeholder="Advance Paid"
          value={advance}
          onChange={(e) => setAdvance(e.target.value)}
        />

        <div className="space-y-2">
          <Label>Delivery Date</Label>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {deliveryDate
                  ? format(deliveryDate, "PPP")
                  : "Select Delivery Date"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0 ">
              <Calendar
                mode="single"
                selected={deliveryDate}
                onSelect={setDeliveryDate}
                className="rounded-lg border"
                captionLayout="dropdown"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="clothProvided"
            checked={clothProvided}
            onCheckedChange={(value) => setClothProvided(value)}
          />
          <label htmlFor="clothProvided">Cloth provided by customer</label>
          {clothProvided && (
            <p className="text-sm text-muted-foreground">
              Fabric details will be skipped.
            </p>
          )}
        </div>

        <button className="col-span-3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
          Create Order
        </button>
      </form>
    </div>
  );
}
