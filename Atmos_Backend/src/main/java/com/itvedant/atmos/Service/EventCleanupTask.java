package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Repo.EventRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(EventCleanupTask.class);

    private final EventRepository eventRepository;

    // Run every hour
    @Scheduled(cron = "0 0 * * * *")
    public void disablePastEvents() {
        LocalDateTime now = LocalDateTime.now();
        logger.info("Running event cleanup task at {}", now);

        List<Event> pastEvents = eventRepository.findAllByDateTimeBeforeAndActiveTrue(now);
        
        if (!pastEvents.isEmpty()) {
            logger.info("Found {} past events to disable", pastEvents.size());
            for (Event event : pastEvents) {
                event.setActive(false);
            }
            eventRepository.saveAll(pastEvents);
            logger.info("Successfully disabled {} past events", pastEvents.size());
        } else {
            logger.info("No past events found to disable");
        }
    }
}
