package com.healthcare.patient.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expose the literal 'uploads' folder for clinical assets and profile images
        String cwd = System.getProperty("user.dir");
        String uploadDir = cwd.endsWith("patient-service") 
                ? "/src/main/resources/static/uploads" 
                : "/patient-service/src/main/resources/static/uploads";
        
        String absolutePath = cwd + uploadDir;
        
        System.out.println("[WebConfig] Serving static resources from: " + absolutePath);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }
}
