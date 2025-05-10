package com.gym.auth.controller;

import com.gym.auth.model.Comment;
import com.gym.auth.model.Post;
import com.gym.auth.model.User;
import com.gym.auth.model.dto.PostRequest;
import com.gym.auth.model.dto.PostResponse;
import com.gym.auth.model.dto.UserSummary;
import com.gym.auth.repository.UserRepository;
import com.gym.auth.security.UserDetailsImpl;
import com.gym.auth.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        
        List<Post> posts = postService.getAllPosts();
        
        List<PostResponse> postResponses = posts.stream()
            .map(post -> PostResponse.fromPost(post, postService.isPostLikedByUser(post.getId(), currentUser)))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(postResponses);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PostResponse> getPostById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Post post = postService.getPostById(id);
        boolean likedByUser = postService.isPostLikedByUser(id, currentUser);
        
        return ResponseEntity.ok(PostResponse.fromPost(post, likedByUser));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PostResponse>> getPostsByUser(@PathVariable Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();
        
        User user = userRepository.findById(userId).orElseThrow();
        List<Post> posts = postService.getPostsByUser(user);
        
        List<PostResponse> postResponses = posts.stream()
            .map(post -> PostResponse.fromPost(post, postService.isPostLikedByUser(post.getId(), currentUser)))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(postResponses);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PostResponse> createPost(
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "video", required = false) MultipartFile video) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Post post = postService.createPost(text, user, images, video);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(new PostResponse(post));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestBody PostRequest postRequest) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Post post = postService.updatePost(id, postRequest.getText(), user);
        
        return ResponseEntity.ok(new PostResponse(post));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        postService.deletePost(id, user);
        
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/like")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> likePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        postService.likePost(id, user);
        
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/unlike")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> unlikePost(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        postService.unlikePost(id, user);
        
        return ResponseEntity.ok().build();
    }
    
    // Comment endpoints
    @GetMapping("/{postId}/comments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getComments(@PathVariable Long postId) {
        System.out.println("GET request for comments of post: " + postId);
        Post post = postService.getPostById(postId);
        return ResponseEntity.ok(post.getComments());
    }
    
    @PostMapping("/{postId}/comments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addComment(
            @PathVariable Long postId,
            @RequestBody CommentRequest commentRequest) {
        
        System.out.println("POST request to add comment to post: " + postId);
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Comment comment = postService.addComment(postId, user, commentRequest.getText());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(new CommentResponse(comment));
    }
    
    @PutMapping("/{postId}/comments/{commentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody CommentRequest commentRequest) {
        
        System.out.println("PUT request to update comment: " + commentId + " for post: " + postId);
        System.out.println("Request body: " + commentRequest.getText());
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        try {
            Comment comment = postService.updateComment(postId, commentId, user, commentRequest.getText());
            return ResponseEntity.ok(new CommentResponse(comment));
        } catch (Exception e) {
            System.err.println("Error updating comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating comment: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{postId}/comments/{commentId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        
        System.out.println("DELETE request for comment: " + commentId + " of post: " + postId);
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        try {
            postService.deleteComment(postId, commentId, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error deleting comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting comment: " + e.getMessage());
        }
    }
    
    // Request and response classes for comments
    static class CommentRequest {
        private String text;
        
        public String getText() {
            return text;
        }
        
        public void setText(String text) {
            this.text = text;
        }
    }
    
    static class CommentResponse {
        private Long id;
        private String text;
        private UserSummary user;
        private Date createdAt;
        private Date updatedAt;
        
        public CommentResponse(Comment comment) {
            this.id = comment.getId();
            this.text = comment.getText();
            this.user = new UserSummary(comment.getUser());
            this.createdAt = comment.getCreatedAt();
            this.updatedAt = comment.getUpdatedAt();
        }
        
        // Getters
        public Long getId() {
            return id;
        }
        
        public String getText() {
            return text;
        }
        
        public UserSummary getUser() {
            return user;
        }
        
        public Date getCreatedAt() {
            return createdAt;
        }
        
        public Date getUpdatedAt() {
            return updatedAt;
        }
    }
} 