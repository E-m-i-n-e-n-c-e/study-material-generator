# **Technical Assessment Brief**

---

## **Scenario**

You are contributing to an **AI-powered learning platform**. One of the features extracts YouTube transcripts and transforms them into structured study materials for students.

Your challenge is to **design and build a standalone component** that improves the way transcripts are extracted, processed, and displayed. This test is designed to evaluate your **technical depth, problem-solving approach, and ability to deliver under time constraints**.

---

## **Your Task**

Build a component that:

1. Accepts a **YouTube video URL** as input.
2. Extracts the transcript.
3. Processes the transcript into **Enhanced Study Material**.
4. Displays the results in a clean, structured format.

**Note:** This is a standalone task. You do not need to connect to Blinkgrid’s existing platform. If you require clarification on formatting or user flow, we can provide **screenshots of a partially worked version** instead of full access.

---

## **Required Features**

### **1. Transcript Extraction**

- Input field for YouTube URL.
- Extract transcript using YouTube API or a library.
- Handle missing/unavailable transcripts gracefully.
- Show loading states during extraction.

### **2. Content Processing**

Transform the raw transcript into **Enhanced Study Material**:

- Divide content into **logical sections/topics**.
- Add **clear topic headings**.
- Highlight **key concepts**.
- Use **bullet points** for important details.
- Provide a **summary section**.
- (Optional) Include **timestamps** (clickable if possible).

### **3. Output Format: Enhanced Study Material**

Your processed notes should follow this structure:

### **Example Output Structure**

# **Enhanced Study Material: *[Video Title]***

### **Overview**

[Brief summary – 2–3 sentences]

---

### **Concept 1: [Topic Name]**

**Timestamp:** [00:00]

- Main Point 1
- Main Point 2

**Why This Matters:** [Explanation]

---

### **Concept 2: [Topic Name]**

**Timestamp:** [05:30]

- Main Point 1
- Main Point 2

**Key Takeaway:** [Summary]

---

### **Summary**

[Overall summary of content]

### **Study Tips**

- [Tip 1]
- [Tip 2]

### **Further Exploration**

- [Related topic 1]
- [Related topic 2]

---

### **4. User Interface**

- Simple, clean input form.
- Loading indicator.
- Error messages for invalid URLs or failures.
- Well-formatted, readable output.
- Basic responsive design (desktop + mobile).

---

## **Technical Requirements**

- **Tech Stack:** Your choice (React, Vue, Vanilla JS for frontend; Node.js/Python backend if needed).
- **Must Include:**
    
    ✓ Input validation
    
    ✓ Error handling
    
    ✓ Loading states
    
    ✓ Clean, maintainable code with comments
    
    ✓ README with setup instructions
    
- **Nice to Have (Bonus Points):**
    - AI/LLM integration to enhance summaries.
    - Copy-to-clipboard functionality.
    - Export options (Markdown/PDF).
    - Customizable summary (length/detail).
    - Unit tests.
    - TypeScript.

---

## **Constraints**

- Should run **locally** (provide setup instructions).
- Must work with any **public YouTube video with transcripts**.
- No database or authentication required (stateless component).

---

## **Deliverables**

1. **Working Code** – GitHub repo or ZIP file.
2. **README** – including:
    - Setup instructions
    - Dependencies
    - How to run
    - Notes on API keys (if needed)
3. **Brief Documentation** – short write-up (1–2 pages) covering:
    - Approach taken
    - Technologies used
    - Challenges faced
    - Improvements you’d add with more time