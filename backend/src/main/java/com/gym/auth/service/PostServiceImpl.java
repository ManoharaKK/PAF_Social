package com.gym.auth.service;

import com.gym.auth.model.*;
import com.gym.auth.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Value("${app.api.url:http://localhost:8080}")
    private String apiUrl;

    @Override
    @Transactional
    public Post createPost(String text, User user, List<MultipartFile> images, MultipartFile video) {
        System.out.println("Creating post for user: " + user.getUsername());
        Post post = new Post(text, user);
        
        // Save post first to get the ID
        post = postRepository.save(post);
        System.out.println("Post saved with ID: " + post.getId());
        
        // Process images (max 3)
        if (images != null && !images.isEmpty()) {
            int imageCount = Math.min(images.size(), 3); // Limit to max 3 images
            System.out.println("Processing " + imageCount + " images");
            
            for (int i = 0; i < imageCount; i++) {
                MultipartFile imageFile = images.get(i);
                if (!imageFile.isEmpty()) {
                    System.out.println("Storing image file: " + imageFile.getOriginalFilename());
                    String fileName = fileStorageService.storeFile(imageFile, "images");
                    System.out.println("Generated filename: " + fileName);
                    
                    String fileUrl = "/api/files/images/" + fileName;
                    System.out.println("Generated URL: " + fileUrl);
                    
                    PostImage postImage = new PostImage(
                        post, 
                        fileName, 
                        imageFile.getContentType(), 
                        fileUrl
                    );
                    
                    post.addImage(postImage);
                    System.out.println("Image added to post: " + fileUrl);
                }
            }
        }
        
        // Process video (only one allowed)
        if (video != null && !video.isEmpty()) {
            System.out.println("Storing video file: " + video.getOriginalFilename());
            String fileName = fileStorageService.storeFile(video, "videos");
            System.out.println("Generated filename: " + fileName);
            
            String fileUrl = "/api/files/videos/" + fileName;
            System.out.println("Generated URL: " + fileUrl);
            
            PostVideo postVideo = new PostVideo(
                post, 
                fileName, 
                video.getContentType(), 
                fileUrl,
                30 // Default to max duration of 30 seconds
            );
            
            post.setVideo(postVideo);
            System.out.println("Video added to post: " + fileUrl);
        }
        
        return postRepository.save(post);
    }

    @Override
    public Post getPostById(Long id) {
        return postRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Post not found with id: " + id));
    }

    @Override
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Post> getPostsByUser(User user) {
        return postRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional
    public Post updatePost(Long id, String text, User user) {
        Post post = getPostById(id);
        
        // Check if the user is the owner of the post
        if (!post.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to update this post");
        }
        
        post.setText(text);
        return postRepository.save(post);
    }

    @Override
    @Transactional
    public void deletePost(Long id, User user) {
        Post post = getPostById(id);
        
        // Check if the user is the owner of the post
        if (!post.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to delete this post");
        }
        
        // Delete associated files
        post.getImages().forEach(image -> {
            fileStorageService.deleteFile("images/" + image.getFileName());
        });
        
        if (post.getVideo() != null) {
            PostVideo video = post.getVideo();
            // First detach the video from the post to ensure clean removal
            post.setVideo(null);
            fileStorageService.deleteFile("videos/" + video.getFileName());
        }
        
        // Clear all collections to ensure proper cleanup
        post.getImages().clear();
        post.getLikes().clear();
        post.getComments().clear();
        
        // Save the post with cleared collections before deletion
        post = postRepository.saveAndFlush(post);
        
        // Now delete the post
        postRepository.delete(post);
    }

    @Override
    @Transactional
    public void likePost(Long postId, User user) {
        Post post = getPostById(postId);
        
        // Check if the user already liked the post
        boolean alreadyLiked = post.getLikes().stream()
            .anyMatch(like -> like.getUser().getId().equals(user.getId()));
        
        if (!alreadyLiked) {
            PostLike like = new PostLike(post, user);
            post.getLikes().add(like);
            postRepository.save(post);
        }
    }

    @Override
    @Transactional
    public void unlikePost(Long postId, User user) {
        Post post = getPostById(postId);
        
        List<PostLike> updatedLikes = post.getLikes().stream()
            .filter(like -> !like.getUser().getId().equals(user.getId()))
            .collect(Collectors.toList());
        
        post.setLikes(updatedLikes);
        postRepository.save(post);
    }

    @Override
    public boolean isPostLikedByUser(Long postId, User user) {
        Post post = getPostById(postId);
        
        return post.getLikes().stream()
            .anyMatch(like -> like.getUser().getId().equals(user.getId()));
    }

    @Override
    public long getPostLikesCount(Long postId) {
        Post post = getPostById(postId);
        return post.getLikes().size();
    }

    @Override
    @Transactional
    public Comment addComment(Long postId, User user, String text) {
        Post post = getPostById(postId);
        
        Comment comment = new Comment(post, user, text);
        post.getComments().add(comment);
        
        postRepository.save(post);
        return comment;
    }
    
    @Override
    @Transactional
    public Comment updateComment(Long postId, Long commentId, User user, String text) {
        Post post = getPostById(postId);
        
        Comment comment = post.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));
        
        // Check if the user is the owner of the comment
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to update this comment");
        }
        
        // Explicitly update the comment text and save
        try {
            comment.setText(text);
            // Force an update timestamp
            comment.setUpdatedAt(new Date());
            // Save the post which should cascade to the comment
            post = postRepository.saveAndFlush(post);
            
            // Get the updated comment from the refreshed post
            Comment updatedComment = post.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Comment not found after update"));
                
            return updatedComment;
        } catch (Exception e) {
            System.err.println("Error updating comment: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    @Transactional
    public void deleteComment(Long postId, Long commentId, User user) {
        Post post = getPostById(postId);
        
        Comment comment = post.getComments().stream()
            .filter(c -> c.getId().equals(commentId))
            .findFirst()
            .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));
        
        // Check if the user is the owner of the comment or the post
        if (!comment.getUser().getId().equals(user.getId()) && !post.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to delete this comment");
        }
        
        post.getComments().remove(comment);
        postRepository.save(post);
    }
} 