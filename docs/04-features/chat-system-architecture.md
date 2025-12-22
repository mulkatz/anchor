# Chat System Architecture: Visual Guide

**Version:** 1.0
**Last Updated:** December 2024
**Covers:** Chat flow, Memory system, Extraction, Personalization, Localization

This document provides a comprehensive visual overview of Anchor's chat system architecture, including the two-tier memory system, extraction pipeline, and personalization features.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Main Chat Message Flow](#2-main-chat-message-flow)
3. [Memory Architecture](#3-memory-architecture)
4. [Extraction Pipeline](#4-extraction-pipeline)
5. [Topic Lifecycle](#5-topic-lifecycle)
6. [Context Assembly](#6-context-assembly)
7. [System Prompt Construction](#7-system-prompt-construction)
8. [Validation Pipeline](#8-validation-pipeline)
9. [Localization Flow](#9-localization-flow)
10. [Personalization Features](#10-personalization-features)
11. [Crisis Detection](#11-crisis-detection)
12. [Temporal Awareness](#12-temporal-awareness)
13. [Data Flow Summary](#13-data-flow-summary)

---

## 1. System Architecture Overview

High-level view of all components and their interactions.

```mermaid
flowchart TB
    subgraph Client["📱 Mobile App"]
        UI[Chat UI]
        Voice[Voice Input]
    end

    subgraph Firebase["☁️ Firebase"]
        Firestore[(Firestore)]
        Functions[Cloud Functions]
    end

    subgraph Functions["⚡ Cloud Functions"]
        Chat[chat.ts<br/>Main Handler]
        Extract[extraction.ts<br/>Story Extraction]
        Lang[languageConfig.ts<br/>System Prompts]
        Temporal[temporal.ts<br/>Time Context]
        Adaptive[adaptiveLanguage.ts<br/>Style Matching]
    end

    subgraph Storage["💾 Firestore Collections"]
        Messages[messages/]
        UserStory[profile/userStory]
        MidTerm[profile/midTermMemory]
        ConvProfile[profile/conversationProfile]
    end

    subgraph AI["🤖 AI Services"]
        Gemini[Gemini 2.5 Flash<br/>Chat Responses]
        GeminiExtract[Gemini 2.0 Flash<br/>Extraction]
    end

    UI --> |Send Message| Firestore
    Voice --> |Transcribe| Firestore
    Firestore --> |Trigger| Chat

    Chat --> |Read| Messages
    Chat --> |Read| UserStory
    Chat --> |Read| MidTerm
    Chat --> |Read| ConvProfile

    Chat --> |Build Prompt| Lang
    Chat --> |Get Time| Temporal
    Chat --> |Get Style| Adaptive

    Chat --> |Generate Response| Gemini
    Chat --> |Fire & Forget| Extract

    Extract --> |Write| UserStory
    Extract --> |Write| MidTerm
    Extract --> |Call| GeminiExtract

    Gemini --> |Response| Chat
    Chat --> |Write Response| Messages

    style Client fill:#1e3a5f,stroke:#64FFDA,color:#fff
    style Firebase fill:#0d2137,stroke:#FFB38A,color:#fff
    style AI fill:#1a1a2e,stroke:#64FFDA,color:#fff
```

---

## 2. Main Chat Message Flow

Detailed sequence of what happens when a user sends a message.

```mermaid
sequenceDiagram
    autonumber
    participant User as 📱 User
    participant FS as 🔥 Firestore
    participant Chat as ⚡ chat.ts
    participant Crisis as 🚨 Crisis Check
    participant Context as 📚 Context Loaders
    participant Extract as 🔍 Extraction
    participant Gemini as 🤖 Gemini 2.5

    User->>FS: Send message
    FS->>Chat: Trigger onMessageCreate

    Note over Chat: Validate message<br/>(role=user, has text)

    Chat->>Crisis: Check for crisis keywords

    alt Crisis Detected
        Crisis-->>Chat: CRISIS FLAG
        Chat->>FS: Write crisis response
        Note over Chat: EXIT EARLY
    else No Crisis
        Crisis-->>Chat: Clear
    end

    par Parallel Context Loading
        Chat->>FS: Fetch last 75 messages
        Chat->>Context: Get User Story context
        Chat->>Context: Get Mid-Term Memory topics
        Chat->>Context: Get Conversation Profile
    end

    Note over Chat: Build temporal context<br/>(time, timezone, session breaks)

    Chat--)Extract: Fire & Forget extraction
    Note right of Extract: Async - extracts ALL messages<br/>(short answers are often critical)

    Chat->>Chat: Assemble system prompt
    Note over Chat: Inject all contexts:<br/>• Temporal<br/>• User Story + Curiosity Hints<br/>• Recent Topics<br/>• Conversation Profile<br/>• Age Adjustment

    Chat->>Gemini: Generate response
    Gemini-->>Chat: AI Response

    Chat->>FS: Write assistant message
    FS-->>User: Display response
```

---

## 3. Memory Architecture

The two-tier memory system and what each tier stores.

```mermaid
flowchart TB
    subgraph Tier1["🏛️ Tier 1: User Story (Long-term)"]
        direction TB
        Core[Core Identity<br/>name, age, pronouns]
        Life[Life Situation<br/>occupation, living]
        Rel[Relationships<br/>partner, pets, support]
        Therapy[Therapeutic Context<br/>triggers, anxiety type]
        Strengths[Strengths<br/>past wins, motivators]
        Meta[Extraction Meta<br/>topicsToExplore]
    end

    subgraph Tier2["⏳ Tier 2: Mid-Term Memory (Temporal)"]
        direction TB
        Topics[Recent Topics<br/>max 20]
        Topic1["📌 Topic: job interview anxiety<br/>context: Google on Friday<br/>status: active<br/>days ago: 3"]
        Topic2["📌 Topic: roommate conflict<br/>context: chores argument<br/>status: resolved<br/>outcome: success"]
        Topic3["📌 Topic: sleep issues<br/>context: work stress<br/>status: active<br/>recurring: true"]
    end

    subgraph Retention["⏱️ Retention Rules"]
        R1[User Story: Permanent]
        R2[Topics: 60 days max]
        R3[Resolved: 7 days visible]
        R4[Pruned: Auto-deleted]
    end

    User([User Message]) --> |"I'm Sarah, 24"| Tier1
    User --> |"Job interview Friday"| Tier2

    Tier1 --> |Facts| Prompt[System Prompt]
    Tier2 --> |Topics| Prompt

    style Tier1 fill:#1e3a5f,stroke:#64FFDA,color:#fff
    style Tier2 fill:#2d1f3d,stroke:#FFB38A,color:#fff
```

### Memory Comparison

```mermaid
flowchart LR
    subgraph Examples["What Goes Where?"]
        direction TB

        subgraph UserStory["User Story ✓"]
            US1["'I'm Sarah'"]
            US2["'I work as a nurse'"]
            US3["'Crowds trigger my anxiety'"]
            US4["'I have a cat named Luna'"]
        end

        subgraph MidTerm["Mid-Term Memory ✓"]
            MT1["'Job interview on Friday'"]
            MT2["'Fought with roommate'"]
            MT3["'Can't sleep this week'"]
            MT4["'Started new medication'"]
        end
    end

    style UserStory fill:#1e3a5f,stroke:#64FFDA,color:#fff
    style MidTerm fill:#2d1f3d,stroke:#FFB38A,color:#fff
```

---

## 4. Extraction Pipeline

How information is extracted from user messages and stored.

```mermaid
flowchart TB
    Message[User Message] --> Prepare[Prepare Context]
    Note[All messages extracted<br/>Short answers are critical] -.-> Message

    Prepare --> |Last 3 messages| Context[Build Extraction Context]
    Context --> |Existing story| AddStory[Add Current User Story]
    AddStory --> Prompt[Build Extraction Prompt]

    subgraph Localization["🌍 Language Detection"]
        Prompt --> |languageCode| LangCheck{DE or EN?}
        LangCheck -->|DE| DEPrompt[German Prompt<br/>German Labels]
        LangCheck -->|EN| ENPrompt[English Prompt<br/>English Labels]
    end

    DEPrompt --> Gemini[Gemini 2.0 Flash<br/>temp: 0.1]
    ENPrompt --> Gemini

    Gemini --> Parse[Parse JSON Response]

    Parse --> Validate[Validate Extractions]

    subgraph Validation["✅ Validation"]
        Validate --> ValidateFacts[Validate Facts<br/>Check field paths]
        Validate --> ValidateTopics[Validate Topics<br/>Category, Status, Valence]
        Validate --> ValidateForget[Check Forget Requests]
    end

    ValidateFacts --> ApplyFacts[Apply to User Story]
    ValidateTopics --> Dedup[Deduplicate Topics]
    ValidateForget --> DeleteData[Delete Requested Data]

    Dedup --> ApplyTopics[Apply to Mid-Term Memory]

    ApplyFacts --> Firestore[(Firestore)]
    ApplyTopics --> Firestore
    DeleteData --> Firestore

    style Localization fill:#1a1a2e,stroke:#64FFDA,color:#fff
    style Validation fill:#1e3a5f,stroke:#FFB38A,color:#fff
```

### Extraction Output Structure

```mermaid
flowchart LR
    subgraph Input["📥 Input"]
        Msg["'I'm Sarah, 24. I have a job<br/>interview at Google on Friday<br/>and I'm really nervous'"]
    end

    subgraph Output["📤 Extraction Result"]
        direction TB

        subgraph Facts["extractions[]"]
            F1["field: coreIdentity.name<br/>value: Sarah<br/>confidence: explicit"]
            F2["field: coreIdentity.age<br/>value: 24<br/>confidence: explicit"]
        end

        subgraph Topics["topicExtractions[]"]
            T1["topic: job interview anxiety<br/>context: Interview at Google Friday<br/>category: work<br/>status: active<br/>valence: negative"]
        end

        subgraph FollowUps["suggestedFollowUps[]"]
            SU1["occupation"]
            SU2["location"]
        end
    end

    Input --> Output

    style Facts fill:#1e3a5f,stroke:#64FFDA,color:#fff
    style Topics fill:#2d1f3d,stroke:#FFB38A,color:#fff
    style FollowUps fill:#3d2d1f,stroke:#64FFDA,color:#fff
```

---

## 5. Topic Lifecycle

State machine showing how topics evolve over time.

```mermaid
stateDiagram-v2
    [*] --> Active: User mentions problem

    Active --> Active: Mentioned again<br/>(mentionCount++)
    Active --> CheckIn: 3-7 days, no mention<br/>(AI checks in)
    Active --> Resolved: User says "it's done"
    Active --> Fading: No mention 30+ days

    CheckIn --> Active: User responds
    CheckIn --> Resolved: "It went well"
    CheckIn --> Resolved: "It was tough"
    CheckIn --> Fading: User ignores

    Resolved --> Visible: Stay visible 7 days
    Visible --> Pruned: After 7 days

    Fading --> Pruned: After 60 days total

    Pruned --> [*]: Deleted from DB

    note right of Active
        AI actively references
        in conversation
    end note

    note right of CheckIn
        AI proactively asks:
        "How did that go?"
    end note

    note right of Resolved
        outcomeTracked:
        success | difficult | neutral
    end note

    note right of Fading
        Only mention if
        user brings up
    end note
```

### Topic Priority Matrix

```mermaid
quadrantChart
    title Topic Priority for AI Behavior
    x-axis Low Recency --> High Recency
    y-axis Low Importance --> High Importance

    quadrant-1 Active Reference
    quadrant-2 Proactive Check-in
    quadrant-3 Background Context
    quadrant-4 Let Fade

    "Today's crisis": [0.95, 0.95]
    "Yesterday's worry": [0.85, 0.7]
    "3-day old interview": [0.5, 0.8]
    "Week-old resolved": [0.3, 0.4]
    "Month-old topic": [0.1, 0.3]
    "Recurring theme": [0.6, 0.9]
```

---

## 6. Context Assembly

How different contexts are loaded and combined.

```mermaid
flowchart TB
    subgraph Parallel["⚡ Parallel Loading"]
        direction LR
        Load1[getLocalizedStoryContext]
        Load2[getLocalizedRecentTopicsContext]
        Load3[getConversationProfile]
        Load4[Fetch 75 messages]
    end

    subgraph StoryContext["📋 User Story Context"]
        direction TB
        SC1["Name: Sarah"]
        SC2["Age: 24"]
        SC3["Work: nurse"]
        SC4["Triggers: crowds"]
        SC5["Past wins: handled interview"]
        SC6["---"]
        SC7["Curiosity hints:<br/>what drives them, their background"]
    end

    subgraph TopicsContext["⏳ Topics Context"]
        direction TB
        TC1["[today] sleep issues: work stress"]
        TC2["[3 days ago] interview anxiety → check in"]
        TC3["[yesterday] roommate: resolved (went well!)"]
    end

    subgraph ProfileContext["🎭 Conversation Profile"]
        direction TB
        PC1["Texting style: casual"]
        PC2["Emoji usage: moderate"]
        PC3["Message length: short"]
    end

    subgraph TemporalContext["🕐 Temporal Context"]
        direction TB
        TC4["Monday, Dec 23, 10:32 PM (late night)"]
        TC5["Session break: returning after 6 hours"]
    end

    Load1 --> StoryContext
    Load2 --> TopicsContext
    Load3 --> ProfileContext
    Load4 --> TemporalContext

    StoryContext --> Assembly[Context Assembly]
    TopicsContext --> Assembly
    ProfileContext --> Assembly
    TemporalContext --> Assembly

    Assembly --> SystemPrompt[Complete System Prompt]

    style Parallel fill:#1a1a2e,stroke:#64FFDA,color:#fff
    style Assembly fill:#1e3a5f,stroke:#FFB38A,color:#fff
```

---

## 7. System Prompt Construction

How the final system prompt is assembled with all components.

```mermaid
flowchart TB
    subgraph Base["📝 Base Prompt (languageConfig.ts)"]
        BP1[Personality & Voice]
        BP2[Therapeutic Guidelines]
        BP3[Curiosity Guidelines]
        BP4[Check-in Instructions]
    end

    subgraph Injections["💉 Context Injections"]
        direction TB
        I1["🕐 Temporal Context<br/>(prepended)"]
        I2["⏳ CURRENTLY ON THEIR MIND<br/>(topics context)"]
        I3["📋 WHAT YOU KNOW ABOUT THEM<br/>(user story context)"]
        I4["🎭 USER-SPECIFIC STYLE<br/>(conversation profile)"]
        I5["👴 Age Adjustment<br/>(if age >= 35)"]
    end

    subgraph FinalPrompt["📜 Final System Prompt"]
        direction TB
        FP1["temporal context + session break"]
        FP2["---"]
        FP3["base personality"]
        FP4["---"]
        FP5["CURRENTLY ON THEIR MIND:"]
        FP6["- topics with markers"]
        FP7["---"]
        FP8["WHAT YOU KNOW ABOUT THEM:"]
        FP9["- story fields"]
        FP10["- curiosity hints"]
        FP11["---"]
        FP12["USER-SPECIFIC STYLE:"]
        FP13["- casual/formal, emoji, length"]
        FP14["---"]
        FP15["IMPORTANT: avoid Gen Z slang..."]
    end

    Base --> Injections
    Injections --> FinalPrompt

    style Base fill:#1a1a2e,stroke:#64FFDA,color:#fff
    style Injections fill:#2d1f3d,stroke:#FFB38A,color:#fff
    style FinalPrompt fill:#1e3a5f,stroke:#64FFDA,color:#fff
```

### Prompt Injection Points

```mermaid
flowchart LR
    subgraph Template["Base Template"]
        T1["...personality..."]
        T2["{TOPICS_PLACEHOLDER}"]
        T3["WHAT YOU KNOW:"]
        T4["{USER_STORY_CONTEXT}"]
        T5["...guidelines..."]
    end

    subgraph Replacements["Replacements"]
        R1["Temporal context prepended"]
        R2["Topics section inserted"]
        R3["Story + hints injected"]
        R4["Profile appended"]
        R5["Age modifier appended"]
    end

    T1 --> R1
    T2 --> R2
    T4 --> R3
    T5 --> R4
    T5 --> R5
```

---

## 8. Validation Pipeline

Data quality checks before storage.

```mermaid
flowchart TB
    subgraph TopicValidation["🔍 Topic Extraction Validation"]
        Input[Raw AI Output] --> Check1{topic.length >= 2?}
        Check1 -->|No| Reject1[❌ Reject]
        Check1 -->|Yes| Check2{context.length >= 2?}

        Check2 -->|No| Reject2[❌ Reject]
        Check2 -->|Yes| Check3{Valid category?}

        Check3 -->|No| Fix1[Fix: category = 'other']
        Check3 -->|Yes| Check4{Valid status?}
        Fix1 --> Check4

        Check4 -->|No| Fix2[Fix: status = 'active']
        Check4 -->|Yes| Check5{Valid valence?}
        Fix2 --> Check5

        Check5 -->|No| Fix3[Remove valence]
        Check5 -->|Yes| Valid[✅ Valid Topic]
        Fix3 --> Valid
    end

    subgraph ValidValues["✅ Valid Enum Values"]
        Categories["categories:<br/>work, relationships, health,<br/>anxiety, life-event, other"]
        Statuses["statuses:<br/>active, resolved, fading"]
        Valences["valences:<br/>positive, negative, neutral"]
    end

    style TopicValidation fill:#1e3a5f,stroke:#64FFDA,color:#fff
    style ValidValues fill:#1a1a2e,stroke:#FFB38A,color:#fff
```

### Deduplication Logic

```mermaid
flowchart TB
    NewTopic[New Topic] --> CalcSim[Calculate Similarities]

    CalcSim --> TopicSim["Topic Similarity<br/>(Jaccard on words)"]
    CalcSim --> ContextSim["Context Similarity<br/>(Jaccard on words)"]

    TopicSim --> Decision{Match existing?}
    ContextSim --> Decision

    Decision -->|"topic >= 0.4<br/>AND context >= 0.2"| Merge[Merge with existing]
    Decision -->|"topic >= 0.6<br/>(regardless of context)"| Merge
    Decision -->|"topic < 0.4<br/>OR (topic < 0.6 AND context < 0.2)"| Create[Create new topic]

    Merge --> Update["Update existing:<br/>• lastMentionedAt = now<br/>• mentionCount++<br/>• context = new context"]

    Create --> Add["Add new topic:<br/>• generate ID<br/>• set timestamps<br/>• mentionCount = 1"]

    subgraph Example["Example: Different Contexts"]
        E1["Existing: 'job interview'<br/>context: 'Google on Friday'"]
        E2["New: 'job interview'<br/>context: 'Apple next month'"]
        E3["Result: KEPT SEPARATE<br/>(context similarity < 0.2)"]
    end

    style Example fill:#2d1f3d,stroke:#FFB38A,color:#fff
```

---

## 9. Localization Flow

How language affects the entire system.

```mermaid
flowchart TB
    Message[User Message] --> GetLang["Get language from<br/>message.metadata.language"]

    GetLang --> LangCode{languageCode}

    LangCode -->|"de-DE"| German[German Path]
    LangCode -->|"en-US"| English[English Path]

    subgraph German["🇩🇪 German Processing"]
        DE1[German extraction prompt]
        DE2[German stop words ~120]
        DE3[German forget mappings]
        DE4[German context labels<br/>Alter, Arbeit, etc.]
        DE5[German system prompt]
        DE6[German topic markers<br/>nachfragen lohnt sich]
        DE7[German curiosity hints]
    end

    subgraph English["🇺🇸 English Processing"]
        EN1[English extraction prompt]
        EN2[English stop words ~80]
        EN3[English forget mappings]
        EN4[English context labels<br/>Age, Work, etc.]
        EN5[English system prompt]
        EN6[English topic markers<br/>worth checking in]
        EN7[English curiosity hints]
    end

    German --> Response[AI Response in German]
    English --> Response2[AI Response in English]

    style German fill:#1e3a5f,stroke:#FFB38A,color:#fff
    style English fill:#1e3a5f,stroke:#64FFDA,color:#fff
```

### Localized Components Table

```mermaid
flowchart LR
    subgraph Components["Localized Components"]
        direction TB
        C1["Extraction Prompts"]
        C2["Stop Words"]
        C3["Forget Request Mappings"]
        C4["Context Labels"]
        C5["System Prompts"]
        C6["Topic Markers"]
        C7["Curiosity Hints"]
        C8["Crisis Messages"]
        C9["Time Labels (heute/today)"]
    end

    subgraph EN["English"]
        E1["Extract information..."]
        E2["the, a, an, I..."]
        E3["forget my name"]
        E4["Age:, Work:"]
        E5["you're anchor..."]
        E6["→ worth checking in"]
        E7["what they do for work"]
        E8["988 Suicide Lifeline"]
        E9["yesterday, 3 days ago"]
    end

    subgraph DE["German"]
        D1["Extrahiere Informationen..."]
        D2["der, die, das, ich..."]
        D3["vergiss meinen namen"]
        D4["Alter:, Arbeit:"]
        D5["du bist anchor..."]
        D6["→ nachfragen lohnt sich"]
        D7["was sie arbeiten"]
        D8["Telefonseelsorge"]
        D9["gestern, vor 3 Tagen"]
    end

    Components --> EN
    Components --> DE
```

---

## 10. Personalization Features

### Age-Appropriate Tone

```mermaid
flowchart TB
    StoryContext[User Story Context] --> AgeCheck{Contains age?}

    AgeCheck -->|No| DefaultTone[Default Gen Z tone<br/>ngl, lowkey, tbh OK]
    AgeCheck -->|Yes| ParseAge[Parse age value]

    ParseAge --> AgeValue{Age >= 35?}

    AgeValue -->|No| DefaultTone
    AgeValue -->|Yes| MatureTone[Mature tone modifier]

    subgraph MatureModifier["👴 Age 35+ Modifier"]
        M1["Avoid: ngl, lowkey, tbh,<br/>fr fr, no cap, slay"]
        M2["Use: Natural adult conversation"]
        M3["Still casual, just less internet-speak"]
    end

    MatureTone --> MatureModifier
    MatureModifier --> AppendPrompt[Append to system prompt]

    DefaultTone --> FinalPrompt[Final Prompt]
    AppendPrompt --> FinalPrompt

    style MatureModifier fill:#2d1f3d,stroke:#FFB38A,color:#fff
```

### Curiosity Hints System

```mermaid
flowchart TB
    Story[User Story] --> CheckMeta{Has extractionMeta?}

    CheckMeta -->|No| NoHints[No curiosity hints]
    CheckMeta -->|Yes| GetTopics[Get topicsToExplore]

    GetTopics --> HasTopics{Any topics?}

    HasTopics -->|No| NoHints
    HasTopics -->|Yes| Translate[Translate field names]

    subgraph Translation["🌍 Field → Natural Language"]
        T1["occupation → 'what they do for work'"]
        T2["location → 'where they live'"]
        T3["interests → 'what they're interested in'"]
        T4["copingActivities → 'what helps when stressed'"]
    end

    Translate --> Translation
    Translation --> Limit[Limit to 3 hints]
    Limit --> Format["Format: 'Natural things to learn<br/>when the moment feels right:<br/>X, Y, Z'"]

    Format --> AppendToStory[Append to story context]

    style Translation fill:#1e3a5f,stroke:#64FFDA,color:#fff
```

### Adaptive Language Style

```mermaid
flowchart TB
    Messages[User Messages] --> Collect{Collected 3+ messages?}

    Collect -->|No| Wait[Wait for more data]
    Collect -->|Yes| Sample[Sample messages]

    Sample --> Analyze[Analyze with Gemini]

    subgraph Analysis["🎭 Style Analysis"]
        A1["Texting style<br/>(casual/formal)"]
        A2["Emoji usage<br/>(none/light/moderate/heavy)"]
        A3["Message length<br/>(very short/short/medium/long)"]
        A4["Tone preference<br/>(supportive/direct/playful)"]
    end

    Analyze --> Analysis
    Analysis --> Store[Store in conversationProfile]

    Store --> Inject[Inject into system prompt]

    subgraph Timing["⏱️ Analysis Timing"]
        T1["Messages 1-3: Synchronous<br/>(wait for result)"]
        T2["Messages 4+: Async<br/>(fire & forget)"]
    end

    style Analysis fill:#1e3a5f,stroke:#64FFDA,color:#fff
    style Timing fill:#2d1f3d,stroke:#FFB38A,color:#fff
```

---

## 11. Crisis Detection

Safety-first architecture with immediate response.

```mermaid
flowchart TB
    Message[User Message] --> Detect[detectCrisisKeywords]

    Detect --> Check{Crisis keyword found?}

    subgraph Keywords["🚨 Crisis Keywords"]
        direction LR
        EN["English:<br/>kill myself, suicide,<br/>end my life, want to die,<br/>hurt myself, self harm"]
        DE["German:<br/>umbringen, suizid,<br/>selbstmord, sterben wollen,<br/>selbstverletzung, ritzen"]
    end

    Check -->|Yes| GetCrisis[getCrisisResponse]
    Check -->|No| Continue[Continue normal flow]

    GetCrisis --> Response[Crisis Response Message]

    subgraph CrisisResponse["📞 Crisis Response"]
        CR1["988 Suicide Lifeline (EN)"]
        CR2["Crisis Text Line: 741741"]
        CR3["Telefonseelsorge (DE)"]
        CR4["Notruf 112"]
    end

    Response --> CrisisResponse
    CrisisResponse --> Write[Write to Firestore]
    Write --> Flag["Flag conversation:<br/>hasCrisisMessages = true"]
    Flag --> Exit[EXIT - Skip AI call]

    Continue --> AI[Continue to Gemini]

    style Keywords fill:#5c1a1a,stroke:#ff6b6b,color:#fff
    style CrisisResponse fill:#1a5c3c,stroke:#64FFDA,color:#fff
```

---

## 12. Temporal Awareness

How time context is built and used.

```mermaid
flowchart TB
    subgraph Input["📥 Time Inputs"]
        UserLocal["message.metadata.userLocalTime<br/>(epoch timestamp)"]
        Timezone["message.metadata.userTimezone<br/>(e.g., 'America/New_York')"]
        MsgTimestamps["Message timestamps<br/>(Firestore)"]
    end

    subgraph Processing["⚙️ Temporal Processing"]
        Current[getCurrentContextTimestamp]
        TimeOfDay[getTimeOfDay]
        SessionBreak[detectSessionBreak]
        RelativeTime[getRelativeTimeForAI]
    end

    subgraph Output["📤 Temporal Outputs"]
        Context["'Monday, Dec 23, 2024 10:32 PM (late night)'"]
        Break["'returning after about 6 hours'"]
        Relative["'[3 hours ago]', '[yesterday]', '[last week]'"]
    end

    UserLocal --> Processing
    Timezone --> Processing
    MsgTimestamps --> Processing

    Processing --> Output

    Output --> Prompt[Injected into system prompt]

    subgraph TimeLabels["🕐 Time Labels"]
        TL1["just now (< 1 min)"]
        TL2["5 minutes ago"]
        TL3["2 hours ago"]
        TL4["yesterday at 3pm"]
        TL5["3 days ago"]
        TL6["last week"]
        TL7["2 weeks ago"]
    end

    style Input fill:#1a1a2e,stroke:#64FFDA,color:#fff
    style Output fill:#1e3a5f,stroke:#FFB38A,color:#fff
```

### Session Break Detection

```mermaid
flowchart LR
    LastMsg[Last Message Time] --> Diff{Time difference?}

    Diff -->|"< 4 hours"| NoBreak[No session break]
    Diff -->|"4-12 hours"| ShortBreak["'a few hours'"]
    Diff -->|"12-24 hours"| DayBreak["'since yesterday'"]
    Diff -->|"1-7 days"| WeekBreak["'a few days'"]
    Diff -->|"> 7 days"| LongBreak["'over a week'"]

    ShortBreak --> Inject["Inject into prompt:<br/>'User is returning after X'"]
    DayBreak --> Inject
    WeekBreak --> Inject
    LongBreak --> Inject
```

---

## 13. Data Flow Summary

Complete end-to-end data flow visualization.

```mermaid
flowchart TB
    subgraph UserAction["👤 User Action"]
        Send[Send Message]
    end

    subgraph Trigger["⚡ Firebase Trigger"]
        OnWrite[onDocumentWritten]
    end

    subgraph Validation["✅ Validation"]
        V1{Is user message?}
        V2{Has text?}
        V3{Crisis check}
    end

    subgraph DataLoading["📚 Parallel Data Loading"]
        L1[75 messages history]
        L2[User Story]
        L3[Mid-Term Topics]
        L4[Conversation Profile]
    end

    subgraph ContextBuilding["🔧 Context Building"]
        C1[Temporal context]
        C2[Topic context with markers]
        C3[Story context with hints]
        C4[Age adjustment]
        C5[Style profile]
    end

    subgraph PromptAssembly["📝 Prompt Assembly"]
        P1[Base personality]
        P2[+ Temporal]
        P3[+ Topics]
        P4[+ Story]
        P5[+ Style]
        P6[+ Age modifier]
    end

    subgraph AIGeneration["🤖 AI Generation"]
        Gemini[Gemini 2.5 Flash]
    end

    subgraph AsyncExtraction["🔍 Async Extraction"]
        E1[Parse message]
        E2[Extract facts → User Story]
        E3[Extract topics → Mid-Term]
        E4[Validate & dedupe]
    end

    subgraph Response["💬 Response"]
        Write[Write to Firestore]
        Display[Display to user]
    end

    UserAction --> Trigger
    Trigger --> Validation
    Validation --> DataLoading
    DataLoading --> ContextBuilding
    ContextBuilding --> PromptAssembly
    PromptAssembly --> AIGeneration
    AIGeneration --> Response

    Trigger -.->|"Fire & Forget<br/>(ALL messages)"| AsyncExtraction
    AsyncExtraction -.-> L2
    AsyncExtraction -.-> L3

    style UserAction fill:#1a1a2e,stroke:#64FFDA,color:#fff
    style DataLoading fill:#1e3a5f,stroke:#64FFDA,color:#fff
    style ContextBuilding fill:#2d1f3d,stroke:#FFB38A,color:#fff
    style PromptAssembly fill:#1e3a5f,stroke:#FFB38A,color:#fff
    style AIGeneration fill:#1a1a2e,stroke:#64FFDA,color:#fff
    style AsyncExtraction fill:#3d1f1f,stroke:#ff9999,color:#fff
```

---

## Component Dependencies

```mermaid
graph LR
    subgraph Core["Core Files"]
        Chat[chat.ts]
        Lang[languageConfig.ts]
    end

    subgraph UserStory["User Story Module"]
        Extract[extraction.ts]
        Context[context.ts]
        Prompts[prompts.ts]
        Types[types.ts]
    end

    subgraph Support["Support Modules"]
        Temporal[temporal.ts]
        Adaptive[adaptiveLanguage.ts]
    end

    Chat --> Lang
    Chat --> Extract
    Chat --> Context
    Chat --> Temporal
    Chat --> Adaptive

    Extract --> Prompts
    Extract --> Types
    Context --> Types

    Lang --> Context

    style Core fill:#1e3a5f,stroke:#64FFDA,color:#fff
    style UserStory fill:#2d1f3d,stroke:#FFB38A,color:#fff
    style Support fill:#1a1a2e,stroke:#64FFDA,color:#fff
```

---

## Quick Reference: What Triggers What

| User Action     | Immediate Effect      | Async Effect              |
| --------------- | --------------------- | ------------------------- |
| Send message    | AI response generated | Facts/topics extracted    |
| Mention name    | -                     | Stored in User Story      |
| Mention problem | -                     | Stored in Mid-Term Memory |
| Say "forget X"  | Acknowledged          | Data deleted              |
| Return after 6h | Session break noted   | -                         |
| Use casual tone | -                     | Style profile updated     |

---

## File Reference

| File                  | Purpose                     | Key Functions                                          |
| --------------------- | --------------------------- | ------------------------------------------------------ |
| `chat.ts`             | Main message handler        | `onMessageCreate`                                      |
| `languageConfig.ts`   | Prompts & crisis detection  | `getSystemPrompt`, `detectCrisisKeywords`              |
| `extraction.ts`       | Story & topic extraction    | `extractStoryFromMessage`, `applyTopicExtractions`     |
| `context.ts`          | Format contexts for prompts | `getLocalizedStoryContext`, `getRecentTopicsForPrompt` |
| `prompts.ts`          | Extraction prompt templates | `getExtractionPrompt`                                  |
| `types.ts`            | Type definitions            | `UserStory`, `MidTermMemory`, `RecentTopic`            |
| `temporal.ts`         | Time awareness              | `getRelativeTimeForAI`, `detectSessionBreak`           |
| `adaptiveLanguage.ts` | Style matching              | `analyzeUserStyle`, `getConversationProfile`           |

---

_This document provides a visual reference for understanding the chat system's architecture. For implementation details, see the source files and `user-story.md`._
