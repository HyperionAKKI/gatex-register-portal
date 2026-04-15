package com.gatex.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class StudentRegistrationRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "School name is required")
    private String schoolName;

    @NotNull(message = "Photos are required")
    @Size(min = 6, max = 6, message = "Exactly 6 face photos are required")
    private List<String> photos; // Base64 strings

    @NotBlank(message = "Proper uniform photo is required")
    private String goodUniform; // Base64 string

    @NotBlank(message = "Missing tie uniform photo is required")
    private String badUniformMissingTie; // Base64 string

    @NotBlank(message = "Missing belt uniform photo is required")
    private String badUniformMissingBelt; // Base64 string

    @NotBlank(message = "Missing ID card uniform photo is required")
    private String badUniformMissingIdCard; // Base64 string
}
