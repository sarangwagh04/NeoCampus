"""
Management command to seed teaching plans with 20 lectures per subject assignment.
Each subject gets realistic, curriculum-relevant topics.

Usage:
    python manage.py seed_teaching_plans
    python manage.py seed_teaching_plans --clear   # Clear existing plans first
"""

from django.core.management.base import BaseCommand
from datetime import date, timedelta
from attendance.models import SubjectAssignment, TeachingPlan


# ===================================================================
# SUBJECT-SPECIFIC LECTURE TOPICS (20 per subject)
# ===================================================================

TOPICS = {
    # ---- Information & Cyber Security (IS01) ----
    "IS01": [
        "Introduction to Information Security – CIA Triad",
        "Threats, Vulnerabilities, and Attack Vectors",
        "Cryptography Basics – Symmetric Encryption (AES, DES)",
        "Asymmetric Encryption – RSA, Diffie-Hellman Key Exchange",
        "Hash Functions – SHA, MD5, and Digital Signatures",
        "Public Key Infrastructure (PKI) and Certificates",
        "Network Security – Firewalls and Intrusion Detection Systems",
        "Web Application Security – OWASP Top 10",
        "SQL Injection and Cross-Site Scripting (XSS) Attacks",
        "Authentication Mechanisms – MFA, OAuth, JWT",
        "Access Control Models – RBAC, ABAC, MAC, DAC",
        "Malware Analysis – Viruses, Worms, Trojans, Ransomware",
        "Social Engineering and Phishing Attacks",
        "Security Auditing and Penetration Testing",
        "Wireless Network Security – WPA2, WPA3",
        "Cloud Security – Shared Responsibility Model",
        "Incident Response and Disaster Recovery Planning",
        "Cyber Laws – IT Act 2000, GDPR Compliance",
        "Blockchain Security and Zero Trust Architecture",
        "Capstone: Case Study on Major Cyber Attacks",
    ],

    # ---- Generative AI (GA01) ----
    "GA01": [
        "Introduction to Generative AI – History and Evolution",
        "Machine Learning Recap – Supervised vs Unsupervised Learning",
        "Deep Learning Foundations – Neural Networks and Backpropagation",
        "Convolutional Neural Networks (CNNs) for Image Generation",
        "Recurrent Neural Networks (RNNs) and Sequence Modeling",
        "Autoencoders – Architecture and Applications",
        "Variational Autoencoders (VAEs) – Latent Space Representation",
        "Introduction to GANs – Generator and Discriminator",
        "Training GANs – Loss Functions and Mode Collapse",
        "Advanced GANs – DCGAN, StyleGAN, CycleGAN",
        "Transformer Architecture – Attention Is All You Need",
        "Large Language Models (LLMs) – GPT, BERT, T5",
        "Prompt Engineering and Few-Shot Learning",
        "Fine-Tuning and Transfer Learning for LLMs",
        "Diffusion Models – DALL-E, Stable Diffusion, Midjourney",
        "Text-to-Image and Image-to-Image Generation",
        "Ethical Considerations – Bias, Deepfakes, Hallucinations",
        "Retrieval-Augmented Generation (RAG) Pipelines",
        "Deploying Generative AI Models – APIs, Edge, and Cloud",
        "Capstone: Building an End-to-End Gen AI Application",
    ],

    # ---- Data Visualization (DV01) ----
    "DV01": [
        "Introduction to Data Visualization – Importance and Principles",
        "Types of Data – Categorical, Numerical, Temporal, Geospatial",
        "Visual Perception – Gestalt Principles and Preattentive Attributes",
        "Chart Selection – Bar, Line, Pie, Scatter, and When to Use Each",
        "Matplotlib Fundamentals – Figures, Axes, and Subplots",
        "Advanced Matplotlib – Annotations, Styles, and Customization",
        "Seaborn – Statistical Visualizations and Themes",
        "Plotly – Interactive Charts and Dashboards",
        "Data Cleaning and Preparation for Visualization",
        "Exploratory Data Analysis (EDA) with Pandas Profiling",
        "Time Series Visualization – Trends, Seasonality, Anomalies",
        "Geospatial Data Visualization – Folium, GeoPandas",
        "Network and Graph Visualization – NetworkX",
        "Dashboard Design Principles – Layout and Storytelling",
        "Building Dashboards with Streamlit",
        "Building Dashboards with Power BI / Tableau (Overview)",
        "Color Theory – Colormaps, Accessibility, Colorblind-Safe Palettes",
        "Visualizing Machine Learning Results – Confusion Matrix, ROC",
        "Real-Time Data Visualization – WebSockets and Live Charts",
        "Capstone: End-to-End Data Storytelling Project",
    ],

    # ---- DevOps (DO01) ----
    "DO01": [
        "Introduction to DevOps – Culture, Practices, and Tools",
        "Version Control Deep Dive – Git Branching Strategies",
        "Linux Fundamentals for DevOps Engineers",
        "Shell Scripting – Bash Automation",
        "Containerization with Docker – Images, Containers, Volumes",
        "Docker Compose – Multi-Container Applications",
        "Continuous Integration (CI) – Concepts and Pipeline Design",
        "CI with GitHub Actions – Workflows and Runners",
        "Continuous Delivery vs Continuous Deployment (CD)",
        "Infrastructure as Code (IaC) – Terraform Basics",
        "Configuration Management – Ansible Playbooks",
        "Container Orchestration – Kubernetes Architecture",
        "Kubernetes – Pods, Services, Deployments, ConfigMaps",
        "Kubernetes – Helm Charts and Package Management",
        "Cloud Platforms Overview – AWS, GCP, Azure",
        "Cloud Deployment – EC2, S3, RDS, and Load Balancers",
        "Monitoring and Logging – Prometheus, Grafana, ELK Stack",
        "Security in DevOps (DevSecOps) – SAST, DAST, SCA",
        "Microservices Architecture and Service Mesh (Istio)",
        "Capstone: Full CI/CD Pipeline for a Microservice Application",
    ],

    # ---- Project (PJ01) ----
    "PJ01": [
        "Introduction to Project Development – Lifecycle and Methodologies",
        "Problem Statement Definition and Literature Survey",
        "Requirement Gathering – Functional and Non-Functional Requirements",
        "Feasibility Study – Technical, Economic, Operational",
        "System Analysis – Use Case Diagrams and Activity Diagrams",
        "System Design – Architecture and Component Diagrams",
        "Database Design – ER Diagrams and Schema Normalization",
        "UI/UX Design – Wireframes and Prototyping (Figma)",
        "Frontend Development – Setting Up the Client Application",
        "Backend Development – API Design and REST Conventions",
        "Database Integration – ORM Setup and Migrations",
        "Authentication and Authorization Implementation",
        "Core Feature Implementation – Module 1",
        "Core Feature Implementation – Module 2",
        "Testing – Unit Tests, Integration Tests, and Test Coverage",
        "Deployment – Hosting, Domain, and SSL Configuration",
        "Performance Optimization and Code Review",
        "Documentation – README, API Docs, User Manual",
        "Project Presentation and Demo Preparation",
        "Final Review, Viva, and Project Submission",
    ],

    # ---- Lab Practice (LP01) ----
    "LP01": [
        "Lab 1: Setting Up Development Environment (IDE, Git, Python/JS)",
        "Lab 2: Linux Command Line and Shell Scripting Basics",
        "Lab 3: Data Structures Implementation – Linked Lists and Stacks",
        "Lab 4: Data Structures Implementation – Trees and Graphs",
        "Lab 5: SQL Queries – Joins, Subqueries, and Aggregations",
        "Lab 6: NoSQL Database Operations – MongoDB CRUD",
        "Lab 7: REST API Development with Django REST Framework",
        "Lab 8: REST API Development with Express.js / FastAPI",
        "Lab 9: Frontend Development – React.js Component Architecture",
        "Lab 10: State Management – Context API and Redux",
        "Lab 11: Docker – Containerizing a Full-Stack Application",
        "Lab 12: CI/CD Pipeline Setup with GitHub Actions",
        "Lab 13: Machine Learning – Data Preprocessing with Pandas/NumPy",
        "Lab 14: Machine Learning – Model Training and Evaluation (Scikit-learn)",
        "Lab 15: Deep Learning – Building a CNN with TensorFlow/PyTorch",
        "Lab 16: Cloud Deployment – Deploying to AWS / Render / Vercel",
        "Lab 17: Testing – Writing Unit and Integration Tests (pytest / Jest)",
        "Lab 18: Security Lab – Vulnerability Scanning and Hardening",
        "Lab 19: Performance Benchmarking and Profiling",
        "Lab 20: Mini-Project Integration and Final Lab Viva",
    ],

    # ---- IoT (iot001) ----
    "iot001": [
        "Introduction to IoT – Concepts, Architecture, and Applications",
        "IoT Ecosystem – Sensors, Actuators, and Embedded Systems",
        "Microcontrollers – Arduino and ESP32 Overview",
        "IoT Communication Protocols – MQTT, CoAP, HTTP",
        "Wireless Technologies – Bluetooth, Zigbee, LoRa, Wi-Fi",
        "IoT Cloud Platforms – AWS IoT, Azure IoT Hub, ThingSpeak",
        "Sensor Interfacing – Temperature, Humidity, Motion, Light",
        "Actuator Control – Relays, Motors, and Servo Mechanisms",
        "IoT Data Acquisition and Edge Computing",
        "IoT Gateway Design and Protocol Translation",
        "Data Analytics for IoT – Time-Series Analysis",
        "IoT Dashboard Development – Node-RED, Grafana",
        "IoT Security – Threats, Encryption, Secure Boot",
        "Smart Home Automation – Design and Implementation",
        "Industrial IoT (IIoT) – SCADA, PLC, and Industry 4.0",
        "Wearable IoT – Health Monitoring Systems",
        "IoT in Agriculture – Precision Farming and Smart Irrigation",
        "IoT and Machine Learning – Predictive Maintenance",
        "IoT Standards and Regulatory Frameworks",
        "Capstone: End-to-End IoT System Design and Prototype",
    ],
}


