/* ==========================================================
   KAKINADA BLOOD LINK — Dynamic Application Engine (Phase 2)
   --------------------------------------------------------
   Handles multi-role authentication checks, asynchronous 
   MySQL search aggregation, real-time database telemetry 
   counters, and layout viewport view switches cleanly.
   ========================================================== */

/* ---------- CONFIGURATION DATA UTILITIES ---------- */
function getLocalities() {
  return [
    "Jagannaickpur", "Sarpavaram", "Ramanayyapeta", "Ashok Nagar",
    "Bhanugudi Junction", "Gandhi Nagar", "Indrapalem", "Vakalapudi",
    "Sambamurthy Nagar", "Turangi", "Suryaraopeta", "Rama Rao Peta"
  ];
}

/* ---------- RENDER: Dynamic Telemetry & Meters ---------- */
function animateCount(el, target, duration = 1200) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(target * eased);
    el.textContent = value + "+";
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Automatically pulls counts out of MySQL to keep homepage counters synced
function refreshSystemTelemetry() {
  fetch('get_stats.php')
    .then(response => response.json())
    .then(data => {
      if (!data.success) return;

      // ==========================================================
      // 1. UPDATE SUMMARY METRIC CARDS
      // ==========================================================
      const donorsCounter = document.querySelectorAll("#heroStats [data-counter]");
      const countersValues = [data.stats.donors, data.stats.available, data.stats.hospitals];
      donorsCounter.forEach((el, i) => {
        if (el) animateCount(el, countersValues[i] ?? 0);
      });

      const dashDonors = document.getElementById("dash-stat-donors");
      const dashHospitals = document.getElementById("dash-stat-hospitals");
      const dashStock = document.getElementById("dash-stat-stock");
      const dashGroups = document.getElementById("dash-stat-groups");

      if (dashDonors) dashDonors.textContent = data.stats.donors;
      if (dashHospitals) dashHospitals.textContent = data.stats.hospitals;
      if (dashStock) dashStock.textContent = data.stats.available;
      if (dashGroups && data.stats.groups_count !== undefined) {
        dashGroups.textContent = data.stats.groups_count;
      }

      // ==========================================================
      // 2. UPDATE PROGRESS METERS & THE BAR CHART
      // ==========================================================
      const grid = document.getElementById("dropGrid");
      if (grid && data.availability) {
        const homepageMax = Math.max(...data.availability.map(d => d.count), 1);
        
        // Homepage indicators continue tracking live donor registration counts properly
        grid.innerHTML = data.availability.map(d => {
          const fillPercentage = Math.round((d.count / homepageMax) * 100);
          return `
            <li class="drop">
              <span class="drop-group">${d.group}</span>
              <span class="drop-count">${d.count} donors</span>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${fillPercentage}%"></div>
              </div>
            </li>`;
        }).join("");

        // ==========================================================
        // FIXED: FORCE HOSPITAL BARS TO REMAIN AT ZERO
        // ==========================================================
        const svgBars = document.querySelectorAll(".stock-bar-node");
        const tooltipDivs = document.querySelectorAll(".custom-tooltip small");
        const tooltipObjects = document.querySelectorAll(".svg-tooltip-box");
        
        data.availability.forEach((d, idx) => {
          if (svgBars[idx]) {
            // Since hospital data is nil, we lock the height to 0 and baseline Y to 210
            svgBars[idx].setAttribute("height", "0");
            svgBars[idx].setAttribute("y", "210");
            
            // Align the hover tooltip box anchors right at the flat baseline
            if (tooltipObjects[idx]) {
              tooltipObjects[idx].setAttribute("y", "150"); 
            }
            
            // Set the interactive text popups to show exactly 0 units
            if (tooltipDivs[idx]) {
              tooltipDivs[idx].textContent = "Units: 0";
            }
          }
        });
      }

      // ==========================================================
      // 3. UPDATE DYNAMIC LINE CHART TRENDS
      // ==========================================================
      const lineChartSvg = document.querySelector(".line-chart-svg");
      if (lineChartSvg && data.monthly_trends) {
        const trendMax = Math.max(...data.monthly_trends, 1);
        const xCoords = [50, 93, 136, 180, 223, 266, 310, 353, 396, 440, 483, 526];
        
        // Map line nodes through algebraic vector boundaries
        const points = data.monthly_trends.map((count, i) => {
          const calculatedHeight = (count / trendMax) * 225; // 225px max plot height bounds
          const y = 275 - calculatedHeight;
          return { x: xCoords[i], y: y };
        });

        // Regenerate the smooth linear vector drawing instructions string
        const pathData = "M " + points.map(p => `${p.x},${p.y}`).join(" L ");
        
        let pathEl = lineChartSvg.querySelector("path");
        if (pathEl) pathEl.setAttribute("d", pathData);

        // Position individual point dot circles precisely over coordinate intersections
        const circles = lineChartSvg.querySelectorAll("circle");
        circles.forEach((circle, i) => {
          if (circle && points[i]) {
            circle.setAttribute("cx", points[i].x);
            circle.setAttribute("cy", points[i].y);
            circle.setAttribute("r", data.monthly_trends[i] > 0 ? "5" : "3");
          }
        });

        // Update line graph vertical label axes numbers dynamically
        const textAxes = lineChartSvg.querySelectorAll("text.axis-label-text");
        if (textAxes.length >= 4) {
          textAxes[0].textContent = trendMax;
          textAxes[1].textContent = Math.round(trendMax * 0.66);
          textAxes[2].textContent = Math.round(trendMax * 0.33);
        }
      }

      // ==========================================================
      // 4. UPDATE DYNAMIC DONUT DISTRIBUTION CHART
      // ==========================================================
      const donutSvg = document.querySelector(".donut-chart-svg");
      const legendContainer = document.querySelector(".chart-legends-row");
      
      if (donutSvg && data.availability && legendContainer) {
        // Filter out groups with 0 donors so we only plot what exists
        const activeGroups = data.availability.filter(d => d.count > 0);
        const totalActiveDonors = activeGroups.reduce((sum, d) => sum + d.count, 0);
        
        const colors = ["#a8192e", "#c97a2b", "#2f6f62", "#4a90e2", "#8b572a", "#f5a623", "#7ed321", "#9013fe"];
        const totalCircumference = 2 * Math.PI * 60; // 376.99 (Radius = 60px)
        
        let currentOffset = 0;
        let donutHtml = "";
        let legendsHtml = "";

        if (totalActiveDonors === 0) {
          // If database contains zero records, render a single uniform empty gray circle ring loop
          donutHtml = `<circle cx="100" cy="100" r="60" fill="transparent" stroke="var(--line)" stroke-width="24" />`;
          legendsHtml = `<span class="legend-indicator" style="color: var(--text-muted);">● No Donors Registered</span>`;
        } else {
          activeGroups.forEach((d, i) => {
            const sharePercentage = d.count / totalActiveDonors;
            const arcLength = sharePercentage * totalCircumference;
            const strokeDashArray = `${arcLength} ${totalCircumference}`;
            const color = colors[i % colors.length];

            donutHtml += `
  <circle cx="100" cy="100" r="60" fill="transparent" 
          stroke="${color}" stroke-width="24" 
          stroke-dasharray="${strokeDashArray}" 
          stroke-dashoffset="-${currentOffset}"
          style="transform-origin: center;" />`;
            
            legendsHtml += `<span class="legend-indicator" style="color: ${color}; font-size:0.8rem; margin:0 0.25rem;">● ${d.group} (${Math.round(sharePercentage * 100)}%)</span>`;
            currentOffset += arcLength;
          });
        }

        donutSvg.innerHTML = donutHtml;
        legendContainer.innerHTML = legendsHtml;
      }

    })
    .catch(err => console.error("Telemetry pipeline network error:", err));
}
function renderLocalities() {
  const list = document.getElementById("localityList");
  if (list) {
    list.innerHTML = getLocalities().map(name => `<li>📍 ${name}</li>`).join("");
  }
}

