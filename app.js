// app.js
let chartInstance = null;

// เรียกคืนข้อมูลเมื่อเปิดหน้าเว็บ
window.onload = function() {
    const savedData = localStorage.getItem('userHealthData');
    if (savedData) {
        const data = JSON.parse(savedData);
        // ตรวจสอบว่ามี Element ก่อนค่อยใส่ค่า (กัน Error ในหน้าอื่น)
        if(document.getElementById('gender')) document.getElementById('gender').value = data.gender;
        if(document.getElementById('age')) document.getElementById('age').value = data.age;
        if(document.getElementById('weight')) document.getElementById('weight').value = data.weight;
        if(document.getElementById('height')) document.getElementById('height').value = data.height;
        if(document.getElementById('activity')) document.getElementById('activity').value = data.activity;
        
        calculate(); // คำนวณแสดงผลทันที
    }
};

// ฟังก์ชันล้างข้อมูล (ปุ่มรีเซ็ต)
function resetForm() {
    localStorage.removeItem('userHealthData');
    document.getElementById('age').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('height').value = '';
    document.getElementById('result').style.display = 'none';
    if(chartInstance){
        chartInstance.destroy();
        chartInstance = null;
    }
    location.reload(); // รีเฟรชหน้าเพื่อให้ค่าเริ่มต้นกลับมา
}

// ฟังก์ชันคำนวณน้ำหนักที่เหมาะสม (Robinson & Miller Formula)
function calcIdealWeight(height, gender) {
  let robinson, miller;
  if (gender === "male") {
      robinson = 52 + 1.9 * ((height - 152.4) / 2.54);
      miller   = 56.2 + 1.41 * ((height - 152.4) / 2.54);
  } else {
      robinson = 49 + 1.7  * ((height - 152.4) / 2.54);
      miller   = 53.1 + 1.36 * ((height - 152.4) / 2.54);
  }
  return {
      min: Math.min(robinson, miller).toFixed(1),
      max: Math.max(robinson, miller).toFixed(1)
  };
}

function calculate() {
    const gender = document.getElementById('gender').value;
    const age = parseInt(document.getElementById('age').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const activity = parseFloat(document.getElementById('activity').value);

    if (!age || !weight || !height) return;

    // สูตร Mifflin-St Jeor
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = (gender === "male") ? bmr + 5 : bmr - 161;
    const tdee = bmr * activity;
    const hM = height / 100;
    const bmi = weight / (hM * hM);

    // บันทึกข้อมูลลง localStorage
    const dataToSave = { gender, age, weight, height, activity, tdee: tdee.toFixed(0) };
    localStorage.setItem('userHealthData', JSON.stringify(dataToSave));

    // แสดงผลบนหน้าจอ
    document.getElementById('result').style.display = 'block';
    document.getElementById('bmiVal').innerText = bmi.toFixed(2);
    document.getElementById('bmrVal').innerText = bmr.toFixed(0);
    document.getElementById('tdeeVal').innerText = tdee.toFixed(0);

    // แสดงน้ำหนักที่เหมาะสม
    const ideal = calcIdealWeight(height, gender);
    document.getElementById('idealWeight').innerHTML = 
        `น้ำหนักที่เหมาะสมของคุณคือ <b>${ideal.min} - ${ideal.max} กก.</b>`;

    // ปรับสถานะ BMI
    const bmiStatus = document.getElementById('bmiStatus');
    if(bmi < 18.5) bmiStatus.innerText = 'น้ำหนักน้อยกว่ามาตรฐาน';
    else if(bmi < 23) bmiStatus.innerText = 'ปกติ (สุขภาพดี)';
    else if(bmi < 25) bmiStatus.innerText = 'น้ำหนักเกิน';
    else if(bmi < 30) bmiStatus.innerText = 'อ้วนระดับ 1';
    else bmiStatus.innerText = 'อ้วนระดับ 2';

    // วาดกราฟใหม่โดยใช้ชุดข้อมูล 4 แท่งเหมือนเดิม
    const labels = ['BMR', 'TDEE', 'ลด -300', 'เพิ่ม +300'];
    const deficit = Math.max(0, tdee - 300);
    const surplus = tdee + 300;
    const chartData = [bmr, tdee, deficit, surplus];
    
    drawChart(labels, chartData);
}

function drawChart(labels, data) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(66,165,245,0.9)', 
                    'rgba(46,139,87,0.95)', 
                    'rgba(255,205,86,0.95)', 
                    'rgba(38,198,218,0.95)'
                ],
                borderRadius: 8,
                barThickness: 38
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
        }
    });
}

function savePNG(){
    const node = document.getElementById('capture-area');
    html2canvas(node, { backgroundColor: "#f5f7fa", scale: 2 }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `Health-Result.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}
