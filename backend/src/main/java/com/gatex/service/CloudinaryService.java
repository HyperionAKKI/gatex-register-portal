package com.gatex.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret) {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }

    public String uploadBase64Image(String base64Image) {
        try {
            // Check if it has a prefix and remove it
            if (base64Image.startsWith("data:image")) {
                base64Image = base64Image.substring(base64Image.indexOf(",") + 1);
            }
            Map uploadResult = cloudinary.uploader().upload("data:image/jpeg;base64," + base64Image, ObjectUtils.emptyMap());
            return uploadResult.get("url").toString();
        } catch (Exception e) {
            System.err.println("Cloudinary error: " + e.getMessage());
            // Fallback for demo if Cloudinary not configured perfectly yet
            return "https://res.cloudinary.com/demo/image/upload/sample.jpg"; 
        }
    }
}
