import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button, Form, Badge, Spinner, Modal, Dropdown } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import WallService from "../services/wall.service";
import "./Wall.css";

const Wall = () => {
  const [redirect, setRedirect] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [imageBlobUrls, setImageBlobUrls] = useState({});
  
  // For comments
  const [expandedComments, setExpandedComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentText, setCommentText] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [editCommentSubmitting, setEditCommentSubmitting] = useState(false);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [commentSubmitting, setCommentSubmitting] = useState({});
  
  // Function to pre-fetch an image and convert it to a blob URL
  const fetchImageAsBlob = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };
  
  // Helper function to resolve URLs
  const resolveMediaUrl = (url) => {
    if (!url) return "";
    
    // Get the filename from the URL
    const getFilename = (url) => {
      const parts = url.split('/');
      return parts[parts.length - 1];
    };
    
    // Handle backend URLs
    if (url.includes('/api/files/')) {
      // First try the direct backend URL
      return 'http://localhost:8080' + url;
    }
    
    // If it's an absolute URL to our API server, keep it
    if (url.startsWith('http://localhost:8080')) {
      return url;
    }
    
    // If already a relative URL starting with /api, add backend server
    if (url.startsWith('/api/')) {
      return 'http://localhost:8080' + url;
    }
    
    // If only the filename was provided, construct proper URL
    if (!url.startsWith('/') && !url.startsWith('http')) {
      return 'http://localhost:8080/api/files/images/' + url;
    }
    
    // If it's some other URL, return as is
    return url;
  };
  
  // Get a local fallback URL if the backend URL fails
  const getLocalImageUrl = (url) => {
    if (!url) return "/image-not-found.svg";
    
    // Extract the filename from the URL
    const filename = url.split('/').pop();
    
    // Use the local copy in the public folder
    return `/images/${filename}`;
  };
  
  // For post creation
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [error, setError] = useState("");
  
  // For post editing
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Add this function before loadPosts
  const verifyLoginStatus = () => {
    const user = AuthService.getCurrentUser();
    
    if (!user) {
      console.error("No user found in localStorage");
      setRedirect("/login");
      return false;
    }
    
    if (!user.token) {
      console.error("User found but missing token");
      setRedirect("/login");
      return false;
    }
    
    // Basic token validation (check if it's expired based on its format)
    try {
      // JWT tokens have 3 parts separated by dots
      const tokenParts = user.token.split('.');
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        AuthService.logout(); // Clear invalid token
        setRedirect("/login");
        return false;
      }
      
      // The middle part contains the payload, which needs to be decoded
      const payload = JSON.parse(atob(tokenParts[1]));
      const expiryDate = new Date(payload.exp * 1000); // exp is in seconds
      
      if (expiryDate < new Date()) {
        console.error("Token expired at:", expiryDate);
        AuthService.logout(); // Clear expired token
        setRedirect("/login");
        return false;
      }
      
      console.log("Token valid until:", expiryDate);
      return true;
    } catch (error) {
      console.error("Error validating token:", error);
      return true; // Continue anyway on parsing error
    }
  };

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    
    if (!user) {
      setRedirect("/login");
    } else {
      setCurrentUser(user);
      // Verify login status before loading posts
      if (verifyLoginStatus()) {
        loadPosts();
      }
    }
  }, []);

  const loadPosts = () => {
    setLoading(true);
    // Reset image load status when loading new posts
    setImageLoadStatus({});
    setImageBlobUrls({});
    
    WallService.getAllPosts()
      .then((response) => {
        console.log("Raw posts received:", JSON.stringify(response.data));
        
        // Log image and video URLs for debugging
        const processedPosts = response.data.map(post => {
          console.log(`Processing post ${post.id}`);
          
          // Process post to ensure URLs are correct
          if (post.images && post.images.length > 0) {
            post.images.forEach((img, idx) => {
              console.log(`Post ${post.id} original image ${idx} URL:`, img.url);
              
              // Make sure URL is in the correct format
              if (img.url) {
                // Store the original URL before modifying
                img.originalUrl = img.url;
                
                // Check if the URL has the api/files pattern or needs to be constructed
                if (!img.url.includes('/api/files/')) {
                  // Check if it's just a filename
                  if (!img.url.startsWith('/') && !img.url.startsWith('http')) {
                    img.url = '/api/files/images/' + img.url;
                  }
                }
                
                // Create the direct backend URL
                img.directUrl = 'http://localhost:8080' + img.url;
                
                // Pre-fetch the image as a blob
                const imageKey = `post-${post.id}-img-${idx}`;
                fetchImageAsBlob(img.directUrl)
                  .then(blobUrl => {
                    if (blobUrl) {
                      console.log(`Created blob URL for image ${idx}:`, blobUrl);
                      setImageBlobUrls(prev => ({
                        ...prev,
                        [imageKey]: blobUrl
                      }));
                      
                      // Mark as loaded
                      setImageLoadStatus(prev => ({
                        ...prev,
                        [imageKey]: true
                      }));
                    }
                  });
                
                console.log(`Post ${post.id} processed image ${idx} URL:`, img.url);
                console.log(`Post ${post.id} direct image ${idx} URL:`, img.directUrl);
              }
            });
          }
          
          if (post.video) {
            console.log(`Post ${post.id} original video URL:`, post.video.url);
            
            if (post.video.url) {
              // Store the original URL before modifying
              post.video.originalUrl = post.video.url;
              
              // Check if the URL has the api/files pattern or needs to be constructed
              if (!post.video.url.includes('/api/files/')) {
                // Check if it's just a filename
                if (!post.video.url.startsWith('/') && !post.video.url.startsWith('http')) {
                  post.video.url = '/api/files/videos/' + post.video.url;
                }
              }
              
              console.log(`Post ${post.id} processed video URL:`, post.video.url);
            }
          }
          
          return post;
        });
        
        setPosts(processedPosts);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading posts:", error);
        setLoading(false);
      });
  };

  // Add loading indicator for the wall if images fail to load
  // Function to refresh the feed if images aren't loading
  const refreshFeed = () => {
    // Clear any cached data
    setPosts([]);
    // Reload posts
    loadPosts();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of images (max 3)
    if (selectedImages.length + files.length > 3) {
      setError("You can upload a maximum of 3 images in total");
      return;
    }

    // Add new images to existing selection
    const newSelectedImages = [...selectedImages, ...files];
    setSelectedImages(newSelectedImages);
    
    // Create preview URLs for new images and add to existing previews
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newImagePreviews]);
    
    // Clear any errors
    setError("");
  };

  const handleVideoChange = (e) => {
    console.log("Video input change triggered");
    
    // Simplify video selection - don't use the reset/re-click pattern
    // which might be causing issues when combined with image selection
    const file = e.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    console.log("Video file selected:", file.name, "type:", file.type, "size:", file.size);
    
    // Validate video file type
    const supportedTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!supportedTypes.includes(file.type)) {
      console.error("Unsupported video format:", file.type);
      setError(`Unsupported video format. Please use MP4, WebM, or Ogg (current: ${file.type})`);
      return;
    }
    
    // Check if already has a video and clear it
    if (selectedVideo) {
      URL.revokeObjectURL(previewVideo);
      setSelectedVideo(null);
      setPreviewVideo(null);
    }

    // Process the video file directly without extra validation steps
    try {
      // Create a preview immediately
      const previewUrl = URL.createObjectURL(file);
      console.log("Created video preview URL:", previewUrl);
      
      // Set the video file and preview
      setSelectedVideo(file);
      setPreviewVideo(previewUrl);
      setError(""); // Clear any previous errors
      
      console.log("Video preview set successfully");
    } catch (error) {
      console.error("Error setting video preview:", error);
      setError("Error processing video. Please try a different file.");
    }
  };

  const clearMediaSelections = () => {
    // Clear image previews
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setPreviewImages([]);
    
    // Clear video preview
    if (previewVideo) {
      URL.revokeObjectURL(previewVideo);
    }
    setSelectedVideo(null);
    setPreviewVideo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!postText && selectedImages.length === 0 && !selectedVideo) {
      setError("Please add some text, images, or a video to create a post");
      return;
    }
    
    console.log("Submit triggered with:", {
      hasText: !!postText,
      imageCount: selectedImages.length,
      hasVideo: !!selectedVideo
    });
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append("text", postText);
    
    // Add images
    selectedImages.forEach((image, index) => {
      console.log(`Adding image ${index} to form:`, image.name);
      formData.append("images", image);
    });
    
    // Add video
    if (selectedVideo) {
      try {
        console.log("Adding video to form:", selectedVideo.name, "type:", selectedVideo.type, "size:", selectedVideo.size);
        formData.append("video", selectedVideo);
      } catch (error) {
        console.error("Error adding video to form:", error);
        setError("Error processing video file");
      }
    }
    
    // Log all form data (debugging)
    console.log("Form data entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1] instanceof File ? pair[1].name : pair[1]);
    }
    
    WallService.createPost(formData)
      .then((response) => {
        console.log("Post created successfully:", response.data);
        
        // Clear form
        setPostText("");
        clearMediaSelections();
        setError("");
        
        // Reload posts to show the new one
        loadPosts();
        setUploading(false);
      })
      .catch((error) => {
        console.error("Error creating post:", error);
        setError("An error occurred while creating the post");
        setUploading(false);
      });
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditText(post.text);
  };
  
  const cancelEditPost = () => {
    setEditingPost(null);
    setEditText("");
  };
  
  const submitEditPost = () => {
    setUploading(true);
    
    WallService.updatePost(editingPost.id, { text: editText })
      .then((response) => {
        console.log("Post updated successfully:", response.data);
        
        // Update post in the state
        const updatedPosts = posts.map(post => {
          if (post.id === editingPost.id) {
            return { ...post, text: editText };
          }
          return post;
        });
        
        setPosts(updatedPosts);
        cancelEditPost();
        setUploading(false);
      })
      .catch((error) => {
        console.error("Error updating post:", error);
        setError("An error occurred while updating the post");
        setUploading(false);
      });
  };
  
  const confirmDeletePost = (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };
  
  const cancelDeletePost = () => {
    setPostToDelete(null);
    setShowDeleteConfirm(false);
  };
  
  const deletePost = () => {
    setUploading(true);
    
    WallService.deletePost(postToDelete.id)
      .then(() => {
        console.log("Post deleted successfully");
        
        // Reset all states related to post content
        setPostText("");
        clearMediaSelections();
        
        // Reset file input elements to ensure they're fresh
        const imageInput = document.getElementById('image-upload');
        if (imageInput) imageInput.value = '';
        
        const videoInput = document.getElementById('video-upload');
        if (videoInput) videoInput.value = '';
        
        // Complete reset of media states
        setSelectedImages([]);
        setPreviewImages([]);
        setSelectedVideo(null);
        setPreviewVideo(null);
        
        // Create a small delay before updating the UI
        setTimeout(() => {
          // Remove post from the state
          const updatedPosts = posts.filter(post => post.id !== postToDelete.id);
          setPosts(updatedPosts);
          
          // Clear any errors
          setError("");
          
          cancelDeletePost();
          setUploading(false);
          
          // Force refresh of posts from server after deletion
          loadPosts();
        }, 500);
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
        setError("An error occurred while deleting the post");
        setUploading(false);
        cancelDeletePost();
      });
  };
  
  // Delete confirmation modal component
  const DeleteConfirmationModal = () => (
    <Modal show={showDeleteConfirm} onHide={cancelDeletePost} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this post? This action cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cancelDeletePost}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={deletePost}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
              Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Function to toggle comments visibility for a post
  const toggleComments = (postId) => {
    console.log(`Toggle comments for post ${postId}`);
    
    // Toggle expanded state
    setExpandedComments(prev => {
      const newState = {
        ...prev,
        [postId]: !prev[postId]
      };
      
      // If comments are being expanded and not loaded yet, load them
      if (newState[postId] && (!posts.find(p => p.id === postId)?.comments)) {
        console.log(`Comments not loaded for post ${postId}, loading now`);
        loadComments(postId);
      } else {
        console.log(`Comments already loaded for post ${postId} or section closed`);
      }
      
      return newState;
    });
  };
  
  // Function to load comments for a post
  const loadComments = (postId) => {
    console.log(`Loading comments for post ${postId}`);
    setCommentsLoading(prev => ({ ...prev, [postId]: true }));
    
    // Check authentication status
    const currentUserData = AuthService.getCurrentUser();
    
    console.log("Current user data:", currentUserData);
    
    if (!currentUserData) {
      console.error("User not authenticated - no user data");
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            return { 
              ...post, 
              comments: [], 
              commentsError: "You need to login again. No authentication data found." 
            };
          }
          return post;
        });
        return updatedPosts;
      });
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
      return;
    }
    
    if (!currentUserData.token) {
      console.error("User not authenticated - missing token");
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            return { 
              ...post, 
              comments: [], 
              commentsError: "Authentication required. Please log in again." 
            };
          }
          return post;
        });
        return updatedPosts;
      });
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
      return;
    }
    
    // Debug token
    console.log("Using token:", currentUserData.token.substring(0, 20) + "...");
    console.log("Token length:", currentUserData.token.length);
    
    // Set a timeout to detect long-running requests
    const timeoutId = setTimeout(() => {
      console.log(`Comment loading timeout for post ${postId}`);
      setPosts(prevPosts => {
        const updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            // Set an empty comments array to avoid infinite loading
            return { ...post, comments: [], commentsError: "Timeout loading comments. Server might be down." };
          }
          return post;
        });
        return updatedPosts;
      });
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }, 10000); // 10 seconds timeout
    
    WallService.getComments(postId)
      .then(response => {
        // Clear the timeout as we got a response
        clearTimeout(timeoutId);
        
        console.log(`Comments loaded for post ${postId}:`, response.data);
        
        // Process the comments from server - debug each comment in detail
        const processedComments = response.data.map((comment, index) => {
          console.log(`Processing comment ${index}:`, JSON.stringify(comment));
          
          // Generate unique ID for comments with null or missing ID
          if (!comment.id && comment.id !== 0) {
            console.warn(`Comment ${index} has null/missing ID, generating temporary ID`);
            // Use a unique ID format that won't conflict with DB IDs
            // Combining timestamp, post ID and index ensures uniqueness
            const tempId = `temp_${Date.now()}_${postId}_${index}`;
            
            const commentWithTempId = {
              ...comment,
              id: tempId,
              isTemporaryId: true, // Flag to identify client-generated IDs
              postId: postId // Add postId to comment for reference
            };
            
            console.log(`Generated temporary ID for comment ${index}:`, commentWithTempId);
            return commentWithTempId;
          }
          
          // For comments with valid IDs, ensure it's a number if possible
          let processedId = comment.id;
          if (typeof processedId === 'string') {
            const numericId = parseInt(processedId, 10);
            if (!isNaN(numericId)) {
              processedId = numericId;
            }
          }
          
          // For comments with valid IDs
          const commentWithPostId = {
            ...comment,
            id: processedId,
            postId: postId // Add postId to comment for reference
          };
          
          console.log(`Added postId to comment ${index}:`, commentWithPostId);
          return commentWithPostId;
        });
        
        console.log("Final processed comments:", processedComments);
        
        // Update the post with comments data
        setPosts(prevPosts => {
          const updatedPosts = prevPosts.map(post => 
            post.id === postId 
              ? { ...post, comments: processedComments, commentsError: null } 
              : post
          );
          
          // Debug the updated post structure
          const updatedPost = updatedPosts.find(p => p.id === postId);
          console.log(`Updated post ${postId} with comments:`, updatedPost?.comments);
          
          return updatedPosts;
        });
        setCommentsLoading(prev => ({ ...prev, [postId]: false }));
      })
      .catch(error => {
        // Clear the timeout as we got a response (error)
        clearTimeout(timeoutId);
        
        console.error(`Error loading comments for post ${postId}:`, error);
        
        // Update post with error message
        setPosts(prevPosts => {
          const updatedPosts = prevPosts.map(post => {
            if (post.id === postId) {
              // Set empty comments array with error message
              const errorMessage = error.response 
                ? `Error ${error.response.status}: ${error.response.data.message || 'Unknown error'}`
                : "Network error. Backend server might be down.";
              
              return { 
                ...post, 
                comments: [], 
                commentsError: errorMessage
              };
            }
            return post;
          });
          return updatedPosts;
        });
        
        setCommentsLoading(prev => ({ ...prev, [postId]: false }));
      });
  };
  
  // Function to handle comment input change
  const handleCommentChange = (postId, value) => {
    setCommentText(prev => ({
      ...prev,
      [postId]: value
    }));
  };
  
  // Function to submit a new comment
  const submitComment = (postId) => {
    try {
      console.log(`Attempting to submit comment for post ${postId}:`, commentText[postId]);
      
      if (!commentText[postId] || commentText[postId].trim() === '') {
        console.log("Comment text is empty, not submitting");
        return;
      }
      
      // Check if user is logged in
      if (!currentUser) {
        console.error("Cannot submit comment: User not logged in");
        alert("Please log in to comment");
        return;
      }
      
      console.log("Setting comment submitting state to true");
      setCommentSubmitting(prev => ({ ...prev, [postId]: true }));
      
      console.log(`Calling WallService.addComment with postId=${postId}, text="${commentText[postId]}"`);
      WallService.addComment(postId, commentText[postId])
        .then(response => {
          console.log("Comment added successfully:", response.data);
          
          // The server should return the new comment with a valid ID
          let newComment = response.data;
          console.log("New comment from server:", newComment);
          
          // Check if the server returned a comment without an ID
          if (!newComment.id && newComment.id !== 0) {
            console.warn("Server returned comment without ID. Creating temporary ID.");
            // Generate a temporary ID for the comment
            const tempId = `temp_${Date.now()}_${postId}_${Math.random().toString(36).substring(2, 9)}`;
            newComment = {
              ...newComment,
              id: tempId,
              isTemporaryId: true
            };
          }
          
          // Always add the postId reference to help with updates/deletes
          newComment.postId = postId;
          
          // Update the post with the new comment
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === postId) {
                const updatedComments = post.comments ? [...post.comments, newComment] : [newComment];
                console.log(`Updated comments for post ${postId}:`, updatedComments);
                return { ...post, comments: updatedComments };
              }
              return post;
            })
          );
          
          // Clear the comment input
          setCommentText(prev => ({
            ...prev,
            [postId]: ''
          }));
          
          setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
        })
        .catch(commentError => {
          console.error(`Error adding comment to post ${postId}:`, commentError);
          console.error("Error details:", commentError.response ? commentError.response.data : "No response data");
          alert("Failed to add comment. Please try again.");
          setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
        });
    } catch (commentSubmitError) {
      console.error("Unexpected error in submitComment:", commentSubmitError);
      setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
    }
  };
  
  // Function to start editing a comment
  const handleEditComment = (comment) => {
    console.log("handleEditComment called with:", comment);
    
    if (!comment) {
      console.error("Invalid comment (null or undefined)");
      alert("Cannot edit this comment. Please try again.");
      return;
    }
    
    try {
      // Store the editing comment with all its properties
      console.log("Setting editingComment state to:", comment);
      setEditingComment(comment);
      
      console.log("Setting editCommentText to:", comment.text || "");
      setEditCommentText(comment.text || "");
      
      console.log("Edit mode should now be active");
    } catch (editError) {
      console.error("Error in handleEditComment:", editError);
      alert("An error occurred while trying to edit the comment");
    }
  };
  
  // Function to cancel editing a comment
  const cancelEditComment = () => {
    console.log("Canceling comment edit. Current editing comment:", editingComment);
    setEditingComment(null);
    setEditCommentText('');
    console.log("Edit canceled, editingComment set to null");
  };
  
  // Function to submit an edited comment
  const submitEditComment = () => {
    try {
      console.log("submitEditComment called with editingComment:", editingComment);
      
      if (!editingComment) {
        console.error("No editing comment available");
        alert("No comment selected for editing");
        return;
      }
      
      if (!editCommentText.trim()) {
        console.log("Empty comment text, not submitting");
        return;
      }
      
      const postId = editingComment.postId;
      console.log("Comment edit state:", {
        editingComment: editingComment.id, 
        isTemp: typeof editingComment.id === 'string' && editingComment.id.startsWith('temp_')
      });
      
      // Check if this is a temporary ID (starts with temp_) or has no ID
      const hasTempId = typeof editingComment.id === 'string' && editingComment.id.startsWith('temp_');
      
      // Always create a new comment when editing comments with temporary or null ID
      if (!editingComment.id || editingComment.id === null || hasTempId) {
        console.log("Comment has temporary or null ID, creating a new comment instead");
        setEditCommentSubmitting(true);
        
        // Create a new comment
        WallService.addComment(postId, editCommentText)
          .then(response => {
            console.log("New comment created:", response.data);
            
            // Replace the comment in the UI
            setPosts(prevPosts => 
              prevPosts.map(post => {
                if (post.id === postId && post.comments) {
                  // Get all comments except the one being edited (compare by ID to be safe)
                  const otherComments = post.comments.filter(c => c.id !== editingComment.id);
                  // Add the new comment
                  return { ...post, comments: [...otherComments, response.data] };
                }
                return post;
              })
            );
            
            // Reset state
            setEditCommentSubmitting(false);
            cancelEditComment();
          })
          .catch(error => {
            console.error("Error creating replacement comment:", error);
            alert("Failed to update comment. Please try again.");
            setEditCommentSubmitting(false);
          });
          
        return;
      }
      
      // For comments with IDs, proceed with normal update
      console.log(`Updating comment ${editingComment.id} for post ${postId}`);
      setEditCommentSubmitting(true);
      
      WallService.updateComment(postId, editingComment.id, editCommentText)
        .then(response => {
          console.log("Comment updated:", response.data);
          
          // Update comment in the UI
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === postId && post.comments) {
                // Use ID-based comparison instead of reference equality
                const updatedComments = post.comments.map(c => {
                  console.log("Comparing comment ID:", c.id, "with editing comment ID:", editingComment.id);
                  return c.id === editingComment.id ? { ...c, text: editCommentText } : c;
                });
                return { ...post, comments: updatedComments };
              }
              return post;
            })
          );
          
          // Reset state
          setEditCommentSubmitting(false);
          cancelEditComment();
        })
        .catch(error => {
          console.error(`Error updating comment:`, error);
          alert("Failed to update comment. Please try again.");
          setEditCommentSubmitting(false);
        });
    } catch (error) {
      console.error("Error in submitEditComment:", error);
      setEditCommentSubmitting(false);
    }
  };
  
  // Helper function to prepare a comment with proper metadata
  const prepareCommentWithMetadata = (comment, postId) => {
    console.log("prepareCommentWithMetadata called with:", { comment, postId });
    
    if (!comment) {
      console.error("prepareCommentWithMetadata received null comment");
      return null;
    }
    
    // Create a base object to work with
    const preparedComment = { ...comment };
    
    // Ensure postId is set
    preparedComment.postId = comment.postId || postId || comment.post?.id;
    console.log("postId set to:", preparedComment.postId);
    
    // Handle missing ID by creating a temporary one
    if (!preparedComment.id) {
      console.warn("Comment has null ID, generating a temporary one");
      preparedComment.id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      preparedComment.isTemporaryId = true;
      console.log("Generated temporary ID:", preparedComment.id);
    }
    
    // Check if ID is a temporary one
    const isTemporary = 
      preparedComment.isTemporaryId || 
      (typeof preparedComment.id === 'string' && preparedComment.id.startsWith('temp_'));
    
    preparedComment.isTemporaryId = isTemporary;
    console.log("isTemporaryId set to:", preparedComment.isTemporaryId);
    
    // For regular IDs, try to convert strings to numbers
    if (!isTemporary && typeof preparedComment.id === 'string') {
      const parsedId = parseInt(preparedComment.id, 10);
      if (!isNaN(parsedId)) {
        preparedComment.id = parsedId;
        console.log("Converted string ID to number:", preparedComment.id);
      }
    }
    
    console.log("Final prepared comment:", preparedComment);
    return preparedComment;
  };
  
  // Function to confirm deleting a comment
  const confirmDeleteComment = (comment, postId) => {
    console.log("Preparing to delete comment:", comment, "for post:", postId);
    
    // Validate comment exists
    if (!comment) {
      console.error("Cannot delete comment: Comment is null or undefined");
      alert("Cannot delete this comment: Invalid comment object");
      return;
    }
    
    // Find the post ID from various possible sources
    // This ensures we always have a valid post reference
    const resolvedPostId = postId || comment.postId || comment.post?.id || 
                          (typeof comment.post === 'number' ? comment.post : null);
    
    // Check if comment already has isTemporaryId flag and postId set
    // If so, we can use it directly but ensure postId is set correctly
    if (comment.hasOwnProperty('isTemporaryId')) {
      console.log("Comment already has metadata, updating postId if needed:", comment);
      const updatedComment = {
        ...comment,
        postId: resolvedPostId || comment.postId
      };
      setCommentToDelete(updatedComment);
      setShowDeleteCommentConfirm(true);
      return;
    }
    
    // Handle case where comment ID is null or missing
    if (!comment.id) {
      console.log("Comment has null ID, preparing for deletion anyway");
      const commentWithMetadata = {
        ...comment,
        isTemporaryId: true,
        id: null,
        postId: resolvedPostId
      };
      
      // Final validation of postId
      if (!commentWithMetadata.postId) {
        console.error("Invalid comment for deletion (missing postId):", commentWithMetadata);
        alert("Cannot delete this comment: Missing post reference");
        return;
      }
      
      console.log("Setting comment to delete:", commentWithMetadata);
      setCommentToDelete(commentWithMetadata);
      setShowDeleteCommentConfirm(true);
      return;
    }
    
    // Flag for temporary IDs
    const isTemporary = comment.isTemporaryId || 
      (typeof comment.id === 'string' && comment.id.startsWith('temp_'));
    
    // Create a validated comment object with proper IDs
    const commentWithMetadata = {
      ...comment,
      isTemporaryId: isTemporary,
      postId: resolvedPostId
    };
    
    // If not a temporary ID, validate it's numeric
    if (!isTemporary && typeof comment.id === 'string') {
      const parsedId = parseInt(comment.id, 10);
      if (!isNaN(parsedId)) {
        commentWithMetadata.id = parsedId;
      } else {
        console.error("Invalid comment ID for deletion:", comment.id);
        alert("Cannot delete this comment: Invalid ID format");
        return;
      }
    }
    
    // Final validation of postId
    if (!commentWithMetadata.postId) {
      console.error("Invalid comment for deletion (missing postId):", commentWithMetadata);
      alert("Cannot delete this comment: Missing post reference");
      return;
    }
    
    console.log("Setting comment to delete:", commentWithMetadata);
    setCommentToDelete(commentWithMetadata);
    setShowDeleteCommentConfirm(true);
  };
  
  // Function to cancel deleting a comment
  const cancelDeleteComment = () => {
    console.log("Canceling comment deletion");
    setCommentToDelete(null);
    setShowDeleteCommentConfirm(false);
  };
  
  // Function to delete a comment
  const deleteComment = () => {
    try {
      console.log("deleteComment called with commentToDelete:", commentToDelete);
      
      if (!commentToDelete) {
        console.error("No comment selected for deletion");
        return;
      }
      
      const postId = commentToDelete.postId;
      
      if (!postId) {
        console.error("Missing postId for comment deletion");
        alert("Cannot delete comment: Missing post reference");
        cancelDeleteComment();
        return;
      }
      
      // For comments with no valid ID or temporary ID, just remove from UI without server call
      const hasTempId = typeof commentToDelete.id === 'string' && commentToDelete.id.startsWith('temp_');
      if (!commentToDelete.id || commentToDelete.id === null || hasTempId || commentToDelete.isTemporaryId) {
        console.log("Comment has null/temporary ID, removing locally without server call");
        
        // Update the UI by removing the comment
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId && post.comments) {
              // Use ID-based comparison to filter out the comment being deleted
              const updatedComments = post.comments.filter(c => {
                console.log(`Comparing comment for deletion: ${c.id} vs ${commentToDelete.id}`);
                return c.id !== commentToDelete.id;
              });
              console.log(`Post ${post.id} comments before: ${post.comments.length}, after: ${updatedComments.length}`);
              return { ...post, comments: updatedComments };
            }
            return post;
          })
        );
        
        // Reset delete state
        cancelDeleteComment();
        return;
      }
      
      // For comments with regular IDs, delete on the server
      console.log(`Deleting comment ${commentToDelete.id} for post ${postId}`);
      
      // Track the deletion state
      const deleteKey = `delete_${commentToDelete.id}`;
      setCommentSubmitting(prev => ({ ...prev, [deleteKey]: true }));
      
      WallService.deleteComment(postId, commentToDelete.id)
        .then(response => {
          console.log("Comment deleted successfully:", response);
          
          // Update the UI to remove the deleted comment
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.id === postId && post.comments) {
                // Use ID comparison to filter out the deleted comment
                const updatedComments = post.comments.filter(c => {
                  console.log(`Filtering deleted comment: ${c.id} vs ${commentToDelete.id}`);
                  return c.id !== commentToDelete.id;
                });
                console.log(`Post ${post.id} comments before: ${post.comments.length}, after: ${updatedComments.length}`);
                return { ...post, comments: updatedComments };
              }
              return post;
            })
          );
          
          // Reset states
          setCommentSubmitting(prev => ({ ...prev, [deleteKey]: false }));
          cancelDeleteComment();
        })
        .catch(error => {
          console.error(`Error deleting comment:`, error);
          // Log complete error details
          if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
          } else if (error.request) {
            console.error("No response received from server");
          } else {
            console.error("Error message:", error.message);
          }
          
          // If we get a 404, the comment might already be deleted
          if (error.response && error.response.status === 404) {
            console.log("Comment not found on server, removing from UI anyway");
            setPosts(prevPosts => 
              prevPosts.map(post => {
                if (post.id === postId && post.comments) {
                  const updatedComments = post.comments.filter(c => c.id !== commentToDelete.id);
                  return { ...post, comments: updatedComments };
                }
                return post;
              })
            );
            cancelDeleteComment();
          } else {
            alert("Failed to delete comment. Please try again.");
          }
          
          // Always reset the submitting state
          setCommentSubmitting(prev => ({ ...prev, [deleteKey]: false }));
          cancelDeleteComment();
        });
    } catch (error) {
      console.error("Error in deleteComment:", error);
      cancelDeleteComment();
    }
  };
  
  // Delete confirmation modal for comments
  const DeleteCommentConfirmationModal = () => (
    <Modal show={showDeleteCommentConfirm} onHide={cancelDeleteComment} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Comment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {commentToDelete ? (
          <>
            <p>Are you sure you want to delete this comment?</p>
            <div className="comment-preview">
              <div className="comment-text-preview">"{commentToDelete.text}"</div>
              {commentToDelete.id ? (
                <small className="text-muted">Comment ID: {commentToDelete.id}</small>
              ) : (
                <small className="text-muted">(New comment)</small>
              )}
            </div>
            <p className="mt-2">This action cannot be undone.</p>
          </>
        ) : (
          <p>No comment selected for deletion.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cancelDeleteComment}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={deleteComment}
          disabled={!commentToDelete}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Helper function to compare IDs that may be of different types (number, string)
  const compareIds = (id1, id2) => {
    if (id1 === id2) return true;
    if (!id1 || !id2) return false;
    return id1.toString() === id2.toString();
  };

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3).fill(0).map((_, i) => (
      <div className="skeleton-container" key={`skeleton-${i}`}>
        <div className="skeleton-post">
          <div className="d-flex align-items-center mb-4">
            <div className="skeleton-avatar"></div>
            <div className="flex-grow-1">
              <div className="skeleton-text skeleton-title"></div>
              <div className="skeleton-text skeleton-subtitle"></div>
            </div>
          </div>
          <div className="skeleton-text mb-3" style={{ width: '90%' }}></div>
          <div className="skeleton-text mb-3" style={{ width: '75%' }}></div>
          <div className="skeleton-image"></div>
          <div className="d-flex justify-content-between mt-3">
            <div className="skeleton-btn"></div>
            <div className="skeleton-btn"></div>
            <div className="skeleton-btn"></div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="wall-container">
      <Container>
        {/* Create Post Section */}
        {currentUser && (
          <Card className="create-post-card mb-4">
            <div className="create-post-header">
              <i className="fas fa-edit me-2"></i> Create a Post
            </div>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder={`What's on your mind, ${currentUser.username}?`}
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    className="post-textarea"
                  />
                </Form.Group>
                
                {error && (
                  <div className="alert alert-danger py-2 mb-3">{error}</div>
                )}
                
                {/* Media Previews */}
                {(previewImages.length > 0 || previewVideo) && (
                  <div className="media-preview">
                    {previewImages.length > 0 && (
                      <div className="media-preview-section">
                        <span className="media-preview-label">
                          <i className="fas fa-images me-2"></i> Images ({previewImages.length}/3)
                        </span>
                        <Row>
                          {previewImages.map((url, index) => (
                            <Col key={index} md={4} className="mb-2">
                              <div className="preview-container">
                                <img src={url} alt={`Preview ${index + 1}`} className="img-preview" />
                                <Button 
                                  variant="danger" 
                                  size="sm" 
                                  className="remove-btn"
                                  onClick={() => {
                                    // Remove the image from arrays
                                    const newSelectedImages = [...selectedImages];
                                    const newPreviewImages = [...previewImages];
                                    
                                    // Revoke URL to avoid memory leaks
                                    URL.revokeObjectURL(previewImages[index]);
                                    
                                    newSelectedImages.splice(index, 1);
                                    newPreviewImages.splice(index, 1);
                                    
                                    setSelectedImages(newSelectedImages);
                                    setPreviewImages(newPreviewImages);
                                  }}
                                >
                                  <i className="fas fa-times"></i>
                                </Button>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                    
                    {previewVideo && (
                      <div className="media-preview-section">
                        <span className="media-preview-label">
                          <i className="fas fa-video me-2"></i> Video
                        </span>
                        <div className="preview-container">
                          <video 
                            src={previewVideo} 
                            controls 
                            className="video-preview w-100" 
                          />
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="remove-btn"
                            onClick={() => {
                              // Revoke URL to avoid memory leaks
                              URL.revokeObjectURL(previewVideo);
                              
                              setSelectedVideo(null);
                              setPreviewVideo(null);
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center">
                  <div className="media-controls">
                    <label className={`upload-btn ${selectedImages.length >= 3 ? 'disabled' : ''}`}>
                      <i className="fas fa-images"></i>
                      Photo
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                        disabled={selectedImages.length >= 3}
                      />
                    </label>
                    
                    <label className={`upload-btn ${selectedVideo ? 'disabled' : ''}`} 
                      title={selectedVideo ? "Video already selected" : "Add a video"}
                    >
                      <i className="fas fa-video"></i>
                      Video
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        hidden
                        disabled={selectedVideo}
                      />
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="post-btn"
                    disabled={uploading || (!postText && selectedImages.length === 0 && !selectedVideo)}
                  >
                    {uploading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        {selectedVideo ? "Uploading video..." : "Posting..."}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}
        
        {/* Posts Feed */}
        <div className="posts-feed">
          {loading ? (
            // Show loading skeleton UI
            renderSkeletons()
          ) : posts.length === 0 ? (
            <div className="empty-feed-message">
              <div className="empty-feed-icon">
                <i className="fas fa-comment-slash"></i>
              </div>
              <p>No posts yet. Be the first to share something!</p>
              <Button variant="primary" className="mt-2" onClick={refreshFeed}>
                <i className="fas fa-sync-alt me-2"></i> Refresh Feed
              </Button>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="post-card">
                <Card.Body>
                  <div className="post-header mb-3">
                    <div className="avatar-container">
                      <div className="avatar">
                        {post.user.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-0">{post.user.username}</h5>
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {currentUser && post.user.id === currentUser.id && (
                      <div className="post-actions-dropdown">
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm" id={`dropdown-${post.id}`}>
                            <i className="fas fa-ellipsis-h"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => handleEditPost(post)}>
                              <i className="fas fa-edit me-2"></i> Edit
                            </Dropdown.Item>
                            <Dropdown.Item className="text-danger" onClick={() => confirmDeletePost(post)}>
                              <i className="fas fa-trash-alt me-2"></i> Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    )}
                  </div>
                  
                  {editingPost && editingPost.id === post.id ? (
                    <div className="edit-post-form mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="mb-2 post-textarea"
                      />
                      <div className="d-flex justify-content-end">
                        <Button variant="secondary" size="sm" className="me-2" onClick={cancelEditPost}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" onClick={submitEditPost} disabled={uploading}>
                          {uploading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    post.text && <div className="post-content">{post.text}</div>
                  )}
                  
                  {/* Post Media */}
                  {post.images && post.images.length > 0 && (
                    <div className="post-media">
                      <Row>
                        {post.images.map((image, index) => {
                          const resolvedUrl = resolveMediaUrl(image.url);
                          const imageKey = `post-${post.id}-img-${index}`;
                          console.log(`Rendering image ${index} with resolved URL: ${resolvedUrl}`);
                          
                          // Create a direct backend URL for the image
                          const directBackendUrl = 'http://localhost:8080' + image.url;
                          console.log(`Direct backend URL: ${directBackendUrl}`);
                          
                          return (
                            <Col 
                              key={index} 
                              xs={12} 
                              md={post.images.length === 1 ? 12 : post.images.length === 2 ? 6 : 4} 
                              className="mb-2"
                            >
                              <div className="image-container">
                                {!imageLoadStatus[imageKey] && (
                                  <div className="loading-placeholder">
                                    <span>Loading image...</span>
                                  </div>
                                )}
                                
                                {/* Use blob URL if available, otherwise fall back to direct URL */}
                                <div className="image-wrapper">
                                  <img 
                                    src={imageBlobUrls[imageKey] || directBackendUrl} 
                                    alt={`Post ${post.id} image ${index}`}
                                    className="post-image"
                                    style={{ 
                                      opacity: imageLoadStatus[imageKey] ? 1 : 0,
                                      transition: 'opacity 0.3s ease-in-out'
                                    }}
                                    onLoad={(e) => {
                                      console.log(`Image loaded successfully: ${e.target.src}`);
                                      
                                      // Make sure the image is properly visible
                                      e.target.style.opacity = '1';
                                      
                                      // Set loading status
                                      setImageLoadStatus(prev => ({
                                        ...prev,
                                        [imageKey]: true
                                      }));
                                    }}
                                    onError={(e) => {
                                      console.error(`Error loading image at URL: ${directBackendUrl} (original: ${image.url})`);
                                      
                                      // No matter what happens, set image status to loaded to hide placeholder
                                      setImageLoadStatus(prev => ({
                                        ...prev,
                                        [imageKey]: true
                                      }));
                                      
                                      // Fallback to a working local image
                                      e.target.src = '/image-not-found.svg';
                                      e.target.style.opacity = '1';
                                      e.target.onerror = null; // Prevent error recursion
                                    }}
                                  />
                                  <div className="image-overlay">
                                    <a 
                                      href={`/view-image.html?image=${encodeURIComponent(image.url)}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="image-action-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                    >
                                      <i className="fas fa-expand-alt"></i>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  )}
                  
                  {post.video && (
                    <div className="post-media">
                      <div className="video-container">
                        <div className="loading-placeholder">
                          <span>Loading video...</span>
                        </div>
                        <video 
                          src={`http://localhost:8080${post.video.url}`} 
                          controls 
                          className="post-video w-100"
                          style={{ opacity: 0 }}
                          onLoadedData={(e) => {
                            console.log(`Video loaded successfully: ${resolveMediaUrl(post.video.url)}`);
                            e.target.style.opacity = 1;
                            // Find the closest loading placeholder and hide it
                            const container = e.target.closest('.video-container');
                            if (container) {
                              const placeholder = container.querySelector('.loading-placeholder');
                              if (placeholder) placeholder.style.display = 'none';
                            }
                          }}
                          onError={(e) => {
                            console.error(`Error loading video at URL: ${resolveMediaUrl(post.video.url)} (original: ${post.video.url})`);
                            // Find the closest loading placeholder and update its text
                            const container = e.target.closest('.video-container');
                            if (container) {
                              const placeholder = container.querySelector('.loading-placeholder');
                              if (placeholder) placeholder.innerHTML = '<span>Video failed to load</span>';
                            }
                            e.target.style.display = 'none'; // Hide the video element
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Post Actions */}
                  <div className="post-actions">
                    <button className="action-btn">
                      <i className="far fa-heart"></i> Like
                    </button>
                    <button 
                      className={`action-btn ${expandedComments[post.id] ? 'active' : ''}`}
                      onClick={() => toggleComments(post.id)}
                    >
                      <i className={expandedComments[post.id] ? "fas fa-comment" : "far fa-comment"}></i> 
                      Comment {post.comments && post.comments.length > 0 && <span className="comment-count">({post.comments.length})</span>}
                    </button>
                    <button className="action-btn">
                      <i className="fas fa-share"></i> Share
                    </button>
                  </div>
                  
                  {/* Comments Section */}
                  {expandedComments[post.id] && (
                    <div className="comments-section">
                      <div className="comments-header">
                        <span>
                          {post.comments && post.comments.length > 0 
                            ? `Comments (${post.comments.length})` 
                            : 'Comments'}
                        </span>
                        <button 
                          className={`comments-toggle ${expandedComments[post.id] ? 'expanded' : ''}`}
                          onClick={() => toggleComments(post.id)}
                        >
                          {expandedComments[post.id] ? 'Hide' : 'Show'} <i className="fas fa-chevron-up"></i>
                        </button>
                      </div>
                      
                      {/* Comment Form */}
                      <form 
                        className="comment-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitComment(post.id);
                        }}
                      >
                        <input
                          type="text"
                          className="comment-input"
                          placeholder="Write a comment..."
                          value={commentText[post.id] || ''}
                          onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              submitComment(post.id);
                            }
                          }}
                        />
                        <button 
                          type="submit"
                          className="comment-submit"
                          disabled={!commentText[post.id] || commentSubmitting[post.id]}
                          aria-label="Post comment"
                        >
                          {commentSubmitting[post.id] ? (
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          ) : (
                            <i className="fas fa-paper-plane"></i>
                          )}
                        </button>
                      </form>
                      
                      {/* Comments List */}
                      {commentsLoading[post.id] ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" />
                          <span className="ms-2">Loading comments...</span>
                        </div>
                      ) : post.commentsError ? (
                        <div className="comments-error text-center py-3">
                          <i className="fas fa-exclamation-circle text-danger me-2"></i>
                          <span>{post.commentsError}</span>
                          <div className="mt-2">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => loadComments(post.id)}
                            >
                              <i className="fas fa-sync-alt me-1"></i> Try Again
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="comments-list">
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                              <div key={comment.id} className="comment-item">
                                <div className="comment-avatar">
                                  {comment.user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="comment-content">
                                  {(() => {
                                    // Direct object reference comparison for safety
                                    const isEditing = editingComment === comment;
                                    
                                    console.log(`Comment edit state:`, {
                                      editingComment: editingComment?.id,
                                      currentComment: comment.id,
                                      isEqual: isEditing
                                    });
                                    
                                    return isEditing ? (
                                      <form 
                                        className="edit-comment-form"
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          console.log("Edit comment form submitted");
                                          submitEditComment();
                                        }}
                                      >
                                        <Form.Control
                                          as="textarea"
                                          rows={2}
                                          value={editCommentText}
                                          onChange={(e) => setEditCommentText(e.target.value)}
                                          className="mb-2 post-textarea"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.ctrlKey) {
                                              e.preventDefault();
                                              submitEditComment();
                                            }
                                          }}
                                        />
                                        <div className="edit-comment-actions">
                                          <button 
                                            type="button"
                                            className="edit-comment-btn cancel"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              console.log("Cancel edit button clicked");
                                              cancelEditComment();
                                            }}
                                          >
                                            Cancel
                                          </button>
                                          <button 
                                            type="submit"
                                            className="edit-comment-btn save"
                                            disabled={!editCommentText.trim() || editCommentSubmitting}
                                          >
                                            {editCommentSubmitting ? (
                                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                                            ) : null}
                                            Save
                                          </button>
                                        </div>
                                      </form>
                                    ) : (
                                      <>
                                        <div className="comment-author">{comment.user.username}</div>
                                        <div className="comment-text">{comment.text}</div>
                                        <div className="comment-date">
                                          {new Date(comment.createdAt).toLocaleString()}
                                        </div>
                                        
                                        {/* Comment Actions */}
                                        {currentUser && currentUser.id === comment.user.id && (
                                          <div className="comment-actions">
                                            <button 
                                              className="comment-action-btn"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                
                                                // Direct state updates - no complex logic
                                                console.log("Edit button clicked for comment:", comment);
                                                
                                                // Set the editing state directly
                                                setEditingComment(comment);
                                                setEditCommentText(comment.text || "");
                                                
                                                console.log("Set editingComment to:", comment);
                                              }}
                                              aria-label="Edit comment"
                                            >
                                              <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                              className="comment-action-btn delete"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                
                                                // Get the post ID from the comment or the current post
                                                const postId = post.id;
                                                console.log("Delete button clicked for comment:", comment, "in post:", postId);
                                                
                                                // Use the improved confirmDeleteComment function with post ID
                                                confirmDeleteComment(comment, postId);
                                              }}
                                              aria-label="Delete comment"
                                            >
                                              <i className="fas fa-trash-alt"></i>
                                            </button>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="no-comments">
                              <i className="far fa-comment-dots me-2"></i>
                              No comments yet. Be the first to comment!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </Container>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
      
      {/* Delete Comment Confirmation Modal */}
      <DeleteCommentConfirmationModal />
    </div>
  );
};

export default Wall; 