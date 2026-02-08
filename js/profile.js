function logout(){
    localStorage.clear();
    window.location.href = '/index.html';
}
const JWT = localStorage.getItem('JWT');

var username
var userID 

var user
var firstName
var lastName
var email
var gender
var userJoined

var roundedRatio
var totalUp
var totalDown
var totalXp
var projectNameXp
var passAndFailRatio
var totalPass
var totalFail
var myAudits


async function fetchBasicInfo() {
    if (JWT) {
        const request = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${JWT}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `{
                    user {
                        id
                        login
                        updatedAt
                    }
                }`
            })
        });

        const requestData = await request.json();

        userID = requestData.data.user[0]?.id; 
        username = requestData.data.user[0]?.login;    
        userJoined = requestData.data.user[0]?.updatedAt;
    

        if (username && userID) {

            document.getElementById('username').textContent = username;  


            
        } else {
            console.error('User data not found.');
        }

    } else {
        logout();
    }
}


async function fetchUserData() {
    if (username === ''){
        console.error("Username does not exists");
        window.location.href = "/index.html"
        return;
    }
    if (userID === undefined || userID === null || isNaN(userID)){
        console.error("User ID is empty");
        window.location.href = "/index.html"
        return;
    }

    if (JWT){
        const request = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${JWT}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `{
                    userInfo: user (
                    where: {
                    id: { _eq: ${userID}}}
                    ){
                        attrs
                        createdAt
                    }
                    
                    
                    
                    userAuditRatio: transaction (
                    where: { 
                    type: { _in: ["up", "down"]}
                    }
                    ){
                    type
                    amount
                        object{
                        name
                        }
                    }

                    

                    
                    projectPiscineReward: transaction (
                    where: {
                    type: { _eq: "xp" },
                    _or: [
                    {object: {type: { _eq: "project" } }},
                    {object: {type: { _ilike: "%piscine%" } }}
                    ]
                    })
                    {
                    amount
                    object {
                    name
                    }}
                    
                    examReward: transaction(
                    distinct_on: objectId
                    order_by: [{ objectId: asc }, { amount: desc }]
                    where: {
                    type: { _eq: "xp" },
		            createdAt: {_gte: "${userJoined}"},
                    object: {
                    parents: {
                    parent: {
                    type: { _eq: "exam" }
            
                    }
                    }
                    }
                    }
                    ) {
                    amount
                    object {
                    name
                    }
                    }

                    projectPassFail : result (
                    where: {
                    isLast: {_eq: true},
                    object: {type: {_eq: "project"}}
                    }
                    ) {
                    objectId
                    grade
                    object{
                    name
                    }
                    }

                    myAudits : audit (
                    distinct_on: groupId
                    where: {
                    auditorId: {_eq: ${userID}}
                    closureType: { _neq: unused }
                    group: {
                    object: {
                    type: {_eq: "project"}}
                    }
                    }
                    ) {
                    closureType
                    group {
                    object {
                    name
                    }
                    captain {
                    login
                    }
                    }
                    }

                }`
            })
        });
        console.log(userJoined)
    const requestData = await request.json();
    console.log(requestData)
    user = requestData.data.userInfo[0]?.attrs;
    const gradeAudit = requestData.data.userAuditRatio;
    const projectPiscineReward = requestData.data.projectPiscineReward;
    const examReward = requestData.data.examReward;
    const passFail = requestData.data.projectPassFail;
    myAudits = requestData.data.myAudits;

    // console.log(gradeAudit)
    
    // basic user information
    firstName = user.firstName;
    lastName = user.lastName;
    email = user.email;
    gender = user.genders;

    
    // /css/profile.css

    
// calculainng audit ratio

const upTransactions = [];
const downTransactions = [];

for (const tx of gradeAudit) {
  if (tx.type === "up") {
    upTransactions.push(tx.amount);
  } else if (tx.type === "down") {
    downTransactions.push(tx.amount);
  }
}

// sum the values
 totalUp = upTransactions.reduce((a, b) => a + b, 0);
 totalDown = downTransactions.reduce((a, b) => a + b, 0);
totalUp = totalUp / 1_000_000;
totalDown = totalDown / 1_000_000;

if (totalUp < 1 ){
    totalUp = totalUp.toFixed(3);
}else{
    totalUp = totalUp.toFixed(2)
}

if (totalDown < 1 ){
    totalDown = totalDown.toFixed(3);
}else{
    totalDown = totalDown.toFixed(2)
}

const ratio = totalUp/totalDown;

roundedRatio = ratio.toFixed(1);

console.log("ratio: " +roundedRatio)
console.log(totalDown)



// total xp, xp earned by project

totalXp = 0;
projectNameXp = projectPiscineReward.map(item => ({
    name: item.object.name,
    amount: item.amount
}));

for ( const tx of projectPiscineReward){
    totalXp += tx.amount
}

for ( const tx of examReward){
    totalXp += tx.amount
}

