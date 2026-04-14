package com.gatex.service;

import com.gatex.dto.StudentRegistrationRequest;
import com.gatex.entity.Image;
import com.gatex.entity.ImageType;
import com.gatex.entity.Student;
import com.gatex.repository.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public Student registerStudent(StudentRegistrationRequest request) {
        Student student = new Student();
        student.setName(request.getName());
        student.setRollNumber(request.getRollNumber());
        student.setSchoolName(request.getSchoolName());

        List<Image> images = new ArrayList<>();

        // Process Face Photos
        ImageType[] faceTypes = {
            ImageType.FACE_FRONT, ImageType.FACE_LEFT, ImageType.FACE_RIGHT,
            ImageType.FACE_SLIGHT_LEFT, ImageType.FACE_SLIGHT_RIGHT, ImageType.FACE_UPDOWN
        };
        
        for (int i = 0; i < request.getPhotos().size(); i++) {
            String url = cloudinaryService.uploadBase64Image(request.getPhotos().get(i));
            Image img = new Image();
            img.setStudent(student);
            img.setImageType(faceTypes[i]);
            img.setImageUrl(url);
            images.add(img);
        }

        // Process Uniform Photos
        String goodUrl = cloudinaryService.uploadBase64Image(request.getGoodUniform());
        Image goodUniform = new Image();
        goodUniform.setStudent(student);
        goodUniform.setImageType(ImageType.UNIFORM_GOOD);
        goodUniform.setImageUrl(goodUrl);
        images.add(goodUniform);

        String badUrl = cloudinaryService.uploadBase64Image(request.getBadUniform());
        Image badUniform = new Image();
        badUniform.setStudent(student);
        badUniform.setImageType(ImageType.UNIFORM_BAD);
        badUniform.setImageUrl(badUrl);
        images.add(badUniform);

        student.setImages(images);
        return studentRepository.save(student);
    }
    
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
}
