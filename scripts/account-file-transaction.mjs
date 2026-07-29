import {
  closeSync,
  existsSync,
  fsyncSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";

export function gitControlPath(name) {
  const gitPath = execFileSync("git", ["rev-parse", "--git-path", name], {
    encoding: "utf8",
  }).trim();
  if (gitPath === "") {
    throw new Error(`git did not return a control path for ${name}`);
  }
  return path.resolve(gitPath);
}

export function withAccountTransactionLock(callback, {
  lockFile = gitControlPath("invest-account-transaction.lock"),
} = {}) {
  acquireLock(lockFile);
  try {
    return callback();
  } finally {
    if (existsSync(lockFile)) {
      unlinkSync(lockFile);
    }
  }
}

export function recoverFileTransaction(journalFile, { allowedFiles } = {}) {
  if (!existsSync(journalFile)) {
    return false;
  }
  const journal = JSON.parse(readFileSync(journalFile, "utf8"));
  if (journal?.schema_version !== 1 || !Array.isArray(journal.updates) || journal.updates.length === 0) {
    throw new Error(`account transaction journal is malformed: ${journalFile}`);
  }
  const allowed = allowedFiles === undefined
    ? undefined
    : new Set(allowedFiles.map((file) => path.resolve(file)));
  const seenFiles = new Set();
  for (const update of journal.updates) {
    validateJournalUpdate(update, journalFile);
    if (seenFiles.has(update.file)) {
      throw new Error(`account transaction journal duplicates ${update.file}`);
    }
    seenFiles.add(update.file);
    if (allowed !== undefined && !allowed.has(update.file)) {
      throw new Error(`account transaction journal targets an unexpected file: ${update.file}`);
    }
    const current = readFileSync(update.file, "utf8");
    const currentHash = sha256(current);
    if (currentHash !== update.before_sha256 && currentHash !== update.after_sha256) {
      throw new Error(`account transaction recovery found unexpected content in ${update.file}`);
    }
  }
  for (const update of journal.updates) {
    const current = readFileSync(update.file, "utf8");
    if (sha256(current) !== update.after_sha256) {
      writeAtomic(update.file, decodeContent(update.after_base64));
    }
  }
  unlinkSync(journalFile);
  return true;
}

export function commitFileTransaction(updates, {
  journalFile = gitControlPath("invest-account-transaction.json"),
  failAfterUpdateIndex,
} = {}) {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error("account transaction requires at least one file update");
  }
  if (existsSync(journalFile)) {
    throw new Error(`account transaction journal already exists: ${journalFile}`);
  }
  const seenFiles = new Set();
  const normalized = updates.map((update) => {
    const file = path.resolve(update.file);
    if (seenFiles.has(file)) {
      throw new Error(`account transaction duplicates file update: ${file}`);
    }
    seenFiles.add(file);
    const before = readFileSync(file, "utf8");
    if (before !== update.before) {
      throw new Error(`account file changed before transaction commit: ${file}`);
    }
    return {
      file,
      before_sha256: sha256(before),
      after_sha256: sha256(update.after),
      after_base64: Buffer.from(update.after, "utf8").toString("base64"),
    };
  });
  const journal = {
    schema_version: 1,
    created_at: new Date().toISOString(),
    updates: normalized,
  };
  writeAtomic(journalFile, `${JSON.stringify(journal)}\n`, { exclusive: true });
  for (let index = 0; index < normalized.length; index += 1) {
    const update = normalized[index];
    writeAtomic(update.file, decodeContent(update.after_base64));
    if (failAfterUpdateIndex === index) {
      throw new Error(`injected account transaction failure after update ${index}`);
    }
  }
  unlinkSync(journalFile);
}

function validateJournalUpdate(update, journalFile) {
  if (
    update === null
    || typeof update !== "object"
    || typeof update.file !== "string"
    || !path.isAbsolute(update.file)
    || !/^[a-f0-9]{64}$/.test(update.before_sha256)
    || !/^[a-f0-9]{64}$/.test(update.after_sha256)
    || typeof update.after_base64 !== "string"
    || sha256(decodeContent(update.after_base64)) !== update.after_sha256
  ) {
    throw new Error(`account transaction journal contains an invalid update: ${journalFile}`);
  }
}

function decodeContent(value) {
  return Buffer.from(value, "base64").toString("utf8");
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function acquireLock(lockFile) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let descriptor;
    try {
      descriptor = openSync(lockFile, "wx", 0o600);
      writeFileSync(descriptor, `${JSON.stringify({ pid: process.pid, created_at: new Date().toISOString() })}\n`);
      fsyncSync(descriptor);
      return;
    } catch (error) {
      if (error?.code !== "EEXIST" || attempt > 0 || lockOwnerIsAlive(lockFile)) {
        throw new Error(`account transaction lock is unavailable: ${lockFile}`, { cause: error });
      }
      unlinkSync(lockFile);
    } finally {
      if (descriptor !== undefined) {
        closeSync(descriptor);
      }
    }
  }
}

function lockOwnerIsAlive(lockFile) {
  try {
    const record = JSON.parse(readFileSync(lockFile, "utf8"));
    if (!Number.isInteger(record.pid) || record.pid <= 0) {
      return true;
    }
    process.kill(record.pid, 0);
    return true;
  } catch (error) {
    if (error?.code === "ESRCH") {
      return false;
    }
    return true;
  }
}

function writeAtomic(file, content, { exclusive = false } = {}) {
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  let descriptor;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    writeFileSync(descriptor, content);
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    if (exclusive && existsSync(file)) {
      throw new Error(`refusing to replace existing transaction file: ${file}`);
    }
    renameSync(temporary, file);
  } finally {
    if (descriptor !== undefined) {
      closeSync(descriptor);
    }
    if (existsSync(temporary)) {
      unlinkSync(temporary);
    }
  }
}
