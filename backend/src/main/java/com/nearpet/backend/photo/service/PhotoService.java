package com.nearpet.backend.photo.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearpet.backend.global.ForbiddenOperationException;
import com.nearpet.backend.global.ResourceNotFoundException;
import com.nearpet.backend.photo.dto.CreatePhotoRequest;
import com.nearpet.backend.photo.dto.PhotoResponse;
import com.nearpet.backend.photo.model.Photo;
import com.nearpet.backend.photo.repository.PhotoRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class PhotoService {

    private final ObjectMapper objectMapper;
    private final PhotoRepository photoRepository;
    private final Path legacyStoragePath;
    private final Path uploadPath;
    private final String publicBaseUrl;

    public PhotoService(
            ObjectMapper objectMapper,
            PhotoRepository photoRepository,
            @Value("${app.storage.photos-file:data/photos.json}") String legacyStorageFile,
            @Value("${app.storage.upload-dir:data/uploads}") String uploadDirectory,
            @Value("${app.public-base-url:http://localhost:8080}") String publicBaseUrl
    ) {
        this.objectMapper = objectMapper;
        this.photoRepository = photoRepository;
        this.legacyStoragePath = Path.of(legacyStorageFile);
        this.uploadPath = Path.of(uploadDirectory);
        this.publicBaseUrl = publicBaseUrl;
    }

    @PostConstruct
    void initialize() {
        try {
            Files.createDirectories(uploadPath);
            if (legacyStoragePath.getParent() != null) {
                Files.createDirectories(legacyStoragePath.getParent());
            }
        } catch (IOException exception) {
            throw new IllegalStateException("사진 저장소를 초기화하지 못했습니다.", exception);
        }

        if (photoRepository.count() == 0) {
            importLegacyPhotosOrSeedDefaults();
        }
    }

    @Transactional(readOnly = true)
    public List<PhotoResponse> getPhotos() {
        return photoRepository.findAll().stream()
                .sorted(Comparator
                        .comparing(Photo::isFeatured, Comparator.reverseOrder())
                        .thenComparing(photo -> photo.getFeaturedOrder() == null ? Integer.MAX_VALUE : photo.getFeaturedOrder())
                        .thenComparing(Photo::getId))
                .map(this::toResponse)
                .toList();
    }

    public PhotoResponse createPhoto(CreatePhotoRequest request, String requesterRole) {
        ensureAdmin(requesterRole);

        List<String> imageUrls = List.of(request.imageUrl().trim());
        Photo photo = photoRepository.save(new Photo(
                imageUrls.get(0),
                request.description() == null ? "" : request.description().trim(),
                null,
                writeJson(imageUrls),
                null,
                false,
                null
        ));

        return toResponse(photo);
    }

    public PhotoResponse uploadPhotos(List<MultipartFile> files, String description, String requesterRole) {
        ensureAdmin(requesterRole);
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("업로드할 사진 파일을 선택해주세요.");
        }

        List<String> imageUrls = new ArrayList<>();
        List<String> storedFileNames = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String extension = extractExtension(file.getOriginalFilename());
            if (!List.of("jpg", "jpeg", "png", "webp").contains(extension.toLowerCase())) {
                throw new IllegalArgumentException("jpg, jpeg, png, webp 파일만 업로드할 수 있습니다.");
            }

            String storedFileName = UUID.randomUUID() + "." + extension;
            Path targetPath = uploadPath.resolve(storedFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException exception) {
                throw new IllegalStateException("사진 파일을 저장하지 못했습니다.", exception);
            }

            storedFileNames.add(storedFileName);
            imageUrls.add(publicBaseUrl + "/uploads/" + storedFileName);
        }

        if (imageUrls.isEmpty()) {
            throw new IllegalArgumentException("업로드할 사진 파일을 선택해주세요.");
        }

        Photo photo = photoRepository.save(new Photo(
                imageUrls.get(0),
                description == null ? "" : description.trim(),
                storedFileNames.get(0),
                writeJson(imageUrls),
                writeJson(storedFileNames),
                false,
                null
        ));

        return toResponse(photo);
    }

    public List<PhotoResponse> updateFeaturedPhotos(List<Long> featuredPhotoIds, String requesterRole) {
        ensureAdmin(requesterRole);

        if (featuredPhotoIds.size() > 6) {
            throw new IllegalArgumentException("대표 이미지는 최대 6장까지 선택할 수 있습니다.");
        }

        Set<Long> featuredSet = new HashSet<>(featuredPhotoIds);
        if (featuredSet.size() != featuredPhotoIds.size()) {
            throw new IllegalArgumentException("대표 이미지 목록에 중복이 있습니다.");
        }

        List<Photo> allPhotos = photoRepository.findAll();
        for (Long photoId : featuredPhotoIds) {
            findPhoto(allPhotos, photoId);
        }

        for (Photo photo : allPhotos) {
            int featuredIndex = featuredPhotoIds.indexOf(photo.getId());
            photo.updateFeatured(featuredSet.contains(photo.getId()), featuredIndex >= 0 ? featuredIndex : null);
        }

        photoRepository.saveAll(allPhotos);
        return getPhotos();
    }

    public PhotoResponse updatePhoto(
            Long id,
            String description,
            String coverImageKey,
            String imageOrderJson,
            List<String> newImageKeys,
            List<MultipartFile> files,
            String requesterRole
    ) {
        ensureAdmin(requesterRole);

        Photo target = photoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("수정할 사진 게시글을 찾을 수 없습니다."));

        List<String> currentImageUrls = resolveImageUrls(target);
        List<String> currentStoredFileNames = resolveStoredFileNames(target);
        if (currentImageUrls.isEmpty()) {
            throw new IllegalStateException("사진 게시글에 표시 가능한 이미지가 없습니다.");
        }

        List<String> imageOrder = readJsonList(imageOrderJson);
        if (imageOrder.isEmpty()) {
            throw new IllegalArgumentException("최소 한 장 이상의 사진이 필요합니다.");
        }

        List<String> safeNewImageKeys = newImageKeys == null ? List.of() : newImageKeys;
        List<MultipartFile> safeFiles = files == null ? List.of() : files;
        if (safeNewImageKeys.size() != safeFiles.size()) {
            throw new IllegalArgumentException("새 이미지 정보가 올바르지 않습니다.");
        }

        Map<String, String> existingUrlToStored = new HashMap<>();
        for (int index = 0; index < currentImageUrls.size(); index++) {
            String imageUrl = currentImageUrls.get(index);
            String storedFileName = index < currentStoredFileNames.size() ? currentStoredFileNames.get(index) : null;
            existingUrlToStored.put(imageUrl, storedFileName);
        }

        Map<String, UploadedImage> uploadedImages = storeUploadedImages(safeNewImageKeys, safeFiles);
        List<String> nextImageUrls = new ArrayList<>();
        List<String> nextStoredFileNames = new ArrayList<>();

        for (String imageKey : imageOrder) {
            if (uploadedImages.containsKey(imageKey)) {
                UploadedImage uploadedImage = uploadedImages.get(imageKey);
                nextImageUrls.add(uploadedImage.imageUrl());
                nextStoredFileNames.add(uploadedImage.storedFileName());
                continue;
            }

            if (!existingUrlToStored.containsKey(imageKey)) {
                throw new IllegalArgumentException("선택한 이미지 순서 정보가 올바르지 않습니다.");
            }

            nextImageUrls.add(imageKey);
            nextStoredFileNames.add(existingUrlToStored.get(imageKey));
        }

        if (!imageOrder.contains(coverImageKey)) {
            throw new IllegalArgumentException("선택한 대표 이미지를 게시글에서 찾을 수 없습니다.");
        }

        int coverIndex = imageOrder.indexOf(coverImageKey);
        String coverImageUrl = nextImageUrls.get(coverIndex);
        String nextStoredFileName = nextStoredFileNames.get(coverIndex);

        currentImageUrls.stream()
                .filter(imageUrl -> !nextImageUrls.contains(imageUrl))
                .map(existingUrlToStored::get)
                .forEach(this::deleteStoredFile);

        target.updatePostContent(
                description == null ? "" : description.trim(),
                coverImageUrl,
                nextStoredFileName
        );
        updatePhotoCollections(target, nextImageUrls, nextStoredFileNames);

        return toResponse(photoRepository.save(target));
    }

    public void deletePhoto(Long id, String requesterRole) {
        ensureAdmin(requesterRole);

        Photo target = findPhoto(photoRepository.findAll(), id);
        photoRepository.delete(target);
        readJsonList(target.getStoredFileNamesJson()).forEach(this::deleteStoredFile);
        if (readJsonList(target.getStoredFileNamesJson()).isEmpty()) {
            deleteStoredFile(target.getStoredFileName());
        }
        reindexFeaturedPhotos();
    }

    private Photo findPhoto(List<Photo> photos, Long id) {
        return photos.stream()
                .filter(photo -> photo.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("삭제할 사진을 찾을 수 없습니다."));
    }

    private void ensureAdmin(String requesterRole) {
        if (!"ADMIN".equalsIgnoreCase(requesterRole)) {
            throw new ForbiddenOperationException("관리자만 사진을 관리할 수 있습니다.");
        }
    }

    private void reindexFeaturedPhotos() {
        List<Photo> allPhotos = photoRepository.findAll();
        List<Long> featuredIds = allPhotos.stream()
                .filter(Photo::isFeatured)
                .sorted(Comparator.comparing(photo -> photo.getFeaturedOrder() == null ? Integer.MAX_VALUE : photo.getFeaturedOrder()))
                .map(Photo::getId)
                .toList();

        for (Photo photo : allPhotos) {
            int index = featuredIds.indexOf(photo.getId());
            photo.updateFeatured(index >= 0, index >= 0 ? index : null);
        }

        photoRepository.saveAll(allPhotos);
    }

    private void deleteStoredFile(String storedFileName) {
        if (storedFileName == null || storedFileName.isBlank()) {
            return;
        }

        try {
            Files.deleteIfExists(uploadPath.resolve(storedFileName));
        } catch (IOException exception) {
            throw new IllegalStateException("업로드된 파일을 삭제하지 못했습니다.", exception);
        }
    }

    private void importLegacyPhotosOrSeedDefaults() {
        if (Files.exists(legacyStoragePath)) {
            try (InputStream inputStream = Files.newInputStream(legacyStoragePath)) {
                List<LegacyPhoto> legacyPhotos = objectMapper.readValue(inputStream, new TypeReference<>() {
                });
                List<Photo> importedPhotos = legacyPhotos.stream()
                        .map(photo -> new Photo(
                                photo.imageUrl(),
                                photo.description() == null ? "" : photo.description(),
                                photo.storedFileName(),
                                writeJson(List.of(photo.imageUrl())),
                                photo.storedFileName() == null ? null : writeJson(List.of(photo.storedFileName())),
                                photo.featured(),
                                photo.featuredOrder()
                        ))
                        .toList();
                photoRepository.saveAll(importedPhotos);
                return;
            } catch (IOException exception) {
                throw new IllegalStateException("기존 사진 데이터를 불러오지 못했습니다.", exception);
            }
        }

        photoRepository.saveAll(List.of(
                createSeedPhoto("https://images.unsplash.com/photo-1598134493179-51332e56807f", "포메라니안 스튜디오 컷", true, 0),
                createSeedPhoto("https://images.unsplash.com/photo-1544568100-847a948585b9", "베이지 톤 강아지 프로필", true, 1),
                createSeedPhoto("https://images.unsplash.com/photo-1537151608828-ea2b11777ee8", "햇살 아래 반려견", true, 2),
                createSeedPhoto("https://images.unsplash.com/photo-1517423568366-8b83523034fd", "집중하는 시선", true, 3),
                createSeedPhoto("https://images.unsplash.com/photo-1587300003388-59208cc962cb", "화이트 배경 스냅", true, 4),
                createSeedPhoto("https://images.unsplash.com/photo-1583337130417-3346a1be7dee", "웃고 있는 반려견", true, 5)
        ));
    }

    private String extractExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }

        return fileName.substring(fileName.lastIndexOf('.') + 1);
    }

    private PhotoResponse toResponse(Photo photo) {
        List<String> imageUrls = resolveImageUrls(photo);
        String imageUrl = photo.getImageUrl();
        if (imageUrl == null || imageUrl.isBlank()) {
            imageUrl = imageUrls.isEmpty() ? "" : imageUrls.get(0);
        }

        return new PhotoResponse(
                photo.getId(),
                imageUrl,
                imageUrls,
                photo.getDescription(),
                imageUrls.size() > 1,
                photo.isFeatured(),
                photo.getFeaturedOrder()
        );
    }

    private List<String> resolveImageUrls(Photo photo) {
        List<String> imageUrls = readJsonList(photo.getImageUrlsJson());
        if (!imageUrls.isEmpty()) {
            return imageUrls;
        }

        if (photo.getStoredFileName() != null && !photo.getStoredFileName().isBlank()) {
            return List.of(publicBaseUrl + "/uploads/" + photo.getStoredFileName());
        }

        return photo.getImageUrl() == null || photo.getImageUrl().isBlank()
                ? List.of()
                : List.of(photo.getImageUrl());
    }

    private List<String> resolveStoredFileNames(Photo photo) {
        List<String> storedFileNames = readJsonList(photo.getStoredFileNamesJson());
        if (!storedFileNames.isEmpty()) {
            return storedFileNames;
        }

        return photo.getStoredFileName() == null || photo.getStoredFileName().isBlank()
                ? List.of()
                : List.of(photo.getStoredFileName());
    }

    private String writeJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (IOException exception) {
            throw new IllegalStateException("사진 메타데이터를 저장하지 못했습니다.", exception);
        }
    }

    private List<String> readJsonList(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (IOException exception) {
            throw new IllegalStateException("사진 메타데이터를 불러오지 못했습니다.", exception);
        }
    }

    private Map<String, UploadedImage> storeUploadedImages(List<String> imageKeys, List<MultipartFile> files) {
        Map<String, UploadedImage> uploadedImages = new HashMap<>();

        for (int index = 0; index < files.size(); index++) {
            MultipartFile file = files.get(index);
            if (file == null || file.isEmpty()) {
                continue;
            }

            String extension = extractExtension(file.getOriginalFilename());
            if (!List.of("jpg", "jpeg", "png", "webp").contains(extension.toLowerCase())) {
                throw new IllegalArgumentException("jpg, jpeg, png, webp 파일만 업로드할 수 있습니다.");
            }

            String storedFileName = UUID.randomUUID() + "." + extension;
            Path targetPath = uploadPath.resolve(storedFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException exception) {
                throw new IllegalStateException("사진 파일을 저장하지 못했습니다.", exception);
            }

            uploadedImages.put(imageKeys.get(index), new UploadedImage(
                    publicBaseUrl + "/uploads/" + storedFileName,
                    storedFileName
            ));
        }

        return uploadedImages;
    }

    private void updatePhotoCollections(Photo photo, List<String> imageUrls, List<String> storedFileNames) {
        photo.updateImageCollections(
                writeJson(imageUrls),
                storedFileNames.isEmpty() ? null : writeJson(storedFileNames)
        );
    }

    private Photo createSeedPhoto(String imageUrl, String description, boolean featured, Integer featuredOrder) {
        return new Photo(
                imageUrl,
                description,
                null,
                writeJson(List.of(imageUrl)),
                null,
                featured,
                featuredOrder
        );
    }

    private record LegacyPhoto(
            Long id,
            String imageUrl,
            String description,
            String storedFileName,
            boolean featured,
            Integer featuredOrder
    ) {
    }

    private record UploadedImage(
            String imageUrl,
            String storedFileName
    ) {
    }
}
