package com.example.model.common;

public class Result<T>{
    public Boolean isSuccess;
    public T value;
    public String error;
    private Result(Boolean isSuccess, T value, String error) {
        this.isSuccess = isSuccess;
        this.value = value;
        this.error = error;
    }
    public static <T> Result<T> Success(T value) {
        return new Result<>(true, value, null);
    }
    public static <T> Result<T> Failure(T value, String error) {
        return new Result<>(false, null, error);
    }
}
