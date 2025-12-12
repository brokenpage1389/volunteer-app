import React, { useState, useEffect } from "react";

export default function Profile({ currentUser, onNavigate, onUpdateUser }) {
  const [name, setName] = useState(currentUser.name);
  const [email] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [type, setType] = useState(currentUser.type || "normal");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState(null);

  useEffect(() => {
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

  const saveProfile = () => {
    const key = currentUser.role === "manager" ? "managers" : "volunteers";
    const users = JSON.parse(localStorage.getItem(key)) || [];

    const updatedUsers = users.map((u) =>
      u.email === currentUser.email ? { ...u, name, phone, type } : u
    );

    localStorage.setItem(key, JSON.stringify(updatedUsers));

    const desc = JSON.parse(localStorage.getItem("profile_desc")) || {};
    desc[email] = description;
    localStorage.setItem("profile_desc", JSON.stringify(desc));

    onUpdateUser({ ...currentUser, name, phone, type });

    alert("Profile updated!");
    onNavigate(currentUser.role === "manager" ? "manager" : "volunteer");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-6 border">

        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border shadow">
            {image ? (
              <img src={image} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white text-4xl">
                {name.charAt(0)}
              </div>
            )}
          </div>

          <label className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer">
            Upload Picture
            <input type="file" accept="image/*" className="hidden" onChange={uploadPicture} />
          </label>
        </div>

        <div className="mb-4">
          <label className="font-semibold">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-xl mt-1 bg-gray-50"
          />
        </div>

        <div className="mb-4">
          <label className="font-semibold">Email</label>
          <input
            value={email}
            disabled
            className="w-full p-3 border rounded-xl mt-1 bg-gray-200"
          />
        </div>

        <div className="mb-4">
          <label className="font-semibold">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded-xl mt-1 bg-gray-50"
          />
        </div>

        {currentUser.role === "volunteer" && (
          <div className="flex items-center gap-2 mb-5">
            <input
              type="checkbox"
              checked={type === "student"}
              onChange={(e) => setType(e.target.checked ? "student" : "normal")}
            />
            <label className="font-semibold">Student Volunteer</label>
          </div>
        )}

        <div className="mb-5">
          <label className="font-semibold">Profile Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-32 p-3 border rounded-xl mt-2 bg-gray-50"
            placeholder="Write something about yourself..."
          />
        </div>

        <button
          onClick={saveProfile}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold"
        >
          Save Changes
        </button>

        <button
          onClick={() => onNavigate(currentUser.role === "manager" ? "manager" : "volunteer")}
          className="w-full py-2 mt-3 bg-gray-200 rounded-xl"
        >
          Back
        </button>
      </div>
    </div>
  );
}
