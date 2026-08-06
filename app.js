const officialCourses = [
    {name: "MTS-102", id: "mathematics", topics: ["Futa past questions","Functions of real variables", "Graphs of functions of real variables", "Limits and continuity of functions of real variables", "Techniques of differentiation","Extreme curve sketching","Integration"]},
    {name: "MTS-104", id: "math", topics: ["Futa past questions","Introduction to Vectors", "Application of Vectors", "The Geometry of a Circle", "Conic Sections","Dynamics 1","Dynamics 2"]},
    {name: "GNS-102", id: "English", topics: ["Futa past questions","Reading and Reading Comprehension", "Structuring effective sentences", "Punctuation and capitalisation", "Summary and critical review writing","Paragraphing","Structuring your essay","Document design"]},
    {name: "CHE-102", id: "chemistry", topics: ["Futa past questions","Manual tutorial questions","Historic background to organic chemistry","Organic compounds purification and qualitative analysis","Determination of structures of organic compounds", "Electronic Theory in Organic Chemistry", "Hydrocarbons", "Organic functional groups","Periodicity of elements"]},
    {name: "PHY-102", id: "physics", topics: ["Futa past questions","Manual Practice questions", "Electrostatics, electric field and potential", "Current electricity", "Magnetic field and magnetic induction", "Electromagnetic waves and applications","Applied physics"]},
    {name: "GST-112", id: "culture", topics: ["Futa past questions","History and its Sources", "Timelines or Periods in History", "Nigerian History and its Sources", "Culture and Primitive Technology", "Culture and its Components", "The Role of Culture in Development", "Culture Language and Socialisation", "Language Culture and Socialisation", "Slavery, Colonialism and the Spread of Christianity and Islam in Nigeria", "Socio-Political and Cultural Developments in Nigeria", "Evolution of Nigeria as a Political Unit", "Nigeria's Colonial Experience: The Early Years", "Norms and Values in the Nigerian Society", "Social Vices", "Nigerian Citizenship and Obligations"]},
    {name: "MEE-102", id: "workshop", topics: ["Fitting", "Automobile", "Refrigeration and Air conditioning", "Machining","Welding"]},
    {name: "CHE-104", id: "practical", topics: ["Futa past questions"]},
    {name: "FCPE-102", id: "engineer", topics: ["Futa past questions","Historical development of modern computing and it's role in engineering", "Computing in engineering", "From idea to market", "Introduction to Engineering and Smart Systems"]}
];
let currentUser = null;
let selectedExamCourse = null;
let selectedExamMode = null;
let selectedTopics = [];

