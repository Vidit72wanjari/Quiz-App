const API_URL = 'https://opentdb.com/api.php?amount=15&difficulty=easy&type=multiple';

const questionEl = document.getElementById('question');
const answersForm = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const feedbackEl = document.getElementById('feedback');
const scoreContainer = document.getElementById('score-container');
const progressList = document.getElementById('progress-list');
const questionNumberEl = document.getElementById('question-number');

let questions = [];
let currentIndex = 0;
let selectedAnswer = null;
let score = 0;

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    questions = data.results.map(formatQuestion);
    updateProgressList();
    showQuestion();
  });

function formatQuestion(q) {
  const allAnswers = shuffle([...q.incorrect_answers, q.correct_answer].map(decodeHTML));
  return {
    question: decodeHTML(q.question),
    correct: decodeHTML(q.correct_answer),
    answers: allAnswers
  };
}

function decodeHTML(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function updateProgressList() {
  progressList.innerHTML = '';
  for (let i = 0; i < questions.length; i++) {
    const li = document.createElement('li');
    li.textContent = `Question ${i + 1}`;
    if (i === 0) li.classList.add('active');
    progressList.appendChild(li);
  }
}

function showQuestion() {
  const q = questions[currentIndex];
  selectedAnswer = null;
  nextBtn.disabled = true;

  questionNumberEl.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  questionEl.textContent = q.question;
  feedbackEl.textContent = '';
  scoreContainer.textContent = `Score: ${score}`;

  answersForm.innerHTML = '';

  q.answers.forEach((answer, i) => {
    const id = `answer-${i}`;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'option';
    input.id = id;
    input.value = answer;

    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = answer;

    input.addEventListener('change', () => {
      selectedAnswer = answer;
      nextBtn.disabled = false;
      showFeedback();
    });

    answersForm.appendChild(input);
    answersForm.appendChild(label);
  });

  highlightProgress(currentIndex);
}

function showFeedback() {
  const correctAnswer = questions[currentIndex].correct;
  if (selectedAnswer === correctAnswer) {
    feedbackEl.textContent = '✅ Correct!';
    score++;
  } else {
    feedbackEl.textContent = `❌ Wrong! Correct answer: ${correctAnswer}`;
  }
  nextBtn.disabled = false;
}

function highlightProgress(index) {
  const items = progressList.querySelectorAll('li');
  items.forEach((item, i) => {
    item.classList.remove('active');
    if (i === index) item.classList.add('active');
  });
}

nextBtn.addEventListener('click', () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showFinalScore();
  }
});

function showFinalScore() {
  questionEl.textContent = '🎉 Quiz Completed!';
  answersForm.innerHTML = '';
  feedbackEl.textContent = '';
  nextBtn.style.display = 'none';
  questionNumberEl.textContent = '';
  scoreContainer.innerHTML = `<h2>Your Final Score: ${score} / ${questions.length}</h2>`;
}
