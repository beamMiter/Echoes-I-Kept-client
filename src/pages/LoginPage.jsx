import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";

function LoginPage() {
  const navigate = useNavigate();
  const { login, state } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const next = {};

    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email address.";
    }

    if (!form.password.trim()) {
      next.password = "Password is required.";
    }

    return next;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const result = await login(form);
    if (result?.error) {
      setApiError(result.error);
      return;
    }

    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex justify-center items-center p-4 my-4 flex-grow">
        <div className="w-full max-w-2xl bg-[#EFEEEB] rounded-sm shadow-md px-4 sm:px-12 lg:px-20 py-8 sm:py-14">
          <h2 className="text-2xl sm:text-4xl font-semibold text-center mb-6 text-foreground">
            Log in
          </h2>

          {apiError && (
            <div className="mb-6 bg-red-500 text-white p-4 rounded-sm">
              <h3 className="font-bold text-lg mb-1">{apiError}</h3>
              <p className="text-sm">Please try another password or email</p>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="relative space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={state.loading}
                className={`mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="relative space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={state.loading}
                className={`mt-1 flex h-10 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-muted-foreground ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={state.loading}
                className="px-8 py-2 bg-foreground text-white rounded-md hover:bg-muted-foreground transition-colors flex items-center gap-2"
              >
                {state.loading && (
                  <Loader2 className="animate-spin" size={20} />
                )}
                Log in
              </button>
            </div>
          </form>

          <p className="flex flex-row justify-center gap-1 mt-4 text-sm text-center pt-2 text-muted-foreground font-medium">
            Don&apos;t have an account?{" "}
            <Link
              to="/sign-up"
              className="text-foreground hover:text-muted-foreground transition-colors underline font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LoginPage;
