import { useState } from "react";
import "./App.css";

const API_URL = "https://explainmynotes-api.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [weakTopics, setWeakTopics] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setErrorMessage("Please select a PDF file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setAnalyzed(false);
    setExtractedText("");
    setAnalysisData(null);
    setErrorMessage("");

    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setQuizFinished(false);

    setFlashcardIndex(0);
    setShowAnswer(false);
    setWeakTopics([]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setErrorMessage("Please choose a PDF file first.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setAnalyzed(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

<<<<<<< HEAD
            const API_URL = "https://explainmynotes-api.onrender.com";

      const uploadResponse = await fetch(`${API_URL}/files/upload`, {
        method: "POST",
        body: formData,
      });
>>>>>>> 8e4cda0 (Fix backend upload API URL)

      if (!uploadResponse.ok) {
        const details = await uploadResponse.text();
        throw new Error(
          `Upload failed (${uploadResponse.status})${
            details ? `: ${details.slice(0, 250)}` : ""
          }`
        );
      }

      const text = await uploadResponse.text();

      if (text.startsWith("Error:")) {
        throw new Error(text);
      }

      setExtractedText(text);

      const notesResponse = await fetch(`${API_URL}/notes`);

      if (!notesResponse.ok) {
        throw new Error(
          `Could not fetch notes (${notesResponse.status}).`
        );
      }

      const notes = await notesResponse.json();

      if (!Array.isArray(notes) || notes.length === 0) {
        throw new Error("No notes found after uploading the PDF.");
      }

      const latestNote = notes[notes.length - 1];

      const analysisResponse = await fetch(
        `${API_URL}/notes/${latestNote.id}/analyze`,
        {
          method: "POST",
        }
      );

      if (!analysisResponse.ok) {
        const details = await analysisResponse.text();
        throw new Error(
          `Analysis failed (${analysisResponse.status})${
            details ? `: ${details.slice(0, 250)}` : ""
          }`
        );
      }

      const analysis = await analysisResponse.json();

      if (
        !analysis ||
        (!analysis.simpleExplanation && !analysis.summary)
      ) {
        throw new Error(
          "The AI returned no study material. Please try again."
        );
      }

      setAnalysisData(analysis);
      setAnalyzed(true);

      setQuizStarted(false);
      setCurrentQuestion(0);
      setSelectedAnswer("");
      setScore(0);
      setQuizFinished(false);

      setFlashcardIndex(0);
      setShowAnswer(false);
      setWeakTopics([]);
    } catch (error) {
      console.error("ExplainMyNotes error:", error);

      setErrorMessage(
        error.message ||
          "Something went wrong while analyzing the file."
      );
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    setTimeout(() => {
      const element = document.getElementById(id);

      if (!element) {
        console.log(`Section not found: ${id}`);
        return;
      }

      const header = document.querySelector(".header");
      const headerHeight = header
        ? header.getBoundingClientRect().height
        : 0;

      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: Math.max(0, elementPosition - headerHeight - 20),
        behavior: "smooth",
      });
    }, 100);
  };

  const startQuiz = () => {
    if (!quiz.length) return;

    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setQuizFinished(false);
    setWeakTopics([]);

    setTimeout(() => {
      document.getElementById("quiz")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleAnswerSelect = (answer) => {
    if (!quizFinished) {
      setSelectedAnswer(answer);
    }
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !quiz.length) return;

    const question = quiz[currentQuestion];
    if (!question) return;

    const isCorrect =
      selectedAnswer.trim().toLowerCase() ===
      String(question.answer || "").trim().toLowerCase();

    const newScore = score + (isCorrect ? 1 : 0);

    if (currentQuestion < quiz.length - 1) {
      setScore(newScore);
      setCurrentQuestion((previous) => previous + 1);
      setSelectedAnswer("");
    } else {
      setScore(newScore);
      setQuizFinished(true);
      setQuizStarted(false);
      generateWeakTopics(newScore, quiz);

      setTimeout(() => {
        document.getElementById("revision")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 300);
    }
  };

  const generateWeakTopics = (finalScore, questions) => {
    if (!questions?.length) {
      setWeakTopics([]);
      return;
    }

    const percentage = (finalScore / questions.length) * 100;

    if (percentage >= 80) {
      setWeakTopics([]);
      return;
    }

    const weak = [];

    if (percentage < 50) {
      weak.push("Review the complete set of uploaded notes.");
      weak.push("Revise the key points before attempting the quiz again.");
    } else {
      weak.push("Revise the concepts covered by the missed questions.");
    }

    weak.push("Use the flashcards to strengthen concept recall.");
    setWeakTopics(weak);
  };

  const restartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore(0);
    setQuizFinished(false);
    setWeakTopics([]);
    scrollToSection("quiz");
  };

  const nextFlashcard = () => {
    if (flashcardIndex < flashcards.length - 1) {
      setFlashcardIndex((previous) => previous + 1);
      setShowAnswer(false);
    }
  };

  const previousFlashcard = () => {
    if (flashcardIndex > 0) {
      setFlashcardIndex((previous) => previous - 1);
      setShowAnswer(false);
    }
  };

  const getScoreMessage = () => {
    if (!quiz.length) return "";

    if (score === quiz.length) {
      return "Excellent! You have mastered these concepts.";
    }

    if (score >= Math.ceil(quiz.length * 0.8)) {
      return "Great job! You have a strong understanding.";
    }

    if (score >= Math.ceil(quiz.length * 0.5)) {
      return "Good attempt! A little more revision will help.";
    }

    return "Keep practicing. Review the notes and flashcards again.";
  };

  const keyPoints = Array.isArray(analysisData?.keyPoints)
    ? analysisData.keyPoints
    : [];

  const flashcards = Array.isArray(analysisData?.flashcards)
    ? analysisData.flashcards
    : [];

  const quiz = Array.isArray(analysisData?.quiz)
    ? analysisData.quiz
    : [];

  const currentFlashcard = flashcards[flashcardIndex];
  const currentQuizQuestion = quiz[currentQuestion];

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <div className="logo">ExplainMyNotes 📚</div>

          <nav className="nav">
            <button type="button" onClick={() => scrollToSection("home")}>
              Home
            </button>
            <button type="button" onClick={() => scrollToSection("features")}>
              Features
            </button>
            {analyzed && (
              <button type="button" onClick={() => scrollToSection("results")}>
                Results
              </button>
            )}
          </nav>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="badge">AI-Powered Study Assistant</div>

          <h1>
            Turn Your Notes Into
            <span> Smart Study Material</span>
          </h1>

          <p>
            Upload your study notes and let ExplainMyNotes transform them
            into simple explanations, key points, flashcards, quizzes
            and revision material.
          </p>

          <div className="upload-card">
            <div className="upload-icon">📄</div>
            <h2>Upload Your Notes</h2>
            <p>Choose a PDF file to analyze your study material.</p>

            <label className="file-input-label">
              Choose PDF
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
              />
            </label>

            {file && (
              <p className="selected-file">
                Selected: <strong>{file.name}</strong>
              </p>
            )}

            <button
              type="button"
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={loading || !file}
            >
              {loading ? "Analyzing..." : "Analyze Notes"}
            </button>

            {errorMessage && (
              <div className="error-message" role="alert">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-heading">
          <div className="badge">What You Get</div>
          <h2>Everything You Need To Study Smarter</h2>
          <p>
            ExplainMyNotes converts lengthy notes into easy-to-understand
            study resources.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Simple Explanation</h3>
            <p>Understand difficult concepts in simple language.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Key Points</h3>
            <p>Quickly identify the most important concepts.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Flashcards</h3>
            <p>Practice important concepts through active recall.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Quiz</h3>
            <p>Test your understanding with AI-generated questions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Revision</h3>
            <p>Identify areas that need more revision.</p>
          </div>
        </div>
      </section>

      {analyzed && analysisData && (
        <section className="results" id="results">
          <div className="results-header">
            <div className="badge">Analysis Complete</div>
            <h2>Your Study Material</h2>
            <p>
              Your notes have been converted into personalized study
              resources.
            </p>
          </div>

          <div className="result-grid">
            <div className="result-card">
              <h3>💡 Simple Explanation</h3>
              <p>Understand your notes in easy language.</p>
              <button type="button" onClick={() => scrollToSection("explanation")}>
                View Explanation
              </button>
            </div>

            <div className="result-card">
              <h3>📝 Key Points</h3>
              <p>Important concepts extracted from your notes.</p>
              <button type="button" onClick={() => scrollToSection("key-points")}>
                View Key Points
              </button>
            </div>

            <div className="result-card">
              <h3>🧠 Flashcards</h3>
              <p>Practice and remember important concepts.</p>
              <button type="button" onClick={() => scrollToSection("flashcards")}>
                Start Flashcards
              </button>
            </div>

            <div className="result-card">
              <h3>🎯 Quiz</h3>
              <p>Test your understanding of the notes.</p>
              <button type="button" onClick={() => scrollToSection("quiz")}>
                Take Quiz
              </button>
            </div>

            <div className="result-card">
              <h3>🔄 Revision</h3>
              <p>Get a revision recommendation based on your performance.</p>
              <button type="button" onClick={() => scrollToSection("revision")}>
                View Revision
              </button>
            </div>

            <div className="result-card">
              <h3>📄 Extracted Notes</h3>
              <p>View the text extracted from your PDF.</p>
              <button type="button" onClick={() => scrollToSection("extracted-notes")}>
                View Notes
              </button>
            </div>
          </div>

          <div className="content-section" id="explanation">
            <div className="section-heading">
              <div className="badge">Understand</div>
              <h2>Simple Explanation</h2>
            </div>

            <div className="result-content-card">
              <p>{analysisData.simpleExplanation || "No explanation was generated."}</p>
            </div>

            <div className="result-content-card">
              <h3>Summary</h3>
              <p>{analysisData.summary || "No summary was generated."}</p>
            </div>
          </div>

          <div className="content-section" id="key-points">
            <div className="section-heading">
              <div className="badge">Important</div>
              <h2>Key Points</h2>
            </div>

            <div className="key-points-list">
              {keyPoints.length > 0 ? (
                keyPoints.map((point, index) => (
                  <div className="key-point-item" key={index}>
                    <span>{index + 1}</span>
                    <p>{point}</p>
                  </div>
                ))
              ) : (
                <p>No key points were generated.</p>
              )}
            </div>
          </div>

          <div className="content-section" id="flashcards">
            <div className="section-heading">
              <div className="badge">Active Recall</div>
              <h2>Flashcards</h2>
              <p>Test yourself before revealing the answer.</p>
            </div>

            {currentFlashcard ? (
              <div className="flashcard-area">
                <div
                  className="flashcard"
                  onClick={() => setShowAnswer((previous) => !previous)}
                >
                  <div className="flashcard-number">
                    Card {flashcardIndex + 1} of {flashcards.length}
                  </div>

                  {!showAnswer ? (
                    <>
                      <h3>Question</h3>
                      <p>{currentFlashcard.question}</p>
                      <span>Click to reveal answer</span>
                    </>
                  ) : (
                    <>
                      <h3>Answer</h3>
                      <p>{currentFlashcard.answer}</p>
                      <span>Click to hide answer</span>
                    </>
                  )}
                </div>

                <div className="flashcard-controls">
                  <button
                    type="button"
                    onClick={previousFlashcard}
                    disabled={flashcardIndex === 0}
                  >
                    ← Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAnswer((previous) => !previous)}
                  >
                    {showAnswer ? "Hide Answer" : "Reveal Answer"}
                  </button>

                  <button
                    type="button"
                    onClick={nextFlashcard}
                    disabled={flashcardIndex === flashcards.length - 1}
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <div className="result-content-card">
                <p>No flashcards were generated.</p>
              </div>
            )}
          </div>

          <div className="content-section" id="quiz">
            <div className="section-heading">
              <div className="badge">Test Yourself</div>
              <h2>Quiz</h2>
              <p>Check how well you understand your notes.</p>
            </div>

            {!quizStarted && !quizFinished && (
              <div className="result-content-card quiz-start-card">
                <h3>Ready to test yourself?</h3>
                <p>This quiz contains {quiz.length} questions based on your uploaded notes.</p>
                <button type="button" onClick={startQuiz} disabled={!quiz.length}>
                  Start Quiz
                </button>
              </div>
            )}

            {quizStarted && !quizFinished && currentQuizQuestion && (
              <div className="quiz-card">
                <div className="quiz-progress">
                  Question {currentQuestion + 1} of {quiz.length}
                </div>

                <h3>{currentQuizQuestion.question}</h3>

                <div className="quiz-options">
                  {Array.isArray(currentQuizQuestion.options) &&
                    currentQuizQuestion.options.map((option, index) => (
                      <button
                        type="button"
                        key={index}
                        className={`quiz-option ${
                          selectedAnswer === option ? "selected" : ""
                        }`}
                        onClick={() => handleAnswerSelect(option)}
                      >
                        {option}
                      </button>
                    ))}
                </div>

                <button
                  type="button"
                  className="quiz-submit"
                  onClick={submitAnswer}
                  disabled={!selectedAnswer}
                >
                  {currentQuestion === quiz.length - 1
                    ? "Finish Quiz"
                    : "Next Question"}
                </button>
              </div>
            )}

            {quizFinished && (
              <div className="quiz-result">
                <div className="score-circle">
                  {score}/{quiz.length}
                </div>
                <h3>Quiz Complete!</h3>
                <p>{getScoreMessage()}</p>
                <p>
                  You scored{" "}
                  <strong>
                    {Math.round((score / quiz.length) * 100)}%
                  </strong>
                </p>
                <button type="button" onClick={restartQuiz}>
                  Try Again
                </button>
              </div>
            )}
          </div>

          <div className="content-section" id="revision">
            <div className="section-heading">
              <div className="badge">Smart Revision</div>
              <h2>Revision</h2>
              <p>Use your quiz performance to guide your revision.</p>
            </div>

            <div className="revision-card">
              {!quizFinished ? (
                <>
                  <h3>🎯 Take the quiz first</h3>
                  <p>
                    Complete the quiz to get a personalized revision
                    recommendation based on your score.
                  </p>
                  <button type="button" onClick={() => scrollToSection("quiz")}>
                    Go To Quiz
                  </button>
                </>
              ) : weakTopics.length === 0 ? (
                <>
                  <h3>🎉 Excellent Performance!</h3>
                  <p>You performed very well on the quiz.</p>
                  <p>Your current understanding looks strong.</p>
                  <p>Continue reviewing the flashcards to maintain your knowledge.</p>
                  <button type="button" onClick={() => scrollToSection("flashcards")}>
                    Review Flashcards
                  </button>
                </>
              ) : (
                <>
                  <h3>📚 Topics To Revise</h3>
                  <p>
                    Your quiz performance suggests that you should spend
                    some more time revising:
                  </p>

                  <div className="revision-list">
                    {weakTopics.map((topic, index) => (
                      <div className="key-point-item" key={index}>
                        <span>{index + 1}</span>
                        <p>{topic}</p>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={() => scrollToSection("flashcards")}>
                    Start Revision
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="extracted-notes" id="extracted-notes">
            <div className="section-heading">
              <div className="badge">Original Content</div>
              <h2>Extracted Notes</h2>
            </div>

            <div className="notes-content">
              {extractedText || "No extracted text available."}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="footer-content">
          <h3>ExplainMyNotes 📚</h3>
          <p>Learn smarter. Understand better. Revise faster.</p>
          <p>© 2026 ExplainMyNotes</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
