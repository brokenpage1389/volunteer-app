import React, { useState, useEffect } from "react";



export default function VolunteerApp() {
  const [screen, setScreen] = useState("login"); // "login" | "volunteer" | "manager"
  const [role, setRole] = useState(null);
  const [volunteerType, setVolunteerType] = useState("student");

  //  default manager checker
  useEffect(() => {
    try {
      const managers = JSON.parse(localStorage.getItem("managers")) || [];
      const hasDefault = managers.some(m => m.email === "manager@example.com");
      if (!hasDefault) {
        localStorage.setItem("managers", JSON.stringify(managers));
      }
    } catch (e) {
      localStorage.setItem("managers", JSON.stringify([{ email: "manager@example.com", password: "123456" , full_name: "manager"}]));
    }
  }, []);

  // Load events & applications from localStorage
  const [events, setEvents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("events")) || [];
    } catch (e) {
      return [];
    }
  });

  const [applications, setApplications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("applications")) || [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("applications", JSON.stringify(applications));
  }, [applications]);

  // Authentication helpers (using DOM inputs for simplicity)
  const doLogin = () => {
    const email_or_username = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const type = document.getElementById("loginType").value;

    if (type === "volunteer") {
      const volunteers = JSON.parse(localStorage.getItem("volunteers")) || [];
      const found_email = volunteers.find(v => v.email === email_or_username && v.password === password);
      const found_username = volunteers.find(v => v.name === email_or_username && v.password === password);
      if (found_email){
        setVolunteerType(found_email.type || "student");
        setRole("volunteer");
        setScreen("volunteer");
        return;
      }
      else if (found_username){
        setVolunteerType(found_username.type || "student");
        setRole("volunteer");
        setScreen("volunteer");
        return;
      }
    
      alert("Invalid volunteer credentials");
    }

    if (type === "manager") {
      const managers = JSON.parse(localStorage.getItem("managers")) || [];
      const found_email = managers.find(m => m.email === email_or_username && m.password === password);
      const found_username = managers.find(m => m.name === email_or_username && m.password === password);
      if (found_email){
        setVolunteerType(found_email.type || "manager");
        setRole("manager");
        setScreen("manager");
        return;
      }
      else if (found_username){
        setVolunteerType(found_username.type || "manager");
        setRole("manager");
        setScreen("manager");
        return;
      }
      alert("Invalid manager credentials");
    }
  };

  const signupVolunteer = () => {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const type = document.getElementById("signupType").value;

    if (!name || !email || !password) return alert("Please fill all volunteer fields");

    const volunteers = JSON.parse(localStorage.getItem("volunteers")) || [];
    if (volunteers.some(v => (v.email === email))) return alert("Volunteer with that email already exists");
    if (volunteers.some(v => (v.name === name))) return alert("Volunteer with that name already exists");

    volunteers.push({ name, email, password, type });
    localStorage.setItem("volunteers", JSON.stringify(volunteers));

    alert("Volunteer signup successful. You can now log in.");
    // Clear form
    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("signupType").value = "student";
  };

  const signupManager = () => {
    const email = document.getElementById("msEmail").value.trim();
    const password = document.getElementById("msPassword").value.trim();
    const name = document.getElementById("msFullName").value.trim();
    if (!email || !password || !name) return alert("Please fill all manager fields");

    const managers = JSON.parse(localStorage.getItem("managers")) || [];
    if (managers.some(m => m.email === email)) return alert("Manager with that email already exists");
    if (managers.some(m => m.name === name)) return alert("Manager with that full name already exists");

    managers.push({ email, password, name});
    localStorage.setItem("managers", JSON.stringify(managers));
    alert("Manager account created. You can now log in.");
    document.getElementById("msEmail").value = "";
    document.getElementById("msPassword").value = "";
    document.getElementById("msFullName").value = "";
  };

  const logout = () => {
    setRole(null);
    setScreen("login");
  };

  // Event & Application actions
  const createEvent = () => {
    const title = document.getElementById("evTitle").value.trim();
    const date = document.getElementById("evDate").value;
    const volunteersNeeded = document.getElementById("evVolunteers").value;
    const description = document.getElementById("evDescription").value.trim();

    if (!title || !date || !volunteersNeeded || !description) return alert("Please fill all event fields");

    const newEvent = { id: Date.now(), title, date, volunteers: Number(volunteersNeeded), description };
    setEvents(prev => [...prev, newEvent]);

    // clear
    document.getElementById("evTitle").value = "";
    document.getElementById("evDate").value = "";
    document.getElementById("evVolunteers").value = "";
    document.getElementById("evDescription").value = "";
  };

  const applyForEvent = (event) => {
    // find existing application by eventId and volunteerType; for simplicity this app treats volunteer as single user
    const exists = applications.find(a => a.eventId === event.id);
    if (exists && exists.status === "pending") return alert("You already have a pending application for this event");

    // If rejected previously – allow reapply (we filter out existing application for same event)
    const filtered = applications.filter(a => a.eventId !== event.id);
    const newApp = { eventId: event.id, title: event.title, status: "pending", volunteerType };
    const updated = [...filtered, newApp];
    setApplications(updated);
    alert("Applied — waiting for manager approval");
  };

  const updateStatus = (eventId, status) => {
    const updated = applications.map(a => (a.eventId === eventId ? { ...a, status } : a));
    setApplications(updated);
  };

  // ---------------------------
  // Renders
  // ---------------------------
  if (screen === "login") {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center gap-6">
        <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

          <select id="loginType" className="p-2 border rounded w-full mb-2">
            <option value="volunteer">Volunteer</option>
            <option value="manager">Event Manager</option>
          </select>

          <input id="loginEmail" className="p-2 border rounded w-full mb-2" placeholder="Email/Username" />
          <input id="loginPassword" type="password" className="p-2 border rounded w-full mb-4" placeholder="Password" />

          <button onClick={doLogin} className="bg-blue-600 text-white w-full py-2 rounded-xl">Login</button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">Volunteer Signup</h2>

          <input id="signupName" className="p-2 border rounded w-full mb-2" placeholder="Full Name" />
          <input id="signupEmail" className="p-2 border rounded w-full mb-2" placeholder="Email" />
          <input id="signupPassword" type="password" className="p-2 border rounded w-full mb-2" placeholder="Password" />

          <select id="signupType" className="p-2 border rounded w-full mb-4">
            <option value="student">Student</option>
            <option value="normal">Normal Person</option>
          </select>

          <button onClick={signupVolunteer} className="bg-green-600 text-white w-full py-2 rounded-xl">Sign Up</button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-center">Manager Signup</h2>
           <input id="msFullName" className="p-2 border rounded w-full mb-2" placeholder="Full name" />
          <input id="msEmail" className="p-2 border rounded w-full mb-2" placeholder="Email" />
          <input id="msPassword" type="password" className="p-2 border rounded w-full mb-4" placeholder="Password" />
          <button onClick={signupManager} className="bg-purple-600 text-white w-full py-2 rounded-xl">Create Manager</button>
        </div>
      </div>
    );
  }

  if (screen === "volunteer") {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Volunteer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-yellow-300 rounded-xl">{volunteerType === "student" ? "🎓 Student Volunteer" : "Volunteer"}</span>
            <button onClick={logout} className="text-sm text-red-500">Logout</button>
          </div>
        </div>

        <h2 className="font-semibold mt-4">Available Events</h2>
        {events.length === 0 && <p>No events available yet.</p>}
        <div className="flex flex-col gap-4">
          {events.map(e => (
            <div key={e.id} className="border p-4 rounded-xl bg-gray-50">
              <p className="font-bold text-lg">{e.title}</p>
              <p>Date: {e.date}</p>
              <p>Volunteers Needed: {e.volunteers}</p>
              <p className="mt-1 text-gray-600">{e.description}</p>

              {applications.some(a => a.eventId === e.id) ? (
                <p className="mt-2 text-gray-600">Already Applied</p>
              ) : (
                <button onClick={() => applyForEvent(e)} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Apply</button>
              )}
            </div>
          ))}
        </div>

        <h2 className="font-semibold mt-6">My Applications</h2>
        {applications.length === 0 && <p>No applications yet.</p>}
        <div className="flex flex-col gap-3">
          {applications.map((a, idx) => (
            <div key={`${a.eventId}-${idx}`} className="border p-3 rounded-xl bg-white">
              <p className="font-bold">{a.title}</p>
              <p>Status: {a.status === "accepted" ? "🟢 Accepted" : a.status === "rejected" ? "🔴 Rejected" : "🟡 Pending"}</p>

              {a.status === "rejected" && (
                <button onClick={() => applyForEvent({ id: a.eventId, title: a.title })} className="mt-2 bg-orange-600 text-white px-3 py-1 rounded">Reapply</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === "manager") {
    return (
      <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Event Manager Dashboard</h1>
          <div className="flex items-center gap-4">
            <button onClick={logout} className="text-sm text-red-500">Logout</button>
          </div>
        </div>

        <h2 className="font-semibold text-lg">Create Event</h2>
        <div className="flex flex-col gap-2 mb-6">
          <input id="evTitle" className="p-2 border rounded w-full mb-2" placeholder="Event Title" />
          <input id="evDate" type="date" className="p-2 border rounded w-full mb-2" />
          <input id="evVolunteers" type="number" className="p-2 border rounded w-full mb-2" placeholder="Volunteers Required" />
          <textarea id="evDescription" className="p-2 border rounded w-full mb-2" placeholder="Event Description" />

          <div className="flex gap-2 mt-2">
            <button onClick={createEvent} className="bg-blue-600 text-white px-4 py-2 rounded-xl">Add Event</button>
            <button onClick={() => {document.getElementById("evTitle").value = ""; document.getElementById("evDate").value = ""; document.getElementById("evVolunteers").value = ""; document.getElementById("evDescription").value = "";}} className="bg-gray-200 px-4 py-2 rounded-xl">Clear</button>
          </div>
        </div>

        <h2 className="font-semibold mb-3 text-lg">Created Events</h2>
        {events.length === 0 && <p>No events created yet.</p>}
        <div className="flex flex-col gap-4 mb-6">
          {events.map(e => (
            <div key={e.id} className="border p-4 rounded-xl bg-gray-50">
              <p className="font-bold text-lg">{e.title}</p>
              <p>Date: {e.date}</p>
              <p>Volunteers Needed: {e.volunteers}</p>
              <p className="mt-2 text-gray-700">{e.description}</p>
            </div>
          ))}
        </div>

        <h2 className="font-semibold mb-3 text-lg">Volunteer Applications</h2>
        {applications.length === 0 && <p>No applications submitted yet.</p>}
        <div className="flex flex-col gap-4">
          {applications.map((a, idx) => (
            <div key={`${a.eventId}-${idx}`} className="border p-4 rounded-xl bg-gray-50">
              <p className="font-bold">{a.title}</p>
              <p>Status: {a.status}</p>
              <p>Badge: {a.volunteerType === "student" ? "🎓 Student" : "Volunteer"}</p>

              <div className="flex gap-2 mt-2">
                <button onClick={() => updateStatus(a.eventId, "accepted")} className="bg-green-600 text-white px-3 py-1 rounded">Accept</button>
                <button onClick={() => updateStatus(a.eventId, "rejected")} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

