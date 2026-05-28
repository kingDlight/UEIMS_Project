package com.ueims.repository;

import com.ueims.model.entity.SystemAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface SystemAnnouncementRepository extends JpaRepository<SystemAnnouncement, UUID> {
}
