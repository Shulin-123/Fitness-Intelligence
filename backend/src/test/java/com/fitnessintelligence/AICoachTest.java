package com.fitnessintelligence;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitnessintelligence.dto.AICoachRequest;
import com.fitnessintelligence.dto.AICoachResponse;
import com.fitnessintelligence.service.AICoachService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AICoachTest {

    private final AICoachService service = new AICoachService("", "gemini-3.5-flash-lite", new ObjectMapper());

    @Test
    void testBenchPlateauQuery() {
        AICoachRequest req = new AICoachRequest("bench press plateau sticking point");
        AICoachResponse res = service.processQuery(req);

        assertNotNull(res);
        assertTrue(res.getAnswer().contains("Bench Press Plateau"));
        assertTrue(res.getSourceTags().stream().anyMatch(t -> t.contains("Schoenfeld") || t.contains("NSCA")));
        assertEquals("SPRING_BOOT_DETERMINISTIC_AI_ENGINE", res.getEngineMode());
    }

    @Test
    void testLongevityQuery() {
        AICoachRequest req = new AICoachRequest("Zone 2 cardio and longevity");
        AICoachResponse res = service.processQuery(req);

        assertNotNull(res);
        assertTrue(res.getAnswer().contains("Longevity & Cardiovascular Architecture"));
        assertTrue(res.getAnswer().contains("150 to 300 minutes"));
    }

    @Test
    void testExactGramCaloriePrecisionQuery() {
        AICoachRequest req = new AICoachRequest("calculate calories for 90 gm chicken breast");
        AICoachResponse res = service.processQuery(req);

        assertNotNull(res);
        assertTrue(res.getAnswer().contains("90.0g"));
        assertTrue(res.getAnswer().contains("149 kcal")); // 165 * 0.9 = 148.5 -> 149
        assertTrue(res.getAnswer().contains("27.9g")); // 31.0 * 0.9 = 27.9
        assertTrue(res.getSourceTags().stream().anyMatch(t -> t.contains("USDA")));
    }
}
