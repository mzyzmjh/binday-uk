# **Unified CI/CD Pipeline: Agent & Scraper Deployment**

This document outlines the unified deployment pipeline. To ensure the frontend's requirements registry and the backend's scraper execution engine are never out of sync, we use a single GitHub Actions workflow as the orchestrator.

## **1\. The Desynchronisation Problem (Solved)**

If the open-source repository updates a council scraper, two things must happen simultaneously:

1. **The Database Update:** The app needs to know if the required arguments (e.g., UPRN vs Postcode) have changed.  
2. **The Code Deployment:** The Cloud Function must be rebuilt so it contains the new scraping logic.

If 1 happens without 2, the frontend collects the right data, but the backend crashes trying to process it.

## **2\. The Unified Pipeline Logic**

Instead of separate automated tasks, we rely on a strict, sequential pipeline triggered whenever new code is merged into the main branch of your repository fork.

## **3\. Updated GitHub Actions Workflow**

This is the updated YAML file (.github/workflows/deploy.yml) that Antigravity will need to implement. It handles both the Agent parsing and the Google Cloud deployment in one seamless run.

name: Unified Deploy \- Agent & Scraper

on:  
  push:  
    branches:  
      \- main  
  workflow\_dispatch: \# Allows manual triggering

jobs:  
  update-and-deploy:  
    runs-on: ubuntu-latest  
    steps:  
      \# Step 1: Get the latest code  
      \- name: Checkout Code  
        uses: actions/checkout@v4

      \# Step 2: Setup Python for the Agent  
      \- name: Set up Python  
        uses: actions/setup-python@v5  
        with:  
          python-version: '3.10'

      \# Step 3: Run the AST Parser (Updates Firestore Registry)  
      \- name: Run Configuration Agent  
        env:  
          FIREBASE\_SERVICE\_ACCOUNT\_KEY: ${{ secrets.FIREBASE\_SERVICE\_ACCOUNT\_KEY }}  
        run: |  
          pip install firebase-admin  
          python update\_registry.py

      \# Step 4: Authenticate with Google Cloud  
      \- name: Authenticate to Google Cloud  
        uses: google-github-actions/auth@v2  
        with:  
          credentials\_json: ${{ secrets.GCP\_CREDENTIALS }}

      \# Step 5: Redeploy the Worker Cloud Function  
      \# This forces Google to rebuild the environment and fetch the latest code  
      \- name: Deploy Scraper Worker to Cloud Functions  
        uses: google-github-actions/deploy-cloud-functions@v2  
        with:  
          name: execute-scraper-worker  
          runtime: python310  
          entry\_point: process\_pubsub\_message  
          source\_dir: ./backend/worker  
          trigger\_topic: scrape\_jobs  
          max\_instances: 5

## **4\. Operational Benefits**

* **Zero Downtime:** Google Cloud Functions handles "blue/green" deployments automatically. The old version of the scraper stays alive until the new container is fully built and ready, meaning users experience no interruption.  
* **Single Source of Truth:** Your GitHub repository main branch is now the absolute controller of both your frontend logic and your backend execution.  
* **Completely Hands-Off:** Once configured, if a contributor to UKBinCollectionData fixes a broken scraper for Leeds City Council, you simply click "Sync Fork" in GitHub, and this pipeline automatically updates your database and deploys the patched code to your servers in about 3 minutes.