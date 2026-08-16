import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OtpCodeInput from "../components/OtpCodeInput";
import { useAuth } from "../context/useAuth";
import {
  clearPendingVerification,
  getPendingVerification,
} from "../utils/verifyCodeSession";

const RESEND_COOLDOWN_SECONDS = 60;

// Signup email verification only — password reset moved to a link emailed
// directly (see NewPasswordPage.jsx), so this page no longer branches on a
// "purpose".
function VerifyCodePage() {
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationCode, state } = useAuth();
  const [pending] = useState(() => getPendingVerification());

  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (!pending) {
      navigate("/login");
    }
  }, [pending, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!pending) return null;

  const handleResend = async () => {
    setApiError("");
    const result = await resendVerificationCode({ email: pending.email });

    if (result?.error) {
      setApiError(result.error);
      toast.error("Unable to resend code", { description: result.error });
      return;
    }

    setCooldown(RESEND_COOLDOWN_SECONDS);
    toast.success("Code sent", {
      description: "Check your inbox for the new code.",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: "Enter the 6-digit code." });
      return;
    }
    setErrors({});

    const result = await verifyEmail({ email: pending.email, code });

    if (result?.error) {
      setApiError(result.error);
      toast.error("Unable to verify your email", { description: result.error });
      return;
    }

    clearPendingVerification();
    toast.success("Email verified", {
      description: "Your listening journal is ready.",
    });
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-7 lg:py-12">
        <section className="w-full max-w-md border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(17,17,17,0.12)] sm:p-10">
          <div className="auth-form-shell mx-auto">
            <div className="text-center">
              <h1 className="auth-title mx-auto text-3xl sm:text-4xl">
                Verify your email
              </h1>
              <p className="auth-copy mx-auto">
                Enter the 6-digit code we sent to{" "}
                <span className="font-semibold text-black">{pending.email}</span>
              </p>
            </div>

            {apiError && (
              <div
                role="alert"
                className="mt-7 border-l-2 border-red-600 bg-red-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-red-700">{apiError}</p>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <OtpCodeInput
                value={code}
                onChange={setCode}
                error={errors.code}
                disabled={state.loading}
              />

              <button
                type="submit"
                disabled={state.loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-black px-7 text-sm font-semibold text-white transition-colors hover:bg-[#46413e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.loading && (
                  <Loader2 aria-hidden="true" className="animate-spin" size={17} />
                )}
                Verify email
              </button>
            </form>

            <div className="mt-7 text-center text-sm text-black/55">
              {cooldown > 0 ? (
                <span>Resend code in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={state.loading}
                  className="font-semibold text-black underline underline-offset-4 transition-colors hover:text-black/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Resend code
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default VerifyCodePage;
