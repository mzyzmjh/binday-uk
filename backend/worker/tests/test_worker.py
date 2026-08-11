import unittest
import base64
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import process_pubsub_message
from scraper_runner import normalize_collection_date, normalize_scraper_output, execute_council_scrape


class TestWorker(unittest.TestCase):

    def test_process_pubsub_message(self):
        job_data = {
            "custodianCode": "4720",
            "uprn": "100051234501",
            "postcode": "LS26 8XX",
            "scraperModule": "LeedsCityCouncil"
        }
        encoded = base64.b64encode(json.dumps(job_data).encode("utf-8")).decode("utf-8")
        event = {"data": encoded}
        
        # Should execute without raising exception
        process_pubsub_message(event, None)

    def test_date_normalization(self):
        self.assertEqual(normalize_collection_date("15/08/2026"), "2026-08-15")
        self.assertEqual(normalize_collection_date("2026-08-15"), "2026-08-15")

    def test_execute_scrape(self):
        res = execute_council_scrape("LeedsCityCouncil", {"uprn": "100051234501"}, use_mock=True)
        self.assertTrue(res["success"])
        self.assertGreater(len(res["collections"]), 0)


if __name__ == "__main__":
    unittest.main()
