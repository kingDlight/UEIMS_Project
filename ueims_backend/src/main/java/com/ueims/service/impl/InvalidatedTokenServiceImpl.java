package com.ueims.service.impl;

import com.ueims.model.entity.InvalidatedToken;
import com.ueims.repository.InvalidatedTokenRepository;
import com.ueims.service.InvalidatedTokenService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvalidatedTokenServiceImpl implements InvalidatedTokenService {
    private final InvalidatedTokenRepository repository;

    @Override
    public List<InvalidatedToken> findAll() { return repository.findAll(); }

    @Override
    public InvalidatedToken findById(String id) { return repository.findById(id).orElse(null); }

    @Override
    public InvalidatedToken save(InvalidatedToken entity) { return repository.save(entity); }

    @Override
    public void deleteById(String id) { repository.deleteById(id); }
}
