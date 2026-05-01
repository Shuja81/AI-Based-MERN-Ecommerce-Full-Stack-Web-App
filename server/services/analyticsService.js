/**
 * Analytics Service
 * Handles execution of Python analytics scripts and parses results
 */

const { spawn, exec } = require("child_process");
const path = require("path");
const os = require("os");

const pythonBin = process.env.PYTHON || process.env.PYTHON_PATH || "python";

/**
 * Get the path to analytics scripts
 */
const getAnalyticsPath = (scriptName) => {
    return path.join(__dirname, "../../analytics", scriptName);
};

/**
 * Execute Python script and return parsed JSON result
 * @param {string} scriptName - Name of the Python script (e.g., 'sales_analysis.py')
 * @returns {Promise<object>} - Parsed JSON result from Python script
 */
const executePythonScript = (scriptName) => {
    return new Promise((resolve, reject) => {
        const scriptPath = getAnalyticsPath(scriptName);
        let outputData = "";
        let errorData = "";

        // Use spawn for better handling of large outputs
        const pythonProcess = spawn(pythonBin, [scriptPath], {
            cwd: path.dirname(scriptPath),
            env: {
                ...process.env,
                MONGO_URI: process.env.MONGO_URI || "",
                MONGO_DB_NAME: process.env.MONGO_DB_NAME || "",
            },
            timeout: 60000, // 60 second timeout
        });

        // Collect stdout
        pythonProcess.stdout.on("data", (data) => {
            outputData += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on("data", (data) => {
            errorData += data.toString();
        });

        // Handle process completion
        pythonProcess.on("close", (code) => {
            if (code !== 0) {
                console.error(
                    `Python script error (code ${code}): ${errorData || outputData}`,
                );
                return reject({
                    message: `Python script failed with code ${code}`,
                    error: errorData || outputData || `Exit code ${code}`,
                });
            }

            try {
                // Parse JSON output from Python script
                // Python scripts output JSON using print(json.dumps(...))
                const jsonMatch = outputData.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    resolve(result);
                } else {
                    // If no JSON found, return the raw output (for reports)
                    resolve({ raw_output: outputData });
                }
            } catch (parseError) {
                console.error(`JSON parse error: ${parseError.message}`);
                reject({
                    message: "Failed to parse Python script output",
                    error: parseError.message,
                    raw_output: outputData,
                });
            }
        });

        // Handle process errors
        pythonProcess.on("error", (err) => {
            reject({
                message: "Failed to execute Python script",
                error: err.message,
            });
        });
    });
};

/**
 * Get Sales Analysis Data
 */
const getSalesAnalysis = async () => {
    try {
        const result = await executePythonScript("sales_analysis.py");
        return {
            success: true,
            data: result,
        };
    } catch (error) {
        throw {
            success: false,
            message: error.message || "Sales analysis failed",
            error: error.error,
        };
    }
};

/**
 * Get User Behavior Analysis
 */
const getUserBehaviorAnalysis = async () => {
    try {
        const result = await executePythonScript("user_behavior.py");
        return {
            success: true,
            data: result,
        };
    } catch (error) {
        throw {
            success: false,
            message: error.message || "User behavior analysis failed",
            error: error.error,
        };
    }
};

/**
 * Get Product Recommendations
 */
const getRecommendations = async (userId = null) => {
    try {
        // For now, we call the recommendation script without parameters
        // You can extend this to pass userId if needed
        const result = await executePythonScript("recommendation.py");
        return {
            success: true,
            data: result,
        };
    } catch (error) {
        throw {
            success: false,
            message: error.message || "Recommendations failed",
            error: error.error,
        };
    }
};

/**
 * Get Anomaly Detection Results
 */
const getAnomalyDetection = async () => {
    try {
        const result = await executePythonScript("anomaly_detection.py");
        return {
            success: true,
            data: result,
        };
    } catch (error) {
        throw {
            success: false,
            message: error.message || "Anomaly detection failed",
            error: error.error,
        };
    }
};

/**
 * Health Check - Verify Python and MongoDB connectivity
 */
const healthCheck = async () => {
    try {
        // Try a simple MongoDB connection test
        const testScript = `
import json
from pymongo import MongoClient

try:
    client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=5000)
    client.server_info()  # Force connection attempt
    print(json.dumps({"status": "healthy", "mongodb": "connected"}))
except Exception as e:
    print(json.dumps({"status": "unhealthy", "error": str(e)}))
`;

        return new Promise((resolve) => {
            const pythonProcess = spawn(pythonBin, ["-c", testScript], {
                timeout: 10000,
            });

            let output = "";
            let errorOutput = "";

            pythonProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            pythonProcess.on("close", (code) => {
                if (code !== 0) {
                    return resolve({
                        status: "unhealthy",
                        error:
                            errorOutput ||
                            output ||
                            `Python exited with code ${code}`,
                    });
                }

                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (parseErr) {
                    resolve({
                        status: "unhealthy",
                        error:
                            errorOutput ||
                            parseErr.message ||
                            "Unexpected health check output",
                        raw_output: output,
                    });
                }
            });

            pythonProcess.on("error", (err) => {
                resolve({
                    status: "unhealthy",
                    error: `Python not available: ${err.message}`,
                });
            });
        });
    } catch (error) {
        return { status: "unhealthy", error: error.message };
    }
};

module.exports = {
    getSalesAnalysis,
    getUserBehaviorAnalysis,
    getRecommendations,
    getAnomalyDetection,
    healthCheck,
    executePythonScript,
};
