import * as SQLite from "expo-sqlite";
import { Child } from "../models/child";
import { Activity } from "../models/activity";
import { DailyCheck } from "../models/dailyCheck";
import { Milestone } from "../models/milestones";
import { Reward } from "../models/reward";

const db = SQLite.openDatabaseSync("littlewins.db");
let dbReady = false;

export const initDB = (): void => {
  try {
    db.execSync?.(
      `CREATE TABLE IF NOT EXISTS children (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );`
    );

    db.execSync?.(
      `CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        childId INTEGER NOT NULL,
        title TEXT NOT NULL,
        FOREIGN KEY (childId) REFERENCES children(id)
      );`
    );

    db.execSync?.(
      `CREATE TABLE IF NOT EXISTS daily_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        activityId INTEGER NOT NULL,
        date TEXT NOT NULL,
        done INTEGER NOT NULL,
        FOREIGN KEY (activityId) REFERENCES activities(id)
      );`
    );

    db.execSync?.(
      `CREATE TABLE IF NOT EXISTS rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        childId INTEGER NOT NULL,
        activityId INTEGER,
        date TEXT NOT NULL,
        points INTEGER NOT NULL,
        FOREIGN KEY (childId) REFERENCES children(id),
        FOREIGN KEY (activityId) REFERENCES activities(id)
      );`
    );

    db.execSync?.(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );`
    );

    db.execSync?.(
      `CREATE TABLE IF NOT EXISTS milestones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        childId INTEGER NOT NULL,
        title TEXT NOT NULL,
        pointsRequired INTEGER NOT NULL,
        FOREIGN KEY (childId) REFERENCES children(id)
      );`
    );

    db.execSync?.(
      `CREATE TABLE IF NOT EXISTS milestone_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        milestoneId INTEGER NOT NULL,
        childId INTEGER NOT NULL,
        month TEXT NOT NULL,
        FOREIGN KEY (milestoneId) REFERENCES milestones(id),
        FOREIGN KEY (childId) REFERENCES children(id)
      );`
    );

    dbReady = true;
  } catch {
    dbReady = false;
  }
};

export const getChildren = (callback: (rows: Child[]) => void) => {
  if (!dbReady) return callback([]);
  try {
    callback(db.getAllSync<Child>("SELECT * FROM children;"));
  } catch {
    callback([]);
  }
};

export const addChild = (child: Child, callback?: () => void) => {
  console.log("Adding child:", dbReady);
  if (!dbReady) return;
  try {
    db.runSync("INSERT INTO children (name) VALUES (?);", [
      child.name
    ]);
    callback?.();
  } catch {
    console.error("Failed to add child");
  }
};

export const deleteChildWithData = (childId: number, callback?: () => void) => {
  if (!dbReady) return;
  try {
    db.runSync(
      `DELETE FROM daily_checks WHERE activityId IN 
       (SELECT id FROM activities WHERE childId = ?);`,
      [childId]
    );
    db.runSync("DELETE FROM activities WHERE childId = ?;", [childId]);
    db.runSync("DELETE FROM children WHERE id = ?;", [childId]);
    db.runSync("DELETE FROM rewards WHERE childId = ?;", [childId]);
    db.runSync("DELETE FROM milestones WHERE childId = ?;", [childId]);
    db.runSync("DELETE FROM milestone_completions WHERE childId = ?;", [childId]);
    callback?.();
  } catch {}
};

export const getActivitiesForChild = (childId: number, callback: (rows: Activity[]) => void) => {
  if (!dbReady) return callback([]);
  try {
    callback(db.getAllSync<Activity>("SELECT * FROM activities WHERE childId = ?;", [childId]));
  } catch {
    callback([]);
  }
};

export const addActivity = (activity: Activity, callback?: () => void) => {
  if (!dbReady) return;
  try {
    db.runSync("INSERT INTO activities (childId, title) VALUES (?, ?);", [
      activity.childId,
      activity.title,
    ]);
    callback?.();
  } catch {}
};

export const deleteActivity = (activityId: number, callback?: () => void) => {
  if (!dbReady) return;
  try {
    db.runSync("DELETE FROM daily_checks WHERE activityId = ?;", [activityId]);
    db.runSync("DELETE FROM activities WHERE id = ?;", [activityId]);
    callback?.();
  } catch {}
};

export const getDailyChecks = (activityId: number, date: string, callback: (rows: DailyCheck[]) => void) => {
  if (!dbReady) return callback([]);
  try {
    callback(db.getAllSync<DailyCheck>(
      "SELECT * FROM daily_checks WHERE activityId = ? AND date = ?;",
      [activityId, date]
    ));
  } catch {
    callback([]);
  }
};

export const markDailyCheck = (activityId: number, childId: number, date: string, done: boolean, points: number = 1, callback?: () => void) => {
  if (!dbReady) return;
  try {
    const existing = db.getAllSync<DailyCheck>(
      "SELECT * FROM daily_checks WHERE activityId = ? AND date = ?;",
      [activityId, date]
    );
    if (existing.length > 0) {
      db.runSync("UPDATE daily_checks SET done = ? WHERE activityId = ? AND date = ?;", [done ? 1 : 0, activityId, date]);
    } else {
      db.runSync("INSERT INTO daily_checks (activityId, date, done) VALUES (?, ?, ?);", [activityId, date, done ? 1 : 0]);
    }

    if (done) {
      db.runSync(
        "INSERT INTO rewards (childId, activityId, date, points) VALUES (?, ?, ?, ?);",
        [childId, activityId, date, points]
      );
    } else {
      db.runSync(
        "DELETE FROM rewards WHERE childId = ? AND activityId = ? AND date = ?;",
        [childId, activityId, date]
      );
    }

    callback?.();
  } catch {}
};

export const getDailyChecksForChild = (childId: number, callback: (rows: { activityId: number; title: string; date: string; done: boolean }[]) => void) => {
  if (!dbReady) return callback([]);
  try {
    const result = db.getAllSync<{ activityId: number; title: string; date: string; done: boolean }>(
      `SELECT a.id AS activityId, a.title, d.date, d.done
       FROM activities a
       LEFT JOIN daily_checks d ON a.id = d.activityId
       WHERE a.childId = ?
       ORDER BY d.date DESC;`,
      [childId]
    );
    callback(result);
  } catch {
    callback([]);
  }
};

export const getMilestonesForChild = (childId: number, callback: (rows: Milestone[]) => void) => {
  if (!dbReady) return callback([]);
  try {
    callback(db.getAllSync<Milestone>(
      "SELECT * FROM milestones WHERE childId = ? ORDER BY pointsRequired ASC;",
      [childId]
    ));
  } catch {
    callback([]);
  }
};

export const addMilestone = (milestone: Milestone, callback?: () => void) => {
  if (!dbReady) return;
  try {
    db.runSync(
      "INSERT INTO milestones (childId, title, pointsRequired) VALUES (?, ?, ?);",
      [milestone.childId, milestone.title, milestone.pointsRequired]
    );
    callback?.();
  } catch {}
};

export const deleteMilestone = (milestoneId: number, callback?: () => void) => {
  if (!dbReady) return;
  try {
    db.runSync("DELETE FROM milestones WHERE id = ?;", [milestoneId]);
    db.runSync("DELETE FROM milestone_completions WHERE milestoneId = ?;", [milestoneId]);
    callback?.();
  } catch {}
};

export const saveSetting = (key: string, value: string, callback?: () => void) => {
  if (!dbReady) return;
  try {
    db.runSync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
      [key, value]
    );
    callback?.();
  } catch {}
};

export const getSetting = (key: string, callback: (value: string | null) => void) => {
  if (!dbReady) return callback(null);
  try {
    const rows = db.getAllSync<{ value: string }>(
      `SELECT value FROM settings WHERE key = ?;`,
      [key]
    );
    callback(rows.length > 0 ? rows[0].value : null);
  } catch {
    callback(null);
  }
};

/*Not used currently but may be useful in future*/
export const getChildPoints = (childId: number, callback: (points: number) => void) => {
  if (!dbReady) return callback(0);
  try {
    const rows = db.getAllSync<{ total: number }>(
      "SELECT SUM(points) as total FROM rewards WHERE childId = ?;",
      [childId]
    );
    callback(rows[0]?.total ?? 0);
  } catch {
    callback(0);
  }
};

export const getChildMonthlyPoints = (childId: number, callback: (points: number) => void) => {
  if (!dbReady) return callback(0);
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    const rows = db.getAllSync<{ total: number }>(
      "SELECT SUM(points) as total FROM rewards WHERE childId = ? AND substr(date,1,7) = ?;",
      [childId, month]
    );
    callback(rows[0]?.total ?? 0);
  } catch {
    callback(0);
  }
};

export const markMilestoneCompleted = (childId: number, milestoneId: number, callback?: () => void) => {
  if (!dbReady) return;
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    const existing = db.getAllSync(
      "SELECT * FROM milestone_completions WHERE childId = ? AND milestoneId = ? AND month = ?;",
      [childId, milestoneId, month]
    );
    if (existing.length === 0) {
      db.runSync(
        "INSERT INTO milestone_completions (childId, milestoneId, month) VALUES (?, ?, ?);",
        [childId, milestoneId, month]
      );
    }
    callback?.();
  } catch {}
};

export const isMilestoneCompleted = (childId: number, milestoneId: number, callback: (completed: boolean) => void) => {
  if (!dbReady) return callback(false);
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    const rows = db.getAllSync(
      "SELECT * FROM milestone_completions WHERE childId = ? AND milestoneId = ? AND month = ?;",
      [childId, milestoneId, month]
    );
    callback(rows.length > 0);
  } catch {
    callback(false);
  }
};

export const deleteAllData = (callback?: () => void) => {
  if (!dbReady) return;
  try {
    // Order matters due to foreign keys
    db.runSync("DELETE FROM milestone_completions;");
    db.runSync("DELETE FROM milestones;");
    db.runSync("DELETE FROM rewards;");
    db.runSync("DELETE FROM daily_checks;");
    db.runSync("DELETE FROM activities;");
    db.runSync("DELETE FROM children;");
    db.runSync("DELETE FROM settings;");

    callback?.();
  } catch (error) {
    console.error("Failed to delete all data:", error);
  }
};


export const cleanUnusedData = (callback?: () => void) => {
  if (!dbReady) return;

  try {
    // Delete daily_checks for non-existing activities
    db.runSync(`
      DELETE FROM daily_checks
      WHERE activityId NOT IN (SELECT id FROM activities);
    `);

    // Delete rewards for non-existing children or activities
    db.runSync(`
      DELETE FROM rewards
      WHERE childId NOT IN (SELECT id FROM children)
         OR (activityId IS NOT NULL AND activityId NOT IN (SELECT id FROM activities));
    `);

    // Delete milestones for non-existing children
    db.runSync(`
      DELETE FROM milestones
      WHERE childId NOT IN (SELECT id FROM children);
    `);

    // Delete milestone_completions for deleted milestones or children
    db.runSync(`
      DELETE FROM milestone_completions
      WHERE milestoneId NOT IN (SELECT id FROM milestones)
         OR childId NOT IN (SELECT id FROM children);
    `);

    callback?.();
  } catch (error) {
    console.error("Failed to clean unused data:", error);
  }
};

