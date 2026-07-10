export default function FilterSidebar({ categories, filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <aside className="filter-sidebar">
      <h4>Category</h4>
      <select value={filters.category || ''} onChange={(e) => update('category', e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <h4>Price</h4>
      <div className="price-range">
        <input
          type="number"
          placeholder="Min"
          value={filters.minPrice || ''}
          onChange={(e) => update('minPrice', e.target.value)}
        />
        <span>&ndash;</span>
        <input
          type="number"
          placeholder="Max"
          value={filters.maxPrice || ''}
          onChange={(e) => update('maxPrice', e.target.value)}
        />
      </div>

      <h4>Sort by</h4>
      <select value={filters.sort || ''} onChange={(e) => update('sort', e.target.value)}>
        <option value="">Newest</option>
        <option value="priceAsc">Price: low to high</option>
        <option value="priceDesc">Price: high to low</option>
        <option value="rating">Top rated</option>
      </select>

      <button className="clear-filters" onClick={() => onChange({})}>
        Clear filters
      </button>
    </aside>
  );
}
