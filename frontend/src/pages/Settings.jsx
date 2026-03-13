import { useEffect, useRef, useState } from "react";
import {
  changePassword,
  fetchSettings,
  updateAppearance,
  updateBoutique,
  updateNotifications,
  updateProfile,
  uploadProfilePhoto,
} from "@/api/settings.api";
const BASE_URL = import.meta.env.VITE_API_URL;
import ConfirmDialog from "@/components/confirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Palette, Save, Shield, Store, User } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import AppearanceSection from "@/components/settings/AppearanceSection";
import ProfileSection from "@/components/settings/ProfileSection";
import BoutiqueSection from "@/components/settings/BoutiqueSection";
import NotificationSection from "@/components/settings/NotificationSection";
import SecuritySection from "@/components/settings/SecuritySection";
import { useUser } from "@/context/UserContext";
import SettingsSkeleton from "@/components/skeletons/SettingsSkeleton";

export default function Settings() {
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[A-Za-z]{2,}$/;

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const fileInputRef = useRef(null);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  const [boutiqueName, setBoutiqueName] = useState("");
  const [boutiqueContact, setBoutiqueContact] = useState("");
  const [boutiqueEmail, setBoutiqueEmail] = useState("");
  const [boutiqueAddress, setBoutiqueAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityErrors, setSecurityErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [boutiqueErrors, setBoutiqueErrors] = useState({});

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { appearance, setAppearance } = useTheme();

  const { user, loadUser } = useUser();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (user?.profile_image) {
      setProfilePhoto(`${BASE_URL}/uploads/profile/${user.profile_image}`);
    }
  }, [user]);

  async function loadSettings() {
    try {
      setLoading(true);
      const data = await fetchSettings();
      setSettings(data);

      setProfileName(data.profile_name || "");
      setProfileEmail(data.profile_email || "");
      setProfilePhone(data.profile_phone || "");
      setBoutiqueName(data.boutique_name || "");
      setBoutiqueContact(data.boutique_contact || "");
      setBoutiqueEmail(data.boutique_email || "");
      setBoutiqueAddress(data.boutique_address || "");
      setGstNumber(data.gst_number || "");
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    const newErrors = {};
    if (!profileName.trim()) {
      newErrors.profileName = "Full name is required";
    }
    if (!profileEmail.trim()) {
      newErrors.profileEmail = "Email is required";
    } else if (!emailRegex.test(profileEmail.trim())) {
      newErrors.profileEmail = "Please enter a valid email address";
    }
    if (!/^\d{10}$/.test(profilePhone)) {
      newErrors.profilePhone = "Contact number must be exactly 10 digits";
    }

    setProfileErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await updateProfile({
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
      });
      window.dispatchEvent(new Event("refreshBoutiqueName"));
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  async function handleSaveBoutique() {
    const newErrors = {};
    if (!boutiqueName.trim()) {
      newErrors.boutiqueName = "Boutique name is required";
    }
    if (!/^\d{10}$/.test(boutiqueContact)) {
      newErrors.boutiqueContact = "Contact number must be exactly 10 digits";
    }
    if (!boutiqueEmail.trim()) {
      newErrors.boutiqueEmail = "Email is required";
    } else if (!emailRegex.test(boutiqueEmail.trim())) {
      newErrors.boutiqueEmail = "Please enter a valid email address";
    }

    setBoutiqueErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await updateBoutique({
        name: boutiqueName,
        contact: boutiqueContact,
        email: boutiqueEmail,
        address: boutiqueAddress,
        gst: gstNumber,
      });
      window.dispatchEvent(new Event("refreshBoutiqueName"));
      toast.success("Boutique updated successfully!");
    } catch {
      toast.error("Failed to update boutique");
    }
  }

  function handleSaveNotifications() {
    toast.success("Notification preferences saved!");
  }

  async function handleToggleNotification(key, value) {
    try {
      const updated = {
        ...settings.notifications,
        [key]: value,
      };

      await updateNotifications(updated);

      setSettings({
        ...settings,
        notifications: updated,
      });
    } catch {
      toast.error("Failed to update notification");
    }
  }

  async function handleSaveAppearance() {
    try {
      await updateAppearance(appearance);

      toast.success("Appearance saved!");
    } catch {
      toast.error("Failed to update appearance");
    }
  }

  async function handleChangePassword() {
    const newErrors = {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = "Current password is required";
      }
      if (!newPassword) {
        newErrors.newPassword = "New password is required";
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your new password";
      }
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "New passwords do not match";
    }

    if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    setSecurityErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully!");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSecurityErrors({});
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const newErrors = {};

    if (!file.type.startsWith("image/")) {
      newErrors.photo = "Please upload a valid image file";
    }
    if (file.size > 2 * 1024 * 1024) {
      newErrors.photo = "File must be under 2MB";
    }

    setProfileErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadProfilePhoto(formData);
      void res;

      await loadUser();
      setProfileErrors((prev) => ({ ...prev, photo: "" }));

      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to upload photo");
    }
  }

  function handleLogout() {
    toast.success("Logged out successfully!");
    setShowLogoutDialog(false);
  }

  if (loading || !settings) {
    return (
      <div className="p-12">
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your boutique preferences and account
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="boutique" className="gap-2">
            <Store className="w-4 h-4" />
            Boutique
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection
            profileName={profileName}
            setProfileName={(value) => {
              setProfileName(value);
              setProfileErrors((prev) => ({ ...prev, profileName: "" }));
            }}
            profileEmail={profileEmail}
            setProfileEmail={(value) => {
              setProfileEmail(value);
              setProfileErrors((prev) => ({ ...prev, profileEmail: "" }));
            }}
            profilePhone={profilePhone}
            setProfilePhone={(value) => {
              const sanitized = value.replace(/\D/g, "").slice(0, 10);
              setProfilePhone(sanitized);
              setProfileErrors((prev) => ({ ...prev, profilePhone: "" }));
            }}
            profilePhoto={profilePhoto}
            setProfilePhoto={setProfilePhoto}
            fileInputRef={fileInputRef}
            handlePhotoUpload={handlePhotoUpload}
            handleSaveProfile={handleSaveProfile}
            errors={profileErrors}
          />
        </TabsContent>

        <TabsContent value="boutique">
          <BoutiqueSection
            boutiqueName={boutiqueName}
            setBoutiqueName={(value) => {
              setBoutiqueName(value);
              setBoutiqueErrors((prev) => ({ ...prev, boutiqueName: "" }));
            }}
            boutiqueContact={boutiqueContact}
            setBoutiqueContact={(value) => {
              const sanitized = value.replace(/\D/g, "").slice(0, 10);
              setBoutiqueContact(sanitized);
              setBoutiqueErrors((prev) => ({ ...prev, boutiqueContact: "" }));
            }}
            boutiqueEmail={boutiqueEmail}
            setBoutiqueEmail={(value) => {
              setBoutiqueEmail(value);
              setBoutiqueErrors((prev) => ({ ...prev, boutiqueEmail: "" }));
            }}
            boutiqueAddress={boutiqueAddress}
            setBoutiqueAddress={setBoutiqueAddress}
            gstNumber={gstNumber}
            setGstNumber={setGstNumber}
            handleSaveBoutique={handleSaveBoutique}
            errors={boutiqueErrors}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSection
            notifications={settings?.notifications}
            handleSaveNotifications={handleSaveNotifications}
            handleToggleNotification={handleToggleNotification}
          />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSection
            appearance={appearance}
            setAppearance={setAppearance}
            onSave={handleSaveAppearance}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySection
            currentPassword={currentPassword}
            setCurrentPassword={(value) => {
              setCurrentPassword(value);
              setSecurityErrors((prev) => ({ ...prev, currentPassword: "" }));
            }}
            newPassword={newPassword}
            setNewPassword={(value) => {
              setNewPassword(value);
              setSecurityErrors((prev) => ({ ...prev, newPassword: "" }));
            }}
            confirmPassword={confirmPassword}
            setConfirmPassword={(value) => {
              setConfirmPassword(value);
              setSecurityErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            handleChangePassword={handleChangePassword}
            setShowLogoutDialog={setShowLogoutDialog}
            errors={securityErrors}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-106.25 ">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your
              account.
            </DialogDescription>
          </DialogHeader>
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
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Logout"
        description="Are you sure you want to log out? This will end your session."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </div>
  );
}
