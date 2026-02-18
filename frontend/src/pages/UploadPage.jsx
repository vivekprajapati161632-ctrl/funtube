import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const UploadPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!thumbnail || !videoFile) {
      setError("Thumbnail and video file are required");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("tags", form.tags);
    payload.append("thumbnail", thumbnail);
    payload.append("video", videoFile);

    try {
      setLoading(true);
      const { data } = await api.post("/videos", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate(`/watch/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h4 className="mb-3">Upload a video</h4>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form className="d-grid gap-3" onSubmit={onSubmit}>
              <input className="form-control" name="title" placeholder="Title" onChange={onChange} required />
              <textarea className="form-control" name="description" rows="4" placeholder="Description" onChange={onChange} />
              <input className="form-control" name="tags" placeholder="Tags (comma separated)" onChange={onChange} />
              <input
                className="form-control"
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                required
              />
              <input
                className="form-control"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                required
              />
              <button className="btn btn-danger" disabled={loading}>
                {loading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
