#!/usr/bin/env python3
"""
Root script executed by .github/workflows/deploy.yml
Orchestrates AST parsing of scraper modules and synchronizes the CouncilConfiguration
registry directly to Cloud Firestore.
"""

import os
import sys
import json
import argparse

# Add automation directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "automation")))

from ast_parser import build_full_council_registry, parse_councils_directory
from sync_to_firestore import sync_registry_to_firestore


def run_pipeline_update(
    councils_dir: str = "",
    mapping_file: str = "automation/council_mapping.json",
    output_registry: str = "automation/councils_registry.json",
    dry_run: bool = False
):
    print("=== Step 1: Running AST Scraper Parser ===")
    parsed_ast = {}
    if councils_dir and os.path.isdir(councils_dir):
        print(f"Parsing council scraper files in: {councils_dir}")
        parsed_ast = parse_councils_directory(councils_dir)

    registry = build_full_council_registry(mapping_file, parsed_ast)
    
    os.makedirs(os.path.dirname(output_registry), exist_ok=True)
    with open(output_registry, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)
    print(f"Generated registry with {len(registry)} councils -> {output_registry}")

    print("\n=== Step 2: Synchronizing Registry to Firestore ===")
    sync_registry_to_firestore(output_registry, dry_run=dry_run)
    print("=== Configuration Agent Step Complete ===")


def main():
    parser = argparse.ArgumentParser(description="Update Firestore Council Registry from Scraper AST")
    parser.add_argument("--councils-dir", type=str, default="", help="Path to council scrapers directory")
    parser.add_argument("--mapping-file", type=str, default="automation/council_mapping.json", help="Path to mapping JSON")
    parser.add_argument("--output", type=str, default="automation/councils_registry.json", help="Output JSON path")
    parser.add_argument("--dry-run", action="store_true", help="Perform dry run without Firestore connection")
    args = parser.parse_args()

    councils_dir = args.councils_dir
    if not councils_dir:
        candidates = [
            "uk_bin_collection/uk_bin_collection/councils",
            "uk_bin_collection/councils",
            "councils"
        ]
        for candidate in candidates:
            if os.path.isdir(candidate):
                councils_dir = candidate
                break

    dry_run_flag = args.dry_run or (not os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY") and not os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH"))

    run_pipeline_update(
        councils_dir=councils_dir,
        mapping_file=args.mapping_file,
        output_registry=args.output,
        dry_run=dry_run_flag
    )


if __name__ == "__main__":
    main()
