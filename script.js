const syllabus = [
  { title: "Introduction to Data", topics: ["Relevance of data: activity and examples", "Industrial and application needs for data", "Categorization of data", "Relational vs non-relational databases", "Limitations of file-based storage", "Definition and purpose of a DBMS"] },
  { title: "Introduction to RDBMS", topics: ["Entities, attributes, and relations", "Schema definition", "Primary key", "Candidate key and super key", "Foreign key", "UNIQUE and NOT NULL constraints", "Entity integrity and referential integrity", "Domain constraints", "SQL data types"] },
  { title: "Introduction to SQL", topics: ["DDL: CREATE, DROP, TRUNCATE, ALTER", "DML: SELECT, INSERT, UPDATE, DELETE", "TCL: COMMIT, ROLLBACK, SAVEPOINT", "DCL: GRANT and REVOKE", "Practise SQL command categories", "DELETE vs TRUNCATE vs DROP"] },
  { title: "Retrieving Data from Tables", topics: ["SELECT and DISTINCT", "WHERE clause", "IN operator", "LIKE and wildcards (% and _)", "EXISTS operator", "AND, OR, NOT", "LIMIT and OFFSET"] },
  { title: "SQL Functions", topics: ["Numeric: ROUND, TRUNC, POWER, FLOOR, CEIL, ABS", "Date/time: NOW, EXTRACT, INTERVAL, DATE_TRUNC, TO_CHAR", "String: UPPER, LOWER, LENGTH, CONCAT, ||", "String: SUBSTRING, TRIM, REPLACE, LIKE, ILIKE, SPLIT_PART", "NULL handling: COALESCE, IS NULL, IS NOT NULL", "NULL handling: NULLIF and IS DISTINCT FROM", "Aggregates: COUNT, SUM, AVG, MIN, MAX"] },
  { title: "CASE and Grouping", topics: ["GROUP BY basics", "Aggregate functions with GROUP BY", "Multi-column grouping", "HAVING clause", "WHERE vs HAVING", "Aggregate and non-aggregate column rules", "CASE conditional logic", "CASE with grouping and aggregate functions"] },
  { title: "Window Functions", topics: ["Limitations of GROUP BY", "Window function concept and OVER()", "PARTITION BY and window ORDER BY", "ROW_NUMBER()", "RANK() vs DENSE_RANK()", "LAG() and LEAD()", "Moving averages and rolling metrics", "SQL query execution order"] },
  { title: "Subqueries", topics: ["Why subqueries are needed", "Subquery in SELECT", "Subquery in FROM", "Subquery in WHERE", "Non-correlated subqueries", "Correlated subqueries", "Correlated vs non-correlated subqueries", "Practice subqueries with IN and EXISTS"] },
  { title: "Joins and Set Operations", topics: ["Why joins are needed; join conditions", "INNER JOIN", "LEFT JOIN and RIGHT JOIN", "FULL OUTER JOIN", "SELF JOIN", "Cartesian product and missing join conditions", "Filtering in ON vs WHERE", "Multiple table joins", "Joins with CASE and GROUP BY", "UNION vs UNION ALL", "INTERSECT"] },
  { title: "SQL Cumulative Spillover", topics: ["Review unfinished SQL topics from Lectures 2–8", "Practise weak SQL concepts", "Mixed-topic SQL questions", "Review common SQL errors"] },
  { title: "Data Modelling", topics: ["Need for data modelling", "Levels of data modelling", "High-level data modelling", "ER notation and representation", "Entities and attributes", "Relationships and cardinality", "Weak entities", "Use a PostgreSQL modelling tool", "Build an ER model from a problem statement"] },
  { title: "Normalization", topics: ["Data redundancy", "Functional dependencies", "Partial dependencies", "Transitive dependencies", "Multivalued dependencies", "First Normal Form (1NF)", "Second Normal Form (2NF)", "Third Normal Form (3NF)", "BCNF", "Compare 2NF vs 3NF and 3NF vs BCNF", "Practice normalization and decomposition"] },
  { title: "Transactions and ACID Properties", topics: ["Valid and invalid database states", "Transactions and transaction states", "BEGIN, COMMIT, ROLLBACK, SAVEPOINT", "Atomicity", "Consistency", "Isolation", "Durability", "Dirty reads", "Non-repeatable reads and phantom reads", "Isolation levels: Read Uncommitted and Read Committed", "Isolation levels: Repeatable Read and Serializable", "Transaction schedules and anomalies"] }
];

const STORAGE_KEY = "deContest3TrackerV1";
const $ = (id) => document.getElementById(id);
let state = loadState();

