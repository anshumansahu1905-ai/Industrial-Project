import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import RecommendationRail from '../components/RecommendationRail';

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [forYou, setForYou] = useState([]);

  useEffect(() => {
    api.get('/products?sort=newest&limit=8').then((res) => setFeatured(res.data.products));
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/recommendations/for-you').then((res) => setForYou(res.data));
  }, [user]);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>Gear for the way you actually live.</h1>
          <p>Thoughtfully made goods, shipped fast, backed by a real return policy.</p>
          <Link to="/shop" className="btn-primary">
            Browse the shop
          </Link>
        </div>
      </section>

      {user && <RecommendationRail title="Picked for you" products={forYou} />}

      <section className="product-grid-section">
        <h2>New arrivals</h2>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
