const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Realty = require('../models/realtyModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const realty = await Realty.findById(req.params.realtyId);

  // 2) Create checkout session

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?realty=${
      req.params.realtyId
    }&user=${req.user.id}&price=${realty.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${realty.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${realty.name} Tour`,
        description: realty.summary,
        images: [`https://www.natours.dev/img/realty/${realty.imageCover}`],
        amount: realty.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only temporary, because we it's unsecure
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.setUserBookingIds = (req, res, next) => {
  if (!req.body.booking) req.body.booking = req.params.bookingId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
