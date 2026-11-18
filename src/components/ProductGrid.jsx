import ProductCard from './ProductCard.jsx';

// Product grid — Spec Sec. 14 (CSS Grid, ul/li semantics per Sec. 15).
export default function ProductGrid({ products }) {
  return (
    <ul className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </ul>
  );
}
