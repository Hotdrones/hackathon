const db = {
  student: [
    { index: "17-8380", password: "4835", name: "Inan le goat",    grade: "Grade 10", subject: "Science" },
    { index: "17-8419", password: "3743",  name: "Yoosuf naisam shafeeq", grade: "Grade 10", subject: "Science" },
    { index: "17-8347", password: "3547",  name: "Ahmed Nauf Mohammed Nihad", grade: "Grade 10", subject: "Science" },
    { index: "17-8388", password: "6253",  name: "Mohammed Aik Adam", grade: "Grade 10", subject: "Science" },
    { index: "17-8349", password: "5144",  name: "Ahmed Shamaail Shaheen", grade: "Grade 10", subject: "Science" },
    { index: "25-10983", password: "3026",  name: "Ahlam ALi", grade: "Grade 10", subject: "Science" },
  ],
  teacher: [
    { index: "T01", password: "teacher01", name: "Mr. Ibrahim", subject: "Maths",   room: "Room 1" },
    { index: "T02", password: "teacher02", name: "Ms. Aminath", subject: "English", room: "Room 2" },
  ]
};

function login() {
  const index    = document.getElementById("index").value.trim();
  const password = document.getElementById("pass").value.trim();
  const role     = document.getElementById("role").value;
  const status   = document.getElementById("status");

  if (!index || !password) {
    status.style.color = "red";
    status.textContent = "Please fill in all fields.";
    return;
  }

  if (!role) {
    status.style.color = "white";
    status.textContent = "Please select a role.";
    return;
  }

  const match = db[role].find(u => u.index === index && u.password === password);

  if (!match) {
    status.style.color = "white";
    status.textContent = "Incorrect index or password.";
    return;
  }

  // Login success
  if (role === "student") {
    document.location.href = "homepage.html";
    status.style.color = "white";
    status.textContent = "Welcome, " + match.name + "! (" + match.grade + " — " + match.subject + ")";
    // document.location.href = "homepage.html";
  } else {
    document.location.href = "homepage.html";
    status.style.color = "white";
    status.textContent = "Welcome, " + match.name + "! (" + match.subject + " — " + match.room + ")";
  }
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter") login();
});