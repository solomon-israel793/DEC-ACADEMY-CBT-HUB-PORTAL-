const officialCourses = [
    {name: "MTS-102", id: "mathematics", topics: ["Futa past questions","Functions of real variables", "Graphs of functions of real variables", "Limits and continuity of functions of real variables", "Techniques of differentiation","Extreme curve sketching","Integration"]},
    {name: "MTS-104", id: "math", topics: ["Futa past questions","Introduction to Vectors", "Application of Vectors", "The Geometry of a Circle", "Conic Sections","Dynamics 1","Dynamics 2"]},
    {name: "GNS-102", id: "English", topics: ["Futa past questions","Reading and Reading Comprehension", "Structuring effective sentences", "Punctuation and capitalisation", "Summary and critical review writing","Paragraphing","Structuring your essay","Document design"]},
    {name: "CHE-102", id: "chemistry", topics: ["Futa past questions","Manual tutorial questions","GPA Academy question bank","Historic background to organic chemistry","Organic compounds purification and qualitative analysis","Determination of structures of organic compounds", "Electronic Theory in Organic Chemistry", "Hydrocarbons", "Organic functional groups","Periodicity of elements","Valence forces; structure of solids"]},
    {name: "PHY-102", id: "physics", topics: ["Futa past questions","Manual Practice questions", "Electrostatics, electric field and potential", "Current electricity", "Magnetic field and magnetic induction", "Electromagnetic waves and applications","Applied physics"]},
    {name: "GST-112", id: "culture", topics: ["Futa past questions","History and its Sources", "Timelines or Periods in History", "Nigerian History and its Sources", "Culture and Primitive Technology", "Culture and its Components", "The Role of Culture in Development", "Culture Language and Socialisation", "Language Culture and Socialisation", "Slavery, Colonialism and the Spread of Christianity and Islam in Nigeria", "Socio-Political and Cultural Developments in Nigeria", "Evolution of Nigeria as a Political Unit", "Nigeria's Colonial Experience: The Early Years", "Norms and Values in the Nigerian Society", "Social Vices", "Nigerian Citizenship and Obligations"]},
    {name: "MEE-102", id: "workshop", topics: ["Fitting", "Automobile", "Refrigeration and Air conditioning", "Machining","Welding"]},
    {name: "CHE-104", id: "practical", topics: ["Futa past questions"]},
    {name: "FCPE-102", id: "engineer", topics: ["Futa past questions","Historical Development of Modern Computing & Its Role in Engineering", "Computing in Engineering","Computing Career Pathways in Engineering","From Idea to Market", "Introduction to Engineering and Smart Systems"]}
];

let currentUser = null;
let selectedExamCourse = null;
let selectedExamMode = null;
let selectedTopics = [];
let examTimer = null;
let examTimeLeft = 0;
let examStartTime = null;

// ==================================================
// ⏳ LOADING SCREEN CONTROLS
// ==================================================
function showLoading() {
    const el = document.getElementById('loadingScreen');
    if (el) el.classList.add('active');
}
function hideLoading() {
    const el = document.getElementById('loadingScreen');
    if (el) el.classList.remove('active');
}

