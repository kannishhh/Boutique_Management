import { Save } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AvatarImage } from "@radix-ui/react-avatar";

export default function ProfileSection({
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  profilePhone,
  setProfilePhone,
  profilePhoto,
  setProfilePhoto,
  fileInputRef,
  handlePhotoUpload,
  handleSaveProfile,
}) {
  return (
    <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
      <h3 className="text-xl mb-6">Profile Information</h3>
      <div className="space-y-6">
        <Input
          ref={fileInputRef}
          variant="outline"
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        <div className="flex items-center gap-6">
          <Avatar className="w-24 h-24 border-2 border-accent">
            {profilePhoto ? (
              <AvatarImage src={profilePhoto} alt="Profile Photo" />
            ) : (
              <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                {profileName?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>
            <p className="text-sm text-muted-foreground">
              JPS or PNG. Max size 2MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input defaultValue="ADMIN001" className="rounded-xl" disabled />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            onClick={handleSaveProfile}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </Card>
  );
}
