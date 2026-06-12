<div align="center">

  # ✅ Task Manager CLI (Java)

  <p align="center">
    <img src="https://img.shields.io/badge/Language-Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java Badges"/>
    <img src="https://img.shields.io/badge/JDK-8%2B-blue?style=for-the-badge" alt="JDK Version"/>
    <img src="https://img.shields.io/github/stars/pushtikadia/Task_Manager?style=for-the-badge&color=FFD700&labelColor=1E1E24" alt="Stars"/>
  </p>

  🗣️ **A robust, lightweight, and efficient command-line application featuring persistent file storage.**

  ___
</div>

## 📂 Repository Content

This project features a clean, single-file architecture built strictly for high portability and minimal overhead:

* **`TaskManager.java`:** The single source file containing the complete application layer:
  * **Task Model:** Encapsulates core task metadata properties (ID, title, description, status, timestamp).
  * **File Persistence:** Direct serialization routines (`load` / `save`) that stream data safely into a local `tasks.txt` file.
  * **CLI Interface:** An optimized, menu-driven command loop for direct terminal interaction.

---

## ✨ Key Features

> [!NOTE]
> ### 📊 Operational Design
> Engineered for simplicity and reliable tracking, avoiding heavy framework abstractions.

* **📝 CRUD Operations:** Quickly **Add** fresh tasks, **List** active allocations, and **Remove** unwanted targets.
* **✅ Status Tracking:** Effortlessly shift task states between **DONE** and **TODO** boundaries to map out your progress.
* **💾 Persistent Storage:** Automatic local I/O writing flushes variables instantly to `tasks.txt` so your state is preserved across reboots.
* **🆔 Unique Identifiers:** Leverages standard cryptographic `UUID` strings to prevent collision vulnerabilities during deletions.
* **🕒 Accurate Timestamps:** Generates real-time creation stamps the exact moment a task enters the persistent lifecycle.

---

## 🚀 Getting Started

### 📋 Prerequisites
Before launching the command-line interface, verify your system meets the minimum requirements:
* **Java Development Kit (JDK) 8** or higher installed and configured in your environment path variables.

### ⚙️ Installation & Execution

1. **Clone the Source Files:**
   ```bash
   git clone [https://github.com/pushtikadia/Task_Manager.git](https://github.com/pushtikadia/Task_Manager.git)
   cd Task_Manager