// ==================================================
// ⏱️ EXAM TIMER — SHOW TIME & AUTO-SUBMIT
// ==================================================
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function startExamTimer(totalSeconds) {
    examTimeLeft = totalSeconds;
    examStartTime = Date.now();
    updateTimerDisplay();
    
    if (examTimer) clearInterval(examTimer);
    examTimer = setInterval(() => {
        examTimeLeft--;
        updateTimerDisplay();
        
        if (examTimeLeft <= 0) {
            clearInterval(examTimer);
            alert("⏰ Time's Up! Exam will be submitted automatically.");
            if (window.autoSubmitExam) window.autoSubmitExam();
        }
        
        // Warning at 2 minutes
        if (examTimeLeft === 120) {
            alert("⚠️ Only 2 minutes remaining!");
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('examTimer');
    if (timerEl) {
        timerEl.textContent = `⏱️ Time Left: ${formatTime(examTimeLeft)}`;
        // Color warnings
        if (examTimeLeft <= 120) {
            timerEl.style.color = "var(--danger)";
            timerEl.style.fontWeight = "bold";
        } else if (examTimeLeft <= 300) {
            timerEl.style.color = "orange";
        }
    }
    // Save remaining time
    localStorage.setItem("examTimeLeft", examTimeLeft);
}

function stopExamTimer() {
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }
}

// ==================================================
// ✅ KATEX RENDER — DIRECT + AUTO-RENDER COMBINED
// ==================================================
function renderAllMathIn(container) {
    if (!container) container = document.body;
    if (window.renderMathInElement) {
        try {
            renderMathInElement(container, {
                delimiters: [
                    {left: "\\(", right: "\\)", display: false},
                    {left: "\\[", right: "\\]", display: true}
                ],
                throwOnError: false
            });
            return;
        } catch (e) {}
    }
    if (window.katex) {
        const text = container.innerHTML;
        const regex = /\\\((.*?)\\\)/g;
        container.innerHTML = text.replace(regex, (match, formula) => {
            try { return katex.renderToString(formula, {throwOnError: false}); }
            catch { return match; }
        });
    }
}

// ✅ THEME SWITCH — FULLY WORKING
function initTheme() {
    const saved = localStorage.getItem("theme") || "light";
    document.documentElement.classList.toggle("dark-theme", saved === "dark");
    const themeSwitch = document.getElementById("themeSwitch");
    if (themeSwitch) themeSwitch.value = saved;
}
function toggleTheme(mode) {
    document.documentElement.classList.toggle("dark-theme", mode === "dark");
    localStorage.setItem("theme", mode);
}

// ✅ FONT SIZE RANGE SLIDER — FULLY WORKING
function changeFontSize(size) {
    document.documentElement.style.fontSize = size + "px";
    const label = document.getElementById("fontSizeLabel");
    if (label) {
        if (size <= 14) label.textContent = "Small";
        else if (size <= 17) label.textContent = "Medium";
        else label.textContent = "Large";
    }
    localStorage.setItem("fontSize", size);
}
function initFontSize() {
    const saved = localStorage.getItem("fontSize") || "16";
    const slider = document.getElementById("fontSizeSlider");
    if (slider) slider.value = saved;
    changeFontSize(saved);
}

// --- STORAGE & UTILITY FUNCTIONS ---
function safeSave(key, valueObj) {
    try { localStorage.setItem(key, JSON.stringify(valueObj)); return true; }
    catch (err) { alert("⚠️ Storage FULL! Clear old history."); return false; }
}

// --- BACKGROUND SLIDESHOWS ---
function startAuthSlideshow() {
    const s = document.querySelectorAll(".auth-slide");
    if (!s.length) return;
    let i=0; setInterval(()=>{
        s.forEach(x=>x.classList.remove("active"));
        i=(i+1)%s.length; s[i].classList.add("active");
    },8000);
}
function startDashSlideshow() {
    const s = document.querySelectorAll(".dash-slide");
    if (!s.length) return;
    let i=0; setInterval(()=>{
        s.forEach(x=>x.classList.remove("active"));
        i=(i+1)%s.length; s[i].classList.add("active");
    },8000);
}

function togglePassword(id){const e=document.getElementById(id);if(e)e.type=e.type==="password"?"text":"password";}
function showTab(n){
    document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));
    if(event && event.target) event.target.classList.add("active");
    document.querySelectorAll(".auth-card").forEach(c=>c.classList.remove("active-tab"));
    const tab = document.getElementById(n+"Tab");
    if(tab) tab.classList.add("active-tab");
}
function getCourseObj(name){return officialCourses.find(c=>c.name.toLowerCase()===name.trim().toLowerCase());}

