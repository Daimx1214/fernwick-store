import { useUi } from '../state/UiContext.jsx';

// Toast — Spec Sec. 13: inverted colours, bottom centre, 3s, announced
// politely. The UiContext owns the timer.
export default function Toast() {
  const { toast } = useUi();
  return (
    <div className="toast-region" aria-live="polite" role="status">
      {toast && (
        <div key={toast.id} className="toast">
          {toast.message}
        </div>
      )}
    </div>
  );
}
