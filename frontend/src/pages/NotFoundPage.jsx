import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="text-center py-5">
      <h1 className="display-5">404</h1>
      <p className="text-muted">Page not found</p>
      <Link to="/" className="btn btn-danger">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
