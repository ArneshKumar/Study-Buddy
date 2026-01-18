import React, { useRef, useCallback } from "react";
import "./Notes.css";
import { useNavigate, useLocation } from "react-router-dom";
import "../globals.d.ts";
export interface INotesProps {}

// const Notes: React.FunctionComponent<INotesProps> = (props) => {
//   const navigate = useNavigate();
//   const fileInput = useRef<HTMLInputElement>(null);

//   const handleButtonClick = () => {
//     fileInput.current?.click();
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const selectFiles = event.target.files;
//     if (selectFiles && selectFiles.length > 0) {
//       // Handle the selected file(s) here
//       console.log("Selected file(s):", selectFiles);

//       return (
//         <div className="container">
//           <button onClick={handleButtonClick}>Upload File</button>
//           <input
//             type="file"
//             style={{ display: "none" }}
//             ref={fileInput}
//             onChange={handleFileChange}
//           />
//           <h1 className="logo">Ace My Classes</h1>
//           {}
//         </div>
//       );
//     };

const Notes: React.FunctionComponent<INotesProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const transcript = location.state?.transcript;
  const goBackHomepage = () => {
    navigate("/");
  };
  const flashCards = () => {
    navigate("/Flashcards", { state: { transcript } });
  };
  const fillInTheBlanks = () => {
    navigate("/FillInTheBlanks", { state: { transcript } });
  };
  const multipleChoice = () => {
    navigate("/MCQ", { state: { transcript } });
  };
  return (
    <div className="notes-page">
      <button className="notes-home-btn" onClick={goBackHomepage}>
        Back to Homepage
      </button>

      <div className="notes-card">
        <div className="notes-title">Transcript</div>
        <div className="notes-content">{transcript}</div>
      </div>

      <div className="buttons">
        <button className="notes-btn flashcards-btn" onClick={flashCards}>
          Flashcards
        </button>

        <button className="notes-btn fill-btn" onClick={fillInTheBlanks}>
          Fill in the Blanks
        </button>

        <button className="notes-btn mcq-btns" onClick={multipleChoice}>
          Multiple Choice
        </button>
      </div>
    </div>
  );
};
export default Notes;
