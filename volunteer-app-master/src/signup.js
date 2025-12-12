import React, { useState } from "react";

export default function SignupPage({ onSignup, onNavigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [volunteerType, setVolunteerType] = useState("student"); 
  const [activeRole, setActiveRole] = useState("volunteer"); 

  const handleSubmitVolunteer = () => {
    if (!name || !email || !password) return alert("Please fill name, email and password.");
    onSignup({ name, email, phone, password, type:volunteerType}, "volunteer");
  };

  const handleSubmitManager = () => {
    if (!name || !email || !password) return alert("Please fill name, email and password.");
    onSignup({ name, email, phone, password, role: "manager"}, "manager");
  };
  
  const handleSubmit = activeRole === 'volunteer' ? handleSubmitVolunteer : handleSubmitManager;

  const roleButtonClass = (role) => `
    flex-1 text-center py-2 text-sm font-semibold transition-colors duration-200 border-b-2
    ${activeRole === role 
      ? 'text-gray-800 border-blue-500'
      : 'text-gray-500 border-transparent hover:text-gray-700' 
    }
  `;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f8f6f0' }}>
      <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="flex bg-gray-50 border-b border-gray-200">
          <button 
            onClick={() => { setActiveRole("volunteer"); }} 
            className={roleButtonClass("volunteer")}
          >
            Volunteer
          </button>
          <button 
            onClick={() => { setActiveRole("manager"); }} 
            className={roleButtonClass("manager")}
          >
            Manager
          </button>
        </div>

        <div 
          key={activeRole} 
          className="p-8 transition-opacity duration-1000 ease-in-out opacity-100" 
        >
          
          <h2 className="text-3xl text-center text-gray-700 font-light mb-8">
            {activeRole === 'volunteer' ? 'Volunteer' : 'Manager'} Signup
          </h2>
          
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>       
            <div className="mb-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" 
                className="w-full px-3 py-2 text-lg border-none rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                style={{ backgroundColor: '#ffffff', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}
              />
            </div>

            <div className="mb-4">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" 
                className="w-full px-3 py-2 text-lg border-none rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                style={{ backgroundColor: '#ffffff', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}
              />
            </div>

            <div className="mb-4">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" 
                className="w-full px-3 py-2 text-lg border-none rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                style={{ backgroundColor: '#ffffff', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}
              />
            </div>

            <div className="mb-6">
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" 
                className="w-full px-3 py-2 text-lg border-none rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                style={{ backgroundColor: '#ffffff', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}
              />
            </div>
            
            {activeRole === 'volunteer' && (
              <div className="flex items-center gap-2 mb-6">
                <input 
                  type="checkbox" 
                  checked={volunteerType === "student"} 
                  onChange={(e) => setVolunteerType(e.target.checked ? "student" : "normal")}
                  className="form-checkbox h-4 w-4 text-blue-500 rounded"
                />
                <label className="text-gray-600">Student Volunteer</label>
              </div>
            )}

            {/* Action Buttons (Conditional Styling/Text) */}
            <div className="flex gap-4">
              {/* Primary Submit Button */}
              <button 
                type="submit"
                className={`flex-1 text-white font-semibold py-3 rounded-md transition duration-150 shadow-md transform hover:scale-[1.01] active:shadow-inner ${
                  activeRole === 'volunteer' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {activeRole === 'volunteer' ? 'Create Volunteer' : 'Create Manager'}
              </button>
              
              <button 
                onClick={() => onNavigate("login")} 
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-md transition duration-150"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}