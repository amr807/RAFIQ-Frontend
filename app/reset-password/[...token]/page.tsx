/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Params {
  params: { token: string };
}

const ResetPasswordPage: React.FC<Params> = ({ params }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        let { token } = params;

        // Convert token to string if it's not already a string
        if (typeof token !== "string") {
          token = String(token); // Convert to string
        }
        console.log("Token received:", token); // Debugging

        // Validate the token
        if (!token || typeof token !== "string" || token.split(".").length !== 3) {
          throw new Error("Invalid token: Token must be a valid JWT string");
        }

        // Decode the token
        const decodedToken = jwtDecode<{ email: string; exp: number }>(token);
        console.log("Decoded token:", decodedToken); // Debugging

        const dateToken = decodedToken.exp * 1000; // Convert expiration time to milliseconds
        const now = Date.now();

        // Check if the token is expired
        if (now > dateToken) {
          setError("Token has expired. Please request a new reset link.");
          return;
        }

        // If the token is valid, set loading to false
        setIsTokenValid(true);
        setLoading(false);
      } catch (err) {
        console.error("Error verifying token:", err);
        setError(err instanceof Error ? err.message : "An error occurred while verifying your token. Please try again.");
      }
    };

    verifyToken();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setPasswordMatchError(true);
      return;
    }

    setPasswordMatchError(false);

    try {
      let { token } = params;
      if (typeof token !== "string") {
        token = String(token); // Convert to string
      }
     
      const {email} = jwtDecode<{ email: string }>(token);
      console.log("Decoded token:", email); 
      // Send the new password to the backend for reset
      const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/updatepassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      // Handle response errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset password.");
      }

      // If the password reset is successful, set the success state
      setIsPasswordReset(true);

      // Redirect to the login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setError(err instanceof Error ? err.message : "An error occurred while resetting your password. Please try again.");
    }
  };

 

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500 text-lg">{error}</p>
        <Link href="/" className="mt-4 text-blue-500 hover:underline">
          Go back to home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300">Verifying your token...</p>
      </div>
    );
  }

  if (isPasswordReset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mx-auto mb-3.5">
          <svg
            aria-hidden="true"
            className="w-12 h-11 text-green-500 dark:text-green-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        </div>
        <p className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          Your password has been successfully reset.
        </p>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Reset Your Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            {passwordMatchError && <p className="text-red-500 text-sm mt-1">Passwords do not match.</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;