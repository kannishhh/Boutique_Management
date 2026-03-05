import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="p-6 rounded-2xl w-full max-w-md space-y-6">
        <div className="flex items-start gap-4">
          <div
            className={`p-2 rounded-lg ${
              variant === "destructive" ? "bg-destructive/10" : "bg-accent/10"
            }`}
          >
            <AlertCircle
              className={`w-5 h-5 ${
                variant === "destructive" ? "text-destructive" : "text-accent"
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-serif mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-xl"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={variant === "destructive" ? "destructive" : "default"}
            className={`flex-1 rounded-xl ${
              variant === "default"
                ? "bg-accent hover:bg-accent/90 text-accent-foreground"
                : ""
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
