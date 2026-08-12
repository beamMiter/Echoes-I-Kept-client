import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LockKeyhole } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPasswordStrengthError } from "../utils/passwordValidation";
import { useAuth } from "../context/useAuth";

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

// Reached only via the link in the password-reset email — the token lives in
// the URL path (that's what makes the link work at all) but is never sent
// anywhere just by loading this page. It's only submitted, alongside the new
// password, when the user actually presses "Set new password" below. That
// split matters: an email client or link scanner prefetching the URL just
// renders this form, it can't burn the token's single use on its own.
function NewPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPasswordWithToken, state } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    const nextErrors = {};
    const passwordError = getPasswordStrengthError(newPassword);
    if (passwordError) nextErrors.newPassword = passwordError;
    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await resetPasswordWithToken({ token, newPassword });
    if (result?.error) {
      setApiError(result.error);
      toast.error("Unable to reset your password", {
        description: result.error,
      });
      return;
    }

    toast.success("Password updated", {
      description: "You're signed in with your new password.",
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
                Set a new password
              </h1>
              <p className="auth-copy mx-auto">
                Choose a new password for your account.
              </p>
            </div>

            {apiError && (
              <div
                role="alert"
                className="mt-7 border-l-2 border-red-600 bg-red-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-red-700">{apiError}</p>
                {apiError.toLowerCase().includes("expired") && (
                  <p className="mt-1 text-xs text-red-700/80">
                    Request a new reset link from the{" "}
                    <a href="/login" className="underline">
                      login page
                    </a>
                    .
                  </p>
                )}
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

              <button
                type="submit"
                disabled={state.loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-black px-7 text-sm font-semibold text-white transition-colors hover:bg-[#46413e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.loading && (
                  <Loader2 aria-hidden="true" className="animate-spin" size={17} />
                )}
                Set new password
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default NewPasswordPage;
