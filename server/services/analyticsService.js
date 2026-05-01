/**
 * Analytics Service
 * Handles execution of Python analytics scripts and parses results
 */

const { PythonShell } = require("python-shell");
const path = require("path");
const fs = require("fs");

const pythonPath = process.env.PYTHON_PATH || "/usr/bin/python3";

const analyticsBasePath =
    process.env.ANALYTICS_PATH || path.join(__dirname, "../../analytics");

/**
 * Get the path to analytics scripts
 */
const getAnalyticsPath = (scriptName) => {
    return path.join(analyticsBasePath, scriptName);
};

/**
 * Execute Python script and return parsed JSON result
 * @param {string} scriptName - Name of the Python script (e.g., 'sales_analysis.py')
 * @returns {Promise<object>} - Parsed JSON result from Python script
 */
const executePythonScript = (scriptName) => {
    return new Promise((resolve, reject) => {
        const scriptPath = getAnalyticsPath(scriptName);

        if (!fs.existsSync(scriptPath)) {
            return reject({
                message: "Python script not found",
                error: `Script ${scriptName} does not exist at ${scriptPath}`,
                scriptPath,
            });
        }

        const options = {
            mode: "text",
            pythonPath,
            pythonOptions: ["-u"],
            scriptPath: path.dirname(scriptPath),
            args: [],
            env: {
                ...process.env,
                MONGO_URI: process.env.MONGO_URI || "",
                MONGO_DB_NAME: process.env.MONGO_DB_NAME || "",
            },
        };

        const timeoutMs = Number(process.env.PYTHON_SCRIPT_TIMEOUT_MS || 60000);
        let timedOut = false;

        const pyshell = new PythonShell(path.basename(scriptPath), options);
        const timeoutId = setTimeout(() => {
            timedOut = true;
            pyshell.kill("SIGKILL");
        }, timeoutMs);

        let stderrLines = [];

        pyshell.on("stderr", (stderr) => {
            stderrLines.push(stderr.toString());
        });

        pyshell.end((err, results) => {
            clearTimeout(timeoutId);

            if (timedOut) {
                return reject({
                    message: "Python script timed out",
                    error: `Script ${scriptName} exceeded ${timeoutMs}ms`,
                    scriptPath,
                });
            }

            if (err) {
                return reject({
                    message: "Python script failed",
                    error: err.message || err,
                    scriptPath,
                    stderr: stderrLines.join("\n"),
                });
            }

            const output = Array.isArray(results) ? results.join("\n") : "";
            const jsonMatch = output.match(/\{[\s\S]*\}|\[[\s\S]*\]/);

            if (!jsonMatch) {
                return resolve({
                    success: false,
                    raw_output: output,
                    stderr: stderrLines.join("\n"),
                });
            }

            try {
                resolve(JSON.parse(jsonMatch[0]));
            } catch (parseError) {
                reject({
                    message: "Failed to parse Python script output",
                    error: parseError.message,
                    raw_output: output,
                    scriptPath,
                    stderr: stderrLines.join("\n"),
                });
            }
        });
    });
};

const wrapResult = async (fn, fallbackMessage) => {
    try {
        const result = await fn();
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            message: error.message || fallbackMessage,
            error: error.error || error.stderr || error,
        };
    }
};

const getSalesAnalysis = () =>
    wrapResult(
        () => executePythonScript("sales_analysis.py"),
        "Sales analysis failed",
    );

const getUserBehaviorAnalysis = () =>
    wrapResult(
        () => executePythonScript("user_behavior.py"),
        "User behavior analysis failed",
    );

const getRecommendations = () =>
    wrapResult(
        () => executePythonScript("recommendation.py"),
        "Recommendations failed",
    );

const getAnomalyDetection = () =>
    wrapResult(
        () => executePythonScript("anomaly_detection.py"),
        "Anomaly detection failed",
    );

const healthCheck = async () => {
    const inlineScript = `
import json
from pymongo import MongoClient

try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    client.server_info()
    print(json.dumps({"status": "healthy", "mongodb": "connected"}))
except Exception as e:
    print(json.dumps({"status": "unhealthy", "error": str(e)}))
`;

    return new Promise((resolve) => {
        const options = {
            mode: "text",
            pythonPath,
            pythonOptions: ["-u"],
            env: {
                ...process.env,
                MONGO_URI: process.env.MONGO_URI || "",
                MONGO_DB_NAME: process.env.MONGO_DB_NAME || "",
            },
        };

        PythonShell.runString(inlineScript, options, (err, results) => {
            if (err) {
                return resolve({
                    status: "unhealthy",
                    error: err.message || err,
                });
            }

            const output = Array.isArray(results) ? results.join("\n") : "";
            try {
                resolve(JSON.parse(output));
            } catch (parseError) {
                resolve({
                    status: "unhealthy",
                    error: parseError.message || "Invalid health check JSON",
                    raw_output: output,
                });
            }
        });
    });
};

module.exports = {
    getSalesAnalysis,
    getUserBehaviorAnalysis,
    getRecommendations,
    getAnomalyDetection,
    healthCheck,
    executePythonScript,
};
