import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="image-placeholder">{product.name.charAt(0)}</div>
        )}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="category">{product.category}</p>
        <div className="price-row">
          <span className="price">${product.price.toFixed(2)}</span>
          {product.avgRating > 0 && <span className="rating">★ {product.avgRating}</span>}
        </div>
        {product.stock === 0 && <span className="out-of-stock">Out of stock</span>}
      </div>
    </Link>
  );
}
