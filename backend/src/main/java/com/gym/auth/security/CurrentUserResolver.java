package com.gym.auth.security;

import com.gym.auth.model.User;
import com.gym.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserResolver implements HandlerMethodArgumentResolver {
    
    private static final Logger logger = LoggerFactory.getLogger(CurrentUserResolver.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentUser.class) != null 
                && parameter.getParameterType().equals(User.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                 NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                logger.error("Authentication is null");
                return null;
            }
            
            if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                logger.error("Principal is not UserDetailsImpl but {}", 
                    authentication.getPrincipal() != null ? 
                    authentication.getPrincipal().getClass().getName() : "null");
                return null;
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            logger.debug("Resolving user with ID: {}", userDetails.getId());
            
            return userRepository.findById(userDetails.getId())
                    .orElse(null);
        } catch (Exception e) {
            logger.error("Error resolving user: {}", e.getMessage(), e);
            return null;
        }
    }
} 