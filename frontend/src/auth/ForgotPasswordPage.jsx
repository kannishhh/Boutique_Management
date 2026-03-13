import { useState } from "react";
import { useNavigate } from "react-router";
import { forgotPassword } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Mail, Sparkles } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({ username });

      setIsSubmitted(true);
      toast.success("Reset link generated (Check server console)");
    } catch (err) {
      toast.error("Something went wrong", {
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex ">
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

          {!isSubmitted ? (
            <>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>

              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl">Forgot Password</h2>
                <p className="text-muted-foreground">
                  No worries! Enter your email and we'll send you reset
                  instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

                    <Input
                      type="text"
                      placeholder="admin@boutique.com"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setErrors((prev) => ({ ...prev, username: "" }));
                      }}
                      className="h-12 pl-12 bg-white border-border rounded-xl"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="text-accent hover:text-accent/80 transition-colors font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                    <CheckCircle
                      className="w-10 h-10 text-accent"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl ">Check Server Console</h2>
                  <p className="text-muted-foreground">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-medium text-foreground">{username}</p>
                </div>

                <div className="bg-muted/30 rounded-xl p-6 space-y-3 text-left">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">
                      Didn't receive the email?
                    </strong>
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Check your spam or junk folder</li>
                    <li>Verify the email address is correct</li>
                    <li>Wait a few minutes and try again</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="h-12 rounded-xl"
                  >
                    Try Another Email
                  </Button>

                  <Button
                    onClick={() => navigate("/")}
                    className="h-12 bg-primary hover:bg-primary/90 text-white rounded-xl "
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              </div>
            </>
          )}
          <div className="text-center text-sm text-muted-foreground pt-8">
            <p>© 2026 The Golden Needle. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
