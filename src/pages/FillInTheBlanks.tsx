import React, { useState, useEffect } from "react";
import "./FillInTheBlanks.css";
import { useNavigate, useLocation } from "react-router-dom";
import "../globals.d.ts";

type Flashcard = {
  question: string;
  answer: string;
};

export interface IFlashCardsProps {}

const FillInTheBlanks: React.FunctionComponent<IFlashCardsProps> = (props) => {
  type Flashcard = {
    question: string;
    answer: string;
  };

  const navigate = useNavigate();
  const location = useLocation();
  const transcript = location.state?.transcript;
  const [hasRun, setHasRun] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [inputColor, setInputColor] = useState("black");
  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const inputElement = (e.target as HTMLFormElement).elements.namedItem(
      "userInput",
    ) as HTMLInputElement;
    const userInput = inputElement.value.trim().toLowerCase();
    const correctAnswer = flashcards[currentIndex].answer.trim().toLowerCase();
    if (userInput === correctAnswer) {
      setInputColor("green");
      setHasRun(true);
    } else {
      setInputColor("red");
      setHasRun(true);
    }
  };
  const reset = () => {
    setInputColor("black");
    setHasRun(false);
    setUserInput("");
    (document.getElementById("userInput") as HTMLInputElement).value = "";
  };
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
          prompt: `Generate 5 fill in the blanks in the format "Question | Answer". An example of what these fill in the blanks questions should look like is "____ is the capital of France | Paris". Can you make these questions based on the transcript and make sure the underscore placements are random in each of the questions. Also, please make sure to use only blank in each question. Change up the fill in the blank questions with every new generation.\n\n${transcript}`,
        }),
      });

      const data = await response.json();
      console.log("Full Backend Response:", data);

      if (!response.ok || !data.choices) {
        console.error("Error from backend:", data.error || "Unknown error");
        return "";
      }

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
      if (line.includes("|")) {
        const parts = line.split("|");

        if (parts.length >= 2) {
          let question = parts[0].trim();
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
        const response = await run();
        setFlashcards(parseFlashcards(response || ""));
      } catch (err) {
        console.error("Error generating flashcards:", err);
      }
    };

    fetchFlashcards();
  }, []);

  const allCorrectAnswers: string = flashcards
    .map((card) => card.answer.toLowerCase())
    .join(", ");
  if (flashcards.length < 6) {
    flashcards.push({ question: allCorrectAnswers, answer: "" });
    console.log("Flashcards: ", flashcards);
    if (flashcards.length == 7) {
      flashcards.pop();
    }
  }
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
    return <div>Loading Fill in the Blanks...</div>;
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
    <>
      <button className="navigate-study" onClick={goBackNotes}>
        Back to Notes
      </button>
      <div className="ansbox">
        <form onSubmit={checkAnswer}>
          <input
            type="text"
            placeholder="Type your answer here..."
            id="userInput"
            name="userInput"
            onChange={(e) => {
              setUserInput(e.target.value);
            }}
            className={`fitb-input ${inputColor}`}
          />
          <button
            type="submit"
            id="check-answer"
            className="fill-btn"
            // style={{ position: "fixed", right: "500px" }}
          >
            Submit
          </button>
        </form>
      </div>
      <div className="buttons">
        <button
          className="nav-btns"
          onClick={() => {
            handlePrev();
            reset();
          }}
        >
          Previous
        </button>
        <div className="flashcard-wrapper">
          <div className="flashcard-container" style={{ cursor: "default" }}>
            <div className={`flashcard ${showAnswer ? "flipped" : ""}`}>
              <div className="front">{currentCard.question}</div>
            </div>
          </div>
        </div>
        <button
          className="nav-btns"
          onClick={() => {
            handleNext();
            reset();
          }}
        >
          Next
        </button>
      </div>
    </>
  );
};
export default FillInTheBlanks;
