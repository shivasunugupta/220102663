import React, { useState } from "react";

function App() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [expiry, setExpiry] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
        setExpiry(data.expiry);
      } else {
        alert("Error: " + (data.message || "Something went wrong"));
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ padding: "8px", width: "300px" }}
        />
        <button type="submit" style={{ marginLeft: "10px", padding: "8px 16px" }}>
          Shorten
        </button>
      </form>

      {shortUrl && (
        <div style={{ marginTop: "20px" }}>
          <p>Shortened URL:</p>
          <a href={shortUrl} target="_blank" rel="noreferrer">
            {shortUrl}
          </a>
          {
            expiry && <p> The URL will Expire at: {new Date(expiry).toLocaleString()}
            </p>
          }

        </div>
      )}
    </div>
  );
}

export default App;
