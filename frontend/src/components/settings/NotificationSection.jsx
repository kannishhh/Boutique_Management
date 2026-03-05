import { Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";

export default function NotificationSection({
  notifications,
  handleToggleNotification,
  handleSaveNotifications,
}) {
  return (
    <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
      <h3 className="text-xl mb-6">Notification Preferences</h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="space-y-1">
            <p className="font-medium">Order Updates</p>
            <p className="text-sm text-muted-foreground">
              Get notified when order status changes
            </p>
          </div>
          <Switch
            checked={notifications?.orderUpdates || false}
            onCheckedChange={(value) =>
              handleToggleNotification("orderUpdates", value)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="space-y-1">
            <p className="font-medium">Delivery Reminders</p>
            <p className="text-sm text-muted-foreground">
              Alerts for upcoming delivery dates
            </p>
          </div>
          <Switch
            checked={notifications?.deliveryReminders || false}
            onCheckedChange={(value) =>
              handleToggleNotification("deliveryReminders", value)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="space-y-1">
            <p className="font-medium">Payment Notifications</p>
            <p className="text-sm text-muted-foreground">
              Notify when payments are received
            </p>
          </div>
          <Switch
            checked={notifications?.paymentNotifications || false}
            onCheckedChange={(value) =>
              handleToggleNotification("paymentNotifications", value)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="space-y-1">
            <p className="font-medium">Customer Messages</p>
            <p className="text-sm text-muted-foreground">
              Notifications for customer inquiries
            </p>
          </div>
          <Switch
            checked={notifications?.customerMessages || false}
            onCheckedChange={(value) =>
              handleToggleNotification("customerMessages", value)
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="space-y-1">
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive updates via email
            </p>
          </div>
          <Switch
            checked={notifications?.emailNotifications || false}
            onCheckedChange={(value) =>
              handleToggleNotification("emailNotifications", value)
            }
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            onClick={handleSaveNotifications}
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </Button>
        </div>
      </div>
    </Card>
  );
}
