const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");

const app = express();
const port = 5000;

const { connect } = require("./db");
const authRoutes = require('./Routes/auth');
const postRoutes = require('./Routes/post');
const router = require("./Routes/index");

// ✅ DB Connection
connect();

// ✅ CORS - must come first
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // only if you're using cookies or auth headers
}));

// ✅ Middleware
app.use(bodyparser.json({ limit: "50mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api', router);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("hello this is internshala backend");
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
