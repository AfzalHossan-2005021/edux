/**
 * Instructor - Manage Exam Questions
 * URL: /instructor/courses/[c_id]/exams/[e_id]/questions
 * View, Add, Edit, and Delete questions for an exam
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import secureLocalStorage from 'react-secure-storage';
import { apiPost, apiGet } from '@/lib/api';
import { withInstructorAuth } from '@/lib/auth/withServerSideAuth';
import { Card, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';
import {
  HiArrowLeft,
  HiChevronRight,
  HiPlus,
  HiPencil,
  HiTrash,
  HiCheck,
  HiX,
  HiExclamationCircle,
  HiClipboardList,
  HiSave,
  HiQuestionMarkCircle,
  HiRefresh,
} from 'react-icons/hi';

// Option labels mapping
const OPTION_LABELS = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'];

function ManageExamQuestions({ serverUser }) {
  const router = useRouter();
  const { c_id, e_id } = router.query;
  
  // State management
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    q_id: null,
    q_description: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    right_ans: '1',
    marks: 1,
  });
  
  // Loading states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Message state
  const [message, setMessage] = useState({ type: '', text: '' });

  const u_id = useMemo(() => serverUser?.u_id || secureLocalStorage.getItem('u_id'), [serverUser]);

  // Show message helper
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  }, []);

  // Load initial data
  useEffect(() => {
    if (c_id && e_id && u_id) {
      loadData();
    }
  }, [c_id, e_id, u_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get course info to verify instructor ownership
      const coursesRes = await apiPost('/api/instructor_courses', { u_id });
      const coursesData = await coursesRes.json();
      const courses = Array.isArray(coursesData) ? coursesData : (coursesData.courses || []);
      const foundCourse = courses.find(c => (c.c_id || c.C_ID) === Number(c_id));
      
      if (!foundCourse) {
        router.push('/instructor');
        return;
      }
      
      setCourse(foundCourse);
      
      // Load exam and questions
      await loadExamQuestions();
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'Failed to load data');
      setLoading(false);
    }
  };

  const loadExamQuestions = async () => {
    try {
      const response = await apiGet(`/api/exam/questions?e_id=${e_id}`);
      const data = await response.json();
      
      if (data.success) {
        setExam(data.exam);
        setQuestions(data.questions || []);
      } else {
        throw new Error(data.error || 'Failed to load exam');
      }
    } catch (error) {
      console.error('Error loading exam questions:', error);
      showMessage('error', 'Failed to load exam questions');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      q_id: null,
      q_description: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      right_ans: '1',
      marks: 1,
    });
    setIsEditing(false);
  };

  // Open modal for adding new question
  const handleAddQuestion = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing question
  const handleEditQuestion = (question) => {
    setFormData({
      q_id: question.q_id || question.Q_ID,
      q_description: question.q_description || question.Q_DESCRIPTION || '',
      option_a: question.option_a || question.OPTION_A || question.opt1 || '',
      option_b: question.option_b || question.OPTION_B || question.opt2 || '',
      option_c: question.option_c || question.OPTION_C || question.opt3 || '',
      option_d: question.option_d || question.OPTION_D || question.opt4 || '',
      right_ans: String(question.right_ans || question.RIGHT_ANS || '1'),
      marks: Number(question.marks || question.MARKS || 1),
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save question (add or update)
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.q_description.trim()) {
      showMessage('error', 'Question description is required');
      return;
    }
    
    if (!formData.option_a.trim() || !formData.option_b.trim()) {
      showMessage('error', 'At least options A and B are required');
      return;
    }

    setSaving(true);
    
    try {
      const payload = {
        ...formData,
        e_id: Number(e_id),
        marks: Number(formData.marks),
        right_ans: String(formData.right_ans),
      };

      const url = isEditing ? '/api/update-question' : '/api/add-question';
      
      const response = await apiPost(url, payload);
      const data = await response.json();

      if (data.success) {
        showMessage('success', isEditing ? 'Question updated successfully!' : 'Question added successfully!');
        handleCloseModal();
        await loadExamQuestions();
      } else {
        showMessage('error', data.message || 'Failed to save question');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      showMessage('error', 'Failed to save question. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;

    setDeleting(true);
    
    try {
      const response = await apiPost('/api/delete-question', {
        q_id: questionToDelete.q_id || questionToDelete.Q_ID
      });
      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Question deleted successfully!');
        setIsDeleteModalOpen(false);
        setQuestionToDelete(null);
        await loadExamQuestions();
      } else {
        showMessage('error', data.message || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      showMessage('error', 'Failed to delete question. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Get correct answer text
  const getCorrectAnswerText = (question) => {
    const answerIndex = String(question.right_ans || question.RIGHT_ANS);
    const optionKey = OPTION_KEYS[parseInt(answerIndex) - 1];
    return question[optionKey] || question[optionKey.toUpperCase()] || 
           question[`opt${answerIndex}`] || '—';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading exam questions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Manage Questions | EduX</title>
        <meta name="description" content="Manage exam questions" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="py-3 flex items-center gap-2 text-sm overflow-x-auto">
              <Link href="/instructor" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors whitespace-nowrap">
                Dashboard
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Link href={`/instructor/courses/${c_id}`} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors whitespace-nowrap">
                Course
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <Link href={`/instructor/courses/${c_id}/manage-content`} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors whitespace-nowrap">
                Content
              </Link>
              <HiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900 dark:text-white font-medium whitespace-nowrap">Questions</span>
            </div>

            {/* Title Row */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                  <HiClipboardList className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Exam Questions
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {exam?.marks || 0} total marks • {questions.length} question{questions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/instructor/courses/${c_id}/manage-content`}>
                  <Button variant="outline" size="sm">
                    <HiArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadExamQuestions}
                  className="text-gray-600"
                >
                  <HiRefresh className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className={`p-4 rounded-xl border-2 flex items-center gap-3 animate-fadeIn ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
            }`}>
              {message.type === 'success' ? (
                <HiCheck className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <HiExclamationCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <p className={`font-medium ${
                message.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Add Question Button */}
          <div className="mb-6">
            <Button
              variant="primary"
              onClick={handleAddQuestion}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add New Question
            </Button>
          </div>

          {/* Questions List */}
          {questions.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
              <HiQuestionMarkCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Questions Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                This exam doesn't have any questions. Add your first question to get started.
              </p>
              <Button
                variant="primary"
                onClick={handleAddQuestion}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                <HiPlus className="w-5 h-5 mr-2" />
                Add First Question
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const qId = question.q_id || question.Q_ID;
                const rightAns = String(question.right_ans || question.RIGHT_ANS);
                
                return (
                  <Card key={qId} className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                    {/* Question Header */}
                    <div className="p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                            {question.q_description || question.Q_DESCRIPTION}
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="info" className="text-xs">
                              {question.marks || question.MARKS} mark{(question.marks || question.MARKS) !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditQuestion(question)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                            title="Edit question"
                          >
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(question)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete question"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {OPTION_KEYS.map((optKey, i) => {
                          const optionNum = String(i + 1);
                          const optionValue = question[optKey] || question[optKey.toUpperCase()] || 
                                            question[`opt${optionNum}`] || '';
                          const isCorrect = rightAns === optionNum;
                          
                          return (
                            <div
                              key={optKey}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                isCorrect
                                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                                  : 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                  isCorrect
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}>
                                  {OPTION_LABELS[optionNum]}
                                </span>
                                <span className={`flex-1 ${
                                  isCorrect
                                    ? 'text-green-800 dark:text-green-200 font-medium'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {optionValue || '—'}
                                </span>
                                {isCorrect && (
                                  <HiCheck className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Correct Answer Summary */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Correct Answer:</span>
                          <Badge variant="success" className="font-semibold">
                            {OPTION_LABELS[rightAns]} - {getCorrectAnswerText(question)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Question Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg">
        <ModalHeader onClose={handleCloseModal}>
          {isEditing ? 'Edit Question' : 'Add New Question'}
        </ModalHeader>
        <form onSubmit={handleSaveQuestion}>
          <ModalBody className="space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Question Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Question <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.q_description}
                onChange={(e) => handleInputChange('q_description', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                placeholder="Enter your question here..."
                rows="3"
              />
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OPTION_KEYS.map((optKey, i) => {
                const optionLabel = OPTION_LABELS[String(i + 1)];
                const isRequired = i < 2;
                
                return (
                  <div key={optKey}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Option {optionLabel} {isRequired && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={isRequired}
                      value={formData[optKey]}
                      onChange={(e) => handleInputChange(optKey, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      placeholder={`Enter option ${optionLabel}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Correct Answer and Marks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.right_ans}
                  onChange={(e) => handleInputChange('right_ans', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="1">A</option>
                  <option value="2">B</option>
                  <option value="3">C</option>
                  <option value="4">D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Marks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.marks}
                  onChange={(e) => handleInputChange('marks', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="1"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <HiSave className="w-5 h-5 mr-2" />
                  {isEditing ? 'Update Question' : 'Add Question'}
                </>
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} size="sm">
        <ModalHeader onClose={() => setIsDeleteModalOpen(false)}>
          Delete Question
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <HiExclamationCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Are you sure?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              This action cannot be undone. The following question will be permanently deleted:
            </p>
            {questionToDelete && (
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg italic">
                "{(questionToDelete.q_description || questionToDelete.Q_DESCRIPTION || '').slice(0, 100)}
                {(questionToDelete.q_description || questionToDelete.Q_DESCRIPTION || '').length > 100 ? '...' : ''}"
              </p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <HiTrash className="w-5 h-5 mr-2" />
                Delete Question
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default ManageExamQuestions;

// Server-side authentication
export const getServerSideProps = withInstructorAuth();
