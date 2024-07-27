const path = require("path");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const realtyRouter = require("./routes/realtyRoutes");
const bookingRouter = require("./routes/bookingRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");

const app = express();
app.use(cors());

app.set("trust proxy", ["88.85.72.203", "88.85.72.203"]);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests. Please try again later",
});

// GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
app.use("/api", limiter);

// Body parser with limit on 10kb, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "price",
      "maxGroupSize",
      "difficulty",
    ],
  })
);

app.use(compression());

// Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

// ROUTE HANDLES

// ROUTES

app.use("/", viewRouter);
app.use("/api/v1/realty", realtyRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
