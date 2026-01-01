import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import QuizQuestion from "@/components/QuizQuestion";
import secureLocalStorage from "react-secure-storage";
import { apiPost } from "../../../../../lib/api";

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { e_id } = params;
  return { props: { e_id } };
};

export default function userCourseInfo({ e_id }) {
  const router = useRouter();
  const s_id = secureLocalStorage.getItem("u_id");
  const [questions, setQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState(
    new Array(5).fill(null)
  );

  useEffect(() => {
    if (!e_id) return;
    
    apiPost("/api/exam_questions", { e_id })
      .then((res) => res.json())
      .then((json_res) => {
        // Only set questions if we got a valid array response
        if (Array.isArray(json_res)) {
          setQuestions(json_res);
          setSelectedOptions(new Array(json_res.length).fill(null));
        }
      })
      .catch((error) => {
        console.error('Error fetching exam questions:', error);
      });
  }, [e_id]);

  const handleOptionSelect = (questionIndex, option) => {
    const updatedOptions = [...selectedOptions];
    updatedOptions[questionIndex] = option;
    setSelectedOptions(updatedOptions);
  };

  const handleSubmit = () => {
    let newScore = 0;
    let answers = [];
    
    // Map option index (1-4) to letter (A-D)
    const indexToLetter = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' };
    
    for (let i = 0; i < questions.length; i++) {
      const selectedLetter = indexToLetter[selectedOptions[i]];
      if (selectedLetter === questions[i].right_ans) {
        newScore += questions[i].marks;
      }
      answers.push({ q_id: questions[i].q_id, ans: selectedOptions[i] });
    }
    apiPost("/api/update_mark", { s_id, e_id, score: newScore })
      .then(() => {
        router.replace(`/user/courses/topic/exam/result/${e_id}`);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">MCQ Quiz</h1>
      {questions.map((question, index) => (
        <QuizQuestion
        key={index}
        question={question}
        index={index}
        selectedOption={selectedOptions[index]}
        onOptionSelect={handleOptionSelect}
      />
      ))}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
