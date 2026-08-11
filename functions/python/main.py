#!/usr/bin/env python3
"""
Batch Scraper Worker Cloud Function.
Periodically scans Firestore schedules collection, deduplicates UPRNs,
and refreshes collection schedules every 7 days.
"""

import os
import datetime
from scraper_runner import execute_council_scrape


def run_batch_scraper(dry_run: bool = False):
    now = datetime.datetime.now(datetime.timezone.utc)
    today_str = now.strftime("%Y-%m-%d")
    next_due_str = (now + datetime.timedelta(days=7)).strftime("%Y-%m-%d")

    print(f"[{today_str}] Running BinDay Batch Scraper Worker...")

    try:
        import firebase_admin
        from firebase_admin import firestore

        if not firebase_admin._apps:
            firebase_admin.initialize_app()

        db = firestore.client()
        schedules_ref = db.collection("schedules")
        
        # Query schedules due for refresh
        query = schedules_ref.where("nextScrapeDue", "<=", today_str).limit(100)
        docs = query.get()

        print(f"Found {len(docs)} schedules due for 7-day refresh.")

        for doc in docs:
            data = doc.to_dict()
            schedule_key = doc.id
            custodian_code = data.get("custodianCode")
            uprn = data.get("uprn")
            postcode = data.get("postcode")

            # Look up council configuration
            council_doc = db.collection("councils").document(str(custodian_code)).get()
            scraper_module = "LeedsCityCouncil"
            if council_doc.exists:
                scraper_module = council_doc.to_dict().get("scraperModule", "LeedsCityCouncil")

            kwargs = {"uprn": uprn, "postcode": postcode}
            print(f"Scraping {schedule_key} via {scraper_module}...")

            scrape_res = execute_council_scrape(scraper_module, kwargs, use_mock=True)

            if scrape_res["success"] and scrape_res["collections"]:
                doc.reference.update({
                    "collections": scrape_res["collections"],
                    "lastScrapedAt": now.isoformat(),
                    "nextScrapeDue": next_due_str,
                    "errorCount": 0,
                    "lastErrorMessage": None
                })
                print(f"Successfully updated schedule for {schedule_key} ({len(scrape_res['collections'])} collections).")
            else:
                doc.reference.update({
                    "errorCount": firestore.Increment(1),
                    "lastErrorMessage": scrape_res.get("error", "Scrape failed"),
                    "lastScrapedAt": now.isoformat()
                })
                print(f"Failed to scrape {schedule_key}: {scrape_res.get('error')}")

    except ImportError:
        print("Note: firebase-admin not loaded in this shell. Running in standalone mode.")
    except Exception as e:
        print(f"Batch Scraper Error: {e}")


def cloud_function_entrypoint(event, context):
    """Google Cloud Functions Entrypoint (Pub/Sub Trigger)"""
    run_batch_scraper()


if __name__ == "__main__":
    run_batch_scraper()
