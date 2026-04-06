# Pneumonia Detection System

An AI-powered web application for detecting pneumonia from chest X-ray images using deep learning. The system utilizes an ensemble of CNN models to provide accurate predictions with confidence scores.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Django](https://img.shields.io/badge/Django-5.2-green)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.16-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Overview

This project is a complete end-to-end solution for pneumonia detection that includes:

- **Web Interface**: Built with Django for uploading X-ray images and viewing results
- **Deep Learning Models**: Ensemble of 4 CNN architectures (Custom CNN, VGG-Style, ResNet-Style, DenseNet-Style)
- **Patient Management**: Full CRUD operations for patient records with search and filtering
- **User Authentication**: Secure login system with user profiles
- **Prediction History**: Track and manage all previous diagnoses

The ensemble approach combines predictions from multiple models weighted by their accuracy to provide robust and reliable results.

---

## Features

- **Upload chest X-ray images** for instant pneumonia detection
- **Ensemble prediction** using 4 deep learning models
- **Patient management** with personal details and medical history
- **Searchable patient database** with sorting and filtering
- **Confidence scores** for each prediction
- **Individual model results** comparison
- **User authentication** with profile management
- **Responsive web interface**
- **Mobile-friendly design**

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Django 5.2 |
| **Deep Learning** | TensorFlow/Keras 2.16 |
| **Image Processing** | OpenCV |
| **Database** | SQLite (local) / PostgreSQL (production) |
| **Frontend** | HTML, CSS, JavaScript |
| **Deployment** | Render |
| **WSGI** | Gunicorn |

---

## Model Architecture

The system uses an ensemble of the following models:

| Model | Architecture | Accuracy |
|-------|-------------|----------|
| Custom CNN | 4-block CNN with batch normalization | 90% |
| VGG Style | VGG-like deep convolutional network | 92% |
| ResNet Style | Residual connections with skip connections | 94% |
| DenseNet Style | Dense connections with feature reuse | 95% |

**Ensemble Method**: Weighted average based on individual model accuracies

**Preprocessing**:
- CLAHE (Contrast Limited Adaptive Histogram Equalization)
- Image resizing to 224x224
- Normalization to [0, 1] range

---

## Dataset

The models are trained on the [Chest X-Ray Images (Pneumonia) dataset](https://www.kaggle.com/paultimothymooney/chest-xray-pneumonia) from Kaggle:

- **Training Set**: ~5,000 images
- **Validation Set**: 15% split from training data
- **Test Set**: ~600 images
- **Classes**: Normal, Pneumonia (Bacterial/Viral)

---

## Installation

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Git

### Windows Installation

```powershell
# Clone the repository
git clone https://github.com/yourusername/pneumonia-detection.git
cd pneumonia-detection

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Linux Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pneumonia-detection.git
cd pneumonia-detection

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

---

## Usage

### 1. Access the Application

Open your browser and navigate to: `http://127.0.0.1:8000`

### 2. First Time Setup

- Create a new account or login
- The pre-trained models will load automatically on first prediction

### 3. Making Predictions

1. Navigate to **Predict** page
2. Fill in patient details (first name, last name, date of birth, phone number)
3. Upload a chest X-ray image (JPEG/PNG)
4. Click **Submit** to get the prediction
5. View results showing:
   - Prediction (Normal/Pneumonia)
   - Confidence score
   - Individual model predictions

### 4. Patient Management

- **Dashboard**: View statistics and recent patients
- **Patient List**: View all patients with search and filter options
- **Edit Patient**: Update patient information
- **Delete Patient**: Remove patient records

### 5. Phone Number Format

Phone numbers must be in Algerian format: `+213XXXXXXXXX` (starts with 5, 6, or 7)

---

## Project Structure

```
pneumonia-detection/
├── detector/                  # Main Django app
│   ├── migrations/            # Database migrations
│   ├── models.py              # Patient & UserProfile models
│   ├── views.py               # Application views
│   ├── utils.py               # ML prediction utilities
│   └── templates/             # HTML templates
├── pneumonia_project/         # Django project settings
│   ├── settings.py            # Project configuration
│   ├── urls.py                # URL routing
│   └── wsgi.py                # WSGI configuration
├── Models/                    # Pre-trained Keras models
│   ├── custom_cnn.keras
│   ├── vgg_style.keras
│   ├── resnet_style.keras
│   └── densenet_style.keras
├── chest_xray/                # Training dataset
├── static/                    # Static files (CSS, JS)
├── media/                     # Uploaded images
├── notebook_code.py           # Model training script
├── requirements.txt           # Python dependencies
├── manage.py                  # Django management
└── README.md                  # This file
```

---

## Training the Models

To retrain the models with your own dataset:

```bash
# Install Jupyter (if not already installed)
pip install jupyter

# Launch Jupyter notebook
jupyter notebook pneumonia_detection_enhanced.ipynb

# Or run the Python script directly
python notebook_code.py
```

**Note**: Training requires a GPU for faster processing. The script will automatically use GPU if available.

---

## Deployment

### Deploy to Render (Production)

This project includes a `render.yaml` configuration file for easy deployment to Render:

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` configuration
5. Deploy!

Environment variables are automatically configured:
- `DATABASE_URL`: PostgreSQL connection
- `SECRET_KEY`: Auto-generated
- `DEBUG`: Set to False
- `ALLOWED_HOSTS`: Render domain

### Environment Variables

Create a `.env` file for local development:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

---

## API Endpoints

| URL | View | Description |
|-----|------|-------------|
| `/` | Dashboard | Statistics and overview |
| `/predict/` | Predict | Upload X-ray and get prediction |
| `/result/<id>/` | Result | View prediction result |
| `/patients/` | Patient List | Manage all patients |
| `/patients/<id>/edit/` | Edit Patient | Update patient info |
| `/patients/<id>/delete/` | Delete Patient | Remove patient |
| `/profile/` | Profile | User profile view |
| `/account-settings/` | Account Settings | Edit profile & password |
| `/login/` | Login | User authentication |
| `/logout/` | Logout | End session |

---

## Screenshots

*Dashboard with statistics and recent patients*

*Prediction page with patient form and image upload*

*Results showing ensemble prediction and individual model outputs*

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Dataset: [Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/paultimothymooney/chest-xray-pneumonia) by Paul Mooney
- Built with [Django](https://www.djangoproject.com/) and [TensorFlow](https://www.tensorflow.org/)
- Icons and UI inspired by modern healthcare applications

---

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Disclaimer**: This application is for educational and research purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions regarding medical conditions.
