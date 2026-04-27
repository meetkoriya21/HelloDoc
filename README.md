# MERN Doctor Appointment Booking - Updated Doctor Self-Registration Flow

## Overview

This project is a MERN stack doctor appointment booking system. The recent update introduces a two-step doctor self-registration flow with admin approval.

## New Doctor Registration Flow

### Step 1: Basic Signup
- Doctors register with name, email, and password.
- Account is created with role='doctor' and status='pending'.
- Doctor receives a token and is redirected to complete profile.

### Step 2: Profile Completion
- Doctors fill in speciality, education, address, experience, fees, about, license number.
- Upload license document and profile picture.
- Profile is saved with status='pending' until admin approval.

### Admin Approval
- Admin can view pending doctor requests.
- Admin can approve or reject doctors with reason.
- Doctors receive email notifications on approval or rejection.
- Only approved doctors can login.

## Backend Changes

- Updated doctor model with new fields: role, status, license info, profile picture.
- New auth endpoints for doctor registration, profile completion, and login.
- Admin endpoints for listing pending doctors, approving, and rejecting.
- Email notifications using nodemailer.
- File uploads handled with multer and Cloudinary.

## Frontend Changes

- Login page updated to support doctor registration and login.
- New DoctorRegisterStep2 page for profile completion.
- Admin dashboard includes Pending Requests page for doctor approvals.
- Sidebar updated with link to Pending Requests.

## Running the Project

- Install dependencies including nodemailer.
- Start backend and frontend servers.
- Use the new registration flow for doctors.
- Admin can manage doctor approvals via dashboard.

## Testing

- Test doctor registration step 1 and 2.
- Test doctor login with different statuses.
- Test admin approval and rejection flows.
- Verify email notifications.
- Verify file uploads to Cloudinary.

## Notes

- JWT tokens are used for authentication.
- Ensure environment variables for SMTP and Cloudinary are set.
- Update environment variables as needed for email and file storage.

This README will be updated with further instructions as needed.
