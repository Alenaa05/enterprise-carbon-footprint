"use client";

import { useState } from "react";

const REGION = "ap-south-1";
const CLIENT_ID = "shrrsv0l5e490fdi3atps987t";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showVerification, setShowVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [organization, setOrganization] = useState("");

  async function login() {
    setError("");

    const res = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
      },
      body: JSON.stringify({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      }),
    });

    const data = await res.json();

    if (data.AuthenticationResult) {
      localStorage.setItem("token", data.AuthenticationResult.IdToken);
      window.location.href = "/dashboard";
    } else {
      setError(data.message || "Incorrect username or password.");
    }
  }

  async function signup() {
    setError("");

    const res = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp",
      },
      body: JSON.stringify({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
          {
            Name: "custom:organization",
            Value: organization,
          },
        ],
      }),
    });

    const data = await res.json();

    if (data.UserSub) {
      alert("Verification code sent to your email.");
      setShowVerification(true);
    } else {
      setError(data.message || "Signup failed.");
    }
  }

  async function verifyCode() {
    setError("");

    const res = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp",
      },
      body: JSON.stringify({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: verificationCode,
      }),
    });

    const data = await res.json();

    if (!data.__type) {
      alert("Email verified! You can now login.");
      setShowVerification(false);
      setMode("login");
    } else {
      setError(data.message || "Verification failed.");
    }
  }

  function submit(e: any) {
    e.preventDefault();

    if (mode === "login") login();
    else signup();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          SustainHub {mode === "login" ? "Login" : "Sign Up"}
        </h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Organization Name"
          className="w-full border p-3 rounded"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border p-3 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-sm text-gray-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {showVerification && (
          <input
            type="text"
            placeholder="Verification Code"
            className="w-full border p-3 rounded"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        )}

        {showVerification ? (
          <button
            type="button"
            onClick={verifyCode}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Verify Email
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
          >
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        )}

        {mode === "login" ? (
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-green-600"
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </p>
        ) : (
          <p className="text-center text-sm">
            Already have an account?{" "}
            <button
              type="button"
              className="text-green-600"
              onClick={() => {
                setMode("login");
                setShowVerification(false);
              }}
            >
              Login
            </button>
          </p>
        )}
      </form>
    </div>
  );
}
