const dateEl = document.getElementById("date");
const slotsEl = document.getElementById("slots");
const payBtn = document.getElementById("payBtn");
const form = document.getElementById("booking-form");
const statusEl = document.getElementById("status");

function isoLocalDate(d=new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  return t.toISOString().slice(0,10);
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateEl.min = isoLocalDate(tomorrow);
dateEl.value = isoLocalDate(tomorrow);

let selectedTime = null;

function generateSlots() {
  slotsEl.innerHTML = "";
  selectedTime = null;
  const day = new Date(dateEl.value + "T00:00:00");
  for (let h = 10; h <= 18; h++) {
    if (h === 13) continue;
    const d = new Date(day);
    d.setHours(h, 0, 0, 0);
    const label = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
      btn.classList.add("selected");
      selectedTime = label;
    });
    slotsEl.appendChild(btn);
  }
}
generateSlots();
dateEl.addEventListener("change", generateSlots);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  payBtn.disabled = true;

  const service = document.querySelector('input[name="service"]:checked').value;
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!selectedTime) {
    statusEl.textContent = "Please choose a time slot.";
    payBtn.disabled = false;
    return;
  }

  const payload = { service, date: dateEl.value, time: selectedTime, customer_name: name, customer_email: email };

  try {
    let res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      res = await fetch("/.netlify/functions/createCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Unknown error");
    }
  } catch (err) {
    statusEl.textContent = "Could not start checkout. " + err.message;
    payBtn.disabled = false;
  }
});
