package com.ueims.service;

import com.ueims.model.entity.InvalidatedToken;
import java.util.List;

public interface InvalidatedTokenService {
    List<InvalidatedToken> findAll();
    InvalidatedToken findById(String id);
    InvalidatedToken save(InvalidatedToken entity);
    void deleteById(String id);
}
