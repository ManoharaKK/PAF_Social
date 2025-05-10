import axiosInstance from "./axios-config";
import authHeader from "./auth-header";

const API_URL = "/api/posts/";

class WallService {
  getAllPosts() {
    return axiosInstance.get(API_URL, { headers: authHeader() });
  }

  getPostById(id) {
    return axiosInstance.get(API_URL + id, { headers: authHeader() });
  }

  createPost(formData) {
    console.log("Preparing to send post request with form data");
    
    // Check if formData contains the video
    for (let pair of formData.entries()) {
      if (pair[0] === "video") {
        console.log("Video found in form data:", pair[1].name, "type:", pair[1].type, "size:", pair[1].size);
      }
    }
    
    return axiosInstance.post(API_URL, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data"
      },
      timeout: 60000 // 60 seconds timeout for larger uploads
    }).catch(error => {
      console.error("Error in createPost:", error.response ? error.response.data : error.message);
      throw error;
    });
  }

  updatePost(id, data) {
    return axiosInstance.put(API_URL + id, data, { headers: authHeader() });
  }

  deletePost(id) {
    return axiosInstance.delete(API_URL + id, { headers: authHeader() });
  }

  likePost(id) {
    return axiosInstance.post(API_URL + id + "/like", {}, { headers: authHeader() });
  }

  unlikePost(id) {
    return axiosInstance.post(API_URL + id + "/unlike", {}, { headers: authHeader() });
  }

  addComment(postId, text) {
    console.log(`WallService.addComment called with postId=${postId}, text="${text}"`);
    console.log("Auth headers:", authHeader());
    
    return axiosInstance.post(
      API_URL + postId + "/comments",
      { text },
      { headers: authHeader() }
    )
    .then(response => {
      console.log("Comment API response:", response.data);
      return response;
    })
    .catch(error => {
      console.error("Error in addComment API call:", error);
      console.error("Error details:", error.response ? error.response.data : "No response data");
      throw error;
    });
  }

  getComments(postId) {
    console.log(`WallService.getComments called for postId=${postId}`);
    
    // Get auth headers
    const headers = authHeader();
    console.log("Auth headers:", headers);
    
    // Ensure postId is properly sanitized
    const sanitizedPostId = encodeURIComponent(postId);
    
    return axiosInstance.get(
      API_URL + sanitizedPostId + "/comments", 
      { 
        headers: headers,
        timeout: 8000 // Set a 8 second timeout
      }
    ).catch(error => {
      console.error(`Error fetching comments for post ${postId}:`, error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    });
  }

  updateComment(postId, commentId, text) {
    console.log(`WallService.updateComment called with postId=${postId}, commentId=${commentId}, text="${text}"`);
    console.log("Comment ID type:", typeof commentId);
    console.log("Auth headers:", authHeader());
    
    // Ensure IDs are valid numbers and properly convert them
    let numericPostId, numericCommentId;
    
    try {
      // Handle string IDs that might contain non-numeric parts (like temporary IDs)
      if (typeof postId === 'string' && postId.includes('temp_')) {
        console.error("Cannot update a comment with a temporary post ID. Need a valid database ID.");
        return Promise.reject(new Error("Cannot update comment with temporary post ID"));
      }

      if (typeof commentId === 'string' && commentId.includes('temp_')) {
        console.error("Cannot update a comment with a temporary comment ID. Need a valid database ID.");
        return Promise.reject(new Error("Cannot update comment with temporary ID"));
      }
      
      numericPostId = Number(postId);
      numericCommentId = Number(commentId);
      
      if (isNaN(numericPostId) || isNaN(numericCommentId)) {
        console.error("Invalid postId or commentId:", { postId, commentId, numericPostId, numericCommentId });
        return Promise.reject(new Error("Invalid postId or commentId format"));
      }
    } catch (conversionError) {
      console.error("Error converting IDs to numbers:", conversionError);
      return Promise.reject(new Error("Error processing comment IDs"));
    }
    
    console.log(`Using numeric IDs: postId=${numericPostId}, commentId=${numericCommentId}`);
    
    // Ensure we're sending a clean text value
    const cleanText = text ? text.trim() : "";
    if (!cleanText) {
      console.error("Cannot update with empty comment text");
      return Promise.reject(new Error("Comment text cannot be empty"));
    }
    
    // Ensure sanitized IDs in the URL path
    const sanitizedPostId = encodeURIComponent(numericPostId);
    const sanitizedCommentId = encodeURIComponent(numericCommentId);
    
    return axiosInstance.put(
      API_URL + sanitizedPostId + "/comments/" + sanitizedCommentId,
      { text: cleanText },
      { 
        headers: authHeader(),
        timeout: 10000 // 10-second timeout
      }
    )
    .then(response => {
      console.log("Comment update API response:", response.data);
      return response;
    })
    .catch(error => {
      console.error("Error in updateComment API call:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        console.error("Full error object:", JSON.stringify(error.response));
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    });
  }
  
  deleteComment(postId, commentId) {
    console.log(`WallService.deleteComment called with postId=${postId}, commentId=${commentId}`);
    
    // Ensure IDs are numbers
    const numericPostId = parseInt(postId, 10);
    const numericCommentId = parseInt(commentId, 10);
    
    if (isNaN(numericPostId) || isNaN(numericCommentId)) {
      console.error("Invalid postId or commentId:", { postId, commentId, numericPostId, numericCommentId });
      return Promise.reject(new Error("Invalid postId or commentId"));
    }
    
    console.log(`Using numeric IDs: postId=${numericPostId}, commentId=${numericCommentId}`);
    
    // Get auth headers
    const headers = authHeader();
    console.log("Delete request headers:", headers);
    
    // Ensure IDs are properly encoded
    const sanitizedPostId = encodeURIComponent(numericPostId);
    const sanitizedCommentId = encodeURIComponent(numericCommentId);
    
    return axiosInstance.delete(
      API_URL + sanitizedPostId + "/comments/" + sanitizedCommentId,
      { headers: headers }
    )
    .then(response => {
      console.log("Comment delete API response:", response);
      return response;
    })
    .catch(error => {
      console.error("Error in deleteComment API call:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    });
  }
}

export default new WallService(); 