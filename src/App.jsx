import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import Toast from './components/Toast.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Store from './pages/Store.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Orders from './pages/Orders.jsx';
import NotFound from './pages/NotFound.jsx';

// App layout — Spec Sec. 7: announcement bar, navbar, routed page, footer,
// with the cart drawer and checkout modal mounted above everything.
export default function App() {
  return (
    <div className="app">
      <p className="announcement">Free shipping on orders over $100</p>
      <Navbar />
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <Orders />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <CartDrawer />
      <CheckoutModal />
      <Toast />
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <h2 className="footer__heading">Shop</h2>
          <ul>
            <li><Link to="/?cat=electronics">Electronics</Link></li>
            <li><Link to="/?cat=jewelry">Jewelry</Link></li>
            <li><Link to="/?cat=clothing">Clothing</Link></li>
            <li><Link to="/">Everything</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer__heading">Help</h2>
          <ul>
            <li><Link to="/orders">My orders</Link></li>
            <li><Link to="/login">Log in</Link></li>
            <li><span>Free returns within 30 days</span></li>
            <li><span>Ships in 2–3 business days</span></li>
          </ul>
        </div>
        <div>
          <h2 className="footer__heading">About</h2>
          <p className="footer__about">
            Fernwick &amp; Co. is a small storefront with a simple rule: stock less, choose
            well, and price it honestly. Every piece in the catalogue is one we would keep on
            our own shelves at home.
          </p>
        </div>
      </div>
      <p className="container footer__small">
        Fernwick &amp; Co. — a demonstration storefront. Product data from FakeStoreAPI;
        checkout is simulated and no real payment is taken.
      </p>
    </footer>
  );
}
