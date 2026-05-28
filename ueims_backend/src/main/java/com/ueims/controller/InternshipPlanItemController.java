package com.ueims.controller;

import com.ueims.model.entity.InternshipPlanItem;
import com.ueims.service.InternshipPlanItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/internship-plan-items")
@RequiredArgsConstructor
public class InternshipPlanItemController {
    private final InternshipPlanItemService service;

    @GetMapping
    public ResponseEntity<List<InternshipPlanItem>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipPlanItem> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<InternshipPlanItem> create(@RequestBody InternshipPlanItem entity) {
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
