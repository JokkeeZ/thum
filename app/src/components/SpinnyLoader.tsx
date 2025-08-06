export default function SpinnyLoader(props: { width: number; height: number }) {
  return (
    <div
      className="spinny-loader"
      id="spinner"
      style={{ width: props.width, height: props.height }}
    ></div>
  );
}
