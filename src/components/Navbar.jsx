import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  User,
  UserPlus,
  UserRound,
  KeyRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, state, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
  };

  const profilePath =
    state.user?.role === "admin" ? "/admin/profile" : "/profile";
  const resetPasswordPath =
    state.user?.role === "admin" ? "/admin/reset-password" : "/reset-password";

  return (
    <div
      className={`sticky top-0 z-50 transition-[padding] duration-700 ease-in-out
        ${scrolled ? "px-4 md:px-[14%] lg:px-[18%] pt-3 pb-0" : "px-0 pt-0 pb-0"}`}
    >
      <nav
        className={`relative flex items-center justify-between w-full py-6 px-6 md:px-12 transition-all duration-700 ease-in-out
          ${
            scrolled
              ? "rounded-2xl bg-[#EFEEEB]/95 backdrop-blur-md shadow-md border border-[#D9D8D4]"
              : "bg-[#EFEEEB] border-b border-[#D9D8D4]"
          }`}
      >
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/svg/listening-to-music.svg"
            alt=""
            className="h-12 w-12 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-2xl md:text-3xl font-bold tracking-tight border-b-2 border-foreground pb-0.5 block">
              Echoes I Kept
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-right block mt-0.5">
              Blog
            </span>
          </div>
        </Link>

        {state.getUserLoading ? (
          <div className="hidden sm:flex items-center">
            <div className="h-9 w-9 rounded-full bg-[#D9D8D4] animate-pulse" />
            <div className="ml-3 h-4 w-24 bg-[#D9D8D4] animate-pulse rounded" />
          </div>
        ) : isAuthenticated ? (
          <div className="hidden items-center gap-4 sm:flex">
            <NotificationBell />
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className="inline-flex h-10 max-w-64 items-center justify-end gap-2 whitespace-nowrap rounded-md text-sm font-medium text-foreground hover:text-muted-foreground focus:outline-none transition-colors"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                <img
                  src={state.user.profilePic}
                  alt="Profile"
                  className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#D9D8D4]"
                />
                <span className="min-w-0 max-w-40 truncate">
                  {state.user.name}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-[#D9D8D4] bg-white p-1.5 shadow-md"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(profilePath);
                    }}
                    className="flex w-full cursor-pointer items-center px-3 py-2 text-sm text-foreground rounded-sm hover:bg-[#EFEEEB] hover:text-muted-foreground transition-colors"
                    role="menuitem"
                  >
                    <User className="mr-2 h-4 w-4 opacity-60" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate(resetPasswordPath);
                    }}
                    className="flex w-full cursor-pointer items-center px-3 py-2 text-sm text-foreground rounded-sm hover:bg-[#EFEEEB] hover:text-muted-foreground transition-colors"
                    role="menuitem"
                  >
                    <KeyRound className="mr-2 h-4 w-4 opacity-60" />
                    Reset password
                  </button>
                  {state.user.role === "admin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/admin/article-management");
                      }}
                      className="flex w-full cursor-pointer items-center px-3 py-2 text-sm text-foreground rounded-sm hover:bg-[#EFEEEB] hover:text-muted-foreground transition-colors"
                      role="menuitem"
                    >
                      <LayoutGrid className="mr-2 h-4 w-4 opacity-60" />
                      Admin panel
                    </button>
                  )}
                  <div className="my-1 border-t border-[#EFEEEB]" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center px-3 py-2 text-sm text-foreground rounded-sm hover:bg-[#EFEEEB] hover:text-muted-foreground transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="mr-2 h-4 w-4 opacity-60" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative hidden shrink-0 sm:block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 bg-white text-foreground transition-colors hover:border-foreground/50 hover:bg-[#E7E5E0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              aria-label="Open account menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
            >
              <UserRound className="h-5 w-5" strokeWidth={1.7} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-3 w-52 rounded-[4px] border border-[#D9D8D4] bg-white p-1.5 shadow-[0_16px_40px_rgba(20,20,20,0.12)]"
                role="menu"
              >
                <Link
                  to="/login"
                  onClick={() => setDropdownOpen(false)}
                  className="flex w-full items-center rounded-sm px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[#EFEEEB]"
                  role="menuitem"
                >
                  <LogIn className="mr-3 h-4 w-4 opacity-60" />
                  Log in
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setDropdownOpen(false)}
                  className="flex w-full items-center rounded-sm px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[#EFEEEB]"
                  role="menuitem"
                >
                  <UserPlus className="mr-3 h-4 w-4 opacity-60" />
                  Create account
                </Link>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="sm:hidden focus:outline-none text-foreground"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {mobileMenuOpen && (
          <div
            className={`sm:hidden absolute top-full left-0 w-full bg-[#EFEEEB]/95 backdrop-blur-md border border-t-0 border-[#D9D8D4] flex flex-col gap-5 py-6 px-6 z-50 shadow-md
            ${scrolled ? "rounded-b-2xl" : ""}`}
          >
            {state.getUserLoading ? (
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-[#D9D8D4] animate-pulse" />
                <div className="ml-3 h-5 w-28 bg-[#D9D8D4] animate-pulse rounded" />
              </div>
            ) : isAuthenticated ? (
              <div className="space-y-1">
                <div className="flex items-center py-2 mb-2">
                  <img
                    src={state.user.profilePic}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-[#D9D8D4]"
                  />
                  <span className="ml-3 text-base font-medium text-foreground">
                    {state.user.name}
                  </span>
                </div>
                <NotificationBell
                  compact
                  onNavigate={() => setMobileMenuOpen(false)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(profilePath);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#E2E1DD] rounded-md transition-colors"
                >
                  <User className="mr-3 h-4 w-4 opacity-60" />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(resetPasswordPath);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#E2E1DD] rounded-md transition-colors"
                >
                  <KeyRound className="mr-3 h-4 w-4 opacity-60" />
                  Reset password
                </button>
                {state.user.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/admin/article-management");
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#E2E1DD] rounded-md transition-colors"
                  >
                    <LayoutGrid className="mr-3 h-4 w-4 opacity-60" />
                    Admin panel
                  </button>
                )}
                <div className="border-t border-[#D9D8D4] pt-1 mt-1" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#E2E1DD] rounded-md transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4 opacity-60" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="mb-3 flex items-center border-b border-[#D9D8D4] px-2 pb-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-foreground/20 bg-white text-foreground">
                    <UserRound className="h-5 w-5" strokeWidth={1.7} />
                  </span>
                  <span className="ml-3 text-sm font-semibold text-foreground">
                    Guest account
                  </span>
                </div>
                <Link
                  to="/login"
                  className="flex items-center rounded-sm px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[#E2E1DD]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="mr-3 h-4 w-4 opacity-60" />
                  Log in
                </Link>
                <Link
                  to="/sign-up"
                  className="flex items-center rounded-sm px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[#E2E1DD]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="mr-3 h-4 w-4 opacity-60" />
                  Create account
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
