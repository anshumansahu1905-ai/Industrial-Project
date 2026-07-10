import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, subtotal, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="empty-state">
        <p>You need to be logged in to view your cart.</p>
        <Link to="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <p>Your cart is empty.</p>
        <Link to="/shop" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your cart</h1>

      <div className="cart-items">
        {cart.items.map(({ product, quantity }) => (
          <div className="cart-item" key={product._id}>
            <div className="cart-item-image">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="image-placeholder">{product.name.charAt(0)}</div>
              )}
            </div>
            <div className="cart-item-info">
              <Link to={`/product/${product._id}`}>{product.name}</Link>
              <p>${product.price.toFixed(2)}</p>
            </div>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => updateItem(product._id, Number(e.target.value))}
            />
            <button className="link-button" onClick={() => removeItem(product._id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="tax-note">Tax and shipping calculated at checkout</p>
        <button className="btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
