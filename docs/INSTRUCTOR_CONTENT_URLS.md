# Instructor Course Content - URL Map

## 🔐 Access Control

Only **Instructors** can access these URLs. The system checks:
- User must be logged in
- User must have `i_id` (Instructor ID) in secure storage
- Course must belong to the instructor

---

## 📍 Main URLs

### 1. **Instructor Courses List**
```
/instructor/courses
```
- View all courses created by the instructor
- Click on a course to access its dashboard

---

### 2. **Course Dashboard** ⭐ (Main Hub)
```
/instructor/courses/[c_id]
/instructor/courses/1        <- Example with course ID 1
```

**Access from here:**
- ✅ Manage Content
- ✅ View Structure
- ✅ Edit Course Settings
- ✅ View Analytics

---

### 3. **Manage Content** (Most Important)
```
/instructor/courses/[c_id]/manage-content
/instructor/courses/1/manage-content    <- Example
```

**What you can do:**
- ✅ Create topics
- ✅ Add lectures with video URLs
- ✅ Create exams
- ✅ Add multiple choice questions
- ✅ Edit existing content
- ✅ Delete topics/lectures/exams
- ✅ View course statistics

**Component Used:** `CourseContentManager`

---

### 4. **View Course Structure**
```
/instructor/courses/[c_id]/structure
/instructor/courses/1/structure    <- Example
```

**What you can see:**
- ✅ Complete course hierarchy
- ✅ All topics with lectures and exams
- ✅ Course statistics (total topics, lectures, exams, questions)
- ✅ Details of each lecture and exam
- ✅ Button to edit content

---

## 🚀 How to Navigate

### Step 1: Login
```
/login
```
- Login with instructor credentials

### Step 2: Go to Your Courses
```
/instructor/courses
```
- See list of all your courses

### Step 3: Select a Course
Click on any course → Goes to:
```
/instructor/courses/[c_id]    <- Course Dashboard
```

### Step 4: Manage Content
From the dashboard, click **"Manage Content"** button → Goes to:
```
/instructor/courses/[c_id]/manage-content
```

---

## 📊 Complete URL Structure

```
/instructor/
├── courses/
│   ├── [c_id]/                          (Dashboard)
│   │   ├── manage-content/              (Edit & Add Content)
│   │   ├── structure/                   (View Structure)
│   │   ├── edit/                        (Edit Course Info)
│   │   └── analytics/                   (View Analytics)
│   └── (List all courses)
└── (Other instructor features)
```

---

## 🎯 Quick Links by Feature

### Want to **Add Topics**?
```
Go to: /instructor/courses/[c_id]/manage-content
Click: "Add Topic" button
```

### Want to **Add Lectures**?
```
Go to: /instructor/courses/[c_id]/manage-content
Select: A topic
Click: "Add Lecture" button
```

### Want to **Create Exams**?
```
Go to: /instructor/courses/[c_id]/manage-content
Select: A topic
Click: "Add Exam" button
```

### Want to **Add Questions to Exam**?
```
Go to: /instructor/courses/[c_id]/manage-content
Select: An exam
Click: "Add Question" button
(Questions are added within the Manage Content interface)
```

### Want to **View Course Structure**?
```
Go to: /instructor/courses/[c_id]
Click: "View Structure" button
OR
Direct URL: /instructor/courses/[c_id]/structure
```

---

## 🔑 Key Files

| Page | File | URL |
|------|------|-----|
| Course Dashboard | `pages/instructor/courses/[c_id]/index.js` | `/instructor/courses/[c_id]` |
| Manage Content | `pages/instructor/courses/[c_id]/manage-content.js` | `/instructor/courses/[c_id]/manage-content` |
| View Structure | `pages/instructor/courses/[c_id]/structure.js` | `/instructor/courses/[c_id]/structure` |

---

## 📝 Example URLs with Real Course ID

If you have a course with **ID = 5**:

