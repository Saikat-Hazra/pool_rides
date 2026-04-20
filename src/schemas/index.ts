import { z } from 'zod'

export const LocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  collegeId: z.string().min(1, 'Select your college'),
})

export const LoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const OnboardingSchema = z.object({
  homeArea: z.string().min(1, 'Select your home area'),
  yearOfStudy: z.coerce.number().min(1).max(6),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  commuteMode: z.enum(['cab', 'auto', 'bike', 'any']).default('any'),
  preferredDays: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).min(1, 'Select at least one day'),
  preferredTimeStart: z.string().min(1, 'Select a start time'),
  preferredTimeEnd: z.string().min(1, 'Select an end time'),
  destinationLabel: z.string().min(1, 'Enter your destination'),
})

export const CreatePoolSchema = z.object({
  originLabel: z.string().min(1, 'Select an origin area'),
  originCoords: LocationSchema.optional(),
  destinationLabel: z.string().min(1, 'Enter destination'),
  destCoords: LocationSchema.optional(),
  pickupNotes: z.string().optional(),
  dropNotes: z.string().optional(),
  date: z.string().optional(),
  recurrenceDays: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).optional(),
  timeWindowStart: z.string().min(1, 'Select start time'),
  timeWindowEnd: z.string().min(1, 'Select end time'),
  estimatedTotalFare: z.coerce.number().min(1, 'Enter an estimated fare'),
  seatsTotal: z.coerce.number().min(1).max(10),
  visibilityType: z.enum(['public', 'invite_only', 'campus_only']).default('public'),
  womenOnly: z.boolean().default(false),
  verifiedOnly: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
})

export const ReportSchema = z.object({
  reason: z.string().min(10, 'Please provide more details (min 10 characters)'),
  targetUserId: z.string().optional(),
  poolId: z.string().optional(),
})

export const ProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  homeArea: z.string().min(1, 'Select your home area'),
  yearOfStudy: z.coerce.number().min(1).max(6).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  phone: z.string().optional(),
})

export type RegisterFormData = z.infer<typeof RegisterSchema>
export type LoginFormData = z.infer<typeof LoginSchema>
export type OnboardingFormData = z.infer<typeof OnboardingSchema>
export type CreatePoolFormData = z.infer<typeof CreatePoolSchema>
export type ReportFormData = z.infer<typeof ReportSchema>
export type ProfileFormData = z.infer<typeof ProfileSchema>
