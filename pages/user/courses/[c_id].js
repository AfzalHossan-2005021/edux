import Link from "next/link";
import { FaRegCheckCircle } from "react-icons/fa";
import React, { useEffect, useState, useMemo } from "react";
import secureLocalStorage from "react-secure-storage";
import { BiRightArrow, BiDownArrow } from "react-icons/bi";
import { MdOutlineTopic, MdOutlineQuiz } from "react-icons/md";
import { apiPost } from "../../../lib/api";
import { useRouter } from "next/router";

export default function userCourseInfo({ c_id }) {
  const router = useRouter();
  const [content, setContent] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    field: "",
    seat: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const u_id = useMemo(() => secureLocalStorage.getItem("u_id"), []);
  const i_id = useMemo(() => secureLocalStorage.getItem("i_id"), []);

  useEffect(() => {
    // Fetch course content
    apiPost("/api/user_course_content", { u_id, c_id })
      .then((res) => res.json())
      .then((json_res) => {
        // Handle empty or invalid response
        if (!json_res || !Array.isArray(json_res) || json_res.length === 0 || !json_res[0]) {
          console.warn("No course content available");
          setContent([]);
          return;
        }
        
        // Safely iterate through topics
        const topicsCount = json_res[0].length || 0;
        const newContent = [];
        for (let i = 0; i < topicsCount; i++) {
          const topic_content = [
            json_res[0][i],
            json_res[i + 1] || [],
            json_res[topicsCount + i + 1] || [{ e_id: null, duration: 0, STATUS: 0 }],
          ];
          newContent.push(topic_content);
        }
        setContent(newContent);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    // Fetch course data
    apiPost("/api/selected_course", { c_id })
      .then((res) => res.json())
      .then((json_res) => {
        if (json_res && json_res[0]) {
          const course = json_res[0];
          setCourseData({
            title: course.title || "",
            description: course.description || "",
            field: course.field || "",
            seat: course.seat || "",
          });
          setEditFormData({
            title: course.title || "",
            description: course.description || "",
            field: course.field || "",
            seat: course.seat || "",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching course data:", error);
      });
  }, [u_id, c_id]);

  const [isVisible, setIsVisible] = useState(Array(content.length).fill(false));

  const toggleVisibility = (index) => {
    const updatedVisibility = [...isVisible];
    updatedVisibility[index] = !updatedVisibility[index];
    setIsVisible(updatedVisibility);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editFormData.title.trim()) newErrors.title = "Title is required";
    if (editFormData.title.length > 100) newErrors.title = "Title must be 100 characters or less";
    if (editFormData.description.length > 1000) newErrors.description = "Description must be 1000 characters or less";
    if (editFormData.field.length > 255) newErrors.field = "Field must be 255 characters or less";
    if (editFormData.seat && (isNaN(editFormData.seat) || parseInt(editFormData.seat) <= 0)) {
      newErrors.seat = "Seat must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMessage("");

    try {
      const response = await apiPost("/api/user/update-course", {
        c_id,
        i_id,
        ...editFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Course updated successfully!");
        setCourseData(editFormData);
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setErrors({ form: data.error || "Failed to update course" });
      }
    } catch (error) {
      console.error("Error updating course:", error);
      setErrors({ form: "Error updating course. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditFormData(courseData);
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="flex-col items-center justify-center">
      {/* Course Edit Section */}
      {courseData && (
        <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-100 px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="sm:text-3xl text-2xl font-medium text-gray-900">
                Course Details
              </h1>
              <button
                onClick={() => {
                  if (isEditing) {
                    handleCancel();
                  } else {
                    setIsEditing(true);
                  }
                }}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  isEditing
                    ? "bg-gray-500 text-white hover:bg-gray-600"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isEditing ? "Cancel" : "Edit Course"}
              </button>
            </div>

            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </div>
            )}

            {errors.form && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.form}
              </div>
            )}

            {isEditing ? (
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter course title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  <p className="text-gray-500 text-sm mt-1">
                    {editFormData.title.length}/100
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows="4"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter course description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">
                    {editFormData.description.length}/1000
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field
                    </label>
                    <input
                      type="text"
                      name="field"
                      value={editFormData.field}
                      onChange={handleEditChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.field ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Web Development"
                    />
                    {errors.field && <p className="text-red-500 text-sm mt-1">{errors.field}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Seats
                    </label>
                    <input
                      type="number"
                      name="seat"
                      value={editFormData.seat}
                      onChange={handleEditChange}
                      min="1"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.seat ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Number of seats"
                    />
                    {errors.seat && <p className="text-red-500 text-sm mt-1">{errors.seat}</p>}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Course Title</p>
                  <p className="text-xl font-semibold text-gray-900">{courseData.title}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{courseData.description || "No description"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Field</p>
                    <p className="text-gray-900 font-medium">{courseData.field || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Available Seats</p>
                    <p className="text-gray-900 font-medium">{courseData.seat || "Unlimited"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Contents Section */}
      <div className="flex flex-wrap w-full flex-col items-center text-center mt-8">
        <h2 className="sm:text-3xl text-2xl font-medium title-font underline text-gray-900">
          Course Contents
        </h2>
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
                  {element[2] && element[2][0] && element[2][0].e_id ? (
                    <>
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
                    </>
                  ) : (
                    <div className="flex flex-col ml-4 flex-grow">
                      <h2 className="text-lg text-gray-500 font-normal title-font">
                        No quiz available for this topic
                      </h2>
                    </div>
                  )}
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
