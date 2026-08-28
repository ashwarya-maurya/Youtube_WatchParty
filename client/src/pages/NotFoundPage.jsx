import { Link, useLocation } from "react-router-dom";

const NotFoundPage = () => {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <p className="eyebrow">WATCH PARTY</p>
        <p className="not-found-code">404</p>
        <h1>{message ? "Room unavailable" : "Page not found"}</h1>
        <p className="not-found-message">
          {message || "The page you are looking for does not exist."}
        </p>
        <Link className="primary-link" to="/">
          Back to home
        </Link>
      </section>
    </main>
  );
};

export default NotFoundPage;
