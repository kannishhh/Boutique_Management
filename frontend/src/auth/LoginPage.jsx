import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../api/auth.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { useUser } from "@/context/UserContext";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const { loadUser } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const data = await login({ username, password });

      if (rememberMe) {
        localStorage.setItem("token", data.token);
      } else {
        sessionStorage.setItem("token", data.token);
      }

      await loadUser();

      toast.success("Welcome back!", {
        description: "Login successful",
      });
      onLogin();
    } catch (err) {
      toast.error("Login failed", {
        description: "Invalid username or password",
      });
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/60 z-10" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1768669324369-c11ec8305d77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0YWlsb3IlMjBib3V0aXF1ZSUyMGZhc2hpb258ZW58MXx8fHwxNzcxNTc5MTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Luxury tailor boutique - fine fabrics and elegant fashion"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white p-12">
          <Sparkles className="w-16 h-16 mb-6" strokeWidth={1.5} />
          <h1 className="text-5xl mb-4 text-center">The Golden Needle</h1>
          <p className="text-xl text-white/90 text-center max-w-md">
            Luxury Boutique Management System
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <Sparkles
              className="w-12 h-12 mx-auto mb-4 text-primary"
              strokeWidth={1.5}
            />
            <h1 className="text-4xl mb-2">The Golden Needle</h1>
            <p className="text-muted-foreground">Boutique Management</p>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl">Welcome Back</h2>
            <p className="text-muted-foreground">
              Sign in to access your boutique dashboard
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or User ID</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="admin@botique.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-white border-border rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white border-border rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded"
                />
                <span className="text-muted-foreground">Remember me</span>
              </Label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-accent hover:text-accent/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl"
            >
              Sign In
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground pt-8">
            <p>© 2026 The Golden Needle. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
