const API = "/api/v1";

let token = localStorage.getItem("blog_token");
let currentUser = null;

const $ = (id) => document.getElementById(id);

function setAuthState() {
  if (token) {
    $("authBtn").classList.add("hidden");
    $("logoutBtn").classList.remove("hidden");
    $("postEditor").classList.remove("hidden");
    const username = currentUser ? currentUser.username : "";
    $("userBadge").textContent = "@" + username;
    $("userBadge").classList.remove("hidden");
  } else {
    $("authBtn").classList.remove("hidden");
    $("logoutBtn").classList.add("hidden");
    $("postEditor").classList.add("hidden");
    $("userBadge").classList.add("hidden");
    currentUser = null;
  }
}

async function authHeaders() {
  return token
    ? { Authorization: "Bearer " + token, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: await authHeaders(),
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || ("HTTP " + res.status));
  }
  if (res.status === 204) return null;
  return res.json();
}

let loginMode = "login"; // "login" | "register"

function toggleAuthMode() {
  loginMode = loginMode === "login" ? "register" : "login";
  $("authTitle").textContent = loginMode === "login" ? "Login / Register" : "Register";
  $("authSubmit").textContent = loginMode === "login" ? "Login" : "Register";
  $("toggleMode").textContent = loginMode === "login" ? "Switch to Register" : "Switch to Login";
  $("authError").classList.add("hidden");
}

async function handleAuth(e) {
  e.preventDefault();
  $("authError").classList.add("hidden");
  const body = {
    username: $("username").value,
    email: $("email").value,
    password: $("password").value,
  };
  try {
    const endpoint = loginMode === "login" ? "/auth/login" : "/auth/register";
    const data = await api(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
    token = data.access_token;
    localStorage.setItem("blog_token", token);
    currentUser = { username: body.username };
    setAuthState();
    loadPosts();
  } catch (err) {
    $("authError").textContent = err.message;
    $("authError").classList.remove("hidden");
  }
}

async function handlePost(e) {
  e.preventDefault();
  const body = {
    title: $("postTitle").value,
    content: $("postContent").value,
  };
  try {
    await api("/posts", { method: "POST", body: JSON.stringify(body) });
    $("postForm").reset();
    loadPosts();
  } catch (err) {
    alert(err.message);
  }
}

async function loadPosts() {
  try {
    const posts = await api("/posts?limit=50");
    renderPosts(posts);
  } catch (err) {
    console.error(err);
  }
}

function renderPosts(posts) {
  const list = $("postList");
  if (!posts.length) {
    list.innerHTML = '<p class="empty">No posts yet. Sign in to write one!</p>';
    return;
  }
  list.innerHTML = posts
    .map(
      (p) => `
      <article class="post">
        <h3>${escapeHtml(p.title)}</h3>
        <div class="meta">by @${escapeHtml(p.author.username)} · ${new Date(p.created_at).toLocaleString()}</div>
        <div class="content">${escapeHtml(p.content)}</div>
        <div class="post-actions">
          <button data-edit="${p.id}" class="btn btn-ghost">Edit</button>
          <button data-delete="${p.id}" class="btn btn-danger">Delete</button>
        </div>
      </article>`
    )
    .join("");

  list.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => editPost(parseInt(btn.dataset.edit)))
  );
  list.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => deletePost(parseInt(btn.dataset.delete)))
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function editPost(id) {
  const title = prompt("Edit title");
  if (title === null) return;
  const content = prompt("Edit content");
  if (content === null) return;
  try {
    await api("/posts/" + id, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    });
    loadPosts();
  } catch (err) {
    alert(err.message);
  }
}

async function deletePost(id) {
  if (!confirm("Delete this post?")) return;
  try {
    await api("/posts/" + id, { method: "DELETE" });
    loadPosts();
  } catch (err) {
    alert(err.message);
  }
}

async function whoami() {
  if (!token) return;
  try {
    const me = await api("/me");
    currentUser = me;
    setAuthState();
  } catch (e) {
    token = null;
    localStorage.removeItem("blog_token");
    setAuthState();
  }
}

$("authForm").addEventListener("submit", handleAuth);
$("postForm").addEventListener("submit", handlePost);
$("authBtn").addEventListener("click", () => {
  loginMode = "login";
  toggleAuthMode();
});
$("toggleMode").addEventListener("click", toggleAuthMode);
$("logoutBtn").addEventListener("click", () => {
  token = null;
  localStorage.removeItem("blog_token");
  setAuthState();
  loadPosts();
});

whoami().then(loadPosts);