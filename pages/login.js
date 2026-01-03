import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { apiPost } from "../lib/api";
import { Button } from "@/components/ui";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(" ");
  const [errors, setErrors] = useState([]);
  const [isErrorOccured, setIsErrorOccured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkUser = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors([]);
    
    if (!email || !password) {
      setError("All fields are necessary");
      setIsErrorOccured(true);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await apiPost("/api/login", { email, password });
      const res = await response.json();
      
      if (res.success) {
        // Store user info for backward compatibility
        secureLocalStorage.setItem("u_id", res.user.u_id);
        secureLocalStorage.setItem("u_email", res.user.email);
        secureLocalStorage.setItem("u_name", res.user.name);
        secureLocalStorage.setItem("role", res.user.role);
        secureLocalStorage.setItem("isStudent", res.user.isStudent);
        secureLocalStorage.setItem("isInstructor", res.user.isInstructor);
        secureLocalStorage.setItem("isAdmin", res.user.isAdmin);
        
        // Store access token
        if (res.accessToken) {
          localStorage.setItem("edux_access_token", res.accessToken);
        }
        
        // Redirect based on user role
        const role = res.user.role;
        if (role === 'admin') {
          router.push("/admin");
        } else if (role === 'instructor') {
          router.push("/instructor");
        } else {
          router.push("/student");
        }
      } else {
        setIsErrorOccured(true);
        setError(res.message || "Login failed");
        if (res.errors) {
          setErrors(res.errors);
        }
        setPassword("");
      }
    } catch (err) {
      setIsErrorOccured(true);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Check if user is already logged in
    const role = secureLocalStorage.getItem("role");
    if (secureLocalStorage.getItem("u_id")) {
      // Redirect based on stored role
      if (role === 'admin') {
        router.push("/admin");
      } else if (role === 'instructor') {
        router.push("/instructor");
      } else {
        router.push("/student");
      }
    }
    let handler = () => {
      if (isErrorOccured) {
        setIsErrorOccured(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [router, isErrorOccured]);

  return (
    <div>
      <div className="w-full min-h-screen flex justify-center items-center bg-gray-900">
        <div className="relative w-[380px] h-[420px] bg-gray-800 rounded-tr-3xl rounded-bl-3xl overflow-hidden">
          <div className="absolute w-[380px] h-[420px] bg-gradient-to-r from-indigo-600 via-indigo-600 to-transparent -top-[50%] -left-[50%] animate-spin-slow origin-bottom-right"></div>
          <div className="absolute w-[380px] h-[420px] bg-gradient-to-r from-indigo-600 via-indigo-600 to-transparent -top-[50%] -left-[50%] animate-spin-delay origin-bottom-right"></div>
          <div className="absolute inset-1 bg-gray-800 rounded-tr-3xl rounded-bl-3xl z-10 p-5">
            <form className="flex-col space-y-8">
              <h2 className="text-xl font-semibold text-indigo-600 text-center">
                Log in
              </h2>
              {isErrorOccured && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                  {errors.length > 0 && (
                    <ul className="list-disc list-inside mt-2 text-sm">
                      {errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <div className="relative flex flex-col">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="relative z-10 border-0 border-indigo-600 h-10 bg-transparent text-gray-100 outline-none px-2 peer"
                  autoComplete="email"
                />
                <i className="bg-indigo-600 rounded w-full bottom-0 left-0 absolute h-10 -z-10 duration-500 origin-bottom transform peer-focus:h-10 peer-placeholder-shown:h-[0.5px]" />
                <label className="peer-focus:font-medium absolute text-sm duration-500 transform -translate-y-8 scale-75 top-3 left-0 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-600 text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-500 peer-focus:scale-75 peer-focus:-translate-y-8">
                  Enter Email
                </label>
              </div>
              <div className="relative flex flex-col">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="relative z-10 border-0 border-indigo-600 h-10 bg-transparent text-gray-100 outline-none px-2 peer"
                  autoComplete="current-password"
                />
                <i className="bg-indigo-600 rounded w-full bottom-0 left-0 absolute h-10 -z-10 duration-500 origin-bottom transform peer-focus:h-10 peer-placeholder-shown:h-[0.5px]" />
                <label className="peer-focus:font-medium absolute text-sm duration-500 transform -translate-y-8 scale-75 top-3 left-0 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-600 text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-500 peer-focus:scale-75 peer-focus:-translate-y-8">
                  Enter Password
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required=""
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="text-gray-500 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                </div>
                <a
                  href="/forgot-password"
                  className="text-indigo-600 text-sm font-medium hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="flex justify-center">
                <Button
                  type="submit"
                  onClick={checkUser}
                  disabled={isLoading}
                  className="border-solid border-indigo-600 border-2 hover:bg-indigo-600 rounded-md px-10 py-1.5 tracking-widest font-semibold text-white items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </div>
              <div>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Don’t have an account yet? <Link href="/signup">Sign up</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
