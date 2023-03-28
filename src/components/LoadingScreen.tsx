import { CgSpinner } from "react-icons/cg";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-black opacity-60 flex justify-center items-center">
      <div>
        <CgSpinner className="text-white text-6xl animate-spin" />
      </div>
    </div>
  );
};

export default LoadingScreen;