function freshState() {
  return { checked: {}, sessions: [] };
}
function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed && parsed.checked && Array.isArray(parsed.sessions) ? parsed : freshState();
  } catch { return freshState(); }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderAll();
}
function topicId(lectureIndex, topicIndex) { return `${lectureIndex}-${topicIndex}`; }
function lectureDone(index) { return syllabus[index].topics.every((_, ti) => !!state.checked[topicId(index, ti)]); }
function lectureCompletedTopics(index) { return syllabus[index].topics.filter((_, ti) => !!state.checked[topicId(index, ti)]).length; }
function totalTopics() { return syllabus.reduce((sum, l) => sum + l.topics.length, 0); }
function completedTopics() { return Object.values(state.checked).filter(Boolean).length; }
function percent(n, d) { return d ? Math.round((n / d) * 100) : 0; }
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

function renderSyllabus() {
  const filter = $("lectureFilter").value;
  const list = $("lectureList");
  list.innerHTML = "";
  syllabus.forEach((lecture, li) => {
    if (filter !== "all" && Number(filter) !== li) return;
    const done = lectureCompletedTopics(li);
    const pct = percent(done, lecture.topics.length);
    const item = document.createElement("article");
    item.className = "lecture-item" + (li === 0 && filter === "all" ? " open" : "");
    item.innerHTML = `
      <div class="lecture-header" role="button" tabindex="0" aria-expanded="${li === 0 && filter === "all"}">
        <div class="lecture-badge">L${li}</div>
        <div class="lecture-heading-text"><strong>${safeText(lecture.title)}</strong><small>${done}/${lecture.topics.length} topics · ${lectureDone(li) ? "Completed" : "In progress"}</small></div>
        <div class="lecture-mini"><div class="progress-track"><span style="width:${pct}%"></span></div><small>${pct}%</small></div>
        <span class="chevron">⌄</span>
      </div>
      <div class="lecture-body">${lecture.topics.map((topic, ti) => `
        <label class="topic-row">
          <input type="checkbox" data-lecture="${li}" data-topic="${ti}" ${state.checked[topicId(li, ti)] ? "checked" : ""} />
          <span>${safeText(topic)}</span>
        </label>`).join("")}</div>`;
    const header = item.querySelector(".lecture-header");
    const toggle = () => {
      item.classList.toggle("open");
      header.setAttribute("aria-expanded", item.classList.contains("open") ? "true" : "false");
    };
    header.addEventListener("click", toggle);
    header.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    item.querySelectorAll("input[type=checkbox]").forEach(input => input.addEventListener("change", () => {
      state.checked[topicId(Number(input.dataset.lecture), Number(input.dataset.topic))] = input.checked;
      saveState();
    }));
    list.appendChild(item);
  });
  if (!list.children.length) list.innerHTML = '<div class="empty-state">No lectures match this filter.</div>';
}
function populateSelects() {
  $("lectureFilter").innerHTML = '<option value="all">All lectures</option>' + syllabus.map((l,i)=>`<option value="${i}">Lecture ${i} · ${safeText(l.title)}</option>`).join("");
  $("sessionFocus").innerHTML = syllabus.map((l,i)=>`<option value="${i}">Lecture ${i} — ${safeText(l.title)}</option>`).join("");
}
function renderSummary() {
  const total = totalTopics(), done = completedTopics(), pct = percent(done,total);
  const lecturesDone = syllabus.filter((_,i)=>lectureDone(i)).length;
  const attempted = state.sessions.reduce((s,x)=>s+x.attempted,0);
  const correct = state.sessions.reduce((s,x)=>s+x.correct,0);
  const accuracy = attempted ? percent(correct,attempted) : null;
  $("completedCount").innerHTML = `${done} <small>/ ${total}</small>`;
  $("lectureCount").innerHTML = `${lecturesDone} <small>/ ${syllabus.length}</small>`;
  $("questionCount").textContent = attempted;
  $("accuracyCount").innerHTML = `${accuracy === null ? "—" : accuracy}<small>${accuracy === null ? "" : "%"}</small>`;
  $("overallPercent").textContent = pct + "%";
  $("overallBar").style.width = pct + "%";
  $("sidebarProgress").style.width = pct + "%";
  $("sidebarProgressText").textContent = pct + "% complete";
  $("heroPercent").textContent = pct + "%";
  $("heroBar").style.width = pct + "%";
  $("heroTopics").textContent = `${done} / ${total}`;
}
function renderPerformance() {
  const totalMinutes = state.sessions.reduce((s,x)=>s+x.minutes,0);
  const attempted = state.sessions.reduce((s,x)=>s+x.attempted,0);
  const correct = state.sessions.reduce((s,x)=>s+x.correct,0);
  const accuracy = attempted ? Math.round((correct/attempted)*100) : null;
  const avgConfidence = state.sessions.length ? state.sessions.reduce((s,x)=>s+x.confidence,0)/state.sessions.length : null;
  $("totalMinutes").innerHTML = `${totalMinutes} <small>min</small>`;
  $("sessionCount").textContent = state.sessions.length;
  $("accuracyLabel").textContent = accuracy === null ? "No data yet" : `${accuracy}%`;
  $("accuracyBar").style.width = (accuracy || 0) + "%";
  $("confidenceLabel").textContent = avgConfidence === null ? "— / 5" : `${avgConfidence.toFixed(1)} / 5`;
  $("confidenceDots").querySelectorAll("i").forEach((dot,i)=>dot.classList.toggle("filled", avgConfidence !== null && i < Math.round(avgConfidence)));
  let insight = "Log your first study session to unlock your performance snapshot.";
  if (state.sessions.length && accuracy !== null) {
    if (accuracy >= 85) insight = "Strong accuracy. Keep the streak alive, and revisit tricky questions after a short break.";
    else if (accuracy >= 65) insight = "Good foundation. Review every miss, then retry similar questions without looking at the solution.";
    else insight = "Treat mistakes as your roadmap. Revisit the core concept, then solve a small set of questions again.";
    if (avgConfidence !== null && avgConfidence < 2.6) insight += " Your confidence is low too, so prioritise recall practice.";
  }
  $("performanceInsight").textContent = insight;
}
function renderHistory() {
  const history = $("sessionHistory");
  if (!state.sessions.length) {
    history.innerHTML = '<div class="empty-state">No sessions yet. Log one above after your next study block.</div>';
    return;
  }
  history.innerHTML = [...state.sessions].reverse().map((s) => {
    const lecture = syllabus[s.lecture];
    const accuracy = s.attempted ? Math.round(s.correct/s.attempted*100) : null;
    return `<article class="history-item">
      <div class="history-icon">✓</div>
      <div class="history-main"><strong>${safeText(lecture ? `Lecture ${s.lecture} — ${lecture.title}` : "Study session")}</strong>
      <p>${safeText(s.notes || "No reflection added.")}</p>
      <p>${safeText(s.date)} · ${s.minutes} min · ${s.attempted} attempted · ${s.correct} correct · Confidence ${s.confidence}/5</p></div>
      <div class="history-meta"><strong>${accuracy === null ? "—" : accuracy + "%"}</strong>accuracy<br/><button class="history-delete" data-delete="${s.id}" aria-label="Delete session">Delete</button></div>
    </article>`;
  }).join("");
  history.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",()=>{
    state.sessions = state.sessions.filter(s=>s.id !== btn.dataset.delete);
    saveState();
  }));
}
function renderAll() { renderSyllabus(); renderSummary(); renderPerformance(); renderHistory(); }

