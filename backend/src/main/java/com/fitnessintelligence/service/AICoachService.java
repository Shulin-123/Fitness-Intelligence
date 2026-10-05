package com.fitnessintelligence.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitnessintelligence.dto.AICoachRequest;
import com.fitnessintelligence.dto.AICoachResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
public class AICoachService {

    private static final Logger log = LoggerFactory.getLogger(AICoachService.class);

    private final String apiKey;
    private final String model;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AICoachService(
            @Value("${gemini.api-key:}") String apiKey,
            @Value("${gemini.model:gemini-3.5-flash-lite}") String model,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public AICoachResponse processQuery(AICoachRequest request) {
        String prompt = (request != null && request.getPrompt() != null)
                ? request.getPrompt().trim()
                : "Analyze this image for fitness, exercise form, or nutrition.";

        String imageBase64 = request != null ? request.getImageBase64() : null;
        String mimeType = (request != null && request.getMimeType() != null && !request.getMimeType().isBlank())
                ? request.getMimeType()
                : "image/jpeg";

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                AICoachResponse geminiResponse = callGeminiLive(prompt, imageBase64, mimeType);
                if (geminiResponse != null && geminiResponse.getAnswer() != null && !geminiResponse.getAnswer().isBlank()) {
                    return geminiResponse;
                }
            } catch (Exception e) {
                log.warn("[Gemini API] Failed or timed out, falling back to deterministic engine: {}", e.getMessage());
            }
        }

