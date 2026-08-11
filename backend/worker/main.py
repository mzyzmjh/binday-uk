#!/usr/bin/env python3
"""
Python Scraper Worker for Google Cloud Functions.
Entry point: process_pubsub_message(event, context)
Trigger topic: scrape_jobs
"""

import base64
import json
import os
import datetime
from typing import Dict, Any
from scraper_runner import execute_council_scrape


def process_pubsub_message(event: Dict[str, Any], context: Any):
    """
    Cloud Function Pub/Sub entrypoint.
    Decodes incoming scrape job payload and updates Firestore.
    """
    try:
        if "data" in event:
            payload_str = base64.b64decode(event["data"]).decode("utf-8")
            job_data = json.loads(payload_str)
        else:
            job_data = event

        print(f"Processing scrape job: {job_data}")
        process_single_scrape_job(job_data)

    except Exception as e:
        print(f"Error processing pubsub message: {e}")
        raise e


def process_single_scrape_job(job_data: Dict[str, Any]):
    custodian_code = job_data.get("custodianCode", "")
    uprn = job_data.get("uprn", "")
    postcode = job_data.get("postcode", "")
    proprietary_id = job_data.get("proprietaryId")
    schedule_key = job_data.get("scheduleKey") or f"{custodian_code}_{proprietary_id or uprn}"

    now = datetime.datetime.now(datetime.timezone.utc)
    next_due_str = (now + datetime.timedelta(days=7)).strftime("%Y-%m-%d")

    # Scraper kwargs
    kwargs = {"uprn": uprn, "postcode": postcode}
    if proprietary_id:
        kwargs["web_id"] = proprietary_id

    # Fallback/dynamic module resolution
    scraper_module = job_data.get("scraperModule", "LeedsCityCouncil")

    # Execute real council scraper
    result = execute_council_scrape(scraper_module, kwargs, use_mock=False)

    try:
        import firebase_admin
        from firebase_admin import firestore

        if not firebase_admin._apps:
            firebase_admin.initialize_app()

        db = firestore.client()
        doc_ref = db.collection("schedules").document(schedule_key)

        if result["success"] and result["collections"]:
            doc_ref.set({
                "scheduleKey": schedule_key,
                "custodianCode": str(custodian_code),
                "uprn": str(uprn),
                "postcode": str(postcode),
                "collections": result["collections"],
                "lastScrapedAt": now.isoformat(),
                "nextScrapeDue": next_due_str,
                "errorCount": 0,
                "lastErrorMessage": None
            }, merge=True)
            print(f"Successfully cached {len(result['collections'])} collections for {schedule_key} in Firestore.")
        else:
            doc_ref.set({
                "scheduleKey": schedule_key,
                "lastScrapedAt": now.isoformat(),
                "errorCount": firestore.Increment(1),
                "lastErrorMessage": result.get("error", "Unknown scrape failure")
            }, merge=True)
            print(f"Recorded scrape failure for {schedule_key}: {result.get('error')}")

    except ImportError:
        print(f"[Standalone/Local] Scraped {len(result.get('collections', []))} collections successfully.")
    except Exception as e:
        print(f"Firestore update error: {e}")


def batch_scheduled_scraper():
    """Batch refresh worker iterating over schedules due for 7-day refresh."""
    now = datetime.datetime.now(datetime.timezone.utc)
    today_str = now.strftime("%Y-%m-%d")

    try:
        import firebase_admin
        from firebase_admin import firestore

        if not firebase_admin._apps:
            firebase_admin.initialize_app()

        db = firestore.client()
        query = db.collection("schedules").where("nextScrapeDue", "<=", today_str).limit(100)
        docs = query.get()

        print(f"Found {len(docs)} schedules due for refresh.")
        for doc in docs:
            process_single_scrape_job(doc.to_dict())

    except Exception as e:
        print(f"Batch refresh error: {e}")


if __name__ == "__main__":
    batch_scheduled_scraper()
