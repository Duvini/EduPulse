package com.example.edupulse_backend.playload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResponseDto {
    private boolean error;
    private Object data;
}
