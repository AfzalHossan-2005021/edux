import React from "react";
import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { apiPost } from "../../../../../../lib/api";

const ViewResult = ({ e_id }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const s_id = secureLocalStorage.getItem("u_id");
    apiPost("/api/exam_result", { s_id, e_id })
      .then((res) => res.json())
      .then((json_res) => {
        setData(json_res[0]);
      });
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex justify-center w-screen">
        <div className="border-2 border-slate-950 w-2/5 pt-8 my-10">
          <div className="pl-4 top-[-3rem] relative">
            <h1 className="text-2xl font-bold bg-white inline-block px-2">
              Exam Result
            </h1>
          </div>
          <div className="px-16 pb-12">
            <div className="flex border-b border-t border-gray-400 py-2">
              <span className="text-gray-700">Full Marks</span>
              <span className="ml-auto text-gray-950">
                <p id="piNo">{data.FULL_MARK}</p>
              </span>
            </div>
            <div className="flex border-b border-gray-400 py-2">
              <span className="text-gray-700">Total Questions</span>
              <span className="ml-auto text-gray-950">
                <p id="piDate">{data.question_count}</p>
              </span>
            </div>
            <div className="flex border-b border-gray-400 py-2">
              <span className="text-gray-700">Correct Answer</span>
              <span className="ml-auto text-gray-950">
                <p id="invoiceValue">{data.CORRECT_ANSWER}</p>
              </span>
            </div>
            <div className="flex border-b border-gray-400 py-2">
              <span className="text-gray-700">Wrong Anwer</span>
              <span className="ml-auto text-gray-950">
                <p id="item">{data.WRONG_ANSWER}</p>
              </span>
            </div>
            <div className="flex border-b border-gray-400 py-2">
              <span className="text-gray-700">Obtained Marks</span>
              <span className="ml-auto text-gray-950">
                <p id="item">{data.OBTAINED_MARK}</p>
              </span>
            </div>
            <div className="flex border-b border-gray-400 py-2">
              <span className="text-gray-700">Status</span>
              <span className="ml-auto text-gray-950">
                <p id="item">{data.status == "f" ? "Fail" : "Pass"}</p>
              </span>
            </div>
            <div className="mt-10 flex justify-center">
              <a href={`/user/courses/topic/exam/answer/${e_id}`}>
              <button
                className="bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-950"
              >
                Show Answers
              </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    // <div>
    //   <h1>Quiz Result</h1>
    //   <p>Total Marks: {totalMarks}</p>
    //   <p>Obtained Marks: {obtainedMarks}</p>
    //   <p>Correct Answers: {correctAnswers}</p>
    //   <p>Wrong Answers: {wrongAnswers}</p>
    //   <button>View Answers</button>
    // </div>
  );
};

export default ViewResult;

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { e_id } = params;
  return { props: { e_id } };
};
