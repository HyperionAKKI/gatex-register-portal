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

        // Process Good Uniform Photo
        String goodUrl = cloudinaryService.uploadBase64Image(request.getGoodUniform());
        Image goodUniform = new Image();
        goodUniform.setStudent(student);
        goodUniform.setImageType(ImageType.UNIFORM_GOOD);
        goodUniform.setImageUrl(goodUrl);
        images.add(goodUniform);

        // Process Bad Uniform Photos (Missing Tie, Belt, ID Card)
        String missingTieUrl = cloudinaryService.uploadBase64Image(request.getBadUniformMissingTie());
        Image missingTieImg = new Image();
        missingTieImg.setStudent(student);
        missingTieImg.setImageType(ImageType.UNIFORM_BAD_MISSING_TIE);
        missingTieImg.setImageUrl(missingTieUrl);
        images.add(missingTieImg);

        String missingBeltUrl = cloudinaryService.uploadBase64Image(request.getBadUniformMissingBelt());
        Image missingBeltImg = new Image();
        missingBeltImg.setStudent(student);
        missingBeltImg.setImageType(ImageType.UNIFORM_BAD_MISSING_BELT);
        missingBeltImg.setImageUrl(missingBeltUrl);
        images.add(missingBeltImg);

        String missingIdCardUrl = cloudinaryService.uploadBase64Image(request.getBadUniformMissingIdCard());
        Image missingIdCardImg = new Image();
        missingIdCardImg.setStudent(student);
        missingIdCardImg.setImageType(ImageType.UNIFORM_BAD_MISSING_ID_CARD);
        missingIdCardImg.setImageUrl(missingIdCardUrl);
        images.add(missingIdCardImg);

        student.setImages(images);
        return studentRepository.save(student);
    }
    
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
}
