# assistant_rules.md

## Overview
This file lists trigger → response rules for the rule-based assistant. Each rule includes:
- id
- trigger (regex or intent)
- response (text or template_name)
- action (none | create_todo | show_profile | generate_message)
- sample payload for action

## RULE: colleague_delay
id: r1
trigger: (?i)colleague.*delay|won't stop delaying|keeps delaying
response:
  - "Short witty: 'Tell them the queue’s moved — we’re on pilgrimage, not a waiting room.'"
  - "Firm: 'Please update status by EOD; otherwise we assume action X.'"
  - "Escalate: 'If no update by 2 hours we'll reassign and inform finance.'"
action:
  - type: generate_message
    template_name: colleague_nudge_funny
    escalation_levels: [0,1,2]
priority: 50

## RULE: how_use_objectives_filter
id: r2
trigger: (?i)how to use objectives filter|objectives filter
response:
  - "Step-by-step: 1) Open Objectives → 2) Use timeframe → 3) Set urgency → 4) Click 'Mark done' to archive."
action: none
priority: 90

## RULE: change_hotel_status_booked
id: r3
trigger: (?i)change (hotel )?status to booked|mark as booked
response:
  - "If in demo mode: 'Guide: Click Confirm Booked in booking card.'"
  - "If live: server action: create API call PATCH /api/bookings/:id with {status: 'booked'} and write audit."
action:
  - type: api_call
    method: PATCH
    path_template: /api/bookings/{booking_id}/confirm
    require_confirmation: true
priority: 30

## RULE: greeting
id: r4
trigger: (?i)hello|hi|salaam
response:
  - "Salaam! I'm here to support your operations. Ask me about **hotel verification**, **scanning passports**, or just say 'boost' for a tip."
action: none
priority: 10

## RULE: help_scan
id: r5
trigger: (?i)how.*scan|scan.*passport
response:
  - "To scan passports: Go to Group Details > Click 'Run Risk Scan' or 'Upload CSV'. This will sync with the NUSUK risk engine."
action: none
priority: 80
