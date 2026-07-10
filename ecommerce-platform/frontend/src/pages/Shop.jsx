import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setFilters((f) => ({ ...f, q }));
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = { ...filters, page };
    api
      .get('/products', { params })
      .then((res) => {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  function handleFilterChange(next) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="shop-page">
      <FilterSidebar categories={categories} filters={filters} onChange={handleFilterChange} />

      <div className="shop-results">
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products match those filters.</p>
        ) : (
          <>
            <div className="product-grid">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
