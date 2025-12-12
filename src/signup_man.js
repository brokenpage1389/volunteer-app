import React, { useState } from "react";

export default function SignupManager({ onSignup, onNavigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!name || !email || !password) return alert("Please fill name, email and password.");
    onSignup({ name, email, phone, password, role: "manager" }, "manager");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Manager Signup</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="p-2 border rounded w-full mb-2" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-2 border rounded w-full mb-2" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="p-2 border rounded w-full mb-2" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 border rounded w-full mb-4" />
        <div className="flex gap-2">
          <button onClick={handleSubmit} className="bg-purple-600 text-white px-4 py-2 rounded">Create Manager</button>
          <button onClick={() => onNavigate("login")} className="bg-gray-200 px-4 py-2 rounded">Back to Login</button>
        </div>
      </div>
    </div>
  );
}