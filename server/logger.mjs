import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const logDir = path.join(projectRoot, "log");

/**
 * Logger utility for Smart Learn RLW
 */
class Logger {
  constructor() {
    this.ensureLogDir();
  }

  async ensureLogDir() {
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (err) {
      console.error("Failed to create log directory:", err);
    }
  }

  getLogFileName() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `log_${yyyy}${mm}${dd}.log`;
  }

  async log(level, message, details = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...details,
    };

    const fileName = this.getLogFileName();
    const filePath = path.join(logDir, fileName);

    try {
      await fs.appendFile(filePath, JSON.stringify(logEntry) + "\n");
    } catch (err) {
      console.error("Failed to write to log file:", err);
    }

    // Also output to console for development visibility
    if (level === "ERROR") {
      console.error(`[${level}] ${message}`, details.error || "");
    } else if (level === "WARN") {
      console.warn(`[${level}] ${message}`);
    } else {
      console.log(`[${level}] ${message}`);
    }
  }

  info(message, details) {
    return this.log("INFO", message, details);
  }

  warn(message, details) {
    return this.log("WARN", message, details);
  }

  error(message, error, additionalDetails = {}) {
    const details = {
      ...additionalDetails,
    };
    
    if (error) {
      details.error = {
        message: error.message,
        stack: error.stack,
        ...error
      };
    }
    
    return this.log("ERROR", message, details);
  }
}

export const logger = new Logger();
