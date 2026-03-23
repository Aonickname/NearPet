package com.nearpet.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "이름을 입력해주세요.")
        String name,

        @NotBlank(message = "아이디를 입력해주세요.")
        @Size(min = 4, message = "아이디는 4자 이상이어야 합니다.")
        String username,

        @NotBlank(message = "비밀번호를 입력해주세요.")
        @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다.")
        String password
) {
}