// --- 🆕 UPDATED REGISTER — GENDER-BASED STANDARD IMAGE ---
function signupUser() {
    showLoading();
    setTimeout(() => {
        const matric = document.getElementById("matric").value.trim();
        const pass = document.getElementById("password").value;
        const gender = document.getElementById("gender").value;
        const users = JSON.parse(localStorage.getItem("cbtalluser")||"[]");
        if(users.find(u=>u.matric===matric)) { hideLoading(); return alert("❌ Matric already registered!"); }
        if(!gender) { hideLoading(); return alert("⚠️ Please select your gender!"); }

        const selectedCourses = Array.from(document.querySelectorAll('.course-checkbox:checked')).map(cb => cb.value);
        const selected = selectedCourses.map(n=>getCourseObj(n)).filter(Boolean);
        if(!selected.length) { hideLoading(); return alert("⚠️ Tick at least one course you are offering!"); }

        const profilePic = gender === "male" 
            ? "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48c3R5bGU+cmVjdHtmaWxsOndoaXRlO30gY2lyY2xlZXtmaWxsOndoaXRlO308L3N0eWxlPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjY1IiByPSI0NSIgZmlsbD0iIzFhMTExYSIvPjxyZWN0IHg9IjQ1IiB5PSIxMjAiIHdpZHRoPSIxMTAiIGhlaWdodD0iNzgiIHJ4PSIzNSIgZmlsbD0iIzFhMTExYSIvPjwvc3ZnPg=="
            : "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48c3R5bGU+cmVjdHtmaWxsOndoaXRlO308L3N0eWxlPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjY1IiByPSI0NSIgZmlsbD0iIzFhMTExYSIvPjxyZWN0IHg9IjQwIiB5PSIxMjAiIHdpZHRoPSIxMjAiIGhlaWdodD0iNzgiIHJ4PSI0MCAgZmlsbD0iIzFhMTExYSIvPjwvc3ZnPg==";

        users.push({
            surname: document.getElementById("surname").value.trim(),
            firstname: document.getElementById("firstname").value.trim(),
            matric, password: pass, gender,
            secQuestion: document.getElementById("secQuestion").value,
            secAnswer: document.getElementById("secAnswer").value.trim().toLowerCase(),
            department: document.getElementById("department").value.trim(),
            school: document.getElementById("school").value.trim(),
            profilePic: profilePic, courses: selected, exams: []
        });
        safeSave("cbtalluser", users);
        alert("✅ Account created!"); showTab("login");
        hideLoading();
    }, 600);
}

