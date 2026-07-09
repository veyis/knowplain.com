(function () {
  const path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav a[data-nav]").forEach((a) => {
    const key = a.getAttribute("data-nav");
    if (
      (key === "home" && path === "") ||
      (key !== "home" && path.includes("/" + key))
    ) {
      a.classList.add("on");
    }
  });

  const form = document.getElementById("globalSearch");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = (form.querySelector("input")?.value || "").trim();
      location.href = "/search/?q=" + encodeURIComponent(q || "retirement");
    });
  }
  const hero = document.getElementById("heroSearch");
  if (hero) {
    hero.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = (hero.querySelector("input")?.value || "").trim();
      location.href = "/search/?q=" + encodeURIComponent(q || "retirement");
    });
  }
})();
