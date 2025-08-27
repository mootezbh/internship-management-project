import { UploadButton } from "@uploadthing/react";
import { useState } from "react";

export default function FileUpload({ onUploadComplete, fileType = "general" }) {
  const [error, setError] = useState(null);

  return (
    <div className="space-y-2">
      <UploadButton
        endpoint={fileType === "profile" ? "profileImage" : "generalFile"}
        onClientUploadComplete={res => {
          onUploadComplete?.(res?.[0]);
        }}
        onUploadError={err => setError(err.message)}
      />
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}