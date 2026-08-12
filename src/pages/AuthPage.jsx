import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AtSign, Loader2, LockKeyhole, Mail, User } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPasswordStrengthError } from "../utils/passwordValidation";
import { useAuth } from "../context/useAuth";
import { setPendingVerification } from "../utils/verifyCodeSession";
import { loadGoogleIdentityScript } from "../utils/googleIdentity";

const emptyForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const modeByPath = {
  "/login": "login",
  "/sign-up": "register",
  "/forgot-password": "forgot",
};

const pathByMode = {
  login: "/login",
  register: "/sign-up",
  forgot: "/forgot-password",
};

const inputStyles =
  "h-12 w-full border-0 border-b border-black/20 bg-transparent pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black disabled:cursor-not-allowed disabled:opacity-60";

function Field({ error, icon: Icon, label, trailingAction, ...props }) {
  const errorId = error ? `${props.id}-error` : undefined;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-4">
        <label
          htmlFor={props.id}
          className="block text-xs font-semibold text-black/60"
        >
          {label}
        </label>
        {trailingAction}
      </div>
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

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.9 6.9 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function SubmitButton({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-black px-7 text-sm font-semibold text-white transition-colors hover:bg-[#46413e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && (
        <Loader2 aria-hidden="true" className="animate-spin" size={17} />
      )}
      {children}
    </button>
  );
}

