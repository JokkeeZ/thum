import SpinnyLoader from "./SpinnyLoader";

export default function CenteredSpinnyLoader() {
  return (
    <div className="d-flex justify-content-center">
      <SpinnyLoader width={50} height={50} />
    </div>
  );
}