/* ---------- POPULATE SELECT DROPDOWNS ---------- */
function populateAllDropdowns() {
  const localities = getLocalities();
  const dropdownConfigs = [
    { id: "reg-locality", fallback: "Select Locality" },
    { id: "search-area", fallback: "All areas" },
    { id: "em-area", fallback: "Select..." },
    { id: "rec-area", fallback: "Select Locality" }
  ];

  dropdownConfigs.forEach(cfg => {
    const selectEl = document.getElementById(cfg.id);
    if (!selectEl) return;
    selectEl.innerHTML = `<option value="${cfg.fallback === 'All areas' ? 'All areas' : ''}">${cfg.fallback}</option>`;
    localities.forEach(name => selectEl.appendChild(new Option(name, name)));
  });
}

/* ---------- CENTRAL FORM CONTROLLERS & VALIDATION ---------- */
function setFieldError(fieldEl, message) {
  if (!fieldEl) return;
  const errorEl = fieldEl.querySelector(".field-error");
  if (message) {
    fieldEl.classList.add("invalid");
    if (errorEl) errorEl.textContent = message;
  } else {
    fieldEl.classList.remove("invalid");
    if (errorEl) errorEl.textContent = "";
  }
}

function validateRegisterForm(form) {
  let firstInvalid = null;
  const checks = [
    { id: "reg-name", valid: (v) => v.trim().length >= 3, message: "Enter your full name (at least 3 characters)." },
    { id: "reg-group", valid: (v) => v !== "", message: "Select your blood group." },
    { id: "reg-age", valid: (v) => Number(v) >= 18 && Number(v) <= 65, message: "Donors must be between 18 and 65 years old." },
    { id: "reg-gender", valid: (v) => v !== "", message: "Select your gender." },
    { id: "reg-email", valid: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), message: "Enter a valid email address." },
    { id: "reg-phone", valid: (v) => /^[6-9]\d{9}$/.test(v.trim()), message: "Enter a valid 10-digit mobile number." },
    { id: "reg-locality", valid: (v) => v !== "", message: "Select your locality." },
    { id: "reg-password", valid: (v) => v.trim().length >= 6, message: "Password must be at least 6 characters long." }
  ];

  checks.forEach(({ id, valid, message }) => {
    const input = form.querySelector(`#${id}`);
    if (!input) return;
    const fieldEl = input.closest(".field");
    const ok = valid(input.value);
    setFieldError(fieldEl, ok ? "" : message);
    if (!ok && !firstInvalid) firstInvalid = input;
  });

  const consent = form.querySelector("#reg-consent");
  const statusEl = document.getElementById("formStatus");
  if (consent && !consent.checked) {
    if (statusEl) {
      statusEl.textContent = "Please confirm the consent checkbox to continue.";
      statusEl.className = "form-status error";
    }
    if (!firstInvalid) firstInvalid = consent;
  }

  return firstInvalid === null;
}

