## Design Specification: Sports Podcast Generator

> Code name -> AloSphere

### Product Vision & Psychology

The interface should feel like a specialized, high-end terminal. It does one job exceptionally well. By exposing the "gears" of the process (elapsed time, precise statuses), we convert a long wait time from a frustrating delay into an engaging build process.

### User Journey

The flow supports both real-time generation and asynchronous consumption of the podcast library.

1. **Ingestion:** User drags and drops a raw commentary file. Immediate feedback on file validity.
    
2. **Commitment:** Upload begins instantly. A raw progress bar shows the upload to the GCS bucket.
    
3. **Synthesis (The Wait):** The system enters the polling phase. The UI displays an elapsed timer. We do not use spinning wheels; instead, we use a blinking cursor or static mechanical text (e.g., `STATUS: PIPELINE_ACTIVE`).
    
4. **Consumption (Real-time):** The player unlocks. Metadata (Sport, Match Title) fades in. The user can play the audio or download the resulting WAV file.
    
5. **Library / Feed:** A list of all previously processed podcasts is displayed. Users can browse historical generations, read overviews, and instantly play or download past files.
    

---

### Visual Identity (Industrial Minimalist)

- **App Background:** True Black (`#0D0D0D`)
    
- **Surface Areas (Cards/Dropzone):** Dark Charcoal (`#1A1A1A`) with subtle 1px borders (`#333333`)
    
- **Primary Text:** Off-White (`#E8E8E8`)
    
- **Muted Text:** Slate Gray (`#888888`)
    
- **Accent Color:** Muted Amber (`#F5A623`) or Terminal Green (`#4AF626`) for active states.
    
- **Typography:**
    
    - _Body/UI Elements:_ Inter (Grotesque sans, highly legible).
        
    - _Data/Status Labels:_ JetBrains Mono or IBM Plex Mono (Uppercase, tracking tightened).
        

---

### Key Component Behaviors

#### 1. File Dropzone (`<FileDropzone/>`)

- **Default State:** A dashed border box taking up 40% of the viewport height. Centered text: `DROP COMMENTARY AUDIO HERE`.
    
- **Hover/Drag State:** Border turns solid Accent Color. Background slightly lightens.
    
- **Validation:** Instantly rejects non-audio files with a monospace red error label.
    

#### 2. Progress & Status Tracker (`<ProgressTracker/>`)

- **Upload Phase:** A thin, hard-edged horizontal bar fills from left to right.
    
- **Processing Phase:** The progress bar becomes an indeterminate loading state (e.g., a solid block pulsing, or a scanning line).
    
- **Time Counter:** A monospace counter (`ELAPSED: 01:42`) increments every second. This is the most critical UI element to prevent user abandonment.
    
- **Phase Labels:** Cycles through backend stages using simple text: `UPLOADING -> TRANSCRIBING -> SYNTHESIZING -> READY`.
    

#### 3. Audio Player & Metadata (`<PodcastPlayer/>`)

- **Layout:** Appears only when processing is 100% complete. Replaces the Dropzone.
    
- **Header:** Displays the injected metadata dynamically (e.g., `FORMULA 1 | MONZA GRAND PRIX`).
    
- **Controls:** Brutalist play/pause buttons. No rounded corners.
    
- **Action:** A clear, secondary outline button to `DOWNLOAD .WAV`.

#### 4. Podcast Feed / Library (`<PodcastFeed/>`)

- **Layout:** A vertical list or grid situated below the main action area, displaying all previously generated podcasts.
    
- **Card Design:** Flat cards with the Dark Charcoal (`#1A1A1A`) background and 1px subtle borders.
    
- **Data:** Prominent monospace header for Sport & Title, with the grotesque sans body text for the generated overview snippet.
    
- **Interaction:** Each card contains its own minimalist play/pause controls and a download button, allowing users to play audio immediately without navigating away.