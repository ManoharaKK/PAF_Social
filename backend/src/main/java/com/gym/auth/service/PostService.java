package com.gym.auth.service;

import com.gym.auth.model.Comment;
import com.gym.auth.model.Post;
import com.gym.auth.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {
    Post createPost(String text, User user, List<MultipartFile> images, MultipartFile video);
    Post getPostById(Long id);
    List<Post> getAllPosts();
    List<Post> getPostsByUser(User user);
    Post updatePost(Long id, String text, User user);
    void deletePost(Long id, User user);
    void likePost(Long postId, User user);
    void unlikePost(Long postId, User user);
    boolean isPostLikedByUser(Long postId, User user);
    long getPostLikesCount(Long postId);
    
    // Comment methods
    Comment addComment(Long postId, User user, String text);
    Comment updateComment(Long postId, Long commentId, User user, String text);
    void deleteComment(Long postId, Long commentId, User user);
} 