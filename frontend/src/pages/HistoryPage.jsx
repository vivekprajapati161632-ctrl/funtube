import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

const HistoryPage = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/videos/history/me");
        setItems(data.items || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load history");
      }
    };

    load();
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h4 className="mb-3">Watch history</h4>
      {!items.length && <p className="text-muted">No history yet.</p>}

      <div className="d-grid gap-3">
        {items.map((item) => (
          <Link
            key={item.video._id}
            className="text-decoration-none"
            to={`/watch/${item.video._id}`}
          >
            <div className="card border-0 shadow-sm">
              <div className="card-body py-3">
                <h6 className="mb-1 text-dark">{item.video.title}</h6>
                <p className="mb-1 text-muted small">{item.video.owner?.username}</p>
                <p className="mb-0 text-muted small">Watched: {new Date(item.watchedAt).toLocaleString()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
