#!/usr/bin/env python3
"""
Sync Council Registry to Cloud Firestore.
Can be executed in GitHub Actions using FIREBASE_SERVICE_ACCOUNT credentials
or locally with GOOGLE_APPLICATION_CREDENTIALS / emulator.
"""

import os
import json
import argparse
import sys


def sync_registry_to_firestore(registry_path: str, dry_run: bool = False):
    if not os.path.exists(registry_path):
        print(f"Error: Registry file {registry_path} not found.")
        sys.exit(1)

    with open(registry_path, "r", encoding="utf-8") as f:
        registry = json.load(f)

    print(f"Found {len(registry)} councils to synchronize.")

    if dry_run:
        print("[DRY-RUN] Sample council record:")
        first_key = next(iter(registry))
        print(json.dumps(registry[first_key], indent=2))
        print("[DRY-RUN] Completed without writing to Firestore.")
        return

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        if not firebase_admin._apps:
            sa_key_str = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY") or os.getenv("GCP_CREDENTIALS")
            sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH") or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

            if sa_key_str and sa_key_str.strip().startswith("{"):
                try:
                    sa_dict = json.loads(sa_key_str)
                    cred = credentials.Certificate(sa_dict)
                    firebase_admin.initialize_app(cred)
                except Exception as e:
                    print(f"Warning: Could not parse service account JSON string: {e}")
                    firebase_admin.initialize_app()
            elif sa_path and os.path.exists(sa_path):
                cred = credentials.Certificate(sa_path)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()

        db = firestore.client()
        batch = db.batch()
        count = 0

        for custodian_code, data in registry.items():
            doc_ref = db.collection("councils").document(str(custodian_code))
            batch.set(doc_ref, data, merge=True)
            count += 1
            if count % 400 == 0:
                batch.commit()
                batch = db.batch()

        if count % 400 != 0:
            batch.commit()

        print(f"Successfully synchronized {count} councils to Firestore collection 'councils'.")

    except ImportError:
        print("Note: firebase-admin library not installed in this environment. Run with --dry-run or install firebase-admin.")
    except Exception as e:
        print(f"Firestore Sync Error: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Sync Council Registry to Firestore")
    parser.add_argument("--registry-file", type=str, default="automation/councils_registry.json")
    parser.add_argument("--dry-run", action="store_true", help="Perform dry run without Firestore connection")
    args = parser.parse_args()

    sync_registry_to_firestore(args.registry_file, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
