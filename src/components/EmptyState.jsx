// Generic empty state — Spec Sec. 7.1.
export default function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <h2 className="empty-state__title">{title}</h2>
      {text && <p className="empty-state__text">{text}</p>}
      {actionLabel && (
        <button type="button" className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
