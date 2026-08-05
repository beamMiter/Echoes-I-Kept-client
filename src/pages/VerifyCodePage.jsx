import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LockKeyhole } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import OtpCodeInput from "../components/OtpCodeInput";
import { getPasswordStrengthError } from "../utils/passwordValidation";
import { useAuth } from "../context/useAuth";
import {
  clearPendingVerification,
  getPendingVerification,
} from "../utils/verifyCodeSession";

const RESEND_COOLDOWN_SECONDS = 60;

const inputStyles =
  "h-12 w-full border-0 border-b border-black/20 bg-transparent pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black disabled:cursor-not-allowed disabled:opacity-60";

function PasswordField({ error, icon: Icon, label, ...props }) {
  const errorId = error ? `${props.id}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={props.id}
        className="mb-1 block text-xs font-semibold text-black/60"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="absolute left-1 top-1/2 -translate-y-1/2 text-black/45"
          size={17}
          strokeWidth={1.7}
        />
        <input
          {...props}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`${inputStyles} ${error ? "border-red-500" : ""}`}
        />
      </div>
      {error && (
        <p
          id={errorId}
          className="mt-2 text-xs font-medium leading-relaxed text-[#9f3d32]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function VerifyCodePage() {
  const navigate = useNavigate();
  const { verifyEmail, resendVerificationCode, forgotPassword, resetPasswordWithCode, state } =
    useAuth();
  const [pending] = useState(() => getPendingVerification());

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const isPasswordReset = pending.purpose === "password_reset";

  const handleResend = async () => {
    setApiError("");
    const result = isPasswordReset
      ? await forgotPassword({ email: pending.email })
      : await resendVerificationCode({ email: pending.email });

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

    const nextErrors = {};
    if (!/^\d{6}$/.test(code)) nextErrors.code = "Enter the 6-digit code.";
    if (isPasswordReset) {
      const passwordError = getPasswordStrengthError(newPassword);
      if (passwordError) nextErrors.newPassword = passwordError;
      if (!confirmPassword.trim()) {
        nextErrors.confirmPassword = "Please confirm your password.";
      } else if (newPassword !== confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = isPasswordReset
      ? await resetPasswordWithCode({ email: pending.email, code, newPassword })
      : await verifyEmail({ email: pending.email, code });

    if (result?.error) {
      setApiError(result.error);
      toast.error(
        isPasswordReset ? "Unable to reset your password" : "Unable to verify your email",
        { description: result.error },
      );
      return;
    }

    clearPendingVerification();
    toast.success(isPasswordReset ? "Password updated" : "Email verified", {
      description: isPasswordReset
        ? "You're signed in with your new password."
        : "Your listening journal is ready.",
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
                {isPasswordReset ? "Reset your password" : "Verify your email"}
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

              {isPasswordReset && (
                <>
                  <PasswordField
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    label="New password"
                    placeholder="At least 8 characters, including ."
                    icon={LockKeyhole}
                    value={newPassword}
                    error={errors.newPassword}
                    disabled={state.loading}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setErrors((prev) => ({ ...prev, newPassword: "" }));
                    }}
                  />
                  <PasswordField
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    label="Confirm new password"
                    placeholder="Repeat password"
                    icon={LockKeyhole}
                    value={confirmPassword}
                    error={errors.confirmPassword}
                    disabled={state.loading}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }}
                  />
                </>
              )}

              <button
                type="submit"
                disabled={state.loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-black px-7 text-sm font-semibold text-white transition-colors hover:bg-[#46413e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.loading && (
                  <Loader2 aria-hidden="true" className="animate-spin" size={17} />
                )}
                {isPasswordReset ? "Reset password" : "Verify email"}
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
