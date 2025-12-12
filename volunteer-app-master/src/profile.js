import React, { useState, useEffect, useMemo } from "react";

// --- Configuration for Tags/Interests ---
const ALL_TAGS = [
  "Teaching", "Distributing", "Arrangement", "Manual Labor", 
  "Mentoring", "Administration", "Fundraising", "Transportation", 
  "Skill Sharing", "Logistics", "Cleanup", "Public Outreach"
];


// Helper function to safely split a full name
const splitName = (fullName) => {
  if (!fullName) return { first: "", last: "" };
  const parts = fullName.split(' ').filter(p => p.trim() !== '');
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(' ') || "";
  return { first: firstName, last: lastName };
};


// Profile now accepts 'applications' data
export default function Profile({ currentUser, onNavigate, onUpdateUser, applications }) {
  const { first: initialFirst, last: initialLast } = splitName(currentUser.name);

  // Initialize state
  const [firstName, setFirstName] = useState(currentUser.firstName || initialFirst);
  const [lastName, setLastName] = useState(currentUser.lastName || initialLast);
  const [email] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [address, setAddress] = useState(currentUser.address || "");
  const [type, setType] = useState(currentUser.type || "normal");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [viewHistoryDetail, setViewHistoryDetail] = useState(false); // State for history view

  // Tags state: stored as a comma-separated string in the user object, but managed as an array here.
  const initialTagsArray = (currentUser.tags || "").split(',').map(tag => tag.trim()).filter(tag => tag);
  const [selectedTags, setSelectedTags] = useState(initialTagsArray);


  // --- Logic to calculate Volunteer History ---
  const volunteerHistory = useMemo(() => {
    if (currentUser.role !== 'volunteer' || !applications) return [];

    return applications.filter(
        a => a.applicant === currentUser.email && a.status === 'approved'
    ).map(a => ({
      title: a.title,
      status: a.status,
      date: new Date(a.dateApplied || Date.now()).toLocaleDateString(),
      // Add more history details if available (e.g., event dates, hours)
    }));
  }, [applications, currentUser.email, currentUser.role]);
  // ---------------------------------------------


  useEffect(() => {
    // Load description ("About Me") and profile picture from localStorage
    const storedDesc = JSON.parse(localStorage.getItem("profile_desc")) || {};
    const storedPics = JSON.parse(localStorage.getItem("profile_pics")) || {};

    if (storedDesc[currentUser.email]) setDescription(storedDesc[currentUser.email]);
    if (storedPics[currentUser.email]) setImage(storedPics[currentUser.email]);
  }, [currentUser.email]);

  const uploadPicture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);

      let storedPics = JSON.parse(localStorage.getItem("profile_pics")) || {};
      storedPics[currentUser.email] = reader.result;
      localStorage.setItem("profile_pics", JSON.stringify(storedPics));
    };
    reader.readAsDataURL(file);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
        prev.includes(tag)
            ? prev.filter(t => t !== tag) // Remove tag
            : [...prev, tag]               // Add tag
    );
  };

  const saveProfile = () => {
    const key = currentUser.role === "manager" ? "managers" : "volunteers";
    const users = JSON.parse(localStorage.getItem(key)) || [];
    const fullName = `${firstName} ${lastName}`.trim();

    // Convert selected tags array back to comma-separated string for storage
    const tagsString = selectedTags.join(', ');

    const updatedUser = {
      ...currentUser,
      name: fullName,
      firstName,
      lastName,
      phone,
      type,
      address,
      tags: tagsString, // Saved as string
    };

    const updatedUsers = users.map((u) =>
        u.email === currentUser.email ? updatedUser : u
    );

    localStorage.setItem(key, JSON.stringify(updatedUsers));

    // Save description ("About Me")
    const desc = JSON.parse(localStorage.getItem("profile_desc")) || {};
    desc[email] = description;
    localStorage.setItem("profile_desc", JSON.stringify(desc));

    onUpdateUser(updatedUser);

    alert("Profile updated!");
    onNavigate(currentUser.role === "manager" ? "manager" : "volunteer");
  };

  const resetForm = () => {
    onNavigate(currentUser.role === "manager" ? "manager" : "volunteer");
  };

  return (
      <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
        <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 border">

          <h2 className="text-2xl font-bold mb-6 text-center">User Profile</h2>

          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-6">
            {/* ... image upload code remains the same ... */}
            <div className="w-28 h-28 rounded-full overflow-hidden border shadow">
              {image ? (
                  <img src={image} alt="profile" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white text-4xl">
                    {firstName.charAt(0) || email.charAt(0)}
                  </div>
              )}
            </div>
            <label className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition">
              Upload Picture
              <input type="file" accept="image/*" className="hidden" onChange={uploadPicture} />
            </label>
          </div>

          {/* Profile Details Inputs */}
          {/* First Name, Last Name, Address, Phone, Email fields remain here... */}
          <div className="mb-4"><label className="font-semibold">First Name</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-3 border rounded-xl mt-1 bg-gray-50" placeholder="First Name"/></div>
          <div className="mb-4"><label className="font-semibold">Last Name</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-3 border rounded-xl mt-1 bg-gray-50" placeholder="Last Name"/></div>
          <div className="mb-4"><label className="font-semibold">Address</label><input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 border rounded-xl mt-1 bg-gray-50" placeholder="Your residential address"/></div>
          <div className="mb-4"><label className="font-semibold">Phone Number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded-xl mt-1 bg-gray-50" placeholder="Contact phone number"/></div>
          <div className="mb-4"><label className="font-semibold">Email</label><input value={email} disabled className="w-full p-3 border rounded-xl mt-1 bg-gray-200"/></div>

          {/* Student Volunteer Badge/Type */}
          {currentUser.role === "volunteer" && (
              <div className="flex items-center gap-2 mb-5 p-3 border rounded-xl bg-yellow-50">
                <input type="checkbox" checked={type === "student"} onChange={(e) => setType(e.target.checked ? "student" : "normal")} />
                <label className="font-semibold">Student Volunteer (Badge)</label>
              </div>
          )}

          {/* Interests/Tags (Dropdown/Multi-select) */}
          <div className="mb-5">
            <label className="font-semibold block mb-2">Interests/Tags</label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-gray-50">
              {ALL_TAGS.map(tag => (
                  <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition ${
                          selectedTags.includes(tag)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {tag}
                  </button>
              ))}
            </div>
          </div>

          {/* Profile Description (About Me) */}
          <div className="mb-5">
            <label className="font-semibold">About Me</label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 p-3 border rounded-xl mt-2 bg-gray-50"
                placeholder="Write something about yourself..."
            />
          </div>

          {/* Volunteer History (Functional) */}
          {currentUser.role === "volunteer" && (
              <div className="mb-5 p-4 border rounded-xl bg-blue-50">
                <label className="font-bold block mb-2 text-lg">Volunteer History</label>
                <p className="text-xl font-mono text-purple-700 mb-3">{volunteerHistory.length}</p>
                <p className="text-gray-600 mb-3">Completed Events</p>

                <div className="flex gap-4">
                  <button
                      type="button"
                      onClick={() => setViewHistoryDetail(false)}
                      className={`flex-1 py-2 rounded-xl font-semibold transition ${viewHistoryDetail ? 'bg-blue-200 text-blue-800' : 'bg-blue-600 text-white'}`}
                  >
                    Summary
                  </button>
                  <button
                      type="button"
                      onClick={() => setViewHistoryDetail(true)}
                      className={`flex-1 py-2 rounded-xl font-semibold transition ${!viewHistoryDetail ? 'bg-blue-200 text-blue-800' : 'bg-blue-600 text-white'}`}
                  >
                    Detail
                  </button>
                </div>

                {/* History Details View */}
                {viewHistoryDetail && (
                    <div className="mt-4 border-t pt-4">
                      {volunteerHistory.length > 0 ? (
                          <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {volunteerHistory.map((history, index) => (
                                <li key={index} className="p-2 border-b bg-white rounded-lg shadow-sm">
                                  <p className="font-semibold text-gray-800">{history.title}</p>
                                  <p className="text-sm text-green-600">Status: Approved</p>
                                  <p className="text-xs text-gray-500">Applied on: {history.date}</p>
                                </li>
                            ))}
                          </ul>
                      ) : (
                          <p className="text-gray-500 italic">No completed volunteer history found.</p>
                      )}
                    </div>
                )}
              </div>
          )}

          {/* Action Buttons */}
          <button
              onClick={saveProfile}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            Submit
          </button>

          <button
              onClick={resetForm}
              className="w-full py-3 mt-3 bg-gray-300 rounded-xl font-semibold hover:bg-gray-400 transition"
          >
            Reset
          </button>
        </div>
      </div>
  );
}