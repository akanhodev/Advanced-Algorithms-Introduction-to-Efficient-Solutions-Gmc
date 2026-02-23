// ------------------------------------------------------------
//  DATA MODEL
//  Each task is a plain object with these fields:
//  {
//    id       : number   — unique identifier
//    name     : string   — task label
//    start    : string   — "HH:MM" format
//    end      : string   — "HH:MM" format
//    startMin : number   — start converted to minutes since midnight
//    endMin   : number   — end converted to minutes since midnight
//    priority : string   — "High" | "Medium" | "Low"
//  }
// ------------------------------------------------------------

// --- Sample Data ---
const tasks = [
  {
    id: 1,
    name: "Morning Standup",
    start: "09:00",
    end: "09:30",
    startMin: 540,
    endMin: 570,
    priority: "High",
  },
  {
    id: 2,
    name: "Code Review",
    start: "09:15",
    end: "10:00",
    startMin: 555,
    endMin: 600,
    priority: "High",
  },
  {
    id: 3,
    name: "Database Migration",
    start: "10:30",
    end: "12:00",
    startMin: 630,
    endMin: 720,
    priority: "High",
  },
  {
    id: 4,
    name: "Sprint Planning",
    start: "11:30",
    end: "12:30",
    startMin: 690,
    endMin: 750,
    priority: "Medium",
  },
  {
    id: 5,
    name: "Lunch Break",
    start: "12:00",
    end: "13:00",
    startMin: 720,
    endMin: 780,
    priority: "Low",
  },
  {
    id: 6,
    name: "API Integration",
    start: "13:00",
    end: "15:00",
    startMin: 780,
    endMin: 900,
    priority: "Medium",
  },
  {
    id: 7,
    name: "Write Unit Tests",
    start: "14:00",
    end: "16:00",
    startMin: 840,
    endMin: 960,
    priority: "Medium",
  },
  {
    id: 8,
    name: "Deploy to Staging",
    start: "15:30",
    end: "16:30",
    startMin: 930,
    endMin: 990,
    priority: "High",
  },
  {
    id: 9,
    name: "Documentation",
    start: "16:00",
    end: "17:00",
    startMin: 960,
    endMin: 1020,
    priority: "Low",
  },
  {
    id: 10,
    name: "Email Catchup",
    start: "08:30",
    end: "09:00",
    startMin: 510,
    endMin: 540,
    priority: "Low",
  },
];

// ============================================================
//  UTILITY: Convert "HH:MM" → minutes since midnight
//  Time  : O(1)
//  Space : O(1)
// ============================================================
function toMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

// ============================================================
//  ALGORITHM 1: Sort Tasks by Start Time
// ============================================================
function sortByStartTime(taskArray) {
  // Spread to avoid mutating the original array
  return [...taskArray].sort((a, b) => a.startMin - b.startMin);
}

// ============================================================
//  ALGORITHM 2: Group Tasks by Priority
// ============================================================
function groupByPriority(taskArray) {
  // Initialise buckets for all known priority levels
  const groups = {
    High: [],
    Medium: [],
    Low: [],
  };

  // Single pass — O(n)
  for (const task of taskArray) {
    groups[task.priority].push(task); // O(1) amortised array push
  }

  return groups;
}

// ============================================================
//  ALGORITHM 3: Detect Overlapping Tasks
// ============================================================
function detectOverlaps(taskArray) {
  if (taskArray.length < 2) return []; // Edge case: nothing to compare

  // Step 1: Sort by start time — O(n log n)
  const sorted = [...taskArray].sort((a, b) => a.startMin - b.startMin);

  const overlappingPairs = [];

  // Step 2: Sweep line — compare each task i with all j > i
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      // Early exit optimisation:
      // Since sorted by start, if j starts after i ends,
      // all remaining tasks also start even later → no overlap possible
      if (sorted[j].startMin >= sorted[i].endMin) break;

      // Check overlap: A.start < B.end AND B.start < A.end
      const overlaps =
        sorted[i].startMin < sorted[j].endMin &&
        sorted[j].startMin < sorted[i].endMin;

      if (overlaps) {
        overlappingPairs.push({
          taskA: sorted[i],
          taskB: sorted[j],
          // The actual overlap window
          overlapStart: Math.max(sorted[i].startMin, sorted[j].startMin),
          overlapEnd: Math.min(sorted[i].endMin, sorted[j].endMin),
        });
      }
    }
  }

  return overlappingPairs;
}

