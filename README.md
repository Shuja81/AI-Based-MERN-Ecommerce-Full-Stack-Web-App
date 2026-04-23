# MERN Ecommerce

## Description

An ecommerce store built with MERN stack, and utilizes third party API's. This ecommerce store enable three main different flows or implementations:

1. Buyers browse the store categories, products and brands
2. Sellers or Merchants manage their own brand component
3. Admins manage and control the entire store components 

### Features:

  * Node provides the backend environment for this application
  * Express middleware is used to handle requests, routes
  * Mongoose schemas to model the application data
  * React for displaying UI components
  * Redux to manage application's state
  * Redux Thunk middleware to handle asynchronous redux actions

## Demo

This application is deployed on Vercel Please check it out :smile: [here](https://mern-store-gold.vercel.app).

See admin dashboard [demo](https://mernstore-bucket.s3.us-east-2.amazonaws.com/admin.mp4)

## Docker Guide

To run this project locally you can use docker compose provided in the repository. Here is a guide on how to run this project locally using docker compose.

Clone the repository
```
git clone https://github.com/mohamedsamara/mern-ecommerce.git
```

Edit the `docker-compose.yml` file and update the values for `MONGO_URI` and `JWT_SECRET`.

Then start Docker Compose:

```
docker-compose build
docker-compose up
```

## Database Seed

* The seed command will create an admin user in the database
* The email and password are passed with the command as arguments
* Like below command, replace brackets with email and password. 
* For more information, see code [here](server/utils/seed.js)

```
npm run seed:db [email-***@****.com] [password-******] // This is just an example.
```

## Install

`npm install` in the project root will install dependencies in both `client` and `server`. [See package.json](package.json)

Some basic Git commands are:

```
git clone https://github.com/mohamedsamara/mern-ecommerce.git
cd project
npm install
```

## ENV

Create `.env` files for both client and server.

- Frontend env example: `client/.env.example`
- Backend env example: create `server/.env` with values such as `BASE_API_URL`, `MONGO_URI`, and `JWT_SECRET`


## Start development

```
npm run dev
```

This root command runs both client and server in parallel:

- `npm run dev:client` → starts the React app in `client`
- `npm run dev:server` → starts the Express backend in `server`

## Python Analytics Integration

A new `analytics/` folder is available for MongoDB-powered analytics.
These scripts connect directly to MongoDB, generate analysis with `pandas`/`pymongo`, and output JSON for the Node.js backend.

### Files added

- Python analytics:
  - `analytics/sales_analysis.py`
  - `analytics/user_behavior.py`
  - `analytics/recommendation.py`
  - `analytics/anomaly_detection.py`
  - `analytics/requirements.txt`
- Node.js integration:
  - `server/services/analyticsService.js`
  - `server/controllers/analyticsController.js`
  - `server/routes/api/analytics.js`
  - `server/test-analytics-api.js`
  - `server/ANALYTICS_INTEGRATION.md`
  - `server/ANALYTICS_API_EXAMPLES.md`

### Analytics API endpoints

These routes are mounted under the API prefix defined by `BASE_API_URL` in `server/.env`.

- `GET /<BASE_API_URL>/analytics/sales`
- `GET /<BASE_API_URL>/analytics/users`
- `GET /<BASE_API_URL>/analytics/recommendations`
- `GET /<BASE_API_URL>/analytics/anomalies`
- `GET /<BASE_API_URL>/analytics/health`

> Example: if `BASE_API_URL=v1`, use `/v1/analytics/sales`

### Setup

1. Install Python dependencies:

```bash
cd analytics
pip install -r requirements.txt
```

2. Make sure MongoDB is running.
3. Update `server/.env` with your backend settings, including `BASE_API_URL`, `MONGO_URI`, and `JWT_SECRET`.

### Test the analytics integration

```bash
cd server
node test-analytics-api.js
```

### Run Python analytics scripts manually

```bash
cd analytics
python sales_analysis.py
python user_behavior.py
python recommendation.py
python anomaly_detection.py
```

## Languages & tools

- [Node](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [React](https://reactjs.org/)
- [Webpack](https://webpack.js.org/)

### Code Formatter

- Add a `.vscode` directory
- Create a file `settings.json` inside `.vscode`
- Install Prettier - Code formatter in VSCode
- Add the following snippet:

```json
{
  "editor.formatOnSave": true,
  "prettier.singleQuote": true,
  "prettier.arrowParens": "avoid",
  "prettier.jsxSingleQuote": true,
  "prettier.trailingComma": "none",
  "javascript.preferences.quoteStyle": "single"
}
```


