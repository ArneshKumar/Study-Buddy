import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Homepage.css";
import { useNavigate, useLocation } from "react-router-dom";
import { AssemblyAI } from "assemblyai";
import Notes from "./Notes.tsx";
import "../globals.d.ts";

const client = new AssemblyAI({
  apiKey: "d5562ce160d84555bd0d4e20ab9c19f2",
});
export interface IHomePageProps {}

const Homepage: React.FunctionComponent<IHomePageProps> = (props) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const location = useLocation();
  const email = location.state?.email || "";
  const loginbutton = location.state?.loginbutton || false;

  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInput.current?.click();
  };

  const handleLoginClick = () => {
    navigate("/login"); 
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles?.[0];
      setSelectedFile(file || null);
      const run = async () => {
        try {
          const uploadResponse = await fetch(
            "https://api.assemblyai.com/v2/upload",
            {
              method: "POST",
              headers: {
                authorization: "d5562ce160d84555bd0d4e20ab9c19f2",
              },
              body: file,
            }
          );

          const uploadData = await uploadResponse.json();
          const audio_url = uploadData.upload_url;

          const transcriptResponse = await fetch(
            "https://api.assemblyai.com/v2/transcript",
            {
              method: "POST",
              headers: {
                authorization: "d5562ce160d84555bd0d4e20ab9c19f2",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                audio_url,
              }),
            }
          );

          const transcriptData = await transcriptResponse.json();
          const transcriptId = transcriptData.id;

          let completed = false;
          let transcriptResult;

          while (!completed) {
            const pollingResponse = await fetch(
              `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
              {
                headers: {
                  authorization: "d5562ce160d84555bd0d4e20ab9c19f2",
                },
              }
            );

            transcriptResult = await pollingResponse.json();
            if (transcriptResult.status === "completed") {
              completed = true;
            } else if (transcriptResult.status === "error") {
              throw new Error(
                "Transcription failed: " + transcriptResult.error
              );
            } else {
              await new Promise((res) => setTimeout(res, 3000));
            }
          }

          return transcriptResult.text;
        } catch (error) {
          return error;
        }
      };

      const transcript = await run();
      navigate("/Notes", { state: { transcript } });
    }
  };

  return (
    <div className="homepage">
      <header className="topbar">
        {loginbutton ? (
          <div>
            <p>Welcome, {email}</p>
            <button className="login-btn" onClick={handleLoginClick}>Logout</button>
          </div>
        ) : (
          <button className="login-btn" onClick={handleLoginClick}>Login</button>
        )}
      </header>
  
      <div className="container">
        <h1 className="logo">Study Buddy</h1>
        <h2 className="description">
          Your reliable notetaker and quizzer that helps you learn faster!
          <br />
          Get started by uploading an audio/video file below:
        </h2>
  
        <button className="submit" onClick={handleButtonClick}>
          Upload File
        </button>
  
        <input
          type="file"
          style={{ display: "none" }}
          ref={fileInput}
          onChange={handleFileChange}
          accept=".mov, .mp3, .mp4"
        />
        <p>
          Accepted file types: <code>.mp3</code>, <code>.mp4</code>,{" "}
          <code>.mov</code>
        </p>
      </div>
    </div>
  );
};

export default Homepage;