<div align="center">

  # ✅ Task Manager CLI (Java)

  <p align="center">
    <img src="https://img.shields.io/badge/Language-Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java Badges"/>
    <img src="https://img.shields.io/badge/JDK-8%2B-blue?style=for-the-badge" alt="JDK Version"/>

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
* **💾 Persistent Storage:** Automatically saves all data to `tasks.txt` so your list is restored next time you run the app.
* **🆔 Unique IDs:** Uses `UUID` to ensure every task has a unique identifier for safe deletion and updates.
* **🕒 Timestamps:** Records the exact creation date and time for every task.

---

## 🚀 Getting Started

### Prerequisites
* Java Development Kit (JDK) 8 or higher installed.

### Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/pushtikadia/Task_Manager.git](https://github.com/pushtikadia/Task_Manager.git)
