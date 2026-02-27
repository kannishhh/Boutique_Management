import { useNavigate, useParams } from "react-router";
import { resetPassword } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await resetPassword({ token, password });

      toast.success("Password reset successful");
      navigate("/");
    } catch (err) {
      toast.error("Invalid or expired token");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-96">
        <h2 className="text-2xl">Reset Password</h2>

        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full">
          Reset Password
        </Button>
      </form>
    </div>
  );
}
