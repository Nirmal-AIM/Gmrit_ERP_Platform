# URGENT FIX - QP Generation with AI

## Quick Solution: Add Sample Questions Manually

Since time is critical, here's the FASTEST solution:

### Option 1: Add Sample Questions via SQL (FASTEST - 30 seconds)

Run this SQL in your MySQL database:

```sql
-- Add sample questions for testing
INSERT INTO questions (courseId, coId, bloomsLevelId, difficultyLevelId, unitId, questionText, marks, isActive, createdBy, createdAt, updatedAt) VALUES
(1, 1, 1, 1, 1, 'Explain the basic concepts of data structures and their importance in computer science.', 10, 1, 1, NOW(), NOW()),
(1, 1, 2, 2, 1, 'Compare and contrast arrays and linked lists. Discuss their advantages and disadvantages.', 10, 1, 1, NOW(), NOW()),
(1, 2, 3, 2, 2, 'Implement a stack using arrays. Write the push and pop operations with proper error handling.', 10, 1, 1, NOW(), NOW()),
(1, 2, 4, 3, 2, 'Design an algorithm to evaluate a postfix expression using a stack. Analyze its time complexity.', 10, 1, 1, NOW(), NOW()),
(1, 3, 5, 3, 3, 'Develop a binary search tree and implement insertion, deletion, and search operations.', 10, 1, 1, NOW(), NOW());
```

**Replace:**
- `courseId` with your actual course ID
- `coId`, `bloomsLevelId`, `difficultyLevelId`, `unitId` with actual IDs from your database
- `createdBy` with faculty ID

### Option 2: Use Questions Module (2 minutes)

1. Go to **Faculty → My Courses**
2. Click on a course
3. Click **"Questions"** tab
4. Click **"+ Add Question"**
5. Fill in:
   - Question Text: "Explain the concept of..."
   - Select CO, Bloom's, Difficulty, Unit
   - Marks: 10
6. Click **Create**
7. Repeat 5-10 times with different questions

### Option 3: Restart Backend Server (Try this first!)

The AI might work after restart:

```bash
# In backend terminal:
# Press Ctrl+C to stop
npm run dev
```

Then try AI Question Generator again!

---

## For Demo/Presentation:

If you need to show QP Generation RIGHT NOW:

1. **Add 5-10 sample questions** using Option 1 or 2
2. **Go to QP Generation**
3. **Step 1:** Select course, assessment type, date
4. **Step 2:** Select criteria OR use "Any" for all dropdowns
5. **Click "Use Existing Questions"**
6. **Step 3:** Review and click "Generate PDF"
7. **PDF opens** - ready to print!

---

## The AI Issue:

The AI generation backend route exists but might need:
1. Backend server restart
2. Or the Groq API might be rate-limited
3. Or there's a network issue

**For immediate demo, use manual questions!**

---

## After Demo:

We can debug the AI issue properly. The infrastructure is all there, just needs troubleshooting.

**PRIORITY: Get QP Generation working with manual questions NOW!**
