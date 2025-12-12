import React, { useState } from "react";

export default function SignupVolunteer({ onSignup, onNavigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("student");

  const handleSubmit = () => {
    if (!name || !email || !password) return alert("Please fill name, email and password.");
    onSignup({ name, email, phone, password, type }, "volunteer");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-4">Volunteer Signup</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="p-2 border rounded w-full mb-2" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-2 border rounded w-full mb-2" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="p-2 border rounded w-full mb-2" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 border rounded w-full mb-2" />
        
        <div className="flex items-center gap-2 mb-4">
          <input type="checkbox" checked={type === "student"} onChange={(e) => setType(e.target.checked ? "student" : "normal")} />
          <label>Student Volunteer</label>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">Create Volunteer</button>
          <button onClick={() => onNavigate("login")} className="bg-gray-200 px-4 py-2 rounded">Back to Login</button>
        </div>
      </div>
    </div>
  );
}