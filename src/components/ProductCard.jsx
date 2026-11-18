import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBadges } from '../utils/badges.js';
import { CATEGORY_LABELS, uiCategoryFor } from '../utils/categories.js';
import { useCart } from '../state/CartContext.jsx';
import Badge from './Badge.jsx';
import Rating from './Rating.jsx';
import PriceTag from './PriceTag.jsx';
import { CheckIcon } from './icons.jsx';

// Placeholder shown if a product image fails to load — Spec Sec. 17:
// a neutral tile with the product's initial, same box so layout never jumps.
function placeholderSrc(title) {
  const letter = (title || 'F').trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='600' height='600' fill='#EFE8DA'/><text x='50%' y='54%' font-family='Georgia, serif' font-size='220' fill='#5F655E' text-anchor='middle'>${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Product card — Spec Sec. 7.1. Whole card links to the product page
// except the Add button; Add shows a 900ms 'Added' state.
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image);
  const timer = useRef(null);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);
  useEffect(() => setImgSrc(product.image), [product.image]);

  const badges = getBadges(product);
  const categoryLabel = CATEGORY_LABELS[uiCategoryFor(product.category)];

  const handleAdd = () => {
    if (addToCart(product)) {
      setAdded(true);
      timer.current = setTimeout(() => setAdded(false), 900);
    }
  };

  return (
    <li className="card">
      <Link to={`/product/${product.id}`} className="card__link" aria-label={product.title}>
        <span className="card__tile">
          <img
            src={imgSrc}
            alt={product.title}
            loading="lazy"
            width="600"
            height="600"
            onError={() => setImgSrc(placeholderSrc(product.title))}
          />
          {badges.length > 0 && (
            <span className="card__badges">
              {badges.map((b) => (
                <Badge key={b.key} badge={b} />
              ))}
            </span>
          )}
        </span>
        <span className="card__body">
          <span className="card__category">{categoryLabel}</span>
          <span className="card__title" title={product.title}>
            {product.title}
          </span>
          <Rating rate={product.rating.rate} count={product.rating.count} />
          <PriceTag price={product.price} className="card__price" />
        </span>
      </Link>
      <div className="card__actions">
        <button
          type="button"
          className={`btn btn--add${added ? ' btn--added' : ''}`}
          onClick={handleAdd}
          aria-live="off"
        >
          {added ? (
            <>
              <CheckIcon size={16} /> Added
            </>
          ) : (
            'Add to cart'
          )}
        </button>
      </div>
    </li>
  );
}
