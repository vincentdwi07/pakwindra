"use client";

import { useState, useEffect } from "react";
import { ChatOllama } from "@langchain/ollama";

export default function Testings() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const fetchResponse = async () => {
      const llm = new ChatOllama({
        model: "deepseek-r1:7b",
        temperature: 0,
        maxRetries: 2,
      });

      const aiMsg = await llm.invoke([
        ["system", "You are a helpful assistant that translates English to French. Translate the user sentence."],
        ["human", "I love programming."],
      ]);

      setResponse(aiMsg.content); // Ensure it's accessing the right property
    };

    fetchResponse();
  }, []);

  return <div>{response || "Loading..."}</div>;
}