```
Dashboard:       http://localhost:3000/instructor/courses/5
Manage Content:  http://localhost:3000/instructor/courses/5/manage-content
View Structure:  http://localhost:3000/instructor/courses/5/structure
```

---

## 🛡️ Security Features

✅ **Must be logged in** - Redirects to `/login` if not authenticated  
✅ **Must be instructor** - Checks for `i_id` in secure storage  
✅ **Must own course** - Only sees own courses  
✅ **No direct access** - Cannot access other instructor's courses  

---

## 📱 Page Features

### Manage Content Page
```
CourseContentManager Component
│
├── Add Topics
│   ├── Topic Name
│   ├── Serial Number (optional)
│   └── Weight (optional)
│
├── For Each Topic
│   ├── Add Lectures
│   │   ├── Description
│   │   ├── Video URL
│   │   └── Weight & Serial
│   │
│   └── Add Exams
│       ├── Question Count
│       ├── Total Marks
│       ├── Duration
│       └── For Each Exam: Add Questions
│           ├── Question Text
│           ├── 4 Options
│           ├── Correct Answer
│           └── Marks
│
└── View Course Statistics
    ├── Total Topics
    ├── Total Lectures
    ├── Total Exams
    └── Total Questions
```

---

## ✨ User Flow

```
Login (/login)
    ↓
Courses List (/instructor/courses)
    ↓
Select Course → Dashboard (/instructor/courses/[c_id])
    ↓
    ├→ Manage Content (/instructor/courses/[c_id]/manage-content) ⭐⭐⭐
    │   ├→ Add Topics
    │   ├→ Add Lectures
    │   ├→ Add Exams
    │   └→ Add Questions
    │
    ├→ View Structure (/instructor/courses/[c_id]/structure)
    │   ├→ See all topics
    │   ├→ See all lectures
    │   └→ See all exams
    │
    ├→ Edit Course Settings
    │
    └→ View Analytics
```

---

## 🎓 What Instructors Can Do

| Feature | URL | Component |
|---------|-----|-----------|
| Create Topics | `/instructor/courses/[c_id]/manage-content` | CourseContentManager |
| Add Lectures | `/instructor/courses/[c_id]/manage-content` | CourseContentManager |
| Create Exams | `/instructor/courses/[c_id]/manage-content` | CourseContentManager |
| Add Questions | `/instructor/courses/[c_id]/manage-content` | CourseContentManager |
| View Structure | `/instructor/courses/[c_id]/structure` | CourseStructure Page |
| Edit Content | `/instructor/courses/[c_id]/manage-content` | CourseContentManager |
| Delete Content | `/instructor/courses/[c_id]/manage-content` | CourseContentManager |
| View Stats | `/instructor/courses/[c_id]/manage-content` | CourseContentManager |

---

## 🚀 Getting Started

1. **Login as Instructor**
   ```
   Navigate to: /login
   Enter instructor credentials
   ```

2. **Go to Your Courses**
   ```
   Navigate to: /instructor/courses
   ```

3. **Open Course Management**
   ```
   Click on a course
   You're now at: /instructor/courses/[c_id]
   ```

4. **Start Managing Content**
   ```
   Click "Manage Content" button
   You're now at: /instructor/courses/[c_id]/manage-content
   This is where all the magic happens! ✨
   ```

---

## 📞 Troubleshooting

**Q: Can't access /instructor/courses/[c_id]/manage-content?**
- A: Make sure you're logged in and have instructor permissions (`i_id`)

**Q: Course doesn't appear in list?**
- A: The course must be created by you (your i_id must match)

**Q: Changes not saving?**
- A: Check browser console for errors, ensure API endpoints are working

**Q: Can't see the Content Manager component?**
- A: Make sure CourseContentManager.js is in `/components/`

---

**Last Updated:** January 2, 2026  
**Status:** All URLs Ready to Use ✅