// ============================================================
//  ALGORITHM 4: Estimate Memory Usage
// ============================================================
function estimateMemory(taskArray) {
  const OBJECT_OVERHEAD = 64; // bytes — V8 object header + hidden class
  const BYTES_PER_NUMBER = 8; // 64-bit IEEE 754 float
  const BYTES_PER_STRING = 30; // average estimate (header + chars)

  // Fields: id(num), startMin(num), endMin(num) = 3 numbers
  //         name(str), start(str), end(str), priority(str) = 4 strings
  const bytesPerTask =
    OBJECT_OVERHEAD +
    3 * BYTES_PER_NUMBER + // 24 bytes
    4 * BYTES_PER_STRING; // 120 bytes
  // Total per task ≈ 208 bytes

  const arrayOverhead = 32 + taskArray.length * 8; // array + pointers

  const totalBytes = taskArray.length * bytesPerTask + arrayOverhead;

  return {
    taskCount: taskArray.length,
    bytesPerTask: bytesPerTask,
    totalBytes: totalBytes,
    totalKB: (totalBytes / 1024).toFixed(2),
  };
}

// ============================================================
//  RUN & PRINT RESULTS
// ============================================================

console.log("=".repeat(60));
console.log(" TASK SCHEDULER — Algorithm Output");
console.log("=".repeat(60));

// --- 1. Sort ---
console.log("\n[ 1 ] sortByStartTime()  →  O(n log n)\n");
const sorted = sortByStartTime(tasks);
sorted.forEach((t) =>
  console.log(`  ${t.start}–${t.end}  [${t.priority.padEnd(6)}]  ${t.name}`),
);

// --- 2. Group ---
console.log("\n[ 2 ] groupByPriority()  →  O(n)\n");
const groups = groupByPriority(tasks);
for (const [priority, list] of Object.entries(groups)) {
  console.log(`  ${priority} (${list.length} tasks):`);
  list.forEach((t) => console.log(`    · ${t.name} [${t.start}–${t.end}]`));
}

// --- 3. Overlaps ---
console.log("\n[ 3 ] detectOverlaps()   →  O(n log n)\n");
const overlaps = detectOverlaps(tasks);
if (overlaps.length === 0) {
  console.log("  ✓ No overlapping tasks found.");
} else {
  overlaps.forEach(({ taskA, taskB, overlapStart, overlapEnd }) => {
    const oStart = `${String(Math.floor(overlapStart / 60)).padStart(2, "0")}:${String(overlapStart % 60).padStart(2, "0")}`;
    const oEnd = `${String(Math.floor(overlapEnd / 60)).padStart(2, "0")}:${String(overlapEnd % 60).padStart(2, "0")}`;
    console.log(`  ⚠ "${taskA.name}" overlaps "${taskB.name}"`);
    console.log(`    Overlap window: ${oStart} – ${oEnd}`);
  });
}

// --- 4. Memory ---
console.log("\n[ 4 ] estimateMemory()   →  O(1)\n");
const mem = estimateMemory(tasks);
console.log(`  Tasks        : ${mem.taskCount}`);
console.log(`  Per task     : ~${mem.bytesPerTask} bytes`);
console.log(`  Total heap   : ~${mem.totalBytes} bytes (~${mem.totalKB} KB)`);

console.log("\n" + "=".repeat(60));
