import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go back home</Link>
    </main>
  );
};

export default NotFoundPage;