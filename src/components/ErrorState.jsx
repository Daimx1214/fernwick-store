// Catalogue error state with retry — Spec Sec. 7.1 / 17.
export default function ErrorState({ error, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <h2 className="error-state__title">Could not load products</h2>
      <p className="error-state__text">
        {error?.message || 'Something went wrong while fetching the catalogue.'}
      </p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
