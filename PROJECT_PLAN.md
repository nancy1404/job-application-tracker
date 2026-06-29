# Project Plan

## Project Overview
Job Application Tracker with AI Match Insights is a portfolio-focused full-stack web application for individual job seekers. It helps users organize job applications, save resume versions, store company and job information, create follow-up reminders, and generate AI-powered resume/job match insights.

The goal of the MVP is to deliver a polished, deployable product within three weeks while demonstrating modern full-stack development practices.

## Problem Statement
Job seekers often manage applications across spreadsheets, notes, and email threads. This makes it hard to track progress, remember follow-ups, and evaluate how well a resume matches a role.

This project solves that by combining application tracking, resume management, reminders, and AI-powered analysis in one simple dashboard.

## Target Users
- Students and recent graduates applying to internships or entry-level roles
- Early-career developers building a portfolio project
- Job seekers who want a simple personal tracker without using enterprise recruiting tools

## MVP Scope
The MVP includes:
- User authentication
- Job application CRUD
- Application stage/status tracking
- Resume text storage with multiple versions and a default resume
- Company/job detail storage
- AI match insights generated on demand
- Reminder creation and completion
- Dashboard analytics
- Search/filtering by status, company, or title

## v2 Enhancements
Potential future improvements include:
- PDF resume upload and parsing
- AI-generated tailored cover letters
- Calendar and email reminders
- Advanced analytics and trend reports
- Drag-and-drop Kanban boards
- Import from LinkedIn or CSV

## Success Criteria
The MVP will be considered successful if it:
- allows a user to sign up and manage applications securely
- supports saving and reviewing job descriptions and company info
- stores resume text versions and uses one as the default
- generates meaningful AI insights when the user clicks a button
- saves AI results for later review
- provides a simple dashboard with key metrics
- is deployed and usable on the web

## Final Tech Stack
- Frontend: Next.js App Router + TypeScript
- Backend: Next.js Route Handlers
- Database: PostgreSQL on Neon
- ORM: Prisma 7
- Auth: Auth.js
- AI: OpenAI API
- Styling: Tailwind CSS + shadcn/ui
- Validation: Zod + react-hook-form
- Charts: Recharts
- Deployment: Vercel
