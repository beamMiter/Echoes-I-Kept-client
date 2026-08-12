import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminRoute from "./components/AdminRoute";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";

// Only the homepage is bundled eagerly — it's the common entry point, and it's
// what the GSAP-driven hero lives on. Everything else is split out so a visitor
// isn't downloading the admin panel and the markdown renderer just to read the
// front page.
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
const AdminArticleManagementPage = lazy(
  () => import("./pages/admin/AdminArticleManagementPage"),
);
const AdminCategoryManagementPage = lazy(
  () => import("./pages/admin/AdminCategoryManagementPage"),
);
const AdminMemberManagementPage = lazy(
  () => import("./pages/admin/AdminMemberManagementPage"),
);
const AdminNotificationPage = lazy(
  () => import("./pages/admin/AdminNotificationPage"),
);
const AdminContentModerationPage = lazy(
  () => import("./pages/admin/AdminContentModerationPage"),
);
const MyArticlesPage = lazy(() => import("./pages/MyArticlesPage"));
const MyArticleFormPage = lazy(() => import("./pages/MyArticleFormPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NewPasswordPage = lazy(() => import("./pages/NewPasswordPage"));
const VerifyCodePage = lazy(() => import("./pages/VerifyCodePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Toaster
          closeButton
          position="top-right"
          swipeDirections={["right"]}
          toastOptions={{
            classNames: {
              toast: "app-toast",
              title: "app-toast-title",
              description: "app-toast-description",
              closeButton: "app-toast-close",
            },
          }}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:postId" element={<PostDetailPage />} />
          <Route
            path="/admin/article-management"
            element={
              <AdminRoute>
                <AdminArticleManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/category-management"
            element={
              <AdminRoute>
                <AdminCategoryManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/member-management"
            element={
              <AdminRoute>
                <AdminMemberManagementPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notification"
            element={
              <AdminRoute>
                <AdminNotificationPage />
              </AdminRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <ProfilePage />
              </AdminRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ProtectedRoute>
                <ResetPasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reset-password"
            element={
              <AdminRoute>
                <ResetPasswordPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/content-moderation"
            element={
              <AdminRoute>
                <AdminContentModerationPage />
              </AdminRoute>
            }
          />
          <Route
            path="/my-posts"
            element={
              <ProtectedRoute>
                <MyArticlesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-posts/new"
            element={
              <ProtectedRoute>
                <MyArticleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-posts/:postId/edit"
            element={
              <ProtectedRoute>
                <MyArticleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/login"
            element={<AdminLoginPage />}
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthPage />
              </GuestRoute>
            }
          />
          <Route
            path="/sign-up"
            element={
              <GuestRoute>
                <AuthPage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <AuthPage />
              </GuestRoute>
            }
          />
          <Route
            path="/verify-code"
            element={
              <GuestRoute>
                <VerifyCodePage />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <GuestRoute>
                <NewPasswordPage />
              </GuestRoute>
            }
          />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
