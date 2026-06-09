import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { selectedFileState } from "../state/ifcState";

export function UploadZone() {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useRecoilState(selectedFileState);

  function acceptFile(nextFile) {
    if (!nextFile || !nextFile.name.toLowerCase().endsWith(".ifc")) return;
    setFile(nextFile);
  }

  return (
    <section
      className={`upload-zone ${isDragging ? "upload-zone--active" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        acceptFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".ifc"
        onChange={(event) => acceptFile(event.target.files[0])}
      />
      <div>
        <p className="eyebrow">IFC file</p>
        <strong>{file ? file.name : "Drop a model here"}</strong>
      </div>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Browse
      </button>
    </section>
  );
}