// --- ✅ KATEX RENDER HELPER ---
function renderMath() {
    if (window.renderMathInElement) {
        renderMathInElement(document.body, {
            delimiters: [
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError: false
        });
    }
}

// --- STORAGE & UTILITY FUNCTIONS ---
function safeSave(key, valueObj) {
    try { localStorage.setItem(key, JSON.stringify(valueObj)); return true; }
    catch (err) { alert("⚠️ Storage FULL! Clear old history."); return false; }
}
function checkImageSize(input) {
    const notice = document.getElementById("sizeNotice");
    if(input.files[0] && input.files[0].size > 512000) {
        notice.textContent = "❌ Image too large! Max 500KB.";
        notice.style.display = "block";
        input.value = "";
    } else notice.style.display = "none";
}
function compressImage(file, maxWidth=120, quality=0.6, callback) {
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement("canvas");
            [c.width, c.height] = [maxWidth, maxWidth];
            c.getContext("2d").drawImage(img,0,0,maxWidth,maxWidth);
            callback(c.toDataURL("image/jpeg", quality));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- BACKGROUND SLIDESHOWS ---
function startAuthSlideshow() {
    const s = document.querySelectorAll(".auth-slide");
    let i=0; setInterval(()=>{
        s.forEach(x=>x.classList.remove("active"));
        i=(i+1)%s.length; s[i].classList.add("active");
    },8000);
}
function startDashSlideshow() {
    const s = document.querySelectorAll(".dash-slide");
    let i=0; setInterval(()=>{
        s.forEach(x=>x.classList.remove("active"));
        i=(i+1)%s.length; s[i].classList.add("active");
    },8000);
}

function togglePassword(id){const e=document.getElementById(id);e.type=e.type==="password"?"text":"password";}
function showTab(n){
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    event.target.classList.add("active");
    document.querySelectorAll(".auth-card").forEach(c=>c.classList.remove("active-tab"));
    document.getElementById(n+"Tab").classList.add("active-tab");
}
function getCourseObj(name){return officialCourses.find(c=>c.name.toLowerCase()===name.trim().toLowerCase());}

// --- 🆕 UPDATED REGISTER FUNCTION FOR MULTIPLE COURSES ---
function signupUser() {
    const matric = document.getElementById("matric").value.trim();
    const pass = document.getElementById("password").value;
    const users = JSON.parse(localStorage.getItem("cbtalluser")||"[]");
    if(users.find(u=>u.matric===matric)) return alert("❌ Matric already registered!");

    // Get ALL checked courses
    const selectedCourses = Array.from(document.querySelectorAll('.course-checkbox:checked'))
                                 .map(cb => cb.value);
    const selected = selectedCourses.map(n=>getCourseObj(n)).filter(Boolean);
    if(!selected.length) return alert("⚠️ Tick at least one course you are offering!");

    const pic = document.getElementById("profilePic").files[0];
    if(!pic || pic.size>512000) return alert("⚠️ Upload image under 500KB!");

    compressImage(pic,110,0.55, smallPic=>{
        users.push({
            surname: document.getElementById("surname").value.trim(),
            firstname: document.getElementById("firstname").value.trim(),
            matric, password: pass,
            secQuestion: document.getElementById("secQuestion").value,
            secAnswer: document.getElementById("secAnswer").value.trim().toLowerCase(),
            department: document.getElementById("department").value.trim(),
            school: document.getElementById("school").value.trim(),
            profilePic: smallPic, courses: selected, exams: []
        });
        safeSave("cbtalluser", users);
        alert("✅ Account created!"); showTab("login");
    });
}

function loginUser() {
    const matric = document.getElementById("loginMatric").value.trim();
    const pass = document.getElementById("loginPass").value;
    const users = JSON.parse(localStorage.getItem("cbtalluser")||"[]");
    const found = users.find(u=>u.matric===matric && u.password===pass);
    if(!found) return alert("❌ Invalid login details!");
    currentUser = found;
    safeSave("cbtActive", {matric, loggedIn:true});
    loadDashboard();
}

function checkSecurity(){
    const m=document.getElementById("resetMatric").value.trim();
    const u=JSON.parse(localStorage.getItem("cbtalluser")||"[]").find(x=>x.matric===m);
    if(!u)return alert("User not found!");
    document.getElementById("qDisplay").textContent={color:"Favorite Color",food:"Favorite Food",town:"Birth Town",pet:"First Pet"}[u.secQuestion];
    document.getElementById("secArea").style.display="block";
    document.getElementById("resetBtn").onclick=()=>{
        if(document.getElementById("resetAnswer").value.trim().toLowerCase()!==u.secAnswer)return alert("Wrong security answer!");
        const p=document.getElementById("newPass").value;if(!p)return alert("Enter new password!");
        const a=JSON.parse(localStorage.getItem("cbtalluser"));
        a[a.findIndex(x=>x.matric===u.matric)].password=p;
        safeSave("cbtalluser",a);alert("✅ Password reset successful!");showTab("login");
    };
}

// --- 🆕 NEW TOPIC FUNCTIONS ---
function closeModeSelect(){document.getElementById("modeSelectModal").classList.remove("show");}
function startExam(mode){
    selectedExamMode = mode;
    closeModeSelect();
    showTopicSelection();
}

function showTopicSelection(){
    const course = officialCourses.find(c=>c.id === selectedExamCourse.id);
    if(!course) return alert("Course not found!");
    
    document.getElementById("topicCourseName").textContent = course.name;
    const container = document.getElementById("topicListContainer");
    container.innerHTML = "";
    selectedTopics = [];

    // Add "All Topics" option
    const allOpt = document.createElement("label");
    allOpt.className = "option";
    allOpt.innerHTML = `<input type="checkbox" value="ALL" onchange="toggleAllTopics(this)"> <strong>📚 All Topics</strong>`;
    container.appendChild(allOpt);

    // Add individual topics
    course.topics.forEach(topic=>{
        const opt = document.createElement("label");
        opt.className = "option";
        opt.innerHTML = `<input type="checkbox" value="${topic}" class="topic-check"> ${topic}`;
        container.appendChild(opt);
    });

    document.getElementById("topicSelectModal").classList.add("show");
}

function toggleAllTopics(cb){
    document.querySelectorAll(".topic-check").forEach(check=>check.checked = cb.checked);
}

function closeTopicSelect(){
    document.getElementById("topicSelectModal").classList.remove("show");
    document.getElementById("modeSelectModal").classList.add("show");
}

function confirmTopicSelection(){
    selectedTopics = Array.from(document.querySelectorAll(".topic-check:checked")).map(c=>c.value);
    document.getElementById("topicSelectModal").classList.remove("show");

    const s={short:{q:20,t:900},medium:{q:30,t:1200},long:{q:50,t:2100},instant:{q:30,t:0}}[selectedExamMode];
    localStorage.setItem("currentExam",JSON.stringify({
        subId:selectedExamCourse.id,
        subName:selectedExamCourse.name,
        mode:selectedExamMode,
        topics:selectedTopics,
        qCount:s.q,
        time:s.t
    }));
    window.location.href="exam.html";
}

// --- DASHBOARD LOAD ---
function loadDashboard(){
    document.getElementById("authSection").style.display="none";
    document.getElementById("dashboard").style.display="block";
    document.querySelector(".auth-slideshow").style.display="none";
    document.querySelector(".dash-slideshow").style.display="block";
    startDashSlideshow();

    document.getElementById("dashPic").src=document.getElementById("menuPic").src=currentUser.profilePic;
    document.getElementById("dashFirstname").textContent=document.getElementById("menuFirstname").textContent=currentUser.firstname;
    document.getElementById("dashMatric").textContent=document.getElementById("menuMatric").textContent=currentUser.matric;
    document.getElementById("menuDept").textContent="Dept: "+currentUser.department;
    document.getElementById("menuSchool").textContent="School: "+currentUser.school;
    const h=new Date().getHours();
    document.getElementById("greeting").textContent=(h<12?"GOOD MORNING":h<17?"GOOD AFTERNOON":"GOOD EVENING")+", "+currentUser.firstname+" 🧠";
    
    updateCourseLists(); renderSubjects(); updateStats(); renderHistory(); drawChart();
    renderMath(); // ✅ Render any math on dashboard load
}
function updateCourseLists(){const s=document.getElementById("removeCourseList");s.innerHTML="";currentUser.courses.forEach(c=>{const o=document.createElement("option");[o.value,o.textContent]=[c.id,c.name];s.appendChild(o);});}
function addNewCourse(){const n=document.getElementById("newCourseName").value.trim(),c=getCourseObj(n);if(!c)return alert("Invalid course name!");if(currentUser.courses.some(x=>x.id===c.id))return alert("Course already added!");currentUser.courses.push(c);safeSaveUser();updateCourseLists();renderSubjects();document.getElementById("newCourseName").value="";}
function removeCourse(){const i=document.getElementById("removeCourseList").value;currentUser.courses=currentUser.courses.filter(c=>c.id!==i);safeSaveUser();updateCourseLists();renderSubjects();}
function safeSaveUser(){const all=JSON.parse(localStorage.getItem("cbtalluser"));all.splice(all.findIndex(u=>u.matric===currentUser.matric),1,currentUser);localStorage.setItem("cbtalluser",JSON.stringify(all));}
function renderSubjects(){const l=document.getElementById("subjectsList");l.innerHTML="";currentUser.courses.forEach(c=>{const b=document.createElement("button");b.className="subject-btn";b.textContent=c.name;b.onclick=()=>{selectedExamCourse=c;document.getElementById("modeSelectModal").classList.add("show");};l.appendChild(b);});}
function updateStats(){
    const s=currentUser.exams.map(e=>e.score),a=s.length?Math.round(s.reduce((x,y)=>x+y,0)/s.length):0;
    document.getElementById("avgScore").textContent=a+"%";
    document.getElementById("iqGrade").textContent=a>=40?"Genius 🧠":a>=30?"Above Average":a>=25?"Good":a>=15?"Fair":"Needs Improvement";
    const t=currentUser.exams.filter(e=>e.timeLeft>0).length;
    document.getElementById("timeMgmt").textContent=currentUser.exams.length?Math.round(t/currentUser.exams.length*100)+"%":"0%";
}
function drawChart(){const c=document.getElementById("performanceChart");if(!c||!window.Chart)return;if(window.perfChart)window.perfChart.destroy();new Chart(c,{type:"line",data:{labels:currentUser.exams.map(e=>new Date(e.date).toLocaleDateString()),datasets:[{label:"Score %",data:currentUser.exams.map(e=>Math.round(e.score/30*100)),borderColor:"#2563eb",backgroundColor:"rgba(37,99,235,.1)",fill:true}]}});}

// --- ✅ FULLY WORKING HISTORY + REVIEW / CORRECTION ---
function renderHistory(){
    const h=document.getElementById("examHistory");h.innerHTML="";
    [...currentUser.exams].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(-15).forEach((e,i)=>{
        const p=Math.round(e.score/30*100);
        h.innerHTML+=`
        <div class="history-card">
            <div>
                <h4>${e.subject} — ${e.date}</h4>
                <p>Score: ${e.score}/${e.questions.length} (${p}%) | Time Left: ${e.timeLeft} mins</p>
            </div>
            <button onclick="viewCorrections(${currentUser.exams.indexOf(e)})">📖 View Corrections</button>
        </div>`;
    });
    renderMath(); // ✅ Render math in history list
}

// --- ✅ COMPLETE CORRECTION DISPLAY ---
function viewCorrections(examIndex){
    const exam = currentUser.exams[examIndex];
    if(!exam || !exam.questions) return alert("❌ No review data available for this exam!");

    let reviewHTML = `
    <div style="background:var(--card);padding:1.5rem;border-radius:12px;margin-top:1rem;">
        <h3 style="color:var(--primary);margin-bottom:1rem;">📚 ${exam.subject} — EXAM REVIEW</h3>
        <p style="margin-bottom:1rem;"><strong>Score:</strong> ${exam.score}/${exam.questions.length} | <strong>Date:</strong> ${exam.date}</p>
    `;

    exam.questions.forEach((q, idx) => {
        const picked = exam.userAnswers[idx] || "Not Answered";
        const correct = q.answer;
        const isRight = picked === correct;

        reviewHTML += `
        <div style="padding:1rem;margin:0.8rem 0;border-radius:8px;border:1px solid var(--border);background:${isRight?"rgba(22,163,74,0.05)":"rgba(220,38,38,0.05)"};">
            <p><strong>Q${idx+1}:</strong> ${q.question}</p>
            <div style="margin:0.5rem 0;">
                ${q.options.map(opt=>`
                <div style="padding:0.4rem;margin:0.2rem 0;${opt[0]===correct?"background:rgba(22,163,74,0.1);border-left:3px solid var(--success);":""}${opt[0]===picked && !isRight?"background:rgba(220,38,38,0.1);border-left:3px solid var(--danger);":""}">
                    ${opt} ${opt[0]===correct?"✅ CORRECT":""} ${opt[0]===picked && !isRight?"❌ YOUR ANSWER":""}
                </div>`).join("")}
            </div>
            <p><strong>Your Answer:</strong> ${picked} | <strong>Correct Answer:</strong> ${correct}</p>
            <p style="margin-top:0.5rem;"><strong>📌 Explanation:</strong> ${q.explanation}</p>
        </div>`;
    });

    reviewHTML += `<button onclick="location.reload()" style="margin-top:1rem;">🔙 Back to History</button></div>`;
    document.getElementById("examHistory").innerHTML = reviewHTML;
    renderMath(); // ✅ Render math in review/explanations
}

function toggleMenu(){document.getElementById("sideMenu").classList.toggle("open");document.getElementById("menuOverlay").classList.toggle("show");}
function confirmLogout(){if(confirm("⚠️ Are you sure you want to logout?")){currentUser=null;localStorage.removeItem("cbtActive");location.reload();}}

window.addEventListener("DOMContentLoaded",()=>{
    startAuthSlideshow();
    const saved = JSON.parse(localStorage.getItem("cbtActive")||"null");
    if(saved) currentUser = JSON.parse(localStorage.getItem("cbtalluser")||"[]").find(u=>u.matric===saved.matric);
    if(currentUser) loadDashboard();
    renderMath(); // ✅ Initial render on page load
});
