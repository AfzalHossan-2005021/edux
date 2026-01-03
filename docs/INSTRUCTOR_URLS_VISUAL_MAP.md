# INSTRUCTOR COURSE CONTENT - VISUAL URL MAP

## 🗺️ Complete Navigation Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     EDUX INSTRUCTOR PANEL                        │
└─────────────────────────────────────────────────────────────────┘

                              /login
                                │
                                ▼
                    ┌──────────────────────┐
                    │  Login Page          │
                    │  (Verify Instructor) │
                    └──────────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │  /instructor/courses │
                    │  (List of Courses)   │
                    └──────────────────────┘
                                │
                    Click on a course
                                │
                                ▼
        ┌───────────────────────────────────────────┐
        │  /instructor/courses/[c_id]               │
        │  (COURSE DASHBOARD - Main Hub)            │
        │                                           │
        │  ┌─────────────────────────────────────┐  │
        │  │ Four Action Cards:                  │  │
        │  │                                     │  │
        │  │ 1. Manage Content      ⭐⭐⭐      │  │
        │  │ 2. View Structure      ⭐⭐      │  │
        │  │ 3. Edit Course         ⭐        │  │
        │  │ 4. View Analytics      ⭐        │  │
        │  └─────────────────────────────────────┘  │
        └───────────────────────────────────────────┘
                    │              │              │              │
         Click      │              │              │              │ Click
        "Manage     │              │              │              │ "View
        Content"   │              │              │              │ Structure"
                   │              │              │              │
                   ▼              ▼              ▼              ▼
        
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │ /instructor/     │  │ /instructor/     │  │ /instructor/     │
        │ courses/[c_id]/  │  │ courses/[c_id]/  │  │ courses/[c_id]/  │
        │ manage-content   │  │ edit             │  │ structure        │
        │                  │  │                  │  │                  │
        │ ⭐⭐⭐ MAIN     │  │ Edit Course      │  │ View All:        │
        │ ADD/EDIT/DELETE  │  │ Details          │  │ - Topics         │
        │ EVERYTHING       │  │ - Title          │  │ - Lectures       │
        │                  │  │ - Description    │  │ - Exams          │
        │ ✓ Add Topics     │  │ - Field          │  │ - Questions      │
        │ ✓ Add Lectures   │  │ - Seats          │  │ - Statistics     │
        │ ✓ Add Exams      │  │ - Approval       │  │                  │
        │ ✓ Add Questions  │  │                  │  │ [Edit Button]    │
        │ ✓ Edit All       │  │ [Save Button]    │  │ ↓                │
        │ ✓ Delete All     │  │                  │  │ Goes back to     │
        │ ✓ View Stats     │  │                  │  │ manage-content   │
        │ ✓ Form Validation│  │                  │  │                  │
        │ ✓ Error Messages │  │                  │  │                  │
        └──────────────────┘  └──────────────────┘  └──────────────────┘
                 │                     │                      │
                 │                     │                      │
           [Edit Button] ─────────────→│←─────────────────────┘
                                       │
                                       ▼
                         Return to /instructor/
                         courses/[c_id]
                         (Dashboard)
```

---

## 📊 Content Management Hierarchy

```
/instructor/courses/[c_id]/manage-content
│
├── 📚 TOPICS
│   ├── [Add Topic Button]
│   │   ├── Topic Name (required)
│   │   ├── Serial Number (optional)
│   │   └── Weight (optional)
│   │
│   └── Topic 1 (Expandable)
│       │
│       ├── 📹 LECTURES
│       │   ├── [Add Lecture Button]
│       │   │   ├── Description (required)
│       │   │   ├── Video URL (optional)
│       │   │   ├── Weight (optional)
│       │   │   └── Serial (optional)
│       │   │
│       │   ├── Lecture 1
│       │   │   ├── [Edit Button]
│       │   │   └── [Delete Button]
│       │   │
│       │   └── Lecture 2
│       │       ├── [Edit Button]
│       │       └── [Delete Button]
│       │
│       └── 📋 EXAMS
│           ├── [Add Exam Button]
│           │   ├── Question Count (required)
│           │   ├── Total Marks (required)
│           │   ├── Duration (optional)
│           │   └── Weight (optional)
│           │
│           └── Exam 1 (Expandable)
│               │
│               ├── [Add Question Button]
│               │   ├── Question Text (required)
│               │   ├── 4 Options (required)
│               │   ├── Correct Answer (required)
│               │   └── Marks (optional)
│               │
│               ├── Question 1
│               │   ├── [Edit Button]
│               │   └── [Delete Button]
│               │
│               └── Question 2
│                   ├── [Edit Button]
│                   └── [Delete Button]
│
└── 📈 STATISTICS
    ├── Total Topics: X
    ├── Total Lectures: Y
    ├── Total Exams: Z
    └── Total Questions: W
