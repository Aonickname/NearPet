package com.nearpet.backend.photo.controller;

import com.nearpet.backend.photo.dto.CreatePhotoRequest;
import com.nearpet.backend.photo.dto.PhotoResponse;
import com.nearpet.backend.photo.dto.UpdateFeaturedPhotosRequest;
import com.nearpet.backend.photo.service.PhotoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @GetMapping
    public List<PhotoResponse> getPhotos() {
        return photoService.getPhotos();
    }

    @PostMapping
    public PhotoResponse createPhoto(
            @Valid @RequestBody CreatePhotoRequest request,
            @RequestHeader("X-User-Role") String requesterRole
    ) {
        return photoService.createPhoto(request, requesterRole);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PhotoResponse uploadPhoto(
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader("X-User-Role") String requesterRole
    ) {
        List<MultipartFile> uploadTargets = files;
        if ((uploadTargets == null || uploadTargets.isEmpty()) && file != null) {
            uploadTargets = List.of(file);
        }
        return photoService.uploadPhotos(uploadTargets, description, requesterRole);
    }

    @PutMapping("/featured")
    public List<PhotoResponse> updateFeaturedPhotos(
            @Valid @RequestBody UpdateFeaturedPhotosRequest request,
            @RequestHeader("X-User-Role") String requesterRole
    ) {
        return photoService.updateFeaturedPhotos(request.photoIds(), requesterRole);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePhoto(
            @PathVariable Long id,
            @RequestHeader("X-User-Role") String requesterRole
    ) {
        photoService.deletePhoto(id, requesterRole);
    }
}
