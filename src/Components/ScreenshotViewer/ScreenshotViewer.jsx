import React, { useState } from "react";
import "./screenshotViewer.css";

function ScreenshotViewer({ screenshots, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < screenshots.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Screenshot Viewer</h2>
        <img
          src={screenshots[currentIndex]}
          alt={`Screenshot ${currentIndex + 1}`}
          className="modal-screenshot"
        />
        <div className="modal-navigation">
          <button onClick={prevImage} disabled={currentIndex === 0}>
            Previous
          </button>
          <button
            onClick={nextImage}
            disabled={currentIndex === screenshots.length - 1}
          >
            Next
          </button>
        </div>
        <p>
          Screenshot {currentIndex + 1} of {screenshots.length}
        </p>
      </div>
    </div>
  );
}

export default ScreenshotViewer;
