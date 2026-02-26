# Phase 4: Memory System (Week 4)

## Goal
Ensure the chatbot remembers previous interactions within a session for multi-turn conversations.

## Deliverables
- [x] Database schema for conversation storage
- [x] Memory retrieval logic
- [x] Session management (Redis or Postgres)

## Storage Schema
```sql
conversations (id, project_id, user_id, message, response, timestamp)
```

## Checklist
- [x] Implement conversation persisting
- [x] Retrieve last N messages for context
- [x] Handle session timeouts and cleanup
- [x] Verify memory retention across navigation
