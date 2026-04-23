# Node.js + Python Analytics Integration

Complete integration of Python analytics scripts with your Express backend API.

## 📋 Overview

This integration allows your Node.js/Express backend to execute Python analytics scripts that connect directly to MongoDB and return results via REST API.

**Key Features:**

- ✅ Python scripts connect directly to MongoDB (no JSON passing)
- ✅ Express API routes execute Python scripts via child_process
- ✅ Results returned as JSON
- ✅ Production-ready architecture
- ✅ Error handling and health checks
- ✅ Easy React integration

---

## 🏗️ Architecture

```
Request (Client)
    ↓
Express Route (/api/v1/analytics/*)
    ↓
Controller (analyticsController.js)
    ↓
Service Layer (analyticsService.js)
    ↓
child_process.spawn() → Python Script
    ↓
Python Script (sales_analysis.py, etc.)
    ↓
MongoDB Connection
    ↓
Data Analysis
    ↓
JSON Output (stdout)
    ↓
Node.js Parses JSON
    ↓
Return via API Response
    ↓
Client (React, etc.)
```

---

## 📁 Project Structure

### Backend Files (Node.js)

```
server/
├── services/
│   └── analyticsService.js          # Executes Python, parses JSON
├── controllers/
│   └── analyticsController.js       # Handles requests, sends responses
├── routes/api/
│   ├── analytics.js                 # API route definitions
│   └── index.js                     # Register analytics routes
├── ANALYTICS_INTEGRATION.md         # Setup guide
├── ANALYTICS_API_EXAMPLES.md        # Response examples
└── test-analytics-api.js            # Test script
```

### Python Scripts

```
analytics/
├── sales_analysis.py                # Sales data analysis
├── user_behavior.py                 # User activity analysis
├── recommendation.py                # Product recommendations
├── anomaly_detection.py             # Fraud/anomaly detection
├── requirements.txt                 # Dependencies (pandas, pymongo)
└── README.md                        # Python setup guide
```

### React Client (Optional)

```
client/app/components/Analytics/
└── ReactIntegrationExamples.jsx    # React components and hooks
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Install Python dependencies
cd analytics
pip install -r requirements.txt

# Verify MongoDB connection
python sales_analysis.py
# Should output JSON

# Test API
cd ../server
node test-analytics-api.js
```

### 2. Run Express Server

```bash
npm start
# Server runs on http://localhost:5000 (or your configured port)
```

### 3. Test Endpoints

```bash
# Test sales analytics
curl http://localhost:5000/api/v1/analytics/sales

# Test user behavior
curl http://localhost:5000/api/v1/analytics/users

# Test recommendations
curl http://localhost:5000/api/v1/analytics/recommendations

# Test anomalies
curl http://localhost:5000/api/v1/analytics/anomalies

# Test health
curl http://localhost:5000/api/v1/analytics/health
```

---

## 📚 API Endpoints

All endpoints return JSON responses.

### GET /api/v1/analytics/sales

Sales analysis: revenue, top products, daily sales

**Response:**

```json
{
  "success": true,
  "data": {
    "total_revenue": { "total_revenue": 15234.50, "total_orders": 342 },
    "top_products": [...],
    "daily_sales": [...],
    "sales_by_status": [...]
  }
}
```

### GET /api/v1/analytics/users

User behavior: views, conversion, retention

**Response:**

```json
{
  "success": true,
  "data": {
    "most_viewed_products": [...],
    "conversion_rate": { "products_viewed": 2500, "conversion_rate_percent": 13.68 },
    "activity_breakdown": [...],
    "top_users": [...],
    "retention": { "retention_rate_percent": 43.67 }
  }
}
```

### GET /api/v1/analytics/recommendations

Trending & recommended products

**Response:**

```json
{
  "success": true,
  "data": {
    "trending_products": [...],
    "most_viewed_products": [...]
  }
}
```

### GET /api/v1/analytics/anomalies

Fraud detection & unusual patterns

**Response:**

```json
{
  "success": true,
  "data": {
    "order_statistics": {...},
    "unusual_orders": [...],
    "suspicious_activity": [...],
    "high_cancellation_users": [...]
  }
}
```

### GET /api/v1/analytics/health

System health check

**Response:**

```json
{
    "status": "healthy",
    "mongodb": "connected"
}
```

---

## 🔧 How It Works

### Service Layer (analyticsService.js)

The service uses Node's `child_process.spawn()` to run Python scripts:

```javascript
const pythonProcess = spawn("python", [scriptPath]);

// Capture output
pythonProcess.stdout.on("data", (data) => {
    outputData += data.toString();
});

// Parse JSON when complete
pythonProcess.on("close", (code) => {
    const result = JSON.parse(outputData);
    resolve(result);
});
```

**Advantages:**

- Lightweight process spawning
- Large output handling (streams)
- Automatic cleanup
- Error handling

### Python Scripts

Each Python script outputs JSON automatically:

```python
# sales_analysis.py
if __name__ == "__main__":
    analyzer = SalesAnalyzer()
    # Outputs JSON directly
    print(json.dumps(analyzer.get_json_report()))
```

**No Manual JSON Creation:**

- Python fetches from MongoDB
- Converts to JSON
- Sends to stdout
- Node.js captures and parses

---

## 💡 Usage Examples

### JavaScript (Node.js)

```javascript
// Call from another service
const { getSalesAnalysis } = require("./services/analyticsService");

const data = await getSalesAnalysis();
console.log(data.data.total_revenue);
```

### React

```javascript
import { useAnalytics } from "./hooks/useAnalytics";

function Dashboard() {
    const { data, loading, error } = useAnalytics("sales");

    if (loading) return <p>Loading...</p>;

    return <p>Revenue: ${data.total_revenue.total_revenue}</p>;
}
```

