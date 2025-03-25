// TestPage.tsx
// └─RUN `npm i`

import { useState } from "react";
import JSZip from "jszip";
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

    const downloadRemoteFile = async () => {
        const link =
            remoteFiles[selectedRemoteVariant as keyof typeof remoteFiles];
        if (!link) {
            console.error("No remote file for the selected variant");
            return;
        }
        console.log(`Downloading remote file from: ${link}`);
        try {
            const response = await fetch(link);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download =
                link.split("/").pop() || `remoteFile.${selectedRemoteVariant}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading remote file:", error);
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
        const fileInput = document.querySelector(
            'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = "";
        }
    };

    return (
        <div className="test-page">
            <div className="remote-download">
                <label htmlFor="remoteFileSelect">Download remote file:</label>
                <select
                    id="remoteFileSelect"
                    value={selectedRemoteVariant}
                    onChange={(e) => setSelectedRemoteVariant(e.target.value)}
                >
                    {Object.keys(remoteFiles).map((key) => (
                        <option key={key} value={key}>
                            {key.toUpperCase()}
                        </option>
                    ))}
                </select>
                <button onClick={downloadRemoteFile}>Download</button>
            </div>

            <div className="horizontal-divider" />

            <button onClick={downloadLocalFile}>
                Download selected file(s)
            </button>
            <button onClick={downloadLocalFileZip}>
                Download selected file(s) - zip
            </button>
            <input type="file" multiple onChange={handleFileChange} />

            {selectedFiles.length > 0 && (
                <div className="file-list-container">
                    <div className="file-list-header">
                        <h3>Selected Files:</h3>
                        <button
                            onClick={clearSelection}
                            className="clear-button"
                        >
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