function initDynamicRegistrationForms() {
  // Donor Registration Submission Pipeline
  const donorForm = document.getElementById("registerForm");
  donorForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    const statusEl = document.getElementById("formStatus");
    if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }

    if (!validateRegisterForm(this)) return;

    const formData = new FormData(this);
    formData.append("role", "donor");

    fetch('register.php', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          statusEl.className = "form-status success";
          statusEl.textContent = data.message;
          this.reset();
          refreshSystemTelemetry(); // Instantly synchronizes live counts on home view block
        } else {
          statusEl.className = "form-status error";
          statusEl.textContent = data.message;
        }
      })
      .catch(() => {
        statusEl.className = "form-status error";
        statusEl.textContent = "Server communication failure.";
      });
  });

  // Recipient Registration Submission Pipeline
  const recipientForm = document.getElementById("recipientRegisterForm");
  recipientForm?.addEventListener("submit", function(e) {
    e.preventDefault();
    const statusEl = document.getElementById("recipientFormStatus");
    if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }

    let isValid = true;
    const targets = [
      { id: "rec-name", msg: "Please enter your full name." },
      { id: "rec-email", msg: "Please provide a valid email address." },
      { id: "rec-phone", msg: "Please enter a valid 10-digit number." },
      { id: "rec-group", msg: "Please select the required blood group." },
      { id: "rec-area", msg: "Please specify your location area." },
      { id: "rec-hospital", msg: "Please type your preferred hospital name." },
      { id: "rec-password", msg: "Password must be at least 6 characters long." }
    ];

    targets.forEach(item => {
      const inputEl = document.getElementById(item.id);
      if (!inputEl) return;
      const containerField = inputEl.closest(".field");
      let pass = inputEl.value.trim().length > 0;
      if (item.id === "rec-password" && pass) pass = inputEl.value.trim().length >= 6;

      if (!pass) {
        setFieldError(containerField, item.msg);
        isValid = false;
      } else {
        setFieldError(containerField, "");
      }
    });

    if (!isValid) return;

    const formData = new FormData();
    formData.append("role", "recipient");
    formData.append("recipientName", document.getElementById("rec-name").value);
    formData.append("recipientEmail", document.getElementById("rec-email").value);
    formData.append("recipientPhone", document.getElementById("rec-phone").value);
    formData.append("requiredBloodGroup", document.getElementById("rec-group").value);
    formData.append("recipientArea", document.getElementById("rec-area").value);
    formData.append("preferredHospital", document.getElementById("rec-hospital").value);
    formData.append("password", document.getElementById("rec-password").value);
    formData.append("email", document.getElementById("rec-email").value);

    fetch('register.php', { method: 'POST', body: formData })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          statusEl.className = "form-status success";
          statusEl.textContent = data.message;
          this.reset();
          refreshSystemTelemetry();
        } else {
          statusEl.className = "form-status error";
          statusEl.textContent = data.message;
        }
      });
  });
}

