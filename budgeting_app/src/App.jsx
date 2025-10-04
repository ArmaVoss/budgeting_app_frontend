import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

async function refreshAccessToken() {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/jwt/refresh",
      {},
      { withCredentials: true }
    );
    return { status: true, body: response.data };
  } catch (error) {
    if (error.response) {
      return { status: false, body: error.response.data };
    }
    return { status: false, body: null };
  }
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {``
      const refreshResponse = await refreshAccessToken();

      if (refreshResponse.status) {
        navigate("/home");
      } else {
        navigate("/login", { state: { backendApiLoginUrl: refreshResponse.body } });
      }
    })();
  }, [navigate]);

  return <></>;
}

export default App;
