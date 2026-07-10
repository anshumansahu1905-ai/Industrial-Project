import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import RecommendationRail from '../components/RecommendationRail';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  function loadProduct() {
    api.get(`/products/${id}`).then((res) => setProduct(res.data));
  }

  useEffect(() => {
    loadProduct();
    api.get(`/recommendations/product/${id}`).then((res) => setSimilar(res.data));
  }, [id]);

  async function handleAddToCart() {
    await addItem(id, quantity);
    setAddedMessage('Added to cart');
    setTimeout(() => setAddedMessage(''), 2000);
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    await api.post(`/products/${id}/reviews`, reviewForm);
    setReviewForm({ rating: 5, comment: '' });
    loadProduct();
  }

  if (!product) return <p className="loading">Loading...</p>;

  const alreadyReviewed = user && product.reviews.some((r) => r.user?._id === user._id);

  return (
    <div className="product-detail">
      <div className="product-detail-grid">
        <div className="product-image-large">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="image-placeholder large">{product.name.charAt(0)}</div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="category">{product.category}</p>
          {product.avgRating > 0 && (
            <p className="rating">
              ★ {product.avgRating} ({product.reviews.length} reviews)
            </p>
          )}
          <p className="price-large">${product.price.toFixed(2)}</p>
          <p className="description">{product.description}</p>

          {product.stock > 0 ? (
            <div className="add-to-cart-row">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <button className="btn-primary" onClick={handleAddToCart}>
                Add to cart
              </button>
              {addedMessage && <span className="added-toast">{addedMessage}</span>}
            </div>
          ) : (
            <p className="out-of-stock">Currently out of stock</p>
          )}
        </div>
      </div>

      <RecommendationRail title="You might also like" products={similar} />

      <section className="reviews-section">
        <h2>Reviews</h2>
        {product.reviews.length === 0 && <p>No reviews yet.</p>}
        {product.reviews.map((r, idx) => (
          <div className="review" key={idx}>
            <strong>{r.user?.name || 'Anonymous'}</strong>
            <span className="rating"> ★ {r.rating}</span>
            <p>{r.comment}</p>
          </div>
        ))}

        {user && !alreadyReviewed && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h4>Leave a review</h4>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <textarea
              placeholder="What did you think?"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
            <button type="submit" className="btn-secondary">
              Submit review
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