/* ---------- AUTHENTICATION & LOGIN DISPATCH ---------- */
/* ---------- CENTRALIZED LOGIN SYSTEMS (Fixed Instant Toggle) ---------- */
function initCentralizedLoginSystems() {
  const loginConfigs = [
    { formId: "donorLoginForm", emailId: "login-email", passId: "login-password" },
    { formId: "recipientLoginForm", emailId: "rec-login-email", passId: "rec-login-password" }
  ];

  loginConfigs.forEach(cfg => {
    const formEl = document.getElementById(cfg.formId);
    formEl?.addEventListener("submit", function(e) {
      e.preventDefault();
      const emailEl = document.getElementById(cfg.emailId);
      const passEl = document.getElementById(cfg.passId);

      if (!emailEl.value.trim() || !passEl.value.trim()) {
        alert("Please provide both an account email and password.");
        return;
      }

      const formData = new FormData();
      formData.append("email", emailEl.value.trim());
      formData.append("password", passEl.value);

      fetch('login.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          if (data.success) {
            this.reset();
            
            // FIX: Forces the frontend interface buttons to change instantly without a manual page refresh!
            if (typeof updateNavigationVisibilityStates === "function") {
              updateNavigationVisibilityStates(true);
            }

            // Automatically switch view panel tab focus directly over onto the dynamic search panel workspace
            document.querySelector('[data-target="search-panel"]').click();
          }
        })
        .catch(() => alert("Authentication server request timed out."));
    });
  });
}

/* ---------- LOCALIZED DIRECTORY SEARCH MODULE ---------- */
function initDonorSearchModule() {
  const queryBtn = document.getElementById("searchQueryBtn");
  const resultsGrid = document.getElementById("donorResultsGrid");
  const countText = document.getElementById("match-count-text");

  if (!queryBtn) return;

  queryBtn.addEventListener("click", () => {
    const group = document.getElementById("search-blood-group").value;
    const area = document.getElementById("search-area").value;
    const available = document.getElementById("search-available").checked;

    if (!resultsGrid) return;
    resultsGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Querying local Kakinada blood network ledger...</p>';

    fetch(`search.php?blood_group=${encodeURIComponent(group)}&area=${encodeURIComponent(area)}&available_only=${available}`)
      .then(res => {
        if (res.status === 401) {
          throw new Error("🔐 Access Denied: Please log in as a registered Donor or Recipient to scan records.");
        }
        return res.json();
      })
      .then(data => {
        if (!data.success) {
          resultsGrid.innerHTML = `<div class="initial-placeholder"><p>${data.message}</p></div>`;
          if (countText) countText.textContent = "0 donors";
          return;
        }

        if (countText) countText.textContent = `${data.count} donor${data.count === 1 ? '' : 's'} found`;

        if (data.donors.length === 0) {
          resultsGrid.innerHTML = '<div class="initial-placeholder"><p>No active voluntary donors match this group and area track criteria right now.</p></div>';
          return;
        }

        // Render live donors rows dynamically right under find donor section cards
        resultsGrid.innerHTML = data.donors.map(donor => `
          <div class="donor-result-card">
            <div class="card-top-identity">
              <div class="donor-meta">
                <h4>${donor.full_name}</h4>
                <p class="donor-sub-text">${donor.gender} · ${donor.age} yrs · ${donor.donation_count} donations</p>
              </div>
              <div class="blood-badge-square">${donor.blood_group}</div>
            </div>
            <div class="card-mid-contact">
              <span>📍 ${donor.locality_name}, Kakinada</span>
              <span>📞 ${donor.phone_number}</span>
            </div>
            <div class="card-bottom-actions">
              <span class="status-badge-inline" style="color: ${donor.is_available ? 'var(--teal)' : 'var(--amber)'}">
                ● ${donor.is_available ? 'Available' : 'On Leave'}
              </span>
              <a href="tel:${donor.phone_number}" class="btn card-contact-btn" style="text-decoration:none; color:white;">Contact</a>
            </div>
          </div>
        `).join("");
      })
      .catch(err => {
        resultsGrid.innerHTML = `<div class="initial-placeholder" style="border-color:var(--crimson);"><p style="color:var(--crimson); font-weight:600;">${err.message}</p></div>`;
        if (countText) countText.textContent = "Locked";
      });
  });
}

