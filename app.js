const nameInput = document.getElementById("nameInput");
const amountInput = document.getElementById("amountInput");
const categoryInput = document.getElementById("categoryInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("expenseList");
const filter = document.getElementById("filter");
const totalEl = document.getElementById("totalAmount");
const todayEl = document.getElementById("todayTotal");
const monthEl = document.getElementById("monthTotal");
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function save(){
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function render(){
  list.innerHTML="";
  let total=0, today=0, month=0;

  const todayDate = new Date().toISOString().split("T")[0];
  const monthNow = new Date().getMonth();

  const visible = expenses.filter(e =>
    filter.value === "all" || e.category === filter.value
  );

  visible.slice().reverse().forEach(e=>{
    total+=e.amount;
    if(e.date===todayDate) today+=e.amount;
    if(new Date(e.date).getMonth()===monthNow) month+=e.amount;

    const li=document.createElement("li");
    li.innerHTML=`
      <div class="top">
        <strong>${e.name} — €${e.amount.toFixed(2)}</strong>
        <div>
          <span class="category ${e.category}">${e.category}</span>
          <button>❌</button>
        </div>
      </div>
      <div class="meta">${e.date}</div>
    `;
    li.querySelector("button").onclick=()=>deleteExpense(e.id);
    list.appendChild(li);
  });

  totalEl.textContent=total.toFixed(2);
  todayEl.textContent=today.toFixed(2);
  monthEl.textContent=month.toFixed(2);

  drawChart();
  save();
}

function addExpense(){
  const name=nameInput.value.trim();
  const amount=parseFloat(amountInput.value);
  if(!name || isNaN(amount)||amount<=0) return;

  expenses.push({
    id:Date.now(),
    name,
    amount,
    category:categoryInput.value,
    date:new Date().toISOString().split("T")[0]
  });

  nameInput.value="";
  amountInput.value="";
  render();
}

function deleteExpense(id){
  expenses=expenses.filter(e=>e.id!==id);
  render();
}

function drawChart(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const totals={food:0,transport:0,entertainment:0,shopping:0,other:0};

  expenses.forEach(e=>totals[e.category]+=e.amount);

  const values=Object.values(totals);
  const max=Math.max(...values,1);
  const keys=Object.keys(totals);
  const width=canvas.width/keys.length;

  keys.forEach((k,i)=>{
    const h=(totals[k]/max)*100;
    ctx.fillStyle=getColor(k);
    ctx.fillRect(i*width+10,120-h,width-20,h);
  });
}

function getColor(cat){
  return {
    food:"#2a9d8f",
    transport:"#e76f51",
    entertainment:"#9b5de5",
    shopping:"#f4a261",
    other:"#6c757d"
  }[cat];
}

addBtn.onclick=addExpense;
filter.onchange=render;
amountInput.addEventListener("keydown",e=>{
  if(e.key==="Enter") addExpense();
});

render();