// import React, { useState } from "react";

// export default function Login({ onLogin, onNavigate }) {
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
//       <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
//         <h2 className="text-2xl font-bold mb-4">Login</h2>
//         <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Email / Phone / Username" className="p-2 border rounded w-full mb-2" />
//         <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="p-2 border rounded w-full mb-4" />
//         <div className="flex gap-2">
//           <button onClick={() => onLogin(identifier.trim(), password.trim())} className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
//           <button onClick={() => onNavigate("signup_volunteer")} className="bg-green-600 text-white px-4 py-2 rounded">Sign up (Volunteer)</button>
//           <button onClick={() => onNavigate("signup_manager")} className="bg-purple-600 text-white px-4 py-2 rounded">Sign up (Manager)</button>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState } from "react";

export default function Login({ onLogin, onNavigate }) {
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState(""); 

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#f8f6f0' }}>
      
      <div className="w-full max-w-xs bg-white rounded-lg shadow-2xl p-8">
        
        <h2 className="text-3xl text-center text-gray-700 font-light mb-8">Login</h2>
        
        <div className="mb-4">
          <label htmlFor="username" className="text-sm font-normal text-gray-500 block mb-1">
            Username 
          </label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email / Phone / Username"
            className="w-full px-3 py-2 text-lg border-none rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            style={{ 
              backgroundColor: '#ffffff', 
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' 
            }}
            type="text"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="text-sm font-normal text-gray-500 block mb-1">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 text-lg border-none rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            style={{ 
              backgroundColor: '#ffffff', 
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' 
            }}
          />
        </div>

        <button 
          onClick={() => onLogin(identifier.trim(), password.trim())}
          type="button" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-150 shadow-md transform hover:scale-[1.01] active:shadow-inner"
          style={{ 
              backgroundImage: 'linear-gradient(to bottom, #60a5fa, #3b82f6)', // Blue gradient
              border: '1px solid #3b82f6'
          }}
        >
          Login
        </button>

      </div>

      <div className="mt-8 text-center space-y-3">
          <p className="text-gray-600 text-sm">Need an account?</p>
          <div className="flex justify-center">
              <button onClick={() => onNavigate("signup")} className="text-sm text-green-700 hover:text-green-900 transition">Sign up</button>
          </div>
      </div>
    </div>
  );
}