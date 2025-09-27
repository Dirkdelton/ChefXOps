# ChefXOps - Culinary Intelligence Platform by SpitfireXmedia

## Introduction

Welcome to ChefXOps! This guide provides a simple, one-time setup to run and configure the application. The process involves running a local server (for full functionality) and configuring your API keys through the application's user-friendly settings panel.

---

## Part 1: First-Time Setup - Running the Application

This process starts a local web server, which is required for the application's AI and Map features to function correctly.

### For Windows:

1.  **Open Command Prompt**:
    *   Click the **Start Menu**, type `cmd`, and select **"Command Prompt"**.

2.  **Navigate to the `ChefXOps` Folder**:
    *   In the Command Prompt, type `cd ` (note the space).
    *   **Drag and drop the `ChefXOps` folder** from your desktop into the window. The path will appear.
    *   Press **Enter**.

3.  **Start the Server**:
    *   Type `python -m http.server 8887` and press **Enter**.
    *   *Note: If you get an error, install Python from [python.org](https://www.python.org/downloads/), ensuring "Add Python to PATH" is checked during installation.*

4.  **Launch the App**:
    *   Open **Google Chrome**.
    *   In the address bar, go to `http://127.0.0.1:8887`.

### For Mac:

1.  **Open Terminal**:
    *   Go to "Applications" > "Utilities" and open **"Terminal"**.

2.  **Navigate to the `ChefXOps` Folder**:
    *   In Terminal, type `cd ` (note the space).
    *   **Drag and drop the `ChefXOps` folder** from your desktop into the window.
    *   Press **Enter**.

3.  **Start the Server**:
    *   Type `python3 -m http.server 8887` and press **Enter**.

4.  **Launch the App**:
    *   Open **Google Chrome**.
    *   In the address bar, go to `http://127.0.0.1:8887`.

---

## Part 2: Initial Configuration (CRITICAL)

Once the application is running, you must configure it with your Google Cloud API keys.

1.  **Go to Settings**:
    *   You will see a warning banner at the top prompting you for an API Key.
    *   Click the **Settings** icon (the gear) in the bottom-left sidebar.

2.  **Enter API Credentials**:
    *   In the "API Configuration" section, paste your **Google Cloud API Key** into the first field.
    *   Paste your **Google Maps Map ID** into the second field.

3.  **Save and Refresh**:
    *   Click the **"Save All Settings"** button.
    *   **Refresh your browser tab.** The warning banner will disappear, and all AI and Map features will be fully functional.

---

## Part 3: Personalization

Make the application your own by updating your business and personal details.

1.  **Go to My Profile**:
    *   Click on your name and business name at the bottom of the sidebar.
2.  **Update Your Information**:
    *   Fill in your name, business name, and a URL for your profile picture.
    *   Click **"Save Changes"**. Your details will now appear throughout the app.

---

## Part 4: Enabling Remote Updates (Optional)

This allows the application to be updated remotely by an administrator without sending you new files.

1.  **Go to Settings**: Navigate to the "Settings" page.
2.  **Find Remote Updates Section**: Scroll down to "Remote Application Updates".
3.  **Enter Update URL**: Paste the URL provided by your administrator (e.g., a link to a new `app.js` file).
4.  **Save and Restart**: Click **"Save All Settings"** and completely restart the application. It will now load from the new URL. To revert to the original version, simply clear this field and save again.
