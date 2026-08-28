import { Link, useLocation } from "react-router-dom";

const NotFoundPage = () => {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <main>
      <h1>{message ? "Room unavailable" : "Page not found"}</h1>
      <p>{message || "The page you are looking for does not exist."}</p>
      <Link to="/">Go back home</Link>
    </main>
  );
};

export default NotFoundPage;
