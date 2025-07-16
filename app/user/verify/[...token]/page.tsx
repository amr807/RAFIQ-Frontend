"use client";
import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Params {
  params: { token: string };
}

const VerifyTokenPage: React.FC<Params> = ({ params }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          setError("Token has expired. Please request a new verification link.");
          return;
        }

        // Send the email to the backend for verification
        const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/verifed`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: decodedToken.email }),
        });
console.log(response) 
        // Handle response errors
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to verify email");
        }

        // If verification is successful, set loading to false
        setLoading(false);
      } catch (err) {
        console.error("Error verifying token:", err);
        setError(err instanceof Error ? err.message : "An error occurred while verifying your email. Please try again.");
      }
    };

    verifyToken();
  }, [params]);

  // Redirect to the error page if there's an error
  useEffect(() => {
    if (error) {
      router.push("/error");
    }
  }, [error, router]);

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
        <p className="text-gray-700 dark:text-gray-300">Verifying your email...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <button
        className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
        </svg>
      </button>
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
        <span className="sr-only">Success</span>
      </div>
      <p className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
        Congratulations! Your email has been verified.
      </p>
      <button
        className="py-2 px-3 text-lg font-semibold text-center text-white rounded-lg bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-900"
        type="button"
      >
        <Link href="/login">Continue</Link>
      </button>
    </div>
  );
};

export default VerifyTokenPage;