class Command(BaseCommand):
    help = "Seed teaching plans with 20 lectures per subject assignment"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear all existing teaching plans before seeding",
        )
        parser.add_argument(
            "--start-date",
            type=str,
            default="2026-07-01",
            help="Start date for lectures (YYYY-MM-DD format, default: 2026-07-01)",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted_count, _ = TeachingPlan.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f"[CLEARED] Cleared {deleted_count} existing teaching plan(s)")
            )

        start_date = date.fromisoformat(options["start_date"])
        assignments = SubjectAssignment.objects.select_related("subject", "staff").all()

        if not assignments.exists():
            self.stdout.write(self.style.ERROR("[ERROR] No subject assignments found!"))
            return

        total_created = 0

        for assignment in assignments:
            subject_code = assignment.subject.code
            topics = TOPICS.get(subject_code)

            if not topics:
                self.stdout.write(
                    self.style.WARNING(
                        f"[WARN] No topics defined for {subject_code} - skipping"
                    )
                )
                continue

            # Skip if teaching plan already exists for this assignment
            existing = TeachingPlan.objects.filter(assignment=assignment).count()
            if existing >= 20:
                self.stdout.write(
                    self.style.NOTICE(
                        f"[SKIP] {subject_code} (Batch {assignment.batch_id}) already has {existing} lectures - skipping"
                    )
                )
                continue

            # Clear partial plans for this assignment
            if existing > 0:
                TeachingPlan.objects.filter(assignment=assignment).delete()
                self.stdout.write(
                    self.style.WARNING(
                        f"[CLEARED] Cleared {existing} partial lecture(s) for {subject_code}"
                    )
                )

            # Generate lecture dates (skip weekends)
            lecture_date = start_date
            plans_to_create = []

            for i, topic in enumerate(topics[:20], start=1):
                # Skip Saturday (5) and Sunday (6)
                while lecture_date.weekday() >= 5:
                    lecture_date += timedelta(days=1)

                plans_to_create.append(
                    TeachingPlan(
                        assignment=assignment,
                        lecture_number=i,
                        topic=topic,
                        lecture_date=lecture_date,
                    )
                )

                # Move to next weekday (space lectures ~2-3 days apart)
                lecture_date += timedelta(days=2)

            TeachingPlan.objects.bulk_create(plans_to_create)
            created_count = len(plans_to_create)
            total_created += created_count

            self.stdout.write(
                self.style.SUCCESS(
                    f"[OK] {subject_code} ({assignment.subject.name}) "
                    f"-> {created_count} lectures created "
                    f"[Batch: {assignment.batch_id}, Sem: {assignment.semester}, "
                    f"Staff: {assignment.staff.first_name} {assignment.staff.last_name}]"
                )
            )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"[DONE] Total teaching plan lectures created: {total_created}"
            )
        )
