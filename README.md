# 🏋️‍♂️ Fitness Intelligence

> **Your intelligent AI fitness coach that actually watches your workout form and calculates food calories down to the exact gram.**

[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203%20%7C%20Java%2017-6DB33F?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![MediaPipe](https://img.shields.io/badge/Vision-Google%20MediaPipe%20Pose-4285F4?style=flat&logo=google)](https://developers.google.com/mediapipe)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 💡 What is Fitness Intelligence?

Most fitness apps make you guess: you guess if your squat was deep enough, you guess how many calories were on your plate, and you wonder why your progress stalls. 

**Fitness Intelligence** is a modern full-stack web platform built to remove the guesswork. Using your device's camera, it tracks your body joints in real time to tell you if your exercise form is right or wrong. For your meals, it combines photo scanning with **exact-gram calibrated nutrition**, so if you weigh 90g of chicken, you get exact numbers—no mathematical drift, no vague estimations.

Best of all, it works **both completely offline in your browser** and connects seamlessly to a robust **Spring Boot (Java 17) cloud backend**.

---

## ✨ Why It’s Different

| Frustration with Normal Apps | How Fitness Intelligence Solves It |
| :--- | :--- |
| **"Am I doing this exercise right?"** | **Real-Time Camera AI**: Uses Google MediaPipe to track 33 joint landmarks. It counts your reps and instantly alerts you if your knees cave in or you don't hit proper depth. |
| **"My calorie tracker gives weird numbers"** | **Zero-Drift Gram Precision**: Directly input exact grams (e.g., 90g) or use one-click scale recalibration. Anchored directly to immutable USDA reference data. |
| **"Apps break when offline or without Wi-Fi"** | **Hybrid Architecture**: Uses a smart local adapter first. You can train and track completely offline, and sync with the Spring Boot server whenever you're connected. |
| **"Generic AI tips that don't fit me"** | **Context-Aware AI Copilot**: A built-in coach that understands your workout history, injury limitations, and daily recovery score before recommending workouts. |

---

## 🚀 Key Features

### 1. 📹 AI Biomechanics Form Checker
- **Live Webcam & Video Upload**: Practice live in front of your laptop/phone camera, or record a video at the gym and upload it for instant analysis.
- **Joint Angle Calculation**: Tracks hip, knee, and elbow angles during Squats, Push-ups, and Bicep Curls.
- **Smart Feedback Overlay**: Renders a dynamic, color-coded skeleton directly on the video:
  - 🟢 **Green**: Perfect alignment and full range of motion.
  - 🟡 **Amber / Red**: Form warning (e.g., knee valgus collapse, back arch, or partial rep).
- **Repetition Counter**: Automatically tracks completed reps when you achieve full range of motion.

### 2. 🥗 Food Scanner & Exact-Gram Calorie Precision
- **Photo Recognition**: Take or upload a picture of your meal to identify foods and macronutrients.
- **Exact-Gram Calorie Recalibration**: Unlike apps that round portions in steps of 25g or 50g, you can type **exact weights (e.g., 90g, 135g)** or use quick-adjust chips (`[50g, 90g, 100g, 150g, 200g]`).
- **Macro Breakdown**: Instant breakdown of Calories, Protein, Carbs, and Fats.

### 3. 💬 Interactive AI Coach & Copilot
- Ask anything from *"Can I do leg presses with knee pain?"* to *"How much protein is in 90 gm chicken breast?"*.
- Real-time conversational streaming with actionable exercise and diet advice.

### 4. 📊 Daily Readiness & Progress Tracking
- Check-in daily with sleep quality, energy levels, and muscle soreness.
- Automatically scales your recommended workout intensity based on your recovery score.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS & Modern Sports-Tech Dark Theme
- **Computer Vision**: Google MediaPipe Pose Landmarker (`@mediapipe/tasks-vision`)
- **Visuals & 3D**: HTML5 Canvas overlays & Three.js animations
- **Icons**: Lucide React

### Backend
- **Framework**: Java 17 + Spring Boot 3
- **ORM & Data**: Spring Data JPA + H2 In-Memory Database (PostgreSQL-ready)
- **Architecture**: Clean RESTful Controllers + Domain Service Layer
- **Testing**: JUnit 5 + MockMvc automated test suite

---

## ⚡ Quick Start

### 1. Run the Frontend (React + Vite)
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fitness-intelligence.git
cd fitness-intelligence

# Install dependencies
npm install

# Start development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

### 2. Run the Backend (Spring Boot 3)
```bash
cd backend

# Run automated tests
mvn test

# Start the Spring Boot REST API
mvn spring-boot:run
```
The backend starts on **[http://localhost:8080](http://localhost:8080)**.  
The frontend will automatically detect the live server and display a green **"Spring Boot Connected"** status badge!

---

## 📁 Project Structure

```
fitness-intelligence/
├── src/
│   ├── components/       # UI cards, modals, AI drawer, form visualizer
│   │   ├── ai/           # AI Copilot drawer & knowledge base
│   │   ├── ui/           # Design system buttons, food cards, badges
│   │   └── hero/         # Interactive 3D graphics & visual elements
│   ├── pages/            # Form Checker, Nutrition, Workouts, Profile, Dashboard
│   ├── lib/              # MediaPipe Pose calculations & joint geometry
│   ├── services/         # Dual-adapter layer (Local Storage + Spring Boot API)
│   └── engine/           # Deterministic health formulas (BMR, TDEE, Readiness)
│
├── backend/              # Spring Boot 3 Application
│   └── src/
│       ├── main/java/    # REST Controllers, JPA Entities, DTOs & Services
│       └── test/java/    # Automated JUnit tests for AI & Biomechanics
│
└── package.json          # Frontend scripts and dependencies
```

---

## 💡 Troubleshooting Tips

- **Camera blocked or shows a slash icon (`📷🚫`)?**  
  Check if your laptop has a physical sliding privacy shutter over the webcam lens, or press your keyboard camera toggle key (usually `Fn + F10` or `Fn + F6`). Also ensure camera permissions are allowed in Windows Settings (*Privacy & security > Camera*).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
