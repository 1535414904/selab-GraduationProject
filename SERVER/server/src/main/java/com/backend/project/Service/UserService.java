package com.backend.project.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.backend.project.Dao.UserRepository;
import com.backend.project.model.User;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    /*-----for login-----*/

    public User authenticate(String username, String password) {
        Optional<User> optionalStaff = userRepository.findByUsername(username);

        return optionalStaff.filter(user -> user.getPassword().equals(password))
                            .orElse(null);
    }

    public User forgotPasswordAuthenticate(String username, String email) {
        Optional<User> optionalStaff = userRepository.findByUsername(username);

        return optionalStaff.filter(user -> user.getEmail().equals(email))
                            .orElse(null);
    }

    public String changePassword(String username, String newPassword) {
        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setPassword(newPassword);
            userRepository.save(user);
            return "Change Password successfully";
        } else {
            return "User not found";
        }
    }

    /*-----for system-----*/

    public User getUser(String username){
        return userRepository.findByUsername(username).orElseThrow();
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User updateUser(String username, User updatedUser) {
        return userRepository.findById(username).map(user -> {
            user.setName(updatedUser.getName());
            user.setUnit(updatedUser.getUnit());
            user.setRole(updatedUser.getRole());
            user.setEmail(updatedUser.getEmail());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void addUsers(List<User> users) {
        userRepository.saveAll(users);
    }

    public void deleteUser(String username) {
        userRepository.deleteById(username);
    }

    public void deleteUsers(List<String> usernames) {
        userRepository.deleteAllById(usernames);
    }
}
