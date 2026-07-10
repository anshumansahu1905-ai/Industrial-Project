import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}`,
      },
    });

    if (confirmError) {
      setError(confirmError.message);
      setSubmitting(false);
    }
    // on success, Stripe redirects to return_url automatically
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement />
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={!stripe || submitting}>
        {submitting ? 'Processing...' : 'Pay now'}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { cart, subtotal } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [starting, setStarting] = useState(false);

  async function startCheckout(e) {
    e.preventDefault();
    setStarting(true);
    const { data } = await api.post('/orders/checkout', { shippingAddress: address });
    setClientSecret(data.clientSecret);
    setOrderId(data.order._id);
    setStarting(false);
  }

  if (clientSecret) {
    return (
      <div className="checkout-page">
        <h1>Payment</h1>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm orderId={orderId} />
        </Elements>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-grid">
        <form className="address-form" onSubmit={startCheckout}>
          <h3>Shipping address</h3>
          <input
            placeholder="Address line 1"
            required
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
          />
          <input
            placeholder="Address line 2 (optional)"
            value={address.line2}
            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
          />
          <div className="form-row">
            <input
              placeholder="City"
              required
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
            <input
              placeholder="State"
              required
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
          </div>
          <div className="form-row">
            <input
              placeholder="Postal code"
              required
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            />
            <input
              placeholder="Country"
              required
              value={address.country}
              onChange={(e) => setAddress({ ...address, country: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={starting}>
            {starting ? 'Loading...' : 'Continue to payment'}
          </button>
        </form>

        <div className="order-summary">
          <h3>Order summary</h3>
          {cart.items.map(({ product, quantity }) => (
            <div className="summary-row" key={product._id}>
              <span>
                {product.name} × {quantity}
              </span>
              <span>${(product.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
