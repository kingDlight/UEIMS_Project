package com.ueims.service;

import java.util.List;

import com.ueims.model.entity.InvalidatedToken;

public interface InvalidatedTokenService {
    List<InvalidatedToken> findAll();

    InvalidatedToken findById(String id);

    InvalidatedToken save(InvalidatedToken entity);

    void deleteById(String id);
}
