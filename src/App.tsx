// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import Homepage from "./pages/Homepage.tsx";
import Notes from "./pages/Notes.tsx";
import FlashCards from "./pages/FlashCards.tsx";
import Login from "./pages/Login.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FillInTheBlanks from "./pages/FillInTheBlanks.tsx";
import MultipleChoice from "./pages/MultipleChoice.tsx";

export interface IApplicationProps {}

const App: React.FunctionComponent<IApplicationProps> = (props) => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />      
        <Route path="/Notes" element={<Notes />} />
        <Route path="/Flashcards" element={<FlashCards />} />
        <Route path="/MCQ" element={<MultipleChoice />} />
        <Route path="/FillInTheBlanks" element={<FillInTheBlanks />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
