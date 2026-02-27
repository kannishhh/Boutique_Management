import { Save } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function BoutiqueSection({
  boutiqueName,
  setBoutiqueName,
  boutiqueContact,
  setBoutiqueContact,
  boutiqueEmail,
  setBoutiqueEmail,
  boutiqueAddress,
  setBoutiqueAddress,
  gstNumber,
  setGstNumber,
  handleSaveBoutique,
}) {
  return (
    <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
      <h3 className="text-xl mb-6">Boutique Details</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Boutique Name</Label>
          <Input
            value={boutiqueName}
            onChange={(e) => setBoutiqueName(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Contact Number</Label>
            <Input
              value={boutiqueContact}
              onChange={(e) => setBoutiqueContact(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={boutiqueEmail}
              onChange={(e) => setBoutiqueEmail(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Address</Label>
          <Textarea
            value={boutiqueAddress}
            onChange={(e) => setBoutiqueAddress(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>GST Number (Optional)</Label>
            <Input
              value={gstNumber}
              placeholder="22AAAAA0000A1Z5"
              onChange={(e) => setGstNumber(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Business Registration</Label>
            <Input placeholder="Registration number" className="rounded-xl" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            onClick={handleSaveBoutique}
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
