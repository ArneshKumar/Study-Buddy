import React, { useState, useEffect } from "react";
import "./FlashCards.css";
import { useNavigate, useLocation } from "react-router-dom";
import "../globals.d.ts";
import { Response } from "node-fetch";
export interface IFlashCardsProps {}

const FlashCards: React.FunctionComponent<IFlashCardsProps> = (props) => {
  type Flashcard = {
    question: string;
    answer: string;
  };

  const navigate = useNavigate();
  const location = useLocation();
  const transcript = location.state?.transcript;
  const [hasRun, setHasRun] = useState(false);
  const goBackNotes = () => {
    navigate("/Notes", { state: { transcript } });
  };
  const run = async (): Promise<string> => {
    try {
      const response = await fetch("http://localhost:3001/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          prompt: `Generate 5 flashcards in the format "Question | Answer".\n\n${transcript}`,
        }),
      });

      const data = await response.json();

      // DEBUG: Log the FULL data object to see what the error actually is
      console.log("Full Backend Response:", data);

      if (!response.ok || !data.choices) {
        console.error("Error from backend:", data.error || "Unknown error");
        // Optional: Set an error state here to show the user
        return "";
      }

      // Safe access using optional chaining
      const flashcardsText = data.choices[0]?.message?.content;

      if (!flashcardsText) {
        throw new Error("No content in response");
      }

      console.log("Flashcards text: ", flashcardsText);
      setFlashcards(parseFlashcards(flashcardsText));
      return flashcardsText;
    } catch (err) {
      console.error("This is the error: ", err);
      return "";
    }
  };

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  function parseFlashcards(rawText: string): Flashcard[] {
    const flashcards: Flashcard[] = [];
    const lines = rawText.split(/\r?\n/);

    for (const line of lines) {
      // Look for lines that contain a pipe "|"
      if (line.includes("|")) {
        const parts = line.split("|");

        if (parts.length >= 2) {
          // Clean up the question (remove "1. ", "2. ", etc.)
          let question = parts[0].trim();
          // Remove leading numbers like "1. "
          question = question.replace(/^\d+\.\s*/, "");

          const answer = parts[1].trim();

          flashcards.push({
            question: question,
            answer: answer,
          });
        }
      }
    }

    return flashcards;
  }

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await run(); // this returns a string
        const parsedFlashcards = parseFlashcards(response || ""); // fallback to empty string if undefined
        // console.log("Parsed Flashcards:", parsedFlashcards);
        setFlashcards(parsedFlashcards); // now you're giving it Flashcard[]
      } catch (err) {
        console.error("Error generating flashcards:", err);
      }
    };

    fetchFlashcards();
  }, []);

  const checkFlashcards: Flashcard[] = [
    { question: "Capital of France?", answer: "Paris" },
    { question: "2 + 2", answer: "4" },
    { question: "React is a ...?", answer: "JavaScript library" },
  ];
  console.log(checkFlashcards);
  console.log(flashcards);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (flashcards.length === 0) {
    return <div>Loading flashcards...</div>;
  }

  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    setShowAnswer((prev) => !prev);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
  };

  return (
    <div className="flashcards-page">
      <button className="navigate-study" onClick={goBackNotes}>
        Back to Notes
      </button>

      <div className="flashcards-shell">
        <div className="nav-row">
          <button className="nav-btn" onClick={handlePrev}>
            Previous
          </button>

          <div className="flashcard-wrapper">
            <div className="flashcard-container" onClick={handleFlip}>
              <div className={`flashcard ${showAnswer ? "flipped" : ""}`}>
                <div className="front">{currentCard.question}</div>
                <div className="back">{currentCard.answer}</div>
              </div>
            </div>
            <div className="hint-row">
              <span className="hint">Click card to flip</span>
              <span className="counter">
                {currentIndex + 1} / {flashcards.length}
              </span>
            </div>
          </div>

          <button className="nav-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
export default FlashCards;