$("lectureFilter").addEventListener("change", renderSyllabus);
$("sessionForm").addEventListener("submit", e => {
  e.preventDefault();
  const minutes = Number($("sessionMinutes").value);
  const attempted = Number($("sessionAttempted").value);
  const correct = Number($("sessionCorrect").value);
  const confidence = Number($("sessionConfidence").value);
  if (!Number.isFinite(minutes) || minutes < 1 || attempted < 0 || correct < 0 || correct > attempted) {
    $("formMessage").textContent = "Check your inputs: correct answers cannot exceed attempted questions.";
    return;
  }
  const focus = Number($("sessionFocus").value);
  state.sessions.push({
    id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    lecture: focus, minutes, attempted, correct, confidence,
    notes: $("sessionNotes").value.trim(),
    date: new Date().toLocaleString(undefined, { dateStyle:"medium", timeStyle:"short" })
  });
  saveState();
  $("sessionForm").reset();
  $("sessionFocus").value = String(focus);
  $("sessionConfidence").value = "3";
  $("formMessage").textContent = "Session saved — nice work. Keep it consistent.";
  setTimeout(()=>{ $("formMessage").textContent = ""; }, 3500);
});
$("exportBtn").addEventListener("click",()=>{
  const blob = new Blob([JSON.stringify({ syllabus, progress: state }, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "de-contest-3-progress.json"; a.click();
  URL.revokeObjectURL(url);
});
$("resetBtn").addEventListener("click",()=>{
  if (!confirm("Reset all checked topics and study sessions? This cannot be undone unless you exported your progress.")) return;
  state = freshState(); saveState(); $("formMessage").textContent = "";
});
populateSelects();
renderAll();
