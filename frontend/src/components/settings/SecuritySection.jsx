import { Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export default function SecuritySection({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleChangePassword,
  setShowLogoutDialog,
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
        <h3 className="text-xl mb-6">Change Password</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Curent Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleChangePassword}
            >
              <Save className="w-4 h-4" />
              Update Password
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
        <h3 className="text-xl mb-6">Two-Factor Authentication</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div className="space-y-1">
              <p className="font-medium">Enable 2FA</p>
              <p className="font-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      <Card className="p-6 rounded-2xl border-destructive/50 bg-destructive/5">
        <h3 className="text-xl mb-4 text-destructive">Danger Zone</h3>
        <div className="space-y-4">
          <Button
            variant="destructive"
            className="w-full md:w-auto"
            onClick={() => setShowLogoutDialog(true)}
          >
            Delete Account
          </Button>
          <p className="font-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
        </div>
      </Card>
    </div>
  );
}
