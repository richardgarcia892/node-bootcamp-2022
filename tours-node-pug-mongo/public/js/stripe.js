/* eslint-disable */
const stripe = Stripe(
  'pk_test_51NkqXfCHtu9c51mpW845xdEG1vsHa9k4IzWQ7pHmbKS1lqh8CozuUQroyXS9fwTFwnvAP7VyAfhfm08g5yyAiBP400T6wd6kjg'
);

const bookBtn = document.getElementById('book-tour');

export const bookTour = async tourId => {
  try {
    // GET checkout session from API
    const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    // Create checkout form and charge credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('Error', err);
  }
};

if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.textContext = 'Processing...';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
