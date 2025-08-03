import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { onMcpAuthorization } from "use-mcp";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<{
    status: "processing" | "success" | "error";
    message?: string;
  }>({ status: "processing" });

  useEffect(() => {
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      query[key] = value;
    });

    onMcpAuthorization()
      .then((res: any) => {
        const success = res.success;
        setResult({
          message: res.error,
          status: success ? "success" : "error",
        });
        
        // Notify parent window of completion
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'oauth_complete', 
            success,
            error: res.error 
          }, window.location.origin);
        }
      })
      .catch((err: Error) => {
        setResult({ message: err.message, status: "error" });
        
        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'oauth_complete', 
            success: false, 
            error: err.message 
          }, window.location.origin);
        }
      });
  }, [searchParams]);

  return (
    <div>
      <h1>Authentication {result.status}</h1>
      {result.status === "processing" && <p>Processing authentication...</p>}
      {result.status === "success" && (
        <p>Authentication successful! You can close this window.</p>
      )}
      {result.status === "error" && (
        <p>Authentication error: {result.message}</p>
      )}
    </div>
  );
}
