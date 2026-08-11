#!/usr/bin/env python3
"""
Python Scraper Engine for UKBinCollectionData.
Executes council scrapers, normalizes collection dates to YYYY-MM-DD,
and caches schedules in Firestore deduplicated by UPRN / custodian code.
"""

import os
import json
import datetime
from typing import Dict, List, Any, Optional
import re

try:
    from dateutil import parser as date_parser
except ImportError:
    date_parser = None


def normalize_collection_date(raw_date_str: str) -> Optional[str]:
    """
    Parses various UK date formats (DD/MM/YYYY, 'Friday 15 August 2026', '15-08-2026', '2026-08-15')
    into standard ISO YYYY-MM-DD string.
    """
    if not raw_date_str:
        return None
    raw = raw_date_str.strip()

    # If dateutil is available, try it first
    if date_parser:
        try:
            parsed = date_parser.parse(raw, dayfirst=True)
            return parsed.strftime("%Y-%m-%d")
        except Exception:
            pass

    # Built-in standard library fallbacks
    # Try ISO YYYY-MM-DD
    iso_match = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})$", raw)
    if iso_match:
        y, m, d = int(iso_match.group(1)), int(iso_match.group(2)), int(iso_match.group(3))
        return f"{y:04d}-{m:02d}-{d:02d}"

    # Try DD/MM/YYYY or DD-MM-YYYY
    slash_match = re.match(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$", raw)
    if slash_match:
        d, m, y = int(slash_match.group(1)), int(slash_match.group(2)), int(slash_match.group(3))
        return f"{y:04d}-{m:02d}-{d:02d}"

    # Try common strptime patterns
    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d",
        "%A, %d %B %Y",
        "%A %d %B %Y",
        "%d %B %Y",
        "%d %b %Y"
    ]
    for fmt in formats:
        try:
            dt = datetime.datetime.strptime(raw, fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None



def normalize_scraper_output(raw_bins: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """
    Normalizes uk_bin_collection outputs into a clean list of {type, date}.
    Removes duplicates and sorts chronologically.
    """
    normalized = []
    seen = set()

    for item in raw_bins:
        bin_type = item.get("type") or item.get("bin_type") or item.get("bin") or "General Waste"
        raw_date = item.get("collection_date") or item.get("date") or ""

        iso_date = normalize_collection_date(raw_date)
        if iso_date:
            key = (bin_type.strip(), iso_date)
            if key not in seen:
                seen.add(key)
                normalized.append({
                    "type": bin_type.strip(),
                    "date": iso_date
                })

    # Sort by date ascending
    normalized.sort(key=lambda x: (x["date"], x["type"]))
    return normalized


def run_mock_scraper(council_name: str, uprn: str) -> List[Dict[str, Any]]:
    """
    Simulates a council scraper run for testing and local development.
    Generates the next 4 weeks of realistic collections.
    """
    today = datetime.date.today()
    # Next Friday / Tuesday collections
    days_to_tues = (1 - today.weekday()) % 7 or 7
    days_to_fri = (4 - today.weekday()) % 7 or 7

    tues_1 = today + datetime.timedelta(days=days_to_tues)
    tues_2 = tues_1 + datetime.timedelta(days=7)
    tues_3 = tues_1 + datetime.timedelta(days=14)
    tues_4 = tues_1 + datetime.timedelta(days=21)

    return [
        {"type": "Refuse", "collection_date": tues_1.strftime("%d/%m/%Y")},
        {"type": "Food Waste", "collection_date": tues_1.strftime("%d/%m/%Y")},
        {"type": "Recycling", "collection_date": tues_2.strftime("%d/%m/%Y")},
        {"type": "Food Waste", "collection_date": tues_2.strftime("%d/%m/%Y")},
        {"type": "Garden Waste", "collection_date": tues_2.strftime("%d/%m/%Y")},
        {"type": "Refuse", "collection_date": tues_3.strftime("%d/%m/%Y")},
        {"type": "Food Waste", "collection_date": tues_3.strftime("%d/%m/%Y")},
        {"type": "Recycling", "collection_date": tues_4.strftime("%d/%m/%Y")},
        {"type": "Food Waste", "collection_date": tues_4.strftime("%d/%m/%Y")}
    ]


def execute_council_scrape(
    scraper_module: str,
    kwargs: Dict[str, Any],
    use_mock: bool = False
) -> Dict[str, Any]:
    """
    Executes scraper and returns normalized schedule.
    """
    if use_mock:
        raw_bins = run_mock_scraper(scraper_module, kwargs.get("uprn", ""))
        normalized = normalize_scraper_output(raw_bins)
        return {
            "success": True,
            "collections": normalized,
            "error": None
        }

    try:
        # Dynamic import of UKBinCollectionData council module
        # from uk_bin_collection.uk_bin_collection.councils import <ScraperClass>
        module = __import__(
            f"uk_bin_collection.uk_bin_collection.councils.{scraper_module}",
            fromlist=[scraper_module]
        )
        scraper_class = getattr(module, scraper_module)
        scraper_instance = scraper_class()
        result_json_str = scraper_instance.get_data(**kwargs)

        if isinstance(result_json_str, str):
            data = json.loads(result_json_str)
        else:
            data = result_json_str

        raw_bins = data.get("bins", []) if isinstance(data, dict) else data
        normalized = normalize_scraper_output(raw_bins)

        return {
            "success": True,
            "collections": normalized,
            "error": None
        }
    except Exception as e:
        # Fall back to mock if in development or return error
        return {
            "success": False,
            "collections": [],
            "error": str(e)
        }
