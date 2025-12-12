import React from "react";

export default function ProfilePage({ currentUser, description, setDescription, onNavigate }) {
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 relative">
        <h1 className="text-3xl font-bold mb-4 text-center">Profile</h1>

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm">
            <span className="font-semibold">Role:</span>
            <span className="capitalize">{currentUser.role}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm">
            <span className="font-semibold">Name:</span>
            <span>{currentUser.name}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm">
            <span className="font-semibold">Email:</span>
            <span>{currentUser.email}</span>
          </div>
          {currentUser.phone && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm">
              <span className="font-semibold">Phone:</span>
              <span>{currentUser.phone}</span>
            </div>
          )}
          {currentUser.role === "volunteer" && (
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm">
              <span className="font-semibold">Type:</span>
              <span>{currentUser.type === "student" ? "🎓 Student Volunteer" : "Volunteer"}</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">About Me</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write something about yourself..."
            className="w-full p-3 border rounded-lg shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
            rows={5}
          />
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate(currentUser.role)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}