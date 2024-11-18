import { useAuthToken } from "../AuthTokenContext";
import "../styles/debug.css";

export default function Debug() {
  const { accessToken } = useAuthToken();

  return (
    <div className="debug-container">
      <div className="debug-title-container">
        <h3 className="debug-title"> Access Token </h3>
      </div>
      <div className="debug-token">{accessToken}</div>
    </div>
  );
}
