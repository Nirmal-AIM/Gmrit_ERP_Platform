# Final Setup Step - Add Route to App.jsx

## ✅ Almost Done! Just One Manual Edit Needed:

### Edit File: `frontend/src/App.jsx`

**Find line 165** (after the `faculty/qp-generation` route)

**Add these lines:**

```jsx
<Route path="faculty/ai-questions" element={
    <ProtectedRoute requiredRole="Faculty">
        <AIQuestionGenerator />
    </ProtectedRoute>
} />
```

### Complete Code Block (lines 161-170):

```jsx
<Route path="faculty/qp-generation" element={
    <ProtectedRoute requiredRole="Faculty">
        <FacultyQPGeneration />
    </ProtectedRoute>
} />
<Route path="faculty/ai-questions" element={
    <ProtectedRoute requiredRole="Faculty">
        <AIQuestionGenerator />
    </ProtectedRoute>
} />
<Route path="faculty/course-plugins" element={
    <ProtectedRoute requiredRole="Faculty">
        <FacultyCoursePlugins />
    </ProtectedRoute>
} />
```

---

## That's It!

After adding this route, the AI Question Generator will be fully functional!

Faculty can navigate to:
**Faculty → 🤖 AI Question Generator**

And start generating questions with AI! 🚀
