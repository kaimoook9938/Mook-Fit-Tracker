// =======================
// Mook Fit Tracker v3 (Fixed)
// =======================

const PROTEIN_GOAL = 55;
const CALORIE_LIMIT = 1300;

// ดึง element จาก HTML
const dateInput = document.getElementById("date");
const foodInput = document.getElementById("food");
const proteinInput = document.getElementById("protein");
const calorieInput = document.getElementById("calorie");

// โหลดข้อมูลทั้งหมดจาก Local Storage
let foods = JSON.parse(localStorage.getItem("foods")) || [];

// ตั้งวันที่เป็นวันนี้
const today = new Date().toLocaleDateString("sv-SE");
dateInput.value = today;

// แสดงวันที่ภาษาไทย
updateThaiDate();

// โหลดข้อมูลของวันนี้
loadDay(today);
// โหลดข้อมูลของวันนี้ตอนเปิดเว็บ
loadDay(today);

// เปลี่ยนวันที่แล้วโหลดข้อมูลใหม่
dateInput.addEventListener("change", () => {
  loadDay(dateInput.value);
});

// =======================
// เพิ่มอาหาร
// =======================
function addFood() {

  const food = foodInput.value.trim();
  const protein = Number(proteinInput.value);
  const calorie = Number(calorieInput.value);

  if (!food || protein <= 0 || calorie <= 0) {
    alert("กรอกข้อมูลให้ครบก่อนน้า 💚");
    return;
  }

  const item = {
    date: dateInput.value,
    food: food,
    protein: protein,
    calorie: calorie
  };

  foods.push(item);
  localStorage.setItem("foods", JSON.stringify(foods));

  // โหลดข้อมูลของวันนั้นใหม่
  loadDay(dateInput.value);

  // ล้างช่องกรอก
  foodInput.value = "";
  proteinInput.value = "";
  calorieInput.value = "";
}

// =======================
// โหลดข้อมูลรายวัน
// =======================
function loadDay(date) {

  // โหลดข้อมูลล่าสุดจาก Local Storage
  foods = JSON.parse(localStorage.getItem("foods")) || [];

  let proteinTotal = 0;
  let calorieTotal = 0;

  document.getElementById("foodList").innerHTML = "";

  const dayFoods = foods.filter(item => item.date === date);

  dayFoods.forEach(item => {
    proteinTotal += item.protein;
    calorieTotal += item.calorie;
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
    🍽️ <b>${item.food}</b><br>
    💪 ${item.protein} g | 🔥 ${item.calorie} kcal
  `;

  document.getElementById("foodList").appendChild(li);
}

// =======================
// อัปเดตสรุปรายวัน
// =======================
function updateSummary(proteinTotal, calorieTotal) {

  document.getElementById("proteinTotal").innerText = proteinTotal;
  document.getElementById("calorieTotal").innerText = calorieTotal;

  // Progress bar โปรตีน
  document.getElementById("proteinBar").style.width =
    Math.min((proteinTotal / PROTEIN_GOAL) * 100, 100) + "%";

  // Progress bar แคล
  document.getElementById("calorieBar").style.width =
    Math.min((calorieTotal / CALORIE_LIMIT) * 100, 100) + "%";

  // ข้อความโปรตีน
  const proteinLeft = PROTEIN_GOAL - proteinTotal;

  if (proteinLeft > 0) {
    document.getElementById("proteinStatus").innerText =
      `🟠 เหลืออีก ${proteinLeft} g ถึงขั้นต่ำ`;
  } else {
    document.getElementById("proteinStatus").innerText =
      "🟢 ถึงเป้าหมายโปรตีนแล้ว!";
  }

  // ข้อความแคล
  const calorieLeft = CALORIE_LIMIT - calorieTotal;

  if (calorieLeft >= 0) {
    document.getElementById("calorieStatus").innerText =
      `🟢 เหลือกินได้อีก ${calorieLeft} kcal`;
  } else {
    document.getElementById("calorieStatus").innerText =
      `🔴 เกินมา ${Math.abs(calorieLeft)} kcal`;
  }
}

// =======================
// ล้างข้อมูลเฉพาะวันที่เลือก
// =======================
function resetToday() {

  if (!confirm("ล้างข้อมูลของวันนี้ใช่ไหม?")) return;

  foods = foods.filter(item => item.date !== dateInput.value);

  localStorage.setItem("foods", JSON.stringify(foods));

  loadDay(dateInput.value);

  document.getElementById("monthlySummary").innerHTML = "";
}

// =======================
// สรุปรายเดือน
// =======================
function showMonthlySummary() {

  const month = dateInput.value.slice(0, 7);
  
  const monthName = new Date(month + "-01").toLocaleDateString("th-TH", {
  month: "long",
  year: "numeric"
});


  const monthFoods = foods.filter(item =>
    item.date && item.date.startsWith(month)
  );

  const totalCal = monthFoods.reduce((sum, item) => sum + item.calorie, 0);
  const totalProtein = monthFoods.reduce((sum, item) => sum + item.protein, 0);

  const days = new Set(monthFoods.map(item => item.date)).size;

  const avgCal = days ? Math.round(totalCal / days) : 0;
  const avgProtein = days ? (totalProtein / days).toFixed(1) : 0;

  // นับจำนวนวันตามเป้า
  let perfectDays = 0;
  let proteinGoalDays = 0;
  let calorieGoalDays = 0;

  const dailySummary = {};

  monthFoods.forEach(item => {
    if (!dailySummary[item.date]) {
      dailySummary[item.date] = { cal: 0, protein: 0 };
    }

    dailySummary[item.date].cal += item.calorie;
    dailySummary[item.date].protein += item.protein;
  });

  Object.values(dailySummary).forEach(day => {
    if (day.protein >= PROTEIN_GOAL) proteinGoalDays++;
    if (day.cal <= CALORIE_LIMIT) calorieGoalDays++;

    if (day.protein >= PROTEIN_GOAL && day.cal <= CALORIE_LIMIT) {
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

function toggleMonthlySummary() {
  const summary = document.getElementById("monthlySummary");
  const arrow = document.getElementById("summaryArrow");

  if (summary.style.display === "none") {
    showMonthlySummary();      // สร้างข้อมูลก่อน
    summary.style.display = "block";
    arrow.textContent = "▲";
  } else {
    summary.style.display = "none";
    arrow.textContent = "▼";
  }
}


// =======================
// ส่งออกข้อมูลเดือนที่เลือก
// =======================
function exportMonthData() {

  const month = dateInput.value.slice(0, 7); // เช่น 2026-09

  const monthFoods = foods.filter(item =>
    item.date && item.date.startsWith(month)
  );

  if (monthFoods.length === 0) {
    alert("📭 เดือนนี้ยังไม่มีข้อมูลให้ส่งออก");
    return;
  }

  const backup = {
    app: "Mook Fit Tracker",
    version: "3.1",
    month: month,
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

  alert(`✅ ส่งออกข้อมูลเดือน ${month} สำเร็จ!\n🍽️ ${monthFoods.length} รายการ`);
}