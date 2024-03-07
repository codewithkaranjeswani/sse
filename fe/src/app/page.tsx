"use client";

import { useEffect, useState } from "react";

function FetchEvents() {
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  function startStream() {
    setMessage("");
    const controller = new AbortController();
    setAbortController(controller);
    async function fetchData() {
      setStreaming(true);
      try {
        const res = await fetch("http://127.0.0.1:8080/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: "hi, how are you?" }),
          signal: controller.signal,
        });
        if (!(res && res.body)) {
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        while (reader) {
          const { done, value } = await reader.read();
          const decodedValue = decoder.decode(value);
          const trimmedValue = decodedValue.substring(
            5,
            decodedValue.length - 2
          );
          // console.log(`value: ${trimmedValue}`);
          // console.log(`done = ${done}`);
          setMessage((m) => m + trimmedValue);
          if (done) break;
        }
      } catch (e) {
        console.log(`error : ${e}`);
      }
      setStreaming(false);
    }
    fetchData();
  }

  function stopStream() {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }

  return (
    <div>
      <button className="border-2" onClick={startStream} disabled={streaming}>
        Start Stream
      </button>
      <button className="border-2" onClick={stopStream} disabled={!streaming}>
        Stop Stream
      </button>
      <p>{message}</p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <FetchEvents />
    </>
  );
}
