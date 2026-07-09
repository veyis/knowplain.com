(function () {
  function money(n) {
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  function fvLump(pv, r, n) {
    return pv * Math.pow(1 + r, n);
  }

  function fvAnnuityMonthly(pmt, annualRate, years) {
    const i = annualRate / 12;
    const m = years * 12;
    if (Math.abs(i) < 1e-12) return pmt * m;
    return pmt * ((Math.pow(1 + i, m) - 1) / i);
  }

  function readNum(id) {
    const el = document.getElementById(id);
    return el ? Number(String(el.value).replace(/,/g, "")) : NaN;
  }

  function setStat(id, value, tone) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
    const card = el.closest(".stat");
    if (!card) return;
    card.classList.remove("ok", "warn", "bad");
    if (tone) card.classList.add(tone);
  }

  function compute() {
    const age = readNum("age");
    const retireAge = readNum("retire-age");
    const nest = readNum("nest-egg");
    const monthly = readNum("monthly");
    const realReturn = readNum("real-return") / 100;
    const spend = readNum("spend");
    const otherIncome = readNum("other-income") || 0;
    const withdrawPct = readNum("withdraw") / 100;

    const years = retireAge - age;
    const note = document.getElementById("calc-note");

    if (!(years > 0) || !(nest >= 0) || !(monthly >= 0) || !(spend > 0) || !(withdrawPct > 0)) {
      setStat("out-years", "—");
      setStat("out-projected", "—");
      setStat("out-needed", "—");
      setStat("out-gap", "—");
      setStat("out-band3", "—");
      setStat("out-band4", "—");
      if (note) note.textContent = "Enter age, nest egg, spending, and a withdrawal rate to see results.";
      return;
    }

    const projected =
      fvLump(nest, realReturn, years) + fvAnnuityMonthly(monthly, realReturn, years);
    const incomeGap = Math.max(spend - otherIncome, 0);
    const needed = incomeGap / withdrawPct;
    const gap = projected - needed;
    const need3 = incomeGap / 0.03;
    const need4 = incomeGap / 0.04;

    setStat("out-years", String(years));
    setStat("out-projected", money(projected));
    setStat("out-needed", money(needed));
    setStat(
      "out-gap",
      money(gap),
      gap >= 0 ? "ok" : gap > -needed * 0.15 ? "warn" : "bad"
    );
    setStat("out-band3", money(need3));
    setStat("out-band4", money(need4));

    if (note) {
      note.textContent =
        gap >= 0
          ? "Illustrative surplus at your chosen withdrawal rate. Next: stress-test the same numbers in Empower."
          : "Illustrative shortfall. Levers: save more, spend less, work longer, or lower the withdrawal rate. Not advice.";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("readiness-form");
    if (!form) return;
    form.querySelectorAll("input").forEach((el) => {
      el.addEventListener("input", compute);
      el.addEventListener("change", compute);
    });
    compute();
  });
})();
