import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import { getProduct } from '../api/products.js';
import { useCart } from '../state/CartContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { useUi } from '../state/UiContext.jsx';
import { CATEGORY_LABELS, uiCategoryFor } from '../utils/categories.js';
import Rating from '../components/Rating.jsx';
import PriceTag from '../components/PriceTag.jsx';
import QuantityStepper from '../components/QuantityStepper.jsx';
import ProductGrid from '../components/ProductGrid.jsx';

// Product page — Spec Sec. 7.2. Uses the cached catalogue first; a direct
// visit for an id outside the list falls back to GET /products/{id}.
// An unknown id renders the NotFound content in-page, never a crash.
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, items } = useProducts();
  const { addToCartWithQty, openDrawer } = useCart();
  const { isLoggedIn } = useAuth();
  const { openCheckout } = useUi();
  const [extra, setExtra] = useState(null);
  const [extraFailed, setExtraFailed] = useState(false);
  const [qty, setQty] = useState(1);

  const numericId = Number(id);
  const fromList = items.find((p) => p.id === numericId);
  const product = fromList || extra;

  useEffect(() => {
    setQty(1);
    setExtra(null);
    setExtraFailed(false);
  }, [id]);

  useEffect(() => {
    if (status !== 'success' || fromList || extra || extraFailed) return;
    if (!Number.isInteger(numericId)) {
      setExtraFailed(true);
      return;
    }
    getProduct(numericId)
      .then((p) => setExtra(p))
      .catch(() => setExtraFailed(true));
  }, [status, fromList, extra, extraFailed, numericId]);

  if (status === 'loading') {
    return (
      <main className="container page">
        <p role="status">Loading product…</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container page">
        <div className="notfound">
          <p className="notfound__code">404</p>
          <h1 className="notfound__title">That product is not on our shelves</h1>
          <p className="notfound__text">
            It may have sold out, or the link may have a typo. The rest of the catalogue is
            still here.
          </p>
          <Link to="/" className="btn btn--primary">
            Back to store
          </Link>
        </div>
      </main>
    );
  }

  const related = items
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const categoryLabel = CATEGORY_LABELS[uiCategoryFor(product.category)];

  const handleAdd = () => {
    if (addToCartWithQty(product, qty)) openDrawer();
  };

  const handleBuyNow = () => {
    if (!addToCartWithQty(product, qty)) return;
    if (!isLoggedIn) {
      navigate('/login?next=checkout');
    } else {
      openCheckout();
    }
  };

  return (
    <main className="container page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/?cat=${uiCategoryFor(product.category)}`}>{categoryLabel}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.title}</span>
      </nav>

      <div className="product-detail">
        <div className="product-detail__media">
          <img src={product.image} alt={product.title} width="700" height="700" />
        </div>
        <div className="product-detail__info">
          <p className="card__category">{categoryLabel}</p>
          <h1 className="product-detail__title">{product.title}</h1>
          <Rating rate={product.rating.rate} count={product.rating.count} />
          <PriceTag price={product.price} className="product-detail__price" />
          <p className="product-detail__desc">{product.description}</p>

          <div className="product-detail__buy">
            <QuantityStepper
              qty={qty}
              label={product.title}
              onIncrement={() => setQty((q) => Math.min(10, q + 1))}
              onDecrement={() => setQty((q) => Math.max(1, q - 1))}
            />
            <button type="button" className="btn btn--primary" onClick={handleAdd}>
              Add to cart
            </button>
            <button type="button" className="btn btn--secondary" onClick={handleBuyNow}>
              Buy now
            </button>
          </div>

          <ul className="product-detail__facts">
            <li>Ships in 2–3 business days</li>
            <li>Free returns within 30 days</li>
            <li>Free shipping on orders over $100</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related" aria-label="Related products">
          <h2 className="related__title">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </main>
  );
}