/* ---------- OTHER CORE FRONTEND MODULE INTERACTION ---------- */
function initEmergencyModule() {
  const form = document.getElementById("emergencyRequestForm");
  form?.addEventListener("submit", function(e) {
    e.preventDefault();
    alert("⚠️ Emergency request recorded in prototype view successfully!");
    this.reset();
  });
}

function initAwarenessModule() {
  const form = document.getElementById("eligibilityForm");
  const resultBox = document.getElementById("eligibilityResult");

  form?.addEventListener("submit", function(e) {
    e.preventDefault();
    if (!resultBox) return;

    const age = parseInt(document.getElementById("el-age").value);
    const weight = parseInt(document.getElementById("el-weight").value);
    const isHealthy = document.getElementById("el-health").value === "Yes";
    const recentlyDonated = document.getElementById("el-donated").value === "Yes";
    const hasTattoo = document.getElementById("el-tattoo").value === "Yes";

    let reasons = [];
    if (age < 18 || age > 65) reasons.push("Age must be between 18 and 65 years.");
    if (weight < 50) reasons.push("Weight must be at least 50 kg.");
    if (!isHealthy) reasons.push("You must be in good health at the time of donation.");
    if (recentlyDonated) reasons.push("A minimum gap of 3 months is required between blood donations.");
    if (hasTattoo) reasons.push("Deferral period of 6 months is required after getting a tattoo or piercing.");

    resultBox.classList.remove("hidden");
    if (reasons.length === 0) {
      resultBox.className = "checker-result-box pass";
      resultBox.innerHTML = `<span>✓</span> Great! You appear eligible. Visit any Kakinada hospital blood bank to donate.`;
    } else {
      resultBox.className = "checker-result-box fail";
      resultBox.innerHTML = `<span>✕</span> Deferral Required: ${reasons.join(" ")}`;
    }
  });

  document.querySelectorAll(".faq-trigger").forEach(trigger => {
    trigger.addEventListener("click", function() {
      const item = this.closest(".faq-item");
      const content = item.querySelector(".faq-content");
      const isActive = item.classList.contains("active");

      document.querySelectorAll(".faq-item").forEach(el => {
        el.classList.remove("active");
        el.querySelector(".faq-content").style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add("active");
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
}

/* ---------- LIVE CONTACT DIRECT INBOX FEED (Connected to PHP) ---------- */
function initContactUsModule() {
  const contactForm = document.getElementById("contactDirectForm");
  
  contactForm?.addEventListener("submit", function(e) {
    e.preventDefault();

    // Dynamically bundle the user text values
    const formData = new FormData();
    formData.append("name", document.getElementById("ct-name")?.value || "");
    formData.append("email", document.getElementById("ct-email")?.value || "");
    formData.append("phone", document.getElementById("ct-phone")?.value || "");
    formData.append("subject", document.getElementById("ct-subject")?.value || "");
    formData.append("message", document.getElementById("ct-message")?.value || "");

    // Stream inputs down to our newly minted PHP processing file script
    fetch('contact.php', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message); // This will now show your real database success state message!
      if (data.success) {
        contactForm.reset(); // Safely flushes input fields clear
      }
    })
    .catch(err => {
      console.error("Contact form error:", err);
      alert("Error sending request to local web server module.");
    });
  });
}

function renderDashboardPanelModule() {
  // Real-time tracking measurements are now automatically handled by refreshSystemTelemetry()
}

function initDynamicThemeMode() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  if (!toggleBtn) return;
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
  });
}

function initNavToggle() {
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("navToggle");
  if (!toggle || !header) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.getElementById("mainNav")?.addEventListener("click", (e) => {
    if (e.target.closest("[data-target]")) {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function initSPARouting() {
  const navigationTriggers = document.querySelectorAll("[data-target]");
  navigationTriggers.forEach(item => {
    item.addEventListener("click", function(e) {
      const targetPanelId = this.getAttribute("data-target");
      if (targetPanelId) {
        e.preventDefault();
        document.getElementById("siteHeader")?.classList.remove("nav-open");

        document.querySelectorAll(".view-panel").forEach(panel => {
          panel.classList.add("hidden");
        });

        const targetPanel = document.getElementById(targetPanelId);
        if (targetPanel) targetPanel.classList.remove("hidden");

        if (targetPanelId === "dashboard-panel") {
          renderDashboardPanelModule();
        }

        document.querySelectorAll(".nav-button").forEach(link => {
          link.classList.remove("active");
        });
        const activeMenuPill = document.querySelector(`.main-nav .nav-button[data-target="${targetPanelId}"]`);
        if (activeMenuPill) activeMenuPill.classList.add("active");

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/* ---------- SINGLE-POINT LIFECYCLE INITIALIZER ---------- */
/* ---------- SINGLE-POINT LIFECYCLE INITIALIZER ---------- */
document.addEventListener("DOMContentLoaded", () => {
  checkActiveUserSessionState(); // 1. Run immediate session cookie lookups
  refreshSystemTelemetry();      
  renderLocalities();
  populateAllDropdowns();
  initDynamicRegistrationForms();
  initCentralizedLoginSystems();
  initSessionLogoutEngine();    // 2. Instantiate logout click listener targets
  initDonorSearchModule();
  initEmergencyModule();
  initAwarenessModule();
  initContactUsModule();
  initDynamicThemeMode();
  initNavToggle();
  initSPARouting();
});
/* ---------- EXPLICIT SESSION LOGOUT MANAGEMENT ---------- */
function initSessionLogoutEngine() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    fetch('login.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          if (data.success) {
            this.reset();
            // INSTANT ACCESSIBILITY STATE UPDATES:
            updateNavigationVisibilityStates(true);
            document.querySelector('[data-target="search-panel"]').click();
          }
        });
  });
}

// Update your centralized login event listener to show the logout button on success
// Inside your existing fetch('login.php') block where data.success is evaluated, add:
// document.getElementById("logoutBtn").style.display = "inline-flex";
// document.querySelector('[data-target="login-panel"]').style.display = "none";
// document.querySelector('[data-target="register-panel"]').style.display = "none";
/* ---------- EXPLICIT SESSION & LOGOUT MANAGEMENT ENGINE ---------- */
function updateNavigationVisibilityStates(isLoggedIn) {
  const loginBtn = document.getElementById("navLoginBtn");
  const registerBtn = document.getElementById("navRegisterBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = "none";
    if (registerBtn) registerBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";
  } else {
    if (loginBtn) loginBtn.style.display = "inline-flex";
    if (registerBtn) registerBtn.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

function checkActiveUserSessionState() {
  // Query server right on load to see if cookies match an existing login record
  fetch('check_session.php')
    .then(res => res.json())
    .then(data => {
      updateNavigationVisibilityStates(data.logged_in);
    })
    .catch(err => console.error("Session verification loop caught an error:", err));
}

function initSessionLogoutEngine() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    fetch('logout.php')
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        if (data.success) {
          // Flip display states and kick user back to homepage safely
          updateNavigationVisibilityStates(false);
          document.querySelector('[data-target="home-panel"]').click();
          refreshSystemTelemetry();
        }
      });
  });
}