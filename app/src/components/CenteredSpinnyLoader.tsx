import SpinnyLoader from "./SpinnyLoader";

export default function CenteredSpinnyLoader() {
  return (
    <div className="d-flex justify-content-center mt-4">
      <SpinnyLoader width={50} height={50} />
    </div>
  );
}
