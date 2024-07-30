require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const connectDB = require("./config/database");

const bookModel = require("./models/books.model");
const userRouter = require("./routes/user.route");
const bookRouter = require("./routes/book.route");

const authenticate = require("./middleware/auth.middleware");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for handling CORS POLICY
// Option 1: Default Configuration for CORS (Allow All Origins with Default of cors(*))
// {
//   "origin": "*",
//   "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
//   "preflightContinue": false,
//   "optionsSuccessStatus": 204
// }

app.use(cors());
// Option 2: Allow Custom Origins
// app.use(
//   cors({
//     origin: 'http://localhost:3000',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type'],
//   })
// );

//base url
// app.use(path, handler)

app.use("/api/user", userRouter);
app.use("/api/book", bookRouter);

app.get("/", (req, res) => {
  res.json({ msg: "Hello world" });
});

const PORT = process.env.PORT || 5000;

app.post("/api/books");

app.get("/api/books/", authenticate, async (req, res) => {
  try {
    const books = await bookModel.find();
    res.status(200).json({ success: true, books, totalBooks: books.length });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET a single book from id
app.get("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // database query
    const book = await bookModel.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json({ success: true, book });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT request to update a book by id
app.put("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await bookModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      return res.status(404).json({ success: true, message: "Book not found" });
    }
    res.status(200).json({ success: true, message: "Book data updated", book });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//delete req
app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await bookModel.findByIdAndDelete(id);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Book deleted successfully", book });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: err.message,
    });
  }
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

startServer();