# movie-ticketing-system

## Overview

A full-stack movie ticketing system built for MUT CU(Murang'a University of Technology Christian Union) to enable users to purchase tickets online for theatrical productions and allows administrators to manage attendance using QR code scanning.

## Features

### User Features
- **Ticket Purchase**: Browse and buy movie/theater tickets with multiple ticket types
- **Multiple Payment Methods**: M-Pesa integration for seamless payments
- **Ticket Management**: Download and share tickets via email
- **Order Tracking**: Real-time order status updates

### Admin Features
- **QR Code Scanning**: Verify ticket authenticity at entry points
- **Attendance Tracking**: Record and manage event attendance
- **Dashboard**: Comprehensive admin dashboard for monitoring sales and attendance

## Tech Stack

### Frontend
- **React** (Vite) - Modern UI framework
- **Tailwind CSS** - Styling
- **JavaScript/JSX** - Client-side logic

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **Celery** - Asynchronous task processing
- **SMTP** - Email notifications

### Services
- **M-Pesa API** - Payment processing
- **QR Code Generation** - Ticket verification
- **PDF Generation** - Ticket downloads

## Project Structure

```
movie-ticketing-system/
├── backend/          # FastAPI backend service
├── frontend/         # React frontend application
└── README.md         # Project documentation
```

## Getting Started

Refer to [backend/README.md](backend/README.md) and frontend configuration files for setup instructions.