// convert to kB 
totalXp = (totalXp/ 1_000).toFixed(1)


console.log(totalXp)
console.log(projectNameXp)


const pass = [];
const fail = [];

for (const tx of passFail) {
  if (tx.grade >= 1) {
    pass.push(tx.grade);
  } else {
    fail.push(tx.grade);
  }
}

totalPass = pass.reduce((a, b) => a + b, 0);
totalFail = fail.reduce((a, b) => a + b, 0);
// totalPass = totalPass / 1_000_000;
// totalFail = totalFail / 1_000_000;
console.log(totalPass + totalFail)
// if (totalPass < 1 ){
//     totalPass = totalPass.toFixed(3);
// }else{
//     totalPass = totalPass.toFixed(2)
// }

// if (totalFail < 1 ){
//     totalFail = totalFail.toFixed(3);
// }else{
//     totalFail = totalFail.toFixed(2)
// }

const passFailRatio = totalPass/totalFail;

passAndFailRatio = passFailRatio.toFixed(1);

console.log(totalPass)
console.log(totalFail)
console.log(passAndFailRatio)
console.log(userID)


    } else {
        logout();
    }

    document.getElementById('user-name').textContent = firstName + ' ' + lastName
    document.getElementById('user-gender').textContent = gender
    document.getElementById('user-email').textContent = email
    // document.getElementById('ratioUp').textContent = totalUp + " MB"
    // document.getElementById('ratioDown').textContent = totalDown + " MB"
    document.getElementById('totalRatio').textContent = roundedRatio 
    document.getElementById('totalXp').textContent = totalXp + " Kb"
}

(async () => {
    await fetchBasicInfo();     
    await fetchUserData();
    await createPassFailDonutChart();
    await createXpByProject();
    await renderAudits();
})();




function createPassFailDonutChart() {
  const total = totalPass + totalFail;
  const failPercent = (totalFail / total) * 100;
  const ratio = totalFail === 0 ? "∞" : (totalPass / totalFail).toFixed(2);

  console.log(total)
  console.log(ratio)

  

  // SVG namespace
  const SVG_NS = "http://www.w3.org/2000/svg";

  // Clear container
  const container = document.getElementById("passfail");
  container.innerHTML = "";

  // Create SVG element
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 42 42");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Pass Fail Donut Chart");
  svg.style.width = "200px";
  svg.style.height = "200px";

  // Background circle
  const bgCircle = document.createElementNS(SVG_NS, "circle");
  bgCircle.setAttribute("r", "15.9155");
  bgCircle.setAttribute("cx", "21");
  bgCircle.setAttribute("cy", "21");
  bgCircle.setAttribute("fill", "transparent");
  bgCircle.setAttribute("stroke", "green");
  bgCircle.setAttribute("stroke-width", "10");
  svg.appendChild(bgCircle);


  // Fail slice (red, counterclockwise)
  const failCircle = document.createElementNS(SVG_NS, "circle");
  failCircle.setAttribute("r", "15.9155");
  failCircle.setAttribute("cx", "21");
  failCircle.setAttribute("cy", "21");
  failCircle.setAttribute("fill", "transparent");
  failCircle.setAttribute("stroke", "#bb0606ff");
  failCircle.setAttribute("stroke-width", "10");
  failCircle.setAttribute("stroke-dasharray", `${failPercent} ${100 - failPercent}`);
//   failCircle.setAttribute("stroke-dashoffset", "-25");
  failCircle.setAttribute("transform", "rotate(-90 21 21)");
  svg.appendChild(failCircle);

  // Text in the center
  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("x", "21");
  text.setAttribute("y", "21");
  text.setAttribute("class", "donut-text");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.style.fontFamily = "Arial, sans-serif";
  text.style.fontWeight = "bold";
  text.style.fontSize = "6px";
  text.style.fill = "#ffffffff";
  text.textContent = ratio;
  svg.appendChild(text);

  container.appendChild(svg);
}

