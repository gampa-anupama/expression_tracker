# Expression Tracker for Dyslexic Children  

## 1. Overview  
This project helps therapists, educators, and game developers understand children's emotional engagement during gameplay.  
By tracking emotional responses through **facial expression analysis**, the platform provides insights to:  
- Optimize learning experiences.  
- Support children's mental well-being.  

---

## 2. Objectives  

### 2.1 Problem Addressed  
- Helps therapists and developers analyze emotional engagement.  
- Improves game design for dyslexic children.  

### 2.2 Importance  
- Provides insights into emotional states.  
- Enhances learning experiences and emotional well-being.  

---

## 3. System Design  

### 3.1 High-Level Architecture  
1. **Frontend**: React.js app capturing webcam images and displaying analysis.  
2. **Backend**: Node.js server managing file storage, API integration, and user roles.  
3. **Database**: MongoDB storing session data, images, and analysis results.  
4. **API**: HuggingFace for emotion detection.  

### 3.2 Component Descriptions  

#### 3.2.1 Frontend  
- **Framework/Library**: React.js with Bootstrap for styling.  
- **Key Components**:  
  - **Login/Registration Pages**: Role-based authentication.  
  - **Game UI**: Tracks gameplay, captures webcam images/screenshots.  
  - **Analysis Dashboard**: Displays sentiment insights and screenshots.  

#### 3.2.2 Backend  
- **Framework**: Express.js with Node.js.  
- **Routes & Middleware**:  
  - Handles image uploads and storage.  
  - Integrates with HuggingFace API.  
  - Implements role-based authentication.  

#### 3.2.3 Database  
- **Technology**: MongoDB (Atlas).  
- **Schema Design**:  

##### Sessions Collection  
```json
{
  "session_id": "string",
  "sessionName": "string",
  "imagePaths": ["array of strings"],
  "screenshotPaths": ["array of strings"],
  "modelResponse": ["array of strings"],
  "timestamps": "date"
}
```
#####Admin Collection
```json
{
  "admin_name": "string",
  "phone_number": "string",
  "admin_email": "string",
  "role": "string",
  "admin_professions": "string",
  "password": "hashed string",
  "status": "string",
  "children_accounts": ["array of strings"]
}
```
#####Games Collection
```json
{
  "gameId": "string",
  "name": "string",
  "questions": ["array of strings"]
}
```

# 4. External API  

## 4.1 HuggingFace API  
- **Purpose**: Emotion detection model.  
- **Security**: Access tokens managed via `.env` files.  

---

# 5. Technology Stack  

## 5.1 Frontend  
- React.js  
- Bootstrap  

## 5.2 Backend  
- Node.js  
- Express.js  

## 5.3 Database  
- MongoDB (Atlas)  
- Mongoose  

## 5.4 External API  
- HuggingFace Transformers  

## 5.5 Other Tools  
- Playwright (Testing)  
- GitHub (Version Control)  

---

# 6. Future Scope  

## 6.1 Personalized Analysis  
- **For Therapists**: Detailed emotional breakdowns and progress tracking.  
- **For Game Developers**: Insights for game optimization based on emotional engagement.  

## 6.2 Model Improvement  
- Fine-tune the model with **datasets tailored for dyslexic children**.  
- Add parameters like **microexpressions** and **gaze detection**.  

---

# 7. Conclusion  
This project demonstrates the **potential of AI and web development** in addressing educational and emotional challenges in dyslexic children.  

- Provides **secure and accessible data-driven insights**.  
- Enhances **emotional engagement tracking during gameplay**.  


