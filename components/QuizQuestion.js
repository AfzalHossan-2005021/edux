import React from 'react';

const QuizQuestion = ({ question, index, selectedOption, onOptionSelect }) => (
  <div key={index} className="mb-4">
    <h2 className="text-lg font-semibold mb-2">
      Question {question.serial}
    </h2>
    <p className="mb-2">{question.q_description}</p>
    <ul>
      {['option_a', 'option_b', 'option_c', 'option_d'].map((optionKey, optionIndex) => (
        <li
          key={optionIndex}
          className={`mb-2 flex items-center cursor-pointer`}
        >
          <input
            type="radio"
            id={`q${index}_option${optionIndex}`}
            name={`q${index}`}
            value={question[optionKey]}
            checked={selectedOption === optionIndex + 1}
            onChange={() => onOptionSelect(index, optionIndex + 1)}
            className="mr-2"
          />
          <label htmlFor={`q${index}_option${optionIndex}`}>
            {question[optionKey]}
          </label>
        </li>
      ))}
    </ul>
  </div>
);

export default QuizQuestion;