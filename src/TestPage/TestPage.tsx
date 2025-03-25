// TestPage.tsx
// └─RUN `npm i`

import { useState, useEffect } from "react";
import JSZip from "jszip";
import { MiniKit } from "@worldcoin/minikit-js";
// └─FOR TESTING DOWNLOADING ZIPPED FILES
import "./TestPage.scss";

const remoteFiles = {
  txt: "https://storage.bridge.cm/example.txt",
  mp4: "https://media.bridge.cm/dummy-files/ab35927f-a9a6-426f-8146-f60c4f73a120.mp4",
  jpg: "https://media.bridge.cm/dummy-files/4daa1e15-b2f4-4be7-bce2-fc71f0ce376c.jpg",
  zip: "https://storage.bridge.cm/Archive.zip",
};

export default function TestPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedRemoteVariant, setSelectedRemoteVariant] =
    useState<string>("txt");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isWorldApp, setIsWorldApp] = useState<boolean>(false);

  // Check if running in World App
  useEffect(() => {
    const isInWorldApp = MiniKit.isInstalled();
    setIsWorldApp(isInWorldApp);
    console.log("Running in World App:", isInWorldApp);
  }, []);

  const fetchRemoteFile = async () => {
    const link = remoteFiles[selectedRemoteVariant as keyof typeof remoteFiles];
    if (!link) {
      console.error("No remote file for the selected variant");
      return;
    }

    try {
      // If in World App, use MiniKit to handle files
      if (isWorldApp) {
        // Implement MiniKit file handling here when available
        // This is a placeholder for when the MiniKit file handling API is available
        console.log("Using MiniKit to handle file:", link);
        alert("MiniKit file handling coming soon!");
        return;
      }

      // Fallback to standard fetch for browsers
      const response = await fetch(link);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      // Handle different file types
      if (selectedRemoteVariant === "txt") {
        const text = await blob.text();
        setFileContent(text);
      } else if (selectedRemoteVariant === "jpg") {
        const imageUrl = URL.createObjectURL(blob);
        setFileContent(imageUrl);
      } else {
        // For other file types, create a direct download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          link.split("/").pop() || `remoteFile.${selectedRemoteVariant}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error fetching file:", error);
      alert("Failed to fetch file. Please try again.");
    }
  };

  const downloadLocalFile = () => {
    if (selectedFiles.length === 0) {
      console.log("No files selected");
      return;
    }

    selectedFiles.forEach((file) => {
      console.log(`Downloading: ${file.name}`);
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const downloadLocalFileZip = async () => {
    if (selectedFiles.length === 0) {
      console.log("No files selected");
      return;
    }

    const zip = new JSZip();

    selectedFiles.forEach((file) => {
      zip.file(file.name, file);
    });

    try {
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "files.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating zip file:", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(event.target.files || []),
      ]);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setFileContent(null);
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="test-page">
      <h1>File Storage Mini App</h1>
      {isWorldApp && (
        <div className="world-app-badge">
          <span>Running in World App</span>
        </div>
      )}

      <div className="remote-download">
        <div className="remote-controls">
          <label htmlFor="remoteFileSelect">Select remote file:</label>
          <select
            id="remoteFileSelect"
            value={selectedRemoteVariant}
            onChange={(e) => setSelectedRemoteVariant(e.target.value)}
            className="file-select"
          >
            {Object.keys(remoteFiles).map((key) => (
              <option key={key} value={key}>
                {key.toUpperCase()}
              </option>
            ))}
          </select>
          <button onClick={fetchRemoteFile} className="download-button">
            Fetch File
          </button>
        </div>

        {fileContent && (
          <div className="file-preview">
            {selectedRemoteVariant === "txt" ? (
              <pre className="text-preview">{fileContent}</pre>
            ) : selectedRemoteVariant === "jpg" ? (
              <img src={fileContent} alt="Preview" className="image-preview" />
            ) : null}
          </div>
        )}
      </div>

      <div className="horizontal-divider" />

      <div className="file-operations">
        <h2>Local Files</h2>
        <button onClick={downloadLocalFile}>Download selected file(s)</button>
        <button onClick={downloadLocalFileZip}>
          Download selected file(s) - zip
        </button>
        <input type="file" multiple onChange={handleFileChange} />
      </div>

      {selectedFiles.length > 0 && (
        <div className="file-list-container">
          <div className="file-list-header">
            <h3>Selected Files:</h3>
            <button onClick={clearSelection} className="clear-button">
              Clear selection
            </button>
          </div>
          <div className="file-list">
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-name">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
