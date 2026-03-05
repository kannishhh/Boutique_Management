import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function AppearanceSection({
  appearance,
  setAppearance,
  onSave,
}) {
  return (
    <Card className="p-6 rounded-2xl border-border/50 shadow-sm">
      <h3 className="text-xl mb-6">Appearance Settings</h3>
      <div className="space-y-6">
        <div className="space-y-4">
          <Label>Theme</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setAppearance({ ...appearance, theme: "light" })}
              className={`p-6 border-2 rounded-xl text-left ${
                appearance.theme === "light"
                  ? "border-accent bg-accent/10"
                  : "border-border"
              }`}
            >
              <div className="w-12 h-12 bg-white rounded-lg mb-3" />

              <p className="font-medium">Light</p>
              <p className="text-sm text-muted-foreground">Default theme</p>
            </button>
            <button
              onClick={() => setAppearance({ ...appearance, theme: "dark" })}
              className={`p-6 border-2 rounded-xl text-left transition-colors ${
                appearance.theme === "dark"
                  ? "border-accent bg-accent/10 hover:border-accent/50 "
                  : "border-border"
              }`}
            >
              <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg mb-3" />

              <p className="font-medium">Dark</p>
              <p className="text-sm text-muted-foreground">Easy on eyes</p>
            </button>
            <button
              onClick={() => setAppearance({ ...appearance, theme: "auto" })}
              className={`p-6 border-2 rounded-xl text-left ${
                appearance.theme === "auto"
                  ? "border-accent bg-accent/10 hover:border-accent/50"
                  : "border-border"
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-background to-primary rounded-lg mb-3" />

              <p className="font-medium">Auto</p>
              <p className="text-sm text-muted-foreground">System default</p>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Accent Color</Label>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setAppearance({ ...appearance, accent: "#C9A961" })
              }
              className={`w-12 h-12 rounded-full bg-[#C9A961] ${
                appearance.accent === "#C9A961"
                  ? "border-4 border-accent"
                  : "border-2 border-border"
              }`}
            ></button>
            <button
              onClick={() =>
                setAppearance({ ...appearance, accent: "#D4AF37" })
              }
              className={`w-12 h-12 rounded-full bg-[#D4AF37] ${
                appearance.accent === "#D4AF37"
                  ? "border-2 border-border hover:border-accent/90"
                  : "border-2 border-border"
              } transition-colors`}
            ></button>
            <button
              onClick={() =>
                setAppearance({ ...appearance, accent: "#E5D4C1" })
              }
              className="w-12 h-12 rounded-full bg-[#E5D4C1] border-2 border-border hover:border-accent/50 transition-colors"
            ></button>
            <button
              onClick={() =>
                setAppearance({ ...appearance, accent: "#B8A07E" })
              }
              className="w-12 h-12 rounded-full bg-[#B8A07E] border-2 border-border hover:border-accent/50 transition-colors"
            ></button>
            <button
              onClick={() =>
                setAppearance({ ...appearance, accent: "#1a1a1a" })
              }
              className="w-12 h-12 rounded-full bg-[#1a1a1a] border-2 border-border hover:border-accent/50 transition-colors"
            ></button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="space-y-1">
            <p className="font-medium">Compact Model</p>
            <p className="text-sm text-muted-foreground">
              Reduce sapcing for more content
            </p>
          </div>
          <Switch
            checked={appearance?.compact}
            onCheckedChange={(val) =>
              setAppearance({ ...appearance, compact: val })
            }
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            onClick={onSave}
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </Button>
        </div>
      </div>
    </Card>
  );
}
