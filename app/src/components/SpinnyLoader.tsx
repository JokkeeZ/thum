export default function SpinnyLoader(props: { width: number; height: number }) {
  return (
    <div className="spinner-border text-primary" role="status"
      style={{ width: props.width, height: props.height }}>
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}
