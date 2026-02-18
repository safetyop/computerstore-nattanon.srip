const express = require("express");
const path = require("path");

const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// HTML Pages
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "index.html"))
);
app.get("/add", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "add.html"))
);
app.get("/edit", (req, res) =>
  res.sendFile(path.join(__dirname, "views", "edit.html"))
);

// API
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
