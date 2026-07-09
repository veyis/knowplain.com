(function () {
  const C = window.EXPLAIN_STUDIO || {};

  function amazon(asin) {
    const tag = C.amazonTag ? `?tag=${encodeURIComponent(C.amazonTag)}` : "";
    return `https://www.amazon.com/dp/${asin}${tag}`;
  }

  function fillLinks() {
    document.querySelectorAll("[data-link]").forEach((el) => {
      const key = el.getAttribute("data-link");
      const map = {
        empower: C.empowerUrl,
        boldin: C.boldinUrl,
        ynab: C.ynabUrl,
        youtube: C.youtube,
        simplepath: amazon("1533660922"),
        bogleheads: amazon("047045892X"),
        book1: amazon("080701429X"),
        book2: amazon("0718154924"),
        book3: amazon("147295128X"),
        book4: amazon("0593804872"),
        book5: amazon("0063204169"),
      };
      if (map[key]) el.setAttribute("href", map[key]);
    });
  }

  function wireNewsletterForms() {
    document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
      if (!C.newsletterAction) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const box = form.querySelector("[data-form-status]");
          if (box) {
            box.hidden = false;
            box.textContent =
              "Email capture is not connected yet. Download the pack below — Beehiiv/ConvertKit form action goes in assets/config.js.";
          }
          const pack = document.querySelector("#pack-downloads");
          if (pack) pack.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return;
      }
      form.action = C.newsletterAction;
      form.method = C.newsletterMethod || "POST";
      const email = form.querySelector('[name="email"], [data-email]');
      const name = form.querySelector('[name="first_name"], [data-name]');
      if (email && C.newsletterEmailField) email.name = C.newsletterEmailField;
      if (name && C.newsletterNameField) name.name = C.newsletterNameField;
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    fillLinks();
    wireNewsletterForms();
  });

  window.ExplainStudioAmazon = amazon;
})();
