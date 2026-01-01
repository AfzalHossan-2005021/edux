/**
 * Zod validation schemas for all API inputs
 * Provides type-safe validation for request bodies
 */

import { z } from 'zod';

// ==================== Auth Schemas ====================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password must be less than 100 characters'),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  dob: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), 'Invalid date format'),
  gender: z
    .enum(['M', 'F', 'O'], { errorMap: () => ({ message: 'Gender must be M, F, or O' }) })
    .optional(),
});

export const instructorSignupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  subject: z
    .string()
    .min(2, 'Subject must be at least 2 characters')
    .max(100, 'Subject must be less than 100 characters'),
});

// ==================== Course Schemas ====================

export const courseIdSchema = z.object({
  c_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid course ID'),
});

export const enrollSchema = z.object({
  u_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid user ID'),
  c_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid course ID'),
});

export const rateCourseSchema = z.object({
  u_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid user ID'),
  c_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid course ID'),
  rating: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => val >= 1 && val <= 5, 'Rating must be between 1 and 5'),
  review: z
    .string()
    .max(500, 'Review must be less than 500 characters')
    .optional(),
});

// ==================== User Schemas ====================

export const userIdSchema = z.object({
  u_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid user ID'),
});

export const studentIdSchema = z.object({
  s_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid student ID'),
});

// ==================== Wishlist Schemas ====================

export const wishlistSchema = z.object({
  u_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid user ID'),
  c_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid course ID'),
});

// ==================== Exam Schemas ====================

export const examIdSchema = z.object({
  e_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid exam ID'),
});

export const updateMarkSchema = z.object({
  s_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid student ID'),
  e_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid exam ID'),
  score: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Score must be a non-negative number'),
});

// ==================== Lecture Schemas ====================

export const lectureIdSchema = z.object({
  l_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid lecture ID'),
});

export const lectureContentSchema = z.object({
  l_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid lecture ID'),
  s_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid student ID'),
});

// ==================== Course Content Schemas ====================

export const userCourseContentSchema = z.object({
  u_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid user ID'),
  c_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid course ID'),
});

export const courseSuggestionSchema = z.object({
  s_id: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, 'Invalid student ID'),
});

// ==================== Validation Helper ====================

/**
 * Validate request body against a schema
 * @param {object} schema - Zod schema
 * @param {object} data - Request body data
 * @returns {object} { success: boolean, data?: object, errors?: string[] }
 */
export const validateRequest = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

/**
 * Middleware wrapper for validation
 * @param {object} schema - Zod schema
 * @returns {function} Validation middleware
 */
export const withValidation = (schema) => {
  return (handler) => async (req, res) => {
    const validation = validateRequest(schema, req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    req.validatedBody = validation.data;
    return handler(req, res);
  };
};

export default {
  loginSchema,
  signupSchema,
  instructorSignupSchema,
  courseIdSchema,
  enrollSchema,
  rateCourseSchema,
  userIdSchema,
  studentIdSchema,
  wishlistSchema,
  examIdSchema,
  updateMarkSchema,
  lectureIdSchema,
  lectureContentSchema,
  userCourseContentSchema,
  courseSuggestionSchema,
  validateRequest,
  withValidation,
};