// Google Identity Services' renderButton() only draws Google's own button —
// it can't take our icon/label. A fully custom button driving google.accounts
// .id.prompt() (One Tap) isn't reliable enough to build a "click → popup"
// flow around: Google suppresses/cools down the prompt after a user dismisses
// it once, so a real click can silently do nothing.
//
// So the real, invisible Google button is layered on top of our styled one,
// sized to match exactly — whatever the user clicks always lands on Google's
// actual button underneath, which opens the standard account-chooser popup
// reliably. What's visible is still the custom design; what actually handles
// the click and the OAuth flow is the genuine GIS button.
function GoogleAuthButton() {
  const hostRef = useRef(null);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function handleCredentialResponse({ credential }) {
      const result = await loginWithGoogle(credential);
      if (result?.error) {
        toast.error("Unable to continue with Google", {
          description: result.error,
        });
        return;
      }
      toast.success("Welcome", {
        description: "You are signed in to your listening journal.",
      });
      navigate("/");
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !hostRef.current) return;
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(hostRef.current, {
          type: "standard",
          // GIS wants a pixel width, not a percentage — the container is a
          // fixed-width column (see .auth-form-shell in index.css), so the
          // measured width at mount time is stable.
          width: hostRef.current.offsetWidth || 400,
        });
      })
      .catch(() => {
        // Leave the decorative button visible with nothing behind it rather
        // than throwing — a network hiccup loading a third-party script
        // shouldn't break the rest of the auth page.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="my-7 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-black/10" />
        <span className="text-xs font-medium text-black/40">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-black/10" />
      </div>
      <div className="relative h-12 w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none flex h-12 w-full items-center justify-center gap-3 rounded-[4px] border border-black/20 bg-white text-sm font-semibold text-black"
        >
          <GoogleIcon />
          Continue with Google
        </div>
        <div
          ref={hostRef}
          className="absolute inset-0 overflow-hidden opacity-0 [&>div]:!w-full"
        />
      </div>
    </>
  );
}

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, forgotPassword, state } = useAuth();
  const mode = modeByPath[location.pathname] || "login";
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [resetLinkSent, setResetLinkSent] = useState(false);

  const switchMode = (nextMode) => {
    const nextPath = pathByMode[nextMode] || "/login";
    setForm(emptyForm);
    setErrors({});
    setApiError("");
    setResetLinkSent(false);
    if (location.pathname !== nextPath) navigate(nextPath);
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setApiError("");
  };

  const validateLogin = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!form.password.trim()) next.password = "Password is required.";
    return next;
  };

  const validateRegister = () => {
    const next = validateLogin();
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.username.trim()) next.username = "Username is required.";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      next.username = "Use only letters, numbers, and underscores.";
    }
    if (form.password) {
      const passwordError = getPasswordStrengthError(form.password);
      if (passwordError) next.password = passwordError;
    }
    if (!form.confirmPassword.trim()) {
      next.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }
    return next;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await login({ email: form.email, password: form.password });
    if (result?.code === "EMAIL_NOT_VERIFIED") {
      setPendingVerification({
        email: form.email.trim().toLowerCase(),
        purpose: "signup_verify",
      });
      navigate("/verify-code");
      return;
    }
    if (result?.error) {
      setApiError(result.error);
      toast.error("Unable to log in", {
        description: result.error,
      });
      return;
    }
    toast.success("Welcome back", {
      description: "You are signed in to your listening journal.",
    });
    navigate("/");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegister();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = await signup({
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      email: form.email,
      password: form.password,
    });
    if (result?.error) {
      setApiError(result.error);
      toast.error("Unable to create account", {
        description: result.error,
      });
      return;
    }

    setPendingVerification({
      email: form.email.trim().toLowerCase(),
      purpose: "signup_verify",
    });
    toast.success("Account created", {
      description: "Enter the code we sent you to finish setting up.",
    });
    navigate("/verify-code");
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const email = form.email.trim().toLowerCase();
    // Always "succeeds" — the server never reveals whether the account
    // exists, so there's nothing here to branch on beyond a hard failure.
    const result = await forgotPassword({ email });
    if (result?.error) {
      setApiError(result.error);
      toast.error("Unable to request a reset link", {
        description: result.error,
      });
      return;
    }

    // No navigation — the rest of this flow happens by clicking the link in
    // the email, on this device or another, whenever the user gets to it.
    setResetLinkSent(true);
  };

  const isRegister = mode === "register";
  const isForgot = mode === "forgot";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-7 lg:py-12">
        <section className="relative grid w-full max-w-6xl overflow-hidden border border-black/10 bg-white shadow-[0_24px_80px_rgba(17,17,17,0.12)] lg:min-h-[700px] lg:grid-cols-2">
          <div
            className={`auth-form-panel ${isRegister ? "hidden lg:flex" : "flex"} ${
              mode === "forgot" ? "items-center" : ""
            }`}
          >
            {mode === "forgot" ? (
              <div className="auth-form-shell">
                {resetLinkSent ? (
                  <div className="text-center">
                    <h1 className="auth-title mx-auto">Check your inbox</h1>
                    <p className="auth-copy mx-auto">
                      If an account exists for{" "}
                      <span className="font-semibold text-black">
                        {form.email.trim().toLowerCase()}
                      </span>
                      , we've sent a link there to reset your password. It
                      works once and expires soon, so use it before
                      requesting another.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="mt-7 font-semibold text-black underline underline-offset-4 transition-colors hover:text-black/50"
                    >
                      Back to log in
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <h1 className="auth-title mx-auto">Forgot password</h1>
                      <p className="auth-copy mx-auto">
                        Enter your email to receive a reset link
                      </p>
                    </div>

                    <form
                      className="mt-8 space-y-7"
                      onSubmit={handleForgotPassword}
                    >
                      <Field
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        label="Email"
                        placeholder="you@example.com"
                        icon={Mail}
                        value={form.email}
                        error={errors.email}
                        disabled={state.loading}
                        onChange={(event) =>
                          handleChange("email", event.target.value)
                        }
                      />
                      <SubmitButton loading={state.loading}>
                        Send reset link
                      </SubmitButton>
                    </form>

                    <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm text-black/55">
                      <span>Remember your password?</span>
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="font-semibold text-black underline underline-offset-4 transition-colors hover:text-black/50"
                      >
                        Log in
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="auth-form-shell">
                <div className="text-center">
                  <h1 className="auth-title mx-auto whitespace-nowrap">
                    Welcome back
                  </h1>
                  <p className="auth-copy mx-auto">
                    Log in to access your account
                  </p>
                </div>

                {apiError && (
                  <div
                    role="alert"
                    className="mt-7 border-l-2 border-red-600 bg-red-50 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-red-700">
                      {apiError}
                    </p>
                    <p className="mt-1 text-xs text-red-600">
                      Please check your email and password.
                    </p>
                  </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                  <Field
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    label="Email"
                    placeholder="you@example.com"
                    icon={Mail}
                    value={form.email}
                    error={errors.email}
                    disabled={state.loading}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                  />
                  <Field
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    label="Password"
                    trailingAction={
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs font-semibold text-black/55 transition-colors hover:text-black hover:underline hover:underline-offset-4"
                      >
                        Forgot password ?
                      </button>
                    }
                    placeholder="Enter your password"
                    icon={LockKeyhole}
                    value={form.password}
                    error={errors.password}
                    disabled={state.loading}
                    onChange={(event) =>
                      handleChange("password", event.target.value)
                    }
                  />
                  <div className="pt-1">
                    <SubmitButton loading={state.loading}>Log in</SubmitButton>
                  </div>
                </form>

                <GoogleAuthButton />

                <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm text-black/55">
                  <span>Don&apos;t have an account ?</span>
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-semibold text-black underline underline-offset-4 transition-colors hover:text-black/50"
                  >
                    Create an account
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className={`auth-form-panel ${isRegister ? "flex" : "hidden lg:flex"}`}
          >
            <div className="auth-form-shell">
              <div className="text-center">
                <h1 className="auth-title mx-auto">Create your account</h1>
                <p className="auth-copy mx-auto text-center">
                  Sign up to save your profile and manage your account
                </p>
              </div>

              {apiError && (
                <div
                  role="alert"
                  className="mt-7 border-l-2 border-red-600 bg-red-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-red-700">
                    {apiError}
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    Please check your details and try again.
                  </p>
                </div>
              )}

              <form
                className="mt-8 grid gap-x-5 gap-y-5 sm:grid-cols-2"
                onSubmit={handleRegister}
              >
                <Field
                  id="register-first-name"
                  type="text"
                  autoComplete="given-name"
                  label="First name"
                  placeholder="Your first name"
                  icon={User}
                  value={form.firstName}
                  error={errors.firstName}
                  disabled={state.loading}
                  onChange={(event) =>
                    handleChange("firstName", event.target.value)
                  }
                />
                <Field
                  id="register-last-name"
                  type="text"
                  autoComplete="family-name"
                  label="Last name (optional)"
                  placeholder="Your last name"
                  icon={User}
                  value={form.lastName}
                  error={errors.lastName}
                  disabled={state.loading}
                  onChange={(event) =>
                    handleChange("lastName", event.target.value)
                  }
                />
                <div className="sm:col-span-2">
                  <Field
                    id="register-username"
                    type="text"
                    autoComplete="username"
                    label="Username"
                    placeholder="your_username"
                    icon={AtSign}
                    value={form.username}
                    error={errors.username}
                    disabled={state.loading}
                    onChange={(event) =>
                      handleChange("username", event.target.value)
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    label="Email"
                    placeholder="you@example.com"
                    icon={Mail}
                    value={form.email}
                    error={errors.email}
                    disabled={state.loading}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    label="Password"
                    placeholder="At least 8 characters, including ."
                    icon={LockKeyhole}
                    value={form.password}
                    error={errors.password}
                    disabled={state.loading}
                    onChange={(event) =>
                      handleChange("password", event.target.value)
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    id="register-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    label="Confirm password"
                    placeholder="Repeat password"
                    icon={LockKeyhole}
                    value={form.confirmPassword}
                    error={errors.confirmPassword}
                    disabled={state.loading}
                    onChange={(event) =>
                      handleChange("confirmPassword", event.target.value)
                    }
                  />
                </div>
                <div className="mt-2 sm:col-span-2">
                  <SubmitButton loading={state.loading}>Sign up</SubmitButton>
                </div>
              </form>

              <GoogleAuthButton />

              <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-sm text-black/55">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-semibold text-black underline underline-offset-4 transition-colors hover:text-black/50"
                >
                  Log in
                </button>
              </div>
            </div>
          </div>

          <aside
            className="auth-music-panel hidden lg:flex"
            style={{ transform: `translateX(${isRegister ? "0%" : "100%"})` }}
            aria-live="polite"
          >
            <div
              key={mode}
              className="auth-panel-copy-in relative z-10 flex h-full w-full flex-col justify-between p-12 xl:p-16"
            >
              <div className="mr-auto max-w-sm text-left text-white">
                <p className="mb-5 text-xs font-semibold uppercase text-white/60">
                  {isRegister
                    ? "Already have an account?"
                    : isForgot
                      ? "ACCOUNT RECOVERY"
                      : "A personal listening journal"}
                </p>
                <h2 className="font-display text-4xl font-medium leading-tight xl:text-5xl">
                  {isRegister
                    ? "Your favorite songs are waiting"
                    : isForgot
                      ? "A simple way back to your account"
                      : "Some songs end Their echoes do not"}
                </h2>
              </div>
              <p className="mx-auto max-w-sm text-center text-sm leading-6 text-white/65">
                {isRegister
                  ? "Come back to the records, stories, and memories you chose to keep"
                  : isForgot
                    ? "Reset your password securely and return when you are ready"
                    : "Six artists, six songs, and the feeling behind every best pick"}
              </p>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AuthPage;
