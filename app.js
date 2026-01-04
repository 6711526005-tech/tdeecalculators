// app.js
let chartInstance = null;

// ❗ ฟังก์ชันคำนวณน้ำหนักที่เหมาะสม (เพิ่ม)
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

function calculate(){
  // อ่านค่า
  const gender = document.getElementById('gender').value;
  const age = parseInt(document.getElementById('age').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseFloat(document.getElementById('height').value);
  const activity = parseFloat(document.getElementById('activity').value);

  if(!age || !weight || !height){
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  // BMI
  const hM = height / 100;
  const bmi = weight / (hM * hM);
  let bmiStatus = '';
  if(bmi < 18.5) bmiStatus = 'น้ำหนักน้อยกว่ามาตรฐาน';
  else if(bmi < 23) bmiStatus = 'ปกติ (สุขภาพดี)';
  else if(bmi < 25) bmiStatus = 'น้ำหนักเกิน';
  else if(bmi < 30) bmiStatus = 'อ้วนระดับ 1';
  else bmiStatus = 'อ้วนระดับ 2';

  // BMR
  let bmr = 0;
  if(gender === 'male'){
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // TDEE
  const tdee = bmr * activity;

  // Update UI
  document.getElementById('result').style.display = 'block';
  document.getElementById('bmiVal').innerText = bmi.toFixed(2);
  document.getElementById('bmiStatus').innerText = bmiStatus;
  document.getElementById('bmrVal').innerText = bmr.toFixed(0);
  document.getElementById('tdeeVal').innerText = tdee.toFixed(0);

  // ❗ เพิ่ม Ideal Weight ในผลลัพธ์
  const ideal = calcIdealWeight(height, gender);
  document.getElementById('idealWeight').innerHTML =
    `น้ำหนักที่เหมาะสมของคุณอยู่ระหว่าง <b>${ideal.min} - ${ideal.max} กก.</b>`;

  // chart data
  const labels = ['BMR','TDEE','ลด -300','เพิ่ม +300'];
  const deficit = Math.max(0, tdee - 300);
  const surplus = tdee + 300;
  const data = [bmr, tdee, deficit, surplus];

  drawChart(labels, data);
}

function drawChart(labels, data){
  const ctx = document.getElementById('chart').getContext('2d');

  if(chartInstance){
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
    return;
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'kcal',
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
      responsive:true,
      maintainAspectRatio:false,
      scales: {
        y: { beginAtZero:true, ticks:{ stepSize:200 } }
      },
      plugins: {
        legend: { display:false },
        tooltip: { enabled:true }
      }
    }
  });
}

function savePNG(){
  const node = document.getElementById('capture-area');
  html2canvas(node, { backgroundColor: null, scale: 2 }).then((canvas) => {
    const link = document.createElement('a');
    link.download = `tdee_result_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err=>{
    alert('เกิดข้อผิดพลาดในการสร้าง PNG: '+ err);
  });
}

function resetForm(){
  document.getElementById('age').value = '';
  document.getElementById('weight').value = '';
  document.getElementById('height').value = '';
  document.getElementById('result').style.display = 'none';
  if(chartInstance){
    chartInstance.destroy();
    chartInstance = null;
  }
}
