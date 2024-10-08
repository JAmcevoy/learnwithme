import React, { useState, useEffect, useCallback } from 'react';
import { FaThumbsUp, FaEdit, FaTrash } from "react-icons/fa";
import { useParams, Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from "../../context/CurrentUserContext";
import DeleteConfirmation from '../../components/DeleteModal';
import ErrorModal from '../../components/ErrorModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import Swal from 'sweetalert2';

const PostDetails = () => {
  const { id } = useParams();
  const history = useHistory();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeId, setLikeId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const currentUser = useCurrentUser();

  // Fetch post details and like status when component mounts or when ID changes
  const fetchPost = useCallback(async () => {
    try {
      const response = await axios.get(`/posts/${id}/`);
      const fetchedPost = response.data;
      setPost(fetchedPost);

      // Check if the current user has liked the post
      if (currentUser) {
        const likedBy = fetchedPost.liked_by || [];
        setLiked(likedBy.includes(currentUser.id));
        setLikeId(fetchedPost.like_id || null);
      }
    } catch (err) {
      console.error('Error fetching post details:', err);
      setError('Error fetching post details.');
      setShowErrorModal(true);
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Handle toggling like/unlike functionality
  const toggleLike = async () => {
    try {
      if (liked) {
        await axios.delete(`/likes/${likeId}/`);
        updatePostLikes(-1, null);
      } else {
        const { data } = await axios.post("/likes/", { post: id });
        updatePostLikes(1, data.id);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      setError('Error toggling like. Please make sure you are signed in.');
      setShowErrorModal(true);
    }
  };

  // Update the post likes count and like state
  const updatePostLikes = (likeChange, newLikeId) => {
    setPost(prevPost => ({
      ...prevPost,
      likes_count: prevPost.likes_count + likeChange,
      like_id: newLikeId,
    }));
    setLiked(!liked);
    setLikeId(newLikeId);
  };

  // Handle post deletion
  // Handle post deletion
const handleDelete = async () => {
  try {
      await axiosReq.delete(`/posts/${id}/`);
      
      // Show success message with SweetAlert
      Swal.fire({
          title: 'Deleted!',
          text: 'Your post has been deleted.',
          icon: 'success',
          confirmButtonText: 'OK'
      }).then(() => {
          history.push('/'); // Redirect to home after successful deletion
      });

  } catch (err) {
      console.error('Error deleting post:', err);

      // Show error message with SweetAlert
      Swal.fire({
          title: 'Error!',
          text: 'Failed to delete the post. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
      });
  }
};

  const handleDeleteClick = () => setShowDeleteConfirmation(true);

  const handleCancelDelete = () => setShowDeleteConfirmation(false);

  const handleConfirmDelete = () => {
    setShowDeleteConfirmation(false);
    handleDelete();
  };

  // Format steps into paragraphs
  const formatSteps = (stepsText) => stepsText
    .split('\n')
    .map((line, index) => <p key={index} className="mb-2">{line}</p>);

  // Render loading spinner if post is not yet loaded
  if (!post) return <LoadingSpinner />;

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-400 p-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">Post Details</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Post Image or Placeholder */}
          <div className="flex-none w-full md:w-1/2">
            {post?.image_or_video ? (
              <img
                src={post.image_or_video}
                alt="Post Content"
                className="w-full h-auto object-cover rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg">
                <p className="text-gray-500">No Media Available</p>
              </div>
            )}
          </div>

          {/* Post Details */}
          <div className="flex-1 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold mb-4 text-gray-900">{post?.title}</h2>

            {/* Owner Info */}
            <div className="flex items-center mb-4">
              <img
                src={post?.profile_image || "https://via.placeholder.com/48"}
                alt="Profile"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <Link
                  to={`/profile/${post?.owner_profile_id}`}
                  className="text-xl font-semibold text-gray-900"
                >
                  {post?.owner}
                </Link>
                <p className="text-sm text-gray-500">{new Date(post?.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Post Steps */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Steps</h3>
              <div className="text-gray-700">{formatSteps(post?.steps) || 'No steps provided.'}</div>
            </div>

            {/* Post Category */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Category</h3>
              <p className="text-gray-700">{post?.category_name || 'No category assigned.'}</p>
            </div>

            {/* Like and Action Buttons */}
            <div className="p-4">
              <div className="flex items-center space-x-6">
                <button
                  className="flex items-center text-gray-500 hover:text-blue-500 text-sm"
                  onClick={toggleLike}
                >
                  <FaThumbsUp className={`mr-1 ${liked ? "text-blue-500" : "text-gray-500"}`} />
                  {liked ? "Unlike" : "Like"} ({post.likes_count})
                </button>
                {post?.is_owner && (
                  <>
                    <Link to={`/posts/edit/${id}`} className="flex items-center text-gray-500 hover:text-blue-500">
                      <FaEdit className="mr-2" /> Edit
                    </Link>
                    <button
                      className="flex items-center text-gray-500 hover:text-blue-500"
                      onClick={handleDeleteClick}
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <DeleteConfirmation
          message="Are you sure you want to delete this post?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          message={error}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
};

export default PostDetails;
