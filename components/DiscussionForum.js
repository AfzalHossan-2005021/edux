/**
 * Discussion Forum Component
 * Course community space with threads and replies
 */

import { useState, useEffect } from 'react';

// Discussion Thread Item
function ThreadItem({ thread, onSelect, isSelected }) {
  return (
    <div
      onClick={() => onSelect(thread)}
      className={`p-4 border-b cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {thread.isPinned && (
              <span className="text-yellow-500" title="Pinned">📌</span>
            )}
            {thread.isLocked && (
              <span className="text-gray-500" title="Locked">🔒</span>
            )}
            <h3 className="font-semibold text-gray-800 line-clamp-1">{thread.title}</h3>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{thread.content}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{thread.authorName}</span>
            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
            <span>{thread.replyCount} replies</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reply Item
function ReplyItem({ reply, currentUserId, onDelete }) {
  const isAuthor = reply.userId === currentUserId;

  return (
    <div className="p-4 border-b last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
          {reply.authorName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-800">{reply.authorName}</span>
              <span className="text-xs text-gray-500">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
            {isAuthor && (
              <button
                onClick={() => onDelete(reply.replyId)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            )}
          </div>
          <p className="text-gray-700 mt-1 whitespace-pre-wrap">{reply.content}</p>
        </div>
      </div>
    </div>
  );
}

// New Thread Modal
function NewThreadModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    await onSubmit({ title, content });
    setTitle('');
    setContent('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">New Discussion</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter discussion title..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to discuss?"
              rows={5}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Discussion Forum Component
export default function DiscussionForum({ courseId }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadDetails, setThreadDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewThread, setShowNewThread] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (courseId) {
      fetchThreads();
    }
  }, [courseId]);

  useEffect(() => {
    if (selectedThread) {
      fetchThreadDetails(selectedThread.threadId);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      const response = await fetch(`/api/discussions?courseId=${courseId}`);
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThreadDetails = async (threadId) => {
    try {
      const response = await fetch(`/api/discussions?courseId=${courseId}&threadId=${threadId}`);
      const data = await response.json();
      setThreadDetails(data);
    } catch (error) {
      console.error('Failed to fetch thread details:', error);
    }
  };

  const handleCreateThread = async ({ title, content }) => {
    if (!currentUser) {
      alert('Please log in to create a discussion');
      return;
    }

    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId: currentUser.U_ID,
          title,
          content,
        }),
      });

      if (response.ok) {
        fetchThreads();
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUser || !selectedThread) return;

    setIsSubmittingReply(true);
    try {
      const response = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: selectedThread.threadId,
          userId: currentUser.U_ID,
          content: replyContent,
        }),
      });

      if (response.ok) {
        setReplyContent('');
        fetchThreadDetails(selectedThread.threadId);
        fetchThreads(); // Update reply count
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      await fetch('/api/discussions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyId,
          userId: currentUser.U_ID,
        }),
      });
      fetchThreadDetails(selectedThread.threadId);
    } catch (error) {
      console.error('Failed to delete reply:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">💬 Course Discussions</h2>
        <button
          onClick={() => setShowNewThread(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          New Discussion
        </button>
      </div>

      <div className="flex h-[500px]">
        {/* Thread List */}
        <div className="w-1/3 border-r overflow-y-auto">
          {threads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No discussions yet</p>
              <p className="text-sm mt-1">Be the first to start a conversation!</p>
            </div>
          ) : (
            threads.map((thread) => (
              <ThreadItem
                key={thread.threadId}
                thread={thread}
                onSelect={setSelectedThread}
                isSelected={selectedThread?.threadId === thread.threadId}
              />
            ))
          )}
        </div>

        {/* Thread Details */}
        <div className="flex-1 flex flex-col">
          {selectedThread && threadDetails ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-800">{threadDetails.thread.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>By {threadDetails.thread.authorName}</span>
                  <span>{new Date(threadDetails.thread.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-4 text-gray-700 whitespace-pre-wrap">{threadDetails.thread.content}</p>
              </div>

              {/* Replies */}
              <div className="flex-1 overflow-y-auto">
                {threadDetails.replies.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No replies yet. Be the first to respond!
                  </div>
                ) : (
                  threadDetails.replies.map((reply) => (
                    <ReplyItem
                      key={reply.replyId}
                      reply={reply}
                      currentUserId={currentUser?.U_ID}
                      onDelete={handleDeleteReply}
                    />
                  ))
                )}
              </div>

              {/* Reply Form */}
              {!threadDetails.thread.isLocked && currentUser && (
                <form onSubmit={handleSubmitReply} className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmittingReply ? '...' : 'Reply'}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a discussion to view
            </div>
          )}
        </div>
      </div>

      {/* New Thread Modal */}
      <NewThreadModal
        isOpen={showNewThread}
        onClose={() => setShowNewThread(false)}
        onSubmit={handleCreateThread}
      />
    </div>
  );
}
