package com.ueims.service.impl;

import com.ueims.model.entity.User;
import com.ueims.repository.UserRepository;
import com.ueims.service.UserService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository repository;

    @Override
    public List<User> findAll() { return repository.findAll(); }

    @Override
    public User findById(UUID id) { return repository.findById(id).orElse(null); }

    @Override
    public User save(User entity) { return repository.save(entity); }

    @Override
    public void deleteById(UUID id) { repository.deleteById(id); }
}
