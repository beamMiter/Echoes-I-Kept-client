import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import AdminRoute from "./components/AdminRoute";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AuthPage from "./pages/AuthPage";
import PostDetailPage from "./pages/PostDetailPage";
import AdminArticleManagementPage from "./pages/AdminArticleManagementPage";
import AdminCategoryManagementPage from "./pages/AdminCategoryManagementPage";
import AdminMemberManagementPage from "./pages/AdminMemberManagementPage";
import AdminNotificationPage from "./pages/AdminNotificationPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
