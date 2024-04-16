const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const globalErrorHandler = require("./controller/errorController");
const AppError = require("./utils/appError");

const userAuthRouter = require("./routes/userRoute");
const staffRouter = require("./routes/staffRoute");

dotenv.config({ path: "./.env" });

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

// const corsOptions = {
//   origin: "http://example.com",
//   optionsSuccessStatus: 200,
//   methods: "GET, POST",
// };

// app.use(cors(corsOptions));


// routes
app.use("/api/v1/auth", userAuthRouter);
app.use("/api/v1/staff", staffRouter);


app.all("/", (req, res, next) => {
    res.send("This is the EV Franchise Booking")
});

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("DB connection success"));

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`Server running to port ${PORT}`);
});

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err);
    console.log(err.name, err.message);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});