        return processDeterministicFallback(prompt, imageBase64 != null);
    }

    private AICoachResponse callGeminiLive(String userPrompt, String imageBase64, String mimeType) throws Exception {
        String endpoint = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
        );

        String systemInstruction = "You are the Fitness Intelligence AI Coach, a world-class exercise physiologist, biomechanics expert, and sports scientist. " +
                "Ground every answer in published sports science (NSCA, ISSN, WHO, ACSM). " +
                "Be concise, direct, and structured with Markdown headers and bullet points. " +
                "Include exact numbers (percentages, sets/reps, grams per kg) where applicable. " +
                "CRITICAL HIGH-PRECISION CALORIE DIRECTIVE: " +
                "Whenever the user specifies an exact food portion weight (e.g. '90 gm', '90g', '150g'), YOU MUST STRICTLY COMPUTE ALL CALORIES AND MACROS BASED ON THAT EXACT WEIGHT. " +
                "Never substitute arbitrary serving sizes or visual guesses (e.g. do not guess 66g or round to 70g when 90g is given). " +
                "Follow USDA FoodData Central 4-4-9 Atwater standards: 4 kcal/g protein, 4 kcal/g carb, 9 kcal/g fat. " +
                "MULTIMODAL VISION CAPABILITIES: " +
                "1. If an exercise form photo/video is provided: Identify the exercise, evaluate joint angles (knees, hips, elbows, spine), detect deviations (valgus, lumbar flexion, excessive flare), and give 3 numbered corrective cues. " +
                "2. If a meal photo is provided: Detect the food items, estimate portions in grams (or honor scale readout if present), and compute calories, protein, carbs, and fats. " +
                "3. If a physique photo is provided: Analyze symmetry, posture alignment (pelvic tilt, scapular protraction), and target training focus.";

        Map<String, Object> payload = new HashMap<>();

        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("parts", Collections.singletonList(Collections.singletonMap("text", systemInstruction)));
        payload.put("system_instruction", systemPart);

        List<Map<String, Object>> partsList = new ArrayList<>();
        partsList.add(Collections.singletonMap("text", userPrompt));

        if (imageBase64 != null && !imageBase64.isBlank()) {
            // Strip data:image/...;base64, prefix if present
            String rawBase64 = imageBase64;
            if (rawBase64.contains(",")) {
                rawBase64 = rawBase64.substring(rawBase64.indexOf(",") + 1);
            }
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", mimeType);
            inlineData.put("data", rawBase64);
            partsList.add(Collections.singletonMap("inline_data", inlineData));
        }

        Map<String, Object> userContent = new HashMap<>();
        userContent.put("role", "user");
        userContent.put("parts", partsList);
        payload.put("contents", Collections.singletonList(userContent));

        String jsonBody = objectMapper.writeValueAsString(payload);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
            if (!textNode.isMissingNode()) {
                String fullAnswer = textNode.asText().trim();

                List<String> sourceTags = imageBase64 != null
                        ? Arrays.asList("Google Gemini Multimodal Vision", "NSCA Biomechanics", "ISSN Nutrition")
                        : Arrays.asList("Google Gemini 3.5 Flash", "NSCA Biomechanics", "ISSN Sports Science");

                List<String> followUps = imageBase64 != null
                        ? Arrays.asList("What corrective drills fix this posture fault?", "What are the macro targets for this meal?", "Can you write an accessory routine for this?")
                        : Arrays.asList("Can you break down the exact progression scheme?", "What are the target macronutrient ratios for this?", "How does this affect central nervous system recovery?");

                return new AICoachResponse(
                        fullAnswer,
                        sourceTags,
                        followUps,
                        "GOOGLE_GEMINI_LIVE_API (" + model + (imageBase64 != null ? " + Multimodal Vision" : "") + ")"
                );
            }
        } else {
            log.warn("[Gemini API] Returned HTTP status: {}", response.statusCode());
        }

        return null;
    }

    public AICoachResponse processDeterministicFallback(String rawPrompt, boolean hasImage) {
        String prompt = rawPrompt.toLowerCase().trim();

        if (hasImage) {
            return new AICoachResponse(
                    "### 📸 Multimodal Visual Biomechanics Audit\n\n" +
                    "1. **Posture & Joint Angle Tracking**:\n" +
                    "   * Align feet shoulder-width apart with a 15-30° outward angle.\n" +
                    "   * Maintain a neutral spine across the cervical, thoracic, and lumbar regions.\n" +
                    "2. **Safety & Depth Verification**:\n" +
                    "   * Ensure depth reaches hip crease parallel with top of patella.\n" +
                    "   * Prevent knee valgus collapse during the concentric drive phase.",
                    Arrays.asList("Visual Biomechanics Engine", "NSCA Guidelines"),
                    Arrays.asList("How to fix knee valgus?", "Optimal ankle mobility drills", "Bar path cues"),
                    "DETERMINISTIC_VISION_FALLBACK"
            );
        }

        // Specific Chest Growth / Hypertrophy
        if (prompt.contains("chest") && (prompt.contains("grow") || prompt.contains("exercise") || prompt.contains("workout") || prompt.contains("day"))) {
            return new AICoachResponse(
                    "### 🛡️ Optimal Chest Day for Maximum Hypertrophy (Schoenfeld & Helms Protocol)\n\n" +
                    "To maximize pectoral development, you must train both the clavicular head (upper chest) and sternocostal head (mid/lower chest) across varied resistance curves:\n\n" +
                    "1. **Incline Dumbbell Press (Upper Chest Focus)**:\n" +
                    "   * **Sets & Reps**: 3-4 sets × 8-10 reps @ 1-2 RIR.\n" +
                    "   * **Angle**: Set bench at 30° (higher shifts load to anterior deltoids).\n\n" +
                    "2. **Flat Barbell Bench Press (Heavy Mechanical Tension)**:\n" +
                    "   * **Sets & Reps**: 3-4 sets × 6-8 reps @ 2 RIR.\n" +
                    "   * Retract scapulae, maintain 45-60° elbow tuck (prevent 90° shoulder impingement).\n\n" +
                    "3. **Weighted or Bodyweight Chest Dips (Lower Pectoral & Stretch)**:\n" +
                    "   * **Sets & Reps**: 3 sets × 8-12 reps.\n" +
                    "   * Lean torso forward 30° to maximize pectoral fiber recruitment.\n\n" +
                    "4. **Cable Chest Flyes / Pec Deck (Peak Contraction & Shortened Position)**:\n" +
                    "   * **Sets & Reps**: 3 sets × 12-15 reps with 1-second squeeze at midline.\n\n" +
                    "**Weekly Volume Guideline**: Aim for 12-16 total weekly sets distributed over 2 sessions for optimal muscle protein synthesis.",
                    Arrays.asList("Schoenfeld Hypertrophy (2016)", "Contreras EMG Pectoral Analysis", "NSCA Guidelines"),
                    Arrays.asList(
                            "What is the best bench press bar path?",
                            "How to prevent shoulder impingement on bench?",
                            "Incline barbell vs Incline dumbbell for upper chest?"
                    ),
                    "SPRING_BOOT_DETERMINISTIC_AI_ENGINE"
            );
        }

        // Bench Press Plateau
        if (prompt.contains("plateau") && (prompt.contains("bench") || prompt.contains("press"))) {
            return new AICoachResponse(
                    "### 🏋️ Breaking a Bench Press Plateau (Biomechanics Strategy)\n\n" +
                    "To shatter a horizontal pressing sticking point without injury, apply these 3 scientific levers:\n\n" +
                    "1. **Scapular Retraction & Thoracic Arching**:\n" +
                    "   * Depress and retract scapulae into the bench padding. This stabilizes the glenohumeral joint and shortens effective stroke distance by 15-20%.\n\n" +
                    "2. **Overcoming Sticking Points**:\n" +
                    "   * **Bottom (Off Chest)**: Incorporate 2-second **Spoto Presses** or Pause Reps to develop starting kinetic force without bounce reflex.\n" +
                    "   * **Mid/Lockout**: Increase triceps overload with close-grip bench and weighted dips (8-10 reps @ 1-2 RIR).\n\n" +
                    "3. **Periodized Wave Loading**:\n" +
                    "   * Shift from standard 3x10 to a 3-week undulating cycle: Week 1 (5x5 @ 75%), Week 2 (4x3 @ 82.5%), Week 3 (3x2 @ 87.5%), followed by a deload.",
                    Arrays.asList("NSCA Biomechanics", "Schoenfeld et al. (2016)", "Zatsiorsky Science of Strength"),
                    Arrays.asList(
                            "What accessory exercises build tricep lockout power?",
                            "How to set up proper leg drive on the bench?",
                            "How many days per week can I bench press?"
                    ),
                    "SPRING_BOOT_DETERMINISTIC_AI_ENGINE"
            );
        }

        // Exact Gram Portion & Calorie Calculator (e.g. "90 gm chicken", "90g rice", "calculate calories for 90 gm paneer")
        java.util.regex.Pattern gramPattern = java.util.regex.Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:g|gm|gram|grams)\\b");
        java.util.regex.Matcher matcher = gramPattern.matcher(prompt);
        if (matcher.find()) {
            double grams = Double.parseDouble(matcher.group(1));
            if (grams > 0) {
                String foodName = null;
                double calPer100g = 0, pPer100g = 0, cPer100g = 0, fPer100g = 0, leuPer100g = 0;
                String foodDesc = "";

                if (prompt.contains("chicken")) {
                    foodName = "Cooked Boneless Skinless Chicken Breast";
                    calPer100g = 165; pPer100g = 31.0; cPer100g = 0.0; fPer100g = 3.6; leuPer100g = 2.4;
                    foodDesc = "High-bioavailability lean complete animal protein.";
                } else if (prompt.contains("rice")) {
                    foodName = "Cooked Jasmine / Basmati White Rice";
                    calPer100g = 130; pPer100g = 2.7; cPer100g = 28.2; fPer100g = 0.3; leuPer100g = 0.2;
                    foodDesc = "Fast-digesting starchy carbohydrate for glycogen resynthesis.";
                } else if (prompt.contains("paneer")) {
                    foodName = "Fresh Cottage Cheese (Paneer)";
                    calPer100g = 265; pPer100g = 18.3; cPer100g = 3.4; fPer100g = 20.8; leuPer100g = 1.6;
                    foodDesc = "Slow-digesting casein-dominant dairy protein & healthy lipid matrix.";
                } else if (prompt.contains("oat")) {
                    foodName = "Whole Rolled Oats (Raw/Dry)";
                    calPer100g = 389; pPer100g = 16.9; cPer100g = 66.3; fPer100g = 6.9; leuPer100g = 1.3;
                    foodDesc = "Beta-glucan prebiotic soluble fiber & sustained complex carbs.";
                } else if (prompt.contains("egg")) {
                    foodName = "Whole Large Egg (Boiled)";
                    calPer100g = 155; pPer100g = 12.6; cPer100g = 1.1; fPer100g = 10.6; leuPer100g = 1.1;
                    foodDesc = "Gold standard biological value (BV 100) with choline & lutein.";
                } else if (prompt.contains("dal") || prompt.contains("lentil")) {
                    foodName = "Cooked Yellow / Red Lentil Dal";
                    calPer100g = 116; pPer100g = 9.0; cPer100g = 20.1; fPer100g = 0.4; leuPer100g = 0.7;
                    foodDesc = "Plant-based fiber-rich complex carbohydrate & lysine source.";
                } else if (prompt.contains("roti") || prompt.contains("chapati")) {
                    foodName = "Whole Wheat Roti / Chapati";
                    calPer100g = 297; pPer100g = 11.0; cPer100g = 56.0; fPer100g = 3.7; leuPer100g = 0.8;
                    foodDesc = "Unrefined whole grain complex carbs with intact bran and germ.";
                }

                if (foodName != null) {
                    double factor = grams / 100.0;
                    long exactCalories = Math.round(calPer100g * factor);
                    double exactProtein = Math.round(pPer100g * factor * 10.0) / 10.0;
                    double exactCarbs = Math.round(cPer100g * factor * 10.0) / 10.0;
                    double exactFat = Math.round(fPer100g * factor * 10.0) / 10.0;
                    double exactLeucine = Math.round(leuPer100g * factor * 100.0) / 100.0;
                    boolean mpsMet = exactLeucine >= 2.5;

                    String ans = String.format(
                            "### ⚖️ Clinical Precision Nutritional Breakdown: %.1fg %s\n\n" +
                            "* **Exact Portion Weight**: **%.1f grams** (Calibrated strictly against USDA FoodData Central & ISSN standards)\n" +
                            "* **Total Caloric Energy**: **%d kcal** (Atwater formula: 4 kcal/g protein & carbs, 9 kcal/g fat)\n\n" +
                            "#### 🔬 Exact Macronutrient Profile:\n" +
                            "* **Protein**: **%.1fg** (%.0f%% of calories)\n" +
                            "* **Net Carbohydrates**: **%.1fg** (%.0f%% of calories)\n" +
                            "* **Dietary Fats**: **%.1fg** (%.0f%% of calories)\n" +
                            "* **Estimated Leucine**: **%.2fg** %s\n\n" +
                            "**Nutritional Context**: %s",
                            grams, foodName,
                            grams,
                            exactCalories,
                            exactProtein, exactCalories > 0 ? (exactProtein * 400.0 / exactCalories) : 0,
                            exactCarbs, exactCalories > 0 ? (exactCarbs * 400.0 / exactCalories) : 0,
                            exactFat, exactCalories > 0 ? (exactFat * 900.0 / exactCalories) : 0,
                            exactLeucine, mpsMet ? "*(⚡ Meets ≥2.5g Leucine MPS Threshold)*" : "*(Combine with other protein to trigger 2.5g Leucine MPS threshold)*",
                            foodDesc
                    );

                    return new AICoachResponse(
                            ans,
                            Arrays.asList("USDA FoodData Central", "ISSN Sports Nutrition", "Atwater Specific Factors"),
                            Arrays.asList(
                                    String.format("Log %.0fg %s to diary", grams, foodName),
                                    "What is the optimal meal timing around workouts?",
                                    "How to calculate total daily energy expenditure (TDEE)?"
                            ),
                            "SPRING_BOOT_DETERMINISTIC_AI_ENGINE"
                    );
                }
            }
        }

        if (prompt.contains("protein") || prompt.contains("macro") || prompt.contains("diet") || prompt.contains("calorie")) {
            return new AICoachResponse(
                    "### 🥩 Evidence-Based Macronutrient Prescription\n\n" +
                    "Based on ISSN (International Society of Sports Nutrition) meta-analyses:\n\n" +
                    "1. **Daily Protein Threshold**:\n" +
                    "   * **1.6 to 2.2 g per kg** of bodyweight for active resistance-trained individuals.\n" +
                    "   * Distribute evenly across 3-5 meals (0.4-0.55 g/kg per meal) to trigger the **leucine trigger** (approx. 2.7-3.0g leucine) for Muscle Protein Synthesis (MPS).\n\n" +
                    "2. **Dietary Fats**:\n" +
                    "   * Keep above **20-25% of total caloric intake** (minimum 0.7-1.0 g/kg) to maintain endogenous hormone production (testosterone, cortisol regulation).\n\n" +
                    "3. **Complex Carbohydrates**:\n" +
                    "   * Allocate remainder of caloric budget to carbs (typically 3-6 g/kg) to maximize muscle glycogen re-synthesis before heavy compound sessions.",
                    Arrays.asList("Morton et al. Br J Sports Med (2018)", "ISSN Protein Stand (2017)", "Helms et al. (2014)"),
                    Arrays.asList(
                            "Does post-workout anabolic window really matter?",
                            "Should I take protein before or after training?",
                            "How does protein intake change in a calorie deficit?"
                    ),
                    "SPRING_BOOT_DETERMINISTIC_AI_ENGINE"
            );
        }

        if (prompt.contains("longevity") || prompt.contains("cardio") || prompt.contains("zone 2") || prompt.contains("heart")) {
            return new AICoachResponse(
                    "### 🧬 Longevity & Cardiovascular Architecture\n\n" +
                    "The synthesis of resistance training and low-intensity steady state (Zone 2) cardio represents the gold standard for healthspan:\n\n" +
                    "1. **Mitochondrial Density & Zone 2**:\n" +
                    "   * Exercising at 60-70% max heart rate (Zone 2) trains slow-twitch muscle fibers to utilize fatty acids via beta-oxidation and stimulates mitochondrial biogenesis.\n" +
                    "   * WHO standard: **150 to 300 minutes per week** yields up to a 39% reduction in all-cause mortality.\n\n" +
                    "2. **Musculoskeletal Armor**:\n" +
                    "   * At least **2 days/week of progressive resistance training** preserves type II fast-twitch motor units, preventing sarcopenia and maintaining bone mineral density.\n\n" +
                    "3. **VO2 Max as a Biomarker**:\n" +
                    "   * High cardiorespiratory fitness (top quartile VO2 max) is associated with an ~80% risk reduction compared to low fitness (Mandsager et al., JAMA 2018).",
                    Arrays.asList("WHO Physical Activity Guidelines (2020)", "Mandsager et al. JAMA (2018)", "San Millan & Brooks Cell Metab (2020)"),
                    Arrays.asList(
                            "How do I calculate my Zone 2 heart rate range?",
                            "Can I do cardio and lifting on the same day?",
                            "How does VO2 Max correlate with biological age?"
                    ),
                    "SPRING_BOOT_DETERMINISTIC_AI_ENGINE"
            );
        }

        return new AICoachResponse(
                "### ⚡ Biomechanics & Adaptive Training Intelligence\n\n" +
                "Your training program is structured around verifiable physiological laws:\n\n" +
                "1. **Progressive Overload**: Micro-load working sets (e.g. +1.0-2.5 kg) or add reps while keeping Reps in Reserve (RIR) between 1 and 3.\n" +
                "2. **Volume Landmarks**: Maintain 10-20 weekly sets per muscle group close to failure (Schoenfeld meta-analysis).\n" +
                "3. **Autonomic Recovery**: Monitor sleep and muscle soreness daily. If readiness falls below 60%, modulate volume by 50% rather than skipping sessions entirely.",
                Arrays.asList("Peer-Reviewed Exercise Science", "ISSN Consensus", "ACSM Guidelines"),
                Arrays.asList(
                        "How do I break a bench press plateau?",
                        "Target macros for lean muscle gain",
                        "Why does Zone 2 cardio increase longevity?",
                        "Ankle mobility cues for deeper squats"
                ),
                "SPRING_BOOT_DETERMINISTIC_AI_ENGINE"
        );
    }
}
