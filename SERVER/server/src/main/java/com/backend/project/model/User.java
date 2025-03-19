package com.backend.project.model;

import java.util.List;

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

    public String getUsername(){
        return username;
    }

    public void setUsername(String username){
        this.username = username;
    }

    @Column(name = "name")
    private String user_name;

    public String getName(){
        return user_name;
    }

    public void setName(String user_name){
        this.user_name = user_name;
    }

    @Column(name = "unit")
    private String unit;

    public String getUnit(){
        return unit;
    }

    public void setUnit(String unit){
        this.unit = unit;
    }

    @Column(name = "role")
    private int role;

    public int getRole(){
        return role;
    }

    public void setRole(int role){
        this.role = role;
    }

    @Column(name = "email")
    private String email;

    public String getEmail(){
        return email;
    }

    public void setEmail(String email){
        this.email = email;
    }

    @Column(name = "password")
    private String password;

    public String getPassword(){
        return password;
    }

    public void setPassword(String password){
        this.password = password;
    }
    
    @OneToMany(mappedBy = "user")
    private List<Surgery> surgeries;
}
