const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const dayjs = require("dayjs");
require("dotenv").config();

const {
  PGHOST,
  PGUSER,
  PGDATABASE,
  PGPASSWORD,
  PGPORT = "5432", // ✅ รองรับพอร์ต
  PG_BIN = "", // เช่น C:\Program Files\PostgreSQL\17\bin
  BACKUP_DIR = "C:\\BackupDB_NBA",
} = process.env;

function getPgDumpCmd() {
  const exe = process.platform === "win32" ? "pg_dump.exe" : "pg_dump";
  return PG_BIN ? path.join(PG_BIN, exe) : exe;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function backupOnce() {
  ensureDir(BACKUP_DIR);
  const ts = dayjs().format("YYYY-MM-DD_HH-mm");
  const filePath = path.join(BACKUP_DIR, `backup_${ts}.sql`);
  const pgDump = getPgDumpCmd();

  const args = [
    "-h",
    PGHOST,
    "-p",
    String(PGPORT), // ✅ ใส่พอร์ต
    "-U",
    PGUSER,
    "-d",
    PGDATABASE,
    "-F",
    "p",
    "-f",
    filePath,
  ];

  console.log(`[${dayjs().format()}] Starting backup → ${filePath}`);

  const child = spawn(pgDump, args, {
    stdio: "inherit",
    env: { ...process.env, PGPASSWORD },
  });

  child.on("close", (code) => {
    if (code === 0) console.log(`[${dayjs().format()}] ✅ Backup complete`);
    else
      console.error(`[${dayjs().format()}] ❌ Backup failed with code ${code}`);
  });
}

// ── cron: ทุกวันที่ 1 เวลา 01:00 ──
cron.schedule("0 1 1 * *", backupOnce);
console.log("📅 Cron started: 01:00 on day 1 each month");

// รันทันทีเมื่อใส่ --run-now
if (process.argv.includes("--run-now")) backupOnce();
