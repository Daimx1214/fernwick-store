import { Link } from 'react-router-dom';

// 404 page — Spec Sec. 7.5.
export default function NotFound() {
  return (
    <main className="container page">
      <div className="notfound">
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">This aisle does not exist</h1>
        <p className="notfound__text">
          The page you are looking for has wandered off the shop floor. Let us take you back
          to the shelves.
        </p>
        <Link to="/" className="btn btn--primary">
          Back to store
        </Link>
      </div>
    </main>
  );
}
