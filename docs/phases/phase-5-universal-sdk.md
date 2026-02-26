# Phase 5: Universal SDK (Week 5)

## Goal
Enable easy integration of the chatbot into any external website with minimal code.

## Deliverables
- [x] Embeddable script (JS snippet)
- [x] SDK initialization methods
- [x] Cross-origin communication (PostMessage)

## Usage Example
```javascript
import { OmniChat } from 'omnichat-sdk';

OmniChat.init({
  apiKey: 'YOUR_API_KEY',
  theme: 'dark'
});
```

## Checklist
- [x] Build bundled version of the chat widget
- [x] Implement secure API key authentication
- [x] Handle CSS isolation (Shadow DOM)
- [x] Create documentation for SDK integration