function createXpByProject() {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const container = document.getElementById("barChart");
  container.innerHTML = "";

  const barWidth = 40;
  const gap = 20;
  const padding = 90;
  const height = 500;
  const numBars = projectNameXp.length;
  const width = padding * 2 + numBars * (barWidth + gap);
  
  const filteredProjects = projectNameXp.filter(
  p => p.amount >= 0 && !p.name.toLowerCase().includes("piscine")
);

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  container.appendChild(svg);

  const maxAmount = Math.max(...filteredProjects.map(d => d.amount)) || 1;

  /* Y AXIS */
  const yAxis = document.createElementNS(SVG_NS, "line");
  yAxis.setAttribute("x1", padding);
  yAxis.setAttribute("y1", padding);
  yAxis.setAttribute("x2", padding);
  yAxis.setAttribute("y2", height - padding);
  yAxis.setAttribute("stroke", "#fff");
  yAxis.setAttribute("stroke-width", "2");
  svg.appendChild(yAxis);

  /* X AXIS */
  const xAxis = document.createElementNS(SVG_NS, "line");
  xAxis.setAttribute("x1", padding);
  xAxis.setAttribute("y1", height - padding);
  xAxis.setAttribute("x2", width - padding);
  xAxis.setAttribute("y2", height - padding);
  xAxis.setAttribute("stroke", "#fff");
  xAxis.setAttribute("stroke-width", "2");
  svg.appendChild(xAxis);

  /* Y TICKS */
  const numTicks = 10;
  for (let i = 0; i <= numTicks; i++) {
    const y = height - padding - (i * (height - 2 * padding)) / numTicks;
    const value = Math.round((i * maxAmount) / numTicks);

    const tick = document.createElementNS(SVG_NS, "line");
    tick.setAttribute("x1", padding - 6);
    tick.setAttribute("y1", y);
    tick.setAttribute("x2", padding);
    tick.setAttribute("y2", y);
    tick.setAttribute("stroke", "#fff");
    svg.appendChild(tick);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("x", padding - 10);
    label.setAttribute("y", y + 4);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("font-size", "12px");
    label.setAttribute("fill", "#fff");
    label.textContent = value;
    svg.appendChild(label);
  }

  /* BARS */
  filteredProjects.forEach((item, index) => {
    const barHeight =
      (item.amount / maxAmount) * (height - 2 * padding);
    const x = padding + index * (barWidth + gap);
    const y = height - padding - barHeight;

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", "#3498db");
    svg.appendChild(rect);

    /* VALUE ABOVE BAR */
    const amountText = document.createElementNS(SVG_NS, "text");
    amountText.setAttribute("x", x + barWidth / 2);
    amountText.setAttribute("y", y - 6);
    amountText.setAttribute("text-anchor", "middle");
    amountText.setAttribute("font-size", "10px");
    amountText.setAttribute("fill", "#fff");
    amountText.textContent = item.amount;
    svg.appendChild(amountText);

    /* PROJECT NAME */
    const labelX = x + barWidth / 2;
const labelY = height - padding + 50;

const nameText = document.createElementNS(SVG_NS, "text");
nameText.setAttribute("x", labelX);
nameText.setAttribute("y", labelY);
nameText.setAttribute("text-anchor", "end");
nameText.setAttribute("font-size", "11px");
nameText.setAttribute("fill", "#fff");
nameText.setAttribute(
  "transform",
  `rotate(-45 ${labelX} ${labelY})`
);
wrapSvgText(nameText, item.name, 10); // adjust char limit as needed
    svg.appendChild(nameText)
  });
}





function wrapSvgText(textEl, text, maxCharsPerLine = 10) {
  // Split on dash or spaces
  const words = text.split(/[-\s]/);  
  let line = "";
  let lines = [];

  words.forEach(word => {
    const testLine = line ? line + "-" + word : word; // preserve dash
    if (testLine.length > maxCharsPerLine) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);

  lines.forEach((l, i) => {
    const tspan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan"
    );
    tspan.setAttribute("x", textEl.getAttribute("x"));
    tspan.setAttribute("dy", i === 0 ? "0" : "1.2em");
    tspan.textContent = l;
    textEl.appendChild(tspan);
  });
}

async function auditsDisplay(){
    const container = document.getElementById('audits')
    console.log(myAudits)
    myAudits.forEach(audit => {
    const audits= `
    <div class="audit-info">
    <div class="top-line">
    <p class="captain">${audit.group.captain.login}</p>
    <p class="closureType">${audit.closureType}</p>
    </div>
    <p class="project">${audit.group.object.name}</p>
    </div>
    `;
    container.innerHTML += audits;
    })
    
}

let currentPage = 1;    // Start at page 1
const auditsPerPage = 10; 
let totalAudits = [];    // Store the fetched audits

async function renderAudits() {
    const auditList = document.getElementById('audit-list');
    const startIndex = (currentPage - 1) * auditsPerPage;
    const endIndex = startIndex + auditsPerPage;
    const auditsToDisplay = myAudits.slice(startIndex, endIndex);

    // Clear the current list
    auditList.innerHTML = '';

    // Render the selected page audits
    auditsToDisplay.forEach(audit => {
        const auditElement = document.createElement('div');
        auditElement.classList.add('audit-info');
        auditElement.innerHTML = `
            <div class="top-line">
                <p class="closureType">${audit.closureType}</p>
                <p class="captain">${audit.group.captain.login}</p>
            </div>
            <p class="project">${audit.group.object.name}</p>
        `;
        auditList.appendChild(auditElement);
    });

    // Update page info
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage}`;

    // Disable/Enable buttons based on the current page
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage * auditsPerPage >= myAudits.length;
}

function changePage(direction) {
    // Calculate the new page number
    currentPage += direction;

    // Render the audits for the new page
    renderAudits();
}

// Initial rendering
// renderAudits();

