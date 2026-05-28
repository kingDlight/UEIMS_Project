package com.ueims.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ueims.model.entity.InvalidatedToken;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.service.InvalidatedTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InvalidatedTokenServiceImpl implements InvalidatedTokenService {
    private final InvalidatedTokenRepository repository;

    @Override
    public List<InvalidatedToken> findAll() {
        return repository.findAll();
    }

    @Override
    public InvalidatedToken findById(String id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public InvalidatedToken save(InvalidatedToken entity) {
        return repository.save(entity);
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }
}
