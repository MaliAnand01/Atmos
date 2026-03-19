package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class DebugController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/mail")
    public String testMail(@RequestParam String email) {
        // This is a diagnostic endpoint. In a real production app, 
        // you would protect this with an admin check. 
        // For debugging the Render issue, we'll keep it simple.
        return emailService.sendTestEmail(email);
    }
}
