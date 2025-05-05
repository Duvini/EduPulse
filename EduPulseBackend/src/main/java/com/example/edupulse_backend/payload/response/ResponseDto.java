package com.example.edupulse_backend.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDto {
    private boolean error;
    private Object data;
    private String message;

    public ResponseDto(boolean error, Object data) {
        this.error = error;
        this.data = data;
    }
    
    public ResponseDto(boolean error, String message) {
        this.error = error;
        this.message = message;
    }
}