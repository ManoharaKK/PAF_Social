package com.gym.auth.model.dto;

import com.gym.auth.model.Post;
import com.gym.auth.model.PostImage;
import com.gym.auth.model.PostVideo;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class PostResponse {
    private Long id;
    private String text;
    private UserSummary user;
    private List<PostImageResponse> images;
    private PostVideoResponse video;
    private Date createdAt;
    private Date updatedAt;
    private long likesCount;
    private long commentsCount;
    private boolean likedByCurrentUser;
    
    public PostResponse() {
    }
    
    public PostResponse(Post post) {
        this.id = post.getId();
        this.text = post.getText();
        this.user = new UserSummary(post.getUser());
        
        this.images = post.getImages().stream()
            .map(PostImageResponse::new)
            .collect(Collectors.toList());
        
        if (post.getVideo() != null) {
            this.video = new PostVideoResponse(post.getVideo());
        }
        
        this.createdAt = post.getCreatedAt();
        this.updatedAt = post.getUpdatedAt();
        this.likesCount = post.getLikes().size();
        this.commentsCount = post.getComments().size();
    }
    
    public static PostResponse fromPost(Post post, boolean likedByCurrentUser) {
        PostResponse response = new PostResponse(post);
        response.setLikedByCurrentUser(likedByCurrentUser);
        return response;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public UserSummary getUser() {
        return user;
    }
    
    public void setUser(UserSummary user) {
        this.user = user;
    }
    
    public List<PostImageResponse> getImages() {
        return images;
    }
    
    public void setImages(List<PostImageResponse> images) {
        this.images = images;
    }
    
    public PostVideoResponse getVideo() {
        return video;
    }
    
    public void setVideo(PostVideoResponse video) {
        this.video = video;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    public Date getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public long getLikesCount() {
        return likesCount;
    }
    
    public void setLikesCount(long likesCount) {
        this.likesCount = likesCount;
    }
    
    public long getCommentsCount() {
        return commentsCount;
    }
    
    public void setCommentsCount(long commentsCount) {
        this.commentsCount = commentsCount;
    }
    
    public boolean isLikedByCurrentUser() {
        return likedByCurrentUser;
    }
    
    public void setLikedByCurrentUser(boolean likedByCurrentUser) {
        this.likedByCurrentUser = likedByCurrentUser;
    }
    
    // Inner classes for nested responses
    
    public static class PostImageResponse {
        private Long id;
        private String url;
        
        public PostImageResponse() {
        }
        
        public PostImageResponse(PostImage image) {
            this.id = image.getId();
            this.url = image.getUrl();
        }
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
    }
    
    public static class PostVideoResponse {
        private Long id;
        private String url;
        private Integer duration;
        
        public PostVideoResponse() {
        }
        
        public PostVideoResponse(PostVideo video) {
            this.id = video.getId();
            this.url = video.getUrl();
            this.duration = video.getDuration();
        }
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
        
        public Integer getDuration() {
            return duration;
        }
        
        public void setDuration(Integer duration) {
            this.duration = duration;
        }
    }
} 