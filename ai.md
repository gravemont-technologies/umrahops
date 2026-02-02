# AI Vitality & Integration Strategy

## Overview
Artificial Intelligence in UmrahOps is not just a feature; it is the **force multiplier** that transforms a manual, error-prone workflow into a precision-engineered executive process. The goal is to reduce tediousness, ensure canonical data integrity, and provide "executive-level" decision support without abstraction.

## Core Philosophy
- **Pragmatic Utility**: No "chat with PDF" generics. AI focuses on specific, actionable steps (e.g., "Passport OCR failed -> Verify manually").
- **Rule-Based over Generative**: For compliance and rigid workflows (NUSUK), deterministic rules take precedence. Generative AI is used only for "soft" tasks like drafting communication or risk reasoning.
- **Workflow-Embedded**: AI does not live in a sidebar; it lives inside the buttons ("Run Risk Scan", "Generate Hotel Request").

---

## 🚀 Proposed Use Cases & Implementation

### 1. The "Work Day" Walkthrough (Interactive Demo)
**Concept**: A guided, overlay-based experience simulating a perfect operational workflow.
**AI Role**:
- **Scripted Scenarios**: "Dynamic" data injection to simulate edge cases (e.g., "Mahram mismatch detected").
- **Draggable Context**: AI summarizes traveler profiles into a "card" that follows the user across screens.

### 2. Adaptive Objectives (The "Executive" TODO List)
**Concept**: A dynamic task list that evolves based on group status.
**AI Role**:
- **Context Awareness**: If `Group Status = Pending Hotel`, AI injects TODO: "Confirm booking with Pullman Zamzam".
- **Urgency Classification**: AI analyzes dates (Arrival - Today) to tag tasks as "Critical" or "Routine".
- **Auto-Resolution**: When the system detects a status change (e.g., database update), the related TODO is auto-checked.

### 3. Smart Coordination (Communication Engine)
**Concept**: One-click generation of context-aware messages.
**AI Role**:
- **Template Filling**: `{{HotelName}} + {{GroupCount}} + {{CheckInDate}}` -> "Please confirm 50 beds for Group A...".
- **Tone Adjustment**: "Urgent follow-up" vs "Initial inquiry".

### 4. Rule-Based "Office" Chatbot
**Concept**: A lightweight assistant for app navigation and stress relief.
**AI Role**:
- **Navigation**: "How do I scan passports?" -> Opens CSV Uploader.
- **Witty Banter**: Simple regex-based triggers for humor (e.g., "Client delaying" -> "Tell them the visa server is 'moody' today").

### 5. BOOSTs (Knowledge Injection)
**Concept**: Micro-learning modules for productivity.
**AI Role**:
- **Curated Tips**: "Did you know? You can paste Excel rows directly here."
- **Copilot Prompts**: Pre-engineered prompts for users to use in their own Excel/External tools.

---

## Technical Architecture
- **Schema**: New `objectives` table linked to Groups.
- **Frontend**: `framer-motion` for draggable overlays and interactive tour.
- **Backend**: Simple heuristic engine (Logic layers) rather than full LLM for every click (speed + reliability).
