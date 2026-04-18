const API_KEY = "9dhj5mda2vyn";

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

const allUsers = [
  ...db.student.map(u => ({ ...u, role: "student" })),
  ...db.teacher.map(u => ({ ...u, role: "teacher" })),
];
  
 const allUsers = [
  ...db.student.map(u => ({ ...u, role: "student" })),
  ...db.teacher.map(u => ({ ...u, role: "teacher" })),
];
 
let client, currentUser, activeChannel, currentTab = "dm";
 
// ── STARTUP ──
window.addEventListener("DOMContentLoaded", async () => {
  const saved = sessionStorage.getItem("portal_user");
  if (!saved) { window.location.href = "index.html"; return; }
  currentUser = JSON.parse(saved);
  document.getElementById("topbar-user").textContent = currentUser.name + " (" + currentUser.role + ")";
  await connectStream();
  switchTab("dm");
});
 
// ── STREAM CONNECTION ──
async function connectStream() {
  client = StreamChat.getInstance(API_KEY);
  const userId = currentUser.index.replace(/[^a-zA-Z0-9_-]/g, "_");
  await client.connectUser(
    { id: userId, name: currentUser.name, role: currentUser.role },
    client.devToken(userId)
  );
}
 
// ── TABS ──
function switchTab(tab) {
  currentTab = tab;
  document.getElementById("tab-dm").className    = tab === "dm"    ? "active" : "";
  document.getElementById("tab-group").className = tab === "group" ? "active" : "";
  document.getElementById("dm-search").style.display     = tab === "dm"    ? "block" : "none";
  document.getElementById("new-group-btn").style.display = tab === "group" ? "block" : "none";
  document.getElementById("user-list").style.display     = "none";
  loadChannels();
}
 
// ── LOAD CHANNELS ──
async function loadChannels() {
  const list = document.getElementById("channel-list");
  list.innerHTML = '<div style="padding:16px;color:#555;font-size:13px;">Loading...</div>';
  const userId = currentUser.index.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filter = currentTab === "dm"
    ? { type: "messaging", members: { $in: [userId] } }
    : { type: "team",      members: { $in: [userId] } };
  const channels = await client.queryChannels(filter, { last_message_at: -1 }, { limit: 30 });
  list.innerHTML = "";
  if (channels.length === 0) {
    list.innerHTML = '<div style="padding:16px;color:#555;font-size:13px;">' +
      (currentTab === "dm" ? "Search for a user above to start a DM" : "No groups yet. Create one!") + '</div>';
    return;
  }
  channels.forEach(ch => renderChannelItem(ch, list));
}
 
// ── RENDER CHANNEL ITEM ──
function renderChannelItem(ch, container) {
  const userId = currentUser.index.replace(/[^a-zA-Z0-9_-]/g, "_");
  let name, initials;
  if (ch.type === "messaging") {
    const other = Object.values(ch.state.members).find(m => m.user.id !== userId);
    name = other ? other.user.name : "Unknown";
    initials = name.split(" ").map(w => w[0]).join("").slice(0, 2);
  } else {
    name = ch.data.name || "Group";
    initials = "G";
  }
  const lastMsg = ch.state.messages.slice(-1)[0];
  const preview = lastMsg ? lastMsg.text : "No messages yet";
  const unread  = ch.countUnread();
  const item = document.createElement("div");
  item.className = "channel-item";
  item.innerHTML = `
    <div class="channel-avatar ${ch.type === "team" ? "group" : ""}">${initials}</div>
    <div class="channel-info">
      <div class="channel-name">${name}</div>
      <div class="channel-preview">${preview.slice(0, 40)}</div>
    </div>
    ${unread > 0 ? '<span class="unread-badge">' + unread + '</span>' : ""}
  `;
  item.onclick = () => openChannel(ch, name);
  container.appendChild(item);
}
 
// ── OPEN CHANNEL ──
async function openChannel(ch, name) {
  activeChannel = ch;
  document.getElementById("empty-state").style.display  = "none";
  document.getElementById("active-chat").style.display  = "flex";
  document.getElementById("input-area").style.display   = "flex";
  document.getElementById("chat-header-name").textContent = name;
  document.getElementById("chat-header-sub").textContent  = ch.type === "team" ? "Group chat" : "Direct message";
  document.getElementById("chat-area").classList.add("mobile-open");
  await ch.watch();
  renderMessages(ch.state.messages);
  await ch.markRead();
  ch.on("message.new", e => { appendMessage(e.message); ch.markRead(); });
}
 
