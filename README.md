# AI-Driven Plant Disease Detection System

## Project Overview

This project is an intelligent tool designed to integrate AI-based disease detection into precision agriculture. It leverages real-time plant image analysis and deep learning techniques, processes this information using a pre-trained vision model for disease classification, and organizes the analysis in a MongoDB database. The results are accessible via a user-friendly dashboard, enabling farmers and agricultural experts to make informed decisions about plant health and disease management.

## Features

### Image Capture

- Users can upload images of plant leaves through the web interface for analysis.
- Automated preprocessing of images to enhance accuracy.

### Disease Detection

- Real-time plant disease identification using a pre-trained deep learning model hosted on Hugging Face.

### Session Management

- Organized session-wise data storage to track plant health over time.

### Data Storage

- **Cloudinary** is used for storing images, ensuring scalable and efficient image hosting.
- The **URL** of each image uploaded to Cloudinary is stored in **MongoDB** alongside other metadata for easy access and retrieval.

### User Dashboard

- A React-powered interface displaying disease insights, session histories, and overall trends to assist in decision-making.

## Tech Stack

### Frontend

- **React.js**: For building dynamic user interfaces.
- **CSS**: Used for styling and layout design.
- **Pages**: Home page, image upload page, diagnostic page, history page, profile page, FAQ, and blog pages.

### Backend & Web Server

- **Node.js**: Handles server-side logic.
- **Express.js**: Serves as the web server.
- **User Authentication**: Manages authentication for secure access.
- **Handles requests**: Processes incoming requests from the frontend, forwards image data to the AI model for analysis, and retrieves/stores results in the database.

### Database

- **MongoDB**: Stores user profiles, session details, disease analysis results, and image URLs efficiently.

### AI Model

- **Pretrained CNN Model (ozair23/mobilenet_v2_1.0_224-finetuned-plantdisease)**: A convolutional neural network (CNN) model hosted on Hugging Face, fine-tuned for plant disease classification. This model leverages CNN-based feature extraction, making it well-suited for identifying plant diseases in real-time.

Based on its training dataset, this model takes plant images as input and predicts the disease category, enabling precise and real-time disease detection.

## Interfaces Developed

- **Homepage**: Serves as an introduction to our website.
- **Login/Registration Interface**: For user account creation and login.
- **Dashboard and Image Upload Interface**: Displays a dashboard and allows users to upload images of plants for disease diagnosis.
- **Results Interface**: Displays the diagnostic result, including the identified disease and treatment recommendations.
- **History Interface**: Displays past diagnoses and actions taken.

## Installation Instructions

After cloning the repository and installing the necessary node modules using `npm install` in both the **frontend** and **backend** terminals, follow these steps:

1. **Start the backend**:
   Run the command `node server.js` in the backend terminal. This will start the server and enable communication between the frontend and the backend.

2. **Start the frontend**:
   In the frontend terminal, use `npm start`. This will launch the React development server and allow the user interface to load in the browser.
