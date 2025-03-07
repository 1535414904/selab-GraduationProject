package com.backend.project.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.project.Service.UserService;
import com.backend.project.model.User;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;

@CrossOrigin(origins = { "*" })
@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        User authenticate = userService.authenticate(user.getUsername(), user.getPassword());
        if (authenticate != null) {
            return "登入成功";
        } else {
            return "*帳號或密碼錯誤";
        }
    }

    @PostMapping("/login/ForgotPassword")
    public String forgotPassword(@RequestBody User user) {
        User authenticate = userService.forgotPasswordAuthenticate(user.getUsername(), user.getEmail());
        if (authenticate != null) {
            return "1";
        } else {
            return "*帳號或電子郵件錯誤";
        }
    }

    @PutMapping("/login/changePassword/{username}")
    public ResponseEntity<String> changePassword(@PathVariable String username, @RequestBody User user) {
        String changePasswordCheck = userService.changePassword(username, user.getPassword()); // 使用傳過來的密碼
        System.out.println(changePasswordCheck+"this is hack");
        if ("Change Password successfully".equals(changePasswordCheck)) {
            return ResponseEntity.ok(changePasswordCheck);
        } else {
            return ResponseEntity.status(404).body(changePasswordCheck);
        }
    }

    @GetMapping("/system/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/system/user/{username}")
    public User getUser(@PathVariable String username) {
        return userService.getUser(username);
    }

    @PutMapping("/system/user/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody User updatedUser) {
        userService.updateUser(username, updatedUser);
        return ResponseEntity.ok("User update successfully");
    }

    @PostMapping("/system/users/add")
    public ResponseEntity<?> addUsers(@RequestBody List<User> users) {
        userService.addUsers(users);
        return ResponseEntity.ok("Users add successfully");
    }
    
    @DeleteMapping("/system/user/delete/{username}")
    public ResponseEntity<?> deleteUsers(@PathVariable String username) {
        userService.deleteUser(username);
        return ResponseEntity.ok("User deleted successfully");
    }

    @DeleteMapping("/system/users/delete")
    public ResponseEntity<?> deleteUsers(@RequestParam List<String> usernames) {
        userService.deleteUsers(usernames);
        return ResponseEntity.ok("Users deleted successfully");
    }
}