function loginUser() {
    showLoading();
    setTimeout(() => {
        const matric = document.getElementById("loginMatric").value.trim();
        const pass = document.getElementById("loginPass").value;
        const users = JSON.parse(localStorage.getItem("cbtalluser")||"[]");
        const found = users.find(u=>u.matric===matric && u.password===pass);
        if(!found) { hideLoading(); return alert("❌ Invalid login details!"); }
        currentUser = found;
        safeSave("cbtActive", {matric, loggedIn:true});
        loadDashboard();
    }, 800);
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

// --- 🆕 FIXED EXAM MODE SYSTEM ---
function closeModeSelect(){const m=document.getElementById("modeSelectModal");if(m)m.classList.remove("show");}
function startExam(mode){
    showLoading();
    selectedExamMode = mode;
    closeModeSelect();
    showTopicSelection();
    hideLoading();
}

function showTopicSelection(){
    const course = officialCourses.find(c=>c.id === selectedExamCourse.id);
    if(!course) return alert("Course not found!");
    const nameEl = document.getElementById("topicCourseName");
    if(nameEl) nameEl.textContent = course.name;
    const container = document.getElementById("topicListContainer");
    if(!container) return;
    container.innerHTML = "";
    selectedTopics = [];
    const allOpt = document.createElement("label");
    allOpt.className = "option";
    allOpt.innerHTML = `<input type="checkbox" value="ALL" onchange="toggleAllTopics(this)"> <strong>📚 All Topics</strong>`;
    container.appendChild(allOpt);
    course.topics.forEach(topic=>{
        const opt = document.createElement("label");
        opt.className = "option";
        opt.innerHTML = `<input type="checkbox" value="${topic}" class="topic-check"> ${topic}`;
        container.appendChild(opt);
    });
    const modal = document.getElementById("topicSelectModal");
    if(modal) modal.classList.add("show");
}
function toggleAllTopics(cb){
    document.querySelectorAll(".topic-check").forEach(check=>check.checked = cb.checked);
}
function closeTopicSelect(){
    const t=document.getElementById("topicSelectModal"),m=document.getElementById("modeSelectModal");
    if(t)t.classList.remove("show");
    if(m)m.classList.add("show");
}

function confirmTopicSelection(){
    showLoading();
    selectedTopics = Array.from(document.querySelectorAll(".topic-check:checked")).map(c=>c.value);
    if(!selectedTopics.length) { hideLoading(); return alert("⚠️ Select at least one topic!"); }

    const modeSettings = {
        instant:  { q: 30, t: 0 },
        short:    { q: 20, t: 900 },
        medium:   { q: 30, t: 1200 },
        long:     { q: 50, t: 2100 },
        review:   { q: 30, t: 0 }
    };

    const s = modeSettings[selectedExamMode] || modeSettings.medium;
    const examSettings = {
        subId: selectedExamCourse.id,
        subName: selectedExamCourse.name,
        mode: selectedExamMode,
        topics: selectedTopics,
        qCount: s.q,
        time: s.t
    };

    localStorage.setItem("currentExam", JSON.stringify(examSettings));
    const t=document.getElementById("topicSelectModal");
    if(t)t.classList.remove("show");
    setTimeout(() => {
        window.location.href = "exam.html";
    }, 500);
}

// --- DASHBOARD LOAD ---
function loadDashboard(){
    const authSection = document.getElementById("authSection");
    const dashboard = document.getElementById("dashboard");
    const authSlide = document.querySelector(".auth-slideshow");
    const dashSlide = document.querySelector(".dash-slideshow");
    
    if(authSection) authSection.style.display="none";
    if(dashboard) dashboard.style.display="block";
    if(authSlide) authSlide.style.display="none";
    if(dashSlide) dashSlide.style.display="block";
    startDashSlideshow();

    const dashPic = document.getElementById("dashPic");
    const menuPic = document.getElementById("menuPic");
    const dashFirst = document.getElementById("dashFirstname");
    const menuFirst = document.getElementById("menuFirstname");
    const dashMatric = document.getElementById("dashMatric");
    const menuMatric = document.getElementById("menuMatric");
    const menuDept = document.getElementById("menuDept");
    const menuSchool = document.getElementById("menuSchool");
    const greeting = document.getElementById("greeting");

    if(dashPic) dashPic.src = currentUser.profilePic;
    if(menuPic) menuPic.src = currentUser.profilePic;
    if(dashFirst) dashFirst.textContent = currentUser.firstname;
    if(menuFirst) menuFirst.textContent = currentUser.firstname;
    if(dashMatric) dashMatric.textContent = currentUser.matric;
    if(menuMatric) menuMatric.textContent = currentUser.matric;
    if(menuDept) menuDept.textContent = "Dept: " + currentUser.department;
    if(menuSchool) menuSchool.textContent = "School: " + currentUser.school;
    
    const h=new Date().getHours();
    if(greeting) greeting.textContent=(h<12?"GOOD MORNING":h<17?"GOOD AFTERNOON":"GOOD EVENING")+", "+currentUser.firstname+" 🧠";
    
    updateCourseLists(); 
    renderSubjects(); 
    updateStats(); 
    renderHistory(); 
    drawChart();
    hideLoading();
}
function updateCourseLists(){
    const s=document.getElementById("removeCourseList");
    if(!s) return;
    s.innerHTML="";
    currentUser.courses.forEach(c=>{
        const o=document.createElement("option");
        o.value=c.id;
        o.textContent=c.name;
        s.appendChild(o);
    });
}
function addNewCourse(){
    const n=document.getElementById("newCourseName").value.trim();
    const c=getCourseObj(n);
    if(!c)return alert("Invalid course name!");
    if(currentUser.courses.some(x=>x.id===c.id))return alert("Course already added!");
    currentUser.courses.push(c);
    safeSaveUser();
    updateCourseLists();
    renderSubjects();
    document.getElementById("newCourseName").value="";
}
function removeCourse(){
    const list=document.getElementById("removeCourseList");
    if(!list) return;
    const i=list.value;
    currentUser.courses=currentUser.courses.filter(c=>c.id!==i);
    safeSaveUser();
    updateCourseLists();
    renderSubjects();
}
function safeSaveUser(){
    const all=JSON.parse(localStorage.getItem("cbtalluser")||"[]");
    const idx=all.findIndex(u=>u.matric===currentUser.matric);
    if(idx!==-1) all[idx]=currentUser;
    safeSave("cbtalluser",all);
}
function renderSubjects(){
    const l=document.getElementById("subjectsList");
    if(!l) return;
    l.innerHTML="";
    currentUser.courses.forEach(c=>{
        const b=document.createElement("button");
        b.className="subject-btn";
        b.textContent=c.name;
        b.onclick=()=>{
            selectedExamCourse=c;
            const modal=document.getElementById("modeSelectModal");
            if(modal) modal.classList.add("show");
        };
        l.appendChild(b);
    });
}
function updateStats(){
    const s=currentUser.exams.map(e=>e.score);
    const a=s.length?Math.round(s.reduce((x,y)=>x+y,0)/s.length):0;
    const avgEl=document.getElementById("avgScore");
    const gradeEl=document.getElementById("iqGrade");
    const timeEl=document.getElementById("timeMgmt");
    
    if(avgEl) avgEl.textContent=a+"%";
    if(gradeEl) gradeEl.textContent=a>=40?"Genius 🧠":a>=30?"Above Average":a>=25?"Good":a>=15?"Fair":"Needs Improvement";
    const t=currentUser.exams.filter(e=>e.timeLeft>0).length;
    if(timeEl) timeEl.textContent=currentUser.exams.length?Math.round(t/currentUser.exams.length*100)+"%":"0%";
}
function drawChart(){
    const c=document.getElementById("performanceChart");
    if(!c||!window.Chart)return;
    if(window.perfChart)window.perfChart.destroy();
    new Chart(c,{
        type:"line",
        data:{
            labels:currentUser.exams.map(e=>new Date(e.date).toLocaleDateString()),
            datasets:[{
                label:"Score %",
                data:currentUser.exams.map(e=>Math.round(e.score/30*100)),
                borderColor:"#2563eb",
                backgroundColor:"rgba(37,99,235,.1)",
                fill:true
            }]
        },
        options:{responsive:true}
    });
}

function renderHistory(){
    const h=document.getElementById("examHistory");
    if(!h)return;
    h.innerHTML="";
    [...currentUser.exams].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(-15).forEach((e,i)=>{
        const p=Math.round(e.score/e.questions.length*100);
        h.innerHTML+=`<div class="history-card"><div><h4>${e.subject} — ${e.date}</h4><p>Score: ${e.score}/${e.questions.length} (${p}%) | Time Left: ${e.timeLeft} mins</p></div><button onclick="viewCorrections(${currentUser.exams.indexOf(e)})">📖 View Corrections</button></div>`;
    });
}

// ==================================================
// ✅ FINAL FIX — VIEW CORRECTIONS WITH KATEX
// ==================================================
function viewCorrections(examIndex){
    const exam = currentUser.exams[examIndex];
    if(!exam || !exam.questions) return alert("❌ No review data available!");

    let reviewHTML = `
        <div id="reviewContainer" style="background:var(--card);padding:1.5rem;border-radius:12px;margin-top:1rem;">
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
                        </div>
                    `).join("")}
                </div>
                <p><strong>Your Answer:</strong> ${picked} | <strong>Correct Answer:</strong> ${correct}</p>
                <p style="margin-top:0.5rem;"><strong>📌 Explanation:</strong> ${q.explanation}</p>
            </div>
        `;
    });

    reviewHTML += `<button onclick="location.reload()" style="margin-top:1rem;">🔙 Back to History</button></div>`;

    const historyEl = document.getElementById("examHistory");
    if(historyEl) historyEl.innerHTML = reviewHTML;

    setTimeout(() => renderAllMathIn(document.getElementById("reviewContainer")), 50);
}

function toggleMenu(){
    const menu=document.getElementById("sideMenu"),overlay=document.getElementById("menuOverlay");
    if(menu)menu.classList.toggle("open");
    if(overlay)overlay.classList.toggle("show");
}
function confirmLogout(){
    showLoading();
    setTimeout(() => {
        if(confirm("⚠️ Are you sure you want to logout?")){
            stopExamTimer();
            currentUser=null;
            localStorage.removeItem("cbtActive");
            localStorage.removeItem("currentExam");
            localStorage.removeItem("examTimeLeft");
            location.reload();
        }
        hideLoading();
    }, 300);
}

// ✅ ALL INITIALIZATIONS
window.addEventListener("DOMContentLoaded",()=>{
    showLoading();
    initTheme();
    initFontSize();
    
    const themeSwitch = document.getElementById("themeSwitch");
    if(themeSwitch) themeSwitch.onchange = (e) => toggleTheme(e.target.value);
    const fontSizeSlider = document.getElementById("fontSizeSlider");
    if(fontSizeSlider) fontSizeSlider.oninput = (e) => changeFontSize(e.target.value);
    
    startAuthSlideshow();
    const saved = JSON.parse(localStorage.getItem("cbtActive")||"null");
    if(saved) {
        const allUsers = JSON.parse(localStorage.getItem("cbtalluser")||"[]");
        currentUser = allUsers.find(u=>u.matric===saved.matric);
    }
    if(currentUser) {
        loadDashboard();
    } else {
        setTimeout(hideLoading, 800);
    }
});

// ==================================================
// 📤 EXPORT TIMER FUNCTIONS FOR exam.html
// ==================================================
window.startExamTimer = startExamTimer;
window.stopExamTimer = stopExamTimer;
window.formatTime = formatTime;
window.examTimeLeft = () => examTimeLeft;
