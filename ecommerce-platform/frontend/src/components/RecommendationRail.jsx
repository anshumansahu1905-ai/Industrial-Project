import ProductCard from './ProductCard';

export default function RecommendationRail({ title, products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="recommendation-rail">
      <h3>{title}</h3>
      <div className="rail-scroll">
        {products.map((p) => (
          <div className="rail-item" key={p._id}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
