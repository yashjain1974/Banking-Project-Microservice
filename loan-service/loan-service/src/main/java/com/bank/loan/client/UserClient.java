package com.bank.loan.client;

import com.bank.loan.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/users/{userId}")
    UserDto getUserById(@PathVariable("userId") String userId);
}
