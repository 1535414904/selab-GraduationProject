package com.backend.project.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_user")
public class User {
    
    @Id
    @Column(name = "username")
    private String username;

    @Column(name = "name")
    private String user_name;

    @Column(name = "unit")
    private String unit;

    @Column(name = "role")
    private int role;

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "reset_password_code")
    private String resetPasswordCode;

    @Column(name = "reset_password_expires")
    private LocalDateTime resetPasswordExpires;

    @Column(name = "reset_code_attempts")
    private int resetCodeAttempts;

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<Surgery> surgeries;

    // ===== Getters and Setters =====

    public String getUsername(){
        return username;
    }

    public void setUsername(String username){
        this.username = username;
    }

    public String getName(){
        return user_name;
    }

    public void setName(String user_name){
        this.user_name = user_name;
    }

    public String getUnit(){
        return unit;
    }

    public void setUnit(String unit){
        this.unit = unit;
    }

    public int getRole(){
        return role;
    }

    public void setRole(int role){
        this.role = role;
    }

    public String getEmail(){
        return email;
    }

    public void setEmail(String email){
        this.email = email;
    }

    public String getPassword(){
        return password;
    }

    public void setPassword(String password){
        this.password = password;
    }

    public String getResetPasswordCode() {
        return resetPasswordCode;
    }

    public void setResetPasswordCode(String resetPasswordCode) {
        this.resetPasswordCode = resetPasswordCode;
    }

    public LocalDateTime getResetPasswordExpires() {
        return resetPasswordExpires;
    }

    public void setResetPasswordExpires(LocalDateTime resetPasswordExpires) {
        this.resetPasswordExpires = resetPasswordExpires;
    }

    public int getResetCodeAttempts() {
        return resetCodeAttempts;
    }

    public void setResetCodeAttempts(int resetCodeAttempts) {
        this.resetCodeAttempts = resetCodeAttempts;
    }

    @JsonIgnore
    public List<Surgery> getSurgeries() {
        return surgeries;
    }

    public void setSurgeries(List<Surgery> surgeries) {
        this.surgeries = surgeries;
    }
}
