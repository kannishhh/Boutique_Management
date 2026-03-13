import { toast } from "sonner";
import { format, startOfToday } from "date-fns";
import { Checkbox } from "../../components/ui/checkbox";
import { Calendar } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { fetchCustomerMeasurements } from "../../api/customers.api";
import { CalendarIcon, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useState } from "react";
import { LuxurySelect } from "../../components/LuxurySelect";
import { getPlaceholder } from "@/utils";

export default function OrderForm({
  createOrder,
  customers,
  templates,
  mobile,
  setMobile,
  suitType,
  setSuitType,
  setGender,
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
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const totalSteps = 4;

  const steps = [
    { number: 1, title: "Customer", subtitle: "Select Customer" },
    { number: 2, title: "Details", subtitle: "Suit & Measurements" },
    { number: 3, title: "Pricing", subtitle: "Payment & Delivery" },
    { number: 4, title: "Review", subtitle: "Confirm Order" },
  ];

  const hasValidMeasurements =
    Object.keys(measurements).length > 0 &&
    Object.values(measurements).every((value) => String(value).trim() !== "");

  const validateByStep = (step) => {
    const nextErrors = {};

    if (step >= 1 && !mobile) {
      nextErrors.mobile = "Customer is required";
    }

    if (step >= 2 && !hasValidMeasurements) {
      nextErrors.measurements = "Measurements are required";
    }

    if (step >= 3) {
      if (price === "" || price === null) {
        nextErrors.price = "Price cannot be empty";
      } else if (Number(price) < 0) {
        nextErrors.price = "Price cannot be negative";
      }

      if (advance === "" || advance === null) {
        nextErrors.advance = "Advance payment cannot be empty";
      } else if (Number(advance) < 0) {
        nextErrors.advance = "Advance payment cannot be negative";
      }

      if (
        price !== "" &&
        advance !== "" &&
        !Number.isNaN(Number(price)) &&
        !Number.isNaN(Number(advance)) &&
        Number(advance) > Number(price)
      ) {
        nextErrors.advance = "Advance cannot exceed total price";
      }

      if (!deliveryDate) {
        nextErrors.deliveryDate = "Delivery date is required";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateByStep(currentStep)) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedTemplate = templates.find((t) => t.name === suitType);

  return (
    <div className="space-y-6">
      <div className="relative pb-8 border-b border-border/50">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                    currentStep > step.number
                      ? "bg-accent text-accent-foreground shadow-md"
                      : currentStep === step.number
                        ? "bg-accent text-accent-foreground shadow-lg ring-4 ring-accent/20"
                        : "bg-muted/50 text-muted-foreground border-2 border-border"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-base font-semibold">
                      {step.number}
                    </span>
                  )}
                </div>
                <div className="text-center mt-3">
                  <p
                    className={`text-xs font-medium transition-colors ${
                      currentStep >= step.number
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 transition-all duration-500 ${
                    currentStep > step.number ? "bg-accent" : "bg-border/50"
                  }`}
                  style={{ marginTop: "-45px" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          if (!validateByStep(3)) {
            e.preventDefault();
            return;
          }
          createOrder(e);
        }}
        className="space-y-6"
      >
        {/* STEP 1: Customer Selection */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-500 min-h-75">
            <div className="text-center pt-4 pb-2">
              <h3 className="text-2xl font-serif mb-1">Select Customer</h3>
              <p className="text-sm text-muted-foreground">
                Choose the customer for this bespoke order
              </p>
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <Label className="text-sm font-medium">
                Customer Name & Contact
              </Label>
              <LuxurySelect
                value={mobile}
                onChange={async (selectedMobile) => {
                  setMobile(selectedMobile);
                  setErrors((prev) => ({ ...prev, mobile: "" }));

                  const customer = customers.find(
                    (c) => c.mobile === selectedMobile,
                  );
                  if (!customer) return;

                  setSelectedCustomerId(customer.customer_id);

                  try {
                    const history = await fetchCustomerMeasurements(
                      customer.customer_id,
                    );
                    setMeasurementHistory(history);
                  } catch (err) {
                    toast.error("Failed to load measurement history", {
                      description:
                        "You can still create order without measurements.",
                    });
                  }
                }}
                options={[
                  { value: "", label: "Select a customer..." },
                  ...customers.map((c) => ({
                    value: c.mobile,
                    label: `${c.name} (${c.mobile})`,
                  })),
                ]}
                placeholder="Select a customer..."
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>

            {mobile && (
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl max-w-xl mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Customer Selected</p>
                    <p className="text-sm text-muted-foreground">
                      {customers.find((c) => c.mobile === mobile)?.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Suit Type & Measurements */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="text-center pt-4 pb-2">
              <h3 className="text-2xl font-serif mb-1">Suit Details</h3>
              <p className="text-sm text-muted-foreground">
                Select suit type and enter precise measurements
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Suit Type</Label>
              <LuxurySelect
                value={suitType}
                onChange={(selectedSuitType) => {
                  setSuitType(selectedSuitType);
                  setErrors((prev) => ({ ...prev, measurements: "" }));

                  const template = templates.find(
                    (t) => t.name === selectedSuitType,
                  );

                  if (template) {
                    const initial = {};
                    template.fields.forEach((field) => {
                      initial[field] = "";
                    });
                    setGender(template.gender);
                    setMeasurements(initial);
                  } else {
                    setMeasurements({});
                  }
                }}
                options={[
                  { value: "", label: "Choose suit type..." },
                  ...templates.map((template) => ({
                    value: template.name,
                    label: template.name,
                  })),
                ]}
                placeholder="Choose suit type..."
              />
            </div>

            {suitType && selectedTemplate && (
              <div className="space-y-4 p-5 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Measurements (cm)</Label>
                  {measurementHistory.length > 0 && (
                    <button
                      type="button"
                      className="text-xs text-accent hover:text-accent/80 underline font-medium"
                      onClick={() => {
                        const last = measurementHistory[0];
                        const values = JSON.parse(last.measurement_values);
                        setMeasurements(values);
                        toast.success("Last measurements loaded.");
                      }}
                    >
                      Use previous measurements
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground capitalize">
                        {field}
                      </Label>
                      <Input
                        type="number"
                        placeholder={getPlaceholder(field)}
                        className="rounded-xl h-9 text-sm bg-background"
                        value={measurements[field] || ""}
                        onChange={(e) => {
                          setErrors((prev) => ({ ...prev, measurements: "" }));
                          setMeasurements({
                            ...measurements,
                            [field]: e.target.value,
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {errors.measurements && (
              <p className="text-red-500 text-xs mt-1">{errors.measurements}</p>
            )}
          </div>
        )}

        {/* STEP 3: Pricing & Delivery */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="text-center pt-4 pb-2">
              <h3 className="text-2xl font-serif mb-1">Pricing & Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Set payment details and delivery schedule
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Total Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min="0"
                    className="rounded-xl pl-7 h-11 bg-background"
                    placeholder="5000"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setErrors((prev) => ({ ...prev, price: "", advance: "" }));
                    }}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Advance Payment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min="0"
                    max={price || 0}
                    className="rounded-xl pl-7 h-11 bg-background"
                    placeholder="2000"
                    value={advance}
                    onChange={(e) => {
                      setAdvance(e.target.value);
                      setErrors((prev) => ({ ...prev, advance: "" }));
                    }}
                  />
                </div>
                {errors.advance && (
                  <p className="text-red-500 text-xs mt-1">{errors.advance}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Expected Delivery Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full justify-start text-left rounded-xl h-11 px-3 border border-border bg-background hover:bg-muted/30 transition-all inline-flex items-center"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span
                      className={
                        deliveryDate
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {deliveryDate
                        ? format(deliveryDate, "PPP")
                        : "Select delivery date..."}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={(date) => {
                      setDeliveryDate(date);
                      setErrors((prev) => ({ ...prev, deliveryDate: "" }));
                    }}
                    disabled={(date) => date < startOfToday()}
                    className="rounded-xl"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.deliveryDate && (
                <p className="text-red-500 text-xs mt-1">{errors.deliveryDate}</p>
              )}
            </div>

            <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-xl border border-border/50">
              <Checkbox
                id="clothProvided"
                checked={clothProvided}
                onCheckedChange={(value) => setClothProvided(value)}
              />
              <div className="flex-1">
                <label
                  htmlFor="clothProvided"
                  className="text-sm font-medium cursor-pointer"
                >
                  Customer provides fabric
                </label>
                {clothProvided && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Material sourcing will be skipped
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-500">
            <div className="text-center pt-4 pb-2">
              <h3 className="text-2xl font-serif mb-1">Review Order</h3>
              <p className="text-sm text-muted-foreground">
                Please confirm all details before creating the order
              </p>
            </div>

            <div className="p-6 bg-muted/30 rounded-xl border border-border/50 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="font-medium">
                  {customers.find((c) => c.mobile === mobile)?.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Suit Type</p>
                <p className="font-medium">{suitType}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Price</p>
                  <p className="font-medium text-accent">₹{price}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Advance</p>
                  <p className="font-medium text-green-600">₹{advance}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="font-medium text-orange-600">
                    ₹{price - advance}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Delivery Date</p>
                <p className="font-medium">
                  {deliveryDate ? format(deliveryDate, "PPP") : "-"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border/50">
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={handlePrev}
              variant="outline"
              className="flex-1 rounded-xl h-11 gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-11 gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl h-11 gap-2"
            >
              <Check className="w-4 h-4" />
              Create Order
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
