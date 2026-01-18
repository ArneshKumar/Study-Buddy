import React, { useState, useEffect } from "react";
import "./MultipleChoice.css";
import { useNavigate, useLocation } from "react-router-dom";
import "../globals.d.ts";
import { Response } from "node-fetch";
export interface IFlashCardsProps {}

const MultipleChoice: React.FunctionComponent<IFlashCardsProps> = (props) => {
  type Flashcard = {
    question: string;
    answer: string;
  };

  const navigate = useNavigate();
  const location = useLocation();
  const transcript = location.state?.transcript;
  const [hasRun, setHasRun] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

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
          prompt: `
            You are a quiz-generation system. Formatting accuracy is REQUIRED.

            TASK:
            Generate EXACTLY 5 multiple-choice questions based on the transcript.

            OUTPUT FORMAT (ONE LINE PER QUESTION, NO EXCEPTIONS):
            Example: Question | Wrong Answer 1, Correct Answer, Wrong Answer 2, Correct Answer
            You MUST randomize the order of the answers, but ensure the last one is always the correct answer.

            CRITICAL RULES (MUST FOLLOW):
            - There must be EXACTLY 4 answer entries after the "|"
            - The LAST TWO entries MUST be IDENTICAL
            - The LAST TWO entries MUST be the correct answer
            - The FIRST TWO entries MUST be incorrect
            - Do NOT number questions
            - Do NOT add explanations
            - Do NOT add extra text
            - Do NOT use quotes
            - Do NOT leave blank lines

            VALID EXAMPLE (FORMATS ONLY):
            What is the capital of France | Berlin, Paris, Madrid, Paris
            What is the largest planet in our solar system? | Jupiter, Earth, Mars, Jupiter
            What is the chemical symbol for water? | CO2, O2, H2O, H2O

            INVALID EXAMPLE (DO NOT DO THIS):
            What is the capital of France | Berlin, Madrid, Paris

            IMPORTANT:
            If the correct answer does not appear once at the end, the output is WRONG.

            Generate questions ONLY from the transcript below:

            ${transcript}
            `,
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
    return <div>Loading Multiple Choices...</div>;
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setSelectedIndex(null);
    setShowResult(false);
  };

  const handlePrev = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
    setSelectedIndex(null);
    setShowResult(false);
  };

  const handleanswerClick = (index: number) => {
    setSelectedIndex(index);
    setShowResult(true);
  };

  const splitAnswers = currentCard.answer.split(",").map((ans) => ans.trim());
  const correctAnswer = splitAnswers[3]; // your backend guarantees this
  const isCorrect = (i: number) => splitAnswers[i] === correctAnswer;

  const getMcqClass = (i: number) => {
    let cls = "mcq-btn";
    if (!showResult || selectedIndex === null) return cls;

    if (i === selectedIndex) {
      cls += isCorrect(i) ? " correct" : " incorrect";
    }
    return cls;
  };
  return (
    <>
      <button className="navigate-study" onClick={goBackNotes}>
        Back to Notes
      </button>

      <div className="buttons">
        <div className="card-section">
          <div className="card-nav">
            <button className="mcq-btnss nav-btnss" onClick={handlePrev}>
              Previous
            </button>

            <button className="mcq-btnss nav-btnss" onClick={handleNext}>
              Next
            </button>
          </div>

          <div className="flashcard-wrapper">
            <div className="flashcard-container" style={{ cursor: "default" }}>
              <div className={`flashcard ${showAnswer ? "flipped" : ""}`}>
                <div className="front">{currentCard.question}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="MCQContainer">
          <button
            className={getMcqClass(0)}
            onClick={() => handleanswerClick(0)}
          >
            {splitAnswers[0]}
          </button>

          <button
            className={getMcqClass(1)}
            onClick={() => handleanswerClick(1)}
          >
            {splitAnswers[1]}
          </button>

          <button
            className={getMcqClass(2)}
            onClick={() => handleanswerClick(2)}
          >
            {splitAnswers[2]}
          </button>
        </div>
      </div>
    </>
  );
};
export default MultipleChoice;
