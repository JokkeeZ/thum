export default function SpinnyLoader(props: { width: number; height: number }) {
  return (
    <div
      className="spinner-border text-danger"
      style={{ width: props.width, height: props.height }}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
