import Link from "next/link";
import { FaRegCheckCircle } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { BiRightArrow, BiDownArrow } from "react-icons/bi";
import { MdOutlineTopic, MdOutlineQuiz } from "react-icons/md";
import { apiPost } from "../../../lib/api";

export default function userCourseInfo({ c_id }) {
  const [content, setContent] = useState([]);
  const u_id = secureLocalStorage.getItem("u_id");

  useEffect(() => {
    apiPost("/api/user_course_content", { u_id, c_id })
      .then((res) => res.json())
      .then((json_res) => {
        setContent([]);
        for (let i = 0; i < json_res[0].length; i++) {
          const topic_content = [
            json_res[0][i],
            json_res[i + 1],
            json_res[json_res[0].length + i + 1],
          ];
          setContent((content) => [...content, topic_content]);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const [isVisible, setIsVisible] = useState(Array(content.length).fill(false));

  const toggleVisibility = (index) => {
    const updatedVisibility = [...isVisible];
    updatedVisibility[index] = !updatedVisibility[index];
    setIsVisible(updatedVisibility);
  };

  return (
    <div className="flex-col items-center justify-center">
      <div className="flex flex-wrap w-full flex-col items-center text-center">
        <h1 className="sm:text-3xl text-2xl font-medium title-font mt-10 underline text-gray-900">
          Course Contents
        </h1>
      </div>
      <div className="border border-gray-400 w-1/2 m-10 rounded-lg p-5">
        {content.map((element, index) => {
          return (
            <div className="p-2" key={index}>
              <div
                onClick={() => toggleVisibility(index)}
                className={
                  (isVisible[index]
                    ? "border-b-2 border-blue-600"
                    : "border-2 border-white hover:border-2 hover:border-blue-600") +
                  " px-5 py-3 space-x-5 flex items-center w-full hover:bg-sky-100 overflow-hidden"
                }
              >
                <div>
                  {!isVisible[index] && <BiRightArrow />}
                  {isVisible[index] && <BiDownArrow />}
                </div>
                <div>
                  <h2 className="text-xl text-gray-900 font-bold title-font">
                    {element[0].name}{" "}
                  </h2>
                </div>
              </div>
              <div className={isVisible[index] ? "" : "hidden"}>
                {element[1].map((sub_element) => {
                  return (
                    <Link
                      key={sub_element.l_id}
                      href={`/user/courses/topic/lecture/${
                        sub_element.l_id
                      }?c_id=${c_id}&t_id=${index + 1}`}
                    >
                      <button className="px-10 py-3 flex flex-row items-center w-full border-none hover:bg-sky-100 overflow-hidden">
                        <MdOutlineTopic className="text-xl" />
                        <h2 className="text-lg text-gray-900 font-normal title-font px-5">
                          {sub_element.description}{" "}
                        </h2>
                        <FaRegCheckCircle
                          className={
                            sub_element.STATUS === 0
                              ? "hidden"
                              : "text-green-600 text-xl ml-auto"
                          }
                        />
                      </button>
                    </Link>
                  );
                })}
                <div className="px-10 py-2 flex items-center w-full border-none hover:bg-sky-100 overflow-hidden">
                  <div>
                    <MdOutlineQuiz className="text-xl" />
                  </div>
                  <div className="flex flex-col ml-4 flex-grow">
                    <div className="flex flex-row items-center space-x-4 mb-2">
                      <h2 className="text-lg text-gray-900 font-normal title-font">
                        Quiz {element[2][0].e_id}
                      </h2>
                      <h2 className="text-lg text-gray-900 font-normal title-font">
                        {element[2][0].duration} mins
                      </h2>
                    </div>
                    <div className="flex flex-row space-x-4">
                      <Link
                        href={`/user/courses/topic/exam/${element[2][0].e_id}`}
                      >
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                          Take Exam
                        </button>
                      </Link>
                      <Link
                        href={`/user/courses/topic/exam/result/${element[2][0].e_id}`}
                      >
                        <button
                          className={
                            element[2][0].STATUS === 0
                              ? "hidden"
                              : "bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                          }
                        >
                          View Result
                        </button>
                      </Link>
                    </div>
                  </div>
                  <div>
                    <FaRegCheckCircle
                      className={
                        element[2][0].STATUS === 0
                          ? "hidden"
                          : "text-green-600 text-xl"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { c_id } = params;
  return { props: { c_id } };
};
