# Logo Update Instructions

## What Was Done

All text-based "HL" logos throughout the HireLens application have been replaced with image references to the new HireLens logo.

## Updated Components

The following components now use the new logo image:

1. **Navbar** (`hire-lens-frontend/src/components/layouts/Navbar.jsx`)
   - Main navigation logo (clickable, navigates to dashboard)
   - Height: 8 (mobile) / 10 (desktop)

2. **Footer** (`hire-lens-frontend/src/components/layouts/Footer.jsx`)
   - Brand section logo
   - Height: 12 (mobile) / 14 (desktop)

3. **Login Page** (`hire-lens-frontend/src/features/auth/login/Login.jsx`)
   - Header logo above "Welcome back"
   - Height: 20

4. **Signup Page** (`hire-lens-frontend/src/features/auth/signup/Signup.jsx`)
   - Header logo above "Create your workspace"
   - Height: 20

## Required Action

**IMPORTANT:** You need to save the HireLens logo image to complete this update:

1. Save the logo image (the one with documents, magnifying glass, checkmark, and "HIRELENS" text) as:
   ```
   hire-lens-frontend/public/images/hirelens-logo.png
   ```

2. The logo should be:
   - PNG format with transparent background (recommended)
   - High resolution (at least 400px width recommended)
   - The full logo including the icon and "HIRELENS" text

## Logo Specifications

The logo features:
- Stack of documents/resumes (navy blue)
- Magnifying glass with green checkmark overlay
- Blue, green, and gold color scheme
- "HIRELENS" text in navy blue below the icon

## Testing

After saving the logo image, test the following pages:
- Login page (`/login`)
- Signup page (`/signup`)
- Dashboard (navbar logo)
- Any page with footer

The logo should appear properly sized and clickable (in navbar) on all pages.

## Fallback

If the logo image is not found, browsers will show a broken image icon. Make sure to save the image file before deploying or testing.
