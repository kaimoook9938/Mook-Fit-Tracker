// =======================
// Mook Fit Tracker v3.3 Stable
// =======================

const PROTEIN_GOAL = 55;
const CALORIE_LIMIT = 1300;

// =======================
// Elements
// =======================
const dateInput = document.getElementById("date");
const foodInput = document.getElementById("food");
const proteinInput = document.getElementById("protein");
const calorieInput = document.getElementById("calorie");
const foodList = document.getElementById("foodList");

let foods = JSON.parse(localStorage.getItem("foods")) || [];

// =======================
// เปิดเว็บครั้งแรก
// =======================
window.addEventListener("DOMContentLoaded", () => {
  const savedDate =
    localStorage.getItem("selectedDate") ||
    new Date().toLocaleDateString("sv-SE");

  dateInput.value = savedDate;
  updateThaiDate();
  loadDay(savedDate);
});

// =======================
// เปลี่ยนวันที่
// =======================
dateInput.addEventListener("change", () => {
  localStorage.setItem("selectedDate", dateInput.value);
  updateThaiDate();
  loadDay(dateInput.value);
});

// =======================
// วันที่ภาษาไทย
// =======================
function updateThaiDate() {
  const thaiDate = document.getElementById("thaiDate");
  if (!thaiDate || !dateInput.value) return;

  const date = new Date(dateInput.value);

  thaiDate.textContent = date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

// =======================
// ปุ่ม วันนี้
// =======================
function goToday() {
  const today = new Date().toLocaleDateString("sv-SE");

  dateInput.value = today;
  localStorage.setItem("selectedDate", today);

  updateThaiDate();
  loadDay(today);
}

// =======================
// เพิ่มอาหาร
// =======================
function addFood() {
  const food = foodInput.value.trim();
  const protein = Number(proteinInput.value);
  const calorie = Number(calorieInput.value);

  if (
    !food ||
    Number.isNaN(protein) ||
    Number.isNaN(calorie) ||
    protein < 0 ||
    calorie < 0
  ) {
    alert("กรอกข้อมูลให้ครบก่อนน้า 💚");
    return;
  }

  const item = {
    date: dateInput.value,
    food,
    protein,
    calorie
  };

  foods.push(item);
  localStorage.setItem("foods", JSON.stringify(foods));

  loadDay(dateInput.value);

  foodInput.value = "";
  proteinInput.value = "";
  calorieInput.value = "";
}

// =======================
// โหลดข้อมูลรายวัน
// =======================
function loadDay(date) {
  foods = JSON.parse(localStorage.getItem("foods")) || [];

  let proteinTotal = 0;
  let calorieTotal = 0;

  foodList.innerHTML = "";

  const dayFoods = foods.filter(item => item.date === date);

  dayFoods.forEach(item => {
    proteinTotal += Number(item.protein) || 0;
    calorieTotal += Number(item.calorie) || 0;
    showFood(item);
  });

  updateSummary(proteinTotal, calorieTotal);
}

// =======================
// แสดงรายการอาหาร
// =======================
function showFood(item) {
  const li = document.createElement("li");

  li.innerHTML = `
    <strong>🍽️ ${item.food}</strong><br>
    💪 ${item.protein} g &nbsp;&nbsp; 🔥 ${item.calorie} kcal
  `;

  foodList.appendChild(li);
}

// =======================
// สรุปรายวัน + หลอด
// =======================
function updateSummary(proteinTotal, calorieTotal) {

  document.getElementById("proteinTotal").textContent = proteinTotal;
  document.getElementById("calorieTotal").textContent = calorieTotal;

  const proteinPercent = Math.min(
    (proteinTotal / PROTEIN_GOAL) * 100,
    100
  );

  const caloriePercent = Math.min(
    (calorieTotal / CALORIE_LIMIT) * 100,
    100
  );

  document.getElementById("proteinBar").style.width =
    proteinPercent + "%";

  document.getElementById("calorieBar").style.width =
    caloriePercent + "%";

  // โปรตีน
  const proteinLeft = PROTEIN_GOAL - proteinTotal;

  document.getElementById("proteinStatus").textContent =
    proteinLeft > 0
      ? `🟠 เหลืออีก ${proteinLeft} g ถึงขั้นต่ำ`
      : "🟢 ถึงเป้าหมายโปรตีนแล้ว!";

  // แคล
  const calorieLeft = CALORIE_LIMIT - calorieTotal;

  document.getElementById("calorieStatus").textContent =
    calorieLeft >= 0
      ? `🟢 เหลือกินได้อีก ${calorieLeft} kcal`
      : `🔴 เกินมา ${Math.abs(calorieLeft)} kcal`;
}

// =======================
// ล้างข้อมูลวันนี้
// =======================
function resetToday() {
  if (!confirm("ล้างข้อมูลของวันนี้ใช่ไหม?")) return;

  foods = foods.filter(item => item.date !== dateInput.value);

  localStorage.setItem("foods", JSON.stringify(foods));

  loadDay(dateInput.value);

  document.getElementById("monthlySummary").style.display = "none";
}

// =======================
// สรุปรายเดือน
// =======================
function showMonthlySummary() {

  const month = dateInput.value.slice(0, 7);

  const monthFoods = foods.filter(item =>
    item.date.startsWith(month)
  );

  const monthName = new Date(month + "-01")
    .toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric"
    });

  const totalCal = monthFoods.reduce(
    (sum, item) => sum + item.calorie,
    0
  );

  const totalProtein = monthFoods.reduce(
    (sum, item) => sum + item.protein,
    0
  );

  const daily = {};

  monthFoods.forEach(item => {
    if (!daily[item.date]) {
      daily[item.date] = {
        cal: 0,
        protein: 0
      };
    }

    daily[item.date].cal += item.calorie;
    daily[item.date].protein += item.protein;
  });

  const days = Object.keys(daily).length;

  const avgCal =
    days === 0 ? 0 : Math.round(totalCal / days);

  const avgProtein =
    days === 0 ? 0 : (totalProtein / days).toFixed(1);

  let perfectDays = 0;
  let proteinGoalDays = 0;
  let calorieGoalDays = 0;

  Object.values(daily).forEach(day => {

    if (day.protein >= PROTEIN_GOAL) proteinGoalDays++;

    if (day.cal <= CALORIE_LIMIT) calorieGoalDays++;

    if (
      day.protein >= PROTEIN_GOAL &&
      day.cal <= CALORIE_LIMIT
    ) {
      perfectDays++;
    }

  });

  document.getElementById("monthlySummary").innerHTML = `
    <div class="summary-card">

      <div class="summary-header">
        <h3>📊 สรุปเดือน ${monthName}</h3>
        <span>Monthly Summary</span>
      </div>

      <div class="summary-grid">

        <div class="summary-box">
          <div>🔥</div>
          <small>แคลรวม</small>
          <h2>${totalCal}</h2>
          <p>kcal</p>
        </div>

        <div class="summary-box">
          <div>💪</div>
          <small>โปรตีนรวม</small>
          <h2>${totalProtein}</h2>
          <p>g</p>
        </div>

        <div class="summary-box green">
          <div>🟢</div>
          <small>Perfect Day</small>
          <h2>${perfectDays}</h2>
          <p>วัน</p>
        </div>

        <div class="summary-box blue">
          <div>🎯</div>
          <small>โปรตีนถึงเป้า</small>
          <h2>${proteinGoalDays}</h2>
          <p>วัน</p>
        </div>

      </div>

      <hr>

      <div class="summary-footer">
        <p>📅 วันที่บันทึก <b>${days}</b> วัน</p>
        <p>🍽️ รายการอาหาร <b>${monthFoods.length}</b> รายการ</p>
        <p>📉 แคลเฉลี่ย/วัน <b>${avgCal}</b> kcal</p>
        <p>🥩 โปรตีนเฉลี่ย/วัน <b>${avgProtein}</b> g</p>
        <p>🔥 แคลไม่เกิน 1300 <b>${calorieGoalDays}</b> วัน</p>
      </div>

    </div>
  `;
}

// =======================
// เปิด/ปิดสรุปรายเดือน
// =======================
function toggleMonthlySummary() {

  const summary = document.getElementById("monthlySummary");
  const arrow = document.getElementById("summaryArrow");

  if (
    summary.style.display === "none" ||
    summary.style.display === ""
  ) {
    showMonthlySummary();
    summary.style.display = "block";
    arrow.textContent = "▲";
  } else {
    summary.style.display = "none";
    arrow.textContent = "▼";
  }
}

// =======================
// ส่งออกข้อมูลเดือน
// =======================
function exportMonthData() {

  const month = dateInput.value.slice(0, 7);

  const monthFoods = foods.filter(item =>
    item.date.startsWith(month)
  );

  if (monthFoods.length === 0) {
    alert("📭 เดือนนี้ยังไม่มีข้อมูลให้ส่งออก");
    return;
  }

  const backup = {
    app: "Mook Fit Tracker",
    version: "3.3",
    month,
    exportDate: new Date().toISOString(),
    totalItems: monthFoods.length,
    foods: monthFoods
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `mook-fit-${month}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(link.href);

  alert(`✅ ส่งออกข้อมูลเดือน ${month} สำเร็จ!`);
}