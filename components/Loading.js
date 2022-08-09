import { Circle } from "better-react-spinkit";

const Loading = () => {
  return (
    <center className="grid place-items-center h-screen">
      <div>
        <img
          className="mb-3 h-40"
          src="http://assets.stickpng.com/images/580b57fcd9996e24bc43c543.png"
          alt=""
        />
        <Circle color="#3CBC28" size={60} />
      </div>
    </center>
  );
};

export default Loading;