// ── RENDER ALL MESSAGES ──
function renderMessages(messages) {
  const el = document.getElementById("messages");
  el.innerHTML = "";
  messages.forEach(m => appendMessage(m));
  el.scrollTop = el.scrollHeight;
}
 
// ── APPEND ONE MESSAGE ──
function appendMessage(msg) {
  const el = document.getElementById("messages");
  const userId = currentUser.index.replace(/[^a-zA-Z0-9_-]/g, "_");
  const mine = msg.user.id === userId;
  const initials = msg.user.name.split(" ").map(w => w[0]).join("").slice(0, 2);
  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const div = document.createElement("div");
  div.className = "msg" + (mine ? " mine" : "");
  div.innerHTML = `
    <div class="msg-avatar">${initials}</div>
    <div class="msg-bubble">
      <div class="msg-sender">${msg.user.name}</div>
      <div class="msg-text">${msg.text}</div>
      <div class="msg-time">${time}</div>
    </div>
  `;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}
 
// ── SEND MESSAGE ──
async function sendMessage() {
  const input = document.getElementById("msg-input");
  const text = input.value.trim();
  if (!text || !activeChannel) return;
  input.value = "";
  input.style.height = "auto";
  await activeChannel.sendMessage({ text });
}
 
// ── ENTER KEY ──
function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}
 
// ── AUTO RESIZE TEXTAREA ──
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 100) + "px";
}
 
// ── DM SEARCH ──
function searchUsers(query) {
  const userList = document.getElementById("user-list");
  const userId = currentUser.index.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (!query.trim()) { userList.style.display = "none"; return; }
  const results = allUsers.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) &&
    u.index.replace(/[^a-zA-Z0-9_-]/g, "_") !== userId
  );
  userList.style.display = results.length ? "block" : "none";
  userList.innerHTML = results.map(u => `
    <div class="user-item" onclick="startDM('${u.index}', '${u.name}')">
      <div class="channel-avatar" style="width:32px;height:32px;font-size:12px;">
        ${u.name.split(" ").map(w => w[0]).join("").slice(0,2)}
      </div>
      <div>
        <div style="font-size:14px;">${u.name}</div>
        <div style="font-size:12px;color:#888;">${u.role}</div>
      </div>
    </div>
  `).join("");
}
 
// ── START DM ──
async function startDM(targetIndex, targetName) {
  document.getElementById("user-list").style.display = "none";
  const myId     = currentUser.index.replace(/[^a-zA-Z0-9_-]/g, "_");
  const targetId = targetIndex.replace(/[^a-zA-Z0-9_-]/g, "_");
  await client.upsertUser({ id: targetId, name: targetName });
  const ch = client.channel("messaging", { members: [myId, targetId] });
  await ch.create();
  openChannel(ch, targetName);
  loadChannels();
}
 
// ── GROUP MODAL ──
function showGroupModal() { document.getElementById("modal-overlay").style.display = "flex"; }
function hideGroupModal()  { document.getElementById("modal-overlay").style.display = "none"; }
 
// ── CREATE GROUP ──
async function createGroup() {
  const name = document.getElementById("group-name-input").value.trim();
  if (!name) return;
  const myId   = currentUser.index.replace(/[^a-zA-Z0-9_-]/g, "_");
  const chanId = "group_" + Date.now();
  const ch = client.channel("team", chanId, { name, created_by_id: myId, members: [myId] });
  await ch.create();
  hideGroupModal();
  document.getElementById("group-name-input").value = "";
  switchTab("group");
  openChannel(ch, name);
}
 
// ── MOBILE ──
function closeMobileChat() {
  document.getElementById("chat-area").classList.remove("mobile-open");
}
 
// ── LOGOUT ──
function logout() {
  sessionStorage.removeItem("portal_user");
  if (client) client.disconnectUser();
  window.location.href = "index.html";
}