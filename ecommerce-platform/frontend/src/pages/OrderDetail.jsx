import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

export default function OrderDetail() {
  const { id } = useParams();
  const { refreshCart } = useCart();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
    // the webhook clears the cart server-side once payment succeeds; refresh
    // our local copy so the navbar badge updates too
    refreshCart();
  }, [id]);

  if (!order) return <p className="loading">Loading order...</p>;

  return (
    <div className="order-detail">
      <h1>Order #{order._id.slice(-6)}</h1>
      <p className={`order-status status-${order.status}`}>Status: {order.status}</p>

      {order.status === 'pending' && (
        <p className="pending-note">
          Payment is still processing. This page will update once it's confirmed.
        </p>
      )}

      <div className="order-items">
        {order.items.map((item, idx) => (
          <div className="summary-row" key={idx}>
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="order-totals">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax</span>
          <span>${order.tax.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
