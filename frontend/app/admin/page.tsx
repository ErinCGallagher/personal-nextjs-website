/**
 * Admin login page.
 * Simple password authentication for admin access.
 */
import LoginForm from "./login-form";

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Admin Login
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
