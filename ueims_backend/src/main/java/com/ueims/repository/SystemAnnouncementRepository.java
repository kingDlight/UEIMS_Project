package com.ueims.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ueims.model.entity.SystemAnnouncement;

@Repository
public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, UUID> {
    List<SystemAnnouncement> findByStatusOrderByCreatedAtDesc(String status);
}