```

---

## 🎯 URL Decision Tree

```
START: Are you an Instructor?
│
├─ NO  → /login (Login first)
│
└─ YES → /instructor/courses (View my courses)
         │
         ├─ No courses? → Create one first
         │
         └─ SELECT A COURSE
            │
            ├─ Want to ADD/EDIT/DELETE content?
            │  │
            │  └─→ /instructor/courses/[c_id]/manage-content ⭐⭐⭐
            │      (Use CourseContentManager)
            │      ├─ Add topics
            │      ├─ Add lectures
            │      ├─ Add exams
            │      └─ Add questions
            │
            ├─ Want to VIEW all content?
            │  │
            │  └─→ /instructor/courses/[c_id]/structure
            │      (See complete structure)
            │      ├─ All topics
            │      ├─ All lectures
            │      ├─ All exams
            │      └─ Statistics
            │
            ├─ Want to EDIT course info?
            │  │
            │  └─→ /instructor/courses/[c_id]/edit
            │      (Change course details)
            │
            └─ Want to see STUDENT PROGRESS?
               │
               └─→ /instructor/courses/[c_id]/analytics
                   (View analytics)
```

---

## 🔗 URL Patterns

### Pattern 1: Dynamic Course ID
```
/instructor/courses/[c_id]/...

Replace [c_id] with actual course ID:
- /instructor/courses/1/manage-content
- /instructor/courses/5/manage-content
- /instructor/courses/99/manage-content
```

### Pattern 2: Sections
```
/instructor/courses/[c_id]/SECTION

Sections available:
- manage-content  ← Main content management
- structure       ← View course structure
- edit            ← Edit course info
- analytics       ← View analytics
```

---

## 📱 Mobile View (Same URLs)

All URLs work on mobile devices:
```
Mobile → /instructor/courses/[c_id]/manage-content
         (Responsive design with Tailwind CSS)
         
         ✓ Touch-friendly buttons
         ✓ Expandable/collapsible sections
         ✓ Scroll-friendly layout
```

---

## 🔒 Access Control

```
URL: /instructor/courses/[c_id]/manage-content

Security Checks:
├─ Is user logged in?
│  └─ No  → Redirect to /login
│
├─ Does user have i_id (Instructor ID)?
│  └─ No  → Redirect to /login
│
├─ Is course ID valid?
│  └─ No  → Redirect to /instructor/courses
│
└─ Does instructor own this course?
   └─ No  → Redirect to /instructor/courses
   
✓ All checks pass → Allow access to /manage-content
```

---

## 📝 File Mappings

```
URL                              File Path
────────────────────────────────────────────────────────────────
/instructor/courses/[c_id]       
→ /pages/instructor/courses/[c_id]/index.js

/instructor/courses/[c_id]/manage-content
→ /pages/instructor/courses/[c_id]/manage-content.js

/instructor/courses/[c_id]/structure
→ /pages/instructor/courses/[c_id]/structure.js
```

---

## 🌟 Key Components Used

```
URL Path                         Component Used
────────────────────────────────────────────────────────────────
/instructor/courses/[c_id]       
→ Dashboard Page
  (No external component)

/instructor/courses/[c_id]/manage-content
→ CourseContentManager.js
  (Main component for all content operations)

/instructor/courses/[c_id]/structure
→ Structure Page
  (Custom page showing hierarchy)
```

---

## ✨ Summary

```
┌────────────────────────────────────────────┐
│   INSTRUCTOR COURSE CONTENT URLS          │
├────────────────────────────────────────────┤
│                                            │
│  Main Hub:                                 │
│  /instructor/courses/[c_id]               │
│                                            │
│  Content Management (MOST USED): ⭐⭐⭐   │
│  /instructor/courses/[c_id]/manage-content│
│                                            │
│  View Structure:                           │
│  /instructor/courses/[c_id]/structure     │
│                                            │
│  Edit Course:                              │
│  /instructor/courses/[c_id]/edit          │
│                                            │
│  View Analytics:                           │
│  /instructor/courses/[c_id]/analytics     │
│                                            │
└────────────────────────────────────────────┘
```

---

**REMEMBER:** 
- Only instructors can access these URLs
- Replace `[c_id]` with actual course ID
- Most important URL: `/instructor/courses/[c_id]/manage-content`
- That's where you add topics, lectures, exams, and questions! 🎓
