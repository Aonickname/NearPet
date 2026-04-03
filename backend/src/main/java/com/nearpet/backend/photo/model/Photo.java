package com.nearpet.backend.photo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "photos")
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "stored_file_name", length = 255)
    private String storedFileName;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrlsJson;

    @Column(name = "stored_file_names", columnDefinition = "TEXT")
    private String storedFileNamesJson;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "featured_order")
    private Integer featuredOrder;

    protected Photo() {
    }

    public Photo(
            String imageUrl,
            String description,
            String storedFileName,
            String imageUrlsJson,
            String storedFileNamesJson,
            boolean featured,
            Integer featuredOrder
    ) {
        this.imageUrl = imageUrl;
        this.description = description;
        this.storedFileName = storedFileName;
        this.imageUrlsJson = imageUrlsJson;
        this.storedFileNamesJson = storedFileNamesJson;
        this.featured = featured;
        this.featuredOrder = featuredOrder;
    }

    public Long getId() {
        return id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public String getStoredFileName() {
        return storedFileName;
    }

    public String getImageUrlsJson() {
        return imageUrlsJson;
    }

    public String getStoredFileNamesJson() {
        return storedFileNamesJson;
    }

    public boolean isFeatured() {
        return featured;
    }

    public Integer getFeaturedOrder() {
        return featuredOrder;
    }

    public void updatePostContent(String description, String imageUrl, String storedFileName) {
        this.description = description;
        this.imageUrl = imageUrl;
        this.storedFileName = storedFileName;
    }

    public void updateImageCollections(String imageUrlsJson, String storedFileNamesJson) {
        this.imageUrlsJson = imageUrlsJson;
        this.storedFileNamesJson = storedFileNamesJson;
    }

    public void updateFeatured(boolean featured, Integer featuredOrder) {
        this.featured = featured;
        this.featuredOrder = featuredOrder;
    }
}