### cURL

```bash
curl http://localhost:5000/api/v1/analytics/sales | python -m json.tool
```

---

## ⚙️ Configuration

### MongoDB URI

Edit Python scripts to use custom MongoDB URI:

```python
# In any Python script
analyzer = SalesAnalyzer(
  mongo_uri="mongodb://your-host:27017",
  db_name="your-database"
)
```

Or use environment variables in Node.js:

```javascript
// In analyticsService.js
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
```

### Timeout Settings

```javascript
// In analyticsService.js
const pythonProcess = spawn("python", [scriptPath], {
    timeout: 120000, // 120 seconds
});
```

### Python Version

```bash
# Check Python version (required: 3.6+)
python --version

# Specify Python 3 explicitly if needed
spawn("python3", [scriptPath])
```

---

## 🧪 Testing

### Test Individual Python Scripts

```bash
cd analytics

python sales_analysis.py | python -m json.tool
python user_behavior.py | python -m json.tool
python recommendation.py | python -m json.tool
python anomaly_detection.py | python -m json.tool
```

### Test via API

```bash
# Run test script
node server/test-analytics-api.js

# Output:
# ✓ /health
# ✓ /sales
# ✓ /users
# ✓ /recommendations
# ✓ /anomalies
```

### Manual API Test

```javascript
// In Node REPL or script
const http = require("http");

http.get("http://localhost:5000/api/v1/analytics/sales", (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => console.log(JSON.parse(data)));
});
```

---

## 🐛 Troubleshooting

| Issue                         | Solution                                                |
| ----------------------------- | ------------------------------------------------------- |
| **Python not found**          | Ensure Python is in PATH: `which python`                |
| **MongoDB connection failed** | Verify MongoDB is running: `mongod`                     |
| **Module not found**          | Install dependencies: `pip install -r requirements.txt` |
| **JSON parse error**          | Run Python script manually to check output              |
| **Timeout errors**            | Increase timeout or optimize queries                    |
| **File not found**            | Check analytics folder path in analyticsService.js      |

---

## 📈 Performance Tips

### 1. Add Database Indexes

```bash
# In MongoDB
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ createdAt: 1 })
db.userActivity.createIndex({ action: 1 })
db.products.createIndex({ category: 1 })
```

### 2. Implement Caching

```javascript
// Cache results for 5 minutes
const cache = {};
const CACHE_TTL = 5 * 60 * 1000;

const getCachedData = (key, fetcher) => {
    if (cache[key] && Date.now() - cache[key].time < CACHE_TTL) {
        return cache[key].data;
    }
    const data = fetcher();
    cache[key] = { data, time: Date.now() };
    return data;
};
```

### 3. Use Connection Pooling

```python
# In Python scripts
client = MongoClient("mongodb://localhost:27017", maxPoolSize=50)
```

### 4. Limit Result Sets

```python
# In Python scripts - reduce data transfer
pipeline = [{"$limit": 1000}]
```

---

## 🚀 Production Deployment

### Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGO_URI=mongodb://prod-server:27017
DB_NAME=ecommerce

# Analytics
PYTHON_TIMEOUT=120000
ANALYTICS_CACHE_TTL=300000
```

### Docker Compose (Optional)

```yaml
version: "3"
services:
    node:
        build: ./server
        ports:
            - "5000:5000"
        environment:
            - MONGO_URI=mongodb://mongo:27017
        depends_on:
            - mongo

    mongo:
        image: mongo:latest
        ports:
            - "27017:27017"
        volumes:
            - mongo-data:/data/db
```

### Monitoring

```javascript
// Track execution times
pythonProcess.on("close", (code) => {
    const duration = Date.now() - startTime;
    logger.info(`Python script took ${duration}ms`);
});
```

---

## 📚 Files Reference

| File                           | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| `analyticsService.js`          | Core service - Python execution & JSON parsing |
| `analyticsController.js`       | Request handlers - express middleware          |
| `analytics.js`                 | Route definitions                              |
| `ANALYTICS_INTEGRATION.md`     | Full setup & usage guide                       |
| `ANALYTICS_API_EXAMPLES.md`    | Response examples for all endpoints            |
| `test-analytics-api.js`        | Automated API test suite                       |
| `ReactIntegrationExamples.jsx` | React components & hooks                       |

---

## 🔗 Next Steps

1. **Dashboard UI** - Create admin dashboard with Charts.js
2. **Real-time Updates** - Use WebSockets for live data
3. **Scheduled Tasks** - Use APScheduler for periodic analysis
4. **Data Export** - Add CSV/Excel export endpoints
5. **Alerts** - Email/SMS notifications for anomalies
6. **Custom Reports** - User-defined report generation
7. **API Authentication** - Add JWT/API keys
8. **Rate Limiting** - Prevent abuse

---

## 📞 Support

For issues or questions:

1. Check [ANALYTICS_INTEGRATION.md](./ANALYTICS_INTEGRATION.md) for setup help
2. Review [ANALYTICS_API_EXAMPLES.md](./ANALYTICS_API_EXAMPLES.md) for response formats
3. Run `test-analytics-api.js` to diagnose issues
4. Check Node.js console for error messages
5. Run Python scripts manually to verify

---

## 📄 License

Same as your MERN project

---

## ✅ Implementation Checklist

- [x] Python analytics scripts created
- [x] Analytics service layer created (analyticsService.js)
- [x] Controllers created (analyticsController.js)
- [x] Routes created (analytics.js)
- [x] Routes registered in api/index.js
- [x] Python scripts updated to output JSON
- [x] API test script created
- [x] Documentation created
- [x] React integration examples provided
- [ ] Deploy to production
- [ ] Set up monitoring/logging
- [ ] Add authentication to endpoints
- [ ] Create admin dashboard UI
